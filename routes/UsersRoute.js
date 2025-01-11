const user= require("../controllers/UserController.js")

const express= require("express")
let UsersRoute= express()

UsersRoute.post("/signup", user.signup)
UsersRoute.post("/login", user.login)

module.exports= UsersRoute;