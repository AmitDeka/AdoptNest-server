const multer = require("multer");

// Handle multer errors separately
const multerErrorHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({
        message: "You can upload a maximum of 5 images.",
      });
    }
  }
  next(err);
};

module.exports = multerErrorHandler;
