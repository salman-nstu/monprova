const express = require('express');
const router = express.Router();
const { getDB } = require('../config/db');

router.get('/videos', async (req, res) => {
    const videoCollection = getDB().collection("videos");
    const result = await videoCollection.find().toArray();
    res.send(result);
});

router.post('/videos', async (req, res) => {
    const videoCollection = getDB().collection("videos");
    try {
        const videoData = req.body;

        if (!videoData.title || !videoData.category || !videoData.videoLink) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }

        try {
            new URL(videoData.videoLink);
        } catch (error) {
            return res.status(400).json({ success: false, message: 'Invalid video URL format' });
        }

        const newVideo = {
            ...videoData,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const result = await videoCollection.insertOne(newVideo);

        return res.status(201).json({
            success: true,
            message: 'Video uploaded successfully',
            videoId: result.insertedId
        });
    } catch (error) {
        console.error("Video upload error:", error);
        return res.status(500).json({
            success: false,
            message: 'Failed to upload video'
        });
    }
});

module.exports = router;
