const express = require('express');
const router = express.Router();
const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');
const axios = require('axios');
const { getDayFromDateString } = require('../utils/helpers');

// SSLCommerz Configuration
const store_id = process.env.STORE_ID;
const store_passwd = process.env.STORE_PASSWD;
const is_live = false; // Set to true for live environment

router.get('/payments', async (req, res) => {
    try {
        const paymentCollection = getDB().collection("payments");
        const result = await paymentCollection.find().toArray();
        res.send(result);
    } catch (error) {
        console.error("Error fetching payments:", error);
        res.status(500).json({ message: "Server error" });
    }
});

router.post('/sslpayment', async (req, res) => {
    console.log("Initiating SSLCommerz payment...");
    const { payment, appointment } = req.body;
    
    // Generate unique transaction ID
    const tran_id = new ObjectId().toString();

    // Prepare data for SSLCommerz
    const data = {
        store_id: store_id,
        store_passwd: store_passwd,
        total_amount: payment.amount,
        currency: 'BDT',
        tran_id: tran_id,
        success_url: `https://monprova-server-production.up.railway.app/api/payment/success/${tran_id}`,
        fail_url: `https://monprova-server.vercel.app/api/payment/fail/${tran_id}`,
        cancel_url: `https://monprova-server.vercel.app/api/payment/cancel/${tran_id}`,
        ipn_url: `https://monprova-server.vercel.app/api/payment/ipn`,
        shipping_method: 'Courier',
        product_name: 'Appointment',
        product_category: 'Health',
        product_profile: 'general',
        cus_name: appointment.patientName || 'Guest',
        cus_email: appointment.patientEmail || 'guest@example.com',
        cus_add1: 'Dhaka',
        cus_add2: 'Dhaka',
        cus_city: 'Dhaka',
        cus_state: 'Dhaka',
        cus_postcode: '1000',
        cus_country: 'Bangladesh',
        cus_phone: appointment.phone || '01700000000',
        cus_fax: appointment.phone || '01700000000',
        ship_name: appointment.patientName || 'Guest',
        ship_add1: 'Dhaka',
        ship_add2: 'Dhaka',
        ship_city: 'Dhaka',
        ship_state: 'Dhaka',
        ship_postcode: 1000,
        ship_country: 'Bangladesh',
    };
    
    const params = new URLSearchParams(data).toString();

    // Save pending payment info
    const paymentCollection = getDB().collection("payments");
    try {
        await paymentCollection.insertOne({
            ...payment,
            amount: data.total_amount,
            tran_id,
            status: 'initiated',
            appointmentData: appointment, 
            createdAt: new Date()
        });
    } catch (dbError) {
        console.error("DB Error saving payment:", dbError);
        return res.status(500).send({ message: "Database Error" });
    }

    const sslUrl = is_live 
        ? 'https://securepay.sslcommerz.com/gwprocess/v4/api.php' 
        : 'https://sandbox.sslcommerz.com/gwprocess/v4/api.php';
    
    try {
        const response = await axios.post(sslUrl, params, {
             headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        
        if (response.data && response.data.status === 'SUCCESS') {
            res.send({ gatewayUrl: response.data.GatewayPageURL });
        } else {
            console.error("SSL Init Error Response:", response.data);
            res.status(400).send({ message: "Session creation failed with SSLCommerz" });
        }
    } catch(err) {
        console.error("SSL Init Failed:", err.message);
        res.status(500).send({ message: "Payment initiation failed" });
    }
});

router.post('/payment/success/:tranId', async (req, res) => {
    try {
        const { tranId } = req.params;
        const paymentCollection = getDB().collection("payments");
        const appointmentCollection = getDB().collection("appointments");
        const scheduleCollection = getDB().collection("schedules");
        const notificationCollection = getDB().collection("notifications");

        console.log(`Payment Success Callback for tranId: ${tranId}`);

        const paymentRecord = await paymentCollection.findOne({ tran_id: tranId });
        if (!paymentRecord) {
            console.error("Payment record not found for:", tranId);
            return res.status(404).send("Payment record not found");
        }

        if (paymentRecord.status === 'paid') {
            return res.redirect(`https://monprova-9037c.firebaseapp.com/payment/success?tranId=${tranId}`);
        }

        // Update payment status
        await paymentCollection.updateOne(
            { tran_id: tranId },
            { 
                $set: { 
                    status: 'paid',
                    val_id: req.body.val_id || '',
                    updatedAt: new Date()
                } 
            }
        );

        // Retrieve the stored appointment data
        const appointmentData = paymentRecord.appointmentData;
        
        // Ensure appointmentData exists
        if (!appointmentData) {
            console.error("No appointment data found in payment record");
            return res.redirect(`https://monprova-9037c.firebaseapp.com/payment-failed`);
        }

        appointmentData.paymentStatus = 'paid';
        appointmentData.transactionId = tranId;
        appointmentData.createdAt = new Date(); 
        
        // Insert into appointments
        const appResult = await appointmentCollection.insertOne(appointmentData);

        // Update Schedule (Mark slot as booked)
        if (appointmentData.appointmentDate && appointmentData.slot && appointmentData.doctorID) {
            try {
                const dayName = getDayFromDateString(appointmentData.appointmentDate);
                console.log(`Updating schedule for Doctor ${appointmentData.doctorID}, Day: ${dayName}, Slot: ${appointmentData.slot}`);
                
                const updateResult = await scheduleCollection.updateOne(
                    { doctorID: appointmentData.doctorID },
                    { 
                        $set: { 
                            [`availability.${dayName}.$[elem].status`]: 'booked' 
                        } 
                    },
                    { 
                        arrayFilters: [ { "elem.time": appointmentData.slot } ] 
                    }
                );
                console.log("Schedule Update Result:", updateResult.modifiedCount);
            } catch (scheduleError) {
                console.error("Error updating schedule:", scheduleError);
                // Continue even if schedule update fails (manual fix might be needed)
            }
        }
        
        // Create notifications
        try {
            if (appointmentData.patientEmail) {
                await notificationCollection.insertOne({
                    userEmail: appointmentData.patientEmail,
                    type: 'appointment_success',
                    message: `আপনার অ্যাপয়েন্টমেন্ট সফলভাবে বুক হয়েছে! তারিখ: ${appointmentData.appointmentDate}, সময়: ${appointmentData.slot}`,
                    relatedId: appResult.insertedId.toString(),
                    isRead: false,
                    createdAt: new Date()
                });
            }
        } catch(e) {
            console.error("Notification creation failed", e);
        }

        // Redirect to client success page
        res.redirect(`https://monprova-9037c.firebaseapp.com/dashboardPatient/payment-success`);
    
    } catch (err) {
        console.error("Error in Payment Success Handler:", err);
        res.redirect(`https://monprova-9037c.firebaseapp.com/payment-failed`);
    }
});

router.post('/payment/fail/:tranId', async (req, res) => {
   const { tranId } = req.params;
   const paymentCollection = getDB().collection("payments");
   
   console.log(`Payment Failed for tranId: ${tranId}`);

   try {
       // Update status to failed
       await paymentCollection.updateOne(
           { tran_id: tranId }, 
           { $set: { status: 'failed', updatedAt: new Date() } }
       );
   } catch(e) {
       console.error("Error updating payment fail status:", e);
   }
   
   res.redirect(`https://monprova-9037c.firebaseapp.com/payment-failed`);
});

router.post('/payment/cancel/:tranId', async (req, res) => {
   const { tranId } = req.params;
   const paymentCollection = getDB().collection("payments");
   
   console.log(`Payment Cancelled for tranId: ${tranId}`);

   try {
       await paymentCollection.updateOne(
           { tran_id: tranId }, 
           { $set: { status: 'cancelled', updatedAt: new Date() } }
       );
   } catch(e) {
       console.error("Error updating payment cancel status:", e);
   }
   
   res.redirect(`https://monprova-9037c.firebaseapp.com/payment-failed`);
});

router.post('/payment/ipn', async (req, res) => {
    res.status(200).send("IPN Received");
});

module.exports = router;
