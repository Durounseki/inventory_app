//Database
const db = require('../db/queries');

//Create index views


async function getEvents(req, res){
    const events = await db.getAllEvents();
    res.render("events",{title: "Events", events: events});
};

module.exports = {
    getEvents,
}