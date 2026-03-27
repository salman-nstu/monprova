const router = require("express").Router();
const pdfCtrl = require("../controllers/pdf");
const { ObjectId } = require('mongodb');

router.get("/", async (req, res) => {
  res.json({ message: 'Hello!' });
});

router.get("/pdf/getpdf/:appointmentId", async (req, res) => {
  const { appointmentId } = req.params;

  if (!ObjectId.isValid(appointmentId)) {
    return res.status(400).json({ message: "Invalid Appointment ID" });
  }

  try {
    const appointmentObjectId = new ObjectId(appointmentId);

    const pdfBuffer = await pdfCtrl.createPDF(appointmentObjectId);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="prescription.pdf"'
    );

    res.send(pdfBuffer);
  } catch (error) {
    console.error("PDF Generation Error:", error);
    res.status(500).json({ message: "Error generating PDF" });
  }
});



module.exports = router;
