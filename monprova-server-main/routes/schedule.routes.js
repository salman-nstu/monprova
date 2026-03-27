const express = require('express');
const router = express.Router();
const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');

router.post('/saveschedule', async (req, res) => {
    const scheduleCollection = getDB().collection("schedules");
    const scheduleData = req.body;

    if (!scheduleData.doctorID) {
        return res.status(400).json({ message: "Doctor ID is required to identify the doctor" });
    }

    try {
        const currentTime = new Date();
        const existingSchedule = await scheduleCollection.findOne({ doctorID: scheduleData.doctorID });

        if (existingSchedule) {
            const updateResult = await scheduleCollection.updateOne(
                { doctorID: scheduleData.doctorID },
                {
                    $set: {
                        ...scheduleData,
                        updatedAt: currentTime
                    }
                }
            );

            if (updateResult.modifiedCount > 0) {
                return res.status(200).json({ message: "Schedule updated successfully" });
            } else {
                return res.status(400).json({ message: "No changes were made to the schedule" });
            }
        } else {
            const insertResult = await scheduleCollection.insertOne({
                ...scheduleData,
                createdAt: currentTime,
                updatedAt: currentTime
            });

            return res.status(201).json({
                message: "Schedule created successfully",
                insertedId: insertResult.insertedId
            });
        }
    } catch (error) {
        console.error('Error processing schedule data:', error);
        return res.status(500).json({ message: "Server error" });
    }
});

router.get('/schedules', async (req, res) => {
    const scheduleCollection = getDB().collection("schedules");
    const result = await scheduleCollection.find().toArray();
    res.send(result);
});

router.patch('/schedule/:scheduleId', async (req, res) => {
    const scheduleCollection = getDB().collection("schedules");
    const { scheduleId } = req.params;
    const { day, time, status } = req.body;

    if (!day || !time || !status) {
        return res.status(400).json({ message: "Day, time, and status are required" });
    }

    try {
        const scheduleObjectId = new ObjectId(scheduleId);
        const schedule = await scheduleCollection.findOne({ _id: scheduleObjectId });

        if (!schedule) {
            return res.status(404).json({ message: "Schedule not found" });
        }

        if (!schedule.availability[day]) {
            return res.status(404).json({ message: `Day ${day} not found in schedule` });
        }

        const slotIndex = schedule.availability[day].findIndex(slot => slot.time === time);

        if (slotIndex === -1) {
            return res.status(404).json({ message: `Time slot ${time} not found on ${day}` });
        }

        schedule.availability[day][slotIndex].status = status;

        const result = await scheduleCollection.updateOne(
            { _id: scheduleObjectId },
            { $set: { [`availability.${day}`]: schedule.availability[day], updatedAt: new Date() } }
        );

        res.status(200).json({ message: `Time slot ${time} on ${day} updated to ${status} successfully` });
    } catch (error) {
        console.error('Error updating schedule:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
