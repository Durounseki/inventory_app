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
    res.render("events",{title: "Events", events: events, featuredEvent: events[0]});
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
    getEvent,
    getCreateEvent,
    postCreateEvent
}