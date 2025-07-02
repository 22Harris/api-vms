const express =  require('express');
const router = express.Router();

const electionController = require('../controllers/elections.controllers');

router.post('/create-election', electionController.createElection);
router.patch('/open-election/:id', electionController.openElection);
router.patch('/close-election/:id', electionController.closeElection);
module.exports = router;