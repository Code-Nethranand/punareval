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
        // Create a new exam detail
        const examDetail = new ExamDetails({
            usn: req.body.usn,
            semester: req.body.semester,
            examDate: req.body.examDate,
            examType: req.body.examType,
            subjectCode: req.body.subjectCode,
            subjectName: req.body.subjectName,
            marks: req.body.marks,
            status: req.body.status
        });

        // Save to database
        const savedDetail = await examDetail.save();
        
        res.status(201).json({
            message: 'Result uploaded successfully',
            data: savedDetail
        });
    } catch (error) {
        console.error('Error in createExamDetails:', error);
        res.status(400).json({
            message: error.message,
            details: error.errors || error
        });
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
        const results = await ExamDetails.find({ usn });
        
        if (!results || results.length === 0) {
            return res.status(404).json({ message: 'No results found for this USN' });
        }

        res.status(200).json(results);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update exam details
exports.updateExamDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Validate marks and update status if marks are changed
        if (updates.marks !== undefined) {
            updates.status = parseInt(updates.marks) >= 40 ? 'Pass' : 'Fail';
        }

        const updatedExam = await ExamDetails.findByIdAndUpdate(
            id,
            updates,
            { new: true, runValidators: true }
        );

        if (!updatedExam) {
            return res.status(404).json({ message: 'Exam details not found' });
        }

        res.status(200).json(updatedExam);
    } catch (error) {
        console.error('Error in updateExamDetails:', error);
        res.status(400).json({
            message: error.message,
            details: error.errors || error
        });
    }
};

// Delete exam details
exports.deleteExamDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedDetails = await ExamDetails.findByIdAndDelete(id);
        
        if (!deletedDetails) {
            return res.status(404).json({ message: 'Exam details not found' });
        }
        
        res.status(200).json({ message: 'Exam details deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get exam details by semester
exports.getExamDetailsBySemester = async (req, res) => {
    try {
        const { semester } = req.params;
        const results = await ExamDetails.find({ semester });
        
        if (!results || results.length === 0) {
            return res.status(404).json({ message: 'No results found for this semester' });
        }
        
        res.status(200).json(results);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Bulk upload exam details
exports.bulkUploadExamDetails = async (req, res) => {
    try {
        const { examDetails } = req.body;
        
        console.log('Received examDetails:', examDetails); // Debug log
        
        if (!Array.isArray(examDetails)) {
            return res.status(400).json({ message: 'examDetails must be an array' });
        }

        // Validate and transform each entry
        const validatedEntries = examDetails.map((entry, index) => {
            // Validate required fields
            const requiredFields = ['usn', 'semester', 'examDate', 'examType', 'subjectCode', 'subjectName', 'marks'];
            const missingFields = requiredFields.filter(field => !entry[field]);
            
            if (missingFields.length > 0) {
                throw new Error(`Row ${index + 1}: Missing required fields: ${missingFields.join(', ')}`);
            }

            // Create validated entry
            const validatedEntry = new ExamDetails({
                usn: entry.usn.trim(),
                semester: entry.semester.toString(),
                examDate: new Date(entry.examDate),
                examType: entry.examType,
                subjectCode: entry.subjectCode.trim(),
                subjectName: entry.subjectName.trim(),
                marks: parseInt(entry.marks),
                status: parseInt(entry.marks) >= 40 ? 'Pass' : 'Fail'
            });

            // Additional validation
            if (isNaN(validatedEntry.marks) || validatedEntry.marks < 0 || validatedEntry.marks > 100) {
                throw new Error(`Row ${index + 1}: Invalid marks value`);
            }

            if (!['Regular', 'Supplementary'].includes(validatedEntry.examType)) {
                throw new Error(`Row ${index + 1}: Invalid exam type`);
            }

            return validatedEntry;
        });

        // Create all exam details using insertMany
        const savedDetails = await ExamDetails.insertMany(validatedEntries, { validateBeforeSave: true });
        
        console.log('Saved details:', savedDetails); // Debug log
        
        res.status(201).json({
            message: 'Results uploaded successfully',
            count: savedDetails.length,
            firstEntry: savedDetails[0] // Debug: show first saved entry
        });
    } catch (error) {
        console.error('Error in bulkUploadExamDetails:', error);
        res.status(400).json({ 
            message: error.message || 'Failed to upload results',
            details: error.errors || error
        });
    }
};
