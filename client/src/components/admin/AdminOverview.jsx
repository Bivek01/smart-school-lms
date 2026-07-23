import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import {
  Users,
  GraduationCap,
  BookOpen,
  ClipboardList,
  FileText,
  ShieldCheck,
  Sparkles,
  Loader2,
  AlertCircle,
  UserPlus,
} from 'lucide-react';

export default function AdminOverview() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axiosInstance.get('/admin/stats');
      setStats(res.data.stats || {});
    } catch (err) {
      console.error('Fetch Admin Stats Error:', err);
      setError('Failed to fetch system statistics.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600 mb-3" />
        <p className="text-sm font-medium">Loading system analytics dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-700 via-indigo-700 to-slate-900 p-8 sm:p-10 text-white shadow-xl shadow-purple-600/20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur text-xs font-semibold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>System Administration</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
            Welcome, Administrator {user?.name || 'Admin'}! 🛡️
          </h1>
          <p className="text-purple-100 text-sm sm:text-base leading-relaxed mb-6">
            Comprehensive system control center. Manage user accounts, enforce academic role permissions, and maintain the subject catalog.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/admin/dashboard/users"
              className="px-5 py-2.5 rounded-xl bg-white text-purple-900 font-bold text-xs uppercase tracking-wider hover:bg-purple-50 transition-all shadow-md flex items-center space-x-1.5"
            >
              <UserPlus className="w-4 h-4" />
              <span>Manage User Accounts</span>
            </Link>
            <Link
              to="/admin/dashboard/subjects"
              className="px-5 py-2.5 rounded-xl bg-purple-900/60 hover:bg-purple-900 text-white font-semibold text-xs uppercase tracking-wider border border-white/20 transition-all"
            >
              Manage Subjects
            </Link>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 5 Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {/* Card 1: Total Students */}
        <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Students
            </span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{stats?.total_students || 0}</div>
          <div className="text-xs text-slate-500 mt-2">Active student accounts</div>
        </div>

        {/* Card 2: Total Teachers */}
        <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Teachers
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{stats?.total_teachers || 0}</div>
          <div className="text-xs text-slate-500 mt-2">Faculty members</div>
        </div>

        {/* Card 3: Total Subjects */}
        <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Subjects
            </span>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{stats?.total_subjects || 0}</div>
          <div className="text-xs text-slate-500 mt-2">Course subjects catalog</div>
        </div>

        {/* Card 4: Total Homework */}
        <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Homework
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <ClipboardList className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{stats?.total_homework || 0}</div>
          <div className="text-xs text-slate-500 mt-2">Total tasks posted</div>
        </div>

        {/* Card 5: Total Materials */}
        <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Materials
            </span>
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{stats?.total_materials || 0}</div>
          <div className="text-xs text-slate-500 mt-2">PDFs, notes & lectures</div>
        </div>
      </div>
    </div>
  );
}
