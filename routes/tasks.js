const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/users");
// router.use(express.urlencoded({ extended: false }));

const { createUser, loginUser } = require("../controllers/tasks");
router.route("/createUser").post(createUser);
// router.route("/getToken").post(loginUser);
router.post("/login", authenticateToken, loginUser);

async function authenticateToken(req, res, next) {
    // get token from header. Bearer TOKEN format.
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        if (token == null) return res.sendStatus(401);
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, user)=>{
            if (err) return res.sendStatus(403);    // no access token but not valid.
            // check in db.
            const obj = { username: req.body.username }
            const atoken = await User.findOne(obj);
            if (atoken) {
                if (atoken.token === token) {
                    req.user = user;    // seting object;
                    next();
                } else {
                    res.sendStatus(403);
                }
            } else {
                res.sendStatus(403);
            }
        })
        
    } catch (e) {
        res.sendStatus(500);
    }


}

module.exports = router;