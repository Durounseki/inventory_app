import * as dotenv from 'dotenv'; 
dotenv.config();

//Data base
import * as db from '../db/communityQueries.js';
//Form validation
import {loginValidators, signupValidators, forgotPasswordValidators, resetPasswordValidators, validateUserForm} from './validators.js';

//Authentication
import {authenticateUser, signUpUser, ensureAuthenticated, verifyUser, sendResetToken, passwordResetAuthenticate, resetPassword } from './auth.js';

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
    //Check if user is logged in
    //If so
        //Redirect to profile
    //If not
    res.render("login",{title: "Log in", script: "login.js"});
}

const postLogin = [
    loginValidators,
    validateUserForm,
    authenticateUser
]

async function getForgotPassword(req,res){
    res.render("forgot-password",{title: "Forgot password", script: "forgot-password.js"});
}

const postForgotPassword = [
    forgotPasswordValidators,
    validateUserForm,
    sendResetToken
]

const getResetPassword = [
    passwordResetAuthenticate,
    (req, res, next) => {
        res.render("reset-password",{title: "Reset password", script: "reset-password.js"});
    }
]

const postResetPassword = [
    resetPasswordValidators,
    validateUserForm,
    resetPassword
]

async function getSignup(req,res){
    //Check if user is logged in
    //If so
        //Redirect to profile
    //If not
    res.render("signup",{title: "Sign up", script: "signup.js"});
}

const postSignup = [
    signupValidators,
    validateUserForm,
    signUpUser
]

const getVerification = [
    verifyUser,
    (req, res, next) => {
        res.render("verification", {title: "Verification", script: "verification.js"});
    }
]

// const getProfile = [
//     // ensureAuthenticated,
//     async (req,res,next) => {
//         // const user = req.user || false;
//         res.render('profile', {title: "Profile", user: user, script: "profile.js"});
//     }
// ]

const ownUserActions = [
    {
        name: "Edit Profile",
        href: "/community/profile/edit"
    },
    {
        name: "Settings",
        href: "/community/profile/settings"
    }
]

const editActions = [
    {
        name: "New Picture",
        url: "/community/profile/edit/picture"
    },
    {
        name: "Delete Picture",
        url: "/community/profile/edit/picture"
    }
]

const otherUserActions = [
    {
        name: "Danced",
        href: "/community/profile/danced"
    },
    {
        name: "Want to Dance",
        href: "/community/profile/want-to-dance"
    }
]

const ownInfoTabs = [
    {
        name: "About",
        href: "/community/profile/about"
    },
    {
        name: "Events",
        href: "/community/profile/events"
    }
]

const othersInfoTabs = [
    {
        name: "Danced",
        href: "/community/profile/danced"
    },
    {
        name: "Want to Dance",
        href: "/community/profile/want-to-dance"
    }
]

const editTabs = [
    {
        name: "Edit Profile",
        href: "/community/profile/edit"
    },
    {
        name: "Settings",
        href: "/community/profile/settings"
    }
]

function isAuthorized(req){
    const profileUsername = req.params.username;
    const currentUser = req.app.locals.currentUser;
    const user = req.app.locals.users.filter(item => item.username === profileUsername)[0];
    if(user === currentUser){
        return {user: user, currentUser: currentUser, authorized: true};
    }
    return {user: user, currentUser: currentUser, authorized: false};
}

const getProfileAbout = [ async(req,res,next) => {
    
    const {user, currentUser, authorized} = isAuthorized(req);

    console.log(user);
    res.render('profile', {
        title: 'Profile',
        user: user,
        currentUser: currentUser,
        authorized: authorized,
        userActions: authorized ? ownUserActions : otherUserActions,
        userTabs: ownInfoTabs.map(tab => 
            tab.name === "About"
            ? {...tab, class: "details-tab active"}
            : {...tab, class: "details-tab"}
        ),
        about: true,
        events: false,
        community: false  
    })
}]
const getProfileEvents = [ async(req,res,next) => {

    const {user, currentUser, authorized} = isAuthorized(req);

    res.render('profile', {
        title: 'Profile',
        user: user,
        currentUser: currentUser,
        authorized: authorized,
        userActions: authorized ? ownUserActions : otherUserActions,
        userTabs: ownInfoTabs.map(tab => 
            tab.name === "Events"
            ? {...tab, class: "details-tab active"}
            : {...tab, class: "details-tab"}
        ),
        about: false,
        events: true,
        community: false
    })
}]

const getProfileEdit = [ async(req,res,next) => {
    
    const {user, currentUser, authorized} = isAuthorized(req);

    res.render('settings', {
        title: 'Edit Profile',
        user: user,
        authorized: authorized,
        userActions: editActions,
        userTabs: editTabs.map(tab => 
            tab.name === "Edit Profile"
            ? {...tab, class: "details-tab active"}
            : {...tab, class: "details-tab"}
        ),
        editProfile: true,
        profileSettings: false

    })
}]

const getProfileSettings = [ async(req,res,next) => {

    const {user, currentUser, authorized} = isAuthorized(req);

    res.render('settings', {
        title: 'Settings',
        user: user,
        authorized: authorized,
        userActions: editActions,
        userTabs: editTabs.map(tab => 
            tab.name === "Settings"
            ? {...tab, class: "details-tab active"}
            : {...tab, class: "details-tab"}
        ),
        editProfile: false,
        profileSettings: true
    })
}]

const getProfileDanced = [ async(req,res,next) => {
    
    const {user, currentUser, authorized} = isAuthorized(req);

    res.render('profile', {
        title: 'Profile',
        user: user,
        currentUser: currentUser,
        authorized: authorized,
        userActions: authorized ? ownUserActions : otherUserActions,
        userTabs: othersInfoTabs.map(tab => 
            tab.name === "Danced"
            ? {...tab, class: "details-tab active"}
            : {...tab, class: "details-tab"}
        ),
        about: false,
        events: false,
        community: true
      })
}]

const getProfileWantToDance = [ async(req,res,next) => {
    
    const {user, currentUser, authorized} = isAuthorized(req);

    res.render('profile', {
        title: 'Profile',
        user: user,
        currentUser: currentUser,
        authorized: authorized,
        userActions: authorized ? ownUserActions : otherUserActions,
        userTabs: othersInfoTabs.map(tab => 
            tab.name === "Want to Dance"
            ? {...tab, class: "details-tab active"}
            : {...tab, class: "details-tab"}
        ),
        about: false,
        events: false,
        community: true
    })
}]

const communityController = {
    showDashboard,
    getLogin,
    postLogin,
    getForgotPassword,
    postForgotPassword,
    getResetPassword,
    postResetPassword,
    getSignup,
    postSignup,
    getVerification,
    getProfileAbout,
    getProfileEvents,
    getProfileDanced,
    getProfileWantToDance,
    getProfileEdit,
    getProfileSettings,
    // getProfile
};

export default communityController;