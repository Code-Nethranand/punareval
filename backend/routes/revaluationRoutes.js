const express = require('express');
const router = express.Router();
const revaluationController = require('../controllers/revaluationController');

// Get all revaluation applications
router.get('/', revaluationController.getAllApplications);

// Create new revaluation application
router.post('/', revaluationController.createApplication);

// Get single application
router.get('/:id', revaluationController.getApplicationById);

// Update payment status
router.patch('/:id/payment', revaluationController.updatePaymentStatus);

// Evaluate application
router.post('/:id/evaluate', revaluationController.evaluateApplication);

// Delete application
router.delete('/:id', revaluationController.deleteApplication);

module.exports = router;
