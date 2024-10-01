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
import { MailerSend, EmailParams, Sender, Recipient } from "mailersend";

const mailerSend = new MailerSend({
    apiKey: process.env.MAILERSEND_TOKEN,
});
  
const sentFrom = new Sender(process.env.MAILERSEND_EMAIL, "The Dance Thread");

//EJS engine
import ejs from 'ejs';

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

]

const postLogin = [
    validateLogin,
    async (req,res) => {
        //Get user from data base using email
        //If user exists
            //Verify password
            //If password matches
                //Check active user status
                //If active user
                    //Continue to profile or back to create event
                //If not active
                    //Ask to confirm email to activate account
            //If it doesn't match
                //Show "wrong password" and render login page again
        //If user doesn't exist
            //Show "Unknown user" and render again
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
                if(user){
                    //Create email verification token
                    const verificationToken = generateVerificationToken();
                    const verificationLink = `${req.protocol}://${req.get('host')}/community/verification/${verificationToken}`;
                    //Configure verification email
                    const recipients = [
                        new Recipient(user.email, user.name)
                    ];
                      
                    const emailParams = new EmailParams()
                    .setFrom(sentFrom)
                    .setTo(recipients)
                    .setSubject("Please verify your email")
                    .setHtml(`
                        <!DOCTYPE html>
                        <html>
                            <head>
                                <meta charset="utf-8">
                            </head>
                            <body>
                                <p>Hello ${user.name}!</p>
                                <p>Click on the link below to verify your email</p>
                                <a href="${verificationLink}" style="display: inline-block; padding: 10px 20px; background-color: #ffa6db; color: #fff5ff; text-decoration: none; border-radius: 5px;">Verify Email</a>
                            </body>
                        </html>
                        `
                    )
                    .setText(`
                        Hello, ${user.name}! Please verify your email using this link:
                        ${verificationLink}
                        `,
                    );
                      
                    mailerSend.email
                    .send(emailParams)
                    .then((response) => console.log('Email sent successfully: ', response))
                    .catch((error) => {
                        console.log("Error sending email: ",error)
                        res.status(500).json({error: 'Internal server error'});
                    });
                    //Store verification token

                }
                
                //Send email and redirect to verification route
                res.status(201).json({ message: 'User created successfully', user: user }); // Or redirect, etc.
            } catch (error) {
                if (error.code === 'P2002') { //Prisma unique violation code
                    res.status(400).json({ error: 'Email already in use' });
                } else {
                    res.status(500).json({ error: 'Internal server error' });
                }
            }
        })
    }
]

async function getVerification(req,res){
    //get verification token from the request
    //If there is a verification token
        //Show "Account verified start exploring"
    //else
        //Show "Please check your email at emailUrl and click the verification link to complete your sign-up"
}
//Confirmation email
//Logo
//Welcome to The Dance Thread
//Please confirm your email address to finish creating your account.
//Confirmation button
//Alternative link for cases in which the link doesn't work
const communityController = {
    showDashboard, getLogin, getSignup, postSignup
};

export default communityController;