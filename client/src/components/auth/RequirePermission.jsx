import { useAuth } from '../../context/AuthContext';
import { can, canAny } from '../../utils/permissions';

const RequirePermission = ({
  children,
  permission,
  permissions,
  requireAll = false,
  fallback = null,
}) => {
  const { permissions: userPermissions } = useAuth();
  console.log(permission);
  console.log(userPermissions);
  let hasPermission = false;

  if (permission) {
    hasPermission = can(userPermissions, permission);
  } else if (permissions) {
    hasPermission = requireAll
      ? permissions.every((p) => can(userPermissions, p))
      : canAny(userPermissions, permissions);
  }


  if (!hasPermission) {
    return fallback;
  }

  return children;

};

export default RequirePermission;

