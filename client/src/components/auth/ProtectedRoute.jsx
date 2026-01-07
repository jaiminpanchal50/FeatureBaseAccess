import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { canAny, canAll } from "../../utils/permissions";

const ProtectedRoute = ({
  children,
  requiredPermissions,
  requireAll = false,
}) => {
  const { isAuthenticated, permissions, loading } = useAuth(); 

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-500">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredPermissions) {
    console.log("permissions", permissions);
    console.log("requiredPermissions", requiredPermissions);
    const hasPermission = requireAll
      ? canAll(permissions, requiredPermissions)
      : canAny(permissions, requiredPermissions);

    if (!hasPermission) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Access Denied
            </h2>
            <p className="text-slate-600">
              You don't have permission to access this page.
            </p>
          </div>
        </div>
      );
    }
  }

  return children;
};

export default ProtectedRoute;
