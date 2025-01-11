const UserModel = require("../models/UserModel")
const MusicModel = require("../models/MusicModel")
const popModel= require("../models/PopModel")
const rockModel= require("../models/RockModel")
const edmModel= require("../models/EDMModel")
const classicalModel= require("../models/ClassicalModel")
const blueModel= require("../models/BlueModel")
const jazzModel= require("../models/JazzModel")
const metalModel= require("../models/MetalModel")
const hiphopModel= require("../models/HipHopModel")
const indieModel= require("../models/IndieModel")

class PostController{
    async upload(req, res){
        try {
            const decoded= req.email
            const user= await UserModel.findOne({email: decoded})

            const music= await MusicModel.create({info: req.body.info, genre: req.body.genre, user: user._id})
            
            user.musics.push(music._id)
            await user.save();

            for (const element of req.body.genre){
                switch (element) {
                    case 'pop':
                        await popModel.create({m_id: music._id})
                        break;

                    case 'rock':
                        await rockModel.create({m_id: music._id})
                        break;
                    
                    case 'edm':
                        await edmModel.create({m_id: music._id})
                        break;

                    case 'classical':
                        await classicalModel.create({m_id: music._id})
                        break;

                    case 'blue':
                        await blueModel.create({m_id: music._id})
                        break;

                    case 'jazz':
                        await jazzModel.create({m_id: music._id})
                        break;

                    case 'metal':
                        await metalModel.create({m_id: music._id})
                        break;

                    case 'hiphop':
                        await hiphopModel.create({m_id: music._id})
                        break;

                    case 'indie':
                        await indieModel.create({m_id: music._id})
                        break;

                    default:
                        break;
                }
            }

            res.status(200).send(music);
        } catch (err) {
            res.status(500).send("Server Error")
            console.log(err);
        }
    }

    async play(req, res){
        try {
            const id= req.params.id;
            const music= await MusicModel.findOne({_id: id})
            console.log(music);
            

            const user= await UserModel.findOne({_id: music.user})

            res.status(200).send({userid: user.userid, info: music.info, genre: music.genre, likes: music.likes.length});
        } catch (err) {
            res.status(500).send("Server Error")
            console.log(err);
        }
    }

    async search(req, res){
        try {
            const musics= await MusicModel.find({info: req.params.name})
            res.json(musics)
        } catch (err) {
            res.status(500).send("Server Error")
            console.log(err);
        }
    }

    async delete(req, res){
        try {
            const decoded= req.email
            
            const id= req.body.id
            const music= await MusicModel.findOne({_id: id})

            const user= await UserModel.findOne({_id: music.user})

            if (decoded===user.email) {
                user.musics.pull(music.user)
                await user.save()
                await MusicModel.findByIdAndDelete(id)
                res.status(200).send({data: "Deleted"})
            }

        } catch (err) {
            res.status(500).send("Server Error")
            console.log(err);
        }
    }

    async like(req, res){
        try {
            const decoded= req.email

            const user= await UserModel.findOne({ email: decoded})

            const music= await MusicModel.findById(req.body.id)            

            music.likes.push(user._id)
            await music.save()
            
            user.likes.push(music._id)
            await user.save()

            res.json({likes: music.likes})
        } catch (err) {
            res.status(500).send("Server Error")
            console.log(err);
        }
    }

    async unlike(req, res){
        try {
            const decoded= req.email

            const user= await UserModel.findOne({ email: decoded})

            const music= await MusicModel.findById(req.body.id)            

            music.likes.pull(user._id)
            await music.save()
            
            user.likes.pull(music._id)
            await user.save()

            res.json({likes: music.likes})
        } catch (err) {
            res.status(500).send("Server Error")
            console.log(err);
        }
    }
}

module.exports= new PostController()