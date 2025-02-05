const mongoose = require('mongoose');

const subjectMarkSchema = new mongoose.Schema({
    subjectCode: {
        type: String,
        required: true
    },
    subjectName: {
        type: String,
        required: true
    },
    marks: {
        type: Number,
        required: true
    },
    credits: {
        type: Number,
        required: true
    }
});

const studentResultSchema = new mongoose.Schema({
    studentName: {
        type: String,
        required: true
    },
    usn: {
        type: String,
        required: true
    },
    subjects: [subjectMarkSchema],
    totalMarks: {
        type: Number,
        required: true
    },
    percentage: {
        type: Number,
        required: true
    },
    result: {
        type: String,
        enum: ['Pass', 'Fail'],
        required: true
    }
});

const examDetailsSchema = new mongoose.Schema({
    semester: {
        type: String,
        required: true
    },
    examDate: {
        type: Date,
        required: true
    },
    examType: {
        type: String,
        enum: ['Regular', 'Supplementary'],
        required: true
    },
    studentResults: [studentResultSchema]
}, {
    timestamps: true
});

module.exports = mongoose.model('ExamDetails', examDetailsSchema);
