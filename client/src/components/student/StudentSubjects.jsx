import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import {
  BookOpen,
  ChevronRight,
  FileText,
  Video,
  FileCode,
  ExternalLink,
  Loader2,
  FolderOpen,
  ArrowLeft,
  AlertCircle,
  Layers,
} from 'lucide-react';

export default function StudentSubjects() {
  const { subjectId, chapterId } = useParams();
  const navigate = useNavigate();

  const [subjects, setSubjects] = useState([]);
  const [classInfo, setClassInfo] = useState({ class_id: null, message: '' });
  const [loadingSubjects, setLoadingSubjects] = useState(true);

  const [currentSubject, setCurrentSubject] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loadingChapters, setLoadingChapters] = useState(false);

  const [currentChapter, setCurrentChapter] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [loadingMaterials, setLoadingMaterials] = useState(false);

  const [error, setError] = useState('');

  // 1. Fetch Subjects list for student's class
  useEffect(() => {
    fetchSubjects();
  }, []);

  // 2. Fetch Chapters when subjectId is present
  useEffect(() => {
    if (subjectId) {
      fetchChapters(subjectId);
    } else {
      setCurrentSubject(null);
      setChapters([]);
    }
  }, [subjectId, subjects]);

  // 3. Fetch Materials when chapterId is present
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
      const res = await axiosInstance.get('/subjects/my-class');
      const list = res.data.subjects || [];
      setSubjects(list);
      setClassInfo({
        class_id: res.data.class_id || null,
        message: res.data.message || '',
      });
    } catch (err) {
      console.error('Fetch Subjects Error:', err);
      setError(err.response?.data?.error || 'Failed to fetch class subjects.');
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
        // Fallback: fetch class subjects if not loaded yet
        const subjRes = await axiosInstance.get('/subjects/my-class');
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
            Subjects & Study Materials
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Browse course content, chapters, notes, PDFs, and video lectures.
          </p>
        </div>

        {/* Back navigation buttons using React Router */}
        {(subjectId || chapterId) && (
          <div className="flex items-center space-x-2">
            {chapterId ? (
              <Link
                to={`/student/dashboard/subjects/${subjectId}`}
                className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center space-x-1.5 transition-all shadow-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Chapters</span>
              </Link>
            ) : subjectId ? (
              <Link
                to="/student/dashboard/subjects"
                className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center space-x-1.5 transition-all shadow-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to All Subjects</span>
              </Link>
            ) : null}
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Step 1: Subjects List (URL: /student/dashboard/subjects) */}
      {!subjectId && (
        <div>
          {loadingSubjects ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-2" />
              <p className="text-xs">Loading class subjects...</p>
            </div>
          ) : !classInfo.class_id ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 p-8 space-y-2">
              <Layers className="w-12 h-12 text-amber-400 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">
                You haven't been assigned to a class yet.
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Please contact your school administrator to be assigned to your class and view enrolled subjects.
              </p>
            </div>
          ) : subjects.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 p-8 space-y-2">
              <BookOpen className="w-12 h-12 text-indigo-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">
                No Course Subjects Available Yet
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                You are assigned to your class, but no subjects have been created for your class yet. Please contact your school administrator or teacher.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subjects.map((subject) => (
                <Link
                  key={subject.id}
                  to={`/student/dashboard/subjects/${subject.id}`}
                  className="group p-6 rounded-2xl bg-white border border-slate-100 hover:border-indigo-200 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all flex items-center justify-center font-bold">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {subject.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      {subject.class_name ? `Class: ${subject.class_name}` : 'Class Subject'}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-slate-500">
                    <span>Enrolled Course</span>
                    <span className="text-indigo-600 font-semibold">View Content &rarr;</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 2: Chapters View (URL: /student/dashboard/subjects/:subjectId) */}
      {subjectId && !chapterId && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shrink-0">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                Selected Subject
              </span>
              <h3 className="text-xl font-bold text-slate-900">
                {currentSubject ? currentSubject.name : `Subject #${subjectId}`}
              </h3>
            </div>
          </div>

          {loadingChapters ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-2" />
              <p className="text-xs">Loading chapters...</p>
            </div>
          ) : chapters.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 p-8">
              <FolderOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-700">No Chapters Yet</h3>
              <p className="text-xs text-slate-500 mt-1">Chapters added by teachers will show up here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {chapters.map((chap, index) => (
                <Link
                  key={chap.id}
                  to={`/student/dashboard/subjects/${subjectId}/chapters/${chap.id}`}
                  className="group p-5 rounded-2xl bg-white border border-slate-100 hover:border-indigo-300 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer flex items-center justify-between"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-9 h-9 rounded-lg bg-slate-100 group-hover:bg-indigo-600 group-hover:text-white text-slate-600 flex items-center justify-center font-bold text-sm transition-colors">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-base group-hover:text-indigo-600 transition-colors">
                        {chap.title}
                      </h4>
                      <p className="text-xs text-slate-500">Click to access files & materials</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 text-xs font-semibold text-indigo-600">
                    <span>View Materials</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 3: Materials View (URL: /student/dashboard/subjects/:subjectId/chapters/:chapterId) */}
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
                <span className="font-semibold text-indigo-600">
                  {currentChapter ? currentChapter.title : `Chapter #${chapterId}`}
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900">Study Materials</h3>
            </div>
          </div>

          {loadingMaterials ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-2" />
              <p className="text-xs">Loading study materials...</p>
            </div>
          ) : materials.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 p-8">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-700">No Study Materials Uploaded</h3>
              <p className="text-xs text-slate-500 mt-1">
                No files or notes have been uploaded for this chapter yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {materials.map((mat) => (
                <div
                  key={mat.id}
                  className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                >
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

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-400">
                      Added: {new Date(mat.created_at).toLocaleDateString()}
                    </span>
                    <a
                      href={mat.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white font-semibold transition-all flex items-center space-x-1.5"
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
    </div>
  );
}
