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
communityRouter.post("/forgot-password", communityController.postForgotPassword);
//Render reset password page
communityRouter.get("/reset-password/:tokenId", communityController.getResetPassword);
communityRouter.get("/reset-password", communityController.getResetPassword);
communityRouter.post("/reset-password", communityController.postResetPassword);
//Render profile page
communityRouter.get("/:username", communityController.getProfileAbout);
communityRouter.get("/:username/events", communityController.getProfileEvents);
communityRouter.get("/:username/edit", communityController.getProfileEdit);
communityRouter.post("/:username/edit", communityController.postProfileEdit);
communityRouter.get("/:username/settings", communityController.getProfileSettings);
communityRouter.post("/:username/settings", communityController.postSettings);
communityRouter.get("/:username/danced", communityController.getProfileDanced);
communityRouter.get("/:username/want-to-dance", communityController.getProfileWantToDance);
//Profile picture
communityRouter.post("/:username/edit-picture", communityController.postEditPicture);
communityRouter.post("/:username/delete-picture", communityController.postDeletePicture);
//Follow, Danced, Want to dance
communityRouter.post("/follow", communityController.postFollow);
communityRouter.post("/unfollow", communityController.postUnfollow);
communityRouter.post("/accept-follow", communityController.postAcceptFollow);
communityRouter.post("/decline-follow", communityController.postDeclineFollow);
communityRouter.post("/remove-follow", communityController.postRemoveFollow);
communityRouter.post("/danced", communityController.postDanced);
communityRouter.post("/want-to-dance", communityController.postWantToDance);

communityRouter.post("/changeUser", (req,res,next) => {
    req.app.locals.currentUser = req.app.locals.users.filter(user => user.username === req.body.username)
    res.json({currentUser: req.app.locals.currentUser});
})


export default communityRouter;