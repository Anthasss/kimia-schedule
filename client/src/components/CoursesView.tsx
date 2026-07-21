import React, { useState } from 'react';
import { toast } from 'sonner';
import { apiPost, apiPut, apiDelete } from '../api';
import { Course } from '../types';

interface CoursesViewProps {
  courses: Course[];
  setCourses: React.Dispatch<React.SetStateAction<Course[]>>;
}

export const CoursesView: React.FC<CoursesViewProps> = ({ courses, setCourses }) => {
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  // New Course Form State
  const [newCode, setNewCode] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newSks, setNewSks] = useState(3);
  const [newDepartment, setNewDepartment] = useState('Computer Science');
  const [newType, setNewType] = useState<'LECTURE' | 'LAB' | 'SEMINAR' | 'STUDIO'>('LECTURE');
  const [newLecturer, setNewLecturer] = useState('');
  const [newPrereqs, setNewPrereqs] = useState('');

  const departments = ['All', 'Computer Science', 'Theoretical Physics', 'Chemistry', 'Data Science', 'Modern History'];

  const filteredCourses = courses.filter((c) => {
    const matchesSearch =
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      (c.assignedLecturerName && c.assignedLecturerName.toLowerCase().includes(search.toLowerCase()));
    const matchesDept = departmentFilter === 'All' || c.department === departmentFilter;
    return matchesSearch && matchesDept;
  });

  const handleAddCourse = async () => {
    if (!newCode || !newTitle) return;
    const prereqList = newPrereqs
      ? newPrereqs.split(',').map((p) => p.trim())
      : [];

    try {
      const created = await apiPost<Course>('/api/courses', {
        code: newCode,
        title: newTitle,
        sks: newSks,
        department: newDepartment,
        type: newType,
        prerequisites: prereqList,
        assignedLecturerName: newLecturer || 'Unassigned',
      });
      setCourses([...courses, created]);
      setShowAddModal(false);
      setNewCode('');
      setNewTitle('');
      setNewPrereqs('');
      toast.success('Course created');
    } catch (err) {
      console.error(err);
      toast.error('Failed to create course');
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
    <div className="space-y-6">
      {/* Header Bar & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl border border-[#c4c6cf] shadow-2xs">
        <h1 className="font-headline-lg text-[26px] text-[#191c1e] font-bold">
          Academic Course Directory
        </h1>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Search bar on left */}
          <div className="relative w-full sm:w-64">
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[16px] text-[#43474e]">
              search
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search code, title, instructor..."
              className="w-full bg-[#f2f4f6] border border-[#c4c6cf] rounded-md py-1.5 pl-8 pr-3 text-[12px] text-[#191c1e] focus:ring-1 focus:ring-[#002045] outline-none"
            />
          </div>

          {/* Department Filter */}
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="bg-[#f2f4f6] text-[12px] font-semibold text-[#191c1e] px-3 py-1.5 rounded-md border border-[#c4c6cf] focus:ring-1 focus:ring-[#002045] outline-none cursor-pointer"
          >
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>

          {/* Add Course button to the right of searchbar */}
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-[#002045] text-white px-4 py-2 rounded-lg font-semibold text-[12px] flex items-center gap-2 hover:bg-opacity-90 active:scale-95 transition-all shadow-sm cursor-pointer whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>Add Course</span>
          </button>
        </div>
      </div>

      {/* Course Table */}
      <div className="bg-white border border-[#c4c6cf] rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto custom-scrollbar">
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
              {filteredCourses.map((c, idx) => {
                const isEven = idx % 2 === 1;
                return (
                  <tr
                    key={c.id}
                    className={`${
                      isEven ? 'bg-[#f7f9fb]' : 'bg-white'
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
      </div>

      {/* Add Course Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 border border-[#c4c6cf] shadow-xl space-y-4">
            <h3 className="font-headline-sm text-[18px] text-[#191c1e]">New Course Specification</h3>
            <div className="grid grid-cols-2 gap-3 text-[13px]">
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
                <label className="block text-[#43474e] font-semibold mb-1">SKS Credits</label>
                <input
                  type="number"
                  value={newSks}
                  onChange={(e) => setNewSks(parseInt(e.target.value) || 2)}
                  className="w-full bg-[#f2f4f6] px-3 py-2 rounded border border-[#c4c6cf] outline-none"
                />
              </div>
              <div className="col-span-2">
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
                <label className="block text-[#43474e] font-semibold mb-1">Department</label>
                <select
                  value={newDepartment}
                  onChange={(e) => setNewDepartment(e.target.value)}
                  className="w-full bg-[#f2f4f6] px-3 py-2 rounded border border-[#c4c6cf] outline-none"
                >
                  <option value="Computer Science">Computer Science</option>
                  <option value="Theoretical Physics">Theoretical Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Data Science">Data Science</option>
                  <option value="Modern History">Modern History</option>
                </select>
              </div>
              <div>
                <label className="block text-[#43474e] font-semibold mb-1">Room Format</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as any)}
                  className="w-full bg-[#f2f4f6] px-3 py-2 rounded border border-[#c4c6cf] outline-none"
                >
                  <option value="LECTURE">LECTURE</option>
                  <option value="LAB">LAB</option>
                  <option value="SEMINAR">SEMINAR</option>
                  <option value="STUDIO">STUDIO</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-[#43474e] font-semibold mb-1">Assigned Instructor</label>
                <input
                  type="text"
                  placeholder="e.g. Prof. James Sterling"
                  value={newLecturer}
                  onChange={(e) => setNewLecturer(e.target.value)}
                  className="w-full bg-[#f2f4f6] px-3 py-2 rounded border border-[#c4c6cf] outline-none"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-[#43474e] font-semibold mb-1">
                  Prerequisites (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. CS-101, MAT-101"
                  value={newPrereqs}
                  onChange={(e) => setNewPrereqs(e.target.value)}
                  className="w-full bg-[#f2f4f6] px-3 py-2 rounded border border-[#c4c6cf] outline-none font-mono-code"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowAddModal(false)}
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
                <label className="block text-[#43474e] font-semibold mb-1">Instructor</label>
                <input
                  type="text"
                  value={editingCourse.assignedLecturerName || ''}
                  onChange={(e) =>
                    setEditingCourse({ ...editingCourse, assignedLecturerName: e.target.value })
                  }
                  className="w-full bg-[#f2f4f6] px-3 py-2 rounded border border-[#c4c6cf] outline-none"
                />
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
