import React, { useState } from 'react';
import { toast } from 'sonner';
import { apiPost, apiPut, apiDelete } from '../api';
import { Course, Lecturer } from '../types';

interface CoursesViewProps {
  courses: Course[];
  setCourses: React.Dispatch<React.SetStateAction<Course[]>>;
  lecturers: Lecturer[];
}

export const CoursesView: React.FC<CoursesViewProps> = ({ courses, setCourses, lecturers }) => {
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  // New Course Form State
  const [newCode, setNewCode] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newSks, setNewSks] = useState(3);
  const [numClasses, setNumClasses] = useState(4);
  const [classLecturers, setClassLecturers] = useState<string[]>(Array.from({ length: 4 }, () => ''));
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  const filteredCourses = courses.filter((c) => {
    const matchesSearch =
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      (c.assignedLecturerName && c.assignedLecturerName.toLowerCase().includes(search.toLowerCase()));
    return matchesSearch;
  });

  const totalPages = Math.ceil(filteredCourses.length / ITEMS_PER_PAGE);
  const safeCurrentPage = Math.min(currentPage, totalPages || 1);
  const paginatedCourses = filteredCourses.slice(
    (safeCurrentPage - 1) * ITEMS_PER_PAGE,
    safeCurrentPage * ITEMS_PER_PAGE
  );

  const getClassLetter = (i: number) => String.fromCharCode(65 + i);

  const handleAddCourse = async () => {
    if (!newCode || !newTitle) return;

    try {
      const created = await Promise.all(
        Array.from({ length: numClasses }, (_, i) => {
          const classLetter = getClassLetter(i);
          return apiPost<Course>('/api/courses', {
            code: newCode,
            title: `${newTitle} ${classLetter}`,
            sks: newSks,
            assignedLecturerName: classLecturers[i] || null,
          });
        })
      );
      setCourses([...courses, ...created]);
      setShowAddModal(false);
      setNewCode('');
      setNewTitle('');
      setNewSks(3);
      setNumClasses(4);
      setClassLecturers(Array.from({ length: 4 }, () => ''));
      toast.success(`${numClasses} courses created`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to create courses');
    }
  };

  const handleDeleteCourse = async (id: string) => {
    if (confirm('Delete course from catalog?')) {
      try {
        await apiDelete(`/api/courses/${id}`);
        setCourses(courses.filter((c) => c.id !== id));
        toast.success('Course deleted');
      } catch (err) {
        console.error(err);
        toast.error('Failed to delete course');
      }
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 gap-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="font-headline-lg text-[28px] text-[#191c1e] font-bold">
            Courses
          </h1>
          <p className="text-[#43474e] font-body-md text-[14px]">
            Manage courses, credits, and instructor assignments.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[16px] text-[#43474e]">
              search
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search code, title, instructor..."
              className="bg-white border border-[#c4c6cf] rounded-md py-2 pl-8 pr-3 text-[13px] text-[#191c1e] w-64 focus:ring-1 focus:ring-[#002045] outline-none"
            />
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-[#002045] text-white px-4 py-2 rounded-lg font-semibold text-[12px] flex items-center gap-2 hover:bg-opacity-90 active:scale-95 transition-all shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>Add Course</span>
          </button>
        </div>
      </div>

      {/* Course Table */}
      <div className="bg-white border border-[#c4c6cf] rounded-xl overflow-hidden shadow-2xs flex flex-col flex-1 min-h-0">
        <div className="overflow-auto flex-1 min-h-0 custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f2f4f6]">
                <th className="px-6 py-3 font-semibold text-[12px] text-[#43474e] uppercase tracking-wider">
                  Code
                </th>
                <th className="px-6 py-3 font-semibold text-[12px] text-[#43474e] uppercase tracking-wider">
                  Course Title
                </th>
                <th className="px-6 py-3 font-semibold text-[12px] text-[#43474e] uppercase tracking-wider">
                  SKS
                </th>
                <th className="px-6 py-3 font-semibold text-[12px] text-[#43474e] uppercase tracking-wider">
                  Instructor
                </th>
                <th className="px-6 py-3 font-semibold text-[12px] text-[#43474e] uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#c4c6cf] text-[13px]">
              {paginatedCourses.map((c, idx) => {
                const isEven = idx % 2 === 1;
                return (
                  <tr
                    key={c.id}
                    className={`${isEven ? 'bg-[#f7f9fb]' : 'bg-white'
                      } hover:bg-[#eceef0] transition-colors group`}
                  >
                    <td className="px-6 py-4 font-bold text-[#002045] font-mono-code">
                      {c.code}
                    </td>
                    <td className="px-6 py-4 font-semibold text-[#191c1e]">{c.title}</td>
                    <td className="px-6 py-4 font-semibold text-[#191c1e]">{c.sks} SKS</td>
                    <td className="px-6 py-4 font-medium text-[#191c1e]">
                      {c.assignedLecturerName || 'Unassigned'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setEditingCourse(c)}
                        className="p-1.5 text-[#43474e] hover:text-[#002045] transition-colors cursor-pointer mr-1"
                      >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteCourse(c.id)}
                        className="p-1.5 text-[#43474e] hover:text-[#ba1a1a] transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredCourses.length > ITEMS_PER_PAGE && (
          <div className="px-6 py-3 border-t border-[#c4c6cf] bg-[#f2f4f6] flex justify-between items-center text-[12px]">
            <span className="text-[#43474e] font-medium">
              Showing {(safeCurrentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(safeCurrentPage * ITEMS_PER_PAGE, filteredCourses.length)} of {filteredCourses.length} Courses
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled={safeCurrentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1 hover:bg-[#e0e3e5] rounded disabled:opacity-30 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-7 h-7 rounded font-bold text-[12px] ${safeCurrentPage === page ? 'bg-[#002045] text-white' : 'hover:bg-[#e0e3e5] text-[#191c1e]'}`}
                >
                  {page}
                </button>
              ))}
              <button
                disabled={safeCurrentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-1 hover:bg-[#e0e3e5] rounded disabled:opacity-30 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Course Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full p-6 border border-[#c4c6cf] shadow-xl space-y-4">
            <h3 className="font-headline-sm text-[18px] text-[#191c1e]">New Course Specification</h3>
            <div className="grid grid-cols-2 gap-6 text-[13px]">
              <div className="space-y-3">
                <div>
                  <label className="block text-[#43474e] font-semibold mb-1">Course Code</label>
                  <input
                    type="text"
                    placeholder="e.g. CS-302"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    className="w-full bg-[#f2f4f6] px-3 py-2 rounded border border-[#c4c6cf] outline-none font-mono-code"
                  />
                </div>
                <div>
                  <label className="block text-[#43474e] font-semibold mb-1">Course Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Operating Systems Design"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full bg-[#f2f4f6] px-3 py-2 rounded border border-[#c4c6cf] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#43474e] font-semibold mb-1">SKS Credits</label>
                  <input
                    type="number"
                    value={newSks}
                    onChange={(e) => setNewSks(parseInt(e.target.value) || 2)}
                    className="w-full bg-[#f2f4f6] px-3 py-2 rounded border border-[#c4c6cf] outline-none"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-[#43474e] font-semibold mb-1">Number of Classes</label>
                  <input
                    type="number"
                    min={1}
                    max={8}
                    value={numClasses}
                    onChange={(e) => {
                      const n = Math.min(8, Math.max(1, parseInt(e.target.value) || 1));
                      setNumClasses(n);
                      setClassLecturers((prev) => {
                        if (prev.length === n) return prev;
                        if (prev.length < n) return [...prev, ...Array(n - prev.length).fill('')];
                        return prev.slice(0, n);
                      });
                    }}
                    className="w-full bg-[#f2f4f6] px-3 py-2 rounded border border-[#c4c6cf] outline-none"
                  />
                </div>
                <div className="max-h-[260px] overflow-y-auto space-y-2 custom-scrollbar">
                  {Array.from({ length: numClasses }, (_, i) => {
                    const classLetter = getClassLetter(i);
                    return (
                      <div key={i} className="flex items-center gap-2">
                        <span className="font-bold text-[#002045] w-6 shrink-0">{classLetter}</span>
                        <select
                          value={classLecturers[i]}
                          onChange={(e) => {
                            const next = [...classLecturers];
                            next[i] = e.target.value;
                            setClassLecturers(next);
                          }}
                          className="flex-1 bg-[#f2f4f6] py-2 rounded border border-[#c4c6cf] outline-none"
                        >
                          <option value="">Unassigned</option>
                          {lecturers.map((l) => (
                            <option key={l.id} value={l.name}>
                              {l.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-[#c4c6cf]">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewCode('');
                  setNewTitle('');
                  setNewSks(3);
                  setNumClasses(4);
                  setClassLecturers(Array.from({ length: 4 }, () => ''));
                }}
                className="px-4 py-2 rounded text-[13px] text-[#43474e] hover:bg-[#f2f4f6]"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCourse}
                className="px-4 py-2 bg-[#002045] text-white rounded text-[13px] font-semibold"
              >
                Save Course Spec
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Course Modal */}
      {editingCourse && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 border border-[#c4c6cf] shadow-xl space-y-4">
            <h3 className="font-headline-sm text-[18px] text-[#191c1e]">Edit Course</h3>
            <div className="space-y-3 text-[13px]">
              <div>
                <label className="block text-[#43474e] font-semibold mb-1">Title</label>
                <input
                  type="text"
                  value={editingCourse.title}
                  onChange={(e) => setEditingCourse({ ...editingCourse, title: e.target.value })}
                  className="w-full bg-[#f2f4f6] px-3 py-2 rounded border border-[#c4c6cf] outline-none"
                />
              </div>
              <div>
                <label className="block text-[#43474e] font-semibold mb-1">SKS Credits</label>
                <input
                  type="number"
                  value={editingCourse.sks}
                  onChange={(e) => setEditingCourse({ ...editingCourse, sks: parseInt(e.target.value) || 2 })}
                  className="w-full bg-[#f2f4f6] px-3 py-2 rounded border border-[#c4c6cf] outline-none"
                />
              </div>
              <div>
                <label className="block text-[#43474e] font-semibold mb-1">Instructor</label>
                <select
                  value={editingCourse.assignedLecturerName || ''}
                  onChange={(e) =>
                    setEditingCourse({ ...editingCourse, assignedLecturerName: e.target.value || undefined })
                  }
                  className="w-full bg-[#f2f4f6] px-3 py-2 rounded border border-[#c4c6cf] outline-none"
                >
                  <option value="">Unassigned</option>
                  {lecturers.map((l) => (
                    <option key={l.id} value={l.name}>
                      {l.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setEditingCourse(null)}
                className="px-4 py-2 rounded text-[13px] text-[#43474e] hover:bg-[#f2f4f6]"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    const updated = await apiPut<Course>(`/api/courses/${editingCourse.id}`, {
                      title: editingCourse.title,
                      sks: editingCourse.sks,
                      assignedLecturerName: editingCourse.assignedLecturerName,
                    });
                    setCourses(courses.map((c) => (c.id === updated.id ? updated : c)));
                    setEditingCourse(null);
                    toast.success('Course updated');
                  } catch (err) {
                    console.error(err);
                    toast.error('Failed to update course');
                  }
                }}
                className="px-4 py-2 bg-[#002045] text-white rounded text-[13px] font-semibold"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
