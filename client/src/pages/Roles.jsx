import { useState, useEffect } from "react";
import { rolesAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { can } from "../utils/permissions";
import Table from "../components/common/Table";
import Button from "../components/common/Button";
import Badge from "../components/common/Badge";
import Modal from "../components/common/Modal";
import Input from "../components/common/Input";

const Roles = () => {
  const { permissions } = useAuth();
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    permissions: [],
  });

  const allPermissions = [
    "user.read",
    "user.create",
    "user.update",
    "user.delete",
    "report.view",
    "report.download",
    "billing.view",
    "billing.manage",
    "role.read",
    "role.create",
    "role.update",
    "role.delete",
    "admin.manage",
  ];

  const permissionNames = [
    { name: "user.create", label: "User Create" },
    { name: "user.read", label: "User Read" },
    { name: "user.update", label: "User Update" },
    { name: "user.delete", label: "User Delete" },
    { name: "report.view", label: "Report View" },
    { name: "report.download", label: "Report Download" },
    { name: "billing.view", label: "Billing View" },
    { name: "billing.manage", label: "Billing Manage" },
    { name: "role.read", label: "Role Read" },
    { name: "role.create", label: "Role Create" },
    { name: "role.update", label: "Role Update" },
    { name: "role.delete", label: "Role Delete" },
    { name: "admin.manage", label: "Admin Manage" },
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
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await rolesAPI.getAll();
      setRoles(response.data.data.roles);
    } catch (error) {
      console.error("Error fetching roles:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingRole(null);
    setFormData({
      name: "",
      description: "",
      permissions: [],
    });
    setModalOpen(true);
  };

  const handleEdit = (role) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      description: role.description || "",
      permissions: role.permissions || [],
    });
    setModalOpen(true);
  };

  const handleDelete = async (roleId) => {
    if (!window.confirm("Are you sure you want to delete this role?")) {
      return;
    }

    try {
      await rolesAPI.delete(roleId);
      fetchRoles();
    } catch (error) {
      console.error("Error deleting role:", error);
      alert("Failed to delete role. Please try again.");
    }
  };

  const handleSave = async () => {
    try {
      if (editingRole) {
        await rolesAPI.update(editingRole._id, formData);
      } else {
        await rolesAPI.create(formData);
      }
      setModalOpen(false);
      fetchRoles();
    } catch (error) {
      console.error("Error saving role:", error);
      alert("Failed to save role. Please try again.");
    }
  };

  const togglePermission = (permission) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter((p) => p !== permission)
        : [...prev.permissions, permission],
    }));
  };

  const headers = ["Name", "Description", "Permissions", "Actions"];

  const renderRow = (role) => (
    <>
      <td className="px-3 sm:px-6 py-4">
        <div className="text-xs sm:text-sm font-medium text-slate-900">
          {role.name}
        </div>
      </td>
      <td className="px-3 sm:px-6 py-4">
        <div className="text-xs sm:text-sm text-slate-600">
          {role.description || "No description"}
        </div>
      </td>
      <td className="px-3 sm:px-6 py-4">
        <div className="flex flex-wrap gap-1">
          {role.permissions.length > 0 ? (
            role.permissions.slice(0, 2).map((perm) => (
              <Badge key={perm} variant="primary" className="text-xs">
                {perm}
              </Badge>
            ))
          ) : (
            <span className="text-xs sm:text-sm text-slate-400">
              No permissions
            </span>
          )}
          {role.permissions.length > 2 && (
            <Badge variant="default" className="text-xs">
              +{role.permissions.length - 2} more
            </Badge>
          )}
        </div>
      </td>
      <td className="px-3 sm:px-6 py-4 text-sm">
        <div className="flex flex-col sm:flex-row gap-2">
          {can(permissions, "role.update") && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleEdit(role)}
              className="text-xs sm:text-sm w-full sm:w-auto"
            >
              Edit
            </Button>
          )}
          {can(permissions, "role.delete") && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => handleDelete(role._id)}
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
            Roles
          </h2>
          <p className="text-sm sm:text-base text-slate-600 mt-1">
            Manage roles and their permissions
          </p>
        </div>
        {can(permissions, "role.create") && (
          <Button
            variant="primary"
            onClick={handleCreate}
            className="w-full sm:w-auto"
          >
            Create Role
          </Button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <Table
          headers={headers}
          data={roles}
          renderRow={renderRow}
          emptyMessage="No roles found"
        />
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingRole ? "Edit Role" : "Create Role"}
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Role Name"
            name="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., admin, manager, editor"
            required
          />

          <Input
            label="Description"
            name="description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="Role description"
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Permissions
            </label>
            <div className="border border-slate-200 rounded-lg p-4 max-h-64 overflow-y-auto">
              <div className="space-y-2">
                {allPermissions.map((perm) => (
                  <label
                    key={perm}
                    className="flex items-center justify-between cursor-pointer"
                  >
                    <span className="text-sm text-slate-700">
                      {accessName(perm)}
                    </span>

                    {/* Toggle switch */}
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={formData.permissions.includes(perm)}
                        onChange={() => togglePermission(perm)}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5 bg-slate-300 rounded-full peer-checked:bg-primary-600 transition-colors"></div>
                      <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform peer-checked:translate-x-5"></div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-slate-200">
            <Button
              variant="outline"
              onClick={() => setModalOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave} className="flex-1">
              {editingRole ? "Update" : "Create"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Roles;
