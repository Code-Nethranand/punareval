const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: ['Announcement', 'Result', 'Revaluation', 'Notice']  // Updated to include all options
    },
    link: {
        type: String,
        required: false // Optional field
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Announcement', announcementSchema);
