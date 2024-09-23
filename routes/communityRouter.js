const { Router } = require("express");
const communityController = require("../controllers/communityController.js");
const communityRouter = Router();

//Render events page
communityRouter.get("/", communityController.showDashboard);
// //Render create event
// communityRouter.get("/create", communityController.getCreateEvent);
// communityRouter.post("/create", communityController.postCreateEvent);
// //Search event
// communityRouter.post("/search", communityController.searchcommunity);

// //Render featured event
// communityRouter.get("/:id",communityController.getEvent);

module.exports = communityRouter;