const user= require("../controllers/UserController")

const follow= require("./FollowRoutes.js")
const musics= require("./MusicRoutes.js")
const feed= require("./FeedRoutes.js")
const comments= require("./CommentRoutes.js")

const express= require("express")
let AuthRoutes= express()

AuthRoutes.use("/follow", follow)
AuthRoutes.use("/musics", musics)
AuthRoutes.use("/feed", feed)
AuthRoutes.use("/comments", comments)

AuthRoutes.get("/prof", user.prof)
AuthRoutes.patch("/up", user.up)
AuthRoutes.delete("/del", user.del)

module.exports= AuthRoutes;