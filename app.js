// Load environment variables
import * as dotenv from 'dotenv'; 
dotenv.config();

import express from 'express';
const app = express();
import path from 'node:path';
const __dirname = import.meta.dirname;

// Routers
import indexRouter from "./routes/indexRouter.js"; // Assuming .js extension
import eventsRouter from "./routes/eventsRouter.js"; 

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
    {href: "/artists", text: "Artists"},
    {href: "/djs", text: "DJs"},
    {href: "/about", text: "About" },
    {href: "/contact", text: "Contact"},
];

//Github link
const profileLink = {
    href: "https://github.com/Durounseki",
    aria: "GitHub profile of Durounseki",
    faClass: "fa-brands fa-github",
    text: "Durounseki"
}

app.use( (req,res,next) => {
    res.locals.mainLogo = mainLogo;
    res.locals.navLinks = navLinks;
    res.locals.profileLink = profileLink;
    next();
});


//Home
app.use("/",indexRouter);
//Events
app.use("/events",eventsRouter);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`App listening on port ${PORT}!`));