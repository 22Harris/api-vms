const express = require('express');
const router = express.Router();

const voteController = require('../controllers/votes.controllers');

router.post('/create-vote/:electionId/:studentId', voteController.createVote);

module.exports = router;