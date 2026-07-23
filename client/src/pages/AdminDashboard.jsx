import React, { useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminOverview from '../components/admin/AdminOverview';
import AdminClassesManagement from '../components/admin/AdminClassesManagement';
import AdminUserManagement from '../components/admin/AdminUserManagement';
import AdminSubjectManagement from '../components/admin/AdminSubjectManagement';

import { Menu, ShieldCheck, Search, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex font-sans selection:bg-purple-500 selection:text-white">
      {/* Sidebar Navigation */}
      <AdminSidebar
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0 min-h-screen">
        {/* Top Header Bar */}
        <header className="h-16 bg-white border-b border-slate-200/80 sticky top-0 z-30 px-4 sm:px-8 flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-600 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
              <span>Admin Console v1.0</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative hidden md:block">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search accounts..."
                className="py-1.5 pl-9 pr-4 text-xs rounded-xl bg-slate-100 border border-transparent focus:bg-white focus:border-slate-300 focus:outline-none w-48 transition-all"
              />
            </div>

            <button className="relative p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-purple-500" />
            </button>

            <div className="h-8 w-px bg-slate-200" />

            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
              </div>
              <div className="hidden md:block text-left">
                <span className="text-xs font-bold text-slate-900 block leading-tight">
                  {user?.name || 'Administrator'}
                </span>
                <span className="text-[10px] text-purple-600 font-semibold uppercase tracking-wider block">
                  System Admin
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Section Content via React Router Nested Routes */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          <Routes>
            <Route path="/" element={<Navigate to="overview" replace />} />
            <Route path="overview" element={<AdminOverview />} />
            <Route path="classes" element={<AdminClassesManagement />} />
            <Route path="users" element={<AdminUserManagement />} />
            <Route path="subjects" element={<AdminSubjectManagement />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
