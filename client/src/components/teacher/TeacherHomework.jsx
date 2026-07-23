import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import {
  ClipboardList,
  Plus,
  Clock,
  ExternalLink,
  Loader2,
  AlertCircle,
  CheckCircle2,
  BookOpen,
  CheckSquare,
  Layers,
} from 'lucide-react';

export default function TeacherHomework() {
  const { subjectId } = useParams();
  const navigate = useNavigate();

  const [subjects, setSubjects] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState(subjectId || '');
  const [homeworkList, setHomeworkList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Assign Homework Modal State
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignForm, setAssignForm] = useState({
    title: '',
    description: '',
    due_date: '',
  });

  // Submissions Modal State
  const [activeHwSubmissions, setActiveHwSubmissions] = useState(null);
  const [submissionsList, setSubmissionsList] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [gradeInputMap, setGradeInputMap] = useState({});

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (subjectId) {
      setSelectedSubjectId(subjectId);
      fetchHomework(subjectId);
    } else if (subjects.length > 0 && !selectedSubjectId) {
      setSelectedSubjectId(subjects[0].id.toString());
      navigate(`/teacher/dashboard/homework/${subjects[0].id}`, { replace: true });
    }
  }, [subjectId, subjects]);

  const fetchSubjects = async () => {
    setLoadingSubjects(true);
    try {
      const res = await axiosInstance.get('/subjects/my-subjects');
      const list = res.data.subjects || [];
      setSubjects(list);
      if (list.length > 0 && !subjectId) {
        setSelectedSubjectId(list[0].id.toString());
        navigate(`/teacher/dashboard/homework/${list[0].id}`, { replace: true });
      }
    } catch (err) {
      console.error('Fetch Subjects Error:', err);
      setError(err.response?.data?.error || 'Failed to load assigned subjects.');
    } finally {
      setLoadingSubjects(false);
    }
  };

  const fetchHomework = async (sId) => {
    setLoading(true);
    setError('');
    try {
      const res = await axiosInstance.get(`/homework/subject/${sId}`);
      setHomeworkList(res.data.homework || []);
    } catch (err) {
      console.error('Fetch Homework Error:', err);
      setError(err.response?.data?.error || 'Failed to load homework assignments.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubjectChange = (newSubId) => {
    setSelectedSubjectId(newSubId);
    navigate(`/teacher/dashboard/homework/${newSubId}`);
  };

  const handleCreateHomework = async (e) => {
    e.preventDefault();
    if (!assignForm.title.trim() || !assignForm.due_date || !selectedSubjectId) return;

    setSubmitting(true);
    setError('');
    setSuccessMsg('');

    try {
      await axiosInstance.post('/homework', {
        subject_id: parseInt(selectedSubjectId, 10),
        title: assignForm.title.trim(),
        description: assignForm.description.trim(),
        due_date: assignForm.due_date,
      });

      setSuccessMsg('Homework task created successfully!');
      setAssignForm({ title: '', description: '', due_date: '' });
      setShowAssignModal(false);
      fetchHomework(selectedSubjectId);
    } catch (err) {
      console.error('Create Homework Error:', err);
      setError(err.response?.data?.error || 'Failed to create homework task.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenSubmissions = async (hw) => {
    setActiveHwSubmissions(hw);
    setLoadingSubmissions(true);
    setError('');
    try {
      const res = await axiosInstance.get(`/homework/${hw.id}/submissions`);
      const subs = res.data.submissions || [];
      setSubmissionsList(subs);

      // Pre-fill existing scores into input map
      const map = {};
      subs.forEach((s) => {
        if (s.score !== null) map[s.submission_id] = s.score;
      });
      setGradeInputMap(map);
    } catch (err) {
      console.error('Fetch Submissions Error:', err);
      setError(err.response?.data?.error || 'Failed to fetch student submissions.');
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const handleGradeSubmission = async (submissionId) => {
    const scoreVal = gradeInputMap[submissionId];
    if (scoreVal === undefined || scoreVal === '') {
      setError('Please enter a valid numeric score');
      return;
    }

    setError('');
    try {
      await axiosInstance.put(`/homework/submissions/${submissionId}/grade`, {
        score: parseFloat(scoreVal),
      });

      // Update state locally
      setSubmissionsList((prev) =>
        prev.map((sub) =>
          sub.submission_id === submissionId
            ? { ...sub, score: parseFloat(scoreVal), status: 'graded' }
            : sub
        )
      );
      setSuccessMsg('Student submission graded successfully.');
    } catch (err) {
      console.error('Grade Submission Error:', err);
      setError(err.response?.data?.error || 'Failed to update grade.');
    }
  };

  if (loadingSubjects) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mb-2" />
        <p className="text-xs">Loading assigned subjects...</p>
      </div>
    );
  }

  if (subjects.length === 0) {
    return (
      <div className="space-y-6 animate-fadeIn">
        <div className="pb-4 border-b border-slate-200/80">
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Homework Management
          </h2>
        </div>
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 p-8 space-y-2">
          <Layers className="w-12 h-12 text-amber-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">
            You haven't been assigned to any subjects yet.
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Please contact your administrator to be assigned to course subjects and start assigning homework.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Title & Subject Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Homework Management
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Create tasks for assigned subjects, set due dates, review submissions, and enter grades.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {subjects.length > 0 && (
            <div className="flex items-center space-x-2">
              <BookOpen className="w-4 h-4 text-slate-400" />
              <select
                value={selectedSubjectId}
                onChange={(e) => handleSubjectChange(e.target.value)}
                className="py-2 px-3 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.class_name || 'Class'})
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={() => setShowAssignModal(true)}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center space-x-1.5 transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Assign Homework</span>
          </button>
        </div>
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

      {/* Homework List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mb-2" />
          <p className="text-xs">Loading homework assignments...</p>
        </div>
      ) : homeworkList.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 p-8">
          <ClipboardList className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">No Homework Assigned Yet</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            Click "+ Assign Homework" to create the first assignment for this subject.
          </p>
          <button
            onClick={() => setShowAssignModal(true)}
            className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-600/20"
          >
            + Assign Homework
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {homeworkList.map((hw) => (
            <div
              key={hw.id}
              className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="space-y-2 max-w-xl">
                <div className="flex items-center space-x-3">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Subject #{selectedSubjectId}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Due Date: {new Date(hw.due_date).toLocaleDateString()}</span>
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900">{hw.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {hw.description || 'No description provided.'}
                </p>
              </div>

              <div className="flex items-center space-x-3 shrink-0">
                <button
                  onClick={() => handleOpenSubmissions(hw)}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 flex items-center space-x-2 transition-all"
                >
                  <CheckSquare className="w-4 h-4" />
                  <span>Review Submissions & Grade</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal 1: Assign Homework Form */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Assign New Homework</h3>

            <form onSubmit={handleCreateHomework} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Assignment Title
                </label>
                <input
                  type="text"
                  required
                  value={assignForm.title}
                  onChange={(e) => setAssignForm({ ...assignForm, title: e.target.value })}
                  placeholder="e.g. Worksheet #4 - Differential Equations"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Description / Instructions
                </label>
                <textarea
                  rows="3"
                  value={assignForm.description}
                  onChange={(e) => setAssignForm({ ...assignForm, description: e.target.value })}
                  placeholder="Provide problem statements, instructions, or reading requirements..."
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Submission Due Date
                </label>
                <input
                  type="date"
                  required
                  value={assignForm.due_date}
                  onChange={(e) => setAssignForm({ ...assignForm, due_date: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 disabled:opacity-60 flex items-center space-x-1.5"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Publish Homework</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Review Submissions Modal */}
      {activeHwSubmissions && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                  Submissions Review
                </span>
                <h3 className="text-lg font-bold text-slate-900">{activeHwSubmissions.title}</h3>
              </div>
              <button
                onClick={() => setActiveHwSubmissions(null)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100"
              >
                Close
              </button>
            </div>

            {loadingSubmissions ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mb-2" />
                <p className="text-xs">Fetching student submissions...</p>
              </div>
            ) : submissionsList.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                No student submissions submitted yet for this homework.
              </div>
            ) : (
              <div className="space-y-4">
                {submissionsList.map((sub) => (
                  <div
                    key={sub.submission_id}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-bold text-sm text-slate-900">{sub.student_name}</h4>
                        <span className="text-[10px] text-slate-400">({sub.student_email})</span>
                      </div>

                      <div className="flex items-center space-x-3 text-xs text-slate-500">
                        <span>Status: <strong className="capitalize">{sub.status}</strong></span>
                        <span>•</span>
                        <span>
                          Submitted:{' '}
                          {sub.submitted_at
                            ? new Date(sub.submitted_at).toLocaleString()
                            : 'N/A'}
                        </span>
                      </div>

                      {sub.file_url && (
                        <a
                          href={sub.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-1 text-xs text-indigo-600 hover:underline font-semibold mt-1"
                        >
                          <span>View Submitted Link</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>

                    {/* Grading Form Controls */}
                    <div className="flex items-center space-x-2 shrink-0 bg-white p-2 rounded-xl border border-slate-200">
                      <label className="text-xs font-semibold text-slate-600">Score:</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        placeholder="0-100"
                        value={gradeInputMap[sub.submission_id] || ''}
                        onChange={(e) =>
                          setGradeInputMap({
                            ...gradeInputMap,
                            [sub.submission_id]: e.target.value,
                          })
                        }
                        className="w-20 px-2 py-1 rounded-lg border border-slate-300 text-xs text-center font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <button
                        onClick={() => handleGradeSubmission(sub.submission_id)}
                        className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
