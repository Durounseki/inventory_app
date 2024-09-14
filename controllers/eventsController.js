//Database
const db = require('../db/queries');
//Dates
const dayjs = require('dayjs');
//Form validation
const { body, validationResult } = require("express-validator");
//Handle file uploads
// const multer = require('multer');
// //Set up storage
// const storage = multer.diskStorage({
//     destination: (req,file,cb) =>{
//         cb(null,'public/uploads/');
//     },
//     filename: (req, file, cb) => {
//         cb(null, Date.now() + '-' + file.originalname);
//     }
// });
// const upload = multer({storage: storage});
//EJS engine
const ejs = require('ejs');

//Create event views

async function getEvents(req, res){
    //Handle queries
    const country = req.query.country;
    const style =  req.query.style;
    const date = req.query.date;
    //Handle selected event
    const eventId = req.query.event;
    let events;
    let selectedEvent;
    if(country || style || date){
        events = await db.searchEvent(country,style,date);
        if(events.length === 0){
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
    res.render("create-event",{title: "Create new event", script: "create-event.js"});
}
//Define validators
const validateEvent = [
    //Check event name
    body("event-name").trim().notEmpty().withMessage('Please enter the event name')
    .isLength({max: 100}).withMessage('max 100 characters'),
    //Check country
    body("event-venue-country").trim().notEmpty().withMessage('Please enter the country where the event will be held')
    .isLength({max: 30}).withMessage('max 30 characters'),
    //Check city
    body("event-venue-city").trim().notEmpty().withMessage('Please enter the city where the event will be held')
    .isLength({max: 30}).withMessage('max 30 characters'),
    //Check venue
    body("event-venue-name").trim().notEmpty().withMessage('Please enter the venue name')
    .isLength({min: 1, max: 50}).withMessage('max 50 characters'),
    //Check location
    body("event-venue-url").trim().isURL().withMessage('Please enter a valid URL'),
    //Check date
    body("event-date").notEmpty().withMessage('Please enter when the event starts'),
    //Check sns. We use a custom validator since the number of fields event-sns-*-url is variable
    body("*").custom((value,{req,location,path}) => {
        if (path.match(/^event-sns-\d+-url$/)){
            try{
                const url = new URL(value);
                return true
            }catch{
                throw new Error('Please enter a valid URL')
            }
        }
        return true
    })

]

//Create new event
const postCreateEvent = [
    validateEvent,
    // upload.single('event-flyer'),
    async (req, res) => {
        
        const eventInfo = req.body;
        const errors = validationResult(req);
        
        if(!errors.isEmpty()){
            return res.status(400).json({info: eventInfo, errors: errors});
        }
        res.send("No errors");
        // const flyer = req.file;
        // await db.createNewEvent(eventInfo,flyer);
        // res.redirect("create");
    }
];

//Search event
async function searchByCountry(req, res){
    const country = req.body.country;
    const newUrl = `/events?country=${encodeURIComponent(country)}`;
    res.redirect(newUrl);
}

//Filter event
async function searchEvents(req, res){
    const country = encodeURIComponent(req.body['country-search']);
    const date = encodeURIComponent(req.body['date-search']);
    console.log(date);
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
    searchByCountry,
    searchEvents
}