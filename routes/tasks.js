const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/users");
const multer = require("multer");
const bcrypt = require("bcrypt");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads');
    },
    filename: function (req, file, cb) {
        cb(null, new Date().toISOString() + file.originalname);
    }
});

const uploads = multer({
    storage: storage,
    limits: {
        filesize: 1024 * 1024 * 5   // FILE SIZE IF SET TO 5 MB MAX
    }
});
// now make seprate folder for uploading images of work.

const storageObj = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './workImages');
    },
    filename: function (req, file, cb) {
        cb(null, new Date().toISOString() + file.originalname);
    }
});

const uploadObj = multer({
    storage: storageObj
});

const { createUser, loginUser, uploadFile, getFiles, uploadWorkImage, getUploadedWorkImage, createNewJob, getAllWorkType,getSpecificTypeWorks, apply ,getAllUsers, getApplications} = require("../controllers/tasks");
router.route("/createUser").post(createUser);
// router.route("/getToken").post(loginUser);
router.post("/login", loginUser);   // removed auth middle ware.

router.post("/file", uploads.single("image"), uploadFile);
router.route("/file").get(getFiles);

// this are for home page adding new worktype along with its image.
router.post("/uploadWorkImage", uploadObj.single("workImage"), uploadWorkImage);
// router.route("/uploadWorkImage").get(getUploadedWorkImage);
router.get("/uploadWorkImage", authenticateToken, getUploadedWorkImage);

// create new job and assign it to particular worktype.
router.post("/createNewJob", authenticateToken, createNewJob);

router.route("/getAllWorkType").get(getAllWorkType)

// route for getting jobs of specific category and their details.
router.get("getSpecificTypeWorks", authenticateToken, getSpecificTypeWorks);

// apply job .
router.post("/apply", authenticateToken, apply);
// router.route('/getAllUsers').get(getAllUsers);
router.get("/getAllUsers", authenticateToken, getAllUsers);

router.route("/getApplications").get(getApplications);

async function authenticateToken(req, res, next) {
    // get token from header. Bearer TOKEN format.
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        console.log("71");
        if (token == null) return res.status(401).json({"err": "token not given"});

        try {
            let decoded = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
            console.log(decoded);
            const data = await User.findOne({ username: decoded.username, usertype: decoded.userType });
            if (!data) {
                res.json({ msg: "Invalid User" });
            }
            req['userType'] = data.usertype;
            req['username1'] = data.username;
            req['userid'] = data._id;
            console.log("calling next");
            next();
        } catch (err) {
            console.log("error occured on 86");
            res.json({ err });
        }

        
    } catch (e) {
        res.sendStatus(500);
    }


}

module.exports = router;