const db = require("../models");
const Joi = require('joi');
const User = db.user;
const nodemailer = require('nodemailer');
const { required } = require("joi");
require('dotenv').config();
makeid = (length) => {
  var result = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() *
          charactersLength));
  }
  return result;
}

validateUser =(user) => {
  const JoiSchema = Joi.object({

      username: Joi.string()
          .required(),

      password: Joi.required(),
      email:Joi.required()

  }).options({
      abortEarly: false
  });

  return JoiSchema.validate(user)
}

validateSignInUser=(user)=>{
  const JoiSchema = Joi.object({

    email:Joi.required(),
    password: Joi.required()

}).options({
    abortEarly: false
});

return JoiSchema.validate(user)

}

verifyToken = (req, res, next) => {
  let token = req.headers["authorization"];

  if (!token) {
    return res.status(403).send({ message: "No token provided!" });
  }

  jwt.verify(token, config.secret, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "Unauthorized!" });
    }
    req.userId = decoded.id;
    next();
  });
};

var recieverName = [
  'raj',
  'yash',
  'rita',
  'jasmine'
]
let recieverNames = recieverName[Math.floor(Math.random() * recieverName.length)];

const transporter = nodemailer.createTransport({
  host: process.env.host,
  port: process.env.mailPort,
  secure: process.env.secure,
  requireTLS: process.env.requireTLS,
  service: process.env.service,
  auth: {
      user: process.env.user,
      pass: process.env.password,
  },
});

const validations = {
  makeid,
  recieverNames,
  validateUser,
  validateSignInUser,
  transporter,
  verifyToken
};

module.exports = validations;