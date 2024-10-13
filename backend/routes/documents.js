const express = require('express');
const router = express.Router();
const Document = require('../models/Document');
const Transmittal = require('../models/Transmittal');
const sendMail = require('../mailer');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)){
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir)
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname))
    }
});

const upload = multer({ storage: storage });

// Get all documents
router.get('/', async (req, res) => {
    try {
        const documents = await Document.find();
        res.json(documents);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get documents by category
router.get('/category/:category', async (req, res) => {
    try {
        const documents = await Document.find({ category: req.params.category });
        res.json(documents);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get documents by status
router.get('/status/:status', async (req, res) => {
    try {
        const documents = await Document.find({ status: req.params.status });
        res.json(documents);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Upload a new document
router.post('/upload', upload.single('document'), async (req, res) => {
    try {
        let transmittal = await Transmittal.findOne();
        if (!transmittal) {
            transmittal = new Transmittal();
        }
        const transmittalNumber = transmittal.number.toString().padStart(2, '0');
        transmittal.number += 1;
        await transmittal.save();

        const newDocument = new Document({
            docNumber: req.body.docNumber,
            docName: req.body.docName,
            revision: req.body.revision,
            dueDate: req.body.dueDate,
            code: req.body.code,
            status: req.body.status || 'Pending Submission',
            category: req.body.category || 'Others',
            submissionDate: new Date(),
            customerEmail: req.body.customerEmail || 'rohitpatil@sparklecleantech.com',
            transmittalNumber: `Transmittal-${transmittalNumber}`
        });

        const savedDocument = await newDocument.save();

        // Send email (now just logging)
        const emailText = `A new document has been uploaded:
        Document Name: ${savedDocument.docName}
        Transmittal Number: Transmittal-${transmittalNumber}
        Category: ${savedDocument.category}
        Status: ${savedDocument.status}`;

        let emailAttachments = [];
        if (req.file) {
            emailAttachments.push({
                filename: req.file.originalname,
                path: req.file.path
            });
        }

        await sendMail('rohitpatil@sparklecleantech.com', 'New Document Uploaded', emailText, emailAttachments);

        res.status(201).json({
            ...savedDocument.toObject(),
            message: `Document is submitted in Transmittal-${transmittalNumber}`
        });
    } catch (err) {
        console.error('Upload error:', err);
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;