const pool = require("./pool");

async function getAllEvents() {
    const { rows } = await pool.query("SELECT * FROM events");
    return rows;
};

const snsFaClass = {
    "website": "fa-solid fa-globe",
    "facebook": "fa-brands fa-square-facebook",
    "instagram": "fa-brands fa-instagram",
    "youtube": "fa-brands fa-youtube" 
};

async function createNewEvent(eventInfo,flyer){
    console.log(eventInfo);
    const eventName = eventInfo["event-name"];
    const eventDescription = {
        "headline": eventInfo["event-headline"],
        "body": eventInfo["event-body"],
        "cta": eventInfo["event-cta"]
    };
    const eventVenue = {
        "name": eventInfo["event-venue-name"],
        "url": eventInfo["event-venue-url"],
        "country": eventInfo["event-venue-country"],
        "city": eventInfo["event-venue-city"]
    };
    const eventDate = eventInfo["event-date"];
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
    console.log(
        "name: "+eventName,
        "description: " + eventDescription, 
        "venue: " + eventVenue,
        "date: " + eventDate,
        "sns: " + eventSns,
        "flyer: " + eventPicture
    );
    pool.query(
        'INSERT INTO events (name, description, venue, date, sns, flyer) VALUES ($1, $2, $3, $4, $5, $6)',
        [eventName, eventDescription, eventVenue, eventDate, eventSns, eventPicture]
    );
    console.log('Event added successfully!');
}

module.exports = {
    getAllEvents,
    createNewEvent
};