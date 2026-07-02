const comment= require("../controllers/CommentController.js")

const express= require("express")
const commentRoutes= express.Router()

commentRoutes.post("/create", comment.create)
commentRoutes.get("/get/:m_id/:pg", comment.get)
commentRoutes.patch("/edit", comment.edit)
commentRoutes.delete("/delete", comment.delete)
commentRoutes.patch("/like", comment.like)
commentRoutes.patch("/unlike", comment.unlike)

module.exports= commentRoutes;