const express = require('express');
const router = express.Router();

const studentController = require('../controllers/students.controllers');

router.post('/initial-login-student/:year', studentController.initialLoginStudent);
router.post('/final-login-student', studentController.finalLoginStudent);

router.post('/create-student', studentController.createStudent);

module.exports = router; 