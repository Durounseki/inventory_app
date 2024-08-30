const { Router } = require("express");
const eventsController = require("../controllers/eventsController");
const eventsRouter = Router();

//Render homepage
eventsRouter.get("/", eventsController.getEvents);

module.exports = eventsRouter;