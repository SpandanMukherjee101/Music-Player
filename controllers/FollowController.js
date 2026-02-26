const UserModel = require("../models/UserModel")

class followController {
    async search(req, res) {
        try {
            const userFind = await UserModel.findOne({ userid: req.params.uid })
            res.status(200).send({ name: userFind.name, musics: userFind.musics })
        } catch (err) {
            console.log(err);
            res.status(500).send("Server Error")
        }
    }

    async follow(req, res) {
        try {
            const decoded = req.email
            const user = await UserModel.findOne({ email: decoded })
            const userFind = await UserModel.findOne({ userid: req.params.uid })
            user.following.push(userFind._id)
            await user.save();
            userFind.followers.push(user._id)
            await userFind.save();
            res.status(200).send({ data: "Done!" })
        } catch (err) {
            console.log(err);
            res.status(500).send("Server Error")
        }
    }

    async unfollow(req, res) {
        try {
            const decoded = req.email
            const user = await UserModel.findOne({ email: decoded })
            const userFind = await UserModel.findOne({ userid: req.params.uid })
            user.following.pull(userFind._id)
            await user.save();
            userFind.followers.pull(user._id)
            await userFind.save();
            res.status(200).send({ data: "Done!" })
        } catch (err) {
            console.log(err);
            res.status(500).send("Server Error")
        }
    }

    async followers(req, res) {
        let arr = []
        try {
            const userFind = await UserModel.findOne({ userid: req.params.uid })
            for (const uid of userFind.followers) {
                const user = await UserModel.findOne({ _id: uid })
                arr.push(user.userid)
            }
            res.status(200).send({ userList: arr })
        } catch (err) {
            console.log(err);
            res.status(500).send("Server Error")
        }
    }

    async following(req, res) {
        let arr = []
        try {
            const userFind = await UserModel.findOne({ userid: req.params.uid })
            for (const uid of userFind.following) {
                const user = await UserModel.findOne({ _id: uid })
                arr.push(user.userid)
            }
            res.status(200).send({ userList: arr })
        } catch (err) {
            console.log(err);
            res.status(500).send("Server Error")
        }
    }
}

module.exports = new followController()