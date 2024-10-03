import * as db from '../db/communityQueries.js'
import passport from 'passport';
import sendVerificationEmail from './emailTemplate.js';
import crypto from 'crypto';
const generateVerificationToken = (bytes = 32) => crypto.randomBytes(bytes).toString('hex')
import bcrypt from 'bcrypt';
const saltRounds = 10;


function ensureAuthenticated(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
    console.log('Unauthorized user');
    res.redirect('/community/login');
}


async function ensureVerifiedUser(req, user){
    
    if(!user.verified){
        
        console.log('User not verified');
        
        let verificationToken;
        try{
            
            verificationToken = await createVerificationToken(user);
            const userLoggedIn = await loginUser(req, user);
            
            if(verificationToken){
                const verificationLink = `${req.protocol}://${req.get('host')}/community/verification/${verificationToken}`;
                console.log(verificationLink);
                try{
                    console.log('Sending email');
                    const emailResult = await sendVerificationEmail(user,verificationLink);
                    return false;
                }catch(error){
                    console.log("Error sending email: ", error);
                    throw error;
                }
            }

        }catch(error){
            console.log('Error on the verification flow: ', error);
            if(verificationToken){
                try{
                    console.log('Removing token');
                    await db.removeVerificationToken(user.id);
                }catch(error){
                    console.log('Error removing token: ', error);
                    throw error;
                }
            }
            throw error;
        }

    }else{
        try{
            await db.removeVerificationToken(user.id);
            console.log('User is verified');
            return true;
        }catch(error){
            console.log('Error removing token: ', error);
            throw error;
        }
    }

}

async function createVerificationToken(user){
    
        
    //Create email verification token
    const verificationToken = generateVerificationToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate()+1);//One day validity

    //Store token
    try{
        //Remove old token
        await db.removeVerificationToken(user.id)
        const storedToken = await db.storeVerificationToken(user.id,verificationToken,expiresAt);
        return storedToken.token;

    }catch(error){
        console.log('Error storing token: ', error);
        throw error;
    }

}

async function loginUser(req, user){
    
    console.log('Logging in user');
    
    return new Promise ((resolve,reject) => {

        req.session.regenerate(async (err) => {
            if (err) {
                console.error('Error regenerating session:', err);
                reject( new Error('Session regeneration failed'));
            }
            // Serialize the user into the new session
            req.logIn(user, err => {
                if(err){
                    console.error('Error logging in user:', err);
                    reject( new Error('Log in failed'));
                }
                console.log('User ' + user.name + ' logged in successfully')
                resolve(true)
            })
        })
    });
        

}

async function authenticateUser(req,res,next){

    passport.authenticate(
        'local',
        {
            failureRedirect: '/community/login',
            failureMessage:true,
        },
        async (error,user,info) => {
            console.log('authenticating');
            if(error){
                return res.status(500).json({error: 'Internal server error'});
            }
            
            if(!user){
                if(info.message === 'userNotFound'){
                    console.log('User account not found');
                    req.emailError = 'Account not found';
                }
                if(info.message === 'passwordMismatch'){
                    console.log('Incorrect password')
                    req.passwordError = 'Incorrect password, please try again'
                }
                return res.redirect('/community/login');   
            }

            try{
                const verifiedUser = await ensureVerifiedUser(req, user);
                if(verifiedUser){
                    res.redirect('/community/profile');
                }else{
                    res.redirect('/community/verification');
                }
            }catch(error){
                console.log('Error on the verification flow: ', error);
                return res.status(500).json({error: 'Internal server error'});
            }
        }

    )(req,res,next);
}

async function signUpUser(req,res,next){
    //Get user info
    const userInfo = req.body
    //Hash password
    bcrypt.hash(userInfo['user-password'], saltRounds, async (error, hashedPassword) => {
        if(error){
            console.error('Error hashing password: ', error);
            res.status(500).json({error: 'Internal server error'});
        }
        userInfo.hashedPassword = hashedPassword;
        userInfo.provider = "LOCAL";

        try {
            const user = await db.createUser(userInfo);
            const verifiedUser = await ensureVerifiedUser(req, user);
            if(verifiedUser){
                res.redirect('/community/profile');
            }else{
                res.redirect('/community/verification');
            }
        }catch(error){
            if (error.code === 'P2002') { //Prisma unique violation code
                res.status(400).json({ error: 'Email already in use' });
            } else {
                console.log("Error creating user: ", error);
                res.status(500).json({ error: 'Internal server error' });
            }
        }
    });

}

async function verifyUser(req, res, next){
    //Check token
    const token = req.params.token;
    if(token){
        //Check token validity
        try{
            const verifiedToken = await db.verifyToken(token);
            await db.removeVerificationToken(verifiedToken.userId);
            const verifiedUser = await db.verifyUser(verifiedToken);
            const userLoggedIn = await loginUser(req,verifiedUser);
            res.redirect('/community/profile');
        }catch(error){
            console.log('Error verifying user: ', error);
            throw error;
        }
    }else{
        res.send("Please check your email and follow the instructions to complete your sign-up")
    }
}

export {
    ensureAuthenticated, ensureVerifiedUser, loginUser, authenticateUser, signUpUser, verifyUser
}