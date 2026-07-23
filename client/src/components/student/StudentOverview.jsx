import React, { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import {
  BookOpen,
  ClipboardList,
  CalendarCheck,
  Award,
  ArrowRight,
  Sparkles,
  Loader2,
  AlertCircle,
} from 'lucide-react';

export default function StudentOverview({ setActiveSection }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [classState, setClassState] = useState({
    assigned: true,
    classId: null,
  });

  const [stats, setStats] = useState({
    totalSubjects: 0,
    pendingHomework: 0,
    attendancePercentage: 0,
    avgPerformance: 0,
  });

  const [recentHomework, setRecentHomework] = useState([]);

  useEffect(() => {
    fetchDashboardOverview();
  }, []);

  const fetchDashboardOverview = async () => {
    setLoading(true);
    setError('');
    try {
      // 1. Fetch Class Subjects for Student
      const subjectsRes = await axiosInstance.get('/subjects/my-class');
      const subjectsList = subjectsRes.data.subjects || [];
      const studentClassId = subjectsRes.data.class_id || null;

      setClassState({
        assigned: !!studentClassId,
        classId: studentClassId,
      });

      // 2. Fetch Attendance
      let attendancePct = 0;
      try {
        const attRes = await axiosInstance.get('/attendance/my-attendance');
        attendancePct = attRes.data.attendance_percentage || 0;
      } catch (e) {
        console.warn('Attendance fetch note:', e);
      }

      // 3. Fetch Performance
      let avgScore = 0;
      try {
        const perfRes = await axiosInstance.get('/performance/my-performance');
        const reports = perfRes.data.reports || [];
        if (reports.length > 0) {
          const sum = reports.reduce((acc, r) => acc + parseFloat(r.score || 0), 0);
          avgScore = (sum / reports.length).toFixed(1);
        }
      } catch (e) {
        console.warn('Performance fetch note:', e);
      }

      // 4. Fetch Pending Homework across scoped subjects
      let pendingCount = 0;
      const allHomework = [];

      for (const subj of subjectsList) {
        try {
          const hwRes = await axiosInstance.get(`/homework/subject/${subj.id}/my-status`);
          const hwList = hwRes.data.homework || [];

          hwList.forEach((hw) => {
            if (hw.submission_status === 'pending') {
              pendingCount++;
            }
            allHomework.push({ ...hw, subject_name: subj.name });
          });
        } catch (e) {
          // ignore single subject error
        }
      }

      setStats({
        totalSubjects: subjectsList.length,
        pendingHomework: pendingCount,
        attendancePercentage: attendancePct,
        avgPerformance: avgScore,
      });

      // Sort recent homework by due date
      allHomework.sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
      setRecentHomework(allHomework.slice(0, 4));
    } catch (err) {
      console.error('Fetch Overview Error:', err);
      setError(err.response?.data?.error || 'Failed to load overview data. Please try refreshing.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-3" />
        <p className="text-sm font-medium">Loading your dashboard overview...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 p-8 sm:p-10 text-white shadow-xl shadow-indigo-600/20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur text-xs font-semibold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Student Dashboard</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
            Welcome Back, {user?.name || 'Student'}! 👋
          </h1>
          <p className="text-indigo-100 text-sm sm:text-base leading-relaxed mb-6">
            Track your enrolled subjects, homework deadlines, attendance compliance, and academic evaluation reports in real-time.
          </p>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setActiveSection('subjects')}
              className="px-5 py-2.5 rounded-xl bg-white text-indigo-700 font-bold text-xs uppercase tracking-wider hover:bg-indigo-50 transition-all shadow-md"
            >
              Browse Subjects &rarr;
            </button>
            <button
              onClick={() => setActiveSection('homework')}
              className="px-5 py-2.5 rounded-xl bg-indigo-700/60 hover:bg-indigo-700 text-white font-semibold text-xs uppercase tracking-wider border border-white/20 transition-all"
            >
              Check Homework
            </button>
          </div>
        </div>
      </div>

      {/* Unassigned Class or No Subjects Warning Banner */}
      {!classState.assigned ? (
        <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-sm">Class Assignment Pending</h4>
            <p className="text-xs text-amber-700 mt-1">
              You haven't been assigned to a class yet. Please contact your school administrator.
            </p>
          </div>
        </div>
      ) : stats.totalSubjects === 0 ? (
        <div className="p-5 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-800 flex items-start space-x-3">
          <BookOpen className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-sm">No Subjects Available Yet</h4>
            <p className="text-xs text-indigo-700 mt-1">
              You are assigned to your class, but no subjects have been created for your class yet.
            </p>
          </div>
        </div>
      ) : null}

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Subjects */}
        <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Enrolled Subjects
            </span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{stats.totalSubjects}</div>
          <div className="text-xs text-slate-500 mt-2">Class subjects available</div>
        </div>

        {/* Card 2: Pending Homework */}
        <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Pending Homework
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <ClipboardList className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{stats.pendingHomework}</div>
          <div className="text-xs text-slate-500 mt-2">Assignments awaiting submission</div>
        </div>

        {/* Card 3: Attendance */}
        <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Attendance Status
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{stats.attendancePercentage}%</div>
          <div className="text-xs text-emerald-600 font-medium mt-2">
            {stats.attendancePercentage >= 75 ? 'Good attendance record' : 'Keep attendance above 75%'}
          </div>
        </div>

        {/* Card 4: Avg Score */}
        <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Avg Score
            </span>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{stats.avgPerformance || '--'}</div>
          <div className="text-xs text-slate-500 mt-2">Evaluation report average</div>
        </div>
      </div>

      {/* Quick Action Homework Section */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Upcoming Homework & Deadlines</h3>
            <p className="text-xs text-slate-500 mt-0.5">Keep track of upcoming homework tasks</p>
          </div>
          <button
            onClick={() => setActiveSection('homework')}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center space-x-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentHomework.length === 0 ? (
          <div className="text-center py-10 border-2 border-dashed border-slate-100 rounded-2xl">
            <ClipboardList className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-500">No active homework assignments</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentHomework.map((hw) => (
              <div
                key={hw.id}
                className="p-5 rounded-2xl bg-slate-50/70 border border-slate-100 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-indigo-100 text-indigo-700">
                      {hw.subject_name}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        hw.submission_status === 'graded'
                          ? 'bg-emerald-100 text-emerald-700'
                          : hw.submission_status === 'submitted'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {hw.submission_status}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm mb-1">{hw.title}</h4>
                  <p className="text-xs text-slate-500 line-clamp-2">{hw.description || 'No description provided.'}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/50 flex items-center justify-between text-xs text-slate-400">
                  <span>Due: {new Date(hw.due_date).toLocaleDateString()}</span>
                  <button
                    onClick={() => setActiveSection('homework')}
                    className="font-semibold text-indigo-600 hover:underline"
                  >
                    Open &rarr;
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
