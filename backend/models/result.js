const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
    usn: {
        type: String,
        required: true,
        index: true
    },
    name: {
        type: String,
        required: true
    },
    semester: {
        type: Number,
        required: true
    },
    examDate: {
        type: Date,
        required: true
    },
    examType: {
        type: String,
        required: true,
        enum: ['Regular', 'Supplementary', 'Revaluation']
    },
    results: [{
        subjectCode: {
            type: String,
            required: true
        },
        subjectName: {
            type: String,
            required: true
        },
        internalMarks: {
            type: Number,
            required: true
        },
        externalMarks: {
            type: Number,
            required: true
        },
        totalMarks: {
            type: Number,
            required: true
        },
        result: {
            type: String,
            required: true,
            enum: ['Pass', 'Fail']
        }
    }],
    totalGPA: {
        type: Number,
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Result', resultSchema);