const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/login', userController.login);
router.post('/register', userController.register);
router.get('/students', userController.getAllStudents);
router.get('/admins', userController.getAllAdmins);
router.patch('/:id/status', userController.updateUserStatus);
router.post('/add-subject', userController.addSubjectToStudent);
router.post('/remove-subject', userController.removeSubjectFromStudent);
router.post('/subject-status', userController.updateSubjectStatus);
router.delete('/:id', userController.deleteUser);
router.patch('/:id', userController.updateUserStatus); // Added generic update shortcut
// In a real app we'd add auth middleware for this
router.get('/profile', userController.getProfile);

module.exports = router;
