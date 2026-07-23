import React, { useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import StudentSidebar from '../components/student/StudentSidebar';
import StudentOverview from '../components/student/StudentOverview';
import StudentSubjects from '../components/student/StudentSubjects';
import StudentHomework from '../components/student/StudentHomework';
import StudentAttendance from '../components/student/StudentAttendance';
import StudentPerformance from '../components/student/StudentPerformance';
import { Menu, GraduationCap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function StudentDashboard() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleNavigateSection = (sectionId) => {
    navigate(`/student/dashboard/${sectionId}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-indigo-500 selection:text-white flex">
      {/* Sidebar Component */}
      <StudentSidebar
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        {/* Mobile Header Bar */}
        <header className="h-16 bg-slate-900 text-white px-4 flex items-center justify-between lg:hidden sticky top-0 z-30 shadow-md">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 focus:outline-none"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-sm tracking-tight">Student Portal</span>
            </div>
          </div>

          <span className="text-xs text-slate-400 font-medium truncate max-w-[120px]">
            {user?.name}
          </span>
        </header>

        {/* Dynamic Section Content via React Router Nested Routes */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full">
          <Routes>
            <Route path="/" element={<Navigate to="overview" replace />} />
            <Route
              path="overview"
              element={<StudentOverview setActiveSection={handleNavigateSection} />}
            />
            <Route path="subjects" element={<StudentSubjects />} />
            <Route path="subjects/:subjectId" element={<StudentSubjects />} />
            <Route
              path="subjects/:subjectId/chapters/:chapterId"
              element={<StudentSubjects />}
            />
            <Route path="homework" element={<StudentHomework />} />
            <Route path="homework/:subjectId" element={<StudentHomework />} />
            <Route path="attendance" element={<StudentAttendance />} />
            <Route path="performance" element={<StudentPerformance />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
