const AuthRoutes= require("./AuthRoutes.js")
const UsersRoute= require("./UsersRoute")

const auth= require("../middlewares/AuthVerify.js")

const express= require("express")
let Routes= express()

Routes.use('/auth', auth, AuthRoutes)
Routes.use('/', UsersRoute)

module.exports= Routes;