const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: (req, file) => {
    return {
      folder: "pdfs",
      resource_type: "raw", // REQUIRED for PDF
      allowed_formats: ["pdf"],
      public_id: "prescription", // 👈 custom filename WITHOUT extension
      overwrite: true,          // optional: overwrite if exists
    };
  },
});

const uploadPdf = multer({ storage });

module.exports = uploadPdf;
