const mongoose = require("mongoose")

const comSchema= new mongoose.Schema({
    info: {
        type: String,
        required: true
    },

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },

    m_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "musics",
        required: true
    },

    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    }],

    createdAt: {
        type: Date,
        default: Date.now
    }
})

module.exports= mongoose.model('comments', comSchema)