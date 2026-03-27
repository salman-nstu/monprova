const express = require('express');
const router = express.Router();
const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');
const generatePrescriptionPDF = require('../utils/generatePrescriptionPDF');

router.get('/prescriptions', async (req, res) => {
    const prescriptionCollection = getDB().collection("prescriptions");
    const result = await prescriptionCollection.find().toArray();
    res.send(result);
});

router.post('/prescription', async (req, res) => {
      const prescriptionCollection = getDB().collection("prescriptions");
      const notificationCollection = getDB().collection("notifications");
      const prescriptionData = req.body;

      // ✅ Must have appointmentID to identify a prescription uniquely
      if (!prescriptionData.appointmentID) {
        return res.status(400).json({ message: "appointmentID is required" });
      }

      try {
        const query = { appointmentID: prescriptionData.appointmentID };

        const existingPrescription = await prescriptionCollection.findOne(query);

        if (existingPrescription) {
          // ✅ Update existing prescription
          const updateResult = await prescriptionCollection.updateOne(
            query,
            {
              $set: {
                ...prescriptionData,
                updatedAt: new Date(),
              },
            }
          );

          if (updateResult.modifiedCount > 0) {
            // Create notification for prescription update
            if (prescriptionData.patientEmail) {
              const notification = {
                userEmail: prescriptionData.patientEmail,
                type: 'prescription',
                message: `ডাক্তার আপনার প্রেসক্রিপশন আপডেট করেছেন।`,
                relatedId: prescriptionData.appointmentID,
                isRead: false,
                createdAt: new Date()
              };
              await notificationCollection.insertOne(notification);
            }
            return res.status(200).json({ message: "Prescription updated successfully" });
          }

          return res.status(200).json({ message: "No changes were made to the prescription" });
        } else {
          // ✅ Insert new prescription
          const newDoc = {
            ...prescriptionData,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          const insertResult = await prescriptionCollection.insertOne(newDoc);

          // Create notification for new prescription
          if (prescriptionData.patientEmail) {
            const notification = {
              userEmail: prescriptionData.patientEmail,
              type: 'prescription',
              message: `ডাক্তার আপনার জন্য একটি নতুন প্রেসক্রিপশন তৈরি করেছেন।`,
              relatedId: prescriptionData.appointmentID,
              isRead: false,
              createdAt: new Date()
            };
            await notificationCollection.insertOne(notification);
          }

          return res.status(201).json({
            message: "Prescription created successfully",
            insertedId: insertResult.insertedId,
          });
        }
      } catch (error) {
        console.error("Error processing prescription data:", error);
        return res.status(500).json({ message: "Server error" });
      }
});

router.get("/prescription/:appointmentID/pdf", async (req, res) => {
      const { appointmentID } = req.params;
      const prescriptionCollection = getDB().collection("prescriptions");
      const patientCollection = getDB().collection("patients");
      const doctorCollection = getDB().collection("doctors");
      const appointmentCollection = getDB().collection("appointments");

      try {
        const prescription = await prescriptionCollection.findOne({ appointmentID });

        if (!prescription) {
          return res.status(404).json({ message: "Prescription not found" });
        }
        const patient = await patientCollection.findOne({ _id: new ObjectId(prescription.patientID) });
        const doctor = await doctorCollection.findOne({ _id: new ObjectId(prescription.doctorID) });
        const appointment = await appointmentCollection.findOne({ _id: new ObjectId(prescription.appointmentID) });

        generatePrescriptionPDF(prescription, patient, doctor, appointment, res);

      } catch (error) {
        console.error("PDF generation error:", error);
        res.status(500).json({ message: "Failed to generate PDF" });
      }
});

module.exports = router;
