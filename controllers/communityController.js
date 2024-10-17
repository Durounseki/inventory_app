import * as dotenv from 'dotenv';
dotenv.config();

//Data base
import * as db from '../db/communityQueries.js';
import {snsFaClass} from '../db/utils.js';
//Form validation
import {loginValidators, signupValidators, forgotPasswordValidators, resetPasswordValidators, validateUserForm} from './validators.js';

//Authentication
import {authenticateUser, signUpUser, ensureAuthenticated, verifyUser, sendResetToken, passwordResetAuthenticate, resetPassword } from './auth.js';

// Handle file uploads
import multer from 'multer';
//Set up storage
const storage = multer.memoryStorage();
//Configure cloud storage
const upload = multer({storage: storage});

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
            href: `/community/${username}/edit`
        },
        {
            name: "Settings",
            href: `/community/${username}/settings`
        }
    ],
    edit: (username) => 
    [
        {
            name: "New Picture",
            route: `/community/${username}/new-picture`
        },
        {
            name: "Delete Picture",
            route: `/community/${username}/delete-picture`
        }
    ]
}

const otherUserActions = (username) => [
    {
        name: "Follow",
        route: `/community/follow`
    },
    {
        name: "Danced",
        route: `/community/danced`
    },
    {
        name: "Want to Dance",
        route: `/community/want-to-dance`
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
    console.log(preference);
    switch(preference){
        case "public":
            return true;
            break; 
        case "private":
            if(user.followedBy.includes(currentUser.username) || user.following.includes(currentUser.username)){
                return true;
            }else{
                return false;
            }
            break;
    }
}

const getProfileAbout = [ async(req,res,next) => {
    
    const profileUsername = req.params.username;
    const user = req.app.locals.users.filter(item => item.username === profileUsername)[0];;
    const currentUser = req.app.locals.currentUser;
    let userActions;
    const mode = "view";
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

    const profileUsername = req.params.username;
    const user = req.app.locals.users.filter(item => item.username === profileUsername)[0];;
    const currentUser = req.app.locals.currentUser;
    let userActions;
    let events;
    const mode = "view";
    if(user === currentUser){
        userActions = ownUserActions[mode](currentUser.username);
        events = req.app.locals.events.filter(item => user.eventsGoing.includes(item.id) || user.eventsCreated.includes(item.id));
    }else{
        userActions = otherUserActions(user.username)
        if(canView(user.preferences.visibility.events,currentUser,user)){
            events = req.app.locals.events.filter(item => user.eventsGoing.includes(item.id) || user.eventsCreated.includes(item.id));
        }else{
            events = req.app.locals.events.filter(item => user.eventsCreated.includes(item.id))
        }
    }  

    res.render('profile', {
        title: 'Profile',
        user: user,
        currentUser: currentUser,
        userActions: userActions,
        events: events,
        userTabs: infoTabs(user.username).map(tab => 
            tab.name === "Events"
            ? {...tab, class: "details-tab active"}
            : {...tab, class: "details-tab"}
        ),
        info: "events"
    })
}]

const getProfileEdit = [ async(req,res,next) => {
    
    const profileUsername = req.params.username;
    const user = req.app.locals.users.filter(item => item.username === profileUsername)[0];;
    const currentUser = req.app.locals.currentUser;
    if(user !== currentUser){
        res.redirect(`/community/${currentUser.username}`);
    }else{
        const mode = "edit";
        const userActions = ownUserActions[mode](currentUser.username);
        res.render('settings', {
            title: 'Edit Profile',
            user: currentUser,
            userActions: userActions,
            userTabs: editTabs(user.username).map(tab => 
                tab.name === "Edit Profile"
                ? {...tab, class: "details-tab active"}
                : {...tab, class: "details-tab"}
            ),
            editProfile: true,
            profileSettings: false,
            script: "edit-profile.js"
        })
    }
}]

const getProfileSettings = [ async(req,res,next) => {

    const profileUsername = req.params.username;
    const user = req.app.locals.users.filter(item => item.username === profileUsername)[0];;
    const currentUser = req.app.locals.currentUser;
    if(user !== currentUser){
        res.redirect(`/community/${currentUser.username}`);
    }else{
        const mode = "edit";
        const userActions = ownUserActions[mode](currentUser.username);
        
        res.render('settings', {
            title: 'Settings',
            user: currentUser,
            userActions: userActions,
            userTabs: editTabs(user.username).map(tab => 
                tab.name === "Settings"
                ? {...tab, class: "details-tab active"}
                : {...tab, class: "details-tab"}
            ),
            editProfile: false,
            profileSettings: true
        });
    }
}]

const getProfileDanced = [ async(req,res,next) => {
    
    const profileUsername = req.params.username;
    const user = req.app.locals.users.filter(item => item.username === profileUsername)[0];;
    const currentUser = req.app.locals.currentUser;
    let userActions;
    let community;
    const mode = "view";
    if(user === currentUser){
        userActions = ownUserActions[mode](currentUser.username);
        community = req.app.locals.users.filter(item => user.danced.includes(item.username));
    }else{
        userActions = otherUserActions(user.username)
        if(canView(user.preferences.visibility.network,currentUser,user)){
            community = req.app.locals.users.filter(item => user.danced.includes(item.username));
        }else{
            community = [];
        }
    }

    res.render('profile', {
        title: 'Profile',
        user: user,
        currentUser: currentUser,
        community: community,
        userActions: userActions,
        userTabs: infoTabs(user.username).map(tab => 
            tab.name === "Danced"
            ? {...tab, class: "details-tab active"}
            : {...tab, class: "details-tab"}
        ),
        info: "community"
      })
}]

const getProfileWantToDance = [ async(req,res,next) => {
    
    const profileUsername = req.params.username;
    const user = req.app.locals.users.filter(item => item.username === profileUsername)[0];;
    const currentUser = req.app.locals.currentUser;
    let userActions;
    let community;
    const mode = "view";
    if(user === currentUser){
        userActions = ownUserActions[mode](currentUser.username);
        community = req.app.locals.users.filter(item => user.wantToDance.includes(item.username));
    }else{
        userActions = otherUserActions(user.username)
        if(canView(user.preferences.visibility.network,currentUser,user)){
            community = req.app.locals.users.filter(item => user.wantToDance.includes(item.username));
        }else{
            community = null;
        }
    }

    res.render('profile', {
        title: 'Profile',
        user: user,
        currentUser: currentUser,
        community: community,
        userActions: userActions,
        userTabs: infoTabs(user.username).map(tab => 
            tab.name === "Want to Dance"
            ? {...tab, class: "details-tab active"}
            : {...tab, class: "details-tab"}
        ),
        info: "community"
    })
}]

const postFollow = [
    async (req,res,next) => {
        //Get user
        const followerUsername = req.body.username;
        const user = req.app.locals.users.filter(item => item.username === followerUsername)[0];
        const currentUser = req.app.locals.currentUser;
        //Send request
        user.followerRequest.push(currentUser.username);
        currentUser.followRequest.push(user.username);
        res.json({user: user, currentUser: currentUser});
        // res.redirect(`/community/${user.username}`);
    }
]

const postUnfollow = [
    async (req,res,next) => {
        //Get user
        const followerUsername = req.body.username;
        const user = req.app.locals.users.filter(item => item.username === followerUsername)[0];
        const currentUser = req.app.locals.currentUser;
        //Remove follower and update counts
        user.followedBy = user.followedBy.filter(item => item !== currentUser.username);
        user.totalFollowedBy -= 1;
        currentUser.following = currentUser.following.filter(item => item !== user.username);
        currentUser.totalFollowing -= 1;
        res.json({user: user, currentUser: currentUser})
        // res.redirect(`/community/${user.username}`);
    }
]

const postAcceptFollow = [
    async (req,res,next) => {
        //Get follower and current user
        const followerUsername = req.body.username;
        const user = req.app.locals.users.filter(item => item.username === followerUsername)[0];
        const currentUser = req.app.locals.currentUser;
        //Add follower, update follower count and remove request
        user.following.push(currentUser.username);
        user.totalFollowing += 1;
        user.followRequest = user.followRequest.filter(item => item !== currentUser.username);
        currentUser.followedBy.push(user.username);
        currentUser.totalFollowedBy += 1;
        currentUser.followerRequest = currentUser.followerRequest.filter(item => item !== user.username);
        res.json({user: user, currentUser: currentUser})
    }
]

const postDeclineFollow = [
    async (req,res,next) => {
        const followerUsername = req.body.username;
        const user = req.app.locals.users.filter(item => item.username === followerUsername)[0];
        const currentUser = req.app.locals.currentUser;
        user.followRequest = user.followRequest.filter(item => item !== currentUser.username);
        currentUser.followerRequest = currentUser.followerRequest.filter(item => item !== user.username);
        res.json({user: user, currentUser: currentUser})
    }
]

const postRemoveFollow = [
    async (req,res,next) => {
        const followerUsername = req.body.username;
        const user = req.app.locals.users.filter(item => item.username === followerUsername)[0];
        const currentUser = req.app.locals.currentUser;
        user.following = user.following.filter(item => item !== currentUser.username);
        user.totalFollowing -= 1;
        currentUser.followedBy = currentUser.followedBy.filter(item => item !== user.username);
        currentUser.totalFollowedBy -= 1;
        res.json({user: user, currentUser: currentUser})
    }
]

const postDanced = [
    async (req,res,next) => {
        const followerUsername = req.body.username;
        const user = req.app.locals.users.filter(item => item.username === followerUsername)[0];
        const currentUser = req.app.locals.currentUser;
        currentUser.danced.push(user.username);
        if(currentUser.wantToDance.includes(user.username)){
            currentUser.wantToDance = currentUser.wantToDance.filter(item => item.username !== user.username);
            currentUser.totalWantToDance -= 1;
        }
        currentUser.totalDanced += 1;
        res.json({user: user, currentUser:currentUser});
    }
]

const postWantToDance = [
    async (req,res,next) => {
        const followerUsername = req.body.username;
        const user = req.app.locals.users.filter(item => item.username === followerUsername)[0];
        const currentUser = req.app.locals.currentUser;
        currentUser.wantToDance.push(user.username);
        currentUser.totalWantToDance += 1;
        res.json({user: user, currentUser:currentUser});
        // res.redirect(`/community/${user.username}`);
    }
]

const postProfileEdit = [
    async (req,res,next) => {
        const data = req.body;
        const currentUser = req.app.locals.currentUser;
        let snsPlatforms;
        let snsUrls;
        if(Array.isArray(data['user-sns-platform'])){
            snsPlatforms = data['user-sns-platform'];
            snsUrls = data['user-sns-url'];
        }else{
            snsPlatforms = [data['user-sns-platform']];
            snsUrls = [data['user-sns-url']];
        };
        let userSns = [];
        snsPlatforms.forEach((platform,index) => {
            userSns.push({
                name: platform,
                url: snsUrls[index],
                faClass: snsFaClass[platform]
            })
        })
        let userStyles;
        if(Array.isArray(data['user-style'])){
            userStyles = data['user-style'].filter(style => style !== '').map(style => style.charAt(0).toUpperCase() + style.slice(1).toLowerCase());
        }else{
            userStyles = [data['user-style'].filter(style => style !== '').map(style => style.charAt(0).toUpperCase() + style.slice(1).toLowerCase())];
        }
        currentUser.name = data["user-name"];
        currentUser.nationality = data["user-nationality"];
        currentUser.location = data["user-location"];
        currentUser.greeting = data["user-greeting"];
        currentUser.bio = data["user-bio"];
        currentUser.sns = userSns;
        currentUser.style = userStyles;
        res.json({currentUser: currentUser});
    }   
]

const postSettings = [
    async (req,res,next) => {
        const data = req.body;
        const currentUser = req.app.locals.currentUser;
        currentUser.username = data["user-username"];
        currentUser.email = data["user-email"];
        if(data["user-password-new"] !== ""){
            currentUser.password = data["user-password-new"];
        }
        console.log(data["user-visibility-events"]);
        currentUser.preferences.visibility.events = +data["user-events-visibility"] === 1 ? "private" : "public";
        currentUser.preferences.visibility.network = +data["user-network-visibility"] === 1 ? "private" : "public";
        res.json({currentUser: currentUser});
    }
]
const postEditPicture = [
    upload.single('user-profile-pic'),
    async (req,res,next) => {
        const profilePic = req.file.buffer.toString('base64');
        const currentUser = req.app.locals.currentUser;
        currentUser.profilePic = `<img src="data:${req.file.mimetype};base64,${profilePic}" alt="${currentUser.username}">`;
        res.redirect(`/community/${currentUser.username}/edit`);
    }
]

const postDeletePicture = [
    async (req,res,next) => {
        const currentUser = req.app.locals.currentUser;
        currentUser.profilePic = "";
        res.redirect(`/community/${currentUser.username}/edit`);
    }
]

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
    postFollow,
    postUnfollow,
    postAcceptFollow,
    postDeclineFollow,
    postRemoveFollow,
    postDanced,
    postWantToDance,
    postAcceptFollow,
    postProfileEdit,
    postSettings,
    postEditPicture,
    postDeletePicture
};

export default communityController;