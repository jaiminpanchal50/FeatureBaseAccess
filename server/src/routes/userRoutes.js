import express from 'express';
import { getAllUsers, getUserById, updateUser, deleteUser } from '../controllers/userController.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all users - requires user.read permission
router.get('/', authorize('user.read'), getAllUsers); 

// Get user by ID - requires user.read permission
router.get('/:id', authorize('user.read'), getUserById);

// Update user - requires user.update permission
router.patch('/:id', authorize('user.update'), updateUser);

// Delete user - requires user.delete permission
router.delete('/:id', authorize('user.delete'), deleteUser);

export default router;

