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
        const flyer = req.file;
        await db.createNewEvent(eventInfo,flyer);
        res.redirect("create");
    }
];

module.exports = {
    getEvents,
    getCreateEvent,
    postCreateEvent
}