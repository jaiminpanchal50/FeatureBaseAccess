import { useState, useEffect } from "react";
import { usersAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { can } from "../utils/permissions";
import Badge from "../components/common/Badge";

const AccessControl = () => {
  const { permissions } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  console.log("permissions in access control page", permissions);
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await usersAPI.getAll();
      setUsers(response.data.data.users);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!can(permissions, "admin.manage")) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600">
          You don't have permission to access this page.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-500">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
          Access Control
        </h2>
        <p className="text-sm sm:text-base text-slate-600 mt-1">
          Overview of user access and permissions
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <p className="text-slate-600 mb-4">
          Use the Users page to manage individual user access. This page
          provides an overview of the access control system.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {users.map((user) => (
            <div
              key={user._id}
              className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-slate-900">{user.name}</h3>
                {user.isSuperAdmin && (
                  <Badge variant="warning">Super Admin</Badge>
                )}
              </div>
              <p className="text-sm text-slate-600 mb-3">{user.email}</p>
              {user.role && (
                <div className="mb-2">
                  <Badge variant="primary">{user.role.name}</Badge>
                </div>
              )}
              <div className="text-xs text-slate-500">
                {user.permissionsOverride?.length > 0
                  ? `${user.permissionsOverride.length} override permissions`
                  : "No override permissions"}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AccessControl;
