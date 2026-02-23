const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/login', userController.login);
router.post('/register', userController.register);
router.get('/students', userController.getAllStudents);
router.get('/admins', userController.getAllAdmins);
router.patch('/:id/status', userController.updateUserStatus);
router.delete('/:id', userController.deleteUser);
// In a real app we'd add auth middleware for this
router.get('/profile', userController.getProfile);

module.exports = router;
