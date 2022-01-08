const db = require("../models");
const Tutorial = db.tutorials;
const Rec = db.receiver;
const User = db.user;
var jwt = require("jsonwebtoken");
const { makeid, recieverNames } = require("../middlewares/validations");
const multer = require("multer");
const upload=multer({dest:'uploads/'});
// Create and Save a new Feedback
exports.create = async (req, res) => {
    // Validate request
    if (!req.body.receiverId) {
        res.status(400).send({
            message: "Content can not be empty!"
        });
        return;
    }

    await Rec.findOne({
            id: req.body.receiverId
        }).then(data => {
            // console.log(data);
            User.findOne({
                    email: req.body.logedin
                }).then(data => {
                    // console.log(req.body);
                    Tutorial.find({
                            $and: [{
                                    receiverId: req.body.receiverId
                                },
                                {
                                    logedin: req.body.logedin
                                }
                            ]
                        }).then(data => {
                            if (!data) {
                                res.status(400).send({
                                    message: "data already exists"
                                });
                            } else {
                                // Create a Feedback
                                const tutorial = new Tutorial({
                                    receiverId: req.body.receiverId,
                                    feedback: req.body.feedback,
                                    logedin: req.body.logedin
                                });
                                tutorial
                                    .save(tutorial)
                                    .then(data => {
                                        res.send(data);
                                    })
                                    .catch(err => {
                                        res.status(500).send({
                                            message: err.message || "Some error occurred while creating the Tutorial."
                                        });
                                    });

                            }


                        })
                        .catch(data => {

                        })


                })
                .catch(data => {

                })

        })
        .catch(data => {

        })


};

// Retrieve all Recivers from the database.
exports.findAll = (req, res) => {
    Rec.find()
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving feedback."
            });
        });

};

// Add new Recivers with unique id in the database.
exports.addReciever = (req, res) => {
    if(!req.file){
        return res.status(400).send({message:"please upload the file "});
    }else if(req.file.mimetype!='image/png'){
        return res.status(400).send({message:"please upload the image png file format only "});
    }else{
        const receiver = new Rec({
            username: recieverNames,
            receiverId: makeid(5),
            profileImage:req.file.path
        });
    
        receiver
            .save(receiver)
            .then(data => {
                res.send(data);
            })
            .catch(err => {
                res.status(500).send({
                    message: err.message || "Some error occurred while creating the receiver list."
                });
            });

    }

}

