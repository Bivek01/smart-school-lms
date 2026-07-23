import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import ConfirmDialog from '../shared/ConfirmDialog';
import {
  BookOpen,
  Plus,
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Layers,
} from 'lucide-react';

export default function AdminSubjectManagement() {
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Add Subject Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Delete Confirmation Modal State
  const [subjectToDelete, setSubjectToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    setError('');
    try {
      const [subjectsRes, classesRes] = await Promise.all([
        axiosInstance.get('/subjects'),
        axiosInstance.get('/classes').catch(() => ({ data: { classes: [] } })),
      ]);

      setSubjects(subjectsRes.data.subjects || []);
      setClasses(classesRes.data.classes || []);
    } catch (err) {
      console.error('Fetch Subjects/Classes Error:', err);
      setError('Failed to load course subjects and classes.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubject = async (e) => {
    e.preventDefault();
    if (!newSubjectName.trim() || !selectedClassId) {
      setError('Please provide subject name and select a target class.');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccessMsg('');

    try {
      await axiosInstance.post('/subjects', {
        name: newSubjectName.trim(),
        class_id: parseInt(selectedClassId, 10),
      });

      const selectedClassObj = classes.find((c) => String(c.id) === String(selectedClassId));
      const className = selectedClassObj ? selectedClassObj.name : 'Class';

      setSuccessMsg(`Subject "${newSubjectName.trim()}" added to ${className} successfully!`);
      setNewSubjectName('');
      setSelectedClassId('');
      setShowAddModal(false);
      fetchInitialData();
    } catch (err) {
      console.error('Create Subject Error:', err);
      setError(err.response?.data?.error || 'Failed to create subject.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDeleteSubject = async () => {
    if (!subjectToDelete) return;

    setDeleting(true);
    setDeleteError('');
    setError('');
    setSuccessMsg('');

    try {
      await axiosInstance.delete(`/subjects/${subjectToDelete.id}`);
      setSuccessMsg(`Subject "${subjectToDelete.name}" deleted successfully.`);
      setSubjectToDelete(null);
      fetchInitialData();
    } catch (err) {
      console.error('Delete Subject Error:', err);
      const errMsg =
        err.response?.data?.error ||
        'Failed to delete subject. Subject may have associated chapters or homework.';
      setDeleteError(errMsg);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Institutional Subject Catalog
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Create, inspect, or remove academic course subjects and class mappings system-wide.
          </p>
        </div>

        <button
          onClick={() => {
            setError('');
            setShowAddModal(true);
          }}
          className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-600/20 flex items-center space-x-1.5 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Subject</span>
        </button>
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

      {/* Subjects Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600 mb-2" />
          <p className="text-xs">Loading course subjects...</p>
        </div>
      ) : subjects.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 p-8">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">No Subjects in Catalog</h3>
          <p className="text-xs text-slate-500 mt-1">
            Click "+ Add Subject" above to create an academic subject.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((subj) => (
            <div
              key={subj.id}
              className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                  <BookOpen className="w-6 h-6" />
                </div>
                <button
                  onClick={() => {
                    setDeleteError('');
                    setSubjectToDelete(subj);
                  }}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                  title="Delete Subject"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900">{subj.name}</h3>
                <div className="flex items-center space-x-2 mt-2">
                  <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                    <Layers className="w-3 h-3 text-indigo-600" />
                    <span>{subj.class_name ? `Class: ${subj.class_name}` : 'Unassigned Class'}</span>
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <span>Subject #{subj.id}</span>
                <span className="font-semibold text-purple-600">Active</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Subject Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Add New Academic Subject</h3>
            <form onSubmit={handleCreateSubject} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Subject Name
                </label>
                <input
                  type="text"
                  required
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  placeholder="e.g. Mathematics or Physics"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Target Class
                </label>
                <select
                  required
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">-- Select Academic Class --</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-600/20 disabled:opacity-60 flex items-center space-x-1.5"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Create Subject</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Subject Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(subjectToDelete)}
        title="Delete Subject"
        message={`Are you sure you want to permanently delete subject "${subjectToDelete?.name}"? All associated chapters and study materials will also be removed.`}
        onConfirm={handleConfirmDeleteSubject}
        onCancel={() => {
          setSubjectToDelete(null);
          setDeleteError('');
        }}
        confirmText="Delete Subject"
        loading={deleting}
        error={deleteError}
      />
    </div>
  );
}
