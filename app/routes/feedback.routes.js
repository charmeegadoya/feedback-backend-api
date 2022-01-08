module.exports = app => {
const { verifySignUp } = require("../middlewares");
const feedback = require("../controllers/feedback.controller.js");
const controller = require("../controllers/auth.controller");
var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
var router = require("express").Router();
const multer = require("multer");
const path = require("path");
const upload=multer({dest:'uploads/'});

  app.use("/api", router,function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });
  // Create a new Feedback
  router.post("/create/", feedback.create);

  // Retrieve all Feedback
  router.get("/receiver/", feedback.findAll);

  router.post("/addReceiver/",upload.single('receiverImage'), feedback.addReciever);

  router.post("/auth/signup",upload.single('profileImage'),controller.signup);

  // [
  //   verifySignUp.checkDuplicateUsernameOrEmail,
  // ]

  router.post("/auth/signin", controller.signin);
  router.get("/auth/verify/:id", controller.verify);
  router.get("/auth/dashboard", controller.dashboard);
  // router.get("/auth/logout", controller.logout);
};