const express = require('express');
const router = express.Router();

const candidateController = require('../controllers/candidates.controllers');

router.post('/create-candidate/:studentId', candidateController.createCandidate);

module.exports = router;