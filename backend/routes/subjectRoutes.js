const express = require('express');
const router = express.Router();
const subjectController = require('../controllers/subjectController');

// Support GET /api/subjects?batchId=...
router.get('/', (req, res) => {
	const batchId = req.query.batchId;
	if (batchId) {
		req.params.batchId = batchId;
		return subjectController.getSubjectsByBatch(req, res);
	}
	subjectController.getAllSubjects(req, res);
});

router.post('/', subjectController.createSubject);
router.get('/batch/:batchId', subjectController.getSubjectsByBatch);
router.put('/:id', subjectController.updateSubject);
router.delete('/:id', subjectController.deleteSubject);

module.exports = router;
