const mongoose = require("mongoose")

const musicSchema= new mongoose.Schema({
    m_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "musics",
        required: true
    },
    
    createdAt: {
        type: Date,
        default: Date.now
    }
})

module.exports= mongoose.model('metal', musicSchema)