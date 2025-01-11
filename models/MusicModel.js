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

    createdAt: {
        type: Date,
        default: Date.now
    }
})

module.exports= mongoose.model('musics', musicSchema)