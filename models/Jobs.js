const mongoose = require("mongoose");
const users = require('../models/users');

const Jobs = new mongoose.Schema({
    location: String,
    payPerDay: Number,
    workingHours: Number,
    appliedUsers: {
        type: [mongoose.SchemaTypes.ObjectId],
        ref: users
    },
    jobCreater: {
        type:mongoose.SchemaTypes.ObjectId
        // ref: users
    }
});

module.exports = mongoose.model("Jobs", Jobs);