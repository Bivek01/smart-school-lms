import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  Upload,
  ExternalLink,
  Loader2,
  AlertCircle,
  BookOpen,
  Layers,
} from 'lucide-react';

export default function StudentHomework() {
  const { subjectId } = useParams();
  const navigate = useNavigate();

  const [subjects, setSubjects] = useState([]);
  const [classInfo, setClassInfo] = useState({ class_id: null, message: '' });
  const [selectedSubjectId, setSelectedSubjectId] = useState(subjectId || '');
  const [homeworkList, setHomeworkList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [error, setError] = useState('');

  // Submit Modal / Form State
  const [activeModalHw, setActiveModalHw] = useState(null);
  const [fileUrlInput, setFileUrlInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState('');

  useEffect(() => {
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (subjectId) {
      setSelectedSubjectId(subjectId);
      fetchHomework(subjectId);
    } else if (subjects.length > 0 && !selectedSubjectId) {
      setSelectedSubjectId(subjects[0].id.toString());
      navigate(`/student/dashboard/homework/${subjects[0].id}`, { replace: true });
    }
  }, [subjectId, subjects]);

  const fetchSubjects = async () => {
    setLoadingSubjects(true);
    try {
      const res = await axiosInstance.get('/subjects/my-class');
      const list = res.data.subjects || [];
      setSubjects(list);
      setClassInfo({
        class_id: res.data.class_id || null,
        message: res.data.message || '',
      });
      if (list.length > 0 && !subjectId) {
        setSelectedSubjectId(list[0].id.toString());
        navigate(`/student/dashboard/homework/${list[0].id}`, { replace: true });
      }
    } catch (err) {
      console.error('Fetch Subjects Error:', err);
      setError(err.response?.data?.error || 'Failed to load subjects for homework filtering.');
    } finally {
      setLoadingSubjects(false);
    }
  };

  const fetchHomework = async (sId) => {
    setLoading(true);
    setError('');
    try {
      const res = await axiosInstance.get(`/homework/subject/${sId}/my-status`);
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
    navigate(`/student/dashboard/homework/${newSubId}`);
  };

  const handleOpenSubmitModal = (hw) => {
    setActiveModalHw(hw);
    setFileUrlInput(hw.submission_file_url || '');
    setSubmitMsg('');
    setError('');
  };

  const handleSubmitHomework = async (e) => {
    e.preventDefault();
    if (!fileUrlInput.trim()) {
      setError('Please enter a valid file URL for your submission');
      return;
    }

    setSubmitting(true);
    setError('');
    setSubmitMsg('');

    try {
      await axiosInstance.post('/homework/submit', {
        homework_id: activeModalHw.id,
        file_url: fileUrlInput.trim(),
      });

      setSubmitMsg('Homework submitted successfully!');
      setTimeout(() => {
        setActiveModalHw(null);
        setFileUrlInput('');
        fetchHomework(selectedSubjectId);
      }, 1000);
    } catch (err) {
      console.error('Submit Homework Error:', err);
      setError(err.response?.data?.error || 'Failed to submit homework.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingSubjects) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-2" />
        <p className="text-xs">Loading class subjects...</p>
      </div>
    );
  }

  if (!classInfo.class_id) {
    return (
      <div className="space-y-6 animate-fadeIn">
        <div className="pb-4 border-b border-slate-200/80">
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Homework & Assignments
          </h2>
        </div>
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 p-8 space-y-2">
          <Layers className="w-12 h-12 text-amber-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">
            You haven't been assigned to a class yet.
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Please contact your school administrator to be assigned to your class and view assigned homework tasks.
          </p>
        </div>
      </div>
    );
  }

  if (subjects.length === 0) {
    return (
      <div className="space-y-6 animate-fadeIn">
        <div className="pb-4 border-b border-slate-200/80">
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Homework & Assignments
          </h2>
        </div>
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 p-8 space-y-2">
          <BookOpen className="w-12 h-12 text-indigo-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">
            No Course Subjects Available Yet
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            You are assigned to your class, but no subjects have been created for your class yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Homework & Assignments
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            View assigned tasks, due dates, submit solution links, and view grades.
          </p>
        </div>

        {/* Subject Dropdown Selector */}
        {subjects.length > 0 && (
          <div className="flex items-center space-x-2">
            <BookOpen className="w-4 h-4 text-slate-400" />
            <select
              value={selectedSubjectId}
              onChange={(e) => handleSubjectChange(e.target.value)}
              className="py-2 px-3 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Homework List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-2" />
          <p className="text-xs">Loading homework for subject...</p>
        </div>
      ) : homeworkList.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 p-8">
          <ClipboardList className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">No Homework Assigned</h3>
          <p className="text-xs text-slate-500 mt-1">
            There are no homework tasks assigned for this subject yet.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {homeworkList.map((hw) => {
            const isGraded = hw.submission_status === 'graded';
            const isSubmitted = hw.submission_status === 'submitted';
            const isPending = hw.submission_status === 'pending';

            return (
              <div
                key={hw.id}
                className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="space-y-2 max-w-xl">
                  <div className="flex items-center space-x-3">
                    <span
                      className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                        isGraded
                          ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                          : isSubmitted
                          ? 'bg-blue-100 text-blue-700 border border-blue-200'
                          : 'bg-amber-100 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {hw.submission_status}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Due: {new Date(hw.due_date).toLocaleDateString()}</span>
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900">{hw.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {hw.description || 'No description provided.'}
                  </p>

                  {hw.teacher_name && (
                    <p className="text-xs text-slate-400">Assigned by: {hw.teacher_name}</p>
                  )}
                </div>

                {/* Score & Action Column */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 shrink-0 border-t md:border-t-0 pt-4 md:pt-0 border-slate-100">
                  {isGraded && (
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-center min-w-[100px]">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                        Score
                      </div>
                      <div className="text-xl font-extrabold text-emerald-700">{hw.score}</div>
                    </div>
                  )}

                  {hw.submission_file_url && (
                    <a
                      href={hw.submission_file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition-all"
                    >
                      <span>My Submission</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}

                  <button
                    onClick={() => handleOpenSubmitModal(hw)}
                    className={`px-4 py-2.5 rounded-xl font-bold text-xs shadow-sm transition-all flex items-center space-x-2 ${
                      isPending
                        ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    <Upload className="w-4 h-4" />
                    <span>{isPending ? 'Submit Work' : 'Resubmit Solution'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Submission Modal */}
      {activeModalHw && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-scaleUp">
            <h3 className="text-lg font-bold text-slate-900">
              Submit Homework: {activeModalHw.title}
            </h3>
            <p className="text-xs text-slate-500">
              Provide a public file URL (Google Drive, Dropbox, GitHub, or PDF link) for your teacher to review.
            </p>

            {submitMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-medium flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{submitMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmitHomework} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Submission File URL
                </label>
                <input
                  type="url"
                  required
                  value={fileUrlInput}
                  onChange={(e) => setFileUrlInput(e.target.value)}
                  placeholder="https://drive.google.com/file/d/..."
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModalHw(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 disabled:opacity-60 flex items-center space-x-1.5"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <span>Confirm Submission</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
