const express = require('express');
const router = express.Router();
const axios = require('axios');
const fs = require('fs');
const { ObjectId } = require('mongodb');
const pdfCtrl = require("../controllers/pdf"); 

router.get("/download-pdf", async (req, res) => {
  const pdfUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/raw/upload/pdfs/prescription`; 

  try {
    const response = await axios.get(pdfUrl, { responseType: "stream" });

    res.setHeader("Content-Disposition", 'attachment; filename="prescription.pdf"');
    res.setHeader("Content-Type", "application/pdf");

    response.data.pipe(res);
  } catch (err) {
    res.status(500).send("Failed to download PDF");
  }
});


router.get("/download-pdf/:publicId", async (req, res) => {
  const { publicId } = req.params;

  const pdfUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/raw/upload/${publicId}`;

  try {
    const response = await axios.get(pdfUrl, { responseType: "stream" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      'inline; filename="prescription.pdf"'
    );

    response.data.pipe(res);
  } catch (err) {
    res.status(500).send("Failed to load PDF");
  }
});

router.get("/pdf/getpdf/:appointmentId", async (req, res) => {
  const { appointmentId } = req.params; 
  const appointmentObjectId = new ObjectId(appointmentId);

  if (!appointmentObjectId) {
    return res.status(400).json({ message: "Appointment ID is required" });
  }

  try {
    await pdfCtrl.createPDF(req, res, appointmentObjectId);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error generating PDF" });
  }
});

router.get('/generate-pdf/:appointmentId', async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const appointmentObjectId = new ObjectId(appointmentId);

    await pdfCtrl.createPDF(req, res, appointmentObjectId);

  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).send('An error occurred while generating the PDF.');
  }
});

module.exports = router;
