const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');

// Get student details by USN
router.get('/:usn', studentController.getStudentDetails);

// Update student marks
router.put('/:usn/marks', studentController.updateStudentMarks);

// Delete student subject
router.delete('/:usn/subject', studentController.deleteStudentSubject);

module.exports = router;
