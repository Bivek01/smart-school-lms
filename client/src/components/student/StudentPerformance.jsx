import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import {
  BarChart3,
  Award,
  BookOpen,
  Calendar,
  FileText,
  Loader2,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';

export default function StudentPerformance() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('ALL');

  useEffect(() => {
    fetchPerformanceReports();
  }, []);

  const fetchPerformanceReports = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axiosInstance.get('/performance/my-performance');
      setReports(res.data.reports || []);
    } catch (err) {
      console.error('Fetch Performance Error:', err);
      setError('Failed to fetch performance evaluation reports.');
    } finally {
      setLoading(false);
    }
  };

  // Get unique subjects for filtering
  const uniqueSubjects = Array.from(new Set(reports.map((r) => r.subject_name))).filter(Boolean);

  const filteredReports =
    selectedSubjectFilter === 'ALL'
      ? reports
      : reports.filter((r) => r.subject_name === selectedSubjectFilter);

  const getScoreColor = (score) => {
    const val = parseFloat(score);
    if (val >= 85) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (val >= 70) return 'text-indigo-600 bg-indigo-50 border-indigo-200';
    if (val >= 50) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-rose-600 bg-rose-50 border-rose-200';
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Title & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Performance & Evaluations
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Review your score records, teacher evaluation feedback, and grade metrics.
          </p>
        </div>

        {uniqueSubjects.length > 0 && (
          <div className="flex items-center space-x-2">
            <BookOpen className="w-4 h-4 text-slate-400" />
            <select
              value={selectedSubjectFilter}
              onChange={(e) => setSelectedSubjectFilter(e.target.value)}
              className="py-2 px-3 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
            >
              <option value="ALL">All Subjects</option>
              {uniqueSubjects.map((s, idx) => (
                <option key={idx} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-2" />
          <p className="text-xs">Loading performance reports...</p>
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 p-8">
          <Award className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">No Reports Available</h3>
          <p className="text-xs text-slate-500 mt-1">
            Evaluation reports added by teachers will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredReports.map((report) => {
            const scoreVal = parseFloat(report.score);
            const scoreStyle = getScoreColor(scoreVal);

            return (
              <div
                key={report.id}
                className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider">
                      {report.subject_name}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{new Date(report.date).toLocaleDateString()}</span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-4 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Evaluation Score
                    </span>
                    <span
                      className={`text-xl font-extrabold px-3 py-0.5 rounded-xl border ${scoreStyle}`}
                    >
                      {scoreVal} / 100
                    </span>
                  </div>

                  {/* Progress visual bar */}
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden mb-4">
                    <div
                      className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(scoreVal, 100)}%` }}
                    />
                  </div>

                  {/* Notes / Instructor Feedback */}
                  {report.notes && (
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-600 space-y-1">
                      <span className="font-bold text-slate-700 block">Teacher Notes:</span>
                      <p className="italic leading-relaxed">"{report.notes}"</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
