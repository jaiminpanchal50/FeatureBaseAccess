import { useState, useEffect } from "react";
import { usersAPI, adminAPI, rolesAPI, authAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { can } from "../utils/permissions";
import Table from "../components/common/Table";
import Button from "../components/common/Button";
import Badge from "../components/common/Badge";
import Drawer from "../components/common/Drawer";
import Modal from "../components/common/Modal";
import Input from "../components/common/Input";

const Users = () => {
  const { permissions, user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [permissionGroups, setPermissionGroups] = useState({});
  const [selectedRole, setSelectedRole] = useState("");
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [saving, setSaving] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createUserForm, setCreateUserForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [createUserLoading, setCreateUserLoading] = useState(false);
  const [createUserError, setCreateUserError] = useState("");

  console.log("permissions in users page", permissions);
  // Permission groups structure
  const permissionStructure = {
    Users: ["user.read", "user.create", "user.update", "user.delete"],
    Reports: ["report.view", "report.download"],
    Billing: ["billing.view", "billing.manage"],
    Roles: ["role.read", "role.create", "role.update", "role.delete"],
    Admin: ["admin.manage"],
  };
  const permissionNames = [
    { name: "user.create", label: "Create" },
    { name: "user.read", label: "Read" },
    { name: "user.update", label: "Update" },
    { name: "user.delete", label: "Delete" },
    { name: "report.view", label: "View" },
    { name: "report.download", label: "Download" },
    { name: "billing.view", label: "View" },
    { name: "billing.manage", label: "Manage" },
    { name: "role.read", label: "Read" },
    { name: "role.create", label: "Create" },
    { name: "role.update", label: "Update" },
    { name: "role.delete", label: "Delete" },
    { name: "admin.manage", label: "Manage" },
  ];

  const accessName = (perm) => {
    let label = "";
    permissionNames.map((obj) => {
      if (obj.name === perm) {
        label = obj.label;
      }
    });
    return label;
  };

  useEffect(() => {
    fetchUsers();
    fetchRoles();
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

  const fetchRoles = async () => {
    try {
      const response = await rolesAPI.getAll();
      setRoles(response.data.data.roles);
    } catch (error) {
      console.error("Error fetching roles:", error);
    }
  };

  const handleManageAccess = async (user) => {
    console.log("user in handleManageAccess", user);
    setSelectedUser(user);
    setSelectedRole(user.role?._id || user.role || "");
    setIsSuperAdmin(user.isSuperAdmin || false);

    // Fetch user permissions
    try {
      const response = await adminAPI.getUserPermissions(user._id);
      const userPermissions = response.data.data.permissions;

      // Initialize permission groups
      const groups = {};
      Object.keys(permissionStructure).forEach((group) => {
        groups[group] = {};
        permissionStructure[group].forEach((perm) => {
          groups[group][perm] =
            userPermissions.includes("*") || userPermissions.includes(perm);
        });
      });
      setPermissionGroups(groups);
    } catch (error) {
      console.error("Error fetching user permissions:", error);
    }

    setDrawerOpen(true);
  };

  const handleSaveAccess = async () => {
    if (!selectedUser) return;

    setSaving(true);
    try {
      // Set super admin status
      if (isSuperAdmin !== selectedUser.isSuperAdmin) {
        await adminAPI.setSuperAdmin({
          userId: selectedUser._id,
          isSuperAdmin,
        });
      }

      // Assign role
      if (selectedRole !== (selectedUser.role?._id || selectedUser.role)) {
        await adminAPI.assignRole({
          userId: selectedUser._id,
          roleId: selectedRole || null,
        });
      }

      // Collect all selected permissions
      const selectedPermissions = [];
      Object.values(permissionGroups).forEach((group) => {
        Object.entries(group).forEach(([perm, checked]) => {
          if (checked) {
            selectedPermissions.push(perm);
          }
        });
      });

      // Set permissions override
      await adminAPI.setPermissionsOverride({
        userId: selectedUser._id,
        permissions: selectedPermissions,
      });

      // Refresh users list
      await fetchUsers();
      setDrawerOpen(false);
    } catch (error) {
      console.error("Error saving access:", error);
      alert("Failed to save access. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleGiveAllAccess = () => {
    setIsSuperAdmin(true);
    setSelectedRole("");
    // Check all permissions
    const allChecked = {};
    Object.keys(permissionStructure).forEach((group) => {
      allChecked[group] = {};
      permissionStructure[group].forEach((perm) => {
        allChecked[group][perm] = true;
      });
    });
    setPermissionGroups(allChecked);
  };

  const togglePermission = (group, permission) => {
    console.log("group", group);
    console.log("permission", permission);
    setPermissionGroups((prev) => ({
      ...prev,
      [group]: {
        ...prev[group],
        [permission]: !prev[group]?.[permission],
      },
    }));
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setCreateUserError("");
    setCreateUserLoading(true);

    try {
      // Register the user
      const response = await authAPI.register(createUserForm);
      const newUser = response.data.data.user;

      // Refresh users list
      await fetchUsers();

      // Reset form and close modal
      setCreateUserForm({ name: "", email: "", password: "" });
      setCreateModalOpen(false);
    } catch (error) {
      setCreateUserError(
        error.response?.data?.message ||
          "Failed to create user. Please try again."
      );
    } finally {
      setCreateUserLoading(false);
    }
  };

  const handleDeleteUser = async (user) => {
    // Prevent deleting yourself
    if (user._id === currentUser?._id) {
      alert("You cannot delete your own account");
      return;
    }

    // Confirmation dialog
    const confirmed = window.confirm(
      `Are you sure you want to delete ${user.name}? This action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    try {
      await usersAPI.delete(user._id);
      // Refresh users list
      await fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      alert(
        error.response?.data?.message ||
          "Failed to delete user. Please try again."
      );
    }
  };

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const headers = ["Name", "Email", "Role", "Status", "Actions"];

  const renderRow = (user) => (
    <>
      <td className="px-3 sm:px-6 py-4">
        <div className="flex items-center">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary-600 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-medium mr-2 sm:mr-3 flex-shrink-0">
            {getInitials(user.name)}
          </div>
          <div className="min-w-0">
            <div className="text-xs sm:text-sm font-medium text-slate-900 truncate">
              {user.name}
            </div>
            {user.isSuperAdmin && (
              <Badge variant="warning" className="mt-1 text-xs">
                Super Admin
              </Badge>
            )}
          </div>
        </div>
      </td>
      <td className="px-3 sm:px-6 py-4">
        <div className="text-xs sm:text-sm text-slate-600 truncate">
          {user.email}
        </div>
      </td>
      <td className="px-3 sm:px-6 py-4">
        {user.role ? (
          <Badge variant="primary" className="text-xs">
            {user.role.name}
          </Badge>
        ) : (
          <span className="text-xs sm:text-sm text-slate-400">No role</span>
        )}
      </td>
      <td className="px-3 sm:px-6 py-4">
        <Badge
          variant={user.isActive ? "success" : "danger"}
          className="text-xs"
        >
          {user.isActive ? "Active" : "Inactive"}
        </Badge>
      </td>
      <td className="px-3 sm:px-6 py-4 text-sm">
        <div className="flex flex-col sm:flex-row gap-2">
          {can(permissions, "admin.manage") && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleManageAccess(user)}
              className="text-xs sm:text-sm w-full sm:w-auto"
            >
              <span className="hidden sm:inline">Manage Access</span>
              <span className="sm:hidden">Manage</span>
            </Button>
          )}
          {can(permissions, "user.delete") && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => handleDeleteUser(user)}
              className="text-xs sm:text-sm w-full sm:w-auto"
            >
              Delete
            </Button>
          )}
        </div>
      </td>
    </>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-500">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            Users
          </h2>
          <p className="text-sm sm:text-base text-slate-600 mt-1">
            Manage user accounts and access
          </p>
        </div>
        {can(permissions, "user.create") && (
          <Button
            variant="primary"
            onClick={() => setCreateModalOpen(true)}
            className="w-full sm:w-auto"
          >
            Create User
          </Button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <Table
          headers={headers}
          data={users}
          renderRow={renderRow}
          emptyMessage="No users found"
        />
      </div>

      {/* Access Control Drawer */}
      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={
          selectedUser ? `Manage Access: ${selectedUser.name}` : "Manage Access"
        }
      >
        {selectedUser && (
          <div className="space-y-6">
            {/* Super Admin Toggle */}
            <div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div>
                <h4 className="font-medium text-slate-900">Super Admin</h4>
                <p className="text-sm text-slate-600">
                  Grant all permissions to this user
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isSuperAdmin}
                  onChange={(e) => setIsSuperAdmin(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>

            {/* Give All Access Button */}
            <Button
              variant="primary"
              onClick={handleGiveAllAccess}
              className="w-full"
            >
              Give All Access
            </Button>

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Role
              </label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                disabled={isSuperAdmin}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-slate-100 disabled:cursor-not-allowed"
              >
                <option value="">No role</option>
                {roles.map((role) => (
                  <option key={role._id} value={role._id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Permission Groups */}
            <div className="space-y-4">
              <h4 className="font-medium text-slate-900">Permissions</h4>
              {Object.entries(permissionStructure).map(([groupName, perms]) => (
                <div
                  key={groupName}
                  className="border border-slate-200 rounded-lg p-4"
                >
                  <h5 className="font-medium text-slate-900 mb-3">
                    {groupName}
                  </h5>
                  <div className="space-y-3">
                    {perms.map((perm) => (
                      <label
                        key={perm}
                        className="flex items-center justify-between cursor-pointer select-none"
                      >
                        <span className="text-sm text-slate-700">
                          {accessName(perm)}
                        </span>

                        {/* Toggle switch */}
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={
                              isSuperAdmin ||
                              permissionGroups[groupName]?.[perm] ||
                              false
                            }
                            onChange={() => togglePermission(groupName, perm)}
                            disabled={isSuperAdmin}
                            className="sr-only peer"
                          />
                          <div className="w-10 h-5 bg-slate-300 rounded-full peer peer-checked:bg-primary-600 transition-colors"></div>
                          <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-md transition-transform peer-checked:translate-x-5"></div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Save Button */}
            <div className="flex gap-3 pt-4 border-t border-slate-200">
              <Button
                variant="outline"
                onClick={() => setDrawerOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSaveAccess}
                disabled={saving}
                className="flex-1"
              >
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        )}
      </Drawer>

      {/* Create User Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => {
          setCreateModalOpen(false);
          setCreateUserForm({ name: "", email: "", password: "" });
          setCreateUserError("");
        }}
        title="Create New User"
      >
        <form onSubmit={handleCreateUser} className="space-y-4">
          {createUserError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {createUserError}
            </div>
          )}

          <Input
            label="Full Name"
            name="name"
            value={createUserForm.name}
            onChange={(e) =>
              setCreateUserForm({ ...createUserForm, name: e.target.value })
            }
            placeholder="John Doe"
            required
          />

          <Input
            label="Email"
            type="email"
            name="email"
            value={createUserForm.email}
            onChange={(e) =>
              setCreateUserForm({ ...createUserForm, email: e.target.value })
            }
            placeholder="john@example.com"
            required
          />

          <Input
            label="Password"
            type="password"
            name="password"
            value={createUserForm.password}
            onChange={(e) =>
              setCreateUserForm({ ...createUserForm, password: e.target.value })
            }
            placeholder="Minimum 6 characters"
            required
            minLength={6}
          />

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
            <p className="font-medium mb-1">Note:</p>
            <p>
              After creating the user, you can assign roles and permissions by
              clicking "Manage Access" on the user in the table.
            </p>
          </div>

          <div className="flex gap-3 pt-4 border-t border-slate-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setCreateModalOpen(false);
                setCreateUserForm({ name: "", email: "", password: "" });
                setCreateUserError("");
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={createUserLoading}
              className="flex-1"
            >
              {createUserLoading ? "Creating..." : "Create User"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Users;
