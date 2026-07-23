import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import {
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertCircle,
  PieChart,
} from 'lucide-react';

export default function StudentAttendance() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [attendanceData, setAttendanceData] = useState({
    total_classes: 0,
    present_classes: 0,
    absent_classes: 0,
    attendance_percentage: 0,
    records: [],
  });

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axiosInstance.get('/attendance/my-attendance');
      setAttendanceData(res.data);
    } catch (err) {
      console.error('Fetch Attendance Error:', err);
      setError(err.response?.data?.error || 'Failed to fetch attendance records.');
    } finally {
      setLoading(false);
    }
  };

  const percentage = attendanceData.attendance_percentage || 0;
  const isCompliant = percentage >= 75;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Title */}
      <div className="pb-4 border-b border-slate-200/80">
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Attendance Status
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Monitor your overall attendance compliance percentage and daily records.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Prominent Attendance Metric Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Percentage Gauge */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-600 to-purple-700 text-white shadow-xl shadow-indigo-600/20 md:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-200">
                Overall Attendance Percentage
              </span>
              <span
                className={`text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider ${
                  isCompliant ? 'bg-emerald-400 text-emerald-950' : 'bg-rose-400 text-rose-950'
                }`}
              >
                {isCompliant ? 'Compliant (≥ 75%)' : 'Shortage Warning (< 75%)'}
              </span>
            </div>

            <div className="flex items-baseline space-x-3 mb-4">
              <span className="text-5xl sm:text-6xl font-black tracking-tight">{percentage}%</span>
              <span className="text-xs text-indigo-200">
                ({attendanceData.present_classes} present out of {attendanceData.total_classes} total classes)
              </span>
            </div>

            {/* Custom Progress Bar */}
            <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  isCompliant ? 'bg-emerald-400' : 'bg-rose-400'
                }`}
                style={{ width: `${Math.min(percentage, 100)}%` }}
              />
            </div>
          </div>

          <p className="text-xs text-indigo-100/80 mt-6 pt-4 border-t border-white/10">
            {isCompliant
              ? 'Great job! Your attendance satisfies institutional requirements.'
              : 'Attention: Please attend upcoming lectures to raise your attendance percentage.'}
          </p>
        </div>

        {/* Breakdown Card */}
        <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Classes Summary</h3>
            <PieChart className="w-5 h-5 text-slate-400" />
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-slate-50 flex items-center justify-between">
              <span className="text-xs text-slate-600 font-medium">Total Conducted</span>
              <span className="text-base font-bold text-slate-900">
                {attendanceData.total_classes}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-100 flex items-center justify-between text-emerald-800">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-semibold">Attended (Present)</span>
              </div>
              <span className="text-base font-bold text-emerald-700">
                {attendanceData.present_classes}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-rose-50/70 border border-rose-100 flex items-center justify-between text-rose-800">
              <div className="flex items-center space-x-2">
                <XCircle className="w-4 h-4 text-rose-600" />
                <span className="text-xs font-semibold">Missed (Absent)</span>
              </div>
              <span className="text-base font-bold text-rose-700">
                {attendanceData.absent_classes}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance History Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900">Attendance Log</h3>
          <p className="text-xs text-slate-500 mt-0.5">Chronological record of marked sessions</p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-2" />
            <p className="text-xs">Loading attendance log...</p>
          </div>
        ) : attendanceData.records.length === 0 ? (
          <div className="text-center py-16 p-8">
            <CalendarCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h4 className="text-base font-bold text-slate-700">No Attendance Recorded</h4>
            <p className="text-xs text-slate-500 mt-1">
              Attendance records will appear here once marked by your teachers.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Subject</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {attendanceData.records.map((rec) => {
                  const isPresent = rec.status === 'present';
                  return (
                    <tr key={rec.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900">
                        {new Date(rec.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-800">
                        {rec.subject_name}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                            isPresent
                              ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-100 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {isPresent ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Present</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3" />
                              <span>Absent</span>
                            </>
                          )}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
