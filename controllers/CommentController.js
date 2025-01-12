const CommentModel= require('../models/CommentModel')
const UserModel = require("../models/UserModel")
const MusicModel = require("../models/MusicModel")

class CommentController{
    async create(req, res){
        try {
            const user= await UserModel.findOne({email: req.email})
            
            const comment= await CommentModel.create({info: req.body.info, user: user._id, m_id: req.body.m_id})
            
            user.comments.push(comment._id)
            await user.save()
            const music= await MusicModel.findById(comment.m_id)
            music.comments.push(comment._id)
            await music.save()
            res.json({
                comment,
                user,
                music
            })
        } catch (err) {
            res.status(500).send("Server Error")
            console.log(err);
        }
    }

    async get(req, res){
        try {
            let start = parseInt(req.params.pg) || 1;
            let limit = 10;
            let startIndex = (start - 1) * limit;

            const comment= await CommentModel.find({m_id: req.params.m_id}).skip(startIndex).limit(limit)
            res.json(comment)
        } catch (err) {
            res.status(500).send("Server Error")
            console.log(err);
        }
    }

    async edit(req, res){
        try {
            const comment= await CommentModel.findByIdAndUpdate(req.body.id, {info: req.body.info})
            res.json({data:"Updated!"})
        } catch (err) {
            res.status(500).send("Server Error")
            console.log(err);
        }
    }

    async delete(req, res){
        try {
            const comment= await CommentModel.findById(req.body.cid)
            
            const user= await UserModel.findOne({email: req.email})
            user.comments.pull(comment._id)
            await user.save()
            
            const music= await MusicModel.findById(comment.m_id)
            music.comments.pull(comment._id)
            await music.save()
            
            await comment.deleteOne()

            res.status(200).send({data: "Success!"})
        } catch (err) {
            res.status(500).send("Server Error")
            console.log(err);
        }
    }

    async like(req, res){
        try {
            const user= await UserModel.findOne({email: req.email})
            
            const comment= await CommentModel.findById(req.body.cid)

            user.comLikes.push(comment._id)
            await user.save()

            comment.likes.push(user._id)
            await comment.save()

            res.status(200).send({data: "Success!"})
        } catch (err) {
            res.status(500).send("Server Error")
            console.log(err);
        }
    }

    async unlike(req, res){
        try {
            const user= await UserModel.findOne({email: req.email})
            
            const comment= await CommentModel.findById(req.body.cid)

            user.comLikes.pull(comment._id)
            await user.save()

            comment.likes.pull(user._id)
            await comment.save()

            res.status(200).send({data: "Success!"})
        } catch (err) {
            res.status(500).send("Server Error")
            console.log(err);
        }
    }
}

module.exports= new CommentController()