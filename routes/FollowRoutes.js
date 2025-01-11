const follow= require("../controllers/FollowController.js")

const express= require("express")
let followRoutes= express()

followRoutes.get("/search/:uid", follow.search)
followRoutes.patch("/follow/:uid", follow.follow)
followRoutes.patch("/unfollow/:uid", follow.unfollow)
followRoutes.get("/followers/:uid", follow.followers)
followRoutes.get("/following/:uid", follow.following)

module.exports= followRoutes;