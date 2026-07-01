const jwt = require("jsonwebtoken")
require("dotenv").config()

const SECRET_KEY = process.env.SECRET_KEY

module.exports = (req, res, next) => {
    if (!SECRET_KEY) {
        return res.status(500).json({ message: "Server misconfiguration" })
    }

    const authHeader = req.headers.authorization
    const token = authHeader?.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : req.headers.token || req.headers["x-auth-token"]

    if (!token) {
        return res.status(401).json({ message: "Token is required" })
    }

    jwt.verify(token.replace(/^"|"$/g, ""), SECRET_KEY, (error, decoded) => {
        if (error) {
            return res.status(403).json({ message: "Invalid token" })
        }

        req.email = decoded.email
        next()
    })
}