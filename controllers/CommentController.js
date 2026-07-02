const CommentModel = require("../models/CommentModel")
const UserModel = require("../models/UserModel")
const MusicModel = require("../models/MusicModel")

const formatComments = (comments) => {
    return comments.filter(Boolean).map((c) => {
        const obj = typeof c.toObject === "function" ? c.toObject() : { ...c };
        if (obj.user && typeof obj.user === "object" && obj.user.userid) {
            obj.user = obj.user.userid;
        }
        return obj;
    });
};

class CommentController {
    async create(req, res, next) {
        try {
            const { info, m_id } = req.body
            if (!info || !m_id) {
                return res.status(400).json({ message: "Comment text and music id are required" })
            }

            const user = await UserModel.findOne({ email: req.email })
            if (!user) {
                return res.status(404).json({ message: "User not found" })
            }

            const music = await MusicModel.findById(m_id)
            if (!music) {
                return res.status(404).json({ message: "Music not found" })
            }

            const comment = await CommentModel.create({ info, user: user._id, m_id })
            user.comments.push(comment._id)
            await user.save()
            music.comments.push(comment._id)
            await music.save()

            const comObj = comment.toObject()
            comObj.user = user.userid
            res.status(201).json({ comment: comObj, user: { userid: user.userid, name: user.name }, music: { id: music._id } })
        } catch (error) {
            next(error)
        }
    }

    async get(req, res, next) {
        try {
            const start = parseInt(req.params.pg, 10) || 1
            const limit = 10
            const startIndex = (start - 1) * limit

            const comments = await CommentModel.find({ m_id: req.params.m_id }).skip(startIndex).limit(limit).populate("user", "userid name")
            res.json(formatComments(comments))
        } catch (error) {
            next(error)
        }
    }

    async edit(req, res, next) {
        try {
            const comment = await CommentModel.findById(req.body.id)
            if (!comment) {
                return res.status(404).json({ message: "Comment not found" })
            }

            if (!comment.user.equals((await UserModel.findOne({ email: req.email }))._id)) {
                return res.status(403).json({ message: "Unauthorized" })
            }

            comment.info = req.body.info
            await comment.save()
            res.json({ message: "Updated!" })
        } catch (error) {
            next(error)
        }
    }

    async delete(req, res, next) {
        try {
            const comment = await CommentModel.findById(req.body.cid)
            if (!comment) {
                return res.status(404).json({ message: "Comment not found" })
            }

            const user = await UserModel.findOne({ email: req.email })
            if (!user) {
                return res.status(404).json({ message: "User not found" })
            }

            if (!comment.user.equals(user._id)) {
                return res.status(403).json({ message: "Unauthorized" })
            }

            user.comments.pull(comment._id)
            await user.save()

            const music = await MusicModel.findById(comment.m_id)
            if (music) {
                music.comments.pull(comment._id)
                await music.save()
            }

            await comment.deleteOne()
            res.status(200).json({ message: "Success!" })
        } catch (error) {
            next(error)
        }
    }

    async like(req, res, next) {
        try {
            const user = await UserModel.findOne({ email: req.email })
            if (!user) {
                return res.status(404).json({ message: "User not found" })
            }

            const comment = await CommentModel.findById(req.body.cid)
            if (!comment) {
                return res.status(404).json({ message: "Comment not found" })
            }

            if (!user.comLikes.some((id) => id.equals(comment._id))) {
                user.comLikes.push(comment._id)
                comment.likes.push(user._id)
                await user.save()
                await comment.save()
            }

            res.status(200).json({ message: "Success!" })
        } catch (error) {
            next(error)
        }
    }

    async unlike(req, res, next) {
        try {
            const user = await UserModel.findOne({ email: req.email })
            if (!user) {
                return res.status(404).json({ message: "User not found" })
            }

            const comment = await CommentModel.findById(req.body.cid)
            if (!comment) {
                return res.status(404).json({ message: "Comment not found" })
            }

            user.comLikes = user.comLikes.filter((id) => !id.equals(comment._id))
            comment.likes = comment.likes.filter((id) => !id.equals(user._id))
            await user.save()
            await comment.save()

            res.status(200).json({ message: "Success!" })
        } catch (error) {
            next(error)
        }
    }
}

module.exports = new CommentController()