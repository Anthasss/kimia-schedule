import React from 'react';

interface ConfirmModalProps {
  open: boolean;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  open,
  message,
  confirmLabel = 'Confirm',
  danger = false,
  loading,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-xl max-w-md w-full p-6 border border-[#c4c6cf] shadow-xl space-y-4">
        <p className="text-[13px] text-[#43474e] leading-relaxed">{message}</p>
        <div className="flex justify-end gap-2 pt-1">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded text-[13px] text-[#43474e] hover:bg-[#f2f4f6] cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 rounded text-[13px] font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 ${
              danger
                ? 'bg-[#ba1a1a] text-white hover:bg-[#93000a]'
                : 'bg-[#002045] text-white hover:bg-opacity-90'
            }`}
          >
            {loading ? (
              <>
                <span className="material-symbols-outlined text-[17px] animate-spin">progress_activity</span>
                <span>Deleting...</span>
              </>
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
