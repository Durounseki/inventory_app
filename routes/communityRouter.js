import { Router } from "express";
import communityController from "../controllers/communityController.js";
const communityRouter = Router();

//Render events page
communityRouter.get("/", communityController.showDashboard);
//Render login page
communityRouter.get("/login", communityController.getLogin);
communityRouter.post("/login", communityController.postLogin);
//Render signup page
communityRouter.get("/signup", communityController.getSignup);
communityRouter.post("/signup", communityController.postSignup);
//Render verification route
communityRouter.get("/verification/:token", communityController.getVerification);
communityRouter.get("/verification", communityController.getVerification);
//Render profile page
communityRouter.get("/profile", communityController.getProfile);

export default communityRouter;