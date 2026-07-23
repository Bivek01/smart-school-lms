import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import ConfirmDialog from '../shared/ConfirmDialog';
import {
  Users,
  Search,
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  GraduationCap,
  UserCheck,
} from 'lucide-react';

export default function AdminUserManagement() {
  const [users, setUsers] = useState([]);
  const [activeRoleFilter, setActiveRoleFilter] = useState(''); // '' | 'student' | 'teacher' | 'admin'
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Confirmation Modal State
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    fetchUsers(activeRoleFilter);
  }, [activeRoleFilter]);

  const fetchUsers = async (roleFilter) => {
    setLoading(true);
    setError('');
    try {
      let url = '/users';
      if (roleFilter) {
        url += `?role=${roleFilter}`;
      }
      const res = await axiosInstance.get(url);
      setUsers(res.data.users || []);
    } catch (err) {
      console.error('Fetch Users Error:', err);
      setError('Failed to fetch user directory.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;

    setDeleting(true);
    setDeleteError('');
    setError('');
    setSuccessMsg('');

    try {
      await axiosInstance.delete(`/users/${userToDelete.id}`);
      setSuccessMsg(`User "${userToDelete.name}" deleted successfully.`);
      setUserToDelete(null);
      fetchUsers(activeRoleFilter);
    } catch (err) {
      console.error('Delete User Error:', err);
      const errMsg =
        err.response?.data?.error ||
        'Failed to delete user account. User may have associated academic records.';
      setDeleteError(errMsg);
    } finally {
      setDeleting(false);
    }
  };

  // Filter users by client-side search query
  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
  });

  const getRoleBadge = (role) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
            <ShieldCheck className="w-3 h-3 text-purple-600" />
            <span>Admin</span>
          </span>
        );
      case 'teacher':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <UserCheck className="w-3 h-3 text-emerald-600" />
            <span>Teacher</span>
          </span>
        );
      case 'student':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
            <GraduationCap className="w-3 h-3 text-indigo-600" />
            <span>Student</span>
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
            {role}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            User Management Directory
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Review registered students, teachers, and administrators. Manage user accounts.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="py-2 pl-9 pr-4 text-xs rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 w-56 shadow-sm"
            />
          </div>

          {/* Role Filter Tabs */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl">
            {[
              { id: '', label: 'All Users' },
              { id: 'student', label: 'Students' },
              { id: 'teacher', label: 'Teachers' },
              { id: 'admin', label: 'Admins' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveRoleFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeRoleFilter === tab.id
                    ? 'bg-white text-purple-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm flex items-center space-x-2">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600 mb-2" />
            <p className="text-xs">Loading user accounts...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-16 p-8">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h4 className="text-base font-bold text-slate-700">No Users Found</h4>
            <p className="text-xs text-slate-500 mt-1">
              No registered user matches your current search or filter criteria.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  <th className="py-3.5 px-6">User Details</th>
                  <th className="py-3.5 px-6">Role</th>
                  <th className="py-3.5 px-6">Joined Date</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 font-bold flex items-center justify-center text-sm shrink-0">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block text-sm">{u.name}</span>
                          <span className="text-slate-400 block text-xs">{u.email}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6">{getRoleBadge(u.role)}</td>

                    <td className="py-4 px-6 text-slate-500">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>

                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => {
                          setDeleteError('');
                          setUserToDelete(u);
                        }}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                        title="Delete User"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(userToDelete)}
        title="Delete User Account"
        message={`Are you sure you want to permanently delete user "${userToDelete?.name}" (${userToDelete?.email})? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setUserToDelete(null);
          setDeleteError('');
        }}
        confirmText="Delete User"
        loading={deleting}
        error={deleteError}
      />
    </div>
  );
}
