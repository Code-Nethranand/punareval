const express = require('express');
const router = express.Router();
const examController = require('../controllers/examController');

// GET all exam details
router.get('/', examController.getAllExamDetails);

// POST new exam details
router.post('/', examController.createExamDetails);

// GET single exam details
router.get('/:id', examController.getExamDetailsById);

// GET results by USN
router.get('/results/:usn', examController.getResultsByUSN);

// PUT update exam details
router.put('/:id', examController.updateExamDetails);

// DELETE exam details
router.delete('/:id', examController.deleteExamDetails);

module.exports = router;
