import React from 'react';
import { Course, CourseClass, Lecturer } from '../../types';
import { CourseSidebarCard } from './CourseSidebarCard';

interface CoursesSidebarProps {
  courses: Course[];
  courseClasses: CourseClass[];
  lecturers: Lecturer[];
  selectedCourseCode: string | null;
  search: string;
  onSearchChange: (value: string) => void;
  onSelectCourse: (code: string) => void;
  onAddCourse: () => void;
}

export const CoursesSidebar: React.FC<CoursesSidebarProps> = ({
  courses,
  courseClasses,
  lecturers,
  selectedCourseCode,
  search,
  onSearchChange,
  onSelectCourse,
  onAddCourse,
}) => {
  const grouped = React.useMemo(() => {
    const map = new Map<string, { course: Course; classes: CourseClass[] }>();
    for (const c of courses) {
      if (!map.has(c.code)) {
        map.set(c.code, { course: c, classes: [] });
      }
    }
    for (const cc of courseClasses) {
      const entry = map.get(cc.courseCode);
      if (entry) {
        entry.classes.push(cc);
      }
    }
    return Array.from(map.values());
  }, [courses, courseClasses]);

  const filtered = React.useMemo(() => {
    if (!search) return grouped;
    const q = search.toLowerCase();
    return grouped.filter((g) => {
      const matchesCode = g.course.code.toLowerCase().includes(q);
      const matchesTitle = g.course.title.toLowerCase().includes(q);
      const matchesLecturer = g.classes.some((cc) =>
        cc.lecturers.some((name) => name.toLowerCase().includes(q))
      );
      return matchesCode || matchesTitle || matchesLecturer;
    });
  }, [grouped, search]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center border-b border-[#c4c6cf] pb-3 shrink-0">
        <h3 className="font-headline-sm text-[17px] text-[#191c1e] font-bold">
          Courses
        </h3>
        <span className="text-[12px] font-bold bg-[#002045] text-white px-2.5 py-0.5">
          {grouped.length}
        </span>
      </div>

      <div className="relative shrink-0 mt-4 mb-2">
        <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[17px] text-[#43474e]">
          search
        </span>
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search code, title, lecturer..."
          className="w-full bg-[#f2f4f6] border border-[#c4c6cf] rounded-md py-1.5 pl-8 pr-3 text-[13px] text-[#191c1e] focus:ring-1 focus:ring-[#002045] outline-none"
        />
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 space-y-2 custom-scrollbar pr-1 mt-2">
        {filtered.map((g) => (
          <CourseSidebarCard
            key={g.course.code}
            course={g.course}
            isSelected={selectedCourseCode === g.course.code}
            onSelect={() => onSelectCourse(g.course.code)}
          />
        ))}

        {filtered.length === 0 && (
          <div className="p-4 text-center text-[13px] text-[#74777f] italic bg-[#f7f9fb] rounded-lg border border-[#c4c6cf]">
            {grouped.length === 0
              ? 'No courses defined yet.'
              : 'No matching courses found.'}
          </div>
        )}
      </div>

      <button
        onClick={onAddCourse}
        className="w-full py-2 bg-[#002045] text-white rounded-lg text-[13px] font-semibold hover:bg-[#002f5e] transition-colors flex items-center justify-center gap-1.5 cursor-pointer shrink-0 mt-4"
      >
        <span className="material-symbols-outlined text-[17px]">add</span>
        <span>Add Course</span>
      </button>
    </div>
  );
};
