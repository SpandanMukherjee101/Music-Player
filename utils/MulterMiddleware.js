const busboy = require("busboy");
const cloudinary = require("cloudinary").v2;

module.exports = (req, res, next) => {
    if (!req.headers["content-type"] || !req.headers["content-type"].includes("multipart/form-data")) {
        return next();
    }

    // FIX 1: Call busboy directly as a function, do not use 'new'
    const bb = busboy({ headers: req.headers });
    const fields = {};
    let uploadResult = null;
    let uploadError = null;
    let fileHandled = false;
    let finished = false;
    let fileInfo = {};

    const maybeFinish = () => {
        if (!finished) return;
        if (uploadError) return next(uploadError);

        req.body = { ...req.body, ...fields };
        if (fileHandled && uploadResult) {
            req.file = {
                fieldname: fileInfo.fieldname,
                originalname: fileInfo.originalname,
                encoding: fileInfo.encoding,
                mimetype: fileInfo.mimetype,
                cloudinary: uploadResult,
            };
        }

        next();
    };

    bb.on("field", (name, val) => {
        const key = name === "genre[]" ? "genre" : name;

        if (key === "genre") {
            if (typeof val === "string" && val.trim().startsWith("[") && val.trim().endsWith("]")) {
                try {
                    fields.genre = JSON.parse(val);
                    return;
                } catch (err) {
                    // fall back to comma-split
                }
            }

            fields.genre = fields.genre || [];
            fields.genre.push(...val.split(",").map((item) => item.trim()).filter(Boolean));
            return;
        }

        fields[key] = val;
    });

    // FIX 2: The 'file' event now passes an 'info' object containing the file metadata
    bb.on("file", (fieldname, file, info) => {
        const { filename, encoding, mimeType } = info;

        if (fieldname !== "file") {
            file.resume();
            return;
        }

        fileHandled = true;
        fileInfo = { fieldname, originalname: filename, encoding, mimetype: mimeType };

        const uploadStream = cloudinary.uploader.upload_stream(
            { resource_type: "auto" },
            (err, result) => {
                if (err) {
                    uploadError = err;
                    return maybeFinish();
                }

                uploadResult = result;
                maybeFinish();
            }
        );

        file.on("error", (err) => {
            uploadError = err;
            uploadStream.end();
        });

        file.pipe(uploadStream);
    });

    // FIX 3: The 'finish' event was renamed to 'close' in v1.x+
    bb.on("close", () => {
        finished = true;
        maybeFinish();
    });

    req.pipe(bb);
};