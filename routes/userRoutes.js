const express = require('express');
const userController = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth');
const { logActivity } = require('../middleware/activityLogger');

const router = express.Router();

router.post('/', authenticate, authorize('superadmin', 'admin'), logActivity('CREATE', 'User'), userController.createUser.bind(userController));
router.post('/with-assignment', authenticate, authorize('superadmin', 'admin'), logActivity('CREATE', 'User'), userController.createUserWithAssignment.bind(userController));
router.get('/', authenticate, authorize('superadmin', 'admin', 'hr', 'manager'), userController.getAllUsers.bind(userController));
router.get('/:id', authenticate, authorize('superadmin', 'admin', 'hr', 'manager'), userController.getUserById.bind(userController));
router.put('/:id', authenticate, authorize('superadmin', 'admin'), logActivity('UPDATE', 'User'), userController.updateUser.bind(userController));
router.delete('/:id', authenticate, authorize('superadmin', 'admin'), logActivity('DELETE', 'User'), userController.deleteUser.bind(userController));

module.exports = router;
