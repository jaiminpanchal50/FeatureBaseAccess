import { resolveUserPermissions, hasPermission } from '../utils/permissions.js';
import Role from '../models/Role.js';
import { AppError } from '../utils/errors.js';

/**
 * Authorization middleware
 * @param {string|string[]} requiredPermissions - Permission(s) required to access the route
 */
export const authorize = (requiredPermissions) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      // Resolve user's effective permissions
      const userPermissions = await resolveUserPermissions(req.user, Role);

      // Check if user has required permissions
      if (!hasPermission(userPermissions, requiredPermissions)) {
        throw new AppError(
          'You do not have permission to perform this action',
          403
        );
      }

      // Attach permissions to request for use in controllers
      req.userPermissions = userPermissions;
      next();
    } catch (error) {
      next(error);
    }
  };
};

