const mongoose = require("mongoose")
const UserModel = require("../models/UserModel")

const findUserByParam = async (uid) => {
    const query = mongoose.isValidObjectId(uid)
        ? { $or: [{ userid: uid }, { _id: uid }] }
        : { userid: uid };
    return await UserModel.findOne(query);
};

class followController {
    async search(req, res, next) {
        try {
            const userFind = await findUserByParam(req.params.uid)
            if (!userFind) {
                return res.status(404).json({ message: "User not found" })
            }

            res.status(200).json({ userid: userFind.userid, name: userFind.name, musics: userFind.musics, _id: userFind._id })
        } catch (error) {
            next(error)
        }
    }

    async follow(req, res, next) {
        try {
            const user = await UserModel.findOne({ email: req.email })
            if (!user) {
                return res.status(404).json({ message: "User not found" })
            }

            const userFind = await findUserByParam(req.params.uid)
            if (!userFind) {
                return res.status(404).json({ message: "Target user not found" })
            }

            if (userFind._id.equals(user._id)) {
                return res.status(400).json({ message: "You cannot follow yourself" })
            }

            const alreadyFollowing = user.following.some((id) => id.equals(userFind._id))
            if (alreadyFollowing) {
                return res.status(409).json({ message: "Already following" })
            }

            user.following.push(userFind._id)
            userFind.followers.push(user._id)
            await user.save()
            await userFind.save()
            res.status(200).json({ message: "Done!" })
        } catch (error) {
            next(error)
        }
    }

    async unfollow(req, res, next) {
        try {
            const user = await UserModel.findOne({ email: req.email })
            if (!user) {
                return res.status(404).json({ message: "User not found" })
            }

            const userFind = await findUserByParam(req.params.uid)
            if (!userFind) {
                return res.status(404).json({ message: "Target user not found" })
            }

            user.following = user.following.filter((id) => !id.equals(userFind._id))
            userFind.followers = userFind.followers.filter((id) => !id.equals(user._id))
            await user.save()
            await userFind.save()
            res.status(200).json({ message: "Done!" })
        } catch (error) {
            next(error)
        }
    }

    async followers(req, res, next) {
        try {
            const userFind = await findUserByParam(req.params.uid)
            if (!userFind) {
                return res.status(404).json({ message: "User not found" })
            }

            const followers = await Promise.all(userFind.followers.map((id) => UserModel.findById(id)))
            res.status(200).json({ userList: followers.filter(Boolean).map((entry) => entry.userid) })
        } catch (error) {
            next(error)
        }
    }

    async following(req, res, next) {
        try {
            const userFind = await findUserByParam(req.params.uid)
            if (!userFind) {
                return res.status(404).json({ message: "User not found" })
            }

            const following = await Promise.all(userFind.following.map((id) => UserModel.findById(id)))
            res.status(200).json({ userList: following.filter(Boolean).map((entry) => entry.userid) })
        } catch (error) {
            next(error)
        }
    }
}

module.exports = new followController()