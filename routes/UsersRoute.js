const user= require("../controllers/UserController.js")

const express= require("express")
const UsersRoute= express.Router()

UsersRoute.post("/signup", user.signup)
UsersRoute.post("/login", user.login)

module.exports= UsersRoute;