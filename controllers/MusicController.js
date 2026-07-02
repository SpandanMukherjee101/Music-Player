const { URL } = require("url")
const http = require("http")
const https = require("https")

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

class PostController {
    async upload(req, res, next) {
        try {
            const { info, genre } = req.body

            if (!info || typeof info !== "string" || !info.trim()) {
                return res.status(400).json({ message: "Music info is required" })
            }

            if (!Array.isArray(genre) || genre.length === 0) {
                return res.status(400).json({ message: "At least one genre is required" })
            }

            const user = await UserModel.findOne({ email: req.email })
            if (!user) {
                return res.status(404).json({ message: "User not found" })
            }

            const music = await MusicModel.create({ info: info.trim(), genre, user: user._id })
            user.musics.push(music._id)
            await user.save()

            for (const element of genre) {
                const model = genreModels[element]
                if (model) {
                    await model.create({ m_id: music._id })
                }
            }

            if (req.file && req.file.cloudinary) {
                const result = req.file.cloudinary
                music.url = result.secure_url || result.url
                music.public_id = result.public_id
                music.format = result.format
                music.size = typeof result.bytes === "number" ? result.bytes : undefined
                await music.save()
            }

            res.status(201).json(music)
        } catch (error) {
            next(error)
        }
    }

    async play(req, res, next) {
        try {
            const music = await MusicModel.findById(req.params.id)
            if (!music) {
                return res.status(404).json({ message: "Music not found" })
            }

            const user = await UserModel.findById(music.user)
            if (!user) {
                return res.status(404).json({ message: "Owner not found" })
            }

            res.status(200).json({ userid: user.userid, info: music.info, genre: music.genre, likes: music.likes.length })
        } catch (error) {
            next(error)
        }
    }

    async stream(req, res, next) {
        try {
            const music = await MusicModel.findById(req.params.id)
            if (!music || !music.url) {
                return res.status(404).json({ message: "Music or source URL not found" })
            }

            const range = req.headers.range || "bytes=0-"
            const parsed = new URL(music.url)
            const requester = parsed.protocol === "https:" ? https : http

            const options = {
                hostname: parsed.hostname,
                port: parsed.port || (parsed.protocol === "https:" ? 443 : 80),
                path: parsed.pathname + (parsed.search || ""),
                method: "GET",
                headers: {
                    Range: range,
                },
            }

            const upstream = requester.request(options, (upstreamRes) => {
                // propagate status and selected headers
                res.statusCode = upstreamRes.statusCode
                const copyHeaders = ["content-type", "content-length", "accept-ranges", "content-range"]
                copyHeaders.forEach((h) => {
                    if (upstreamRes.headers[h]) res.setHeader(h, upstreamRes.headers[h])
                })
                upstreamRes.pipe(res)
            })

            upstream.on("error", (err) => next(err))
            upstream.end()
        } catch (error) {
            next(error)
        }
    }

    async search(req, res, next) {
        try {
            const query = req.params.name?.trim()
            if (!query) {
                return res.status(400).json({ message: "Search term is required" })
            }

            const musics = await MusicModel.find({ info: { $regex: query, $options: "i" } }).limit(20)
            res.json(musics)
        } catch (error) {
            next(error)
        }
    }

    async delete(req, res, next) {
        try {
            const music = await MusicModel.findById(req.body.id)
            if (!music) {
                return res.status(404).json({ message: "Music not found" })
            }

            const user = await UserModel.findOne({ email: req.email })
            if (!user) {
                return res.status(404).json({ message: "User not found" })
            }

            if (!music.user.equals(user._id)) {
                return res.status(403).json({ message: "Unauthorized" })
            }

            user.musics.pull(music._id)
            await user.save()
            await MusicModel.findByIdAndDelete(music._id)
            res.status(200).json({ message: "Deleted" })
        } catch (error) {
            next(error)
        }
    }

    async like(req, res, next) {
        try {
            const music = await MusicModel.findById(req.body.id)
            if (!music) {
                return res.status(404).json({ message: "Music not found" })
            }

            const user = await UserModel.findOne({ email: req.email })
            if (!user) {
                return res.status(404).json({ message: "User not found" })
            }

            const alreadyLiked = music.likes.some((id) => id.equals(user._id))
            if (!alreadyLiked) {
                music.likes.push(user._id)
                user.likes.push(music._id)
                await music.save()
                await user.save()
            }

            res.json({ likes: music.likes.length })
        } catch (error) {
            next(error)
        }
    }

    async unlike(req, res, next) {
        try {
            const music = await MusicModel.findById(req.body.id)
            if (!music) {
                return res.status(404).json({ message: "Music not found" })
            }

            const user = await UserModel.findOne({ email: req.email })
            if (!user) {
                return res.status(404).json({ message: "User not found" })
            }

            music.likes = music.likes.filter((id) => !id.equals(user._id))
            user.likes = user.likes.filter((id) => !id.equals(music._id))
            await music.save()
            await user.save()

            res.json({ likes: music.likes.length })
        } catch (error) {
            next(error)
        }
    }
}

module.exports = new PostController()