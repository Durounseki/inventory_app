// const pool = require("./pool");
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient();

async function getAllEvents() {
    const events = await prisma.danceEvent.findMany({
        orderBy: {date: 'asc'}
    });
    console.log(events);
    return events;
};

async function getEvent(eventId){
    const event = await prisma.danceEvent.findUnique({
        where: {
            id: eventId
        }
    });

    return event;
}

const snsFaClass = {
    "website": "fa-solid fa-globe",
    "facebook": "fa-brands fa-square-facebook",
    "instagram": "fa-brands fa-instagram",
    "youtube": "fa-brands fa-youtube" 
};

async function createNewEvent(eventInfo,flyer){

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

    await prisma.danceEvent.create({
        data: {
            name: eventInfo["event-name"],
            date: new Date(eventInfo["event-date"]),
            country: eventInfo["event-venue-country"],
            city: eventInfo["event-venue-city"],
            venue: [{
                name: eventInfo["event-venue-name"],
                url: eventInfo["event-venue-url"]
            }],
            description: {
                headline: eventInfo["event-headline"],
                body: eventInfo["event-body"],
                cta: eventInfo["event-cta"]
            },
            sns: eventSns,
            flyer: {
                src: flyer.path.replace('public', ''),//The storage directory is set to uploads inside the public directory, but our configuration parses the public directory to the root
                alt: eventInfo["event-name"]
            },
            style: "Bachata"
        }
    })
    console.log(eventInfo);
    
    console.log('Event added successfully!');
}

async function searchEvent(country,style,date){
    const dateObj = new Date(date);
    const newDateObj = new Date(date);
    
    newDateObj.setMonth(newDateObj.getMonth() + 1)//One month later
    const events = await prisma.danceEvent.findMany({
        where: {
            country: country === '' ? undefined : {
                equals: country,
                mode: 'insensitive'
            },
            date: date === '' ? undefined : { 
                gte: dateObj, 
                lt: newDateObj
            },
            style: style === '' ? undefined : {
                has: style.charAt(0).toUpperCase() + style.slice(1)
            },
        },
        orderBy: {date: 'asc'}
    });

    return events;
}

module.exports = {
    getAllEvents,
    getEvent,
    createNewEvent,
    searchEvent
};