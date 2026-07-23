import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  CalendarCheck,
  BarChart3,
  LogOut,
  GraduationCap,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function StudentSidebar({ isMobileOpen, setIsMobileOpen }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { id: 'overview', label: 'Overview', path: '/student/dashboard/overview', icon: LayoutDashboard },
    { id: 'subjects', label: 'Subjects & Materials', path: '/student/dashboard/subjects', icon: BookOpen },
    { id: 'homework', label: 'Homework & Submissions', path: '/student/dashboard/homework', icon: ClipboardList },
    { id: 'attendance', label: 'Attendance', path: '/student/dashboard/attendance', icon: CalendarCheck },
    { id: 'performance', label: 'Performance', path: '/student/dashboard/performance', icon: BarChart3 },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col justify-between border-r border-slate-800 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="h-16 px-6 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-white tracking-tight text-base block leading-none">
                  SmartSchool
                </span>
                <span className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider">
                  Student Portal
                </span>
              </div>
            </div>

            {/* Close Button Mobile */}
            <button
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Profile Mini Badge */}
          <div className="mx-4 my-6 p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center font-bold text-base shrink-0">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'S'}
            </div>
            <div className="overflow-hidden">
              <h4 className="text-sm font-semibold text-white truncate">{user?.name || 'Student'}</h4>
              <p className="text-xs text-slate-400 truncate">{user?.email || 'student@school.edu'}</p>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="px-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.path);

              return (
                <Link
                  key={item.id}
                  to={item.path}
                  onClick={() => setIsMobileOpen && setIsMobileOpen(false)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold shadow-md shadow-indigo-600/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Logout */}
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={logout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
