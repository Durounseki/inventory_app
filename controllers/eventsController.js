//Database
const db = require('../db/queries');
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

//Create event views

async function getEvents(req, res){
    const events = await db.getAllEvents();
    res.render("events",{title: "Events", events: events});
};

async function getCreateEvent(req, res){
    res.render("create-event",{title: "Create new event"});
}

const postCreateEvent = [
    upload.single('event-flyer'),
    async (req, res) => {
        const eventInfo = req.body;
        const eventName = eventInfo.eventName;
        const eventDescription = {
            "headline": eventInfo.eventHeadline,
            "body": eventInfo.eventBody,
            "cta": eventInfo.eventCta
        };
        const eventVenue = {
            "name": eventInfo.eventVenueName,
            "url": eventInfo.eventVenueUrl,
            "country": eventInfo.eventVenueCountry,
            "city": eventInfo.eventVenueCity
        };
        const eventDate = eventInfo.eventDate;
        const sns = [];
        for (const [key, value] of Object.entries(eventInfo)) {
            if (key.startsWith('eventSns') && key.endsWith('Platform')) {
            const index = key.match(/\d+/)[0]; // Extract the number from the key
            const urlKey = `eventSns${index}Url`;
    
            snsData.push({
                name: value.toLowerCase(),
                url: req.body[urlKey],
                faClass: snsFaClass[value.toLowerCase()] // Assuming you have this function
            });
            }
        }
        const eventPicture = {
            "src": req.file.path,
            "alt": eventInfo.eventName
        }
        console.log(eventInfo);
        res.json(req.file);
        // res.send(eventName);
    }
];

module.exports = {
    getEvents,
    getCreateEvent,
    postCreateEvent
}