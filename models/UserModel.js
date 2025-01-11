const mongoose = require("mongoose")

const UserSchema = new mongoose.Schema({
    userid: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    
    name: {
        type: String,
        required: true,
        trim: true
    },

    email: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: true,
        minlength: 8
    },

    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "musics"
    }],

    musics: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "musics"
    }],
    
    followers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    }],

    following: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    }],

    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('users', UserSchema);