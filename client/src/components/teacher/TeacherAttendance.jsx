import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  XCircle,
  Save,
  Loader2,
  AlertCircle,
  Users,
  Layers,
} from 'lucide-react';

export default function TeacherAttendance() {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedDate = searchParams.get('date') || new Date().toISOString().split('T')[0];

  const [subjects, setSubjects] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState(subjectId || '');

  const [students, setStudents] = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({});

  const [loading, setLoading] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (subjectId) {
      setSelectedSubjectId(subjectId);
    } else if (subjects.length > 0 && !selectedSubjectId) {
      setSelectedSubjectId(subjects[0].id.toString());
      navigate(`/teacher/dashboard/attendance/${subjects[0].id}?date=${selectedDate}`, { replace: true });
    }
  }, [subjectId, subjects]);

  useEffect(() => {
    if (selectedSubjectId && selectedDate) {
      fetchExistingAttendance(selectedSubjectId, selectedDate, students);
    }
  }, [selectedSubjectId, selectedDate]);

  const fetchInitialData = async () => {
    setLoadingSubjects(true);
    setError('');
    try {
      const [subjectsRes, studentsRes] = await Promise.all([
        axiosInstance.get('/subjects/my-subjects'),
        axiosInstance.get('/users/students'),
      ]);

      const subjList = subjectsRes.data.subjects || [];
      const studList = studentsRes.data.students || [];

      setSubjects(subjList);
      setStudents(studList);

      const targetSubjectId = subjectId || (subjList.length > 0 ? subjList[0].id.toString() : '');
      if (subjList.length > 0 && !subjectId) {
        setSelectedSubjectId(targetSubjectId);
        navigate(`/teacher/dashboard/attendance/${targetSubjectId}?date=${selectedDate}`, { replace: true });
      }

      if (targetSubjectId) {
        await fetchExistingAttendance(targetSubjectId, selectedDate, studList);
      }
    } catch (err) {
      console.error('Fetch Teacher Initial Data Error:', err);
      setError(err.response?.data?.error || 'Failed to load teacher initialization data.');
    } finally {
      setLoadingSubjects(false);
    }
  };

  const fetchExistingAttendance = async (sId, dateStr, studRoster) => {
    setLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      const res = await axiosInstance.get(`/attendance/subject/${sId}?date=${dateStr}`);
      const records = res.data.attendance || [];

      const roster = (studRoster && studRoster.length > 0) ? studRoster : students;

      // Pre-fill attendance map with 'present' as default for all rostered students
      const map = {};
      roster.forEach((stud) => {
        map[stud.id] = 'present';
      });

      // Override with recorded values from database
      records.forEach((rec) => {
        map[rec.student_id] = rec.status;
      });

      setAttendanceMap(map);
    } catch (err) {
      console.error('Fetch Existing Attendance Error:', err);
      setError(err.response?.data?.error || 'Failed to fetch attendance for selected date.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubjectChange = (newSubId) => {
    setSelectedSubjectId(newSubId);
    navigate(`/teacher/dashboard/attendance/${newSubId}?date=${selectedDate}`);
  };

  const handleDateChange = (newDate) => {
    setSearchParams({ date: newDate });
    if (selectedSubjectId) {
      navigate(`/teacher/dashboard/attendance/${selectedSubjectId}?date=${newDate}`);
    }
  };

  const handleToggleStatus = (studentId) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: prev[studentId] === 'absent' ? 'present' : 'absent',
    }));
  };

  const handleSaveAttendance = async () => {
    if (!selectedSubjectId || !selectedDate) return;

    setSaving(true);
    setError('');
    setSuccessMsg('');

    // If attendanceMap is empty but students are loaded, populate default 'present' for all
    let currentMap = { ...attendanceMap };
    if (Object.keys(currentMap).length === 0 && students.length > 0) {
      students.forEach((stud) => {
        currentMap[stud.id] = 'present';
      });
      setAttendanceMap(currentMap);
    }

    // Transform attendance map to list format expected by API endpoint
    const records = Object.keys(currentMap).map((studId) => ({
      student_id: parseInt(studId, 10),
      status: currentMap[studId] || 'present',
    }));

    if (records.length === 0) {
      setError('No students available to mark attendance for.');
      setSaving(false);
      return;
    }

    try {
      await axiosInstance.post('/attendance/mark', {
        subject_id: parseInt(selectedSubjectId, 10),
        date: selectedDate,
        records,
      });

      setSuccessMsg(`Attendance saved successfully for ${selectedDate}.`);
    } catch (err) {
      console.error('Save Attendance Error:', err);
      setError(err.response?.data?.error || 'Failed to save attendance records.');
    } finally {
      setSaving(false);
    }
  };

  if (loadingSubjects) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mb-2" />
        <p className="text-xs">Loading assigned subjects...</p>
      </div>
    );
  }

  if (subjects.length === 0) {
    return (
      <div className="space-y-6 animate-fadeIn">
        <div className="pb-4 border-b border-slate-200/80">
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Attendance Register
          </h2>
        </div>
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 p-8 space-y-2">
          <Layers className="w-12 h-12 text-amber-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">
            You haven't been assigned to any subjects yet.
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Please contact your administrator to be assigned to course subjects and start taking daily attendance.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Daily Attendance Register
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Select an assigned subject and date to mark student presence or absence.
          </p>
        </div>

        {/* Filter Controls: Subject Dropdown & Date Picker */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2 bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-sm">
            <BookOpen className="w-4 h-4 text-slate-400" />
            <select
              value={selectedSubjectId}
              onChange={(e) => handleSubjectChange(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none"
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.class_name || 'Class'})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2 bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-sm">
            <Calendar className="w-4 h-4 text-slate-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none"
            />
          </div>

          <button
            onClick={handleSaveAttendance}
            disabled={saving || loading || students.length === 0}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 disabled:opacity-50 flex items-center space-x-2 transition-all"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Register</span>
              </>
            )}
          </button>
        </div>
      </div>

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

      {/* Attendance Register Roster */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Student Roll Call</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Click on status badges to toggle Present / Absent
            </p>
          </div>
          <div className="text-xs font-semibold text-slate-500">
            Total Enrolled Students: {students.length}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mb-2" />
            <p className="text-xs">Loading attendance register...</p>
          </div>
        ) : students.length === 0 ? (
          <div className="text-center py-16 p-8">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h4 className="text-base font-bold text-slate-700">No Registered Students</h4>
            <p className="text-xs text-slate-500 mt-1">
              There are no registered students in the system yet.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Student Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4 text-center">Attendance Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((stud) => {
                  const status = attendanceMap[stud.id] || 'present';
                  const isPresent = status === 'present';

                  return (
                    <tr key={stud.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900">{stud.name}</td>
                      <td className="px-6 py-4 text-slate-500">{stud.email}</td>
                      <td className="px-6 py-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(stud.id)}
                          className={`inline-flex items-center space-x-2 px-4 py-1.5 rounded-full font-bold text-xs transition-all shadow-sm cursor-pointer ${
                            isPresent
                              ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border border-emerald-300'
                              : 'bg-rose-100 hover:bg-rose-200 text-rose-800 border border-rose-300'
                          }`}
                        >
                          {isPresent ? (
                            <>
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              <span>Present</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-4 h-4 text-rose-600" />
                              <span>Absent</span>
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
  );
}
