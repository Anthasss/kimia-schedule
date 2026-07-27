import React from 'react';
import { Course, CourseClass, Lecturer } from '../../types';
import { ClassCard } from './ClassCard';

interface CourseDetailPanelProps {
  course: Course;
  courseClasses: CourseClass[];
  lecturers: Lecturer[];
  onEditCourse: () => void;
  onDeleteCourse: () => void;
  onAddClass: () => void;
  onEditClass: (courseClass: CourseClass) => void;
  onDeleteClass: (classId: string) => void;
}

export const CourseDetailPanel: React.FC<CourseDetailPanelProps> = ({
  course,
  courseClasses,
  lecturers,
  onEditCourse,
  onDeleteCourse,
  onAddClass,
  onEditClass,
  onDeleteClass,
}) => {
  const sortedClasses = [...courseClasses].sort((a, b) =>
    a.classLetter.localeCompare(b.classLetter)
  );

  return (
    <div className="flex flex-col h-full overflow-y-auto custom-scrollbar">
      <div className="border border-[#c4c6cf] rounded-xl p-5 bg-white">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[12px] font-bold px-2 py-0.5 bg-[#1a365d] text-white rounded">
                {course.code}
              </span>
              <span className="text-[13px] font-semibold text-[#505f76]">
                {course.sks} SKS
              </span>
              <span className="text-[12px] px-2 py-0.5 bg-[#f2f4f6] text-[#43474e] rounded font-medium">
                {course.semester}
              </span>
            </div>
            <h2 className="font-headline-sm text-[20px] text-[#191c1e] font-bold">
              {course.title}
            </h2>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={onEditCourse}
              className="p-2 text-[#43474e] hover:text-[#002045] transition-colors cursor-pointer"
              title="Edit course"
            >
              <span className="material-symbols-outlined text-[20px]">edit</span>
            </button>
            <button
              onClick={onDeleteCourse}
              className="p-2 text-[#43474e] hover:text-[#ba1a1a] transition-colors cursor-pointer"
              title="Delete course"
            >
              <span className="material-symbols-outlined text-[20px]">delete</span>
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-headline-sm text-[16px] text-[#191c1e] font-bold">
            Classes
          </h3>
          <span className="text-[12px] text-[#74777f] font-medium">
            {sortedClasses.length} class{sortedClasses.length !== 1 ? 'es' : ''}
          </span>
        </div>

        <div className="space-y-3">
          {sortedClasses.map((cc) => (
            <ClassCard
              key={cc.id}
              courseClass={cc}
              lecturers={lecturers}
              onEdit={() => onEditClass(cc)}
              onDelete={() => onDeleteClass(cc.id)}
            />
          ))}

          {sortedClasses.length === 0 && (
            <div className="p-4 text-center text-[13px] text-[#74777f] italic bg-[#f7f9fb] rounded-lg border border-[#c4c6cf]">
              No classes defined yet.
            </div>
          )}
        </div>

        <button
          onClick={onAddClass}
          className="w-full mt-4 py-2 border border-dashed border-[#c4c6cf] rounded-lg text-[13px] text-[#43474e] font-semibold hover:bg-[#f2f4f6] transition-colors flex items-center justify-center gap-1 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[17px]">add</span>
          <span>Add Class</span>
        </button>
      </div>
    </div>
  );
};
