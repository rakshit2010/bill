const express = require("express");
const puppeteer = require("puppeteer");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const twilio = require("twilio");

const app = express();
const upload = multer();
const client = twilio("TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/generate-pdf", async (req, res) => {
    const { invoiceHtml, phoneNumber } = req.body;

    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.setContent(invoiceHtml);
        const pdfPath = `./invoices/invoice_${Date.now()}.pdf`;
        await page.pdf({ path: pdfPath, format: "A4" });

        await browser.close();

        // Upload the PDF somewhere and get the URL (example: Google Drive, Firebase, or S3)
        const pdfUrl = `https://your-server.com/${pdfPath}`;

        // Send via WhatsApp API (Twilio)
        await client.messages.create({
            from: "whatsapp:+14155238886",
            to: `whatsapp:+91${phoneNumber}`,
            body: "Here is your invoice:",
            mediaUrl: pdfUrl,
        });

        res.json({ success: true, message: "PDF sent via WhatsApp!", pdfUrl });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Error generating PDF" });
    }
});

app.listen(3000, () => console.log("Server running on port 3000"));
