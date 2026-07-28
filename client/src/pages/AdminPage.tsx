import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { PageHeader } from "../components/Shared/PageHeader";
import { UsersTable } from "../components/AdminPage/UsersTable";
import { CreateUserModal } from "../components/AdminPage/CreateUserModal";
import { EditUserModal } from "../components/AdminPage/EditUserModal";

export function AdminPage() {
  const [users, setUsers] = useState<Array<{ id: string; name?: string; email?: string; role?: string }>>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<{ id: string; name?: string; email?: string; role?: string } | null>(null);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    const { data, error } = await authClient.admin.listUsers();
    if (error) {
      toast.error("Failed to fetch users");
      setLoadingUsers(false);
      return;
    }
    setUsers(data.users);
    setLoadingUsers(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (userId: string) => {
    if (!confirm("Delete this user?")) return;
    setDeletingUserId(userId);
    const { error } = await authClient.admin.removeUser({ userId });
    if (error) {
      toast.error(error.message || "Failed to delete user");
      setDeletingUserId(null);
      return;
    }
    toast.success("User deleted");
    setDeletingUserId(null);
    fetchUsers();
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 gap-6">
      <PageHeader
        title="User Management"
        subtitle="Create and manage user accounts."
        actions={
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-[#002045] text-white px-4 py-2 rounded-lg font-semibold text-[12px] flex items-center gap-2 hover:bg-opacity-90 active:scale-95 transition-all shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>Add User</span>
          </button>
        }
      />

      <UsersTable
        users={users}
        onEditUser={setEditingUser}
        onDeleteUser={handleDelete}
        deletingUserId={deletingUserId}
      />

      {showCreateModal && (
        <CreateUserModal
          onClose={() => setShowCreateModal(false)}
          onCreated={fetchUsers}
        />
      )}

      {editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSaved={() => {
            setEditingUser(null);
            fetchUsers();
          }}
        />
      )}
    </div>
  );
}
