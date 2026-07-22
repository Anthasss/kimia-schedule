import React, { useState } from 'react';
import { LECTURER_COLORS } from '../constants';

interface ModalsProps {
  showNewRecordModal: boolean;
  setShowNewRecordModal: (val: boolean) => void;
  initialRecordType?: string;
  onAddRoom: (data: { name: string }) => void;
  onAddLecturer: (data: { name: string; color: string }) => void;
  onAddBreak: (data: { name: string; startTime: string; endTime: string }) => void;
  showReportModal: boolean;
  setShowReportModal: (val: boolean) => void;
  showExportModal: boolean;
  setShowExportModal: (val: boolean) => void;
  showSettingsModal: boolean;
  setShowSettingsModal: (val: boolean) => void;
  roomsCount: number;
  lecturersCount: number;
}

export const Modals: React.FC<ModalsProps> = ({
  showNewRecordModal,
  setShowNewRecordModal,
  initialRecordType = 'Room',
  onAddRoom,
  onAddLecturer,
  onAddBreak,
  showReportModal,
  setShowReportModal,
  showExportModal,
  setShowExportModal,
  showSettingsModal,
  setShowSettingsModal,
  roomsCount,
  lecturersCount,
}) => {
  const [roomName, setRoomName] = useState('');
  const [lecturerName, setLecturerName] = useState('');

  const [breakName, setBreakName] = useState('');
  const [breakStart, setBreakStart] = useState('10:00');
  const [breakEnd, setBreakEnd] = useState('10:30');

  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [reportData, setReportData] = useState<any>(null);

  const handleCreateRecord = () => {
    if (initialRecordType === 'Room') {
      if (!roomName) return;
      onAddRoom({ name: roomName });
    } else if (initialRecordType === 'Lecturer') {
      if (!lecturerName) return;
      onAddLecturer({
        name: lecturerName,
        color: LECTURER_COLORS[Math.floor(Math.random() * LECTURER_COLORS.length)],
      });
    } else if (initialRecordType === 'Break Time') {
      if (!breakName) return;
      onAddBreak({
        name: breakName,
        startTime: breakStart,
        endTime: breakEnd,
      });
    }

    setShowNewRecordModal(false);
    setRoomName('');
    setLecturerName('');
    setBreakName('');
  };

  const handleFetchAiReport = async () => {
    setIsGeneratingReport(true);
    try {
      const res = await fetch('/api/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomsCount,
          lecturersCount,
          utilizationRate: 84,
        }),
      });
      const data = await res.json();
      setReportData(data);
    } catch (err) {
      console.error('Report fetch error:', err);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleDownloadCsv = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,Type,Name\nRoom,Auditorium A-101\nLecturer,Prof. James Sterling\n';
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'UniSched_Institutional_Data.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowExportModal(false);
  };

  return (
    <>
      {/* New Record Modal */}
      {showNewRecordModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 border border-[#c4c6cf] shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b border-[#c4c6cf] pb-3">
              <h3 className="font-headline-sm text-[18px] text-[#191c1e] font-bold">
                {initialRecordType === 'Room' && 'Add Room'}
                {initialRecordType === 'Lecturer' && 'Add Lecturer'}
                {initialRecordType === 'Break Time' && 'Add Break Time'}
              </h3>
              <button
                onClick={() => setShowNewRecordModal(false)}
                className="text-[#74777f] hover:text-[#191c1e] cursor-pointer text-[18px]"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-[13px]">
              {/* Room Form */}
              {initialRecordType === 'Room' && (
                <div className="space-y-3">
                  <div>
                    <label className="block font-semibold text-[#43474e] mb-1">
                      Room Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Room L-204"
                      value={roomName}
                      onChange={(e) => setRoomName(e.target.value)}
                      className="w-full bg-[#f2f4f6] px-3 py-2 rounded border border-[#c4c6cf] outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Lecturer Form */}
              {initialRecordType === 'Lecturer' && (
                <div className="space-y-3">
                  <div>
                    <label className="block font-semibold text-[#43474e] mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Dr. Emily Vance"
                      value={lecturerName}
                      onChange={(e) => setLecturerName(e.target.value)}
                      className="w-full bg-[#f2f4f6] px-3 py-2 rounded border border-[#c4c6cf] outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Break Time Form */}
              {initialRecordType === 'Break Time' && (
                <div className="space-y-3">
                  <div>
                    <label className="block font-semibold text-[#43474e] mb-1">
                      Break Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Midday Prayer Break"
                      value={breakName}
                      onChange={(e) => setBreakName(e.target.value)}
                      className="w-full bg-[#f2f4f6] px-3 py-2 rounded border border-[#c4c6cf] outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-[#43474e] mb-1">
                        Start Time
                      </label>
                      <input
                        type="time"
                        value={breakStart}
                        onChange={(e) => setBreakStart(e.target.value)}
                        className="w-full bg-[#f2f4f6] px-3 py-2 rounded border border-[#c4c6cf] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-[#43474e] mb-1">
                        End Time
                      </label>
                      <input
                        type="time"
                        value={breakEnd}
                        onChange={(e) => setBreakEnd(e.target.value)}
                        className="w-full bg-[#f2f4f6] px-3 py-2 rounded border border-[#c4c6cf] outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#c4c6cf]">
              <button
                onClick={() => setShowNewRecordModal(false)}
                className="px-4 py-2 rounded text-[13px] text-[#43474e] hover:bg-[#f2f4f6] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateRecord}
                className="px-4 py-2 bg-[#002045] text-white rounded text-[13px] font-semibold hover:bg-opacity-90 cursor-pointer shadow-xs"
              >
                {initialRecordType === 'Room' && 'Add Room'}
                {initialRecordType === 'Lecturer' && 'Add Lecturer'}
                {initialRecordType === 'Break Time' && 'Add Break Time'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Generate Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl max-w-xl w-full p-6 border border-[#c4c6cf] shadow-xl space-y-4 max-h-[85vh] overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center border-b border-[#c4c6cf] pb-3">
              <h3 className="font-headline-sm text-[18px] text-[#191c1e] font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-[#002045]">assessment</span>
                Institutional Audit & Logistics Report
              </h3>
              <button
                onClick={() => setShowReportModal(false)}
                className="text-[#74777f] hover:text-[#191c1e] cursor-pointer text-[18px]"
              >
                ✕
              </button>
            </div>

            {!reportData && !isGeneratingReport && (
              <div className="text-center py-6 space-y-4">
                <p className="text-[13px] text-[#43474e]">
                  Click below to generate a real-time academic logistics audit analyzing room utilization, lecturer credits, and schedule integrity.
                </p>
                <button
                  onClick={handleFetchAiReport}
                  className="px-5 py-2.5 bg-[#002045] text-white font-semibold text-[13px] rounded-lg shadow-sm hover:bg-opacity-90 transition-all flex items-center gap-2 mx-auto cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                  <span>Generate Report</span>
                </button>
              </div>
            )}

            {isGeneratingReport && (
              <div className="text-center py-8 space-y-3">
                <span className="material-symbols-outlined text-[36px] text-[#002045] animate-spin">
                  autorenew
                </span>
                <p className="text-[13px] font-semibold text-[#191c1e]">
                  Generating Executive Logistics Report...
                </p>
              </div>
            )}

            {reportData && (
              <div className="space-y-4 text-[13px]">
                <div className="p-4 bg-[#f2f4f6] rounded-lg border border-[#c4c6cf]">
                  <h4 className="font-bold text-[15px] text-[#002045]">
                    {reportData.reportTitle || 'Academic Resource Audit'}
                  </h4>
                  <p className="text-[#43474e] mt-1 leading-relaxed">
                    {reportData.executiveSummary}
                  </p>
                </div>

                <div>
                  <h5 className="font-bold text-[#191c1e] text-[13px] mb-1">Key Findings</h5>
                  <ul className="list-disc pl-5 space-y-1 text-[#43474e]">
                    {reportData.keyFindings?.map((kf: string, i: number) => (
                      <li key={i}>{kf}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h5 className="font-bold text-[#191c1e] text-[13px] mb-1">
                    Institutional Recommendations
                  </h5>
                  <ul className="list-disc pl-5 space-y-1 text-[#43474e]">
                    {reportData.recommendations?.map((rec: string, i: number) => (
                      <li key={i}>{rec}</li>
                    ))}
                  </ul>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    onClick={() => window.print()}
                    className="px-4 py-2 border border-[#c4c6cf] text-[#191c1e] font-semibold rounded text-[12px] hover:bg-[#f2f4f6] flex items-center gap-1.5 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">print</span>
                    <span>Print Report</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Export Data Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl max-w-md w-full p-6 border border-[#c4c6cf] shadow-xl space-y-4">
            <h3 className="font-headline-sm text-[18px] text-[#191c1e] font-bold">
              Export Institutional Data
            </h3>
            <p className="text-[13px] text-[#43474e]">
              Download master records including faculty rosters, room allocations, and draft schedules.
            </p>

            <div className="space-y-2">
              <button
                onClick={handleDownloadCsv}
                className="w-full py-2.5 bg-[#002045] text-white rounded-lg font-semibold text-[13px] flex items-center justify-center gap-2 hover:bg-opacity-90 transition-all cursor-pointer shadow-xs"
              >
                <span className="material-symbols-outlined text-[18px]">table_chart</span>
                <span>Export as CSV Spreadsheet</span>
              </button>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowExportModal(false)}
                className="px-4 py-1.5 text-[12px] text-[#43474e] hover:bg-[#f2f4f6] rounded cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl max-w-md w-full p-6 border border-[#c4c6cf] shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b border-[#c4c6cf] pb-3">
              <h3 className="font-headline-sm text-[18px] text-[#191c1e] font-bold">
                Global Preferences
              </h3>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="text-[#74777f] hover:text-[#191c1e] cursor-pointer text-[18px]"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-[13px]">
              <div>
                <label className="block font-semibold text-[#191c1e] mb-1">
                  Academic Year Cycle
                </label>
                <input
                  type="text"
                  value="Academic Year 2024/2025"
                  readOnly
                  className="w-full bg-[#f2f4f6] px-3 py-2 rounded border border-[#c4c6cf] text-[#43474e]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#191c1e] mb-1">
                  Time Zone & Schedule Alignment
                </label>
                <input
                  type="text"
                  value="UTC+07:00 (Western Indonesian Time / WIB)"
                  readOnly
                  className="w-full bg-[#f2f4f6] px-3 py-2 rounded border border-[#c4c6cf] text-[#43474e]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#191c1e] mb-1">
                  Default SKS Duration
                </label>
                <input
                  type="text"
                  value="50 Minutes per SKS Unit"
                  readOnly
                  className="w-full bg-[#f2f4f6] px-3 py-2 rounded border border-[#c4c6cf] text-[#43474e]"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowSettingsModal(false)}
                className="px-4 py-2 bg-[#002045] text-white rounded text-[12px] font-semibold cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
