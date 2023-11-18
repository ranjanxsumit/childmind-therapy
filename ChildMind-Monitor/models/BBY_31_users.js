const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const userSchema = new Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phoneNum: {
        type: String,
        required: true,
        unique: true
    },
    userType: {
        type: String,
        required: true
    },
    yearsExperience: {
        type: String
    },
    sessionCost: {
        type: String
    },
    usedTrial: {
        type: Boolean,
        default:false
    },
    numSessions: {
        type: Number
    },
    profileImg: {
        type: String,
        default: "../uploads/placeholder-profile.jpg"
    }
}, { timestamps: true, versionKey: false });

const User = mongoose.model('user', userSchema);
module.exports = User;