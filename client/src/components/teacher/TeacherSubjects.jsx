import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import {
  BookOpen,
  Plus,
  ChevronRight,
  FileText,
  Video,
  FileCode,
  ExternalLink,
  Trash2,
  Loader2,
  FolderOpen,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Layers,
} from 'lucide-react';

export default function TeacherSubjects() {
  const { subjectId, chapterId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [subjects, setSubjects] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);

  const [currentSubject, setCurrentSubject] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loadingChapters, setLoadingChapters] = useState(false);

  const [currentChapter, setCurrentChapter] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [loadingMaterials, setLoadingMaterials] = useState(false);

  // Modal / Form States
  const [showAddChapterModal, setShowAddChapterModal] = useState(false);
  const [newChapterTitle, setNewChapterTitle] = useState('');

  const [showUploadMaterialModal, setShowUploadMaterialModal] = useState(false);
  const [materialForm, setMaterialForm] = useState({
    title: '',
    type: 'pdf',
    file_url: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Fetch teacher's assigned subjects list
  useEffect(() => {
    fetchSubjects();
  }, []);

  // Fetch chapters when subjectId is in URL
  useEffect(() => {
    if (subjectId) {
      fetchChapters(subjectId);
    } else {
      setCurrentSubject(null);
      setChapters([]);
    }
  }, [subjectId, subjects]);

  // Fetch materials when chapterId is in URL
  useEffect(() => {
    if (chapterId) {
      fetchMaterials(chapterId);
    } else {
      setCurrentChapter(null);
      setMaterials([]);
    }
  }, [chapterId, chapters]);

  const fetchSubjects = async () => {
    setLoadingSubjects(true);
    setError('');
    try {
      const res = await axiosInstance.get('/subjects/my-subjects');
      const list = res.data.subjects || [];
      setSubjects(list);
    } catch (err) {
      console.error('Fetch Teacher Subjects Error:', err);
      setError(err.response?.data?.error || 'Failed to fetch assigned subjects.');
    } finally {
      setLoadingSubjects(false);
    }
  };

  const fetchChapters = async (sId) => {
    setLoadingChapters(true);
    setError('');
    try {
      const res = await axiosInstance.get(`/chapters/subject/${sId}`);
      const list = res.data.chapters || [];
      setChapters(list);

      // Find current subject object
      const subj = subjects.find((s) => s.id === parseInt(sId, 10));
      if (subj) {
        setCurrentSubject(subj);
      } else {
        // Fallback: fetch assigned subjects if not loaded yet
        const subjRes = await axiosInstance.get('/subjects/my-subjects');
        const found = (subjRes.data.subjects || []).find((s) => s.id === parseInt(sId, 10));
        if (found) setCurrentSubject(found);
      }
    } catch (err) {
      console.error('Fetch Chapters Error:', err);
      setError(err.response?.data?.error || 'Failed to fetch chapters for this subject.');
    } finally {
      setLoadingChapters(false);
    }
  };

  const fetchMaterials = async (cId) => {
    setLoadingMaterials(true);
    setError('');
    try {
      const res = await axiosInstance.get(`/materials/chapter/${cId}`);
      setMaterials(res.data.materials || []);

      // Find current chapter object
      const chap = chapters.find((c) => c.id === parseInt(cId, 10));
      if (chap) {
        setCurrentChapter(chap);
      }
    } catch (err) {
      console.error('Fetch Materials Error:', err);
      setError(err.response?.data?.error || 'Failed to fetch study materials for this chapter.');
    } finally {
      setLoadingMaterials(false);
    }
  };

  const handleCreateChapter = async (e) => {
    e.preventDefault();
    if (!newChapterTitle.trim() || !subjectId) return;

    setSubmitting(true);
    setError('');
    setSuccessMsg('');

    try {
      await axiosInstance.post('/chapters', {
        subject_id: parseInt(subjectId, 10),
        title: newChapterTitle.trim(),
      });

      setSuccessMsg('Chapter added successfully!');
      setNewChapterTitle('');
      setShowAddChapterModal(false);
      fetchChapters(subjectId);
    } catch (err) {
      console.error('Create Chapter Error:', err);
      setError(err.response?.data?.error || 'Failed to create chapter.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUploadMaterial = async (e) => {
    e.preventDefault();
    if (!materialForm.title.trim() || !materialForm.file_url.trim() || !chapterId) return;

    setSubmitting(true);
    setError('');
    setSuccessMsg('');

    try {
      await axiosInstance.post('/materials', {
        chapter_id: parseInt(chapterId, 10),
        title: materialForm.title.trim(),
        type: materialForm.type,
        file_url: materialForm.file_url.trim(),
      });

      setSuccessMsg('Study material uploaded successfully!');
      setMaterialForm({ title: '', type: 'pdf', file_url: '' });
      setShowUploadMaterialModal(false);
      fetchMaterials(chapterId);
    } catch (err) {
      console.error('Upload Material Error:', err);
      setError(err.response?.data?.error || 'Failed to upload study material.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteMaterial = async (materialId) => {
    if (!window.confirm('Are you sure you want to delete this study material?')) return;

    setError('');
    setSuccessMsg('');

    try {
      await axiosInstance.delete(`/materials/${materialId}`);
      setSuccessMsg('Study material deleted successfully.');
      fetchMaterials(chapterId);
    } catch (err) {
      console.error('Delete Material Error:', err);
      setError(err.response?.data?.error || 'Failed to delete study material.');
    }
  };

  const getMaterialIcon = (type) => {
    switch (type.toLowerCase()) {
      case 'pdf':
        return <FileText className="w-5 h-5 text-rose-500" />;
      case 'video':
        return <Video className="w-5 h-5 text-indigo-500" />;
      case 'note':
        return <FileCode className="w-5 h-5 text-amber-500" />;
      default:
        return <FileText className="w-5 h-5 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Breadcrumbs Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Assigned Subjects & Content Management
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Manage course chapters, upload PDFs/videos/notes for subjects assigned to you.
          </p>
        </div>

        {/* Action Buttons & Back Navigation */}
        <div className="flex items-center space-x-2">
          {chapterId ? (
            <>
              <Link
                to={`/teacher/dashboard/subjects/${subjectId}`}
                className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center space-x-1.5 transition-all shadow-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Chapters</span>
              </Link>
              <button
                onClick={() => setShowUploadMaterialModal(true)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center space-x-1.5 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Upload Material</span>
              </button>
            </>
          ) : subjectId ? (
            <>
              <Link
                to="/teacher/dashboard/subjects"
                className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center space-x-1.5 transition-all shadow-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to All Subjects</span>
              </Link>
              <button
                onClick={() => setShowAddChapterModal(true)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center space-x-1.5 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add Chapter</span>
              </button>
            </>
          ) : null}
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

      {/* Step 1: Assigned Subjects List (URL: /teacher/dashboard/subjects) */}
      {!subjectId && (
        <div>
          {loadingSubjects ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mb-2" />
              <p className="text-xs">Loading assigned subjects...</p>
            </div>
          ) : subjects.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 p-8 space-y-2">
              <Layers className="w-12 h-12 text-amber-400 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">
                You haven't been assigned to any subjects yet.
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Please contact your administrator to be assigned to course subjects and start managing course content.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subjects.map((subject) => (
                <Link
                  key={subject.id}
                  to={`/teacher/dashboard/subjects/${subject.id}`}
                  className="group p-6 rounded-2xl bg-white border border-slate-100 hover:border-emerald-200 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all flex items-center justify-center font-bold">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                      {subject.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      {subject.class_name ? `Class: ${subject.class_name}` : 'Assigned Subject'}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-slate-500">
                    <span>Manage Chapters & Notes</span>
                    <span className="text-emerald-600 font-semibold">Open &rarr;</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 2: Chapters View (URL: /teacher/dashboard/subjects/:subjectId) */}
      {subjectId && !chapterId && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                Selected Subject
              </span>
              <h3 className="text-xl font-bold text-slate-900">
                {currentSubject ? `${currentSubject.name} (${currentSubject.class_name || 'Class'})` : `Subject #${subjectId}`}
              </h3>
            </div>
          </div>

          {loadingChapters ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mb-2" />
              <p className="text-xs">Loading chapters...</p>
            </div>
          ) : chapters.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 p-8">
              <FolderOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-700">No Chapters Created</h3>
              <p className="text-xs text-slate-500 mt-1 mb-4">
                Click "+ Add Chapter" above to create course chapters for students.
              </p>
              <button
                onClick={() => setShowAddChapterModal(true)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20"
              >
                + Add First Chapter
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {chapters.map((chap, index) => (
                <Link
                  key={chap.id}
                  to={`/teacher/dashboard/subjects/${subjectId}/chapters/${chap.id}`}
                  className="group p-5 rounded-2xl bg-white border border-slate-100 hover:border-emerald-300 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer flex items-center justify-between"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-9 h-9 rounded-lg bg-slate-100 group-hover:bg-emerald-600 group-hover:text-white text-slate-600 flex items-center justify-center font-bold text-sm transition-colors">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-base group-hover:text-emerald-600 transition-colors">
                        {chap.title}
                      </h4>
                      <p className="text-xs text-slate-500">Manage files, notes & video links</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-600">
                    <span>Manage Content</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 3: Materials View (URL: /teacher/dashboard/subjects/:subjectId/chapters/:chapterId) */}
      {subjectId && chapterId && (
        <div className="space-y-6">
          {/* Active Context Banner */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2 text-xs text-slate-500 mb-1">
                <span className="font-medium text-slate-700">
                  {currentSubject ? currentSubject.name : `Subject #${subjectId}`}
                </span>
                <span>&rarr;</span>
                <span className="font-semibold text-emerald-600">
                  {currentChapter ? currentChapter.title : `Chapter #${chapterId}`}
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900">Study Materials</h3>
            </div>

            <button
              onClick={() => setShowUploadMaterialModal(true)}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center space-x-1.5 transition-all self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Upload Material</span>
            </button>
          </div>

          {loadingMaterials ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mb-2" />
              <p className="text-xs">Loading study materials...</p>
            </div>
          ) : materials.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 p-8">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-700">No Study Materials Uploaded</h3>
              <p className="text-xs text-slate-500 mt-1 mb-4">
                Click "Upload Material" above to share PDFs, notes, or video lectures for this chapter.
              </p>
              <button
                onClick={() => setShowUploadMaterialModal(true)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20"
              >
                + Upload First Material
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {materials.map((mat) => (
                <div
                  key={mat.id}
                  className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 shrink-0">
                        {getMaterialIcon(mat.type)}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                            {mat.type}
                          </span>
                          {mat.teacher_name && (
                            <span className="text-xs text-slate-400">by {mat.teacher_name}</span>
                          )}
                        </div>
                        <h4 className="font-bold text-slate-900 text-base mt-1">{mat.title}</h4>
                      </div>
                    </div>

                    {(user?.role === 'admin' || mat.teacher_id === user?.id) && (
                      <button
                        onClick={() => handleDeleteMaterial(mat.id)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                        title="Delete Material"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-400">
                      Added: {new Date(mat.created_at).toLocaleDateString()}
                    </span>
                    <a
                      href={mat.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white font-semibold transition-all flex items-center space-x-1.5"
                    >
                      <span>Open Material</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal 1: Add Chapter */}
      {showAddChapterModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Add New Chapter</h3>
            <form onSubmit={handleCreateChapter} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Chapter Title
                </label>
                <input
                  type="text"
                  required
                  value={newChapterTitle}
                  onChange={(e) => setNewChapterTitle(e.target.value)}
                  placeholder="e.g. Chapter 1: Introduction to Mechanics"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddChapterModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 disabled:opacity-60 flex items-center space-x-1.5"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Create Chapter</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Upload Material */}
      {showUploadMaterialModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Upload Study Material</h3>
            <form onSubmit={handleUploadMaterial} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Material Title
                </label>
                <input
                  type="text"
                  required
                  value={materialForm.title}
                  onChange={(e) => setMaterialForm({ ...materialForm, title: e.target.value })}
                  placeholder="e.g. Lecture Notes PDF - Week 1"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Material Type
                </label>
                <select
                  value={materialForm.type}
                  onChange={(e) => setMaterialForm({ ...materialForm, type: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                >
                  <option value="pdf">PDF Document</option>
                  <option value="video">Video Lecture Link</option>
                  <option value="note">Text Note / Article</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Public File / Resource URL
                </label>
                <input
                  type="url"
                  required
                  value={materialForm.file_url}
                  onChange={(e) => setMaterialForm({ ...materialForm, file_url: e.target.value })}
                  placeholder="https://drive.google.com/file/d/..."
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadMaterialModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 disabled:opacity-60 flex items-center space-x-1.5"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Upload Material</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
