const mongoose = require('mongoose');

const revaluationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    usn: {
        type: String,
        required: true
    },
    subjectCode: {
        type: String,
        required: true
    },
    subjectName: {
        type: String,
        required: true
    },
    semester: {
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
    },
    fees: {
        type: Number,
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['Paid', 'Pending'],
        default: 'Pending'
    },
    evaluationStatus: {
        type: String,
        enum: ['Pending', 'Evaluated'],
        default: 'Pending'
    },
    pdfPath: {
        type: String,
        required: false
    },
    evaluatedMarks: {
        type: Number,
        required: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Revaluation', revaluationSchema);
