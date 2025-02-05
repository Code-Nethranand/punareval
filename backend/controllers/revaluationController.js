const Revaluation = require('../models/revaluation');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for PDF upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'uploads/revaluation';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed'));
        }
    }
});

// Get all revaluation applications
exports.getAllApplications = async (req, res) => {
    try {
        const applications = await Revaluation.find().sort({ createdAt: -1 });
        res.status(200).json(applications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create new revaluation application
exports.createApplication = async (req, res) => {
    try {
        const {
            name,
            usn,
            subjectCode,
            subjectName,
            semester,
            marks,
            credits,
            fees
        } = req.body;

        const application = new Revaluation({
            name,
            usn,
            subjectCode,
            subjectName,
            semester,
            marks,
            credits,
            fees
        });

        const savedApplication = await application.save();
        res.status(201).json(savedApplication);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Update payment status
exports.updatePaymentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { paymentStatus } = req.body;

        const application = await Revaluation.findByIdAndUpdate(
            id,
            { paymentStatus },
            { new: true }
        );

        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        res.status(200).json(application);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Evaluate application
exports.evaluateApplication = async (req, res) => {
    try {
        upload.single('pdfFile')(req, res, async (err) => {
            if (err) {
                return res.status(400).json({ message: err.message });
            }

            const { id } = req.params;
            const { marks } = req.body;

            const updates = {
                evaluationStatus: 'Evaluated',
                evaluatedMarks: marks
            };

            if (req.file) {
                updates.pdfPath = req.file.path;
            }

            const application = await Revaluation.findByIdAndUpdate(
                id,
                updates,
                { new: true }
            );

            if (!application) {
                if (req.file) {
                    fs.unlinkSync(req.file.path);
                }
                return res.status(404).json({ message: 'Application not found' });
            }

            res.status(200).json(application);
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get application by ID
exports.getApplicationById = async (req, res) => {
    try {
        const application = await Revaluation.findById(req.params.id);
        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }
        res.status(200).json(application);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete application
exports.deleteApplication = async (req, res) => {
    try {
        const application = await Revaluation.findById(req.params.id);
        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        // Delete associated PDF file if exists
        if (application.pdfPath && fs.existsSync(application.pdfPath)) {
            fs.unlinkSync(application.pdfPath);
        }

        await application.remove();
        res.status(200).json({ message: 'Application deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
