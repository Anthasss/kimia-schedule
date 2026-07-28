import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { authClient } from '@/lib/auth-client';

const DEFAULT_PASSWORD = "@K1m14_J4dw4l";

function nameToEmail(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].toLowerCase() + "@kimia.com";
  const first = parts[0].toLowerCase();
  const last = parts[parts.length - 1].toLowerCase();
  const middleInitials = parts.slice(1, -1).map((p) => p[0].toLowerCase()).join('');
  return first + middleInitials + last + "@kimia.com";
}

async function resolveEmail(baseEmail: string): Promise<string> {
  const { data } = await authClient.admin.listUsers({
    query: {
      filterField: "email",
      filterValue: baseEmail.replace("@kimia.com", ""),
      filterOperator: "contains",
    },
  });

  if (!data?.users || data.users.length === 0) return baseEmail;

  const local = baseEmail.replace("@kimia.com", "");
  const existing = data.users
    .map((u) => u.email || "")
    .filter((e) => e.startsWith(local) && e.endsWith("@kimia.com"))
    .map((e) => {
      const suffix = e.slice(local.length).replace("@kimia.com", "");
      return suffix ? parseInt(suffix, 10) || 0 : 0;
    });

  const max = existing.length > 0 ? Math.max(...existing) : 0;
  return local + (max + 1) + "@kimia.com";
}

interface CreateUserModalProps {
  onClose: () => void;
  onCreated: () => void;
}

export const CreateUserModal: React.FC<CreateUserModalProps> = ({ onClose, onCreated }) => {
  const [names, setNames] = useState<string[]>(['']);
  const [isCreating, setIsCreating] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [focusIndex, setFocusIndex] = useState<number | null>(null);

  useEffect(() => {
    if (focusIndex !== null && inputRefs.current[focusIndex]) {
      inputRefs.current[focusIndex]!.focus();
      setFocusIndex(null);
    }
  }, [focusIndex, names.length]);

  const addRow = () => setNames((prev) => [...prev, '']);
  const removeRow = (index: number) => setNames((prev) => prev.filter((_, i) => i !== index));
  const updateName = (index: number, value: string) =>
    setNames((prev) => prev.map((n, i) => (i === index ? value : n)));

  const handlePaste = (index: number, e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData('text');
    if (!/[,\n]/.test(text)) return;

    e.preventDefault();
    const parts = text.split(/[,\n]+/).map((s) => s.trim()).filter(Boolean);
    if (parts.length === 0) return;

    setNames((prev) => {
      const next = [...prev];
      next[index] = parts[0];
      next.splice(index + 1, 0, ...parts.slice(1));
      return next;
    });
  };

  const isValidName = (n: string) => /^[A-Za-z\s]+$/.test(n.trim());
  const validNames = names.filter((n) => n.trim() && isValidName(n));

  const handleCreate = async () => {
    setIsCreating(true);

    for (const raw of names) {
      if (!raw.trim()) continue;
      const baseEmail = nameToEmail(raw);
      const email = await resolveEmail(baseEmail);
      const { error } = await authClient.admin.createUser({
        email,
        password: DEFAULT_PASSWORD,
        name: raw.trim(),
        role: "user",
      });

      if (error) {
        toast.error(`Failed to create ${raw.trim()}: ${error.message}`);
      } else {
        toast.success(`User created: ${email}`);
      }
    }

    setIsCreating(false);
    onCreated();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 border border-[#c4c6cf] shadow-xl space-y-4 max-h-[80vh] overflow-auto">
        <h3 className="font-headline-sm text-[18px] text-[#191c1e] font-bold">Create Users</h3>

        <div className="space-y-2">
          {names.map((name, index) => (
            <div key={index} className="flex items-start gap-2">
              <div className="flex-1">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => updateName(index, e.target.value)}
                  onPaste={(e) => handlePaste(index, e)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && index === names.length - 1) {
                      e.preventDefault();
                      setNames((prev) => [...prev, '']);
                      setFocusIndex(index + 1);
                    }
                  }}
                  ref={(el) => { inputRefs.current[index] = el; }}
                  className={`w-full bg-[#f2f4f6] px-3 py-2 rounded outline-none text-[#191c1e] text-[13px] ${name.trim() && !isValidName(name) ? 'border-2 border-[#ba1a1a]' : 'border border-[#c4c6cf]'}`}
                  placeholder="Full name"
                />
                {name.trim() && !isValidName(name) && (
                  <p className="text-[11px] text-[#ba1a1a] mt-1">Only letters and spaces allowed</p>
                )}
                {name.trim() && isValidName(name) && (
                  <p className="text-[11px] text-[#6b7280] mt-1">
                    {nameToEmail(name)}
                  </p>
                )}
              </div>
              {names.length > 1 && (
                <button
                  onClick={() => removeRow(index)}
                  className="mt-2 p-1 text-[#43474e] hover:text-[#ba1a1a] transition-colors cursor-pointer"
                  title="Remove"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={addRow}
          className="w-full px-3 py-1.5 bg-[#f2f4f6] text-[#002045] text-[13px] font-semibold rounded border border-[#c4c6cf] hover:bg-[#e8ebef] transition-colors flex items-center gap-1 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[15px]">add</span>
          Add more user
        </button>

        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded text-[13px] text-[#43474e] hover:bg-[#f2f4f6] cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={isCreating || validNames.length === 0}
            className="px-4 py-2 bg-[#002045] text-white rounded text-[13px] font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            {isCreating ? (
              <>
                <span className="material-symbols-outlined text-[17px] animate-spin">progress_activity</span>
                <span>Creating...</span>
              </>
            ) : (
              <span>Create {validNames.length > 1 ? `${validNames.length} Users` : 'User'}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
