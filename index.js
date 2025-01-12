const Routes= require("./routes/Routes.js")

const express= require("express")
let app= express()
app.use(express.json())

const mongoose= require("mongoose")

require('dotenv').config()

const URI= process.env.MONGO_URI

mongoose.connect(URI,{}).then(console.log("MongoDB connected")).catch((e)=>{console.log(e)});

app.use("/api/", Routes)

app.get("/", (req, res)=>{
    res.status(200).send("Welcome! This is a prototype Music Player Backend!!!")
})

app.listen(8000,()=>{
    console.log("Port connected");
})