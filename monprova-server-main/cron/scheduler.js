const cron = require('node-cron');
const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');
const { parseTime12to24 } = require('../utils/helpers');

const initScheduler = () => {
    cron.schedule('*/5 * * * *', async () => {
      const appointmentCollection = getDB().collection("appointments");
      const notificationCollection = getDB().collection("notifications");
      const doctorCollection = getDB().collection("doctors");

      try {
        console.log('Running appointment reminder check...');

        const now = new Date();
        const todayDateStr = now.toISOString().split('T')[0]; 

        const upcomingAppointments = await appointmentCollection.find({
          state: 'upcoming',
          paymentStatus: 'paid',
          appointmentDate: todayDateStr 
        }).toArray();

        for (const appointment of upcomingAppointments) {
          if (!appointment.appointmentDate || !appointment.slot) continue;

          const appointmentDateStr = appointment.appointmentDate; 
          const slotTime = appointment.slot.split(' - ')[0]; 

          const { hours, minutes } = parseTime12to24(slotTime);
          const appointmentDateTime = new Date(appointmentDateStr);
          appointmentDateTime.setHours(hours, minutes, 0, 0);

          const timeDiff = appointmentDateTime - now;
          const minutesUntilAppointment = Math.floor(timeDiff / 60000);

          if (minutesUntilAppointment >= 13 && minutesUntilAppointment <= 17) {
            const existingPatientReminder = await notificationCollection.findOne({
              type: 'appointment_reminder',
              relatedId: appointment._id.toString(),
              userEmail: appointment.patientEmail
            });

            if (!existingPatientReminder && appointment.patientEmail) {
              const patientNotification = {
                userEmail: appointment.patientEmail,
                type: 'appointment_reminder',
                message: `আপনার অ্যাপয়েন্টমেন্ট ${minutesUntilAppointment} মিনিটের মধ্যে শুরু হবে! ডাক্তার: ${appointment.doctorName}`,
                relatedId: appointment._id.toString(),
                isRead: false,
                createdAt: new Date()
              };

              await notificationCollection.insertOne(patientNotification);
              console.log(`Patient 15-min reminder sent for appointment ${appointment._id}`);
            }
          }

          if (minutesUntilAppointment >= 3 && minutesUntilAppointment <= 7) {
            if (appointment.doctorID) {
              try {
                const doctor = await doctorCollection.findOne({ _id: new ObjectId(appointment.doctorID) });

                if (doctor && doctor.email) {
                  const existingDoctorReminder5min = await notificationCollection.findOne({
                    type: 'appointment_reminder_5min',
                    relatedId: appointment._id.toString(),
                    userEmail: doctor.email
                  });

                  if (!existingDoctorReminder5min) {
                    const doctorNotification5min = {
                      userEmail: doctor.email,
                      type: 'appointment_reminder_5min',
                      message: `আপনার অ্যাপয়েন্টমেন্ট ${minutesUntilAppointment} মিনিটের মধ্যে শুরু হবে! রোগী: ${appointment.patientName}`,
                      relatedId: appointment._id.toString(),
                      isRead: false,
                      createdAt: new Date()
                    };

                    await notificationCollection.insertOne(doctorNotification5min);
                    console.log(`Doctor 5-min reminder sent for appointment ${appointment._id}`);
                  }
                }
              } catch (doctorError) {
                console.error(`Error sending 5-min reminder to doctor for appointment ${appointment._id}:`, doctorError);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error in appointment reminder cron job:', error);
      }
    });

    console.log('Appointment reminder cron job initialized - running every 5 minutes');
};

module.exports = initScheduler;
