const musics= require("../controllers/MusicController.js")

const express= require("express")
let musicsRoutes= express()

musicsRoutes.post("/upload", musics.upload)
musicsRoutes.get("/search/:name", musics.search)
musicsRoutes.get("/play/:id", musics.play)
musicsRoutes.delete("/delete", musics.delete)
musicsRoutes.patch("/like", musics.like)
musicsRoutes.patch("/unlike", musics.unlike)

module.exports= musicsRoutes;