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
    // //Get all events from db
    // const events = await db.getAllEvents();
    //Handle queries
    const country = req.query.country;
    const style =  req.query.style;
    const date = req.query.date;
    // Handle selected event
    const eventId = req.query.event;
    let events;
    let selectedEvent;
    if(country || style || date){
        events = await db.searchEvent(country,style,date);
        if(events.length === 0){
            //If no events are found, there is no featured event, in this case show not found message
            return res.render("events",{title: "Events", script: "events.js", country: country, style: style, date: date});
        }
        if(eventId){
            selectedEvent = await db.getEvent(eventId);
        }else{
            //For the moment let's render the earliest coming event the first time the page is load
            return res.redirect(302,req.originalUrl+`&event=${events[0].id}`);
        }
    }else{
        events = await db.getAllEvents();
        if(eventId){
            selectedEvent = await db.getEvent(eventId);
        }else{
            return res.redirect(302,req.originalUrl+`?event=${events[0].id}`);
        }
    }
    
    res.render("events",{title: "Events", script: "events.js", events: events, country: country, style: style, date: date, featuredEvent: selectedEvent});
};

async function getEvent(req, res){
    const selectedEvent = await db.getEvent(req.params.id);
    // res.json(event);
    ejs.renderFile(process.cwd() + '/views/partials/event_info.ejs',{event: selectedEvent, dayjs: dayjs},{},(err, eventInfoHTML) => {
        if(err) {
            console.error('Error rendering template:', err);
            res.status(500).send('Internal Server Error');
        }else{
            res.send(eventInfoHTML);
        }
    });
};

async function getCreateEvent(req, res){
    res.render("create-event",{title: "Create new event", script: "create-event.js"});
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


//Filter event
async function searchEvents(req, res){
    const country = encodeURIComponent(req.body['country-search']);
    const date = encodeURIComponent(req.body['date-search']);
    const style = encodeURIComponent(req.body['style-search']);
    const newUrl = `/events?country=${country}&style=${style}&date=${date}`;
    res.redirect(302,newUrl);
}

//Edit event

//Delete event

module.exports = {
    getEvents,
    getEvent,
    getCreateEvent,
    postCreateEvent,
    searchEvents
}