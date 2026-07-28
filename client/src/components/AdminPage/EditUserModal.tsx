import React, { useState } from 'react';
import { toast } from 'sonner';
import { authClient } from '@/lib/auth-client';

interface EditUserModalProps {
  user: { id: string; name?: string; email?: string; role?: string };
  allUsers: { id: string; role?: string }[];
  onClose: () => void;
  onSaved: () => void;
}

export const EditUserModal: React.FC<EditUserModalProps> = ({ user, allUsers, onClose, onSaved }) => {
  const [name, setName] = useState(user.name || '');
  const [email, setEmail] = useState(user.email || '');
  const [role, setRole] = useState(user.role || 'user');
  const [newPassword, setNewPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // ponytail: block demoting the last admin
  const adminCount = allUsers.filter((u) => u.role === 'admin').length;
  const isOnlyAdmin = user.role === 'admin' && adminCount <= 1;

  const handleSave = async () => {
    setIsSaving(true);

    const data: Record<string, string> = {};
    if (name !== user.name) data.name = name;
    if (email !== user.email) data.email = email;
    if (role !== user.role) data.role = role;

    if (Object.keys(data).length > 0) {
      const { error } = await authClient.admin.updateUser({
        userId: user.id,
        data,
      });
      if (error) {
        toast.error(error.message || 'Failed to update user');
        setIsSaving(false);
        return;
      }
    }

    if (newPassword) {
      const { error } = await authClient.admin.setUserPassword({
        userId: user.id,
        newPassword,
      });
      if (error) {
        toast.error(error.message || 'Failed to update password');
        setIsSaving(false);
        return;
      }
    }

    toast.success('User updated');
    setIsSaving(false);
    onSaved();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 border border-[#c4c6cf] shadow-xl space-y-4">
        <h3 className="font-headline-sm text-[18px] text-[#191c1e] font-bold">Edit User</h3>
        <div className="space-y-3 text-[13px]">
          <div>
            <label className="block text-[#43474e] font-semibold mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#f2f4f6] px-3 py-2 rounded border border-[#c4c6cf] outline-none font-semibold text-[#191c1e]"
            />
          </div>
          <div>
            <label className="block text-[#43474e] font-semibold mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#f2f4f6] px-3 py-2 rounded border border-[#c4c6cf] outline-none font-semibold text-[#191c1e]"
            />
          </div>
          <div>
            <label className="block text-[#43474e] font-semibold mb-1">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              disabled={isOnlyAdmin}
              className="w-full bg-[#f2f4f6] px-3 py-2 rounded border border-[#c4c6cf] outline-none font-semibold text-[#191c1e] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
            {isOnlyAdmin && (
              <p className="text-[11px] text-[#ba1a1a] mt-1">Cannot demote — this is the only admin.</p>
            )}
          </div>
          <div>
            <label className="block text-[#43474e] font-semibold mb-1">New Password</label>
            <input
              type="text"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-[#f2f4f6] px-3 py-2 rounded border border-[#c4c6cf] outline-none font-semibold text-[#191c1e]"
              placeholder="Leave blank to keep current"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded text-[13px] text-[#43474e] hover:bg-[#f2f4f6] cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || (name === user.name && email === user.email && role === user.role)}
            className="px-4 py-2 bg-[#002045] text-white rounded text-[13px] font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            {isSaving ? (
              <>
                <span className="material-symbols-outlined text-[17px] animate-spin">progress_activity</span>
                <span>Saving...</span>
              </>
            ) : (
              <span>Save Changes</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
