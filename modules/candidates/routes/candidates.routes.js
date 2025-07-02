const express = require('express');
const router = express.Router();

const candidateController = require('../controllers/candidates.controllers');

router.post('/create-candidate/:electionId/:studentId', candidateController.createCandidate);

module.exports = router;