const express = require('express');
const router = express.Router();
const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');

router.get('/questions', async (req, res) => {
    const questionCollection = getDB().collection("questions");
    const result = await questionCollection.find().toArray();
    res.send(result);
});

router.get('/replies', async (req, res) => {
    const replyCollection = getDB().collection("replies");
    const result = await replyCollection.find().toArray();
    res.send(result);
});

router.patch('/question/:questionId', async (req, res) => {
    const questionCollection = getDB().collection("questions");
    const { questionId } = req.params;
    const { status } = req.body;

    if (!["approved", "declined"].includes(status)) {
        return res.status(400).json({ message: "Invalid status value" });
    }

    try {
        const questionObjectId = new ObjectId(questionId);
        const result = await questionCollection.updateOne(
            { _id: questionObjectId },
            { $set: { status } }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: "Question not found" });
        }

        res.status(200).json({ message: `Question ${status} successfully` });
    } catch (error) {
        console.error("Error updating question status:", error);
        res.status(500).json({ message: "Server error" });
    }
});

router.post('/question/reply/:questionId', async (req, res) => {
      const { questionId } = req.params;
      const replyData = req.body;
      const questionCollection = getDB().collection("questions");
      const replyCollection = getDB().collection("replies");
      const notificationCollection = getDB().collection("notifications");
      
      try {
        const questionObjectId = new ObjectId(questionId);

        const question = await questionCollection.findOne({ _id: questionObjectId });

        const reply = {
          ...replyData,
          questionId: questionObjectId,
          createdAt: new Date(),
        };

        const result = await replyCollection.insertOne(reply);

        if (question && question.patientEmail) {
          const notification = {
            userEmail: question.patientEmail,
            type: 'help_reply',
            message: `ডাক্তার আপনার প্রশ্নের উত্তর দিয়েছেন।`,
            relatedId: questionId,
            isRead: false,
            createdAt: new Date()
          };
          await notificationCollection.insertOne(notification);
        }

        res.send(result);
      } catch (error) {
        console.error('Error replying to question:', error);
        res.status(500).json({ message: "Server error" });
      }
});

router.post('/question', async (req, res) => {
    const questionCollection = getDB().collection("questions");
    const questionData = req.body;
    const result = await questionCollection.insertOne(questionData);
    res.send(result);
});

module.exports = router;
