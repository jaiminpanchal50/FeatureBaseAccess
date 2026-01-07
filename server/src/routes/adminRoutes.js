import express from 'express';
import {
  assignRole,
  setPermissionsOverride,
  setSuperAdmin,
  getUserPermissions,
} from '../controllers/adminController.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';

const router = express.Router();

// All routes require authentication and admin permissions
router.use(authenticate);
router.use(authorize('admin.manage')); // Requires admin.manage permission

// Assign role to user
router.post('/assign-role', assignRole);

// Set permissions override
router.post('/set-permissions', setPermissionsOverride);

// Set/unset super admin
router.post('/set-super-admin', setSuperAdmin);

// Get user permissions (resolved)
router.get('/user/:userId/permissions', getUserPermissions);

export default router;

