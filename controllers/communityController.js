import * as dotenv from 'dotenv'; 
dotenv.config();

//Data base
import * as db from '../db/communityQueries.js';
//Form validation
import {loginValidators, signupValidators, validateUserForm} from './validators.js';

//Authentication
import {authenticateUser, signUpUser } from './auth.js';

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

const postLogin = [
    loginValidators,
    validateUserForm,
    authenticateUser
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

const postSignup = [
    signupValidators,
    validateUserForm,
    signUpUser
]

async function getVerification(req,res){
    console.log(req.session.passport);
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
                            await db.removeVerificationToken(verifiedToken.userId);
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
    console.log("user: ", req.user);
    res.send(req.user);
}

const communityController = {
    showDashboard, getLogin, postLogin, getSignup, postSignup, getVerification, getProfile
};

export default communityController;