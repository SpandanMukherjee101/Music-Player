const mongoose = require("mongoose")

const musicSchema= new mongoose.Schema({
    info: {
        type: String,
        required: true
    },

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },

    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    }],

    genre: [{
        type: String,
        required: true
    }],

    comments:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "comments"
    }],

    createdAt: {
        type: Date,
        default: Date.now
    }
})

module.exports= mongoose.model('musics', musicSchema)