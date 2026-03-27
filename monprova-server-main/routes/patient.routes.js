const express = require('express');
const router = express.Router();
const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');

router.get('/patients', async (req, res) => {
    const patientCollection = getDB().collection("patients");
    const result = await patientCollection.find().toArray();
    res.send(result);
});

router.get('/patients/:id', async (req, res) => {
    const patientCollection = getDB().collection("patients");
    const id = req.params.id;
    try {
        const query = { _id: new ObjectId(id) };
        const result = await patientCollection.findOne(query);
        res.send(result);
    } catch (error) {
        console.error("Error fetching patient:", error);
        res.status(500).json({ message: "Server error" });
    }
});

router.post('/patient', async (req, res) => {
      const patientCollection = getDB().collection("patients");
      const patientData = req.body;

      if (!patientData.email) {
        return res.status(400).json({ message: "Email is required to identify the patient" });
      }

      try {
        const currentTime = new Date(); 
        const existingPatient = await patientCollection.findOne({ email: patientData.email });

        if (existingPatient) {
          const updateResult = await patientCollection.updateOne(
            { email: patientData.email }, 
            {
              $set: {
                ...patientData,
                updatedAt: currentTime  
              }
            }
          );

          if (updateResult.modifiedCount > 0) {
            return res.status(200).json({ message: "Patient profile updated successfully" });
          } else {
            return res.status(400).json({ message: "No changes were made to the patient profile" });
          }
        } else {
          const insertResult = await patientCollection.insertOne({
            ...patientData,
            createdAt: currentTime,  
            updatedAt: currentTime   
          });

          return res.status(201).json({
            message: "Patient profile created successfully",
            insertedId: insertResult.insertedId
          });
        }
      } catch (error) {
        console.error('Error processing patient data:', error);
        return res.status(500).json({ message: "Server error" });
      }
});

module.exports = router;
