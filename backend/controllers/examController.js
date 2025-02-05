const ExamDetails = require('../models/examDetails');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'uploads/csv';
        // Create directory if it doesn't exist
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
        if (file.mimetype === 'text/csv') {
            cb(null, true);
        } else {
            cb(new Error('Only CSV files are allowed'));
        }
    }
});

// Helper function to calculate result statistics
const calculateResultStats = (subjects) => {
    const totalMarks = subjects.reduce((sum, subject) => sum + subject.marks, 0);
    const totalMaxMarks = subjects.length * 100; // Assuming max marks per subject is 100
    const percentage = (totalMarks / totalMaxMarks) * 100;
    const result = percentage >= 40 ? 'Pass' : 'Fail'; // Assuming 40% is pass mark

    return {
        totalMarks,
        percentage: parseFloat(percentage.toFixed(2)),
        result
    };
};

// Helper function to parse CSV file
const parseCSV = async (filePath) => {
    const results = [];
    const studentMap = new Map();

    return new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => {
                const studentKey = data.usn;
                if (!studentMap.has(studentKey)) {
                    studentMap.set(studentKey, {
                        studentName: data.studentName,
                        usn: data.usn,
                        subjects: []
                    });
                }

                const student = studentMap.get(studentKey);
                student.subjects.push({
                    subjectCode: data.subjectCode,
                    subjectName: data.subjectName,
                    marks: parseFloat(data.marks),
                    credits: parseInt(data.credits)
                });
            })
            .on('end', () => {
                // Process each student's results
                for (const student of studentMap.values()) {
                    const stats = calculateResultStats(student.subjects);
                    results.push({
                        ...student,
                        ...stats
                    });
                }
                resolve(results);
            })
            .on('error', (error) => reject(error));
    });
};

// Create new exam details with CSV upload
exports.createExamDetails = async (req, res) => {
    try {
        upload.single('csvFile')(req, res, async (err) => {
            if (err) {
                return res.status(400).json({ message: err.message });
            }

            if (!req.file) {
                return res.status(400).json({ message: 'Please upload a CSV file' });
            }

            const { semester, examDate, examType } = req.body;
            const csvFilePath = req.file.path;

            try {
                const studentResults = await parseCSV(csvFilePath);
                
                const examDetails = new ExamDetails({
                    semester,
                    examDate,
                    examType,
                    studentResults
                });

                const savedExamDetails = await examDetails.save();
                
                // Clean up uploaded file
                fs.unlinkSync(csvFilePath);
                
                res.status(201).json(savedExamDetails);
            } catch (error) {
                // Clean up uploaded file if processing fails
                fs.unlinkSync(csvFilePath);
                res.status(400).json({ message: error.message });
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all exam details
exports.getAllExamDetails = async (req, res) => {
    try {
        const examDetails = await ExamDetails.find().sort({ examDate: -1 });
        res.status(200).json(examDetails);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get exam details by ID
exports.getExamDetailsById = async (req, res) => {
    try {
        const examDetails = await ExamDetails.findById(req.params.id);
        if (!examDetails) {
            return res.status(404).json({ message: 'Exam details not found' });
        }
        res.status(200).json(examDetails);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get results by USN
exports.getResultsByUSN = async (req, res) => {
    try {
        const { usn } = req.params;
        const examDetails = await ExamDetails.find({
            'studentResults.usn': usn
        });

        if (!examDetails || examDetails.length === 0) {
            return res.status(404).json({ message: 'No results found for this USN' });
        }

        const results = examDetails.map(exam => ({
            semester: exam.semester,
            examDate: exam.examDate,
            examType: exam.examType,
            result: exam.studentResults.find(student => student.usn === usn)
        }));

        res.status(200).json(results);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update exam details
exports.updateExamDetails = async (req, res) => {
    try {
        upload.single('csvFile')(req, res, async (err) => {
            if (err) {
                return res.status(400).json({ message: err.message });
            }

            const updates = {
                semester: req.body.semester,
                examDate: req.body.examDate,
                examType: req.body.examType
            };

            if (req.file) {
                try {
                    updates.studentResults = await parseCSV(req.file.path);
                    fs.unlinkSync(req.file.path);
                } catch (error) {
                    if (req.file) fs.unlinkSync(req.file.path);
                    return res.status(400).json({ message: error.message });
                }
            }

            const examDetails = await ExamDetails.findByIdAndUpdate(
                req.params.id,
                updates,
                { new: true }
            );

            if (!examDetails) {
                return res.status(404).json({ message: 'Exam details not found' });
            }

            res.status(200).json(examDetails);
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete exam details
exports.deleteExamDetails = async (req, res) => {
    try {
        const examDetails = await ExamDetails.findById(req.params.id);
        if (!examDetails) {
            return res.status(404).json({ message: 'Exam details not found' });
        }

        await examDetails.remove();
        res.status(200).json({ message: 'Exam details deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
