const express = require('express');
const router = express.Router();

const historicalController = require('../controllers/historical.controllers');

router.get('/get-historical-by-term', historicalController.getHistoricalByTerm);
router.get('/get-historical-by-id/:id', historicalController.getHistoricalById);

module.exports = router;