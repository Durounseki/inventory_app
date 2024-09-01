//Database
const db = require('../db/queries');
//Dates
const dayjs = require('dayjs');
//Form validation
const { body, validationResult } = require("express-validator");
//Handle file uploads
const multer = require('multer');
//Set up storage
const storage = multer.diskStorage({
    destination: (req,file,cb) =>{
        cb(null,'public/uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({storage: storage});
//EJS engine
const ejs = require('ejs');

//Create event views

async function getEvents(req, res){
    const events = await db.getAllEvents();
    const eventId = req.query.event;
    let selectedEvent;
    if(eventId){
        selectedEvent = await db.getEvent(eventId);
    }else{
        //For the moment let's render the earliest coming event the first time the page is load
        return res.redirect(302,`/events?event=${events[0].id}`);
    }
    
    res.render("events",{title: "Events", events: events, featuredEvent: selectedEvent});
};

async function getEvent(req, res){
    const eventRow = await db.getEvent(req.params.id);
    ejs.renderFile(process.cwd() + '/views/partials/event_info.ejs',{event: eventRow, dayjs: dayjs},{},(err, eventInfoHTML) => {
        if(err) {
            console.error('Error rendering template:', err);
            res.status(500).send('Internal Server Error');
        }else{
            res.send(eventInfoHTML);
        }
    });
};

async function getCreateEvent(req, res){
    res.render("create-event",{title: "Create new event"});
}

//Create new event
const postCreateEvent = [
    upload.single('event-flyer'),
    async (req, res) => {
        const eventInfo = req.body;
        const flyer = req.file;
        await db.createNewEvent(eventInfo,flyer);
        res.redirect("create");
    }
];

//Search event
async function searchByCountry(req, res){
    const country = req.body.country;
    const foundEvents = await db.searchByCountry(country);
    res.render("events",{title: "Events", events: foundEvents, featuredEvent: foundEvents[0]});
}

//Edit event

//Delete event

module.exports = {
    getEvents,
    getEvent,
    getCreateEvent,
    postCreateEvent,
    searchByCountry
}