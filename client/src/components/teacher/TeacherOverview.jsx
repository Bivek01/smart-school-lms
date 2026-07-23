import React, { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import {
  BookOpen,
  ClipboardList,
  FileText,
  CheckSquare,
  Sparkles,
  Loader2,
  AlertCircle,
  PlusCircle,
  UserX,
} from 'lucide-react';

export default function TeacherOverview({ setActiveSection }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hasNoSubjects, setHasNoSubjects] = useState(false);

  const [stats, setStats] = useState({
    totalSubjects: 0,
    totalMaterials: 0,
    totalHomework: 0,
    pendingGrading: 0,
  });

  useEffect(() => {
    fetchTeacherOverview();
  }, []);

  const fetchTeacherOverview = async () => {
    setLoading(true);
    setError('');
    setHasNoSubjects(false);
    try {
      // 1. Fetch Subjects Assigned to Teacher
      const subjectsRes = await axiosInstance.get('/subjects/my-subjects');
      const subjectsList = subjectsRes.data.subjects || [];

      if (subjectsList.length === 0) {
        setHasNoSubjects(true);
      }

      let materialsCount = 0;
      let homeworkCount = 0;
      let pendingGradeCount = 0;

      // Iterate through assigned subjects to aggregate metrics
      for (const subj of subjectsList) {
        // Fetch chapters for material count
        try {
          const chapRes = await axiosInstance.get(`/chapters/subject/${subj.id}`);
          const chapters = chapRes.data.chapters || [];
          for (const chap of chapters) {
            const matRes = await axiosInstance.get(`/materials/chapter/${chap.id}`);
            const mats = matRes.data.materials || [];
            materialsCount += mats.length;
          }
        } catch (e) {
          // ignore chapter error
        }

        // Fetch homework for assignment & grading count
        try {
          const hwRes = await axiosInstance.get(`/homework/subject/${subj.id}`);
          const hwList = hwRes.data.homework || [];
          homeworkCount += hwList.length;

          for (const hw of hwList) {
            const subsRes = await axiosInstance.get(`/homework/${hw.id}/submissions`);
            const submissions = subsRes.data.submissions || [];
            pendingGradeCount += submissions.filter((s) => s.status === 'submitted').length;
          }
        } catch (e) {
          // ignore hw error
        }
      }

      setStats({
        totalSubjects: subjectsList.length,
        totalMaterials: materialsCount,
        totalHomework: homeworkCount,
        pendingGrading: pendingGradeCount,
      });
    } catch (err) {
      console.error('Fetch Teacher Overview Error:', err);
      setError(err.response?.data?.error || 'Failed to load overview statistics.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mb-3" />
        <p className="text-sm font-medium">Loading instructor dashboard overview...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700 p-8 sm:p-10 text-white shadow-xl shadow-emerald-600/20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur text-xs font-semibold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Teacher Portal</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
            Welcome, Professor {user?.name || 'Instructor'}! 👋
          </h1>
          <p className="text-emerald-100 text-sm sm:text-base leading-relaxed mb-6">
            Manage course subjects, chapters, upload study materials, assign homework, mark daily attendance, and issue performance reports.
          </p>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setActiveSection('subjects')}
              className="px-5 py-2.5 rounded-xl bg-white text-emerald-800 font-bold text-xs uppercase tracking-wider hover:bg-emerald-50 transition-all shadow-md flex items-center space-x-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>View Subjects / Content</span>
            </button>
            <button
              onClick={() => setActiveSection('homework')}
              className="px-5 py-2.5 rounded-xl bg-emerald-800/60 hover:bg-emerald-800 text-white font-semibold text-xs uppercase tracking-wider border border-white/20 transition-all"
            >
              Assign Homework
            </button>
          </div>
        </div>
      </div>

      {/* Unassigned Subjects Warning */}
      {hasNoSubjects && (
        <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-sm">Subject Assignments Pending</h4>
            <p className="text-xs text-amber-700 mt-1">
              You haven't been assigned to any subjects yet. Please contact your administrator.
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Subjects */}
        <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Assigned Subjects
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{stats.totalSubjects}</div>
          <div className="text-xs text-slate-500 mt-2">Active assigned course subjects</div>
        </div>

        {/* Card 2: Materials Uploaded */}
        <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Study Materials
            </span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{stats.totalMaterials}</div>
          <div className="text-xs text-slate-500 mt-2">Uploaded PDFs, notes & videos</div>
        </div>

        {/* Card 3: Homework Assigned */}
        <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Homework Assigned
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <ClipboardList className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{stats.totalHomework}</div>
          <div className="text-xs text-slate-500 mt-2">Total tasks assigned</div>
        </div>

        {/* Card 4: Pending Submissions to Grade */}
        <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Pending Grading
            </span>
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <CheckSquare className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{stats.pendingGrading}</div>
          <div className="text-xs text-rose-600 font-medium mt-2">Submissions awaiting score</div>
        </div>
      </div>
    </div>
  );
}
