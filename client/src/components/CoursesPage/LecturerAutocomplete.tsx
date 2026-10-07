import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Lecturer } from '../../types';

interface LecturerAutocompleteProps {
  value: string;
  lecturers: Lecturer[];
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

interface OptionItem {
  id: string;
  name: string;
  label: string;
  color?: string;
}

export const LecturerAutocomplete: React.FC<LecturerAutocompleteProps> = ({
  value,
  lecturers,
  onChange,
  placeholder = 'Unassigned',
  className = '',
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState(value || '');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  const activeLecturers = useMemo(() => {
    return lecturers.filter((l) => !l.deletedAt);
  }, [lecturers]);

  const selectedLecturer = useMemo(() => {
    return activeLecturers.find((l) => l.name === value) || lecturers.find((l) => l.name === value);
  }, [activeLecturers, lecturers, value]);

  const filteredLecturers = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return activeLecturers;
    return activeLecturers.filter((l) => l.name.toLowerCase().includes(trimmed));
  }, [activeLecturers, query]);

  const options: OptionItem[] = useMemo(() => {
    const result: OptionItem[] = [];
    const trimmed = query.trim().toLowerCase();
    if (!trimmed || 'unassigned'.includes(trimmed)) {
      result.push({ id: 'unassigned', name: '', label: 'Unassigned' });
    }
    for (const l of filteredLecturers) {
      result.push({ id: l.id, name: l.name, label: l.name, color: l.color });
    }
    return result;
  }, [filteredLecturers, query]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        if (isOpen) {
          setIsOpen(false);
          const exactMatch = activeLecturers.find(
            (l) => l.name.toLowerCase() === query.trim().toLowerCase()
          );
          if (exactMatch) {
            onChange(exactMatch.name);
            setQuery(exactMatch.name);
          } else if (!query.trim()) {
            onChange('');
            setQuery('');
          } else {
            setQuery(value || '');
          }
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, activeLecturers, query, value, onChange]);

  const handleSelect = (item: OptionItem) => {
    onChange(item.name);
    setQuery(item.name);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      } else {
        setHighlightedIndex((prev) => (options.length === 0 ? 0 : (prev + 1) % options.length));
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      } else {
        setHighlightedIndex((prev) =>
          options.length === 0 ? 0 : (prev - 1 + options.length) % options.length
        );
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (isOpen && options[highlightedIndex]) {
        handleSelect(options[highlightedIndex]);
      } else {
        setIsOpen(true);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setQuery(value || '');
    } else if (e.key === 'Tab') {
      if (isOpen && options[highlightedIndex] && query !== value) {
        handleSelect(options[highlightedIndex]);
      } else {
        setIsOpen(false);
      }
    }
  };

  const currentColor = selectedLecturer?.color;

  return (
    <div ref={containerRef} className={`relative flex-1 ${className}`}>
      <div className="relative flex items-center">
        {currentColor && (
          <span
            className="absolute left-2.5 w-2.5 h-2.5 rounded-full shrink-0 pointer-events-none"
            style={{ backgroundColor: currentColor }}
          />
        )}
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setHighlightedIndex(0);
          }}
          onFocus={() => {
            setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="off"
          className={`w-full bg-white ${
            currentColor ? 'pl-7' : 'pl-2.5'
          } pr-12 py-1.5 rounded border border-[#c4c6cf] outline-none text-[12px] text-[#191c1e] focus:ring-1 focus:ring-[#002045] disabled:bg-[#f2f4f6] disabled:cursor-not-allowed`}
        />
        <div className="absolute right-2 flex items-center gap-0.5">
          {query && !disabled && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange('');
                setQuery('');
                setIsOpen(false);
              }}
              className="p-0.5 text-[#74777f] hover:text-[#191c1e] transition-colors cursor-pointer rounded"
              title="Clear selection"
            >
              <span className="material-symbols-outlined text-[14px]">close</span>
            </button>
          )}
          <button
            type="button"
            disabled={disabled}
            onClick={() => setIsOpen((prev) => !prev)}
            className="p-0.5 text-[#74777f] hover:text-[#191c1e] transition-colors cursor-pointer rounded"
            title="Toggle dropdown"
          >
            <span className="material-symbols-outlined text-[16px]">
              {isOpen ? 'expand_less' : 'expand_more'}
            </span>
          </button>
        </div>
      </div>

      {isOpen && !disabled && (
        <ul className="absolute left-0 right-0 top-full mt-1 bg-white border border-[#c4c6cf] rounded-md shadow-lg z-50 max-h-48 overflow-y-auto py-1 custom-scrollbar">
          {options.length > 0 ? (
            options.map((opt, idx) => {
              const isSelected = opt.name === value;
              const isHighlighted = idx === highlightedIndex;
              return (
                <li
                  key={opt.id}
                  onClick={() => handleSelect(opt)}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                  className={`flex items-center justify-between px-3 py-1.5 text-[12px] cursor-pointer transition-colors ${
                    isHighlighted ? 'bg-[#e8ebef]' : 'hover:bg-[#f2f4f6]'
                  } ${isSelected ? 'font-semibold text-[#002045]' : 'text-[#191c1e]'}`}
                >
                  <div className="flex items-center gap-2 truncate">
                    {opt.color ? (
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: opt.color }}
                      />
                    ) : (
                      <span className="w-2.5 h-2.5 rounded-full border border-[#c4c6cf] shrink-0" />
                    )}
                    <span className="truncate">{opt.label}</span>
                  </div>
                  {isSelected && (
                    <span className="material-symbols-outlined text-[14px] text-[#002045]">
                      check
                    </span>
                  )}
                </li>
              );
            })
          ) : (
            <li className="px-3 py-2 text-[12px] text-[#74777f] italic">
              No lecturers found
            </li>
          )}
        </ul>
      )}
    </div>
  );
};
