const express = require('express');
const router = express.Router();
const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');

router.get('/complaints', async (req, res) => {
    const complaintCollection = getDB().collection("complaints");
    const result = await complaintCollection.find().toArray();
    res.send(result);
});

router.post('/complaints', async (req, res) => {
    const complaintCollection = getDB().collection("complaints");
    const notificationCollection = getDB().collection("notifications");
    const complaintData = req.body;
    complaintData.createdAt = new Date();
    const result = await complaintCollection.insertOne(complaintData);

    if (complaintData.email) {
        await notificationCollection.insertOne({
            userEmail: complaintData.email,
            message: "We have received your complaint regarding '" + (complaintData.subject || complaintData.category || 'Issue') + "'. Our team will review it shortly.",
            isRead: false,
            createdAt: new Date(),
            type: "complaint"
        });
    }

    res.send(result);
});

router.patch("/complaints/:id", async (req, res) => {
    const complaintCollection = getDB().collection("complaints");
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
        return res.status(400).json({ message: "Status is required" });
    }

    try {
        const complaint = await complaintCollection.findOne({ _id: new ObjectId(id) });
        
        const result = await complaintCollection.updateOne(
            { _id: new ObjectId(id) },
            { $set: { status } }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: "Complaint not found" });
        }

        if (complaint && complaint.email) {
            const notificationCollection = getDB().collection("notifications");
            await notificationCollection.insertOne({
                userEmail: complaint.email,
                message: `Your complaint status has been updated to: ${status}`,
                isRead: false,
                createdAt: new Date(),
                type: "complaint"
            });
        }

        res.json({
            success: true,
            message: "Complaint status updated successfully",
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to update complaint status",
            error: error.message,
        });
    }
});

module.exports = router;
