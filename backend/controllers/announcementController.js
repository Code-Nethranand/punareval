const Announcement = require('../models/announcement');

// Get all announcements
exports.getAllAnnouncements = async (req, res) => {
    try {
        console.log('Fetching all announcements...'); // Debug log
        const announcements = await Announcement.find()
            .sort({ date: -1 })
            .select('title date type link')
            .lean();
        
        console.log(`Found ${announcements.length} announcements`); // Debug log
        
        if (!announcements) {
            console.log('No announcements found'); // Debug log
            return res.status(404).json({ 
                success: false,
                message: 'No announcements found' 
            });
        }

        console.log('Successfully fetched announcements'); // Debug log
        res.status(200).json(announcements);
    } catch (error) {
        console.error('Error in getAllAnnouncements:', error); // Debug log
        res.status(500).json({ 
            success: false,
            message: 'Failed to fetch announcements',
            error: error.message 
        });
    }
};

// Create new announcement
exports.createAnnouncement = async (req, res) => {
    try {
        const { title, date, type, link } = req.body;
        const announcement = new Announcement({
            title,
            date,
            type,
            link
        });
        const newAnnouncement = await announcement.save();
        res.status(201).json(newAnnouncement);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get single announcement
exports.getAnnouncement = async (req, res) => {
    try {
        const announcement = await Announcement.findById(req.params.id);
        if (!announcement) {
            return res.status(404).json({ message: 'Announcement not found' });
        }
        res.status(200).json(announcement);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update announcement
exports.updateAnnouncement = async (req, res) => {
    try {
        const announcement = await Announcement.findById(req.params.id);
        if (!announcement) {
            return res.status(404).json({ message: 'Announcement not found' });
        }
        
        const updatedAnnouncement = await Announcement.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.status(200).json(updatedAnnouncement);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete announcement
exports.deleteAnnouncement = async (req, res) => {
    try {
        const announcement = await Announcement.findByIdAndDelete(req.params.id);
        if (!announcement) {
            return res.status(404).json({ message: 'Announcement not found' });
        }
        res.status(200).json({ message: 'Announcement deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
