const express = require('express');
const router = express.Router();

const voteController = require('../controllers/votes.controllers');

router.post('/create-vote/:electionId/:studentId', voteController.createVote);
router.get('/search-vote-by-term', voteController.searchVoteByTerm);
router.get('/get-vote-details/:id', voteController.getVoteDetails);

module.exports = router;