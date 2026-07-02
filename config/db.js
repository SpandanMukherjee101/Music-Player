const mongoose = require("mongoose")

let cachedConnection = null

const connectDB = async () => {
    if (cachedConnection) {
        console.log("Using cached MongoDB connection")
        return cachedConnection
    }

    try {
        const URI = process.env.MONGO_URI
        if (!URI) {
            throw new Error("MONGO_URI is not defined")
        }

        mongoose.set("strictQuery", true)
        const connection = await mongoose.connect(URI, {
            serverSelectionTimeoutMS: 10000,
        })

        cachedConnection = connection
        console.log("New MongoDB connection established")
        return cachedConnection
    } catch (error) {
        cachedConnection = null
        console.error("MongoDB connection failed:", error.message)
        throw error
    }
}

mongoose.connection.on("disconnected", () => {
    console.warn("MongoDB disconnected. Resetting cached connection...")
    cachedConnection = null
})

module.exports = connectDB
