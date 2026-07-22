import React from 'react';
import { Course } from '../types';

interface EmptyCellProps {
  activeDraftItem: Course | null;
  onPlace: () => void;
}

export const EmptyCell: React.FC<EmptyCellProps> = ({ activeDraftItem, onPlace }) => {
  return (
    <div
      onClick={onPlace}
      className={`h-12 rounded border border-dashed flex items-center justify-center transition-all cursor-pointer group/cell ${
        activeDraftItem
          ? 'border-[#002045]/20 hover:border-[#002045] hover:bg-[#002045]/5'
          : 'border-transparent hover:border-[#c4c6cf] hover:bg-[#f2f4f6]'
      }`}
      title={
        activeDraftItem
          ? `Click to place ${activeDraftItem.code} (${activeDraftItem.sks} SKS) here`
          : 'Click to select slot'
      }
    >
      {activeDraftItem && (
        <span className="text-[11px] text-[#002045] opacity-0 group-hover/cell:opacity-100 font-semibold transition-opacity flex items-center gap-1">
          <span className="material-symbols-outlined text-[15px]">add_circle</span>
          <span>Place {activeDraftItem.code}</span>
        </span>
      )}
    </div>
  );
};
