const mongoose = require("mongoose");

const workSchema = new mongoose.Schema({
    nameOfWork: {type: String, required: true},
    description: {type: String, required: true},
    image: Buffer
});


module.exports = mongoose.model("WorkType", workSchema);