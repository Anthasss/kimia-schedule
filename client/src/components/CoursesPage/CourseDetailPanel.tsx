import React, { useState, useMemo, useEffect } from 'react';
import { Course, CourseClass, Lecturer } from '../../types';
import { toast } from 'sonner';
import { ClassCard } from './ClassCard';
import { ConfirmModal } from '../Shared/ConfirmModal';

interface EditableCourseInfo {
  code: string;
  title: string;
  sks: number;
  semester: string;
}

interface EditableClass {
  classLetter: string;
  lecturers: string[];
}

interface LocalClass {
  tempId: string;
  classLetter: string;
  lecturers: string[];
}

interface CourseDetailPanelProps {
  course: Course;
  courseClasses: CourseClass[];
  lecturers: Lecturer[];
  allCourses: Course[];
  isNewCourse?: boolean;
  onSave: (updatedCourse: Course, updatedClasses: { id: string; classLetter?: string; lecturers: string[] }[], deletedClassIds: string[]) => Promise<void>;
  onDeleteCourse: (courseId: string) => void;
  onAddClass: () => void;
}

function makeInitialClasses(firstLecturer: string): LocalClass[] {
  return ['A', 'B', 'C', 'D'].map((letter, i) => ({
    tempId: `tmp_${Date.now()}_${i}`,
    classLetter: letter,
    lecturers: firstLecturer ? [firstLecturer] : [],
  }));
}

export const CourseDetailPanel: React.FC<CourseDetailPanelProps> = ({
  course,
  courseClasses,
  lecturers,
  allCourses,
  isNewCourse = false,
  onSave,
  onDeleteCourse,
  onAddClass,
}) => {
  const [editCourse, setEditCourse] = useState<EditableCourseInfo>({
    code: course.code,
    title: course.title,
    sks: course.sks,
    semester: course.semester,
  });
  const [initialLocalClasses] = useState<LocalClass[]>(() => isNewCourse ? makeInitialClasses(lecturers[0]?.name || '') : []);
  const [localClasses, setLocalClasses] = useState<LocalClass[]>(initialLocalClasses);
  const [editClasses, setEditClasses] = useState<Record<string, EditableClass>>(
    () => {
      const entries: [string, EditableClass][] = isNewCourse
        ? initialLocalClasses.map((lc) => [lc.tempId, { classLetter: lc.classLetter, lecturers: lc.lecturers }])
        : courseClasses.map((cc) => [cc.id, { classLetter: cc.classLetter, lecturers: [...cc.lecturers] }]);
      return Object.fromEntries(entries);
    }
  );
  const [deletedClassIds, setDeletedClassIds] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorFields, setErrorFields] = useState<Set<string>>(new Set());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (isNewCourse) return;
    setEditClasses((prev) => {
      let next = prev;
      for (const cc of courseClasses) {
        if (!next[cc.id]) {
          if (next === prev) next = { ...prev };
          next[cc.id] = { classLetter: cc.classLetter, lecturers: [...cc.lecturers] };
        }
      }
      return next;
    });
  }, [courseClasses, isNewCourse]);

  const isDirty = useMemo(() => {
    if (isNewCourse) return true;
    if (editCourse.code !== course.code || editCourse.title !== course.title || editCourse.sks !== course.sks || editCourse.semester !== course.semester) return true;
    if (deletedClassIds.length > 0) return true;
    for (const cc of courseClasses) {
      const edit = editClasses[cc.id];
      if (!edit) return true;
      if (edit.classLetter !== cc.classLetter) return true;
      if (edit.lecturers.length !== cc.lecturers.length) return true;
      for (let i = 0; i < edit.lecturers.length; i++) {
        if (edit.lecturers[i] !== cc.lecturers[i]) return true;
      }
    }
    const currentIds = new Set(courseClasses.map((c) => c.id));
    for (const id of Object.keys(editClasses)) {
      if (!currentIds.has(id)) return true;
    }
    return false;
  }, [isNewCourse, editCourse, editClasses, deletedClassIds, course, courseClasses]);

  const handleAddLocalClass = () => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    const usedLetters = displayClasses.map((cc) => cc.classLetter);
    const nextLetter = letters.find((l) => !usedLetters.includes(l)) || 'Z';
    const tempId = `tmp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    setLocalClasses((prev) => [...prev, { tempId, classLetter: nextLetter, lecturers: [] }]);
    setEditClasses((prev) => ({ ...prev, [tempId]: { classLetter: nextLetter, lecturers: [] } }));
  };

  const handleSave = async () => {
    setErrorFields(new Set());

    if (isNewCourse) {
      const errors = new Set<string>();
      if (!editCourse.code?.trim()) errors.add('code');
      if (!editCourse.title?.trim()) errors.add('title');
      if (!editCourse.sks || editCourse.sks < 1) errors.add('sks');

      const activeClasses = localClasses.filter((lc) => !deletedClassIds.includes(lc.tempId));
      if (activeClasses.length === 0) {
        toast.error('At least one class is required');
        return;
      }
      for (const lc of activeClasses) {
        const edit = editClasses[lc.tempId];
        if (!edit || edit.lecturers.filter(Boolean).length === 0) {
          errors.add(`class_${lc.tempId}`);
        }
        if (edit && edit.lecturers.filter(Boolean).length > 3) {
          errors.add(`class_${lc.tempId}`);
        }
      }

      if (errors.size > 0) {
        setErrorFields(errors);
        toast.error('Please fill in all fields including at least one lecturer per class');
        return;
      }
    }

    const activeIds = Object.keys(editClasses).filter((id) => !deletedClassIds.includes(id));
    const seenLetters = new Set<string>();
    for (const id of activeIds) {
      const letter = (editClasses[id].classLetter || '').trim().toUpperCase();
      if (!letter) {
        toast.error('Every class needs a class letter');
        return;
      }
      if (seenLetters.has(letter)) {
        toast.error(`Duplicate class letter "${letter}"`);
        return;
      }
      seenLetters.add(letter);
    }

    setIsSaving(true);
    const updatedClasses = Object.entries(editClasses)
      .filter(([id]) => !deletedClassIds.includes(id))
      .map(([id, c]) => ({ id, classLetter: c.classLetter.trim(), ...c }));
    try {
      await onSave({ ...course, ...editCourse }, updatedClasses, deletedClassIds);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscard = () => {
    setEditCourse({ code: course.code, title: course.title, sks: course.sks, semester: course.semester });
    setEditClasses(
      Object.fromEntries(
        courseClasses.map((cc) => [cc.id, { classLetter: cc.classLetter, lecturers: [...cc.lecturers] }])
      )
    );
    setLocalClasses([]);
    setDeletedClassIds([]);
    setErrorFields(new Set());
  };

  const updateClass = (id: string, patch: Partial<EditableClass>) => {
    setEditClasses((prev) => ({
      ...prev,
      [id]: { ...prev[id], ...patch },
    }));
    setErrorFields((prev) => {
      const next = new Set(prev);
      next.delete(`class_${id}`);
      return next;
    });
  };

  const updateClassLetter = (id: string, letter: string) => {
    updateClass(id, { classLetter: letter.toUpperCase() });
    setLocalClasses((prev) =>
      prev.map((lc) => (lc.tempId === id ? { ...lc, classLetter: letter.toUpperCase() } : lc))
    );
  };

  const deleteClass = (id: string) => {
    setDeletedClassIds((prev) => [...prev, id]);
    setEditClasses((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const displayClasses = useMemo(() => {
    if (!isNewCourse) return courseClasses;
    return localClasses.map((lc) => ({
      id: lc.tempId,
      courseCode: editCourse.code,
      classLetter: lc.classLetter,
      lecturers: lc.lecturers,
    }));
  }, [courseClasses, localClasses, isNewCourse, editCourse.code]);

  const activeClassCount = displayClasses.filter((cc) => !deletedClassIds.includes(cc.id)).length;

  const inputClass = (field: string) =>
    `w-full text-[14px] bg-[#f2f4f6] px-3 py-2 rounded outline-none focus:ring-1 focus:ring-[#002045] font-mono-code text-[#191c1e] ${
      errorFields.has(field) ? 'border-2 border-[#ba1a1a]' : 'border border-[#c4c6cf]'
    }`;

  return (
    <div className="flex flex-col bg-white p-6">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#c4c6cf]">
        <span className="bg-[#002045] text-white text-[13px] font-bold px-2.5 py-1 rounded-md">
          {editCourse.code || 'NEW'}
        </span>
        <div className="flex items-center gap-2">
          {!isNewCourse && isDirty && (
            <button
              onClick={handleDiscard}
              className="px-3 py-1.5 rounded text-[13px] text-[#43474e] hover:bg-[#f2f4f6] transition-colors cursor-pointer"
            >
              Discard
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={!isDirty || isSaving}
            className="px-4 py-1.5 bg-[#002045] text-white rounded text-[13px] font-semibold disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer transition-opacity"
          >
            {isSaving ? (
              <>
                <span className="material-symbols-outlined text-[17px] animate-spin">progress_activity</span>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[17px]">check</span>
                <span>{isNewCourse ? 'Create Course' : 'Save Changes'}</span>
              </>
            )}
          </button>
          {!isNewCourse && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-1.5 text-[#43474e] hover:text-[#ba1a1a] transition-colors cursor-pointer"
              title="Delete course"
            >
              <span className="material-symbols-outlined text-[18px]">delete</span>
            </button>
          )}
        </div>
      </div>

      {/* Course Info */}
      <div className="px-6 pt-5 pb-4 border-b border-[#f2f4f6] space-y-3">
        <div>
          <label className="block text-[12px] text-[#74777f] font-semibold mb-1.5 uppercase tracking-wide">Course Title</label>
          <input
            type="text"
            value={editCourse.title}
            onChange={(e) => {
              setEditCourse((prev) => ({ ...prev, title: e.target.value }));
              setErrorFields((prev) => { const next = new Set(prev); next.delete('title'); return next; });
            }}
            className={`w-full text-[18px] font-semibold text-[#191c1e] bg-[#f2f4f6] px-3 py-2 rounded outline-none focus:ring-1 focus:ring-[#002045] font-headline-sm ${
              errorFields.has('title') ? 'border-2 border-[#ba1a1a]' : 'border border-[#c4c6cf]'
            }`}
          />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-[12px] text-[#74777f] font-semibold mb-1.5 uppercase tracking-wide">Course Code</label>
            <input
              type="text"
              value={editCourse.code}
              onChange={(e) => {
                setEditCourse((prev) => ({ ...prev, code: e.target.value.toUpperCase() }));
                setErrorFields((prev) => { const next = new Set(prev); next.delete('code'); return next; });
              }}
              className={inputClass('code')}
            />
          </div>
          <div>
            <label className="block text-[12px] text-[#74777f] font-semibold mb-1.5 uppercase tracking-wide">SKS</label>
            <input
              type="number"
              min={1}
              max={24}
              value={editCourse.sks || ''}
              onChange={(e) => {
                setEditCourse((prev) => ({ ...prev, sks: Math.max(1, parseInt(e.target.value) || 0) }));
                setErrorFields((prev) => { const next = new Set(prev); next.delete('sks'); return next; });
              }}
              className={inputClass('sks')}
            />
          </div>
          <div>
            <label className="block text-[12px] text-[#74777f] font-semibold mb-1.5 uppercase tracking-wide">Semester</label>
            <select
              value={editCourse.semester}
              onChange={(e) => setEditCourse((prev) => ({ ...prev, semester: e.target.value }))}
              className="w-full text-[14px] text-[#191c1e] bg-[#f2f4f6] px-3 py-2 rounded border border-[#c4c6cf] outline-none cursor-pointer focus:ring-1 focus:ring-[#002045]"
            >
              <option value="Ganjil">Ganjil</option>
              <option value="Genap">Genap</option>
              <option value="Both">Both</option>
            </select>
          </div>
        </div>
      </div>

      {/* Classes */}
      <div className="px-6 py-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[14px] font-semibold text-[#191c1e]">
            Classes ({activeClassCount})
          </h3>
          <button
            onClick={isNewCourse ? handleAddLocalClass : onAddClass}
            className="px-3 py-1 bg-[#f2f4f6] text-[#002045] text-[13px] font-semibold rounded border border-[#c4c6cf] hover:bg-[#e8ebef] transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[15px]">add</span>
            Add Class
          </button>
        </div>

        <div className="space-y-3">
          {displayClasses
            .filter((cc) => !deletedClassIds.includes(cc.id))
            .sort((a, b) => a.classLetter.localeCompare(b.classLetter))
            .map((cc) => {
              const edit = editClasses[cc.id];
              if (!edit) return null;
              return (
                <ClassCard
                  key={cc.id}
                  lecturers={lecturers}
                  editClassLetter={edit.classLetter}
                  editLecturers={edit.lecturers}
                  onClassLetterChange={(l) => updateClassLetter(cc.id, l)}
                  onLecturersChange={(l) => updateClass(cc.id, { lecturers: l })}
                  onDelete={() => deleteClass(cc.id)}
                  hasError={errorFields.has(`class_${cc.id}`)}
                />
              );
            })}
        </div>
      </div>

      <ConfirmModal
        open={showDeleteConfirm}
        message={`Delete "${course.title}"? This will remove all classes and their schedule slots.`}
        confirmLabel="Delete"
        danger
        loading={isDeleting}
        onConfirm={async () => {
          setIsDeleting(true);
          await onDeleteCourse(course.id);
          setIsDeleting(false);
          setShowDeleteConfirm(false);
        }}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
};
