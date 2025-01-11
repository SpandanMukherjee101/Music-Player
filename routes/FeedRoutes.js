const feeds= require("../controllers/FeedController.js")

const express= require("express")
let feedsRoutes= express()

feedsRoutes.get("/:genre/:pg", feeds.get)

module.exports= feedsRoutes;