const express = require('express');
const router = express.Router();
const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');
const uploadPdf = require("../middleware/uploadPdf");
const { getDayFromDateString } = require('../utils/helpers');

router.get('/appointments', async (req, res) => {
    try {
        const appointmentCollection = getDB().collection("appointments");
        const { doctorName, status, doctorId } = req.query;
        let query = {};

        if (doctorName) {
          query.doctorName = doctorName;
        }

        if (status) {
          query.status = status;
        }

        if (doctorId) {
          query.doctorId = doctorId;
        }

        const result = await appointmentCollection.find(query).toArray();
        res.send(result);
    } catch (error) {
        console.error("Error fetching appointments:", error);
        res.status(500).json({ message: "Server error" });
    }
});

router.get('/appointments/:id', async (req, res) => {
    try {
        const appointmentCollection = getDB().collection("appointments");
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await appointmentCollection.findOne(query);
        res.send(result);
    } catch (error) {
        console.error("Error fetching appointment:", error);
        res.status(500).json({ message: "Server error" });
    }
});

router.post('/appointment', async (req, res) => {
      const appointmentCollection = getDB().collection("appointments");
      const appointmentData = req.body;

      // Add the current date and time to the appointment data
      const createdAt = new Date(); // This will give the current date and time
      appointmentData.createdAt = createdAt;

      // Insert the appointment into the database
      const result = await appointmentCollection.insertOne(appointmentData);

      // Send the result back to the client
      res.send(result);
});

router.post("/upload-prescription/:appointmentId", uploadPdf.single("pdf"), async (req, res) => {
  try {
    const appointmentCollection = getDB().collection("appointments");
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const appointmentId = req.params.appointmentId;

    const result = await appointmentCollection.updateOne(
      { _id: new ObjectId(appointmentId) },
      { $set: { previousPrescription: req.file.path } }
    );

    if (result.matchedCount === 0)
      return res.status(404).json({ message: "Appointment not found" });

    res.json({
      message: "PDF uploaded and link stored in appointment successfully",
      previousPrescription: req.file.path,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Reschedule
router.patch('/appointments/:appointmentId/reschedule', async (req, res) => {
      const appointmentCollection = getDB().collection("appointments");
      const scheduleCollection = getDB().collection("schedules");
      const doctorCollection = getDB().collection("doctors");
      const notificationCollection = getDB().collection("notifications");

      const { appointmentId } = req.params;
      const { newDate, newSlot, actor } = req.body || {};

      if (!newDate || !newSlot) {
        return res.status(400).json({ message: "newDate and newSlot are required" });
      }

      const twentyFourHoursMs = 24 * 60 * 60 * 1000;

      const buildDateTime = (dateStr, slotStr) => {
        const startPart = (slotStr || '').split(' - ')[0];
        return new Date(`${dateStr} ${startPart}`);
      };

      try {
        const appointmentObjectId = new ObjectId(appointmentId);
        const appointment = await appointmentCollection.findOne({ _id: appointmentObjectId });

        if (!appointment) {
          return res.status(404).json({ message: 'Appointment not found' });
        }

        // Prevent reschedule inside 24h window
        const oldStart = buildDateTime(appointment.appointmentDate, appointment.slot);
        const now = new Date();

        if (isNaN(oldStart.getTime())) {
          return res.status(400).json({ message: 'Invalid existing appointment date or slot' });
        }

        if (oldStart.getTime() - now.getTime() <= twentyFourHoursMs) {
          return res.status(400).json({ message: 'Rescheduling is only allowed more than 24 hours before the appointment start time' });
        }

        const newStart = buildDateTime(newDate, newSlot);
        if (isNaN(newStart.getTime())) {
          return res.status(400).json({ message: 'Invalid newDate or newSlot format' });
        }

        if (newStart <= now) {
          return res.status(400).json({ message: 'New appointment time must be in the future' });
        }

        if (appointment.appointmentDate === newDate && appointment.slot === newSlot) {
          return res.status(400).json({ message: 'New slot matches existing slot; nothing to change' });
        }

        const schedule = await scheduleCollection.findOne({ doctorID: appointment.doctorID });
        if (!schedule) {
          return res.status(404).json({ message: 'Schedule not found for doctor' });
        }

        const oldDay = getDayFromDateString(appointment.appointmentDate);
        const newDay = getDayFromDateString(newDate);

        const oldDaySlots = schedule.availability?.[oldDay];
        const newDaySlots = schedule.availability?.[newDay];

        if (!oldDaySlots || !newDaySlots) {
          return res.status(404).json({ message: 'Schedule entries not found for old or new day' });
        }

        const oldSlotEntry = oldDaySlots.find((slot) => slot.time === appointment.slot);
        const newSlotEntry = newDaySlots.find((slot) => slot.time === newSlot);

        if (!oldSlotEntry) {
          return res.status(404).json({ message: 'Original slot not found in schedule' });
        }

        if (!newSlotEntry) {
          return res.status(404).json({ message: 'Requested new slot not found in schedule' });
        }

        if (newSlotEntry.status !== 'available') {
          return res.status(409).json({ message: 'Requested new slot is not available' });
        }

        // Update schedule: free old slot, book new slot
        const scheduleUpdate = await scheduleCollection.updateOne(
          { doctorID: appointment.doctorID },
          {
            $set: {
              [`availability.${oldDay}.$[oldElem].status`]: 'available',
              [`availability.${newDay}.$[newElem].status`]: 'booked',
            },
            $currentDate: { updatedAt: true }
          },
          {
            arrayFilters: [
              { 'oldElem.time': appointment.slot },
              { 'newElem.time': newSlot }
            ]
          }
        );

        if (scheduleUpdate.matchedCount === 0) {
          return res.status(404).json({ message: 'Schedule document not updated' });
        }

        await appointmentCollection.updateOne(
          { _id: appointmentObjectId },
          {
            $set: {
              appointmentDate: newDate,
              slot: newSlot,
              state: 'upcoming',
              rescheduledAt: new Date(),
              rescheduledBy: actor || 'user'
            }
          }
        );

        // Notifications
        const notifications = [];
        if (appointment.patientEmail) {
          notifications.push({
            userEmail: appointment.patientEmail,
            type: 'appointment_rescheduled',
            message: `আপনার অ্যাপয়েন্টমেন্ট রিশিডিউল হয়েছে: ${newDate}, ${newSlot}`,
            relatedId: appointmentId,
            isRead: false,
            createdAt: new Date()
          });
        }

        const doctor = appointment.doctorID ? await doctorCollection.findOne({ _id: new ObjectId(appointment.doctorID) }) : null;
        if (doctor?.email) {
          notifications.push({
            userEmail: doctor.email,
            type: 'appointment_rescheduled',
            message: `একটি অ্যাপয়েন্টমেন্ট রিশিডিউল হয়েছে: ${newDate}, ${newSlot}`,
            relatedId: appointmentId,
            isRead: false,
            createdAt: new Date()
          });
        }

        if (notifications.length) {
          await notificationCollection.insertMany(notifications);
        }

        res.status(200).json({ message: 'Appointment rescheduled successfully', newDate, newSlot });
      } catch (error) {
        console.error('Error rescheduling appointment:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
      }
});

router.patch('/appointments/:appointmentId', async (req, res) => {
      const appointmentCollection = getDB().collection("appointments");
      const scheduleCollection = getDB().collection("schedules");
      const notificationCollection = getDB().collection("notifications");
      const { appointmentId } = req.params;

      try {
        const appointmentObjectId = new ObjectId(appointmentId);
        const appointment = await appointmentCollection.findOne({ _id: appointmentObjectId });

        const result = await appointmentCollection.updateOne(
          { _id: appointmentObjectId }, 
          { $set: { state: 'completed' } } 
        );

          const day = getDayFromDateString(appointment.appointmentDate);
          const time = appointment.slot;

          await scheduleCollection.updateOne(
            { doctorID: appointment.doctorID },
            {
              $set: {
                [`availability.${day}.$[elem].status`]: "available"
              }
            },
            {
              arrayFilters: [{ "elem.time": time }], 
            }
          );

        if (result.matchedCount === 0) {
          return res.status(404).json({ message: 'Appointment not found' });
        }

        if (appointment && appointment.patientEmail) {
          try {
            const notification = {
              userEmail: appointment.patientEmail,
              type: 'appointment_completed',
              message: `আপনার অ্যাপয়েন্টমেন্ট সম্পন্ন হয়েছে। আপনি এখন প্রেসক্রিপশন দেখতে পারবেন।`,
              relatedId: appointmentId,
              isRead: false,
              createdAt: new Date()
            };
            await notificationCollection.insertOne(notification);
          } catch (notifError) {
            console.error("Error creating completion notification:", notifError);
          }
        }

        res.status(200).json({ message: 'Appointment marked as completed successfully' });
      } catch (error) {
        console.error('Error completing appointment:', error);
        res.status(500).json({ message: 'Server error' });
      }
});

// Session Link
router.patch('/sessionlink/:appointmentId', async (req, res) => {
      const appointmentCollection = getDB().collection("appointments");
      const notificationCollection = getDB().collection("notifications");
      const { appointmentId } = req.params;
      const { sessionLink } = req.body;

      try {
        const appointmentObjectId = new ObjectId(appointmentId);
        const appointment = await appointmentCollection.findOne({ _id: appointmentObjectId });

        const result = await appointmentCollection.updateOne(
          { _id: appointmentObjectId },
          { $set: { sessionLink: sessionLink } }
        );

        if (result.matchedCount === 0) {
          return res.status(404).json({ message: 'Appointment not found' });
        }

        if (appointment && appointment.patientEmail) {
          try {
            const notification = {
              userEmail: appointment.patientEmail,
              type: 'session_link',
              message: `আপনার অ্যাপয়েন্টমেন্টের জন্য সেশন লিংক যুক্ত করা হয়েছে। এখনই জয়েন করুন।`,
              relatedId: appointmentId,
              isRead: false,
              createdAt: new Date()
            };
            await notificationCollection.insertOne(notification);
          } catch (notifError) {
            console.error("Error creating session link notification:", notifError);
          }
        }

        res.status(200).json({ message: 'Session link added successfully' });
      } catch (error) {
        console.error('Error completing appointment:', error);
        res.status(500).json({ message: 'Server error' });
      }
});


module.exports = router;
