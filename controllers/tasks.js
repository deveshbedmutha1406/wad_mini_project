const bcrypt = require("bcrypt");
const User = require("../models/users");
const jwt = require("jsonwebtoken");
const Image = require("../models/image");
const fs = require("fs");
const WorkType = require("../models/works");
const Jobs = require("../models/Jobs");

const getAllUsers = async (req, res) => {
    console.log(req.userType);
    console.log(req.username1);
    try {
        const data = await User.find({});
        res.json({ data });
    } catch (e) {
        res.json({msg: e.message });
    }
}

const uploadWorkImage = async (req, res) => {
    try {
        console.log(req);
        const obj = await WorkType.create({
            nameOfWork: req.body.nameOfWork,
            description: req.body.desc,
            image: fs.readFileSync('workImages/' + req.file.filename)
        });
        console.log("uploaded");
        res.status(200).json({ msg: "file uploaded successfully" });
    } catch (e) {
        res.json(e.message);
    } 
}

const getUploadedWorkImage = async (req, res) => {
    try {
        const allData = await WorkType.find();
        console.log(allData);
        const obj = []
        allData.forEach(function (item) {
            let tmp = {
                'name': item.nameOfWork,
                'description': item.description,
                'imageBuffer': item.image,
                'id': item._id
            };
            obj.push(tmp);
        })
        res.status(200).json(obj);
    } catch (e) {
        console.log(e.message);
    }
}

const uploadFile = async (req, res) =>{
    try {
        console.log(req.file);
        const imageObj = await  Image.create({
            name: req.file.originalname,
            img: {
                data: fs.readFileSync('uploads/' + req.file.filename),
                contentType: "image/png"
            }
        });
        
        if (imageObj) {
            res.json({ imageObj });
        } else {    
            res.status(500).json({ msg: "object not formed" });
        }
    } catch (e) {
        res.json(e);
    }
}

const getFiles = async (req, res) => {
    const allData = await Image.find();
    res.json(allData);
}

const createUser = async (req, res) => {
    try {
        username = req.body.username;
        password = req.body.password;
        name1 = req.body.name;
        phoneno = req.body.phoneno;
        email = req.body.email;
        usertype = req.body.usertype;

        const hashedPassword = await bcrypt.hash(password, 10);
        const obj = { username: username, password: hashedPassword, userType:usertype };
        const accessToken = jwt.sign(obj, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.create({
            username: username,
            password: hashedPassword,
            token: accessToken,
            name: name1,
            email: email,
            phoneno: phoneno,
            usertype: usertype
        }); // store token at the time of creating user.
        console.log(user);
        res.json({token: accessToken, 'Status': 'Created'});
    } catch (err) {
        res.status(500).json({ msg: err['message'] , 'Status': 'Error Creating'}); 
    }
}

const loginUser = async (req, res) => {
    try {
        console.log("inside login User")
        // console.log(req.user);  // object from middle ware.
        uname = req.body.username;
        password = req.body.password;
        console.log(uname);
        const user = await User.findOne({ username: uname });
        console.log(user);
        if (user) {
            if (await bcrypt.compare(password, user.password)) {
                const accessToken = user.token;
                console.log(accessToken);
                res.json({ msg: "Authentication Success", token: accessToken, 'userid': user.id});
            } else {
                res.json({ msg: "Wrong Password" });
            }       
        } else {
            console.log("not found");
            res.status(400).json({msg: "user not found"})
        }
    } catch (e) {
        console.log("err");
        res.status(400).json({ msg: e.message});
    }
}

// creates a new job under specific work type and returns the entire object.
const createNewJob = async (req, res) => {
    try {
        /*
            params: worktype, location, pay per day, working hour per day.
        */
        worktypeid = req.body.worktypeid;
        payPerDay = parseInt(req.body.pay);
        workingHours = parseInt(req.body.workingHours);
        location = req.body.address;
        userid = req.body.userid;
        const data = await User.findById(userid);
        if (!data) {
            res.json({ msg: "user not found" });
        }
        const JobObject = await Jobs.create({
            location: location,
            workingHours: workingHours,
            payPerDay: payPerDay,
            jobCreater: data
        })
        if (!JobObject) {
            res.json({ msg: "Job object not created" });
        }
        const workObject = await WorkType.findById(worktypeid);
        if (!workObject) {
            res.json({ msg: "invalid worktype" });
        }
        workObject.availJobs.push(JobObject);
        workObject.save();
        res.status(201).json({ JobObject });
    } catch (e) {
        res.json(e.message);
    }
}

// gets specific fields from mongodb of schema WorkType.
const getAllWorkType = async (req, res) => {
    const data = await WorkType.find({}, {nameOfWork: 1, description: 1, availJobs:1});
    res.json({ data });
}

const getSpecificTypeWorks = async (req, res) => {
    // requires worktype id.
    try {
        const workTypeid = req.query.id;
        console.log(req.query);
        const data = await WorkType.findById(workTypeid, { availJobs: 1 });
        obj = []
        
        for (i = 0; i < data["availJobs"].length; i++){
            const tmp = await Jobs.findById(data["availJobs"][i]._id, {location: 1, payPerDay: 1, workingHours: 1});
            obj.push(tmp);
        }
        res.json(obj);
    } catch (e) {
        console.log("error occured");
        res.status(500).json(e.message);
    }
    
}

// apply is post method to form a link between user and job giver.
const apply = async (req, res) => {
    try {   
        console.log("inside apply funciont");
        // params userid, workid, 
        const jobid = req.body.workid;
        const username1 = req.username1
        const userType1 = req.userType;
        // check usertype
        if (userType1 == 'giver') {
            res.status(300).json({ msg: "you must be job seeker in order to apply to job" });
        }
        const tmpUser = await User.findOne({ username: username1, usertype: userType1 });
        if (!tmpUser) {
            console.log("user not found");
            res.status(400);
        }
        const userid = tmpUser._id;
        console.log(jobid);
        console.log(userid);
        const job = await Jobs.findById(jobid, { appliedUsers: 1 });
        if (!job) {
            res.status(400).json("Not Found");
        }
        const userobj = await User.findById(userid);
        job.appliedUsers.push(userobj); // put that object in applies job array.
        job.save();
        res.status(201).json({ msg: 'Applied Success' });   
    } catch (e) {
        res.status(500).json({ msg: e.message });
    }
}

// get request only for job giver (who have applied for that jobs)
const getApplications = async (req, res) => {
    // show applications option for job giver only.
    try {   
        // params the one who is requesting data.
        const userid = req.body.userid;
        const data = await User.findById(userid);
        if (!data) {
            res.json({ msg: "user not found" });
        }
        const allData = await Jobs.findOne({ jobCreater: data });
        if (!allData) {
            res.status(400).json({ msg: "creater not found" });
        }
        // res.json({ allData });
        appliedUsers = []
        for (i = 0; i < allData['appliedUsers'].length; i++){
            const tmp = await User.findById(allData['appliedUsers'][i]._id, { name: 1, email: 1, phoneno: 1 });
            console.log(tmp);
            if (!tmp) {
                res.json({ msg: "for loop error" });
            }
            appliedUsers.push(tmp);
        }

        res.json({ data: appliedUsers });

    } catch (e) {
        res.status(500).json({ msg: e.message });
    }
}

module.exports = {
    createUser,loginUser, uploadFile,getFiles, getUploadedWorkImage, uploadWorkImage, createNewJob, getAllWorkType, getSpecificTypeWorks, apply,getAllUsers, getApplications
};