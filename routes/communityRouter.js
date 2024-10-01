import { Router } from "express";
import communityController from "../controllers/communityController.js";
const communityRouter = Router();

//Render events page
communityRouter.get("/", communityController.showDashboard);
//Render login page
communityRouter.get("/login", communityController.getLogin);

//Render signup page
communityRouter.get("/signup", communityController.getSignup);
communityRouter.post("/signup", communityController.postSignup);
//Render verification route
communityRouter.get("/verification/:token", communityController.getVerification);
communityRouter.get("/verification", communityController.getVerification);

// //Search event
// communityRouter.post("/search", communityController.searchcommunity);

// //Render featured event
// communityRouter.get("/:id",communityController.getEvent);

export default communityRouter;