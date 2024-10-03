import * as dotenv from 'dotenv'; 
dotenv.config();

//Data base
import * as db from '../db/communityQueries.js';
//Form validation
import { body, validationResult } from "express-validator";
//Password encryption
import bcrypt from 'bcrypt';
const saltRounds = 10;

import crypto from 'crypto';
const generateVerificationToken = (bytes = 32) => crypto.randomBytes(bytes).toString('hex')

import sendVerificationEmail from './emailTemplate.js';

//EJS engine
import ejs from 'ejs';

//Authentication
import passport from 'passport';

//Render initial page
async function showDashboard(req,res){
    //Handle queries
    const username = req.query.username;
    const country = req.query.country;
    const style =  req.query.style;
    res.render("community", {title: "Community", script: "community.js", username: username, country: country, style: style});
}

//Login page
async function getLogin(req,res){
    res.render("login",{title: "Log in", script: "login.js"});
}

const validateLogin = [
    body("user-email").trim().notEmpty().withMessage('Please enter your email')
    .isEmail().withMessage('Please enter a valid email address'),
    body("user-password").trim()
    .isLength({ min: 8, max: 16 }).withMessage('Password must be between 8 and 16 characters long')
    .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/\d/).withMessage('Password must contain at least one number')
    .matches(/\W/).withMessage('Password must contain at least one special character')
    .not().matches(/\s/).withMessage('Password must not contain any spaces'),
    //HoneyPot
    body('user-password-verify').custom((value) =>{
        if(value) {
            throw new Error('Bot detected!');
        }
        return true;
    })
]

const postLogin = [
    validateLogin,
    (req, res, next) => {
        //Get user info
        const userInfo = req.body
        console.log(userInfo);
        //Check for errors
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            const botDetected = errors.errors.some(error => error.msg === 'Bot detected!');
            if(botDetected){
                console.error('Bot detected during signup attempt!');
                return res.status(400).json({errors: [{msg: 'Invalid submission'}]});
            }else{
                return res.status(400).json({info: userInfo, errors: errors.errors});
            }
        }
        console.log('No errors!');
        next();
    },
    (req,res,next) => {

        passport.authenticate(
            'local',
            {
                failureRedirect: '/community/login',
                failureMessage:true,
            },
            async (err,user,info) => {
                console.log('authenticating');
                if(err){
                    return next(err);
                }
                console.log('authenticated user: ', user);
                console.log('info: ', info)
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
                if(!user.verified){
                    console.log('User not verified');
                    //Create email verification token
                    const verificationToken = generateVerificationToken();
                    const verificationLink = `${req.protocol}://${req.get('host')}/community/verification/${verificationToken}`;
                    
                    const emailResult = await sendVerificationEmail(user,verificationLink);
                    console.log("Email result: ", emailResult);
    
                    if(emailResult.statusCode === 202){
                        const expiresAt = new Date();
                        expiresAt.setDate(expiresAt.getDate()+1);//One day validity
                        //Store verification token
                        try{
                            const storedToken = await db.createVerificationToken(user.id,verificationToken,expiresAt)
                            //Start session
                            req.session.regenerate(err => {
                                if (err) {
                                console.error('Error regenerating session:', err);
                                return res.status(500).json({ error: 'Internal server error' });
                                }
                                // Serialize the user into the new session
                                req.login(user, err => { 
                                if (err) {
                                    console.error('Error logging in user:', err);
                                    return res.status(500).json({ error: 'Internal server error' });
                                }
                                console.log('User logged in successfully')
                                res.redirect('/community/verification'); 
                                });
                            });
                        }catch(error){
                            console.log("Error storing token");
                            res.status(500).json({error: 'Internal server error'});
                        }
                    }else{
                        res.status(500).json({error: 'Internal server error'});   
                    }
                }else{
                    console.log('user before regenerate: ', user);
                    req.session.regenerate(err => {
                        if (err) {
                        console.error('Error regenerating session:', err);
                        return res.status(500).json({ error: 'Internal server error' });
                        }
                        // Serialize the user into the new session
                        req.logIn(user, async (err) => {
                            if(err){
                                console.error('Error logging in user:', err);
                                return next(err);
                            }
                            console.log('user after regeneration: ', user);
                            console.log('User logged in successfully')
                            res.redirect('/community/profile');
                        })
                    })
                }
            }
        )(req,res,next);
    // },

    // async (req,res) => {
        
    //     res.json({user: req.user});

        // passport.authenticate('local', {}, async (err,user,info) => {
        //     console.log('authenticating');
        //     if(err){
        //         return next(err);
        //     }
        //     console.log(user);
        //     if(!user){
        //         if(info.message === 'userNotFound'){
        //             console.log('User account not found');
        //             req.emailError = 'Account not found';
        //         }
        //         if(info.message === 'passwordMismatch'){
        //             console.log('Incorrect password')
        //             req.passwordError = 'Incorrect password, please try again'
        //         }
        //         return res.redirect('/community/login');
        //     }
        //     if(!user.verified){
        //         console.log('User not verified');
        //         //Create email verification token
        //         const verificationToken = generateVerificationToken();
        //         const verificationLink = `${req.protocol}://${req.get('host')}/community/verification/${verificationToken}`;
                
        //         const emailResult = await sendVerificationEmail(user,verificationLink);
        //         console.log("Email result: ", emailResult);

        //         if(emailResult.statusCode === 202){
        //             const expiresAt = new Date();
        //             expiresAt.setDate(expiresAt.getDate()+1);//One day validity
        //             //Store verification token
        //             try{
        //                 const storedToken = await db.createVerificationToken(user.id,verificationToken,expiresAt)
        //                 //Start session
        //                 req.session.regenerate(err => {
        //                     if (err) {
        //                     console.error('Error regenerating session:', err);
        //                     return res.status(500).json({ error: 'Internal server error' });
        //                     }
        //                     // Serialize the user into the new session
        //                     req.login(user, err => { 
        //                     if (err) {
        //                         console.error('Error logging in user:', err);
        //                         return res.status(500).json({ error: 'Internal server error' });
        //                     }
        //                     console.log('User logged in successfully')
        //                     res.redirect('/community/verification'); 
        //                     });
        //                 });
        //             }catch(error){
        //                 console.log("Error storing token");
        //                 res.status(500).json({error: 'Internal server error'});
        //             }
        //         }else{
        //             res.status(500).json({error: 'Internal server error'});   
        //         }
        //     }else{
        //         req.session.regenerate(err => {
        //             if (err) {
        //             console.error('Error regenerating session:', err);
        //             return res.status(500).json({ error: 'Internal server error' });
        //             }
        //             // Serialize the user into the new session
        //             req.logIn(user, async (err) => {
        //                 if(err){
        //                     console.error('Error logging in user:', err);
        //                     return next(err);
        //                 }
        //                 console.log('User logged in successfully')
        //                 res.redirect('/community/profile');
        //             })
        //         })
        //     }
            
        // })
    }
]

async function getForgotPassword(req,res){
    req.render("forgot-password",{title: "Forgot password", script: "forgot-password.js"});
}

const validateForgotPassword = [

]

const postForgotPassword = [
    validateForgotPassword,
    async (req,res) => {
        
        //Get user from database using email
        //If user exists
            //Create new token
            //Send email
            //Show "Email sent"
        //If user doesn't exists
            //Show "Unknown user" and render again
    }
]

async function getSignup(req,res){
    res.render("signup",{title: "Sign up", script: "signup.js"});
}

const validateSignup = [
    body("user-name").trim().notEmpty().withMessage('Please enter your name, nickname or stage name')
    .isLength({max: 100}).withMessage('max 100 characters'),
    body("user-email").trim().notEmpty().withMessage('Please enter your email')
    .isEmail().withMessage('Please enter a valid email address'),
    body("user-password").trim()
    .isLength({ min: 8, max: 16 }).withMessage('Password must be between 8 and 16 characters long')
    .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/\d/).withMessage('Password must contain at least one number')
    .matches(/\W/).withMessage('Password must contain at least one special character')
    .not().matches(/\s/).withMessage('Password must not contain any spaces'),
    body('user-password-confirm').trim().custom((value, { req }) => {
        if (value !== req.body['user-password']) {
          throw new Error('Passwords do not match');
        }
        return true; 
    }),
    //HoneyPot
    body('user-password-verify').custom((value) =>{
        if(value) {
            throw new Error('Bot detected!');
        }
        return true;
    })
]

const postSignup = [
    validateSignup,
    async (req,res) => {
        //Get user info
        const userInfo = req.body
        //Check for errors
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            const botDetected = errors.errors.some(error => error.msg === 'Bot detected!');
            if(botDetected){
                console.error('Bot detected during signup attempt!');
                return res.status(400).json({errors: [{msg: 'Invalid submission'}]});
            }else{
                return res.status(400).json({info: userInfo, errors: errors.errors});
            }
        }
        //Hash password
        bcrypt.hash(userInfo['user-password'], saltRounds, async (err, hashedPassword) => {
            if(err){
                console.error('Error hashing password: ', err);
                res.status(500).json({error: err});
            }
            userInfo.hashedPassword = hashedPassword;
            userInfo.provider = "LOCAL";
            
            //Create user record and add to database
            try {

                const user = await db.createUser(userInfo);
                
                //Create email verification token
                const verificationToken = generateVerificationToken();
                const verificationLink = `${req.protocol}://${req.get('host')}/community/verification/${verificationToken}`;
                
                const emailResult = await sendVerificationEmail(user,verificationLink);
                console.log("Email result: ", emailResult);

                if(emailResult.statusCode === 202){
                    const expiresAt = new Date();
                    expiresAt.setDate(expiresAt.getDate()+1);//One day validity
                    //Store verification token
                    try{
                        const storedToken = await db.createVerificationToken(user.id,verificationToken,expiresAt)
                        //Start session
                        req.session.regenerate(err => {
                            if (err) {
                              console.error('Error regenerating session:', err);
                              return res.status(500).json({ error: 'Internal server error' });
                            }
                            // Serialize the user into the new session
                            req.login(user, err => { 
                              if (err) {
                                console.error('Error logging in user:', err);
                                return res.status(500).json({ error: 'Internal server error' });
                              }
                              console.log('User created successfully')
                              res.redirect('/community/verification'); 
                            });
                          });
                    }catch(error){
                        console.log("Error storing token");
                        res.status(500).json({error: 'Internal server error'});
                    }
                }else{
                    res.status(500).json({error: 'Internal server error'});   
                }

            } catch (error) {
                if (error.code === 'P2002') { //Prisma unique violation code
                    res.status(400).json({ error: 'Email already in use' });
                } else {
                    console.log("Error creating user: ", error);
                    res.status(500).json({ error: 'Internal server error' });
                }
            }
        })
    }
]

async function getVerification(req,res){
    //Check token
    const token = req.params.token;
    if(token){
        //Check session
        if(req.isAuthenticated()){
            //Check token validity
            try{
                const verifiedToken = await db.verifyToken(token);
                req.session.regenerate(async (err) => {
                    if(err){
                        console.error('Error regenerating session: ', err);
                        return res.status(500).json({error: 'Internal server error'});
                    }
                    //Update database
                    console.log('regenerating session');
                    
                    //Verify user and delete token
                    try{
                        console.log('verifying user');
                        const verifiedUser = await db.verifyUser(verifiedToken);
                        try{
                            console.log('Removing token');
                            await db.removeVerificationToken(verifiedToken);
                            //Serialize user into new session
                            req.login(verifiedUser, err => { 
                                if (err) {
                                    console.error('Error logging in user:', err);
                                    return res.status(500).json({ error: 'Internal server error' });
                                }
                                res.redirect('/community/login'); 
                            });
                        }catch(error){
                            console.log('Error removing token: ', error);
                            return res.status(500).json({error: 'Internal server error'});
                        }
                    }catch(error){
                        console.log('Error verifying user: ', error);
                        return res.status(500).json({error: 'Internal server error'});
                    }
                    
                })

            }catch(error){
                //Invalid token
                console.log('Error verifying token');
                res.status(400).json({error: error.message});
            }   
        }else{
            console.log('Session expired')
            res.send("It seems that your link expired. Enter your email below to get a new verification link")
        }
    }else{
        if(req.isAuthenticated()){
            res.send("Please check your email and follow the instructions to complete your sign-up")
        }else{
            res.redirect('/community/login');
        }
    }
}

async function getProfile(req,res){
    res.send(req.user);
}

const communityController = {
    showDashboard, getLogin, postLogin, getSignup, postSignup, getVerification, getProfile
};

export default communityController;