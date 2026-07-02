const musics= require("../controllers/MusicController.js")
const upload= require("../utils/MulterMiddleware.js")

const express= require("express")
const musicsRoutes= express.Router()

musicsRoutes.post("/upload", upload, musics.upload)
musicsRoutes.get("/search/:name", musics.search)
musicsRoutes.get("/play/:id", musics.play)
musicsRoutes.get("/stream/:id", musics.stream)
musicsRoutes.delete("/delete", musics.delete)
musicsRoutes.patch("/like", musics.like)
musicsRoutes.patch("/unlike", musics.unlike)

module.exports= musicsRoutes;