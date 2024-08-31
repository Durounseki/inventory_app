//Database
const db = require('../db/queries');

//Create index views

async function getHome(req, res){
    const events = await db.getAllEvents();
    console.log(events[0].venue)
    res.render("index",{title: "Home", events: events});
};

module.exports = {
    getHome,
}