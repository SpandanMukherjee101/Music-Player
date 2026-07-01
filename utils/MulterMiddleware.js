const fs = require("fs")
const path = require("path")
const multer = require("multer")

const uploadDir = path.join(__dirname, "..", "uploads")
fs.mkdirSync(uploadDir, { recursive: true })

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir)
    },
    filename: function (req, file, cb) {
        const safeName = (req.body.info || "upload").toString().replace(/[^a-zA-Z0-9-_]/g, "_")
        cb(null, `${safeName}${path.extname(file.originalname)}`)
    },
})

module.exports = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 },
})