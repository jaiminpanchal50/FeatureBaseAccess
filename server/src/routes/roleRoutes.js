import express from 'express';
import { getAllRoles, getRoleById, createRole, updateRole, deleteRole } from '../controllers/roleController.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all roles - requires role.read permission (or admin)
router.get('/', authorize('role.read'), getAllRoles);

// Get role by ID - requires role.read permission
router.get('/:id', authorize('role.read'), getRoleById);

// Create role - requires role.create permission
router.post('/', authorize('role.create'), createRole);

// Update role - requires role.update permission
router.patch('/:id', authorize('role.update'), updateRole);

// Delete role - requires role.delete permission
router.delete('/:id', authorize('role.delete'), deleteRole);

export default router;

