const puppeteer = require('puppeteer');
const path = require('path');

async function generatePrescriptionPDF(url) {
  try {
    const browser = await puppeteer.launch({
      headless: "new",
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    // Navigate to the page (ensure it's fully loaded)
    console.log(`Navigating to: ${url}`);
    await page.goto(url, { 
      waitUntil: 'networkidle0',
      timeout: 60000 
    });

    // Wait for the content to render
    await page.waitForSelector('#prescription-root', { timeout: 30000 });

    // Generate PDF and save it
    const filePath = path.join(__dirname, 'prescriptionDetails.pdf');
    await page.pdf({
      path: filePath,
      format: 'A4',
      printBackground: true, // Ensure background styles are included
      margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' }
    });

    console.log('PDF generated successfully:', filePath);
    await browser.close();

    return filePath; // Return the file path for further use
  } catch (error) {
    console.error("Error in generatePrescriptionPDF:", error);
    throw error;
  }
}

module.exports = generatePrescriptionPDF;
