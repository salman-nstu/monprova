const express = require('express');
const router = express.Router();
const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');

// Get notifications for a user
router.get('/notifications/:email', async (req, res) => {
    try {
        const { email } = req.params;
        const notificationCollection = getDB().collection("notifications");
        
        // Find notifications where userEmail matches OR receiverEmail matches
        const result = await notificationCollection
            .find({ userEmail: email })
            .sort({ createdAt: -1 })
            .limit(50) // Limit to last 50 notifications
            .toArray();
            
        res.send(result);
    } catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Get unread count
router.get('/notifications/:email/unread-count', async (req, res) => {
    try {
        const { email } = req.params;
        const notificationCollection = getDB().collection("notifications");
        
        const count = await notificationCollection.countDocuments({
            userEmail: email,
            isRead: false
        });
        
        res.json({ count });
    } catch (error) {
        console.error("Error fetching unread count:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Mark single notification as read
router.patch('/notifications/:id/read', async (req, res) => {
    try {
        const { id } = req.params;
        const notificationCollection = getDB().collection("notifications");
        
        const result = await notificationCollection.updateOne(
            { _id: new ObjectId(id) },
            { $set: { isRead: true } }
        );
        
        res.send(result);
    } catch (error) {
        console.error("Error marking notification as read:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Mark all as read for a user
router.patch('/notifications/:email/read-all', async (req, res) => {
    try {
        const { email } = req.params;
        const notificationCollection = getDB().collection("notifications");
        
        const result = await notificationCollection.updateMany(
            { userEmail: email, isRead: false },
            { $set: { isRead: true } }
        );
        
        res.send(result);
    } catch (error) {
        console.error("Error marking all notifications as read:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Delete notification
router.delete('/notifications/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const notificationCollection = getDB().collection("notifications");
        
        const result = await notificationCollection.deleteOne({ _id: new ObjectId(id) });
        res.send(result);
    } catch (error) {
        console.error("Error deleting notification:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Create notification (internal or external use)
router.post('/notifications', async (req, res) => {
    try {
        const notificationCollection = getDB().collection("notifications");
        const notification = {
            ...req.body,
            createdAt: new Date(),
            isRead: false
        };
        
        const result = await notificationCollection.insertOne(notification);
        res.send(result);
    } catch (error) {
        console.error("Error creating notification:", error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
