import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, LayoutDashboard, Compass, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  const { isAuthenticated, user } = useAuth();

  const getTargetRoute = () => {
    if (isAuthenticated && user?.role) {
      return `/${user.role}/dashboard`;
    }
    return '/';
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans selection:bg-indigo-500 selection:text-white">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-indigo-600/30 via-purple-600/20 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full text-center relative z-10 space-y-6">
        {/* Badge */}
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold uppercase tracking-wider">
          <Compass className="w-4 h-4 text-indigo-400" />
          <span>Error 404</span>
        </div>

        <h1 className="text-7xl font-extrabold bg-gradient-to-r from-indigo-400 via-purple-300 to-indigo-500 bg-clip-text text-transparent">
          404
        </h1>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white tracking-tight">Page Not Found</h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            Oops! The page you are looking for doesn't exist, has been removed, or you may have entered an incorrect URL path.
          </p>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to={getTargetRoute()}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center space-x-2"
          >
            {isAuthenticated ? (
              <>
                <LayoutDashboard className="w-4 h-4" />
                <span>Return to Dashboard</span>
              </>
            ) : (
              <>
                <Home className="w-4 h-4" />
                <span>Return to Home</span>
              </>
            )}
          </Link>

          <button
            onClick={() => window.history.back()}
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs border border-slate-700 transition-all flex items-center justify-center space-x-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </button>
        </div>
      </div>
    </div>
  );
}
