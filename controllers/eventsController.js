//Database
const db = require('../db/queries');

//Create index views


async function getEvents(req, res){
    const events = await db.getAllEvents();
    res.render("events",{title: "Events", events: events});
};

async function getCreateEvent(req, res){
    res.render("create-event",{title: "Create new event"});
}

module.exports = {
    getEvents,
    getCreateEvent
}