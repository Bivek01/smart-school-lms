import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import FeatureCard from '../components/FeatureCard';
import { useAuth } from '../context/AuthContext';
import {
  BookOpen,
  ClipboardList,
  CalendarCheck,
  BarChart3,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Users,
  GraduationCap,
  CheckCircle2,
  LayoutDashboard,
} from 'lucide-react';

export default function LandingPage() {
  const { isAuthenticated, user } = useAuth();

  const getDashboardRoute = () => {
    if (!user || !user.role) return '/login';
    return `/${user.role}/dashboard`;
  };

  const features = [
    {
      icon: BookOpen,
      title: 'Digital Study Materials',
      description: 'Access subject-wise chapters, PDFs, notes, and video lectures organized seamlessly for efficient learning.',
      colorBadge: 'indigo',
    },
    {
      icon: ClipboardList,
      title: 'Homework & Assignments',
      description: 'Teachers assign homework with deadlines; students upload solutions and receive graded feedback directly.',
      colorBadge: 'emerald',
    },
    {
      icon: CalendarCheck,
      title: 'Smart Attendance Tracking',
      description: 'Real-time daily attendance recording with automated percentage calculations for subject compliance.',
      colorBadge: 'amber',
    },
    {
      icon: BarChart3,
      title: 'Performance Analytics',
      description: 'Comprehensive evaluation reports, score metrics, and instructor notes to track academic progress over time.',
      colorBadge: 'purple',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Header / Navbar */}
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-16 pb-24 md:pt-24 md:pb-32 overflow-hidden bg-gradient-to-b from-white via-indigo-50/30 to-slate-50">
        {/* Decorative Background Elements */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-indigo-200/40 via-purple-200/30 to-indigo-100/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/70 text-indigo-700 text-xs font-semibold uppercase tracking-wider mb-8 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Final Year B.Tech Minor Project</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.15] mb-8 max-w-4xl mx-auto">
            Empowering Education with{' '}
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 bg-clip-text text-transparent">
              Smart Digital Learning
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed mb-10">
            A modern, unified Learning Management System designed to connect Students, Teachers, and Administrators in one seamless ecosystem.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
            {isAuthenticated ? (
              <Link
                to={getDashboardRoute()}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-base shadow-lg shadow-indigo-600/25 hover:shadow-xl hover:shadow-indigo-600/35 transition-all duration-200 flex items-center justify-center space-x-3 group"
              >
                <LayoutDashboard className="w-5 h-5" />
                <span>Go to Dashboard</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            ) : (
              <Link
                to="/login"
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-base shadow-lg shadow-indigo-600/25 hover:shadow-xl hover:shadow-indigo-600/35 transition-all duration-200 flex items-center justify-center space-x-3 group"
              >
                <span>Get Started Now</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            )}

            <a
              href="#features"
              className="w-full sm:w-auto px-7 py-4 rounded-xl bg-white text-slate-700 font-semibold text-base border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 shadow-sm flex items-center justify-center"
            >
              Learn More
            </a>
          </div>

          {/* Quick Metrics Banner */}
          <div className="mt-16 pt-10 border-t border-slate-200/60 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto text-left">
            <div className="p-4 rounded-xl bg-white/70 backdrop-blur border border-slate-100 shadow-sm">
              <div className="text-2xl font-bold text-indigo-600 mb-1">3 Roles</div>
              <div className="text-xs text-slate-500 font-medium">Student, Teacher & Admin</div>
            </div>
            <div className="p-4 rounded-xl bg-white/70 backdrop-blur border border-slate-100 shadow-sm">
              <div className="text-2xl font-bold text-emerald-600 mb-1">100% Digital</div>
              <div className="text-xs text-slate-500 font-medium">Paperless Homework & Notes</div>
            </div>
            <div className="p-4 rounded-xl bg-white/70 backdrop-blur border border-slate-100 shadow-sm">
              <div className="text-2xl font-bold text-amber-600 mb-1">Real-time</div>
              <div className="text-xs text-slate-500 font-medium">Attendance & Performance</div>
            </div>
            <div className="p-4 rounded-xl bg-white/70 backdrop-blur border border-slate-100 shadow-sm">
              <div className="text-2xl font-bold text-purple-600 mb-1">Secure</div>
              <div className="text-xs text-slate-500 font-medium">JWT & Role-Based Auth</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 md:py-28 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-3">
              Comprehensive Modules
            </h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Everything You Need for Academic Excellence
            </p>
            <p className="text-slate-600 mt-4 text-base">
              Built from the ground up with modular APIs, normalized PostgreSQL tables, and responsive Tailwind UI.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, idx) => (
              <FeatureCard key={idx} {...feature} />
            ))}
          </div>
        </div>
      </section>

      {/* Role Ecosystem Section */}
      <section id="roles" className="py-20 md:py-28 bg-slate-900 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-3">
              Role-Based Experience
            </h2>
            <p className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Tailored Portals for Every Stakeholder
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Student */}
            <div className="p-8 rounded-2xl bg-slate-800/90 border border-slate-700/80 hover:border-indigo-500 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center mb-6">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Student Portal</h3>
              <ul className="space-y-3 text-slate-300 text-sm">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                  <span>Access chapter-wise study materials & notes</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                  <span>Submit homework assignments with file URLs</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                  <span>View attendance percentage & performance reports</span>
                </li>
              </ul>
            </div>

            {/* Teacher */}
            <div className="p-8 rounded-2xl bg-slate-800/90 border border-slate-700/80 hover:border-emerald-500 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mb-6">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Teacher Portal</h3>
              <ul className="space-y-3 text-slate-300 text-sm">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Create chapters & upload study materials</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Post homework assignments & grade submissions</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Mark daily attendance & issue performance reports</span>
                </li>
              </ul>
            </div>

            {/* Admin */}
            <div className="p-8 rounded-2xl bg-slate-800/90 border border-slate-700/80 hover:border-amber-500 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mb-6">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Admin Portal</h3>
              <ul className="space-y-3 text-slate-300 text-sm">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400" />
                  <span>Manage academic subjects and overall catalog</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400" />
                  <span>System-wide user role administration</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400" />
                  <span>Audit student records & institutional statistics</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-14 text-center">
            {isAuthenticated ? (
              <Link
                to={getDashboardRoute()}
                className="inline-flex items-center space-x-2 px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all shadow-lg shadow-indigo-600/30"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center space-x-2 px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all shadow-lg shadow-indigo-600/30"
              >
                <span>Explore The Platform</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
