const express = require('express');
const router = express.Router();
const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');

// Get all payouts or filtered by doctorId
router.get('/payouts', async (req, res) => {
    try {
        const payoutCollection = getDB().collection("payouts");
        const { doctorId } = req.query;
        let query = {};

        if (doctorId) {
            query.doctorId = doctorId;
        }

        const result = await payoutCollection.find(query).sort({ timestamp: -1 }).toArray();
        res.send(result);
    } catch (error) {
        console.error("Error fetching payouts:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Create a new payout
router.post('/payouts', async (req, res) => {
    try {
        const payoutCollection = getDB().collection("payouts");
        const payoutData = req.body;

        // Validate required fields
        if (!payoutData.doctorId || !payoutData.amount) {
            return res.status(400).json({ message: "Doctor ID and amount are required" });
        }
        
        // Add timestamp if missing
        if (!payoutData.timestamp) {
            payoutData.timestamp = new Date();
        }

        const result = await payoutCollection.insertOne(payoutData);

        // Notify Doctor
        try {
            const doctorCollection = getDB().collection("doctors");
            const notificationCollection = getDB().collection("notifications");
            
            // Try to find doctor to get email
            let doctorId = payoutData.doctorId;
            // Handle if ID is ObjectId or string
            let query = {};
            try {
                query = { _id: new ObjectId(doctorId) };
            } catch (e) {
                query = { _id: doctorId }; 
            }
            
            const doctor = await doctorCollection.findOne(query);

            if (doctor && doctor.email) {
                await notificationCollection.insertOne({
                    userEmail: doctor.email,
                    message: `A payout of $${payoutData.amount} has been processed. Status: ${payoutData.status || 'Processed'}.`,
                    isRead: false,
                    createdAt: new Date(),
                    type: "payout"
                });
            }
        } catch (notifError) {
            console.error("Error creating payout notification:", notifError);
            // Don't fail the request if notification fails
        }

        res.send(result);
    } catch (error) {
        console.error("Error creating payout:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Get payout by ID
router.get('/payouts/:id', async (req, res) => {
    try {
        const payoutCollection = getDB().collection("payouts");
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await payoutCollection.findOne(query);
        res.send(result);
    } catch (error) {
        console.error("Error fetching payout:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Update payout
router.put('/payouts/:id', async (req, res) => {
    try {
        const payoutCollection = getDB().collection("payouts");
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
        const updateDoc = {
            $set: req.body
        };
        const result = await payoutCollection.updateOne(filter, updateDoc);
        res.send(result);
    } catch (error) {
        console.error("Error updating payout:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Delete payout
router.delete('/payouts/:id', async (req, res) => {
    try {
        const payoutCollection = getDB().collection("payouts");
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await payoutCollection.deleteOne(query);
        res.send(result);
    } catch (error) {
        console.error("Error deleting payout:", error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
