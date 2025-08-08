const express = require('express');
const router = express.Router();

const candidateController = require('../controllers/candidates.controllers');

router.post('/create-candidate/:electionId/:studentId', candidateController.createCandidate);
router.get('/get-candidate-by-id/:id', candidateController.getCandidateById);
router.get('/get-candidates-by-term', candidateController.getCandidatesByTerm);
router.get('/get-candidates-by-electionId/:id', candidateController.getCandidatesByElectionId);

module.exports = router;