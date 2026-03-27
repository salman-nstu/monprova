const express = require("express");
const router = express.Router();
const uploadPdf = require("../middleware/uploadPdf");

router.post("/upload-pdf", uploadPdf.single("pdf"), (req, res) => {
  res.status(200).json({
    success: true,
    message: "PDF uploaded successfully",
    url: req.file.path,
    public_id: req.file.filename,
  });
});

module.exports = router;
