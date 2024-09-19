require("dotenv").config();
//Database
const db = require('../db/queries');
//Dates
const dayjs = require('dayjs');
//Form validation
const { body, validationResult } = require("express-validator");
//Handle file uploads
const multer = require('multer');
//Resize and convert images
const sharp = require('sharp');
//Set up storage
const storage = multer.memoryStorage()
//Configure cloud storage
const upload = multer({storage: storage});
const { S3Client, PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");

const bucketName = process.env.BUCKET_NAME
const bucketRegion = process.env.BUCKET_REGION
const accessKey = process.env.ACCESS_KEY
const secretAccessKey = process.env.SECRET_ACCESS_KEY

const s3 = new S3Client({
    credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretAccessKey
    },
    region: bucketRegion
});
//Encrypt file name
const crypto = require('crypto');
const randomImageName = (bytes = 32) => crypto.randomBytes(bytes).toString('hex')
//Configure server to download image using cdn CloudFront
const { getSignedUrl } = require('@aws-sdk/cloudfront-signer');

//EJS engine
const ejs = require('ejs');

//fetch images
async function getImageUrl(event){
    const url = await getSignedUrl({
        url: "https://drzqbwsxiz2uk.cloudfront.net/"+event.flyer.src,
        dateLessThan: new Date(Date.now() + 1000*60*60*24),
        privateKey: process.env.CLOUDFRONT_PRIVATE_KEY,
        keyPairId: process.env.CLOUDFRONT_KEY_PAIR_ID
    })
    event.flyer.src = url
}
//Create event views

async function getEvents(req, res){
    //Handle queries
    const country = req.query.country;
    const style =  req.query.style;
    const date = req.query.date;
    // Handle selected event
    const eventId = req.query.event;
    let events;
    let selectedEvent;
    if(country || style || date){
        events = await db.searchEvent(country,style,date);
        events.forEach(async (event) => await getImageUrl(event));
        if(events.length === 0){
            //If no events are found, there is no featured event, in this case show not found message
            return res.render("events",{title: "Events", script: "events.js", country: country, style: style, date: date});
        }
        if(eventId){
            selectedEvent = await db.getEvent(eventId);
            await getImageUrl(selectedEvent);
        }else{
            //For the moment let's render the earliest coming event the first time the page is load
            return res.redirect(302,req.originalUrl+`&event=${events[0].id}`);
        }
    }else{
        events = await db.getAllEvents();
        events.forEach(async (event) => await getImageUrl(event));
        if(eventId){
            selectedEvent = await db.getEvent(eventId);
            await getImageUrl(selectedEvent);
        }else{
            return res.redirect(302,req.originalUrl+`?event=${events[0].id}`);
        }
    }
    
    res.render("events",{title: "Events", script: "events.js", events: events, country: country, style: style, date: date, featuredEvent: selectedEvent});
};

async function getEvent(req, res){
    const selectedEvent = await db.getEvent(req.params.id);
    await getImageUrl(selectedEvent);
    ejs.renderFile(process.cwd() + '/views/partials/event_info.ejs',{event: selectedEvent, dayjs: dayjs},{},(err, eventInfoHTML) => {
        if(err) {
            console.error('Error rendering template:', err);
            res.status(500).send('Internal Server Error');
        }else{
            res.send(eventInfoHTML);
        }
    });
};

async function getCreateEvent(req, res){
    res.render("create-event",{title: "Create new event", script: "create-event.js"});
}

const snsFaClass = {
    "website": "fa-solid fa-globe",
    "facebook": "fa-brands fa-square-facebook",
    "instagram": "fa-brands fa-instagram",
    "youtube": "fa-brands fa-youtube" 
};
//Define validators
const validateEvent = [
    //Check event name
    body("event-name").trim().notEmpty().withMessage('Please enter the event name')
    .isLength({max: 100}).withMessage('max 100 characters'),
    //Check country
    body("event-venue-country").trim().notEmpty().withMessage('Please enter the country where the event will be held')
    .isLength({max: 30}).withMessage('max 30 characters'),
    //Check city
    body("event-venue-city").trim().notEmpty().withMessage('Please enter the city where the event will be held')
    .isLength({max: 30}).withMessage('max 30 characters'),
    //Check venue
    body("event-venue-name").trim().notEmpty().withMessage('Please enter the venue name')
    .isLength({min: 1, max: 50}).withMessage('max 50 characters'),
    //Check location
    body("event-venue-url").optional({values: 'falsy'}).trim().isURL().withMessage('Please enter a valid URL'),
    //Check date
    body("event-date").notEmpty().withMessage('Please enter when the event starts'),
    //Check sns. We use a custom validator since the number of fields event-sns-*-url is variable
    body("event-sns-url").custom((value,{req,location,path}) => {
        try{
            const url = new URL(value);
            return true
        }catch{
            throw new Error('Please enter a valid URL')
        }
        return true
    })
]

//Resize and convert
async function resizeAndConvertJPEG(inputImage,maxWidth,maxHeight,format,quality=100){
    try{
        const image = sharp(inputImage);
        let resizedImage;
        let outputImage;
        const metadata = await sharp(inputImage).metadata();
        //Check if image is smaller than max resolution
        if(metadata.width >= maxWidth && metadata.height >= maxHeight) {
            resizedImage = sharp(await image.resize(maxWidth,maxHeight,{
                fit: 'inside',
                quality: quality,
                withoutEnlargement: true
            }).toBuffer());
        }else{
            resizedImage = image;
        }
        //Avoid quality loss when the original file is jpeg
        if(metadata.format !== format){
            outputImage = await resizedImage.toFormat(format,{quality: quality}).toBuffer();
        }else{
            outputImage = await resizedImage.toBuffer();
        }
        console.log('Image processed successfully!');
        return outputImage;
    }catch(error){
        console.error('Error processing image: ',error);
        return undefined;
    }
}

//Create new event
const postCreateEvent = [
    upload.single('event-flyer'),
    validateEvent,
    async (req, res) => {
        const eventInfo = req.body;
        const errors = validationResult(req);
        const flyer = req.file;
        //Check for file errors
        if(!flyer){
            errors.errors.push({
                location: 'body',
                msg: 'No flyer uploaded',
                param: 'event-flyer',
                value: ''
            });
        }else if(!flyer.mimetype.startsWith('image/')){
            errors.errors.push({
                location: 'body',
                msg: 'Invalid file type. Please upload an image.',
                param: 'event-flyer',
                value: flyer.mimetype
            });
        }else if(flyer.size > 5*1024*1024){//Limit image size to 1MB
            errors.errors.push({
                location: 'body',
                msg: 'File size exceeds 5MB limit',
                param: 'event-flyer',
                value: flyer.size
            })
        }
        if(!errors.isEmpty()){
            return res.status(400).json({info: eventInfo, errors: errors.errors});
        }
        
        // const imageName = randomImageName();
        // const params = {
        //     Bucket: bucketName,
        //     Key: imageName,
        //     Body: flyer.buffer,
        //     ContentType: flyer.mimetype,
        // }
        // const command = new PutObjectCommand(params);
        // try{
        //     await s3.send(command);
        //     console.log('File uploaded');
        // }
        // catch(err){
        //     console.error(err)
        // }

        //Resize image
        // const outputImage = await resizeAndConvertJPEG(flyer.buffer, 1024, 1024, 'webp',100);
        const imageName = randomImageName();
        const params = {
            Bucket: bucketName,
            Key: imageName,
            Body: flyer.buffer,
            ContentType: 'webp',
        }
        const command = new PutObjectCommand(params);
        try{
            await s3.send(command);
            console.log('File uploaded');
        }
        catch(err){
            console.error(err)
        }
        
        // try{
        //     const base64Image = flyer.buffer.toString('base64');
        //     const imageUrl = `data:image/jpeg;base64,${base64Image}`;
        //     const base64ProcessedImage = outputImage.toString('base64');
        //     const processedImageUrl = `data:image/jpeg;base64,${base64ProcessedImage}`;
        //     res.send(`
        //     <div style="display: flex">
        //         <img src="${imageUrl}" style="max-width: 600; max-height: 600px">
        //         <img src="${processedImageUrl}">
        //     <div/>
        //     `)
        // }catch(error){
        //     console.error("Error rendering image: ", error);
        // }
        
        // await db.createNewEvent(eventInfo,imageName);
        res.redirect("create");
    }
];


//Filter event
async function searchEvents(req, res){
    const country = encodeURIComponent(req.body['country-search']);
    const date = encodeURIComponent(req.body['date-search']);
    const style = encodeURIComponent(req.body['style-search']);
    const newUrl = `/events?country=${country}&style=${style}&date=${date}`;
    res.redirect(302,newUrl);
}

//Edit event

//Delete event

module.exports = {
    getEvents,
    getEvent,
    getCreateEvent,
    postCreateEvent,
    searchEvents
}