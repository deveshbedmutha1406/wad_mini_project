const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        maxLength: 100
    },
    username: {
        type: String,
        minLength: 10
    },
    password: {
        required: true,
        type: String
    },
    createdAt: {
        immutable: true,
        type: Date,
        default: () => Date.now()
    },
    token: String,
    usertype: String,
    email: String,
    phoneno: Number,
    jobs_applied: [mongoose.SchemaTypes.ObjectId]
    
});

module.exports = mongoose.model("User", userSchema);