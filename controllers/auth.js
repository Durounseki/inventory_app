import * as db from '../db/communityQueries.js'
import passport from 'passport';
import sendVerificationEmail from './emailTemplate.js';
import crypto from 'crypto';
const generateVerificationToken = (bytes = 32) => crypto.randomBytes(bytes).toString('hex')


function ensureAuthenticated(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect('/login');
}


function verifyUser(){

}


async function ensureVerifiedUser(user){
    
    if(!user.verified){

        console.log('User not verified');
        
        //Create email verification token
        const verificationToken = generateVerificationToken();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate()+1);//One day validity

        //Store token
        try{

            const storedToken = await db.createVerificationToken(user.id,verificationToken,expiresAt);
            console.log('Token stored!');
            return storedToken.token;

        }catch(error){
            console.log('Error storing token: ', error);
        }

    }
    
    console.log('User is verified');
    return null;

}

async function loginUser(req, user){
    console.log(req.session);
    console.log('Trying to log in user: ', user);
    
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
                    return reject(new Error('Log in failed'));
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
                return next(error);
            }
            console.log('authenticated user: ', user);
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
            let verificationToken;
            try{
                console.log('Check user'+user.name+'is verified');
                verificationToken = await ensureVerifiedUser(user);
                console.log('Logging in user '+user.name)
                const userLoggedIn = await loginUser(req, user);
                if(verificationToken){
                    const verificationLink = `${req.protocol}://${req.get('host')}/community/verification/${verificationToken}`;
                    console.log('link: ', verificationLink);
                    try{
                        console.log('Sending email');
                        const emailResult = await sendVerificationEmail(user,verificationLink);
                        return res.redirect('/community/verification');
                    }catch(error){
                        console.log("Error sending email: ", error);
                        throw error;
                    }
                }
                return res.redirect('/community/profile');
            }catch(error){
                console.log('Error on the verification flow: ', error);
                if(verificationToken){
                    try{
                        console.log('Removing token');
                        await db.removeVerificationToken(verificationToken);
                    }catch(error){
                        console.log('Error removing token: ', error);
                        return next(error);
                    }
                }
            }
        }
            
    )(req,res,next);
}

export {
    ensureVerifiedUser, loginUser, authenticateUser
}