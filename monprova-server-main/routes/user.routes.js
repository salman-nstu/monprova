const express = require('express');
const router = express.Router();
const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');

router.get('/users', async (req, res) => {
    const userCollection = getDB().collection("users");
    const result = await userCollection.find().toArray();
    res.send(result);
});

router.get('/users/:id', async (req, res) => {
    const userCollection = getDB().collection("users");
    const id = req.params.id;
    try {
        const query = { _id: new ObjectId(id) };
        const result = await userCollection.findOne(query);
        res.send(result);
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ message: "Server error" });
    }
});

router.post('/register', async (req, res) => {
    const userCollection = getDB().collection("users");
    const patientCollection = getDB().collection("patients"); // Linked collection
    const doctorCollection = getDB().collection("doctors");   // Linked collection

    try {
        const newUser = req.body;
        const currentTime = new Date();

        if (!newUser.email) {
          return res.status(400).json({ message: "Email is required to identify the user" });
        }

        const query = { email: newUser.email };
        const existingUser = await userCollection.findOne(query);

        if (existingUser) {
          // Update User
          const updateResult = await userCollection.updateOne(
            { email: newUser.email }, 
            {
              $set: {
                ...newUser,        
                updatedAt: currentTime 
              }
            }
          );
          
          // Sync to Patients or Doctors collection if applicable
          if (newUser.role === 'patient') {
              const patientUpdate = await patientCollection.updateOne(
                  { email: newUser.email },
                  { $set: { ...newUser, updatedAt: currentTime } },
                  { upsert: true }
              );
              // If upserted, we might want to ensure _id matches? Too late for existing, but okay for new.
          } else if (newUser.role === 'doctor') {
              // Be careful not to overwrite specific doctor fields
               const doctorUpdate = await doctorCollection.updateOne(
                  { email: newUser.email },
                  { $set: { name: newUser.name, email: newUser.email, image: newUser.image, role: 'doctor', updatedAt: currentTime } },
                  { upsert: true }
              );
          }

          if (updateResult.modifiedCount > 0) {
            return res.status(200).json({
              message: "User profile updated successfully",
              updatedId: existingUser._id
            });
          } else {
            // Even if user didn't change, we might have synced others
            return res.status(200).json({ message: "User profile synced/checked" });
          }
        } else {
          // CREATE NEW
          // 1. Create User
          const insertResult = await userCollection.insertOne({
            ...newUser,
            createdAt: currentTime,  
            updatedAt: currentTime   
          });

          // 2. Sync to Linked Collection
          // We use the SAME _id for the specific collection to ensure ease of lookup by ID
          if (newUser.role === 'patient') {
             await patientCollection.insertOne({
                 _id: insertResult.insertedId, // Sync ID
                 ...newUser,
                 createdAt: currentTime,
                 updatedAt: currentTime
             });
          } else if (newUser.role === 'doctor') {
             await doctorCollection.insertOne({
                 _id: insertResult.insertedId, // Sync ID
                 ...newUser,
                 verificationStatus: 'not-verified', // Default for doctor
                 createdAt: currentTime,
                 updatedAt: currentTime
             });
          }

          // Welcome Notification
          const notificationCollection = getDB().collection("notifications");
          await notificationCollection.insertOne({
              userEmail: newUser.email,
              message: "Welcome to Monprova! We are glad to have you here.",
              isRead: false,
              createdAt: new Date(),
              type: "welcome"
          });

          return res.status(201).json({
            message: "User profile created successfully",
            insertedId: insertResult.insertedId
          });
        }
      } catch (err) {
        console.error('Error processing user data:', err);
        res.status(500).json({ message: "Server error" });
      }
});

router.delete('/users/:id', async (req, res) => {
    const userCollection = getDB().collection("users");
    const id = req.params.id;
    try {
        const query = { _id: new ObjectId(id) };
        const result = await userCollection.deleteOne(query);
        res.send(result);
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
