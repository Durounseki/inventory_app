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
communityRouter.get("/verification/:tokenId", communityController.getVerification);
communityRouter.get("/verification", communityController.getVerification);
//Render forgot password page
communityRouter.get("/forgot-password", communityController.getForgotPassword);
communityRouter.get("/forgot-password", communityController.postForgotPassword);
//Render reset password page
communityRouter.get("/reset-password/:tokenId", communityController.getResetPassword);
communityRouter.get("/reset-password", communityController.getResetPassword);
communityRouter.post("/reset-password", communityController.postResetPassword);
//Render profile page
communityRouter.get("/profile", communityController.getProfile);

export default communityRouter;