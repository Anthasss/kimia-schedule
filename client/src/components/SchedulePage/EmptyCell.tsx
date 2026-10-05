import React, { useRef } from 'react';
import { UnscheduledClass } from '../../types';
import { useFitScale } from '../../hooks/useFitScale';

interface EmptyCellProps {
  activeDraftItem: UnscheduledClass | null;
  onPlace: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  isInHoverSpan: boolean;
  isFirstInSpan: boolean;
  hasError?: boolean;
}

export const EmptyCell: React.FC<EmptyCellProps> = ({
  activeDraftItem,
  onPlace,
  onMouseEnter,
  onMouseLeave,
  isInHoverSpan,
  isFirstInSpan,
  hasError,
}) => {
  const boxRef = useRef<HTMLDivElement>(null);
  useFitScale(boxRef);

  return (
    <div
      ref={boxRef}
      onClick={onPlace}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`h-full overflow-hidden rounded border border-dashed flex items-center justify-center transition-all cursor-pointer ${
        isInHoverSpan
          ? hasError
            ? 'border-[#ba1a1a] bg-[#ffdad6]/10'
            : 'border-[#002045] bg-[#002045]/5'
          : activeDraftItem
            ? 'border-[#002045]/20 hover:border-[#002045] hover:bg-[#002045]/5'
            : 'border-transparent hover:border-[#c4c6cf] hover:bg-[#f2f4f6]'
      }`}
      title={
        activeDraftItem
          ? `Click to place ${activeDraftItem.courseTitle} (${activeDraftItem.classLetter}) here`
          : 'Click to select slot'
      }
    >
      <div className="origin-center">
        {activeDraftItem && isFirstInSpan && (
          <span className={`text-[11px] font-semibold flex items-center gap-1 ${hasError ? 'text-[#ba1a1a]' : 'text-[#002045]'}`}>
            <span className="material-symbols-outlined text-[15px]">add_circle</span>
            <span>Place {activeDraftItem.courseTitle} ({activeDraftItem.classLetter})</span>
          </span>
        )}
      </div>
    </div>
  );
};