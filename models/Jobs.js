const mongoose = require("mongoose");


const Jobs = new mongoose.Schema({
    location: String,
    payPerDay: Number,
    workingHours: Number
});

module.exports = mongoose.model("Jobs", Jobs);