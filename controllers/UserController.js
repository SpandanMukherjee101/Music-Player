const bcrypt = require('bcrypt');
const UserModel = require("../models/UserModel")

const jwt = require('jsonwebtoken')

require('dotenv').config()
const SECRET_KEY = process.env.SECRET_KEY

class UserController {
    async signup(req, res) {
        try {
            const userdata = {
                userid: req.body.userid,
                name: req.body.name,
                email: req.body.email,
                password: await bcrypt.hash(req.body.password, 10),
            }

            try {
                let user = await UserModel.findOne({ email: userdata.email })
                if (user) res.status(409).send({ data: "User exists already!" })
                let id = await UserModel.findOne({userid: userdata.userid})
                if(id) {
                    res.status(404).send({ data: "Userid exists already!"})
                    return
                }
                await UserModel.create(userdata)
                const token = jwt.sign({ email: userdata.email }, SECRET_KEY, { expiresIn: '900000h' })
                res.json(token)
            } catch (err) {
                console.log(err)
            }
        }
        catch (e) {
            console.log(e)
        }
    }

    async login(req, res) {
        try {
            const userdata = {
                email: req.body.email,
                password: req.body.password
            }

            try {
                const user = await UserModel.findOne({ email: userdata.email })
                let b = await bcrypt.compare(userdata.password, user.password)
                if (b) {
                    const token = jwt.sign({ email: user.email }, SECRET_KEY, { expiresIn: '900000h' })
                    res.json(token)
                }
                else res.status(401).send("Wrong Password!!!")
            } catch (err) {
                res.status(404).send("User not found!!!")
            }
        } catch (e) {
            console.log(e)
        }
    }

    async prof(req, res) {
        try {
            const decoded = req.email

            const user = await UserModel.findOne({ email: decoded })
            res.json({
                userid: user.userid,
                name: user.name,
                email: user.email,
                musics: user.musics,
                likes: user.likes
            })
        } catch (e) {
            console.log(e)
        }
    }

    async up(req, res) {
        try {
            const decoded = req.email
            
            const userdata = {
                newpass: await bcrypt.hash(req.body.newpass, 10),
                oldpass: req.body.oldpass
            }
            
            try {
                const user = await UserModel.findOne({ email: decoded})
                
                let b = await bcrypt.compare( userdata.oldpass, user.password)
                
                if (b) {
                    const updatedUser= await UserModel.findOneAndUpdate({email: decoded}, {password: userdata.newpass})
                    res.json({
                        name: updatedUser.name,
                        email: updatedUser.email,
                    })
                }
                else res.status(401).send({ data: "Unauthorized access!!!" })
            } catch (err) {
                res.status(404).send("User not found!!!")
            }
        } catch (e) {
            console.log(e)
        }
    }

    async del(req, res) {
        try {
            const decoded = req.email
            
            await UserModel.findOneAndDelete({email: decoded})
            res.status(200).send({data: "Deleted"})
        } catch (e) {
            console.log(e)
        }
    }
}

module.exports = new UserController()