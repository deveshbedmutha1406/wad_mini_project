const bcrypt = require("bcrypt");
const User = require("../models/users");
const jwt = require("jsonwebtoken");
const Image = require("../models/image");
const fs = require("fs");

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
        const hashedPassword = await bcrypt.hash(password, 10);
        const obj = { username: username, password: password };
        const accessToken = jwt.sign(obj, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.create({
            username: username,
            password: hashedPassword,
            token: accessToken
        }); // store token at the time of creating user.
        
        res.json({token: accessToken});
    } catch (err) {
        res.status(500).json({ msg: err['message'] }); 
    }
}

const loginUser = async (req, res) => {
    try {
        console.log("inside login User")
        console.log(req.user);  // object from middle ware.
        uname = req.body.username;
        password = req.body.password;
        console.log(uname);
        const user = await User.findOne({ username: uname });
        console.log(user);
        if (user) {
            if (await bcrypt.compare(password, user.password)) {
                const accessToken = user.token;
                console.log(accessToken);
                res.json({ msg: "Authentication Success", token: accessToken});
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

module.exports = {
    createUser,loginUser, uploadFile,getFiles
};