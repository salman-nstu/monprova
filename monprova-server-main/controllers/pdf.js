const puppeteer = require('puppeteer');
const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');
const fs = require('fs');
const path = require('path');

const createPDF = async (req, res, appointmentObjectId) => {
    try {
        console.log(`Generating PDF for appointment (Server-Side HTML): ${appointmentObjectId}`);
        
        const db = getDB();
        if (!db) {
            throw new Error('Database connection not available');
        }
        
        // 1. Fetch Data
        console.log('Fetching appointment data...');
        const appointment = await db.collection('appointments').findOne({ _id: appointmentObjectId });
        if (!appointment) {
            console.log(`Appointment not found: ${appointmentObjectId}`);
            return res.status(404).json({ message: "Appointment not found" });
        }
        console.log('Appointment found:', appointment._id);

        console.log('Fetching prescription data...');
        const prescription = await db.collection('prescriptions').findOne({ appointmentID: appointmentObjectId.toString() });
        if (!prescription) {
            console.log(`Prescription not found for appointment: ${appointmentObjectId}`);
            return res.status(404).json({ message: "Prescription not found" });
        }
        console.log('Prescription found:', prescription._id);

        let doctor = {};
        if (appointment.doctorID) {
            try {
                // Try as ObjectId
                doctor = await db.collection('doctors').findOne({ _id: new ObjectId(appointment.doctorID) });
            } catch (e) {
                // Try as string
                doctor = await db.collection('doctors').findOne({ _id: appointment.doctorID });
            }
        }
        doctor = doctor || {};

        // 2. Prepare Assets (Logo)
        let logoBase64 = '';
        try {
            const logoPath = path.resolve(__dirname, '../../monprova-client/src/assets/monlogo.png');
            if (fs.existsSync(logoPath)) {
                const logoData = fs.readFileSync(logoPath);
                logoBase64 = `data:image/png;base64,${logoData.toString('base64')}`;
            }
        } catch (err) {
            console.error("Error loading logo:", err);
        }

        // 3. Construct HTML
        // Helper for dates
        const formatDate = (dateVal) => {
            if (!dateVal) return "N/A";
            return new Date(dateVal).toLocaleDateString("en-GB", {
                day: "numeric", month: "long", year: "numeric",
            });
        };

        const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Prescription</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;700&display=swap');
                body { font-family: 'Noto Sans Bengali', sans-serif; }
            </style>
        </head>
        <body class="bg-white p-8 text-black">
            <div id="prescription-root" class="max-w-4xl mx-auto">
                
                <!-- Header -->
                <div class="flex justify-between border-b pb-4">
                    <div>
                        <h1 class="text-xl font-bold">${doctor.name || "N/A"}</h1>
                        <p class="text-sm">${doctor.designation || "N/A"}</p>
                        <p class="text-sm">${doctor.degrees || "N/A"}</p>
                        <p class="text-sm">${doctor.institute || "N/A"}</p>
                        <p class="text-sm">BMDC Reg. No: ${doctor.regNo || "N/A"}</p>
                    </div>
                    <div class="text-sm text-right">
                        <p>
                            <span class="font-semibold">তারিখ:</span> 
                            ${formatDate(prescription.updatedAt || prescription.createdAt)}
                        </p>
                        <p>
                            <span class="font-semibold">Ref:</span> ${appointment._id}
                        </p>
                    </div>
                </div>

                <!-- Patient Info -->
                <div class="grid grid-cols-4 gap-4 text-sm border-b py-3 mt-2">
                    <div class="col-span-2">
                        <span class="font-semibold">রোগীর নাম:</span> ${appointment.patientName || "N/A"}
                    </div>
                    <div>
                        <span class="font-semibold">জেন্ডার:</span> 
                        ${appointment.gender === "male" ? "পুরুষ" : appointment.gender === "female" ? "নারী" : "অন্যান্য"}
                    </div>
                    <div>
                        <span class="font-semibold">বয়স:</span> ${appointment.age || "N/A"} বছর
                    </div>
                </div>

                <!-- Main Content -->
                <div class="grid grid-cols-3 gap-6 mt-8">

                    <!-- Chief Complaints and Tests -->
                    <div class="border-r pr-4">
                        <h2 class="font-semibold mb-2">রোগ নির্ণয়:</h2>
                        <p class="whitespace-pre-wrap text-sm">${prescription.chiefComplaints || "N/A"}</p>
                        
                        <h2 class="font-semibold mb-2 mt-6">টেস্টসমূহ:</h2>
                        <p class="whitespace-pre-wrap text-sm">${prescription.tests || "N/A"}</p>
                    </div>

                    <!-- Rx Section -->
                    <div class="col-span-2 ml-4">
                        <div class="flex items-center gap-2 mb-3">
                            <h2 class="text-2xl font-bold font-serif">Rx</h2>
                        </div>

                        <div>
                            <ol class="list-decimal pl-5 space-y-4 text-sm">
                                ${prescription.medications ? prescription.medications.map(med => `
                                    <li>
                                        <div class="mb-1">
                                            <span class="font-bold text-base">${med.name || ""}</span>
                                            <span class="ml-2">${med.dosage || ""}</span>
                                        </div>
                                        <div class="text-gray-700">
                                            ${med.instructions ? `<span>${med.instructions}</span>` : ""}
                                            ${med.duration ? `<span class="ml-4">${med.duration}</span>` : ""}
                                        </div>
                                        <hr class="border-dotted border-gray-400 mt-2" />
                                    </li>
                                `).join('') : ""}
                            </ol>
                        </div>

                        <div class="mt-16">
                            <div class="mt-8 text-sm font-semibold">
                                ফলোআপের সময়: <span class="font-normal">${prescription.followUp || "N/A"}</span>
                            </div>

                            <!-- Advice -->
                            <div class="mt-6">
                                <h2 class="font-semibold mb-2">পরামর্শ:</h2>
                                <p class="text-sm whitespace-pre-wrap">${prescription.advice || "N/A"}</p>
                            </div>

                            <!-- Signature (Optional) -->
                            <div class="mt-16 border-t pt-4 w-1/2">
                                ${doctor.sign ? `<img src="${doctor.sign}" alt="Sign" class="h-12 mb-2" />` : ""}
                                <p class="font-semibold">${doctor.name || "N/A"}</p>
                                <p class="text-xs text-gray-500">${doctor.degrees || ""}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Footer / Logo -->
                <div class="mt-16 opacity-50 flex items-center justify-center gap-2">
                    ${logoBase64 ? `<img src="${logoBase64}" class="w-12 h-12" />` : ""}
                    <span class="text-2xl font-bold text-blue-500">মনপ্রভা</span>
                </div>

            </div>
        </body>
        </html>
        `;

        // 4. Generate PDF
        console.log('Launching browser for PDF generation...');
        const browser = await puppeteer.launch({
            headless: "new",
            args: [
                '--no-sandbox', 
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
                '--disable-extensions'
            ]
        });

        const page = await browser.newPage();
        
        console.log('Setting HTML content...');
        // Use setContent instead of goto
        await page.setContent(htmlContent, {
            waitUntil: "networkidle0",
            timeout: 30000 // 30 second timeout
        });

        console.log('Generating PDF...');
        const pdf = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' },
            timeout: 30000 // 30 second timeout
        });

        await browser.close();
        console.log('Browser closed successfully');

        console.log(`PDF generated successfully via Server-Side HTML, size: ${pdf.length} bytes`);

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Length': pdf.length,
            'Content-Disposition': 'attachment; filename="prescription.pdf"'
        });

        res.send(pdf);

    } catch (error) {
        console.error("PDF Generation Error (Server-Side):", error);
        res.status(500).json({ 
            message: "Error generating PDF", 
            error: error.message 
        });
    }
};

module.exports = { createPDF };
