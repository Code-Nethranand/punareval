const express = require('express');
const router = express.Router();
const announcementController = require('../controllers/announcementController');

// GET all announcements
router.get('/', announcementController.getAllAnnouncements);

// POST new announcement
router.post('/', announcementController.createAnnouncement);

// GET single announcement
router.get('/:id', announcementController.getAnnouncement);

// PUT update announcement
router.put('/:id', announcementController.updateAnnouncement);

// DELETE announcement
router.delete('/:id', announcementController.deleteAnnouncement);

module.exports = router;
