const express = require('express');
const router = express.Router();
const { getDB } = require('../config/db');

router.get('/admins', async (req, res) => {
    const adminCollection = getDB().collection("admins");
    const result = await adminCollection.find().toArray();
    res.send(result);
});

router.post('/admin', async (req, res) => {
    const adminCollection = getDB().collection("admins");
    const adminData = req.body;

    if (!adminData.email) {
        return res.status(400).json({ message: "Email is required to identify the admin" });
    }

    try {
        const currentTime = new Date();
        const existingAdmin = await adminCollection.findOne({ email: adminData.email });

        if (existingAdmin) {
            const updateResult = await adminCollection.updateOne(
                { email: adminData.email },
                {
                    $set: {
                        ...adminData,
                        updatedAt: currentTime
                    }
                }
            );

            if (updateResult.modifiedCount > 0) {
                return res.status(200).json({ message: "Admin profile updated successfully" });
            } else {
                return res.status(400).json({ message: "No changes were made to the admin profile" });
            }
        } else {
            const insertResult = await adminCollection.insertOne({
                ...adminData,
                createdAt: currentTime,
                updatedAt: currentTime
            });

            return res.status(201).json({
                message: "Admin profile created successfully",
                insertedId: insertResult.insertedId
            });
        }
    } catch (error) {
        console.error('Error processing admin data:', error);
        return res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
