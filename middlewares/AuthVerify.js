const jwt = require('jsonwebtoken');

require('dotenv').config()
const SECRET_KEY = process.env.SECRET_KEY

module.exports = (req, res, next) => {
    const token = req.headers['token']
    if (!token) return res.status(401).send({ message: "Token is required" });

    const cleanedtoken = token.replace(/^"|"$/g, '')

    jwt.verify(cleanedtoken, SECRET_KEY, (error, decoded) => {
        if (error) {
            return res.status(403).send({ message: error })
        }

        req.email = decoded.email
        next()
    })
}