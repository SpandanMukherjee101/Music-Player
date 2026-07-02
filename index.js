const express = require("express")
const cors = require("cors")
const helmet = require("helmet")
const morgan = require("morgan")
const mongoose = require("mongoose")
const rateLimit = require("express-rate-limit")
require("dotenv").config()

const Routes = require("./routes/Routes.js")
const connectDB = require("./config/db.js")

const app = express()

app.disable("x-powered-by")
app.set("trust proxy", 1)
app.use(
    helmet({
        crossOriginResourcePolicy: { policy: "cross-origin" },
        crossOriginOpenerPolicy: { policy: "unsafe-none" },
    })
)

const corsOptions = {
    origin: process.env.CLIENT_ORIGIN || true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
}
app.use(cors(corsOptions))
app.options("*", cors(corsOptions))

app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"))
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
})
app.use(limiter)

const PORT = Number(process.env.PORT) || 8000
const URI = process.env.MONGO_URI
const SECRET_KEY = process.env.SECRET_KEY

if (!URI) {
    console.error("MONGO_URI is not defined")
    process.exit(1)
}

if (!SECRET_KEY) {
    console.error("SECRET_KEY is not defined")
    process.exit(1)
}

connectDB().catch((error) => {
    console.error("Initial MongoDB connection failed:", error.message)
})

app.use(["/api", "/"], async (req, res, next) => {
    try {
        await connectDB()
        next()
    } catch (error) {
        next(error)
    }
}, Routes)

app.get("/", (req, res) => {
    res.status(200).json({ message: "Welcome! This is a production-ready Music Player Backend API." })
})

app.use((req, res) => {
    res.status(404).json({ message: "Route not found" })
})

app.use((err, req, res, next) => {
    console.error(err)
    const status = err.status || 500
    const message = process.env.NODE_ENV === "production" ? "Internal server error" : err.message
    res.status(status).json({ message })
})

const server = app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`)
})

process.on("SIGTERM", () => {
    server.close(() => {
        mongoose.connection.close(false)
    })
})

module.exports = app;