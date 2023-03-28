const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
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
    userType: String,
    jobs_applied: [mongoose.SchemaTypes.ObjectId]
    
});

module.exports = mongoose.model("User", userSchema);