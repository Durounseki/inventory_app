const pool = require("./pool");

async function getAllEvents() {
    const { rows } = await pool.query("SELECT * FROM events ORDER BY date ASC");
    return rows;
};

async function getEvent(eventId){
    const { rows } = await pool.query(`SELECT * FROM events WHERE id = ${eventId}`);
    return rows[0];
}

const snsFaClass = {
    "website": "fa-solid fa-globe",
    "facebook": "fa-brands fa-square-facebook",
    "instagram": "fa-brands fa-instagram",
    "youtube": "fa-brands fa-youtube" 
};

async function createNewEvent(eventInfo,flyer){
    console.log(eventInfo);
    const eventName = eventInfo["event-name"];
    const eventDate = eventInfo["event-date"];
    const eventCountry = eventInfo["event-venue-country"];
    const eventCity = eventInfo["event-venue-city"];
    const eventVenue = {
        "name": eventInfo["event-venue-name"],
        "url": eventInfo["event-venue-url"]
    };
    const eventDescription = {
        "headline": eventInfo["event-headline"],
        "body": eventInfo["event-body"],
        "cta": eventInfo["event-cta"]
    };
    const eventSns = [];
    for (const [key, value] of Object.entries(eventInfo)) {
        if (key.startsWith('event-sns') && key.endsWith('platform')) {
            const index = key.match(/\d+/)[0]; // Extract the number from the key
            const urlKey = `event-sns-${index}-url`;

            eventSns.push({
                name: value.toLowerCase(),
                url: eventInfo[urlKey],
                faClass: snsFaClass[value.toLowerCase()]
            });
        }
    }
    const eventPicture = {
        "src": flyer.path.replace('public/',''),
        "alt": eventInfo["event-name"]
    };
    pool.query(
        'INSERT INTO events (name, date, country, city, venue, description, sns, flyer) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        [eventName, eventDate, eventCountry, eventCity, eventVenue, eventDescription, eventSns, eventPicture]
    );
    console.log('Event added successfully!');
}

module.exports = {
    getAllEvents,
    getEvent,
    createNewEvent
};