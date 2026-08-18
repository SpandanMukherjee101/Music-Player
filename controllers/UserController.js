const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const UserModel = require("../models/UserModel")
const MusicModel = require("../models/MusicModel")
require("dotenv").config()

const SECRET_KEY = process.env.SECRET_KEY

const createToken = (email) => jwt.sign({ email }, SECRET_KEY, { expiresIn: "10y" })

const formatTracks = (tracks) => {
    return tracks.filter(Boolean).map((t) => {
        const obj = typeof t.toObject === "function" ? t.toObject() : { ...t };
        if (obj.user && typeof obj.user === "object" && obj.user.userid) {
            obj.user = obj.user.userid;
        }
        if (Array.isArray(obj.likes)) {
            obj.likes = [...new Set(obj.likes.map((id) => id.toString()))];
        }
        if (Array.isArray(obj.comments)) {
            obj.comments = [...new Set(obj.comments.map((id) => id.toString()))];
        }
        return obj;
    });
};

class UserController {
    async signup(req, res, next) {
        try {
            const { userid, name, email, password } = req.body

            if (!userid || !name || !email || !password) {
                return res.status(400).json({ message: "All fields are required" })
            }

            if (typeof password !== "string" || password.length < 8) {
                return res.status(400).json({ message: "Password must be at least 8 characters" })
            }

            const normalizedEmail = email.toLowerCase().trim()
            const normalizedUserid = userid.trim()

            const existingUser = await UserModel.findOne({ $or: [{ email: normalizedEmail }, { userid: normalizedUserid }] })
            if (existingUser) {
                return res.status(409).json({ message: "User already exists" })
            }

            const hashedPassword = await bcrypt.hash(password, 12)
            const user = await UserModel.create({
                userid: normalizedUserid,
                name: name.trim(),
                email: normalizedEmail,
                password: hashedPassword,
            })

            const token = createToken(user.email)
            res.status(201).json({ token, user: { userid: user.userid, name: user.name, email: user.email } })
        } catch (error) {
            next(error)
        }
    }

    async login(req, res, next) {
        try {
            const { email, password } = req.body

            if (!email || !password) {
                return res.status(400).json({ message: "Email and password are required" })
            }

            const user = await UserModel.findOne({ email: email.toLowerCase().trim() })
            if (!user) {
                return res.status(404).json({ message: "User not found" })
            }

            const isMatch = await bcrypt.compare(password, user.password)
            if (!isMatch) {
                return res.status(401).json({ message: "Invalid credentials" })
            }

            const token = createToken(user.email)
            res.json({ token, user: { userid: user.userid, name: user.name, email: user.email } })
        } catch (error) {
            next(error)
        }
    }

    async prof(req, res, next) {
        try {
            const user = await UserModel.findOne({ email: req.email })
            if (!user) {
                return res.status(404).json({ message: "User not found" })
            }

            const validMusics = await MusicModel.find({ _id: { $in: user.musics } }, "_id")
            const validMusicIds = [...new Set(validMusics.map((m) => m._id.toString()))]
            if (validMusicIds.length !== user.musics.length || new Set(user.musics.map(id => id.toString())).size !== user.musics.length) {
                user.musics = validMusicIds
                await user.save()
            }

            const validLikes = await MusicModel.find({ _id: { $in: user.likes } }, "_id")
            const validLikeIds = [...new Set(validLikes.map((m) => m._id.toString()))]
            if (validLikeIds.length !== user.likes.length || new Set(user.likes.map(id => id.toString())).size !== user.likes.length) {
                user.likes = validLikeIds
                await user.save()
            }

            const populatedMusics = await MusicModel.find({ _id: { $in: user.musics } }).populate("user", "userid name")
            const populatedLikes = await MusicModel.find({ _id: { $in: user.likes } }).populate("user", "userid name")

            res.json({
                userid: user.userid,
                name: user.name,
                email: user.email,
                musics: formatTracks(populatedMusics),
                likes: formatTracks(populatedLikes),
            })
        } catch (error) {
            next(error)
        }
    }

    async up(req, res, next) {
        try {
            const { oldpass, newpass } = req.body

            if (!oldpass || !newpass) {
                return res.status(400).json({ message: "Current and new password are required" })
            }

            if (typeof newpass !== "string" || newpass.length < 8) {
                return res.status(400).json({ message: "New password must be at least 8 characters" })
            }

            const user = await UserModel.findOne({ email: req.email })
            if (!user) {
                return res.status(404).json({ message: "User not found" })
            }

            const isMatch = await bcrypt.compare(oldpass, user.password)
            if (!isMatch) {
                return res.status(401).json({ message: "Current password is incorrect" })
            }

            user.password = await bcrypt.hash(newpass, 12)
            await user.save()

            res.json({ name: user.name, email: user.email })
        } catch (error) {
            next(error)
        }
    }

    async del(req, res, next) {
        try {
            await UserModel.findOneAndDelete({ email: req.email })
            res.status(200).json({ message: "Deleted" })
        } catch (error) {
            next(error)
        }
    }
}

module.exports = new UserController()