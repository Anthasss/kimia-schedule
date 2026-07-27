import React, { useState, useMemo } from 'react';
import { Course, CourseClass, Lecturer } from '../../types';
import { ClassCard } from './ClassCard';

interface EditableCourseInfo {
  code: string;
  title: string;
  sks: number;
  semester: string;
}

interface EditableClass {
  lecturers: string[];
}

interface CourseDetailPanelProps {
  course: Course;
  courseClasses: CourseClass[];
  lecturers: Lecturer[];
  allCourses: Course[];
  onSave: (updatedCourse: Course, updatedClasses: { id: string; lecturers: string[] }[], deletedClassIds: string[]) => void;
  onDeleteCourse: (courseId: string) => void;
  onAddClass: () => void;
}

export const CourseDetailPanel: React.FC<CourseDetailPanelProps> = ({
  course,
  courseClasses,
  lecturers,
  allCourses,
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
  const [editClasses, setEditClasses] = useState<Record<string, EditableClass>>(
    () => Object.fromEntries(
      courseClasses.map((cc) => [cc.id, { lecturers: [...cc.lecturers] }])
    )
  );
  const [deletedClassIds, setDeletedClassIds] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const isDirty = useMemo(() => {
    if (editCourse.code !== course.code || editCourse.title !== course.title || editCourse.sks !== course.sks || editCourse.semester !== course.semester) return true;
    if (deletedClassIds.length > 0) return true;
    for (const cc of courseClasses) {
      const edit = editClasses[cc.id];
      if (!edit) return true;
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
  }, [editCourse, editClasses, deletedClassIds, course, courseClasses]);

  const handleSave = async () => {
    setIsSaving(true);
    const updatedClasses = Object.entries(editClasses)
      .filter(([id]) => !deletedClassIds.includes(id))
      .map(([id, c]) => ({ id, ...c }));
    onSave({ ...course, ...editCourse }, updatedClasses, deletedClassIds);
    setIsSaving(false);
  };

  const handleDiscard = () => {
    setEditCourse({ code: course.code, title: course.title, sks: course.sks, semester: course.semester });
    setEditClasses(
      Object.fromEntries(
        courseClasses.map((cc) => [cc.id, { lecturers: [...cc.lecturers] }])
      )
    );
    setDeletedClassIds([]);
  };

  const updateClass = (id: string, patch: Partial<EditableClass>) => {
    setEditClasses((prev) => ({
      ...prev,
      [id]: { ...prev[id], ...patch },
    }));
  };

  const deleteClass = (id: string) => {
    setDeletedClassIds((prev) => [...prev, id]);
    setEditClasses((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const activeClassCount = courseClasses.filter((cc) => !deletedClassIds.includes(cc.id)).length;

  return (
    <div className="h-full flex flex-col bg-white p-6">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#c4c6cf]">
        <span className="bg-[#002045] text-white text-[13px] font-bold px-2.5 py-1 rounded-md">
          {editCourse.code}
        </span>
        <div className="flex items-center gap-2">
          {isDirty && (
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
                <span>Save Changes</span>
              </>
            )}
          </button>
          <button
            onClick={() => {
              if (window.confirm(`Delete "${course.title}"? This will remove all classes and their schedule slots.`)) {
                onDeleteCourse(course.id);
              }
            }}
            className="p-1.5 text-[#43474e] hover:text-[#ba1a1a] transition-colors cursor-pointer"
            title="Delete course"
          >
            <span className="material-symbols-outlined text-[18px]">delete</span>
          </button>
        </div>
      </div>

      {/* Course Info */}
      <div className="px-6 pt-5 pb-4 border-b border-[#f2f4f6] space-y-3">
        <div>
          <label className="block text-[12px] text-[#74777f] font-semibold mb-1.5 uppercase tracking-wide">Course Title</label>
          <input
            type="text"
            value={editCourse.title}
            onChange={(e) => setEditCourse((prev) => ({ ...prev, title: e.target.value }))}
            className="w-full text-[18px] font-semibold text-[#191c1e] bg-[#f2f4f6] px-3 py-2 rounded border border-[#c4c6cf] outline-none focus:ring-1 focus:ring-[#002045] font-headline-sm"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[12px] text-[#74777f] font-semibold mb-1.5 uppercase tracking-wide">Course Code</label>
            <input
              type="text"
              value={editCourse.code}
              onChange={(e) => setEditCourse((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))}
              className="w-full text-[14px] font-mono-code text-[#191c1e] bg-[#f2f4f6] px-3 py-2 rounded border border-[#c4c6cf] outline-none focus:ring-1 focus:ring-[#002045]"
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
      <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[14px] font-semibold text-[#191c1e]">
            Classes ({activeClassCount})
          </h3>
          <button
            onClick={onAddClass}
            className="px-3 py-1 bg-[#f2f4f6] text-[#002045] text-[13px] font-semibold rounded border border-[#c4c6cf] hover:bg-[#e8ebef] transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[15px]">add</span>
            Add Class
          </button>
        </div>

        <div className="space-y-3">
          {courseClasses
            .filter((cc) => !deletedClassIds.includes(cc.id))
            .sort((a, b) => a.classLetter.localeCompare(b.classLetter))
            .map((cc) => {
              const edit = editClasses[cc.id];
              if (!edit) return null;
              return (
                <ClassCard
                  key={cc.id}
                  courseClass={cc}
                  lecturers={lecturers}
                  editLecturers={edit.lecturers}
                  onLecturersChange={(l) => updateClass(cc.id, { lecturers: l })}
                  onDelete={() => deleteClass(cc.id)}
                />
              );
            })}
        </div>
      </div>
    </div>
  );
};
