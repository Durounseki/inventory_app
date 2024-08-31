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

async function createNewEvent(eventInfo){
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
        "src": eventInfo.eventFlyer,
        "alt": eventInfo.eventName
    }

}

module.exports = {
    getAllEvents,
    createNewEvent
};