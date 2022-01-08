const config = require("../config/auth.config");
const db = require("../models");
const nodemailer = require('nodemailer');
require('dotenv').config();
const User = db.user;
const Feedback = db.tutorials;
var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
const { validateUser,transporter,validateSignInUser } = require("../middlewares/validations");
// const { user } = require("../models");
exports.signup = async (req, res) => {
    const email= req.body.email

    response = validateUser(req.body)

    if (response.error) {
        return res.status(404).send({
            accessToken: null,
            message: response.error.details
        });
    } 

    // Check we have an email
    if (!email) {
        return res.status(422).send({
            message: "Missing email."
        });
    }

    if(!req.file){
        return res.status(400).send({message:"please upload the file "});
    }

    if(req.file.mimetype!='image/png'){
        return res.status(400).send({message:"please upload the image png file format only "});
    }

    try {
        // Check if the email is in use
        const existingUser = await User.findOne({
            email
        }).exec();
        if (existingUser) {
            return res.status(409).send({
                message: "Email is already in use."
            });
        }
       
        const user = await new User({
            username: req.body.username,
            email: req.body.email,
            password: bcrypt.hashSync(req.body.password, 8),
            verified: false,
            profileImage:req.file.path
        });
        user.save(user).then(data => {
                var verificationToken = jwt.sign({
                    id: user.email
                }, config.secret, {
                    expiresIn: 86400 // 24 hours
                });
                const url = `http://localhost:8080/api/auth/verify/${verificationToken}`;
                transporter.sendMail({
                    from: 'willjackie94@gmail.com',
                    to: email,
                    subject: 'Verify Account',
                    html: `Click <a href = '${url}'>here</a> to confirm your email.`
                })

                return res.status(201).send({
                    message: `Sent a verification email to ${email}`
                });
                
            })
            .catch(err => {
                res.status(500).send({
                    message: err.message || "Some error occurred while creating the Tutorial."
                });
            });

        // Step 1 - Create and save the user


        // Step 2 - Generate a verification token with the user's ID

        //const verificationToken = user.generateVerificationToken();
        // Step 3 - Email the user a unique verification link


    } catch (err) {
        return res.status(500).send(err);
    }

};

exports.signin = async (req, res) => {
    response = validateSignInUser(req.body)

    if (response.error) {
        return res.status(404).send({
            accessToken: null,
            message: response.error.details
        });
    } else {

        var token = jwt.sign({
            id: req.body.email
        }, config.secret, {
            expiresIn: 86400 // 24 hours
        });
        User.findOne({
                email: req.body.email
            }).then(data => {
                var passwordIsValid = bcrypt.compareSync(
                    req.body.password,
                    data.password
                );

                if (!passwordIsValid) {
                    return res.status(404).send({
                        accessToken: null,
                        message: "invalid password"
                    });
                } else if (!data) {
                    return res.status(404).send({
                        accessToken: null,
                        message: "invalid user"
                    });
                } else if (data.verified == false) {
                    return res.status(404).send({
                        accessToken: null,
                        message: "please verify your account"
                    });

                } else {
                    res.status(404).send({
                        accessToken: token,
                        message: "successfully login"
                    });
                }
            })
            .catch(err => {
                res
                    .status(500)
                    .send({
                        message: "Error retrieving feedbacks with username=" + req.body.username
                    });
            });

    }
};

exports.verify = async (req, res) => {
    const token = req.params.id;
    //Check we have an id
    if (!token) {
        return res.status(422).send({
            message: "Missing Token"
        });
    }
    // Step 1 -  Verify the token from the URL
    let payload = null
    try {
        payload = jwt.verify(
            token,
            "charmee-secret-key"
        );

    } catch (err) {
        return res.status(500).send(err);
    }
    try {
        // Step 2 - Find user with matching ID
        const user = await User.findOne({
            email: payload.id
        }).exec();
        if (!user) {
            return res.status(404).send({
                message: "User does not  exists"
            });
        }
        // // Step 3 - Update user verification status to true

        User.updateOne({
                email: payload.id
            }, {
                $set: {
                    "verified": true
                }
            })
            .then(data => {
                //res.cookie('auth',token);
                if (!data) {
                    res.status(404).send({
                        message: `Cannot update user with id=${email}. Maybe user was not found!`
                    });
                } else res.send({
                    message: "user verifird successfully"
                });
            })
            .catch(err => {
                res.status(500).send({
                    message: "Error updating user with id=" + email
                });
            });

    } catch (err) {
        return res.status(500).send(err);
    }
}

exports.dashboard = async (req, res) => {
    //let token = req.cookies.auth;
    let token=req.headers['authorization'];
    if (!token) {
        return res.status(403).send({
            message: "No token provided!"
        });
    }
    try {
        
        let payload = null
        try {
            payload = jwt.verify(
                token,
                "charmee-secret-key"
            );
           
            User.findOne({
                    email: payload.id
                })
                .then(data => {
                    if (!data) {
                        res.status(404).send({
                            message: `Cannot get user data with id=${email}. Maybe user was not found!`
                        });
                    } else{
                        Feedback.find({logedin:payload.id})
                        .then(data => {
                            if(!data){
                                res.send({
                                    message: {username:data.logedin,"feedback-list":"not found feedbacks","logout":"http://localhost:8080/api/auth/logout/","token":token}
                                });

                            }else{
                                res.send({
                                    message: {username:data.logedin,"feedback-list":data,"logout":"http://localhost:8080/api/auth/logout/","token":token}
                                });

                            }
                            
                        })
                        .catch(err => {
                            res.status(500).send({
                                message: "Error retriveing feedback with id=" + payload.id
                            });
                        });

                    } 
                  
                })
                .catch(err => {
                    res.status(500).send({
                        message: "Error retriveing user with id=" + payload
                    });
                });
           
        } catch (err) {
            return res.status(500).send(err);
        }

    } catch (err) {
        return res.status(500).send(err);
    }

};

