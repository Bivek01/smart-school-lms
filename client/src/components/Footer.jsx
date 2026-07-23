import React from 'react';
import { GraduationCap, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Col 1 */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center space-x-3 text-white">
              <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="font-bold text-xl tracking-tight">SmartSchool LMS</span>
            </div>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              A comprehensive digital Learning Management System built for Students, Teachers, and Administrators to streamline modern education.
            </p>
          </div>

          {/* Col 2 */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="hover:text-indigo-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <a href="#features" className="hover:text-indigo-400 transition-colors">
                  Features
                </a>
              </li>
              <li>
                <Link to="/login" className="hover:text-indigo-400 transition-colors">
                  Login & Register
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Project Info
            </h4>
            <p className="text-sm text-slate-400">
              B.Tech Minor Project
            </p>
            <p className="text-sm text-slate-400 mt-1">
              Stack: React + Vite, Tailwind CSS, Express, PostgreSQL
            </p>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} SmartSchool LMS. All rights reserved.</p>
          <p className="mt-2 sm:mt-0 flex items-center space-x-1">
            <span>Built for modern education</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline mx-1" />
          </p>
        </div>
      </div>
    </footer>
  );
}
