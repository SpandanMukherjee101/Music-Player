const path = require('path')
const multer  = require('multer')

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '/Music-Player/uploads')
  },
  filename: function (req, file, cb) {
    cb(null, req.body.info + path.extname(file.originalname))
  }
})

module.exports = multer({ storage: storage })