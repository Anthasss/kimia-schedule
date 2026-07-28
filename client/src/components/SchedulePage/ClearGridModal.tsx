import React from 'react';

interface ClearGridModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

export const ClearGridModal: React.FC<ClearGridModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  loading,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-sm w-full p-6 border border-[#c4c6cf] shadow-xl space-y-4">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-[28px] text-[#ba1a1a]">warning</span>
          <h3 className="font-headline-sm text-[18px] text-[#191c1e]">Clear Schedule Grid</h3>
        </div>
        <p className="text-[13px] text-[#43474e] leading-relaxed">
          This will remove all scheduled classes from the grid. This action cannot be undone.
        </p>
        <div className="flex justify-end gap-2 pt-2 border-t border-[#c4c6cf]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded text-[13px] text-[#43474e] hover:bg-[#f2f4f6] cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 bg-[#ba1a1a] text-white rounded text-[13px] font-semibold hover:bg-[#93000a] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            {loading ? (
              <>
                <span className="material-symbols-outlined text-[17px] animate-spin">progress_activity</span>
                <span>Clearing...</span>
              </>
            ) : (
              'Clear Grid'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};