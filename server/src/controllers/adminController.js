import User from '../models/User.js';
import Role from '../models/Role.js';
import { resolveUserPermissions } from '../utils/permissions.js';
import { AppError } from '../utils/errors.js';

/**
 * Assign role to user
 */
export const assignRole = async (req, res, next) => {
  try {
    const { userId, roleId } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (roleId) {
      const role = await Role.findById(roleId);
      if (!role) {
        throw new AppError('Role not found', 404);
      }
      user.role = roleId;
    } else {
      user.role = null;
    }

    await user.save();

    const updatedUser = await User.findById(userId)
      .populate('role', 'name permissions')
      .select('-passwordHash');

    const permissions = await resolveUserPermissions(updatedUser, Role);

    res.json({
      status: 'success',
      data: {
        user: updatedUser,
        permissions,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Set permissions override for user
 */
export const setPermissionsOverride = async (req, res, next) => {
  try {
    const { userId, permissions } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    user.permissionsOverride = permissions || [];

    await user.save();

    const updatedUser = await User.findById(userId)
      .populate('role', 'name permissions')
      .select('-passwordHash');

    const resolvedPermissions = await resolveUserPermissions(updatedUser, Role);

    res.json({
      status: 'success',
      data: {
        user: updatedUser,
        permissions: resolvedPermissions,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Set/unset super admin status
 */
export const setSuperAdmin = async (req, res, next) => {
  try {
    const { userId, isSuperAdmin } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Prevent removing super admin from yourself
    if (user._id.toString() === req.user._id.toString() && !isSuperAdmin) {
      throw new AppError('You cannot remove super admin from yourself', 400);
    }

    user.isSuperAdmin = isSuperAdmin === true;

    await user.save();

    const updatedUser = await User.findById(userId)
      .populate('role', 'name permissions')
      .select('-passwordHash');

    const permissions = await resolveUserPermissions(updatedUser, Role);

    res.json({
      status: 'success',
      data: {
        user: updatedUser,
        permissions,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user with resolved permissions
 */
export const getUserPermissions = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId)
      .populate('role', 'name permissions')
      .select('-passwordHash');

    if (!user) {
      throw new AppError('User not found', 404);
    }

    const permissions = await resolveUserPermissions(user, Role);

    res.json({
      status: 'success',
      data: {
        user,
        permissions,
      },
    });
  } catch (error) {
    next(error);
  }
};

