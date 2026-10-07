import React, { useState } from 'react';
import { toast } from 'sonner';
import { Lecturer } from '../types';
import { generateExamGroups, INSTRUCTOR_WEIGHT } from '../utils/groupingSolver';
import { exportExamGroupsToExcel } from '../utils/exportExamGroups';

interface FinalExamsPageProps {
  lecturers: Lecturer[];
}


export function FinalExamsPage({ lecturers }: FinalExamsPageProps) {
  const [studentCount, setStudentCount] = useState('');
  const [instructorsPerGroup, setInstructorsPerGroup] = useState('2');
  const [examinersPerGroup, setExaminersPerGroup] = useState('3');
  const [instructorWeight, setInstructorWeight] = useState(String(INSTRUCTOR_WEIGHT));
  const [isGenerating, setIsGenerating] = useState(false);

  // ponytail: no field validation here. The solver owns every rule, so a bad
  // number reaches the same catch as an impossible panel size and the toast
  // says the actual problem.
  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const result = generateExamGroups(parseInt(studentCount, 10), lecturers.map((l) => l.name), {
        instructorsPerGroup: parseInt(instructorsPerGroup, 10),
        examinersPerGroup: parseInt(examinersPerGroup, 10),
        instructorWeight: parseInt(instructorWeight, 10),
      });
      const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
      await exportExamGroupsToExcel(result, `final-exam-groups-${stamp}.xlsx`);
      toast.success('Excel file downloaded');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to generate groups');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 h-full min-h-0">
      <div className="flex-1 flex items-center justify-center min-h-0 py-2">
        <div className="w-full bg-white rounded-2xl border border-[#e2e8f0] shadow-lg overflow-hidden grid grid-cols-1 lg:grid-cols-12 max-w-4xl">
          {/* Left Panel: Blue Background / Student Count */}
          <div className="lg:col-span-5 bg-[#001838] text-white p-6 flex flex-col justify-between relative overflow-hidden">
            <div className="relative z-10">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-blue-200 text-[11px] font-semibold uppercase tracking-wider backdrop-blur-md mb-4">
                <span className="material-symbols-outlined text-[14px]">groups</span>
                <span>Student Setup</span>
              </div>

              <h2 className="text-2xl font-bold tracking-tight text-white leading-tight mb-2">
                Student Count
              </h2>
              <p className="text-blue-100/70 text-xs leading-relaxed">
                Enter total number of students taking finals to calculate exam panel groups.
              </p>
            </div>

            <div className="my-4 relative z-10">
              <label htmlFor="student-count-input" className="block text-[11px] font-semibold uppercase tracking-wide text-blue-200 mb-1.5">
                Total Students
              </label>
              <div className="relative">
                <input
                  id="student-count-input"
                  type="number"
                  min={1}
                  value={studentCount}
                  onChange={(e) => setStudentCount(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                  placeholder="0"
                  aria-label="Number of students taking finals"
                  className="w-full bg-white/10 border-2 border-white/20 rounded-xl px-3.5 py-2.5 text-xl font-bold text-white placeholder-white/30 focus:border-white focus:bg-white/20 focus:ring-2 focus:ring-white/20 outline-none transition-all duration-200 shadow-inner"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-blue-200/60 pointer-events-none">
                  Students
                </span>
              </div>
              <p className="text-[11px] text-blue-200/80 mt-1.5 leading-tight">
                Total students taking finals (1 group per student).
              </p>
            </div>

            <div className="relative z-10 pt-3 border-t border-white/10 flex items-center gap-2 text-[11px] text-blue-200/70">
              <span className="material-symbols-outlined text-[16px] text-blue-400">info</span>
              <span>Calculates load balance across lecturers</span>
            </div>
          </div>

          {/* Right Panel: Configuration */}
          <div className="lg:col-span-7 p-6 bg-white flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[#002045] text-lg">tune</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#191c1e] leading-tight">Configuration</h2>
                  <p className="text-xs text-[#74777f]">
                    Adjust exam panel sizes and instructor weights
                  </p>
                </div>
              </div>

              <div className="h-px bg-gray-100 my-3" />

              <div className="space-y-3">
                <div>
                  <label htmlFor="instructors-input" className="block text-[11px] font-bold uppercase tracking-wider text-[#43474e] mb-1">
                    Instructors per Group
                  </label>
                  <input
                    id="instructors-input"
                    type="number"
                    min={1}
                    value={instructorsPerGroup}
                    onChange={(e) => setInstructorsPerGroup(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                    aria-label="Instructors per group"
                    className="w-full h-9 bg-[#f8fafc] border border-[#cbd5e1] rounded-lg px-3 text-sm text-[#191c1e] font-semibold focus:bg-white focus:border-[#002045] focus:ring-2 focus:ring-[#002045]/15 outline-none transition-all duration-200"
                  />
                  <p className="text-[11px] text-[#74777f] mt-0.5">
                    Instructor slots per group.
                  </p>
                </div>

                <div>
                  <label htmlFor="examiners-input" className="block text-[11px] font-bold uppercase tracking-wider text-[#43474e] mb-1">
                    Examiners per Group
                  </label>
                  <input
                    id="examiners-input"
                    type="number"
                    min={1}
                    value={examinersPerGroup}
                    onChange={(e) => setExaminersPerGroup(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                    aria-label="Examiners per group"
                    className="w-full h-9 bg-[#f8fafc] border border-[#cbd5e1] rounded-lg px-3 text-sm text-[#191c1e] font-semibold focus:bg-white focus:border-[#002045] focus:ring-2 focus:ring-[#002045]/15 outline-none transition-all duration-200"
                  />
                  <p className="text-[11px] text-[#74777f] mt-0.5">
                    Examiner slots per group.
                  </p>
                </div>

                <div>
                  <label htmlFor="weight-input" className="block text-[11px] font-bold uppercase tracking-wider text-[#43474e] mb-1">
                    Instructor to Examiners Weight Ratio
                  </label>
                  <input
                    id="weight-input"
                    type="number"
                    min={1}
                    value={instructorWeight}
                    onChange={(e) => setInstructorWeight(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                    aria-label="Instructor slot weight"
                    className="w-full h-9 bg-[#f8fafc] border border-[#cbd5e1] rounded-lg px-3 text-sm text-[#191c1e] font-semibold focus:bg-white focus:border-[#002045] focus:ring-2 focus:ring-[#002045]/15 outline-none transition-all duration-200"
                  />
                  <p className="text-[11px] text-[#74777f] mt-0.5">
                    Instructors works {instructorWeight} times harder than examiners
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-3 mt-3 border-t border-gray-100">
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full h-10 bg-[#002045] hover:bg-[#003166] text-white rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className={`material-symbols-outlined text-lg ${isGenerating ? 'animate-spin' : ''}`}>
                  {isGenerating ? 'progress_activity' : 'groups'}
                </span>
                <span>{isGenerating ? 'Generating...' : 'Generate Groups'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
