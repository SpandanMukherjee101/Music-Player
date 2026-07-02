const AuthRoutes= require("./AuthRoutes.js")
const UsersRoute= require("./UsersRoute")

const auth= require("../middlewares/AuthVerify.js")

const express= require("express")
const Routes= express.Router()

Routes.use('/auth', auth, AuthRoutes)
Routes.use('/', UsersRoute)

module.exports= Routes;