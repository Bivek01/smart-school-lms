import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import ConfirmDialog from '../shared/ConfirmDialog';
import {
  Layers,
  GraduationCap,
  Users,
  Plus,
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle2,
  BookOpen,
  Search,
  UserCheck,
  Save,
  UserX,
} from 'lucide-react';

export default function AdminClassesManagement() {
  const [activeTab, setActiveTab] = useState('classes'); // 'classes' | 'students' | 'teachers'

  // Global State
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [assignments, setAssignments] = useState([]);

  // UI States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Tab 1: Class Modal & Delete State
  const [showAddClassModal, setShowAddClassModal] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [classSubmitting, setClassSubmitting] = useState(false);
  const [classToDelete, setClassToDelete] = useState(null);
  const [deletingClass, setDeletingClass] = useState(false);
  const [deleteClassError, setDeleteClassError] = useState('');

  // Tab 2: Assign Student State
  const [studentSearch, setStudentSearch] = useState('');
  const [selectedStudentClasses, setSelectedStudentClasses] = useState({}); // { studentId: classId }
  const [savingStudentId, setSavingStudentId] = useState(null);

  // Tab 3: Assign Teacher State
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [assigningTeacher, setAssigningTeacher] = useState(false);
  const [assignmentToDelete, setAssignmentToDelete] = useState(null);
  const [deletingAssignment, setDeletingAssignment] = useState(false);
  const [deleteAssignmentError, setDeleteAssignmentError] = useState('');

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    setError('');
    try {
      const [classesRes, studentsRes, teachersRes, subjectsRes, assignmentsRes] = await Promise.all([
        axiosInstance.get('/classes').catch(() => ({ data: { classes: [] } })),
        axiosInstance.get('/users?role=student').catch(() => ({ data: { users: [] } })),
        axiosInstance.get('/users?role=teacher').catch(() => ({ data: { users: [] } })),
        axiosInstance.get('/subjects').catch(() => ({ data: { subjects: [] } })),
        axiosInstance.get('/admin/teacher-assignments').catch(() => ({ data: { assignments: [] } })),
      ]);

      const fetchedClasses = classesRes.data.classes || [];
      const fetchedStudents = studentsRes.data.users || [];

      setClasses(fetchedClasses);
      setStudents(fetchedStudents);
      setTeachers(teachersRes.data.users || []);
      setSubjects(subjectsRes.data.subjects || []);
      setAssignments(assignmentsRes.data.assignments || []);

      // Initialize student class selections
      const initialMap = {};
      fetchedStudents.forEach((s) => {
        initialMap[s.id] = s.class_id ? String(s.class_id) : '';
      });
      setSelectedStudentClasses(initialMap);
    } catch (err) {
      console.error('Fetch All Data Error:', err);
      setError('Failed to load class and assignment directory data.');
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Tab 1: Classes Handlers
  // ---------------------------------------------------------------------------
  const handleCreateClass = async (e) => {
    e.preventDefault();
    if (!newClassName.trim()) return;

    setClassSubmitting(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await axiosInstance.post('/classes', { name: newClassName.trim() });
      setSuccessMsg(`Class "${res.data.class?.name || newClassName}" created successfully!`);
      setNewClassName('');
      setShowAddClassModal(false);
      fetchAllData();
    } catch (err) {
      console.error('Create Class Error:', err);
      setError(err.response?.data?.error || 'Failed to create class.');
    } finally {
      setClassSubmitting(false);
    }
  };

  const handleConfirmDeleteClass = async () => {
    if (!classToDelete) return;

    setDeletingClass(true);
    setDeleteClassError('');
    setError('');
    setSuccessMsg('');

    try {
      await axiosInstance.delete(`/classes/${classToDelete.id}`);
      setSuccessMsg(`Class "${classToDelete.name}" deleted successfully.`);
      setClassToDelete(null);
      fetchAllData();
    } catch (err) {
      console.error('Delete Class Error:', err);
      const errMsg =
        err.response?.data?.error ||
        'Cannot delete class: it has active subjects or assigned students.';
      setDeleteClassError(errMsg);
    } finally {
      setDeletingClass(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Tab 2: Student Class Assignment Handlers
  // ---------------------------------------------------------------------------
  const handleStudentClassChange = (studentId, classId) => {
    setSelectedStudentClasses((prev) => ({
      ...prev,
      [studentId]: classId,
    }));
  };

  const handleSaveStudentClass = async (student) => {
    const classIdToSave = selectedStudentClasses[student.id];
    setSavingStudentId(student.id);
    setError('');
    setSuccessMsg('');

    try {
      await axiosInstance.put(`/users/${student.id}/class`, {
        class_id: classIdToSave ? parseInt(classIdToSave, 10) : null,
      });

      const selectedClassObj = classes.find((c) => String(c.id) === String(classIdToSave));
      const className = selectedClassObj ? selectedClassObj.name : 'Unassigned';
      setSuccessMsg(`Assigned student "${student.name}" to ${className}.`);
      fetchAllData();
    } catch (err) {
      console.error('Assign Student Class Error:', err);
      setError(err.response?.data?.error || 'Failed to update student class assignment.');
    } finally {
      setSavingStudentId(null);
    }
  };

  // ---------------------------------------------------------------------------
  // Tab 3: Teacher-Subject Assignment Handlers
  // ---------------------------------------------------------------------------
  const handleAssignTeacher = async (e) => {
    e.preventDefault();
    if (!selectedTeacherId || !selectedSubjectId) {
      setError('Please select both a teacher and a subject.');
      return;
    }

    setAssigningTeacher(true);
    setError('');
    setSuccessMsg('');

    try {
      await axiosInstance.post('/admin/assign-subject', {
        teacher_id: parseInt(selectedTeacherId, 10),
        subject_id: parseInt(selectedSubjectId, 10),
      });

      setSuccessMsg('Teacher assigned to subject successfully!');
      setSelectedTeacherId('');
      setSelectedSubjectId('');
      fetchAllData();
    } catch (err) {
      console.error('Assign Teacher Error:', err);
      setError(err.response?.data?.error || 'Failed to assign teacher to subject.');
    } finally {
      setAssigningTeacher(false);
    }
  };

  const handleConfirmDeleteAssignment = async () => {
    if (!assignmentToDelete) return;

    setDeletingAssignment(true);
    setDeleteAssignmentError('');
    setError('');
    setSuccessMsg('');

    try {
      await axiosInstance.delete(`/admin/assign-subject/${assignmentToDelete.id}`);
      setSuccessMsg('Teacher assignment removed successfully.');
      setAssignmentToDelete(null);
      fetchAllData();
    } catch (err) {
      console.error('Unassign Teacher Error:', err);
      setDeleteAssignmentError(err.response?.data?.error || 'Failed to remove teacher assignment.');
    } finally {
      setDeletingAssignment(false);
    }
  };

  // Filter students by search
  const filteredStudents = students.filter((s) => {
    const q = studentSearch.toLowerCase();
    return s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Class & Assignment Management
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Configure academic classes, assign students to classes, and assign teachers to course subjects.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 bg-slate-100 rounded-xl self-start md:self-auto">
          {[
            { id: 'classes', label: 'Manage Classes', icon: Layers },
            { id: 'students', label: 'Assign Students', icon: GraduationCap },
            { id: 'teachers', label: 'Assign Teachers', icon: UserCheck },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setError('');
                  setSuccessMsg('');
                }}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-white text-purple-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-purple-600' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm flex items-center space-x-2">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Global Loading Spinner */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600 mb-2" />
          <p className="text-xs">Loading class and assignment directory...</p>
        </div>
      ) : (
        <>
          {/* =================================================================== */}
          {/* TAB 1: MANAGE CLASSES                                              */}
          {/* =================================================================== */}
          {activeTab === 'classes' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Academic Classes</h3>
                  <p className="text-xs text-slate-500">System classes registered in the LMS</p>
                </div>
                <button
                  onClick={() => setShowAddClassModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-600/20 flex items-center space-x-1.5 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Class</span>
                </button>
              </div>

              {classes.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 p-8">
                  <Layers className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <h3 className="text-base font-bold text-slate-700">No Classes Registered</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Click "+ Add Class" above to create an academic class (e.g. Class 8, Class 9).
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {classes.map((cls) => (
                    <div
                      key={cls.id}
                      className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                          <Layers className="w-6 h-6" />
                        </div>
                        <button
                          onClick={() => {
                            setDeleteClassError('');
                            setClassToDelete(cls);
                          }}
                          className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                          title="Delete Class"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div>
                        <h3 className="text-lg font-bold text-slate-900">{cls.name}</h3>
                        <p className="text-xs text-slate-500 mt-1">Class ID: #{cls.id}</p>
                      </div>

                      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                        <span>Created: {new Date(cls.created_at).toLocaleDateString()}</span>
                        <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold text-[10px]">
                          Active Class
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* =================================================================== */}
          {/* TAB 2: ASSIGN STUDENTS TO CLASSES                                  */}
          {/* =================================================================== */}
          {activeTab === 'students' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Student Class Assignments</h3>
                  <p className="text-xs text-slate-500">Assign enrolled students to their respective academic class</p>
                </div>

                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Filter students..."
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    className="py-2 pl-9 pr-4 text-xs rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 w-64 shadow-sm"
                  />
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                {filteredStudents.length === 0 ? (
                  <div className="text-center py-16 p-8">
                    <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <h4 className="text-base font-bold text-slate-700">No Students Found</h4>
                    <p className="text-xs text-slate-500 mt-1">No student accounts registered or match your search.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                          <th className="py-3.5 px-6">Student Details</th>
                          <th className="py-3.5 px-6">Current Class</th>
                          <th className="py-3.5 px-6">Assign Class</th>
                          <th className="py-3.5 px-6 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs">
                        {filteredStudents.map((st) => {
                          const currentClassId = selectedStudentClasses[st.id] || '';
                          const isUnassigned = !st.class_id && (!currentClassId || currentClassId === '');

                          return (
                            <tr key={st.id} className="hover:bg-slate-50/60 transition-colors">
                              <td className="py-4 px-6">
                                <div className="flex items-center space-x-3">
                                  <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center text-sm shrink-0">
                                    {st.name.charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <span className="font-bold text-slate-900 block text-sm">{st.name}</span>
                                    <span className="text-slate-400 block text-xs">{st.email}</span>
                                  </div>
                                </div>
                              </td>

                              <td className="py-4 px-6">
                                {isUnassigned ? (
                                  <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                    <AlertCircle className="w-3 h-3 text-amber-500" />
                                    <span>Unassigned</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                                    <Layers className="w-3 h-3 text-indigo-600" />
                                    <span>{st.class_name || classes.find((c) => String(c.id) === String(st.class_id))?.name || 'Class Assigned'}</span>
                                  </span>
                                )}
                              </td>

                              <td className="py-4 px-6">
                                <select
                                  value={currentClassId}
                                  onChange={(e) => handleStudentClassChange(st.id, e.target.value)}
                                  className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 w-48"
                                >
                                  <option value="">-- Unassigned --</option>
                                  {classes.map((c) => (
                                    <option key={c.id} value={c.id}>
                                      {c.name}
                                    </option>
                                  ))}
                                </select>
                              </td>

                              <td className="py-4 px-6 text-right">
                                <button
                                  onClick={() => handleSaveStudentClass(st)}
                                  disabled={savingStudentId === st.id}
                                  className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-600/20 disabled:opacity-50 inline-flex items-center space-x-1.5 transition-all"
                                >
                                  {savingStudentId === st.id ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  ) : (
                                    <>
                                      <Save className="w-3.5 h-3.5" />
                                      <span>Save</span>
                                    </>
                                  )}
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* =================================================================== */}
          {/* TAB 3: ASSIGN TEACHERS TO SUBJECTS                                 */}
          {/* =================================================================== */}
          {activeTab === 'teachers' && (
            <div className="space-y-6">
              {/* Assignment Form Card */}
              <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Assign Teacher to Subject</h3>
                  <p className="text-xs text-slate-500">Select an instructor and map them to a class subject</p>
                </div>

                <form onSubmit={handleAssignTeacher} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                      Select Teacher
                    </label>
                    <select
                      value={selectedTeacherId}
                      onChange={(e) => setSelectedTeacherId(e.target.value)}
                      required
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">-- Choose Teacher --</option>
                      {teachers.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name} ({t.email})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                      Select Subject
                    </label>
                    <select
                      value={selectedSubjectId}
                      onChange={(e) => setSelectedSubjectId(e.target.value)}
                      required
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">-- Choose Subject --</option>
                      {subjects.map((sub) => (
                        <option key={sub.id} value={sub.id}>
                          {sub.name} ({sub.class_name || 'Unassigned'})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <button
                      type="submit"
                      disabled={assigningTeacher}
                      className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-600/20 disabled:opacity-60 flex items-center justify-center space-x-2 transition-all"
                    >
                      {assigningTeacher ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          <span>Assign Teacher</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Current Teacher Assignments Table */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-900">Current Teacher Assignments</h3>

                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                  {assignments.length === 0 ? (
                    <div className="text-center py-16 p-8">
                      <UserX className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <h4 className="text-base font-bold text-slate-700">No Teacher Assignments Found</h4>
                      <p className="text-xs text-slate-500 mt-1">Assign a teacher to a subject using the form above.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                            <th className="py-3.5 px-6">Teacher Details</th>
                            <th className="py-3.5 px-6">Subject</th>
                            <th className="py-3.5 px-6">Class</th>
                            <th className="py-3.5 px-6">Assigned Date</th>
                            <th className="py-3.5 px-6 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs">
                          {assignments.map((asgn) => (
                            <tr key={asgn.id} className="hover:bg-slate-50/60 transition-colors">
                              <td className="py-4 px-6">
                                <div className="flex items-center space-x-3">
                                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 font-bold flex items-center justify-center text-sm shrink-0">
                                    {asgn.teacher_name ? asgn.teacher_name.charAt(0).toUpperCase() : 'T'}
                                  </div>
                                  <div>
                                    <span className="font-bold text-slate-900 block text-sm">{asgn.teacher_name}</span>
                                    <span className="text-slate-400 block text-xs">{asgn.teacher_email}</span>
                                  </div>
                                </div>
                              </td>

                              <td className="py-4 px-6 font-bold text-slate-800">
                                {asgn.subject_name}
                              </td>

                              <td className="py-4 px-6">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                                  {asgn.class_name || 'Unassigned'}
                                </span>
                              </td>

                              <td className="py-4 px-6 text-slate-500">
                                {new Date(asgn.created_at).toLocaleDateString()}
                              </td>

                              <td className="py-4 px-6 text-right">
                                <button
                                  onClick={() => {
                                    setDeleteAssignmentError('');
                                    setAssignmentToDelete(asgn);
                                  }}
                                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                                  title="Unassign Teacher"
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
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal: Add Class */}
      {showAddClassModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Add New Academic Class</h3>
            <form onSubmit={handleCreateClass} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Class Name
                </label>
                <input
                  type="text"
                  required
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  placeholder="e.g. Class 8 or Grade 10"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddClassModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={classSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-600/20 disabled:opacity-60 flex items-center space-x-1.5"
                >
                  {classSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Create Class</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Class Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(classToDelete)}
        title="Delete Academic Class"
        message={`Are you sure you want to delete class "${classToDelete?.name}"? Make sure all associated subjects and students are reassigned.`}
        onConfirm={handleConfirmDeleteClass}
        onCancel={() => {
          setClassToDelete(null);
          setDeleteClassError('');
        }}
        confirmText="Delete Class"
        loading={deletingClass}
        error={deleteClassError}
      />

      {/* Unassign Teacher Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(assignmentToDelete)}
        title="Remove Teacher Assignment"
        message={`Are you sure you want to unassign "${assignmentToDelete?.teacher_name}" from subject "${assignmentToDelete?.subject_name}"?`}
        onConfirm={handleConfirmDeleteAssignment}
        onCancel={() => {
          setAssignmentToDelete(null);
          setDeleteAssignmentError('');
        }}
        confirmText="Unassign Teacher"
        loading={deletingAssignment}
        error={deleteAssignmentError}
      />
    </div>
  );
}
