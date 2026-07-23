import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import {
  Award,
  BookOpen,
  User,
  Plus,
  Calendar,
  Loader2,
  AlertCircle,
  CheckCircle2,
  FileText,
  Layers,
} from 'lucide-react';

export default function TeacherPerformance() {
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');

  const [reports, setReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(true);

  // Add Report Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [reportForm, setReportForm] = useState({
    student_id: '',
    subject_id: '',
    score: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedStudentId) {
      fetchStudentReports(selectedStudentId, selectedSubjectId);
    }
  }, [selectedStudentId, selectedSubjectId]);

  const fetchInitialData = async () => {
    setLoadingInitial(true);
    setError('');
    try {
      const [studRes, subjRes] = await Promise.all([
        axiosInstance.get('/users/students'),
        axiosInstance.get('/subjects/my-subjects'),
      ]);

      const studList = studRes.data.students || [];
      const subjList = subjRes.data.subjects || [];

      setStudents(studList);
      setSubjects(subjList);

      if (studList.length > 0) {
        setSelectedStudentId(studList[0].id.toString());
      }
    } catch (err) {
      console.error('Fetch Teacher Initial Data Error:', err);
      setError(err.response?.data?.error || 'Failed to load initial data.');
    } finally {
      setLoadingInitial(false);
    }
  };

  const fetchStudentReports = async (studentId, subjectIdFilter) => {
    setLoadingReports(true);
    setError('');
    try {
      let url = `/performance/student/${studentId}`;
      if (subjectIdFilter) {
        url += `?subject_id=${subjectIdFilter}`;
      }
      const res = await axiosInstance.get(url);
      setReports(res.data.reports || []);
    } catch (err) {
      console.error('Fetch Student Reports Error:', err);
      setError(err.response?.data?.error || 'Failed to fetch performance reports for this student.');
    } finally {
      setLoadingReports(false);
    }
  };

  const handleCreateReport = async (e) => {
    e.preventDefault();
    if (!reportForm.student_id || !reportForm.subject_id || !reportForm.score || !reportForm.date) {
      setError('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccessMsg('');

    try {
      await axiosInstance.post('/performance', {
        student_id: parseInt(reportForm.student_id, 10),
        subject_id: parseInt(reportForm.subject_id, 10),
        score: parseFloat(reportForm.score),
        date: reportForm.date,
        notes: reportForm.notes.trim(),
      });

      setSuccessMsg('Performance evaluation report recorded successfully!');
      setReportForm({
        student_id: '',
        subject_id: '',
        score: '',
        date: new Date().toISOString().split('T')[0],
        notes: '',
      });
      setShowAddModal(false);

      if (selectedStudentId === reportForm.student_id) {
        fetchStudentReports(selectedStudentId, selectedSubjectId);
      } else {
        setSelectedStudentId(reportForm.student_id);
      }
    } catch (err) {
      console.error('Create Report Error:', err);
      setError(err.response?.data?.error || 'Failed to record performance report.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingInitial) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mb-2" />
        <p className="text-xs">Loading assigned subjects and student roster...</p>
      </div>
    );
  }

  if (subjects.length === 0) {
    return (
      <div className="space-y-6 animate-fadeIn">
        <div className="pb-4 border-b border-slate-200/80">
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Performance & Evaluation Reports
          </h2>
        </div>
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 p-8 space-y-2">
          <Layers className="w-12 h-12 text-amber-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">
            You haven't been assigned to any subjects yet.
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Please contact your administrator to be assigned to course subjects and start recording student evaluation reports.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Performance & Evaluation Reports
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Issue performance scores, grade notes, and view student evaluation records.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center space-x-1.5 transition-all shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Performance Report</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm flex items-center space-x-2">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Filter Selectors Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Student Selector */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center space-x-3">
          <User className="w-5 h-5 text-indigo-600 shrink-0" />
          <div className="flex-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
              Select Student Roster
            </label>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {students.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.name} ({st.email})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Subject Filter Selector */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center space-x-3">
          <BookOpen className="w-5 h-5 text-emerald-600 shrink-0" />
          <div className="flex-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
              Filter by Subject (Optional)
            </label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">All Assigned Subjects</option>
              {subjects.map((sb) => (
                <option key={sb.id} value={sb.id}>
                  {sb.name} ({sb.class_name || 'Class'})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Reports Display List */}
      {loadingReports ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mb-2" />
          <p className="text-xs">Fetching student performance reports...</p>
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 p-8">
          <Award className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">No Evaluation Reports Found</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            No evaluation records recorded for the selected student and subject filter.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-600/20"
          >
            + Create New Report
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reports.map((rep) => (
            <div
              key={rep.id}
              className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider">
                    {rep.subject_name}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(rep.date).toLocaleDateString()}</span>
                  </span>
                </div>

                <div className="flex items-center justify-between mt-4 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Recorded Score
                  </span>
                  <span className="text-xl font-extrabold px-3 py-0.5 rounded-xl border bg-emerald-50 text-emerald-700 border-emerald-200">
                    {rep.score} / 100
                  </span>
                </div>

                {/* Score bar */}
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden mb-4">
                  <div
                    className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(rep.score, 100)}%` }}
                  />
                </div>

                {/* Notes */}
                {rep.notes && (
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-600 space-y-1">
                    <span className="font-bold text-slate-700 block">Feedback / Notes:</span>
                    <p className="italic leading-relaxed">"{rep.notes}"</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: New Report */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">New Performance Report</h3>

            <form onSubmit={handleCreateReport} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Select Student *
                </label>
                <select
                  required
                  value={reportForm.student_id}
                  onChange={(e) => setReportForm({ ...reportForm, student_id: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Select a student...</option>
                  {students.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.name} ({st.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Select Assigned Subject *
                </label>
                <select
                  required
                  value={reportForm.subject_id}
                  onChange={(e) => setReportForm({ ...reportForm, subject_id: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Select a subject...</option>
                  {subjects.map((sb) => (
                    <option key={sb.id} value={sb.id}>
                      {sb.name} ({sb.class_name || 'Class'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Evaluation Score (0 - 100) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  max="100"
                  step="0.1"
                  value={reportForm.score}
                  onChange={(e) => setReportForm({ ...reportForm, score: e.target.value })}
                  placeholder="e.g. 88.5"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Evaluation Date *
                </label>
                <input
                  type="date"
                  required
                  value={reportForm.date}
                  onChange={(e) => setReportForm({ ...reportForm, date: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Teacher Notes / Performance Comments
                </label>
                <textarea
                  rows="3"
                  value={reportForm.notes}
                  onChange={(e) => setReportForm({ ...reportForm, notes: e.target.value })}
                  placeholder="e.g. Excellent grasp of concepts in practical lab sessions."
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 disabled:opacity-60 flex items-center space-x-1.5"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Record Evaluation</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
