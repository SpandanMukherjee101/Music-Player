const UserModel = require("../models/UserModel")
const MusicModel = require("../models/MusicModel")
const popModel = require("../models/PopModel")
const rockModel = require("../models/RockModel")
const edmModel = require("../models/EDMModel")
const classicalModel = require("../models/ClassicalModel")
const blueModel = require("../models/BlueModel")
const jazzModel = require("../models/JazzModel")
const metalModel = require("../models/MetalModel")
const hiphopModel = require("../models/HipHopModel")
const indieModel = require("../models/IndieModel")

const genreModels = {
    pop: popModel,
    rock: rockModel,
    edm: edmModel,
    classical: classicalModel,
    blue: blueModel,
    jazz: jazzModel,
    metal: metalModel,
    hiphop: hiphopModel,
    indie: indieModel,
}

class FeedController {
    async get(req, res, next) {
        try {
            const start = parseInt(req.params.pg, 10) || 1
            const limit = 10
            const startIndex = (start - 1) * limit
            const genre = req.params.genre

            if (genre === "liked") {
                const user = await UserModel.findOne({ email: req.email })
                if (!user) {
                    return res.status(404).json({ message: "User not found" })
                }

                const musicIds = user.likes || []
                if (musicIds.length === 0) {
                    return res.status(200).json({ data: [] })
                }

                const musics = await Promise.all(musicIds.map((id) => MusicModel.findById(id)))
                return res.json(musics.filter(Boolean))
            }

            if (genre === "all") {
                const total = await MusicModel.countDocuments()
                const musics = await MusicModel.find().skip(startIndex).limit(limit)
                return res.json({
                    start,
                    limit,
                    total,
                    pages: Math.ceil(total / limit),
                    data: musics,
                })
            }

            const model = genreModels[genre]
            if (!model) {
                return res.status(400).json({ message: "Invalid genre" })
            }

            const total = await model.countDocuments()
            const entries = await model.find().skip(startIndex).limit(limit)
            const musics = await Promise.all(entries.map((entry) => MusicModel.findById(entry.m_id)))

            return res.json({
                start,
                limit,
                total,
                pages: Math.ceil(total / limit),
                data: musics.filter(Boolean),
            })
        } catch (error) {
            next(error)
        }
    }
}

module.exports = new FeedController()