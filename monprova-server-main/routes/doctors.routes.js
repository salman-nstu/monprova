const express = require('express');
const router = express.Router();
const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');

// Get Verification Requests by Status
router.get('/doctors/verification-requests', async (req, res) => {
  const status = req.query.status;
  const doctorCollection = getDB().collection("doctors");
  
  try {
      const query = { verificationStatus: status };
      const result = await doctorCollection.find(query).toArray();
      res.json({ success: true, data: result });
  } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get All Verification Requests
router.get('/doctors/all-verification-requests', async (req, res) => {
  const doctorCollection = getDB().collection("doctors");

  try {
      // Fetch doctors who have a verificationStatus (excluding 'not-verified' if desired, or all)
      // Usually admin wants to see pending, verified, rejected.
      let query;
      // If we want to see ALL, we can just use {} or filter out not-verified if that's noisy
      // query = { verificationStatus: { $in: ['pending', 'verified', 'rejected'] } }; 
      
      // Let's show everything for now to be safe, or as per original logic
      query = {}; // Show ALL doctors

      const result = await doctorCollection.find(query).toArray();
      res.json({ success: true, data: result });
  } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/doctors', async (req, res) => {
    const doctorCollection = getDB().collection("doctors");
    const result = await doctorCollection.find().toArray();
    res.send(result);
});

router.get('/doctors/:id', async (req, res) => {
    const doctorCollection = getDB().collection("doctors");
    const id = req.params.id;
    try {
        const query = { _id: new ObjectId(id) };
        const result = await doctorCollection.findOne(query);
        res.send(result);
    } catch (error) {
        console.error("Error fetching doctor:", error);
        res.status(500).json({ message: "Server error" });
    }
});

router.delete('/doctors/:id', async (req, res) => {
    const doctorCollection = getDB().collection("doctors");
    const id = req.params.id;
    try {
        const query = { _id: new ObjectId(id) };
        const result = await doctorCollection.deleteOne(query);
        res.send(result);
    } catch (error) {
        console.error("Error deleting doctor:", error);
        res.status(500).json({ message: "Server error" });
    }
});

router.post('/doctor', async (req, res) => {
      const doctorCollection = getDB().collection("doctors");
      const doctorData = req.body;

      if (!doctorData.email) {
        return res.status(400).json({ message: "Email is required to identify the doctor" });
      }

      try {
        const currentTime = new Date(); 
        const existingDoctor = await doctorCollection.findOne({ email: doctorData.email });

        if (existingDoctor) {
          const updateData = {
            ...doctorData,
            updatedAt: currentTime
          };

          if (!doctorData.verificationStatus && existingDoctor.verificationStatus) {
            updateData.verificationStatus = existingDoctor.verificationStatus;
          }

          const updateResult = await doctorCollection.updateOne(
            { email: doctorData.email },
            { $set: updateData }
          );

          if (updateResult.modifiedCount > 0) {
            return res.status(200).json({ message: "Doctor profile updated successfully" });
          } else {
            return res.status(400).json({ message: "No changes were made to the doctor profile" });
          }
        } else {
          const insertResult = await doctorCollection.insertOne({
            ...doctorData,
            verificationStatus: doctorData.verificationStatus || 'not-verified',
            createdAt: currentTime, 
            updatedAt: currentTime
          });

          return res.status(201).json({
            message: "Doctor profile created successfully",
            insertedId: insertResult.insertedId
          });
        }
      } catch (error) {
        console.error('Error processing doctor data:', error);
        return res.status(500).json({ message: "Server error" });
      }
});

// Request Verification
router.post('/doctors/request-verification', async (req, res) => {
  const { email } = req.body;
  const doctorCollection = getDB().collection("doctors");
  const notificationCollection = getDB().collection("notifications");

  try {
      const result = await doctorCollection.updateOne(
          { email: email },
          { $set: { verificationStatus: 'pending' } }
      );

      if (result.modifiedCount > 0) {
          // Notify Doctor
          await notificationCollection.insertOne({
              userEmail: email,
              message: "Your verification request has been submitted successfully. Please wait for admin approval.",
              isRead: false,
              createdAt: new Date(),
              type: "doctor-verification"
          });

          res.json({ success: true, message: 'Verification request submitted' });
      } else {
          res.status(400).json({ success: false, message: 'Failed to submit request' });
      }
  } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Verify Doctor
router.put('/doctors/verify/:id', async (req, res) => {
  const id = req.params.id;
  const { action } = req.body; // 'verify' or 'reject'
  const doctorCollection = getDB().collection("doctors");
  const notificationCollection = getDB().collection("notifications");

  console.log(`Verifying doctor: ${id} with action: ${action}`);

  try {
      let query;
      try {
          query = { _id: new ObjectId(id) };
      } catch (e) {
          console.error("Invalid ObjectId:", id);
          return res.status(400).json({ success: false, message: 'Invalid Doctor ID' });
      }

      // Get doctor email for notification
      const doctor = await doctorCollection.findOne(query);
      if (!doctor) {
           return res.status(404).json({ success: false, message: 'Doctor not found' });
      }

      let updateDoc = {};
      let notificationMessage = "";

      if (action === 'verify') {
          updateDoc = { verificationStatus: 'verified' };
          notificationMessage = "Congratulations! Your doctor profile has been verified. You can now access all doctor features.";
      } else if (action === 'reject') {
          updateDoc = { verificationStatus: 'rejected' };
          notificationMessage = "Your doctor verification request has been rejected. Please contact support or update your profile.";
      } else {
          // Default specific logic if needed, or fallback
          updateDoc = { verificationStatus: 'verified' }; 
          notificationMessage = "Your doctor profile has been verified.";
      }

      const result = await doctorCollection.updateOne(
          query,
          { $set: updateDoc }
      );

      console.log("Update result:", result);

      if (result.matchedCount > 0) {
          // If modified or already set, we consider it success for the UI
          if (result.modifiedCount > 0) {
              // Only notify if status actually changed
              await notificationCollection.insertOne({
                  userEmail: doctor.email,
                  message: notificationMessage,
                  isRead: false,
                  createdAt: new Date(),
                  type: "doctor-verification"
              });
          }
          res.json({ success: true, message: 'Doctor status updated' });
      } else {
          res.status(400).json({ success: false, message: 'Failed to update status (No match)' });
      }
  } catch (error) {
      console.error("Verify endpoint error:", error);
      res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
