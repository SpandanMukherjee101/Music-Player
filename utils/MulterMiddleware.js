const path = require("path")
const multer = require("multer")
const cloudinary = require("cloudinary").v2

const storage = multer.memoryStorage()
const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } })

module.exports = (req, res, next) => {
    const single = upload.single("file")
    single(req, res, async (err) => {
        if (err) return next(err)
        if (!req.file) return next()

        try {
            const file = req.file
            const base64 = file.buffer.toString("base64")
            const dataUri = `data:${file.mimetype};base64,${base64}`
            const result = await cloudinary.uploader.upload(dataUri, { resource_type: "auto" })
            req.file.cloudinary = result
            return next()
        } catch (uploadErr) {
            return next(uploadErr)
        }
    })
}