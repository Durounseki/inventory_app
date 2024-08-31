const { Router } = require("express");
const eventsController = require("../controllers/eventsController");
const eventsRouter = Router();

//Render events page
eventsRouter.get("/", eventsController.getEvents);
//Render create event
eventsRouter.get("/create", eventsController.getCreateEvent);
eventsRouter.post("/create", eventsController.postCreateEvent);

module.exports = eventsRouter;