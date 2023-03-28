const mongoose = require("mongoose");
const Jobs = require("./Jobs");

const workSchema = new mongoose.Schema({
    nameOfWork: {type: String, required: true},
    description: {type: String, required: true},
    image: Buffer,
    availJobs: {
        type: [mongoose.SchemaTypes.ObjectId],
        ref: Jobs
    }
});


module.exports = mongoose.model("WorkType", workSchema);