import express from "express";
import homePageController from "../controllers/homePageController";
import registerController from "../controllers/registerController";
import loginController from "../controllers/loginController";
import optionsController from "../controllers/optionsController";
import monitoringPageController from "../controllers/monitoringPageController";
import auth from "../validation/authValidation";
import passport from "passport";
import initPassportLocal from "../controllers/passportLocalController";

// Init all passport
initPassportLocal();

//Init router and save as variable
let router = express.Router();

let initWebRoutes = (app) => {
    router.get("/", loginController.checkLoggedIn, homePageController.handleHomepage);
    router.get("/login",loginController.checkLoggedOut, loginController.getPageLogin);
    router.post("/login", passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/login",
        successFlash: true,
        failureFlash: true
    }));

    //router.get("/register", registerController.getPageRegister);
    //router.post("/register", auth.validateRegister, registerController.createNewUser);
    router.post("/logout", loginController.postLogOut);

    router.post("/setOptions", optionsController.setOptions);
    router.post("/startInstance", optionsController.startInstance);
    router.post("/stopInstance", optionsController.stopInstance);

    router.post("/filesUploaded", optionsController.filesUploaded);
    router.post("/submitFiles", optionsController.submitFiles)
    router.post("/nextcloudUpload", optionsController.nextcloudUpload);

    router.post("/introDone", optionsController.introDone);

    router.post("/offboard", optionsController.offboard);

    router.get("/monitoring", monitoringPageController.handleMonitoring);

    return app.use("/", router);
};
module.exports = initWebRoutes;
