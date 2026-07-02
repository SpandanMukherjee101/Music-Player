const { Busboy } = require("busboy")
const cloudinary = require("cloudinary").v2

module.exports = (req, res, next) => {
    if (!req.headers["content-type"] || !req.headers["content-type"].includes("multipart/form-data")) {
        return next()
    }

    const busboy = new Busboy({ headers: req.headers })
    const fields = {}
    let uploadResult = null
    let uploadError = null
    let fileHandled = false
    let finished = false
    let fileInfo = {}

    const maybeFinish = () => {
        if (!finished) return
        if (uploadError) return next(uploadError)

        req.body = { ...req.body, ...fields }
        if (fileHandled && uploadResult) {
            req.file = {
                fieldname: fileInfo.fieldname,
                originalname: fileInfo.originalname,
                encoding: fileInfo.encoding,
                mimetype: fileInfo.mimetype,
                cloudinary: uploadResult,
            }
        }

        next()
    }

    busboy.on("field", (name, val) => {
        const key = name === "genre[]" ? "genre" : name

        if (key === "genre") {
            if (typeof val === "string" && val.trim().startsWith("[") && val.trim().endsWith("]")) {
                try {
                    fields.genre = JSON.parse(val)
                    return
                } catch (err) {
                    // fall back to comma-split
                }
            }

            fields.genre = fields.genre || []
            fields.genre.push(...val.split(",").map((item) => item.trim()).filter(Boolean))
            return
        }

        fields[key] = val
    })

    busboy.on("file", (fieldname, file, filename, encoding, mimetype) => {
        if (fieldname !== "file") {
            file.resume()
            return
        }

        fileHandled = true
        fileInfo = { fieldname, originalname: filename, encoding, mimetype }

        const uploadStream = cloudinary.uploader.upload_stream(
            { resource_type: "auto" },
            (err, result) => {
                if (err) {
                    uploadError = err
                    return maybeFinish()
                }

                uploadResult = result
                maybeFinish()
            }
        )

        file.on("error", (err) => {
            uploadError = err
            uploadStream.end()
        })

        file.pipe(uploadStream)
    })

    busboy.on("finish", () => {
        finished = true
        maybeFinish()
    })

    req.pipe(busboy)
}
