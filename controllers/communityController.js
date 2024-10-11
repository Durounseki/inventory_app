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

const ownUserActions = {
    view: (username) => 
    [
        {
            name: "Edit Profile",
            href: `community/${username}/edit`
        },
        {
            name: "Settings",
            href: `community/${username}/settings`
        }
    ],
    edit: (username) => 
    [
        {
            name: "New Picture",
            href: `community/${username}/picture`
        },
        {
            name: "Delete Picture",
            href: `community/${username}/picture`
        }
    ]
}

const otherUserActions = (username) => [
    {
        name: "Follow",
        href: `community/${username}/follow`
    },
    {
        name: "Danced",
        href: `community/${username}/danced`
    },
    {
        name: "Want to Dance",
        href: `community/${username}/want-to-dance`
    }
]


const infoTabs = (username) => [
    {
        name: "About",
        href: `/community/${username}`
    },
    {
        name: "Events",
        href: `/community/${username}/events`
    },
    {
        name: "Danced",
        href: `/community/${username}/danced`
    },
    {
        name: "Want to Dance",
        href: `/community/${username}/want-to-dance`
    }
]

const editTabs = (username) => [
    {
        name: "Edit Profile",
        href: `/community/${username}/edit`
    },
    {
        name: "Settings",
        href: `/community/${username}/settings`
    }
]

function canView(preference, currentUser, user){
    switch(preference){
        case "me":
            return false;
            break;
        case "danced":
            if(user.danced.includes(currentUser.username)){
                return true;
            }else{
                return false;
            }
            break;
        case "wantToDance":
            if(user.danced.includes(currentUser.username) || user.wantToDance.includes(currentUser.username)){
                return true;
            }else{
                return false;
            }
            break;
        case "anyone":
            return true;
            break;

    }
}

const getProfileAbout = [ async(req,res,next) => {
    
    const profileUsername = req.params.username;
    const user = req.app.locals.users.filter(item => item.username === profileUsername)[0];;
    const currentUser = req.app.locals.currentUser;
    console.log(user.username);
    let userActions;

    let mode = "view";
    if(user === currentUser){
        userActions = ownUserActions[mode](currentUser.username)
    }else{
        userActions = otherUserActions(user.username)
    }

    res.render('profile', {
        title: 'Profile',
        user: user,
        currentUser: currentUser,
        userActions: userActions,
        userTabs: infoTabs(user.username).map(tab => 
            tab.name === "About"
            ? {...tab, class: "details-tab active"}
            : {...tab, class: "details-tab"}
        ),
        info: "about",
    })
}]
const getProfileEvents = [ async(req,res,next) => {

    const {user, currentUser, userActions} = checkUser(req);
    const events = req.app.locals.events.filter(item => user.events.includes(item.id));

    res.render('profile', {
        title: 'Profile',
        user: user,
        currentUser: currentUser,
        userActions: userActions,
        events: events,
        userTabs: ownInfoTabs.map(tab => 
            tab.name === "Events"
            ? {...tab, class: "details-tab active"}
            : {...tab, class: "details-tab"}
        ),
        info: "events"
    })
}]

const getProfileEdit = [ async(req,res,next) => {
    
    const {user, currentUser, userActions} = checkUser(req);

    res.render('settings', {
        title: 'Edit Profile',
        user: user,
        currentUser: currentUser,
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

    const {user, currentUser, userActions} = checkUser(req);

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