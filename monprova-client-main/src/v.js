const express = require('express');
const jwt = require('jsonwebtoken');
const app = express();
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();
const port = process.env.PORT || 8000;

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "https://monprova-server-b72d8846b-tanjim-rooms-projects.vercel.app//auth/google/callback"
);

const SCOPES = ["https://www.googleapis.com/auth/calendar"];

const generatePrescriptionPDF = require("./utils/generatePrescriptionPDF");
// Middlewares
app.use(cors({
  origin: ["https://monprova-9037c.firebaseapp.com","http://localhost:5173"], // React frontend
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.urlencoded());

// MongoDB setup
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tfw5gww.mongodb.net/?appName=Cluster0`;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});


async function run() {
  try {
    await client.connect();
    const database = client.db("monprovaDB");
    const userCollection = database.collection("users");
    const patientCollection = database.collection("patients");
    const doctorCollection = database.collection("doctors");
    const appointmentCollection = database.collection("appointments");
    const blogCollection = database.collection("blogs");
    const videoCollection = database.collection("videos");
    const prescriptionCollection = database.collection("prescriptions");
    const assessmentCollection = database.collection("assessments");
    const questionCollection = database.collection("questions");
    const replyCollection = database.collection("replies");
    const payoutCollection = database.collection("payouts");
    const paymentCollection = database.collection("payments");
    const scheduleCollection = database.collection("schedules");

    // const verifyToken = (req, res, next) => {
    //   console.log(req.headers);
    //   if(!res.headers.authorization){
    //     return res.status(401).send( {message: "forbidden access" })
    //   }
    //   const token = req.headers.authorization.split(' ')[1];
    //   jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    //     if(err){
    //       return res.status(401).send( {message: "forbidden access" })
    //     }
    //     req.decoded = decoded;
    //     next();
    //   })

    // }

    // app.post('/api/jwt', async(req, res) => {
    //   const user = req.body;
    //   const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '1h'})
    //   res.send({token})
    // });




    //==================================Schedules==================================
  app.post('/api/saveschedule', async (req, res) => {
      const scheduleData = req.body;

      // Check if patient email (or another unique identifier) is provided
      if (!scheduleData.doctorID) {
        return res.status(400).json({ message: "Doctor ID is required to identify the doctor" });
      }

      try {
        const currentTime = new Date(); // Get current date-time for createdAt and updatedAt

        // Check if a schedule with this doctorID already exists
        const existingSchedule = await scheduleCollection.findOne({ doctorID: scheduleData.doctorID });

        if (existingSchedule) {
          // If schedule exists, update the schedule data and update the `updatedAt` field
          const updateResult = await scheduleCollection.updateOne(
            { doctorID: scheduleData.doctorID },  // Find the schedule by doctorID
            {
              $set: {
                ...scheduleData,
                updatedAt: currentTime  // Set updatedAt to current date-time
              }
            }
          );

          if (updateResult.modifiedCount > 0) {
            return res.status(200).json({ message: "Patient profile updated successfully" });
          } else {
            return res.status(400).json({ message: "No changes were made to the patient profile" });
          }
        } else {
          // If the schedule does not exist, insert a new schedule and set both createdAt and updatedAt
          const insertResult = await scheduleCollection.insertOne({
            ...scheduleData,
            createdAt: currentTime,  // Set createdAt to current date-time
            updatedAt: currentTime   // Set updatedAt to current date-time as well for new records
          });

          return res.status(201).json({
            message: "Patient profile created successfully",
            insertedId: insertResult.insertedId
          });
        }
      } catch (error) {
        console.error('Error processing patient data:', error);
        return res.status(500).json({ message: "Server error" });
      }
    });

    app.get('/api/schedules', async (req, res) => {
      const result = await scheduleCollection.find().toArray();
      res.send(result);
    });


   app.patch('/api/schedule/:scheduleId', async (req, res) => {
  const { scheduleId } = req.params;
  const { day, time, status } = req.body; // Expecting day, time, and status in the request body

  if (!day || !time || !status) {
    return res.status(400).json({ message: "Day, time, and status are required" });
  }

  try {
    // Ensure the scheduleId is parsed correctly as an ObjectId
    const scheduleObjectId = new ObjectId(scheduleId);

    // Find the schedule by its ObjectId
    const schedule = await scheduleCollection.findOne({ _id: scheduleObjectId });

    if (!schedule) {
      return res.status(404).json({ message: "Schedule not found" });
    }

    // Check if the given day exists in the availability
    if (!schedule.availability[day]) {
      return res.status(404).json({ message: `Day ${day} not found in schedule` });
    }

    // Find the index of the time slot in the specified day array
    const slotIndex = schedule.availability[day].findIndex(slot => slot.time === time);

    if (slotIndex === -1) {
      return res.status(404).json({ message: `Time slot ${time} not found on ${day}` });
    }

    // Update the status of the specific time slot
    schedule.availability[day][slotIndex].status = status;

    // Update the schedule in the database
    const result = await scheduleCollection.updateOne(
      { _id: scheduleObjectId },
      { $set: { [`availability.${day}`]: schedule.availability[day], updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Schedule not found" });
    }

    res.status(200).json({ message: `Time slot ${time} on ${day} updated to ${status} successfully` });
  } catch (error) {
    console.error('Error updating schedule:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


    // ========== Patient Routes ==========
    app.get('/api/users', async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result);
    });


    //questionComment
    app.get('/api/questions', async (req, res) => {
      const result = await questionCollection.find().toArray();
      res.send(result);
    });

    //replies question
    app.get('/api/replies', async (req, res) => {
      const result = await replyCollection.find().toArray();
      res.send(result);
    });

    app.get('/api/patients', async (req, res) => {
      const result = await patientCollection.find().toArray();
      res.send(result);
    });

    app.get('/api/doctors', async (req, res) => {
      const result = await doctorCollection.find().toArray();
      res.send(result);
    });

    app.get('/api/appointments', async (req, res) => {
      try {
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

    app.get('/api/prescriptions', async (req, res) => {
      const result = await prescriptionCollection.find().toArray();
      res.send(result);
    });

    app.get('/api/blogs', async (req, res) => {
      const result = await blogCollection.find().toArray();
      res.send(result);
    });

    app.get('/api/videos', async (req, res) => {
      const result = await videoCollection.find().toArray();
      res.send(result);
    });

    // Upload image to ImageBB
    app.post('/api/upload-image', async (req, res) => {
      try {
        const { image } = req.body;

        if (!image) {
          return res.status(400).json({ success: false, message: 'Image data is required' });
        }

        if (!process.env.IMGBB_API_KEY) {
          console.error('IMGBB_API_KEY is not set in environment variables');
          return res.status(400).json({ success: false, message: 'Server configuration error: API key not found' });
        }

        // Remove data URL prefix if present
        const base64Data = image.includes(',') ? image.split(',')[1] : image;

        // Create FormData
        const FormData = require('form-data');
        const form = new FormData();
        form.append('image', Buffer.from(base64Data, 'base64'), { filename: 'blog-thumbnail.jpg' });
        form.append('key', process.env.VITE_IMAGE_HOSTING_API_KEY);

        console.log('Uploading to ImageBB with API key:', process.env.IMGBB_API_KEY.substring(0, 5) + '...');

        const response = await axios.post('https://api.imgbb.com/1/upload', form, {
          headers: form.getHeaders(),
          timeout: 30000
        });

        console.log('ImageBB response:', response.data.success);

        if (response.data.success) {
          return res.status(200).json({
            success: true,
            imageUrl: response.data.data.display_url
          });
        } else {
          throw new Error('ImageBB API returned success=false: ' + JSON.stringify(response.data));
        }
      } catch (error) {
        console.error('Image upload error:', error.response?.data || error.message);
        return res.status(500).json({
          success: false,
          message: 'Failed to upload image: ' + (error.response?.data?.error?.message || error.message)
        });
      }
    });

    // PATCH /api/question/:questionId
    // Body: { status: "approved" } অথবা { status: "declined" }

    app.patch('/api/question/:questionId', async (req, res) => {
      const { questionId } = req.params;
      const { status } = req.body; // expected: "approved" or "declined"

      // ✅ Validate status
      if (!["approved", "declined"].includes(status)) {
        return res.status(400).json({ message: "Invalid status value" });
      }

      try {
        // Convert string id to ObjectId
        const questionObjectId = new ObjectId(questionId);

        // Update the question status
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


    // Create/Upload Blog
    app.post('/api/blogs', async (req, res) => {
      try {
        const blogData = req.body;

        if (!blogData.title || !blogData.author || !blogData.slug || !blogData.content || !blogData.thumbnail) {
          return res.status(400).json({ success: false, message: 'All fields are required' });
        }

        // Check if blog with same slug already exists
        const existingBlog = await blogCollection.findOne({ slug: blogData.slug });
        if (existingBlog) {
          return res.status(400).json({ success: false, message: 'Blog with this slug already exists' });
        }

        // Add timestamps
        const newBlog = {
          ...blogData,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        const result = await blogCollection.insertOne(newBlog);

        return res.status(201).json({
          success: true,
          message: 'Blog uploaded successfully',
          blogId: result.insertedId
        });
      } catch (error) {
        console.error('Blog upload error:', error);
        return res.status(500).json({
          success: false,
          message: 'Failed to upload blog',
          error: error.message
        });
      }
    });

    // Create/Upload Video
    app.post('/api/videos', async (req, res) => {
      try {
        const videoData = req.body;

        if (!videoData.title || !videoData.category || !videoData.videoLink) {
          return res.status(400).json({ success: false, message: 'All fields are required' });
        }

        // Validate video URL
        try {
          new URL(videoData.videoLink);
        } catch (error) {
          return res.status(400).json({ success: false, message: 'Invalid video URL format' });
        }

        // Add timestamps
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
        console.error('Video upload error:', error);
        return res.status(500).json({
          success: false,
          message: 'Failed to upload video',
          error: error.message
        });
      }
    });

    // Update Blog
    app.put('/api/blogs/:id', async (req, res) => {
      try {
        const blogId = req.params.id;
        const blogData = req.body;

        if (!blogId || blogId === 'undefined') {
          return res.status(400).json({ success: false, message: 'Invalid blog ID' });
        }

        if (!blogData.title || !blogData.author || !blogData.slug || !blogData.content || !blogData.thumbnail) {
          return res.status(400).json({ success: false, message: 'All fields are required' });
        }

        const updatedBlog = {
          ...blogData,
          updatedAt: new Date()
        };

        const result = await blogCollection.updateOne(
          { _id: new ObjectId(blogId) },
          { $set: updatedBlog }
        );

        if (result.modifiedCount > 0 || result.matchedCount > 0) {
          return res.status(200).json({
            success: true,
            message: 'Blog updated successfully'
          });
        } else {
          return res.status(404).json({
            success: false,
            message: 'Blog not found'
          });
        }
      } catch (error) {
        console.error('Blog update error:', error);
        return res.status(500).json({
          success: false,
          message: 'Failed to update blog',
          error: error.message
        });
      }
    });

    // Delete Blog
    app.delete('/api/blogs/:id', async (req, res) => {
      try {
        const blogId = req.params.id;

        if (!blogId || blogId === 'undefined') {
          return res.status(400).json({ success: false, message: 'Invalid blog ID' });
        }

        const result = await blogCollection.deleteOne({ _id: new ObjectId(blogId) });

        if (result.deletedCount > 0) {
          return res.status(200).json({
            success: true,
            message: 'Blog deleted successfully'
          });
        } else {
          return res.status(404).json({
            success: false,
            message: 'Blog not found'
          });
        }
      } catch (error) {
        console.error('Blog delete error:', error);
        return res.status(500).json({
          success: false,
          message: 'Failed to delete blog',
          error: error.message
        });
      }
    });

    // Update Video
    app.put('/api/videos/:id', async (req, res) => {
      try {
        const videoId = req.params.id;
        const videoData = req.body;

        if (!videoId || videoId === 'undefined') {
          return res.status(400).json({ success: false, message: 'Invalid video ID' });
        }

        if (!videoData.title || !videoData.category || !videoData.videoLink) {
          return res.status(400).json({ success: false, message: 'All fields are required' });
        }

        // Validate video URL
        try {
          new URL(videoData.videoLink);
        } catch (error) {
          return res.status(400).json({ success: false, message: 'Invalid video URL format' });
        }

        const updatedVideo = {
          ...videoData,
          updatedAt: new Date()
        };

        const result = await videoCollection.updateOne(
          { _id: new ObjectId(videoId) },
          { $set: updatedVideo }
        );

        if (result.modifiedCount > 0 || result.matchedCount > 0) {
          return res.status(200).json({
            success: true,
            message: 'Video updated successfully'
          });
        } else {
          return res.status(404).json({
            success: false,
            message: 'Video not found'
          });
        }
      } catch (error) {
        console.error('Video update error:', error);
        return res.status(500).json({
          success: false,
          message: 'Failed to update video',
          error: error.message
        });
      }
    });

    // Delete Video
    app.delete('/api/videos/:id', async (req, res) => {
      try {
        const videoId = req.params.id;

        if (!videoId || videoId === 'undefined') {
          return res.status(400).json({ success: false, message: 'Invalid video ID' });
        }

        const result = await videoCollection.deleteOne({ _id: new ObjectId(videoId) });

        if (result.deletedCount > 0) {
          return res.status(200).json({
            success: true,
            message: 'Video deleted successfully'
          });
        } else {
          return res.status(404).json({
            success: false,
            message: 'Video not found'
          });
        }
      } catch (error) {
        console.error('Video delete error:', error);
        return res.status(500).json({
          success: false,
          message: 'Failed to delete video',
          error: error.message
        });
      }
    });

    app.post('/api/appointment', async (req, res) => {
      const appointmentData = req.body;

      // Add the current date and time to the appointment data
      const createdAt = new Date(); // This will give the current date and time
      appointmentData.createdAt = createdAt;

      // Insert the appointment into the database
      const result = await appointmentCollection.insertOne(appointmentData);

      // Send the result back to the client
      res.send(result);
    });

    app.post('/api/doctor', async (req, res) => {
      const doctorData = req.body;

      // Check if doctor email (or another unique identifier) is provided
      if (!doctorData.email) {
        return res.status(400).json({ message: "Email is required to identify the doctor" });
      }

      try {
        const currentTime = new Date(); // Get current date-time for createdAt and updatedAt

        // Check if a doctor with this email already exists
        const existingDoctor = await doctorCollection.findOne({ email: doctorData.email });

        if (existingDoctor) {
          // If doctor exists, update the doctor data and update the `updatedAt` field
          // ✅ Preserve verificationStatus unless explicitly provided
          const updateData = {
            ...doctorData,
            updatedAt: currentTime  // Set updatedAt to current date-time
          };

          // Don't override verificationStatus if not provided (preserve existing)
          if (!doctorData.verificationStatus && existingDoctor.verificationStatus) {
            updateData.verificationStatus = existingDoctor.verificationStatus;
          }

          const updateResult = await doctorCollection.updateOne(
            { email: doctorData.email },  // Find the doctor by email
            { $set: updateData }
          );

          if (updateResult.modifiedCount > 0) {
            return res.status(200).json({ message: "Doctor profile updated successfully" });
          } else {
            return res.status(400).json({ message: "No changes were made to the doctor profile" });
          }
        } else {
          // If the doctor does not exist, insert a new doctor and set both createdAt and updatedAt
          // ✅ Set default verificationStatus to 'not-verified' for new doctors
          const insertResult = await doctorCollection.insertOne({
            ...doctorData,
            verificationStatus: doctorData.verificationStatus || 'not-verified',
            createdAt: currentTime,  // Set createdAt to current date-time
            updatedAt: currentTime   // Set updatedAt to current date-time as well for new records
          });

          return res.status(201).json({
            message: "Doctor profile created successfully",
            insertedId: insertResult.insertedId
          });
        }
      } catch (error) {
        console.error('Error processing doctor data:', error);
        return res.status(500).json({ message: "Server error" });
      }
    });

    //questionAPI
    app.post('/api/question', async (req, res) => {
      const questionData = req.body;
      const result = await database.collection("questions").insertOne(questionData);
      res.send(result);
    });

    // Patient route - Insert or update patient profile
    app.post('/api/patient', async (req, res) => {
      const patientData = req.body;

      // Check if patient email (or another unique identifier) is provided
      if (!patientData.email) {
        return res.status(400).json({ message: "Email is required to identify the patient" });
      }

      try {
        const currentTime = new Date(); // Get current date-time for createdAt and updatedAt

        // Check if a patient with this email already exists
        const existingPatient = await patientCollection.findOne({ email: patientData.email });

        if (existingPatient) {
          // If patient exists, update the patient data and update the `updatedAt` field
          const updateResult = await patientCollection.updateOne(
            { email: patientData.email },  // Find the patient by email
            {
              $set: {
                ...patientData,
                updatedAt: currentTime  // Set updatedAt to current date-time
              }
            }
          );

          if (updateResult.modifiedCount > 0) {
            return res.status(200).json({ message: "Patient profile updated successfully" });
          } else {
            return res.status(400).json({ message: "No changes were made to the patient profile" });
          }
        } else {
          // If the patient does not exist, insert a new patient and set both createdAt and updatedAt
          const insertResult = await patientCollection.insertOne({
            ...patientData,
            createdAt: currentTime,  // Set createdAt to current date-time
            updatedAt: currentTime   // Set updatedAt to current date-time as well for new records
          });

          return res.status(201).json({
            message: "Patient profile created successfully",
            insertedId: insertResult.insertedId
          });
        }
      } catch (error) {
        console.error('Error processing patient data:', error);
        return res.status(500).json({ message: "Server error" });
      }
    });


    // Create or Update prescription (Upsert)
    app.post('/api/prescription', async (req, res) => {
      const prescriptionData = req.body;

      // ✅ Must have appointmentID to identify a prescription uniquely
      if (!prescriptionData.appointmentID) {
        return res.status(400).json({ message: "appointmentID is required" });
      }

      try {
        const query = { appointmentID: prescriptionData.appointmentID };

        const existingPrescription = await prescriptionCollection.findOne(query);

        if (existingPrescription) {
          // ✅ Update existing prescription
          const updateResult = await prescriptionCollection.updateOne(
            query,
            {
              $set: {
                ...prescriptionData,
                updatedAt: new Date(),
              },
            }
          );

          if (updateResult.modifiedCount > 0) {
            return res.status(200).json({ message: "Prescription updated successfully" });
          }

          return res.status(200).json({ message: "No changes were made to the prescription" });
        } else {
          // ✅ Insert new prescription
          const newDoc = {
            ...prescriptionData,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          const insertResult = await prescriptionCollection.insertOne(newDoc);

          return res.status(201).json({
            message: "Prescription created successfully",
            insertedId: insertResult.insertedId,
          });
        }
      } catch (error) {
        console.error("Error processing prescription data:", error);
        return res.status(500).json({ message: "Server error" });
      }
    });



    app.get("/api/prescription/:appointmentID/pdf", async (req, res) => {
      const { appointmentID } = req.params;

      try {
        const prescription = await prescriptionCollection.findOne({ appointmentID });

        if (!prescription) {
          return res.status(404).json({ message: "Prescription not found" });
        }
        const patient = await patientCollection.findOne({ _id: new ObjectId(prescription.patientID) });
        const doctor = await doctorCollection.findOne({ _id: new ObjectId(prescription.doctorID) });
        const appointment = await appointmentCollection.findOne({ _id: new ObjectId(prescription.appointmentID) });

        generatePrescriptionPDF(prescription, patient, doctor, appointment, res);

      } catch (error) {
        console.error("PDF generation error:", error);
        res.status(500).json({ message: "Failed to generate PDF" });
      }
    });



    app.patch('/api/appointments/:appointmentId', async (req, res) => {
      const { appointmentId } = req.params;

      try {
        // Ensure the appointmentId is parsed correctly as an ObjectId
        const appointmentObjectId = new ObjectId(appointmentId);

        // Update the appointment state to 'completed'
        const result = await appointmentCollection.updateOne(
          { _id: appointmentObjectId }, // Match the appointment by its ObjectId
          { $set: { state: 'completed' } } // Set the state to 'completed'
        );

        // Check if any appointment was updated
        if (result.matchedCount === 0) {
          return res.status(404).json({ message: 'Appointment not found' });
        }

        res.status(200).json({ message: 'Appointment marked as completed successfully' });
      } catch (error) {
        console.error('Error completing appointment:', error);
        res.status(500).json({ message: 'Server error' });
      }
    });


    // Example Node.js Express backend
    // Example Node.js Express backend
    app.patch('/api/sessionlink/:appointmentId', async (req, res) => {
      const { appointmentId } = req.params;
      const { sessionLink } = req.body;

      try {
        // Ensure the appointmentId is parsed correctly as an ObjectId
        const appointmentObjectId = new ObjectId(appointmentId);

        // Update the appointment state to 'completed'
        const result = await appointmentCollection.updateOne(
          { _id: appointmentObjectId }, // Match the appointment by its ObjectId
          { $set: { sessionLink: sessionLink } } // Set the state to 'completed'
        );

        // Check if any appointment was updated
        if (result.matchedCount === 0) {
          return res.status(404).json({ message: 'Appointment not found' });
        }

        res.status(200).json({ message: 'Appointment marked as completed successfully' });
      } catch (error) {
        console.error('Error completing appointment:', error);
        res.status(500).json({ message: 'Server error' });
      }
    });

    // Create or update patient profile
    app.post('/api/register', async (req, res) => {
      try {
        const newUser = req.body;

        // Get current date-time for createdAt and updatedAt
        const currentTime = new Date();

        // Check if the email is provided
        if (!newUser.email) {
          return res.status(400).json({ message: "Email is required to identify the user" });
        }

        const query = { email: newUser.email };
        const existingUser = await userCollection.findOne(query);

        if (existingUser) {
          // If the user already exists, update the user data and set updatedAt
          const updateResult = await userCollection.updateOne(
            { email: newUser.email }, // Find the user by email
            {
              $set: {
                ...newUser,        // Update the user fields
                updatedAt: currentTime // Set updatedAt to current date-time
              }
            });

          if (updateResult.modifiedCount > 0) {
            return res.status(200).json({
              message: "User profile updated successfully",
              updatedId: existingUser._id
            });
          } else {
            return res.status(400).json({ message: "No changes were made to the user profile" });
          }
        } else {
          // If the user does not exist, insert a new user and set both createdAt and updatedAt
          const insertResult = await userCollection.insertOne({
            ...newUser,
            createdAt: currentTime,  // Set createdAt to current date-time
            updatedAt: currentTime   // Set updatedAt to current date-time for the new user
          });

          return res.status(201).json({
            message: "User profile created successfully",
            insertedId: insertResult.insertedId
          });
        }
      } catch (err) {
        console.error('Error processing user data:', err);
        res.status(500).json({ message: "Server error" });
      }
    });

    // ========== ASSESSMENT ROUTES ==========

    // Create new assessment
    app.post('/api/assessments', async (req, res) => {
      try {
        const assessmentData = req.body;

        // Validate required fields
        if (!assessmentData.patientID || !assessmentData.assessmentType) {
          return res.status(400).json({ message: "Patient ID and Assessment Type are required" });
        }

        // Enforce one assessment of each type per patient per day
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

        // Validate score range
        const maxScores = {
          'PHQ-9': 27,
          'GAD-7': 21,
          'PSS-10': 40
        };

        const maxScore = maxScores[assessmentData.assessmentType];
        if (assessmentData.score < 0 || assessmentData.score > maxScore) {
          return res.status(400).json({ message: `Score must be between 0 and ${maxScore} for ${assessmentData.assessmentType}` });
        }

        // Add timestamp
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

    // Get all assessments for a patient
    app.get('/api/assessments', async (req, res) => {
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

    // Get assessment history for last 30 days with carry-forward logic
    app.get('/api/assessments/history/30days', async (req, res) => {
      try {
        const patientEmail = req.query.email;

        if (!patientEmail) {
          return res.status(400).json({ message: "Patient email is required" });
        }

        // Calculate date 30 days ago
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        // Fetch all assessments from the last 30 days
        const assessments = await assessmentCollection
          .find({
            patientEmail: patientEmail,
            date: { $gte: thirtyDaysAgo.toISOString() }
          })
          .sort({ date: 1 })
          .toArray();

        // Create a map for easy lookup
        const assessmentMap = {};
        assessments.forEach(assessment => {
          const dateKey = new Date(assessment.date).toISOString().split('T')[0];
          assessmentMap[dateKey] = assessment;
        });

        // Generate 30-day array with carry-forward logic
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
            // Carry forward the last known score
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

    // Get specific assessment by ID
    app.get('/api/assessments/:id', async (req, res) => {
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

    // Update assessment
    app.put('/api/assessments/:id', async (req, res) => {
      try {
        const { id } = req.params;
        const updateData = req.body;

        if (!ObjectId.isValid(id)) {
          return res.status(400).json({ message: "Invalid assessment ID" });
        }

        // Add update timestamp
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

    // Delete assessment
    app.delete('/api/assessments/:id', async (req, res) => {
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

    //doctor replies question
    app.post('/api/question/reply/:questionId', async (req, res) => {
      const { questionId } = req.params;
      const replyData = req.body;
      try {
        // Ensure the questionId is parsed correctly as an ObjectId
        const questionObjectId = new ObjectId(questionId);

        // Insert the reply into the replies collection
        const reply = {
          ...replyData,
          questionId: questionObjectId,
          createdAt: new Date(),
        };

        const result = await replyCollection.insertOne(reply);
        res.send(result);
      } catch (error) {
        console.error("Error replying to question:", error);
        res.status(500).json({ message: "Server error" });
      }
    });

    // ========== Payout Routes ==========
    // Get all payouts or filtered by doctorId
    app.get('/api/payouts', async (req, res) => {
      try {
        const { doctorId } = req.query;
        let query = {};

        if (doctorId) {
          query.doctorId = doctorId;
        }

        const result = await payoutCollection.find(query).sort({ timestamp: -1 }).toArray();
        res.send(result);
      } catch (error) {
        console.error("Error fetching payouts:", error);
        res.status(500).json({ message: "Server error" });
      }
    });

    // Create a new payout
    app.post('/api/payouts', async (req, res) => {
      try {
        const payoutData = req.body;

        // Validate required fields
        if (!payoutData.doctorId || !payoutData.amount) {
          return res.status(400).json({ message: "Doctor ID and amount are required" });
        }

        const result = await payoutCollection.insertOne(payoutData);
        res.send(result);
      } catch (error) {
        console.error("Error creating payout:", error);
        res.status(500).json({ message: "Server error" });
      }
    });

    // Get payout by ID
    app.get('/api/payouts/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await payoutCollection.findOne(query);
        res.send(result);
      } catch (error) {
        console.error("Error fetching payout:", error);
        res.status(500).json({ message: "Server error" });
      }
    });

    // Update payout
    app.put('/api/payouts/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
        const updateDoc = {
          $set: req.body
        };
        const result = await payoutCollection.updateOne(filter, updateDoc);
        res.send(result);
      } catch (error) {
        console.error("Error updating payout:", error);
        res.status(500).json({ message: "Server error" });
      }
    });

    // Delete payout
    app.delete('/api/payouts/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await payoutCollection.deleteOne(query);
        res.send(result);
      } catch (error) {
        console.error("Error deleting payout:", error);
        res.status(500).json({ message: "Server error" });
      }
    });

    app.post('/success-payment', async (req, res) => {
      const paymentSuccess = req.body;
      console.log('Success payment body:', paymentSuccess);
      console.log('Success payment query:', req.query);

      try {
        // Validate payment with SSLCommerz API
        const { data } = await axios.get(`https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php?val_id=${paymentSuccess.val_id}&store_id=monpr695bf98225e59&store_passwd=monpr695bf98225e59@ssl&format=json`);

        if (data.status !== 'VALID') {
          return res.status(400).send({ message: 'Invalid Payment' });
        }

        // Update payment status to "success" in the payment collection
        const updatePayment = await paymentCollection.updateOne(
          { transactionId: data.tran_id },
          { $set: { status: "success" } }
        );

        // Get the payment record to find the appointmentID
        const paymentRecord = await paymentCollection.findOne({ transactionId: data.tran_id });
        if (!paymentRecord || !paymentRecord.appointmentID) {
          return res.status(400).send({ message: 'Payment record not found or missing appointmentID' });
        }

        // Log the payment status update
        console.log('Payment status updated:', updatePayment);

        // Log the current appointment data before updating
        const appointment = await appointmentCollection.findOne({ _id: new ObjectId(paymentRecord.appointmentID) });
        console.log('Current Appointment:', appointment);  // Log to check if the paymentStatus is already "paid"

        // Now update the appointment paymentStatus to "paid"
        const appointmentUpdate = await appointmentCollection.updateOne(
          { _id: new ObjectId(paymentRecord.appointmentID) },
          { $set: { paymentStatus: "paid" } }
        );

        // Check if the appointment was updated
        if (appointmentUpdate.modifiedCount === 0) {
          return res.status(404).send({ message: 'Appointment not found or already updated.' });
        }

        // Return a success response
        res.send({ message: 'Payment successful and appointment status updated to paid.' });
      } catch (error) {
        console.error('Error during payment validation or updating:', error);
        res.status(500).send({ message: 'An error occurred during payment validation or update.' });
      }
    });




    app.post('/api/sslpayment', async (req, res) => {
      const paymentData = req.body;
      console.log('Payment data received:', paymentData);
      const trxId = new ObjectId().toString();
      paymentData.transactionId = trxId;

      const initiate = {
        store_id: "monpr695bf98225e59",
        store_passwd: "monpr695bf98225e59@ssl",
        total_amount: paymentData.amount,
        currency: 'BDT',
        tran_id: trxId, // use unique tran_id for each api call
        success_url: 'https://monprova-server-b72d8846b-tanjim-rooms-projects.vercel.app//success-payment',
        fail_url: 'https://monprova-9037c.firebaseapp.com/fail',
        cancel_url: 'https://monprova-9037c.firebaseapp.com/cancel',
        ipn_url: 'https://monprova-server-b72d8846b-tanjim-rooms-projects.vercel.app//ipn-success-payment',
        shipping_method: 'Courier',
        product_name: 'Computer.',
        product_category: 'Electronic',
        product_profile: 'general',
        cus_name: 'Customer Name',
        cus_email: `${paymentData.email}`,
        cus_add1: 'Dhaka',
        cus_add2: 'Dhaka',
        cus_city: 'Dhaka',
        cus_state: 'Dhaka',
        cus_postcode: '1000',
        cus_country: 'Bangladesh',
        cus_phone: '01711111111',
        cus_fax: '01711111111',
        ship_name: 'Customer Name',
        ship_add1: 'Dhaka',
        ship_add2: 'Dhaka',
        ship_city: 'Dhaka',
        ship_state: 'Dhaka',
        ship_postcode: 1000,
        ship_country: 'Bangladesh',
      };

      try {
        const iniResponse = await axios({
          method: 'post',
          url: 'https://sandbox.sslcommerz.com/gwprocess/v4/api.php',
          data: initiate,
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        console.log('SSLCommerz API Response:', iniResponse.data);

        if (iniResponse?.data?.GatewayPageURL) {
          const saveData = await paymentCollection.insertOne(paymentData); // Save payment data to DB
          const gatewayUrl = iniResponse.data.GatewayPageURL;
          res.send({ gatewayUrl });
        } else {
          console.error('SSLCommerz API Response: No GatewayPageURL');
          res.status(500).send({ message: 'Payment gateway initiation failed. No GatewayPageURL in response.' });
        }
      } catch (error) {
        console.error('Error during payment initiation:', error);
        res.status(500).send({ message: 'Payment initiation failed. Please try again later.', error: error.message });
      }
    });


    // ========== User Management Routes ==========
    // Get user by ID
    app.get('/api/users/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await userCollection.findOne(query);
        if (!result) {
          return res.status(404).json({ message: "User not found" });
        }
        res.send(result);
      } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ message: "Server error" });
      }
    });

    // Delete user by ID
    app.delete('/api/users/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await userCollection.deleteOne(query);
        if (result.deletedCount === 0) {
          return res.status(404).json({ message: "User not found" });
        }
        res.send(result);
      } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ message: "Server error" });
      }
    });

    // ========== Doctor Verification Routes (MUST BE BEFORE :id route) ==========
    // Request verification - Doctor submits profile for verification
    app.post('/api/doctors/request-verification', async (req, res) => {
      try {
        const { email } = req.body;

        if (!email) {
          return res.status(400).json({ success: false, message: 'Email is required' });
        }

        // Check if doctor exists
        const doctor = await doctorCollection.findOne({ email });

        if (!doctor) {
          return res.status(404).json({ success: false, message: 'Doctor profile not found' });
        }

        // ✅ Check if already verified
        if (doctor.verificationStatus === 'verified') {
          return res.status(400).json({
            success: false,
            message: 'Your profile is already verified'
          });
        }

        // ✅ Check if already pending
        if (doctor.verificationStatus === 'pending') {
          return res.status(400).json({
            success: false,
            message: 'Verification request already pending. Please wait for admin approval'
          });
        }

        // Check if profile is complete (basic validation)
        const requiredFields = ['name', 'email', 'designation', 'degrees', 'consultationFee', 'regNo'];
        const missingFields = requiredFields.filter(field => !doctor[field]);

        if (missingFields.length > 0) {
          return res.status(400).json({
            success: false,
            message: 'Please complete your profile before requesting verification',
            missingFields
          });
        }

        // Update doctor status to 'pending'
        const result = await doctorCollection.updateOne(
          { email },
          {
            $set: {
              verificationStatus: 'pending',
              verificationRequestedAt: new Date()
            }
          }
        );

        if (result.modifiedCount > 0) {
          return res.status(200).json({
            success: true,
            message: 'Verification request submitted successfully'
          });
        } else {
          return res.status(400).json({
            success: false,
            message: 'Failed to submit verification request'
          });
        }
      } catch (error) {
        console.error('Verification request error:', error);
        return res.status(500).json({
          success: false,
          message: 'Server error',
          error: error.message
        });
      }
    });

    // Get pending verification requests
    app.get('/api/doctors/verification-requests', async (req, res) => {
      try {
        const { status } = req.query;

        let query = {};
        if (status) {
          query.verificationStatus = status;
        } else {
          // If no status specified, return all pending requests
          query.verificationStatus = 'pending';
        }

        console.log('Fetching verification requests with query:', query);
        const requests = await doctorCollection.find(query).toArray();
        console.log(`Found ${requests.length} doctors with status: ${status || 'pending'}`);

        res.status(200).json({ success: true, data: requests, count: requests.length });
      } catch (error) {
        console.error('Error fetching verification requests:', error);
        res.status(500).json({
          success: false,
          message: 'Server error',
          error: error.message
        });
      }
    });

    // Migration endpoint - Initialize verificationStatus for existing doctors (one-time use)
    app.post('/api/doctors/migrate-verification-status', async (req, res) => {
      try {
        // Update all doctors without verificationStatus to 'not-verified'
        const result = await doctorCollection.updateMany(
          { verificationStatus: { $exists: false } },
          { $set: { verificationStatus: 'not-verified', updatedAt: new Date() } }
        );

        res.status(200).json({
          success: true,
          message: 'Migration completed',
          modifiedCount: result.modifiedCount
        });
      } catch (error) {
        console.error('Migration error:', error);
        res.status(500).json({
          success: false,
          message: 'Migration failed',
          error: error.message
        });
      }
    });

    // Get pending verification requests
    app.get('/api/doctors/verification-requests', async (req, res) => {
      try {
        const { status } = req.query;

        let query = {};
        if (status) {
          query.verificationStatus = status;
        } else {
          // If no status specified, return all pending requests
          query.verificationStatus = 'pending';
        }

        console.log('Fetching verification requests with query:', query);
        const requests = await doctorCollection.find(query).toArray();
        console.log(`Found ${requests.length} doctors with status: ${status || 'pending'}`);

        res.status(200).json({ success: true, data: requests, count: requests.length });
      } catch (error) {
        console.error('Error fetching verification requests:', error);
        res.status(500).json({
          success: false,
          message: 'Server error',
          error: error.message
        });
      }
    });

    // Debug endpoint to check verification status of all doctors
    app.get('/api/doctors/debug-verification-status', async (req, res) => {
      try {
        const allDoctors = await doctorCollection.find({}).toArray();
        const summary = allDoctors.map(doc => ({
          _id: doc._id,
          name: doc.name,
          email: doc.email,
          verificationStatus: doc.verificationStatus || 'NOT SET'
        }));

        const statusCount = {};
        allDoctors.forEach(doc => {
          const status = doc.verificationStatus || 'NOT SET';
          statusCount[status] = (statusCount[status] || 0) + 1;
        });

        res.status(200).json({
          success: true,
          totalDoctors: allDoctors.length,
          statusCount,
          doctors: summary
        });
      } catch (error) {
        console.error('Error in debug endpoint:', error);
        res.status(500).json({
          success: false,
          message: 'Server error',

          error: error.message
        });
      } 
    });


    // Migration endpoint - Initialize verificationStatus for existing doctors (one-time use)
    app.post('/api/doctors/migrate-verification-status', async (req, res) => {
      try {
        // Update all doctors without verificationStatus to 'not-verified'
        const result = await doctorCollection.updateMany(
          { verificationStatus: { $exists: false } },
          { $set: { verificationStatus: 'not-verified', updatedAt: new Date() } }
        );

        res.status(200).json({
          success: true,
          message: 'Migration completed',
          modifiedCount: result.modifiedCount
        });
      } catch (error) {
        console.error('Migration error:', error);
        res.status(500).json({
          success: false,
          message: 'Migration failed',
          error: error.message
        });
      }
    });

    // Verify or reject doctor
    app.put('/api/doctors/verify/:id', async (req, res) => {
      try {
        const { id } = req.params;
        const { action, rejectionReason } = req.body; // action: 'verify' or 'reject'

        if (!action || !['verify', 'reject'].includes(action)) {
          return res.status(400).json({
            success: false,
            message: 'Invalid action. Must be "verify" or "reject"'
          });
        }

        const updateData = {
          verificationStatus: action === 'verify' ? 'verified' : 'rejected',
          verificationUpdatedAt: new Date()
        };

        if (action === 'reject' && rejectionReason) {
          updateData.rejectionReason = rejectionReason;
        }

        if (action === 'verify') {
          updateData.verifiedAt = new Date();
        }

        const result = await doctorCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: updateData }
        );

        if (result.modifiedCount > 0) {
          return res.status(200).json({
            success: true,
            message: `Doctor ${action === 'verify' ? 'verified' : 'rejected'} successfully`
          });
        } else {
          return res.status(404).json({
            success: false,
            message: 'Doctor not found or no changes made'
          });
        }
      } catch (error) {
        console.error('Error verifying/rejecting doctor:', error);
        res.status(500).json({
          success: false,
          message: 'Server error',  
          error: error.message
        });
      }
    });

    // Get all verification requests (all statuses)
    app.get('/api/doctors/all-verification-requests', async (req, res) => {
      try {
        // Get all doctors and include those without verificationStatus
        const requests = await doctorCollection.find({}).toArray();
        console.log(`Found ${requests.length} total doctors`);

        // Log status distribution
        const statusCount = {};
        requests.forEach(doc => {
          const status = doc.verificationStatus || 'undefined';
          statusCount[status] = (statusCount[status] || 0) + 1;
        });
        console.log('Verification status distribution:', statusCount);

        res.status(200).json({ success: true, data: requests, statusCount });
      } catch (error) {
        console.error('Error fetching all verification requests:', error);
        res.status(500).json({
          success: false,
          message: 'Server error',
          error: error.message
        });
      }
    });


    // Debug endpoint to check verification status of all doctors
    app.get('/api/doctors/debug-verification-status', async (req, res) => {
      try {
        const allDoctors = await doctorCollection.find({}).toArray();
        const summary = allDoctors.map(doc => ({
          _id: doc._id,
          name: doc.name,
          email: doc.email,
          verificationStatus: doc.verificationStatus || 'NOT SET'
        }));

        const statusCount = {};
        allDoctors.forEach(doc => {
          const status = doc.verificationStatus || 'NOT SET';
          statusCount[status] = (statusCount[status] || 0) + 1;
        });

        res.status(200).json({
          success: true,
          totalDoctors: allDoctors.length,
          statusCount,
          doctors: summary
        });
      } catch (error) {
        console.error('Error in debug endpoint:', error);
        res.status(500).json({
          success: false,
          message: 'Server error',
          error: error.message
        });
      }
    });

    // Verify or reject doctor
    app.put('/api/doctors/verify/:id', async (req, res) => {
      try {
        const { id } = req.params;
        const { action, rejectionReason } = req.body; // action: 'verify' or 'reject'

        if (!action || !['verify', 'reject'].includes(action)) {
          return res.status(400).json({
            success: false,
            message: 'Invalid action. Must be "verify" or "reject"'
          });
        }

        const updateData = {
          verificationStatus: action === 'verify' ? 'verified' : 'rejected',
          verificationUpdatedAt: new Date()
        };

        if (action === 'reject' && rejectionReason) {
          updateData.rejectionReason = rejectionReason;
        }

        if (action === 'verify') {
          updateData.verifiedAt = new Date();
        }

        const result = await doctorCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: updateData }
        );

        if (result.modifiedCount > 0) {
          return res.status(200).json({
            success: true,
            message: `Doctor ${action === 'verify' ? 'verified' : 'rejected'} successfully`
          });
        } else {
          return res.status(404).json({
            success: false,
            message: 'Doctor not found or no changes made'
          });
        }
      } catch (error) {
        console.error('Error verifying/rejecting doctor:', error);
        res.status(500).json({
          success: false,
          message: 'Server error',
          error: error.message
        });
      }
    });

    // ========== Doctor Management Routes ==========
    // Get doctor by ID (MUST BE AFTER specific routes)
    app.get('/api/doctors/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await doctorCollection.findOne(query);
        if (!result) {
          return res.status(404).json({ message: "Doctor not found" });
        }
        res.send(result);
      } catch (error) {
        console.error("Error fetching doctor:", error);
        res.status(500).json({ message: "Server error" });
      }
    });

    // Delete doctor by ID
   

    // Get verification status by email
    app.get('/api/doctors/verification-status/:email', async (req, res) => {
      try {
        const { email } = req.params;
        const doctor = await doctorCollection.findOne({ email });

        if (!doctor) {
          return res.status(404).json({
            success: false,
            message: 'Doctor not found'
          });
        }

        res.status(200).json({
          success: true,
          verificationStatus: doctor.verificationStatus || 'not-verified',
          rejectionReason: doctor.rejectionReason || null
        });
      } catch (error) {
        console.error('Error fetching verification status:', error);
        res.status(500).json({
          success: false,
          message: 'Server error',
          error: error.message
        });
      }
    });

    // ========== Doctor Management Routes ==========
    // Get doctor by ID (MUST BE AFTER specific routes)
    app.get('/api/doctors/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await doctorCollection.findOne(query);
        if (!result) {
          return res.status(404).json({ message: "Doctor not found" });
        }
        res.send(result);
      } catch (error) {
        console.error("Error deleting doctor:", error);
        res.status(500).json({ message: "Server error" });
      }
    });

    // ========== Patient Management Routes ==========

    // Delete doctor by ID
    app.delete('/api/doctors/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await doctorCollection.deleteOne(query);
        if (result.deletedCount === 0) {
          return res.status(404).json({ message: "Doctor not found" });
        }
        res.send(result);
      } catch (error) {
        console.error("Error deleting doctor:", error);
        res.status(500).json({ message: "Server error" });
      }
    });

    // ========== Appointment Management Routes ==========
    // Get appointment by ID
    app.get('/api/appointments/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await appointmentCollection.findOne(query);
        if (!result) {
          return res.status(404).json({ message: "Appointment not found" });
        }
        res.send(result);
      } catch (error) {
        console.error("Error fetching appointment:", error);
        res.status(500).json({ message: "Server error" });
      res.send(result);
    } 
  });

  // Get patient by email
  app.get('/api/patients/email/:email', async (req, res) => {
    try {
      const email = req.params.email;
      const result = await patientCollection.findOne({ email: email });
      if (!result) {
        return res.status(404).json({ message: "Patient profile not found" });
      }
      res.send(result);
    } catch (error) {
      console.error("Error fetching patient by email:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // ========== Appointment Management Routes ==========



    // ========== Patient Management Routes ==========
    // Get patient by ID
    app.get('/api/patients/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await patientCollection.findOne(query);
        if (!result) {
          return res.status(404).json({ message: "Patient not found" });
        }
        res.send(result);
      } catch (error) {
        console.error("Error fetching patient:", error);
        res.status(500).json({ message: "Server error" });
      }
    });

    // ========== Appointment Management Routes ==========
    // Get appointment by ID
    app.get('/api/appointments/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await appointmentCollection.findOne(query);
        if (!result) {
          return res.status(404).json({ message: "Appointment not found" });
        }
        res.send(result);
      } catch (error) {
        console.error("Error fetching appointment:", error);
        res.status(500).json({ message: "Server error" });
      }
    });


    //===========================
    // API to fetch schedule data



    // Test route
    app.get('/', (req, res) => {
      res.send('Server is running!');
    });

    console.log("MongoDB connected successfully!");
  } catch (err) {
    console.error(err);
  }
  finally {
    // keep client open
  }
}

run().catch(console.dir);

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
        