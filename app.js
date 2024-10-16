// Load environment variables
import * as dotenv from 'dotenv'; 
dotenv.config();
import express from 'express';
const app = express();
import path from 'node:path';
const __dirname = import.meta.dirname;

//Frontend update
import browserSync from 'browser-sync';

//CORS
import cors from 'cors';
const PORT = process.env.PORT || 3000;
const corsOptions = {
    origin: 'http://localhost:'+PORT,
    credentials: true,
}
app.use(cors(corsOptions));

//Session
import session from 'express-session';
import {PrismaSessionStore} from '@quixo3/prisma-session-store';
import prisma from './db/client.js';
import flash from 'connect-flash';

const store = new PrismaSessionStore(
    prisma,
    {
      dbRecordIdIsSessionId: true,
      dbRecordIdFunction: undefined,
    }
  )
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        store: store,
        cookie: {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: 60*60*1000 //one hour validity
        },
    })
);

app.use(flash());

//Authentication
import passport from 'passport';
import LocalStrategy from 'passport-local';
import bcrypt from 'bcrypt';
app.use(passport.session());
const localStrategy = new LocalStrategy(
    {
        usernameField: 'user-email',
        passwordField: 'user-password'
    },
    async(username, password, done) => {
        try{
            const user = await prisma.users.findUnique({where: {email: username}});
            if(!user){
                return done(null,false,{message: 'userNotFound'});
            }
            const match = await bcrypt.compare(password, user.password);
            if(!match){
                return done(null, false, {message: 'passwordMismatch'})
            }
            return done(null, user);
        }catch(error){
            return done(error);
        }
    }
)

passport.use(localStrategy);
passport.serializeUser((user,done) => {
    done(null,user.id);
});
passport.deserializeUser(async(id,done)=>{
    try{
        const user = await prisma.users.findUnique({where: {id}});
        done(null, user);
    }catch(error){
        done(error);
    }
})

//Test data
import {users, events} from './db/test_data.js'
app.use((req,res,next) => {
    req.app.locals.users = users;
    req.app.locals.events = events;
    req.app.locals.currentUser = users[0];
    next();
});

// Routers
import indexRouter from "./routes/indexRouter.js"; // Assuming .js extension
import eventsRouter from "./routes/eventsRouter.js"; 
import communityRouter from "./routes/communityRouter.js"

// Set the url encoder to handle form post request
app.use(express.urlencoded({ extended: true }));

// Set the root directory of the templates in views
app.set("views", path.join(__dirname, "views"));

// Enable layout support through extend('layout')
import expressEjsExtend from 'express-ejs-extend'; 
app.engine('ejs', expressEjsExtend);

// Enable EJS as view engine
app.set("view engine", "ejs");

// Set the directory for static assets
const assetsPath = path.join(__dirname, "public");
app.use(express.static(assetsPath));

// Date formatting
import dayjs from 'dayjs';
app.use((req,res,next) => {
    res.locals.dayjs = dayjs;
    next();
});

//Render the views
//Header
//Logo
const mainLogo = {
    src: "/images/the-dance-thread-logo-dark.png",
    alt: "The Dance Thread"
};

//Navigation links
const navLinks = [
    {href: "/", text: "Home" },
    {href: "/events", text: "Events"},
    {href: "/community", text: "Community"},
];

//Github link
const gitHubLink = {
    href: "https://github.com/Durounseki",
    aria: "GitHub profile of Durounseki",
    faClass: "fa-brands fa-github",
    text: "Durounseki"
}

app.use( (req,res,next) => {
    res.locals.mainLogo = mainLogo;
    res.locals.navLinks = navLinks;
    res.locals.gitHubLink = gitHubLink;
    next();
});


//Home
app.use("/",indexRouter);
//Events
app.use("/events",eventsRouter);
//Community
app.use("/community",communityRouter);


app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}!`);
    browserSync.init({
        files: [
            '**/*.ejs',
            'public/**/*'
        ],
        proxy: `localhost:${PORT}`,
        open: false
    });
});