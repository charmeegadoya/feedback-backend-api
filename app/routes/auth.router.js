const { verifySignUp } = require("../middlewares");
const controller = require("../controllers/auth.controller");
const multer = require("multer");
const path = require("path");
const upload=multer({dest:'uploads/'});
module.exports = function(app) {

  app.post("/api/auth/signup",upload.single('profileImage'),controller.signup);

  app.post("/api/auth/signin", controller.signin);
  app.get('/api/auth/verify/:id', controller.verify);
  app.get('/api/auth/dashboard', controller.dashboard);
 
};