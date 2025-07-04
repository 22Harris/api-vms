const express = require('express');
const router = express.Router();

const studentController = require('../controllers/students.controllers');

router.post('/initial-login-student', studentController.initialLoginStudent);
router.post('/final-login-student/:id', studentController.finalLoginStudent);

router.post('/create-student', studentController.createStudent);
router.get('/get-student-by-term', studentController.getStudentByTerm);
router.get('/get-student-by-id/:id', studentController.getStudentById);

module.exports = router; 