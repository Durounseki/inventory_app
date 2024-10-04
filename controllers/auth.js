import * as db from '../db/communityQueries.js'
import passport from 'passport';
import {sendVerificationEmail, sendResetEmail} from './emailTemplate.js';
import crypto from 'crypto';
const generateToken = (bytes = 32) => crypto.randomBytes(bytes).toString('hex')
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
        try{
            const baseUrl = `${req.protocol}://${req.get('host')}/community/verification`;
            const tokenSent = await sendTokenEmail(user,baseUrl,db.removeVerificationToken,db.storeVerificationToken,sendVerificationEmail);
            if(tokenSent){
                return false
            }
        }catch(error){
            console.log('Error sending verification token: ', error);
            throw error;
        }
        
        // let verificationTokenId;
        // try{
            
        //     verificationTokenId = await createVerificationToken(user);
            
        //     if(verificationTokenId){

        //         const emailResult = sendTokenEmail(user,verificationTokenId,'verification',sendVerificationEmail);

        //         return false

        //         // const verificationLink = `${req.protocol}://${req.get('host')}/community/verification/${verificationTokenId}`;
        //         // console.log(verificationLink);
        //         // try{
        //         //     console.log('Sending email');
        //         //     const emailResult = await sendVerificationEmail(user,verificationLink);
        //         //     return false;
        //         // }catch(error){
        //         //     console.log("Error sending email: ", error);
        //         //     throw error;
        //         // }
        //     }

        // }catch(error){
        //     console.log('Error on the verification flow: ', error);
        //     if(verificationTokenId){
        //         try{
        //             console.log('Removing token');
        //             await db.removeVerificationToken(user.id);
        //         }catch(error){
        //             console.log('Error removing token: ', error);
        //             throw error;
        //         }
        //     }
        //     throw error;
        // }

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

async function createToken(user,removeToken,storeToken){
    //Create email verification token
    const token = generateToken();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes()+15);//15 min validity

    //Store token
    try{
        //Remove old token
        await removeToken(user.id)
        const storedToken = await storeToken(user.id,token,expiresAt);
        return storedToken.id;

    }catch(error){
        console.log('Error storing token: ', error);
        throw error;
    }
}

// async function createVerificationToken(user){
    
        
//     //Create email verification token
//     const verificationToken = generateToken();
//     const expiresAt = new Date();
//     expiresAt.setMinutes(expiresAt.getMinutes()+15);//15 min validity

//     //Store token
//     try{
//         //Remove old token
//         await db.removeVerificationToken(user.id)
//         const storedToken = await db.storeVerificationToken(user.id,verificationToken,expiresAt);
//         return storedToken.id;

//     }catch(error){
//         console.log('Error storing token: ', error);
//         throw error;
//     }

// }

// async function createResetToken(user){
    
        
//     //Create email verification token
//     const resetToken = generateToken();
//     const expiresAt = new Date();
//     expiresAt.setMinutes(expiresAt.getMinutes()+15);//15 min validity

//     //Store token
//     try{
//         //Remove old token
//         await db.removeResetToken(user.id)
//         const storedToken = await db.storeResetToken(user.id,resetToken,expiresAt);
//         return storedToken.id;

//     }catch(error){
//         console.log('Error storing token: ', error);
//         throw error;
//     }

// }

async function sendTokenEmail(user,baseUrl,removeToken,storeToken,sendEmail){
    try{
        
        let tokenId = await createToken(user,removeToken,storeToken);
        
        if(tokenId){

            // const link = `${req.protocol}://${req.get('host')}/community/${page}/${verificationTokenId}`;
            const link = `${baseUrl}/${tokenId}`
            console.log(link);
            try{
                console.log('Sending email');
                // const emailResult = await sendEmail(user,link);
                return true;
            }catch(error){
                console.log("Error sending email: ", error);
                throw error;
            }
        }

    }catch(error){
        console.log('Error sending token: ', error);
        if(tokenId){//Delete the token from database if it was stored
            try{
                console.log('Removing token');
                await db.removeToken(user.id);
            }catch(error){
                console.log('Error removing token: ', error);
                throw error;
            }
        }
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
                }
                if(info.message === 'passwordMismatch'){
                    console.log('Incorrect password')
                }
                return res.redirect('/community/login');   
            }

            try{
                const verifiedUser = await ensureVerifiedUser(req, user);
                if(verifiedUser){
                    await db.updateLastLogin(user.id);
                    res.redirect(`/community/profile/${user.id}`);
                }else{
                    res.redirect('/community/verification?emailSent=true');
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
            const baseUrl = `${req.protocol}://${req.get('host')}/community/verification`;
            const tokenSent = await sendTokenEmail(user,baseUrl,db.removeVerificationToken,db.storeVerificationToken,sendVerificationEmail);
            // const verifiedUser = await ensureVerifiedUser(req, user);
            // if(verifiedUser){
            //     res.redirect('/community/profile');
            // }else{
            if(tokenSent){
                res.redirect('/community/verification?emailSent=true');
            }
            // }
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
    const tokenId = req.params.tokenId;
    if(tokenId){
        //Check token validity
        try{
            const validatedToken = await db.validateVerificationToken(tokenId);
            await db.removeVerificationToken(validatedToken.userId);
            const validatedUser = await db.verifyUser(validatedToken.userId);
            const userLoggedIn = await loginUser(req,validatedUser);

            res.locals.message = "Your account was validated successfully. Start exploring!";
            next();
        }catch(error){
            if(error.message === 'Invalid verification link' || error.message === 'Verification link expired'){
                res.locals.message = `${error.message}. Log in to request a new verification link.`;
                next()
            }else{
                console.log('Error verifying user: ', error);
                next(error);
            }

        }
    }else{
        if(req.query.emailSent){
            res.locals.message = "Please check your email and follow the instructions to verify your account";
            next();
        }else{
            res.redirect('/community/login');
        }
    }
}

async function sendResetToken(req, res, next){
    //Get user info
    const userInfo = req.body
    try{
        console.log('Finding user', userInfo['user-email']);
        const user = await db.findUserByEmail(userInfo['user-email']);
        console.log(user);
        if(user){

            console.log('Sending reset password email');
            try{
                const baseUrl = `${req.protocol}://${req.get('host')}/community/reset-password`;
                const tokenSent = await sendTokenEmail(user,baseUrl,db.removeResetToken,db.storeResetToken,sendResetEmail);
                if(tokenSent){
                    res.redirect('/community/reset-password?emailSent=true');
                }
            }catch(error){
                console.log('Error sending reset password token: ', error);
                throw error;
            }

            // let resetTokenId;
            // try{

            //     const resetTokenId = await createResetToken(user);
            //     if(resetTokenId){
            //         const emailResult = sendTokenEmail(user,resetTokenId,'reset-password',sendResetEmail)
            //         // const resetLink = `${req.protocol}://${req.get('host')}/community/reset-password/${resetTokenId}`;
            //         // console.log(resetLink);
            //         // try{
            //             //     console.log('Sending email');
            //             //     const emailResult = await sendResetEmail(user,resetLink);
            //             //     res.redirect('/community/reset-password?emailSent=true');
            //             // }catch(error){
            //                 //     console.log("Error sending email: ", error);
            //                 //     throw error;
            //                 // }
            //     }
            // }catch(error){
            //     console.log('Error sending reset link: ', error);
            //     if(resetTokenId){
            //         try{
            //             console.log('Removing token');
            //             await db.removeResetToken(user.id);
            //         }catch(error){
            //             console.log('Error removing token: ', error);
            //             throw error;
            //         }
            //     }
            //     throw error;
            // }
        }else{
            console.log('User account not found');
            throw new Error('User account not found');
        }
    }catch(error){
        console.log('Error resetting password: ',error);
        res.status(500).json({error: error.message});
    }

}

async function passwordResetAuthenticate(req,res,next){
    //Check token
    const tokenId = req.params.tokenId;
    if(tokenId){
        //Validate token
        try{
            const validatedToken = await db.validateResetToken(tokenId);
            if(validatedToken){
                res.locals.tokenId = tokenId;
            }
            res.locals.message = "Set your new password. We recommend using a password manager";
            next();
        }catch(error){
            if(error.message === 'Invalid password reset link' || error.message === 'Password reset link expired'){
                res.locals.message = `${error.message}.`;
                next()
            }else{
                console.log('Error verifying user: ', error);
                next(error);
            }
        }
        
    }else{
        if(req.query.emailSent){
            res.locals.message = "Please check your email and follow the instructions to securely reset your password";
            next();
        }
        res.redirect('/community/login')
    }
}

async function resetPassword(req,res, next){
    //Get password
    const password = req.body['user-password'];
    const tokenId = req.body['tokenId'];
    //Hash password
    bcrypt.hash(password, saltRounds, async (error, hashedPassword) => {
        if(error){
            console.log('Error hashing password: ', error);
            res.status(500).json({error: 'Internal server error'});
        }
        try {
            const isReset = await db.resetPassword(tokenId, hashedPassword);
            req.flash('success', 'New password saved! Please log in to continue');
            res.redirect('/community/login');
        }catch(error){
            console.log("Error updating password: ", error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });
}

export {
    ensureAuthenticated,
    authenticateUser,
    signUpUser,
    verifyUser,
    sendResetToken,
    passwordResetAuthenticate,
    resetPassword
}