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

const authorized = true;

const user = {
    username: "durounseki",
    email: "durounseki@thedancethread.com",
    name: "Christian",
    nationality: "Mexico",
    location: "Japan",
    greeting: "Hey! I'm the developer of the dance thread!",
    danced: 10,
    wantToDance: 3000,
    bio: `
    Hey there, this is Christian, the developer of this website. I hope you are enjoying your experience using The Dance Thread! Please don't hesitate to contact me to ask questions, make some suggestions, or simply say hello.
        
    Let me tell you a little bit about me, and the story behind The Dance Thread. I'm originally from Mexico, and even though dancing is a big part of our culture, I never dared to learn while living there. I always thought I was too clumsy and felt insecure thinking people would laugh at me. My dance journey actually started when I moved to the UK for my studies. I learned the basics of salsa and bachata there and discovered how beautiful it is to connect with someone through dance. I was instantly hooked! But I still didn't feel confident enough to go out to socials, not to mention that I was extremely busy trying to finish my PhD in the middle of the pandemic back in 2020.
                
    It wasn't until I came to Okinawa that I really started learning properly, first at Mamboki with Erik Rodriguez and later with Andres y Yuno at Haisai Latina. It took months to build the skills and confidence to ask people to dance. You know how hard it is to step onto the dance floor when you can only do the basic step! But, if you're like me, you also know how fun and addictive dancing can be. There's something magical about losing yourself in the music and movement, spending hours at a dance club without even noticing the time fly by.  You create these strong bonds with people simply by connecting on the dance floor, regardless of what language you speak. It's amazing how dance can create friendships anywhere in the world where there's a welcoming community.
                
    And speaking of community, it was here in Okinawa that I met Yazmin, who sparked the idea for The Dance Thread. She envisioned an inclusive space for all dancers, which instantly resonated with how I feel about dancing. Coincidentally, at the time, I was looking to start a career in web development. It felt like the perfect partnership! We've been working hard for the last few months and have come up with this initial product. There's still tons of work to do, but we're working relentlessly to connect dancers from all around the world and spread our passion to many more.
                
    We're working hard to bring you more features soon, including learning resources and opportunities to share your work as dancers, connecting both personally and professionally.
        
    Start exploring The Dance Thread today!
    `,
    style: ['Salsa', 'Bachata', 'Cumbia'],
    sns: [{
        name: "instagram",
        url: "https://www.instagram.com/durounseki/profilecard/?igsh=MWdvd3RlaXNxbnBlNw==",
        faClass: "fa-brands fa-instagram"
    }],
    preferences: {
        visibility: {
            network: "anyone",
            events: "anyone"
        }
    }


}

const getProfileAbout = [ async(req,res,next) => {
    
    res.render('profile', {
        title: 'Profile',
        user: user,
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
    res.render('profile', {
        title: 'Profile',
        user: user,
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
    res.render('settings', {
        title: 'Edit Profile',
        user: user,
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
    res.render('settings', {
        title: 'Settings',
        user: user,
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
    res.render('profile', {
        title: 'Profile',
        user: user,
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
    res.render('profile', {
        title: 'Profile',
        user: user,
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