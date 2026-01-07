/**
 * Resolves effective permissions for a user
 * @param {Object} user - User object with role, permissionsOverride, isSuperAdmin
 * @param {Object} role - Role object with permissions array (if user has role)
 * @returns {string[]} Array of effective permission strings
 */
export const resolveUserPermissions = async (user, Role) => {
  // Super admin has all permissions
  if (user.isSuperAdmin) {
    return ['*'];
  }

  // Start with role permissions
  let permissions = [];
  if (user.role) {
    const roleDoc = await Role.findById(user.role).lean();
    if (roleDoc) {
      permissions = [...roleDoc.permissions];
      
      // If role has '*', user has all permissions
      if (permissions.includes('*')) {
        return ['*'];
      }
    }
  }

  // Add or override with permissionsOverride
  // permissionsOverride can add new permissions or override existing ones
  const overrideSet = new Set(permissions);
  user.permissionsOverride.forEach((perm) => {
    if (perm === '*') {
      return ['*'];
    }
    overrideSet.add(perm);
  });

  return Array.from(overrideSet);
};

/**
 * Checks if user has required permission(s)
 * @param {string[]} userPermissions - User's effective permissions
 * @param {string|string[]} requiredPermissions - Required permission(s)
 * @returns {boolean}
 */
export const hasPermission = (userPermissions, requiredPermissions) => {
  // If user has '*', they have all permissions
  if (userPermissions.includes('*')) {
    return true;
  }

  const required = Array.isArray(requiredPermissions)
    ? requiredPermissions
    : [requiredPermissions];

  // Check if user has all required permissions
  return required.every((perm) => userPermissions.includes(perm));
};

