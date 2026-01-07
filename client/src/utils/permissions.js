/**
 * Check if user has a specific permission
 * @param {string[]} userPermissions - User's permissions array
 * @param {string} permission - Permission to check
 * @returns {boolean}
 */
export const can = (userPermissions, permission) => {
  if (!userPermissions || !Array.isArray(userPermissions)) {
    return false;
  }

  // If user has '*', they have all permissions
  if (userPermissions.includes('*')) {
    return true;
  }

  return userPermissions.includes(permission);
};

/**
 * Check if user has any of the required permissions
 * @param {string[]} userPermissions - User's permissions array
 * @param {string[]} permissions - Permissions to check (OR logic)
 * @returns {boolean}
 */
export const canAny = (userPermissions, permissions) => {
  if (!userPermissions || !Array.isArray(userPermissions)) {
    return false;
  }

  if (userPermissions.includes('*')) {
    return true;
  }

  return permissions.some((perm) => userPermissions.includes(perm));
};

/**
 * Check if user has all of the required permissions
 * @param {string[]} userPermissions - User's permissions array
 * @param {string[]} permissions - Permissions to check (AND logic)
 * @returns {boolean}
 */
export const canAll = (userPermissions, permissions) => {
  if (!userPermissions || !Array.isArray(userPermissions)) {
    return false;
  }

  if (userPermissions.includes('*')) {
    return true;
  }

  return permissions.every((perm) => userPermissions.includes(perm));
};

