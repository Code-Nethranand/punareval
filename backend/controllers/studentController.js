const ExamDetails = require('../models/examDetails');
const logger = require('../utils/logger');

// Get student details by USN
exports.getStudentDetails = async (req, res) => {
    try {
        const { usn } = req.params;
        
        const examDetails = await ExamDetails.findOne({
            'studentResults.usn': usn
        });

        if (!examDetails || !examDetails.studentResults) {
            return res.status(404).json({ message: 'Student not found' });
        }

        const student = examDetails.studentResults.find(s => s.usn === usn);
        res.status(200).json(student);
    } catch (error) {
        logger.error('Error fetching student details:', error);
        res.status(500).json({ message: error.message });
    }
};

// Update student marks
exports.updateStudentMarks = async (req, res) => {
    try {
        const { usn } = req.params;
        const { subjectCode, marks } = req.body;

        // Validate input
        if (!subjectCode || marks === undefined) {
            return res.status(400).json({ message: 'Subject code and marks are required' });
        }

        // Find exam details containing the student
        const examDetails = await ExamDetails.findOne({
            'studentResults.usn': usn
        });

        if (!examDetails) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Find the student and update their marks
        const student = examDetails.studentResults.find(s => s.usn === usn);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Find and update the subject marks
        const subject = student.subjects.find(s => s.subjectCode === subjectCode);
        if (!subject) {
            return res.status(404).json({ message: 'Subject not found' });
        }

        // Update marks
        subject.marks = marks;

        // Recalculate total marks and percentage
        const totalMarks = student.subjects.reduce((sum, sub) => sum + sub.marks, 0);
        const totalMaxMarks = student.subjects.length * 100; // Assuming max marks is 100
        const percentage = (totalMarks / totalMaxMarks) * 100;
        
        // Update student results
        student.totalMarks = totalMarks;
        student.percentage = parseFloat(percentage.toFixed(2));
        student.result = percentage >= 40 ? 'Pass' : 'Fail';

        // Save changes
        await examDetails.save();

        // Log the update
        logger.info('Student marks updated', {
            usn,
            subjectCode,
            oldMarks: subject.marks,
            newMarks: marks,
            updatedBy: req.user?.username || 'admin'
        });

        res.status(200).json({
            message: 'Marks updated successfully',
            student
        });
    } catch (error) {
        logger.error('Error updating student marks:', error);
        res.status(500).json({ message: error.message });
    }
};

// Delete student subject
exports.deleteStudentSubject = async (req, res) => {
    try {
        const { usn } = req.params;
        const { subjectCode } = req.body;

        // Validate input
        if (!subjectCode) {
            return res.status(400).json({ message: 'Subject code is required' });
        }

        const examDetails = await ExamDetails.findOne({
            'studentResults.usn': usn
        });

        if (!examDetails) {
            return res.status(404).json({ message: 'Student not found' });
        }

        const student = examDetails.studentResults.find(s => s.usn === usn);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Remove the subject
        const subjectIndex = student.subjects.findIndex(s => s.subjectCode === subjectCode);
        if (subjectIndex === -1) {
            return res.status(404).json({ message: 'Subject not found' });
        }

        student.subjects.splice(subjectIndex, 1);

        // Recalculate totals if there are remaining subjects
        if (student.subjects.length > 0) {
            const totalMarks = student.subjects.reduce((sum, sub) => sum + sub.marks, 0);
            const totalMaxMarks = student.subjects.length * 100;
            const percentage = (totalMarks / totalMaxMarks) * 100;
            
            student.totalMarks = totalMarks;
            student.percentage = parseFloat(percentage.toFixed(2));
            student.result = percentage >= 40 ? 'Pass' : 'Fail';
        }

        await examDetails.save();

        // Log the deletion
        logger.info('Student subject deleted', {
            usn,
            subjectCode,
            deletedBy: req.user?.username || 'admin'
        });

        res.status(200).json({
            message: 'Subject deleted successfully',
            student
        });
    } catch (error) {
        logger.error('Error deleting student subject:', error);
        res.status(500).json({ message: error.message });
    }
};
