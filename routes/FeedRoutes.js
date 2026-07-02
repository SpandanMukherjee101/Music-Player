const feeds= require("../controllers/FeedController.js")

const express= require("express")
const feedsRoutes= express.Router()

feedsRoutes.get("/:genre/:pg", feeds.get)

module.exports= feedsRoutes;