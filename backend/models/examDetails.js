const mongoose = require('mongoose');

const examDetailsSchema = new mongoose.Schema({
    usn: {
        type: String,
        required: true,
        trim: true
    },
    semester: {
        type: String,
        required: true,
        trim: true
    },
    examDate: {
        type: Date,
        required: true
    },
    examType: {
        type: String,
        required: true,
        enum: ['Regular', 'Supplementary']
    },
    subjectCode: {
        type: String,
        required: true,
        trim: true
    },
    subjectName: {
        type: String,
        required: true,
        trim: true
    },
    marks: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    status: {
        type: String,
        required: true,
        enum: ['Pass', 'Fail']
    }
}, {
    timestamps: true
});

// Create compound index for faster queries
examDetailsSchema.index({ usn: 1, subjectCode: 1, examDate: 1 });

module.exports = mongoose.model('ExamDetails', examDetailsSchema);
