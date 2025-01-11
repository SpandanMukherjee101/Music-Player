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

class FeedController {
    async get(req, res) {
        try {
            let start = parseInt(req.params.pg) || 1;
            let limit = 10;
            let total;
            let music_ids=[];
            let musics=[];
            let startIndex = (start - 1) * limit;
            switch (req.params.genre) {
                case 'all':
                    total = await MusicModel.countDocuments();
                    musics = await MusicModel.find().skip(startIndex).limit(limit)
                    res.json({
                        start,
                        limit,
                        total,
                        pages: Math.ceil(total / limit),
                        data: musics
                    })
                    break;

                case 'pop':
                    total = await popModel.countDocuments();
                    music_ids = await popModel.find().skip(startIndex).limit(limit)
                    for (const element of music_ids) {
                        let music = await MusicModel.findById(element.m_id)
                        musics.push(music)
                    }
                    res.json({
                        start,
                        limit,
                        total,
                        pages: Math.ceil(total / limit),
                        data: musics
                    })
                    break;

                case 'rock':
                    total = await rockModel.countDocuments();
                    music_ids = await rockModel.find().skip(startIndex).limit(limit)
                    for (const element of music_ids) {
                        let music = await MusicModel.findById(element.m_id)
                        musics.push(music)
                    }
                    res.json({
                        start,
                        limit,
                        total,
                        pages: Math.ceil(total / limit),
                        data: musics
                    })
                    break;

                case 'edm':
                    total = await edmModel.countDocuments();
                    music_ids = await edmModel.find().skip(startIndex).limit(limit)
                    for (const element of music_ids) {
                        let music = await MusicModel.findById(element.m_id)
                        musics.push(music)
                    }
                    res.json({
                        start,
                        limit,
                        total,
                        pages: Math.ceil(total / limit),
                        data: musics
                    })
                    break;

                case 'classical':
                    total = await classicalModel.countDocuments();
                    music_ids = await classicalModel.find().skip(startIndex).limit(limit)
                    for (const element of music_ids) {
                        let music = await MusicModel.findById(element.m_id)
                        musics.push(music)
                    }
                    res.json({
                        start,
                        limit,
                        total,
                        pages: Math.ceil(total / limit),
                        data: musics
                    })
                    break;

                case 'blue':
                    total = await blueModel.countDocuments();
                    music_ids = await blueModel.find().skip(startIndex).limit(limit)
                    for (const element of music_ids) {
                        let music = await MusicModel.findById(element.m_id)
                        musics.push(music)
                    }
                    res.json({
                        start,
                        limit,
                        total,
                        pages: Math.ceil(total / limit),
                        data: musics
                    })
                    break;

                case 'jazz':
                    total = await jazzModel.countDocuments();
                    music_ids = await jazzModel.find().skip(startIndex).limit(limit)
                    for (const element of music_ids) {
                        let music = await MusicModel.findById(element.m_id)
                        musics.push(music)
                    }
                    res.json({
                        start,
                        limit,
                        total,
                        pages: Math.ceil(total / limit),
                        data: musics
                    })
                    break;

                case 'metal':
                    total = await metalModel.countDocuments();
                    music_ids = await metalModel.find().skip(startIndex).limit(limit)
                    for (const element of music_ids) {
                        let music = await MusicModel.findById(element.m_id)
                        musics.push(music)
                    }
                    res.json({
                        start,
                        limit,
                        total,
                        pages: Math.ceil(total / limit),
                        data: musics
                    })
                    break;

                case 'hiphop':
                    total = await hiphopModel.countDocuments();
                    music_ids = await hiphopModel.find().skip(startIndex).limit(limit)
                    for (const element of music_ids) {
                        let music = await MusicModel.findById(element.m_id)
                        musics.push(music)
                    }
                    res.json({
                        start,
                        limit,
                        total,
                        pages: Math.ceil(total / limit),
                        data: musics
                    })
                    break;

                case 'indie':
                    total = await indieModel.countDocuments();
                    music_ids = await indieModel.find().skip(startIndex).limit(limit)
                    for (const element of music_ids) {
                        let music = await MusicModel.findById(element.m_id)
                        musics.push(music)
                    }
                    res.json({
                        start,
                        limit,
                        total,
                        pages: Math.ceil(total / limit),
                        data: musics
                    })
                    break;

                default:
                    break;
            }
        } catch (err) {
            res.status(500).send("Server Error")
            console.log(err);
        }
    }
}

module.exports = new FeedController()