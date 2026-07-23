import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import {
  GraduationCap,
  Users,
  ShieldCheck,
  Lock,
  Mail,
  User,
  AlertCircle,
  Loader2,
  CheckCircle,
} from 'lucide-react';

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register'
  const [selectedRole, setSelectedRole] = useState('student'); // 'student' | 'teacher' | 'admin'

  // Form States
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  // UI States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const { login, isAuthenticated, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated && user?.role) {
      navigate(`/${user.role}/dashboard`, { replace: true });
    }
  }, [isAuthenticated, user, authLoading, navigate]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleRoleChange = (role) => {
    setSelectedRole(role);
    setError('');
  };

  // Client-side Validation
  const validateForm = () => {
    if (!formData.email.trim()) {
      setError('Please enter your email address');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      setError('Please enter a valid email address');
      return false;
    }

    if (!formData.password) {
      setError('Please enter your password');
      return false;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }

    if (activeTab === 'register') {
      if (!formData.name.trim()) {
        setError('Please enter your full name');
        return false;
      }

      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!validateForm()) return;

    setLoading(true);

    try {
      if (activeTab === 'login') {
        // Login Request
        const res = await axiosInstance.post('/auth/login', {
          email: formData.email.trim(),
          password: formData.password,
          role: selectedRole,
        });

        const { user: loggedInUser, token } = res.data;
        login(loggedInUser, token);

        setSuccessMsg('Login successful! Redirecting to dashboard...');

        setTimeout(() => {
          const role = loggedInUser.role || selectedRole;
          navigate(`/${role}/dashboard`, { replace: true });
        }, 600);
      } else {
        // Register Request
        const res = await axiosInstance.post('/auth/register', {
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
          role: selectedRole,
        });

        const { user: registeredUser, token } = res.data;
        login(registeredUser, token);

        setSuccessMsg('Account registered successfully! Redirecting...');

        setTimeout(() => {
          navigate(`/${selectedRole}/dashboard`, { replace: true });
        }, 600);
      }
    } catch (err) {
      console.error('Auth Request Error:', err);
      const apiError =
        err.response?.data?.error || err.response?.data?.message || 'Authentication failed. Please check your credentials.';
      setError(apiError);
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { id: 'student', label: 'Student', icon: GraduationCap, color: 'indigo' },
    { id: 'teacher', label: 'Teacher', icon: Users, color: 'emerald' },
    { id: 'admin', label: 'Admin', icon: ShieldCheck, color: 'amber' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between selection:bg-indigo-500 selection:text-white font-sans">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 py-12 md:py-20 relative">
        {/* Background Subtle Gradient */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-indigo-200/30 to-purple-200/30 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-md relative z-10">
          {/* Main Card */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/60 overflow-hidden">
            {/* Header / Brand */}
            <div className="p-8 pb-6 text-center border-b border-slate-100 bg-gradient-to-b from-slate-50/50 to-white">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto mb-3 shadow-md shadow-indigo-600/20">
                <GraduationCap className="w-7 h-7" />
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {activeTab === 'login' ? 'Welcome Back' : 'Create an Account'}
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Select your role and sign in to access your portal
              </p>

              {/* Role Selector Tabs */}
              <div className="mt-6 grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-slate-100/80 border border-slate-200/60">
                {roles.map((r) => {
                  const Icon = r.icon;
                  const isSelected = selectedRole === r.id;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => handleRoleChange(r.id)}
                      className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                        isSelected
                          ? 'bg-white text-indigo-600 shadow-md shadow-slate-200 border border-slate-200/50 font-bold scale-[1.02]'
                          : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/40'
                      }`}
                    >
                      <Icon className={`w-4 h-4 mb-1 ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`} />
                      <span>{r.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Login / Register Toggle Tabs */}
            <div className="flex border-b border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('login');
                  setError('');
                }}
                className={`flex-1 py-3 text-center text-sm font-semibold transition-colors relative ${
                  activeTab === 'login'
                    ? 'text-indigo-600 font-bold'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                Log In
                {activeTab === 'login' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('register');
                  setError('');
                }}
                className={`flex-1 py-3 text-center text-sm font-semibold transition-colors relative ${
                  activeTab === 'register'
                    ? 'text-indigo-600 font-bold'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                Register
                {activeTab === 'register' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />
                )}
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSubmit} className="p-8 space-y-4">
              {/* Error Alert */}
              {error && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-start space-x-2.5 animate-fadeIn">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Success Alert */}
              {successMsg && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium flex items-start space-x-2.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Register Name Field */}
              {activeTab === 'register' && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="e.g. John Doe"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Email Field */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="name@school.edu"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Confirm Password (Register Only) */}
              {activeTab === 'register' && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-md shadow-indigo-600/20 hover:shadow-lg hover:shadow-indigo-600/30 transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-60 disabled:cursor-not-allowed mt-4"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Please wait...</span>
                  </>
                ) : (
                  <span>
                    {activeTab === 'login' ? `Sign In as ${selectedRole}` : `Register as ${selectedRole}`}
                  </span>
                )}
              </button>
            </form>

            {/* Toggle Helper Footer */}
            <div className="p-4 text-center bg-slate-50/80 border-t border-slate-100 text-xs text-slate-500">
              {activeTab === 'login' ? (
                <p>
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('register');
                      setError('');
                    }}
                    className="font-bold text-indigo-600 hover:underline ml-1"
                  >
                    Register now
                  </button>
                </p>
              ) : (
                <p>
                  Already registered?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('login');
                      setError('');
                    }}
                    className="font-bold text-indigo-600 hover:underline ml-1"
                  >
                    Log in here
                  </button>
                </p>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
