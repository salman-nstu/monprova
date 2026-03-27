const express = require('express');
const router = express.Router();
const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');

router.post('/assessments', async (req, res) => {
    const assessmentCollection = getDB().collection("assessments");
    try {
        const assessmentData = req.body;

        if (!assessmentData.patientID || !assessmentData.assessmentType) {
            return res.status(400).json({ message: "Patient ID and Assessment Type are required" });
        }

        if (assessmentData.patientEmail && assessmentData.assessmentId) {
            const submittedAt = assessmentData.date ? new Date(assessmentData.date) : new Date();
            const startOfDay = new Date(submittedAt);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(submittedAt);
            endOfDay.setHours(23, 59, 59, 999);

            const duplicate = await assessmentCollection.findOne({
            patientEmail: assessmentData.patientEmail,
            assessmentId: assessmentData.assessmentId,
            date: { $gte: startOfDay.toISOString(), $lte: endOfDay.toISOString() }
            });

            if (duplicate) {
            return res.status(409).json({ message: 'You have already completed this assessment today.' });
            }
        }

        const maxScores = {
            'PHQ-9': 27,
            'GAD-7': 21,
            'PSS-10': 40
        };

        const maxScore = maxScores[assessmentData.assessmentType];
        if (assessmentData.score < 0 || assessmentData.score > maxScore) {
            return res.status(400).json({ message: `Score must be between 0 and ${maxScore} for ${assessmentData.assessmentType}` });
        }

        assessmentData.createdAt = new Date();
        assessmentData.updatedAt = new Date();

        const result = await assessmentCollection.insertOne(assessmentData);
        res.status(201).json({
            success: true,
            message: 'Assessment created successfully',
            insertedId: result.insertedId
        });
    } catch (error) {
        console.error('Error creating assessment:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.get('/assessments', async (req, res) => {
    const assessmentCollection = getDB().collection("assessments");
    try {
        const patientEmail = req.query.email;

        if (!patientEmail) {
          return res.status(400).json({ message: "Patient email is required" });
        }

        const assessments = await assessmentCollection
          .find({ patientEmail: patientEmail })
          .sort({ date: -1 })
          .toArray();

        res.status(200).json({ success: true, data: assessments });
    } catch (error) {
        console.error('Error fetching assessments:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.get('/assessments/history/30days', async (req, res) => {
    const assessmentCollection = getDB().collection("assessments");
    try {
        const patientEmail = req.query.email;

        if (!patientEmail) {
          return res.status(400).json({ message: "Patient email is required" });
        }

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const assessments = await assessmentCollection
          .find({
            patientEmail: patientEmail,
            date: { $gte: thirtyDaysAgo.toISOString() }
          })
          .sort({ date: 1 })
          .toArray();

        const assessmentMap = {};
        assessments.forEach(assessment => {
          const dateKey = new Date(assessment.date).toISOString().split('T')[0];
          assessmentMap[dateKey] = assessment;
        });

        const result = [];
        let lastScore = null;
        let lastAssessmentType = null;
        let lastSeverity = null;

        for (let i = 0; i < 30; i++) {
          const date = new Date(thirtyDaysAgo);
          date.setDate(date.getDate() + i);
          const dateKey = date.toISOString().split('T')[0];

          if (assessmentMap[dateKey]) {
            const assessment = assessmentMap[dateKey];
            lastScore = assessment.score;
            lastAssessmentType = assessment.assessmentType;
            lastSeverity = assessment.severity;

            result.push({
              date: dateKey,
              score: assessment.score,
              assessmentType: assessment.assessmentType,
              severity: assessment.severity,
              severityBangla: assessment.severityBangla,
              isCarriedForward: false
            });
          } else if (lastScore !== null) {
            result.push({
              date: dateKey,
              score: lastScore,
              assessmentType: lastAssessmentType,
              severity: lastSeverity,
              isCarriedForward: true
            });
          }
        }

        res.status(200).json({ success: true, data: result });
      } catch (error) {
        console.error('Error fetching assessment history:', error);
        res.status(500).json({ success: false, message: 'Server error' });
      }
});

router.get('/assessments/:id', async (req, res) => {
    const assessmentCollection = getDB().collection("assessments");
      try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
          return res.status(400).json({ message: "Invalid assessment ID" });
        }

        const assessment = await assessmentCollection.findOne({ _id: new ObjectId(id) });

        if (!assessment) {
          return res.status(404).json({ message: "Assessment not found" });
        }

        res.status(200).json({ success: true, data: assessment });
      } catch (error) {
        console.error('Error fetching assessment:', error);
        res.status(500).json({ success: false, message: 'Server error' });
      }
});

router.put('/assessments/:id', async (req, res) => {
    const assessmentCollection = getDB().collection("assessments");
      try {
        const { id } = req.params;
        const updateData = req.body;

        if (!ObjectId.isValid(id)) {
          return res.status(400).json({ message: "Invalid assessment ID" });
        }

        updateData.updatedAt = new Date();

        const result = await assessmentCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: updateData }
        );

        if (result.matchedCount === 0) {
          return res.status(404).json({ message: "Assessment not found" });
        }

        res.status(200).json({
          success: true,
          message: 'Assessment updated successfully'
        });
      } catch (error) {
        console.error('Error updating assessment:', error);
        res.status(500).json({ success: false, message: 'Server error' });
      }
});

router.delete('/assessments/:id', async (req, res) => {
    const assessmentCollection = getDB().collection("assessments");
      try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
          return res.status(400).json({ message: "Invalid assessment ID" });
        }

        const result = await assessmentCollection.deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
          return res.status(404).json({ message: "Assessment not found" });
        }

        res.status(200).json({
          success: true,
          message: 'Assessment deleted successfully'
        });
      } catch (error) {
        console.error('Error deleting assessment:', error);
        res.status(500).json({ success: false, message: 'Server error' });
      }
});

module.exports = router;
