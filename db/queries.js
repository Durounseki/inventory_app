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

    let snsPlatforms;
    let snsUrls;
    if(Array.isArray(eventInfo['event-sns-platform'])){
        snsPlatforms = eventInfo['event-sns-platform'];
        snsUrls = eventInfo['event-sns-url'];
    }else{
        snsPlatforms = [eventInfo['event-sns-platform']];
        snsUrls = [eventInfo['event-sns-url']];
    };
    let eventSns = [];
    snsPlatforms.forEach((platform,index) => {
        eventSns.push({
            name: platform,
            url: snsUrls[index],
            faClass: snsFaClass[platform]
        })
    })
    let eventStyles;
    if(Array.isArray(eventInfo['event-style'])){
        eventStyles = eventInfo['event-style'];
    }else{
        eventStyles = [eventInfo['event-style']];
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
            style: eventStyles
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