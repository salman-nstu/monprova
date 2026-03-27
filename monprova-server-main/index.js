const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { connectDB } = require('./config/db');
const initScheduler = require('./cron/scheduler');

const app = express();
const port = process.env.PORT || 8000;

// Middleware
const corsOptions = {
  optionsSuccessStatus: 200,
  origin: true,
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes Imports
const uploadRoutes = require("./routes/upload.route");
const complaintRoutes = require('./routes/complaint.routes');
const adminRoutes = require('./routes/admin.routes');
const scheduleRoutes = require('./routes/schedule.routes');
const userRoutes = require('./routes/user.routes');
const questionRoutes = require('./routes/question.routes');
const patientRoutes = require('./routes/patient.routes');
const doctorRoutes = require('./routes/doctors.routes');
const appointmentRoutes = require('./routes/appointment.routes');
const paymentRoutes = require('./routes/payment.routes');
const prescriptionRoutes = require('./routes/prescription.routes');
const blogRoutes = require('./routes/blog.routes');
const videoRoutes = require('./routes/video.routes');
const assessmentRoutes = require('./routes/assessment.routes');
const pdfRoutes = require('./routes/pdf.routes');
const payoutRoutes = require('./routes/payout.routes');
const notificationRoutes = require('./routes/notification.routes');

// Use Routes
app.use("/api", uploadRoutes);  
app.use('/api', complaintRoutes);
app.use('/api', adminRoutes);
app.use('/api', scheduleRoutes);
app.use('/api', userRoutes);
app.use('/api', questionRoutes);
app.use('/api', patientRoutes);
app.use('/api', doctorRoutes);
app.use('/api', appointmentRoutes);
app.use('/api', paymentRoutes);
app.use('/api', prescriptionRoutes);
app.use('/api', blogRoutes);
app.use('/api', videoRoutes);
app.use('/api', assessmentRoutes);
app.use('/', pdfRoutes);
app.use('/api', payoutRoutes);
app.use('/api', notificationRoutes);

app.get("/", (req, res) => {
  res.json({ message: 'Hello!' });
});

// Start Server
connectDB().then(() => {
    // Init Scheduler
    initScheduler();

    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
});
