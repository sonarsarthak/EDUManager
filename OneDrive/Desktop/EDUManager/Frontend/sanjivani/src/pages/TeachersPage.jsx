import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import TeacherTable from '../components/TeacherTable.jsx';
import EditTeacherModal from '../components/EditTeacherModal.jsx';
import ConfirmDelete from '../components/ConfirmDelete.jsx';
import { getTeachers, updateTeacher, deleteTeacher } from '../services/teacherService';
import { getDepartments } from '../services/departmentService';
import { getSubjects } from '../services/subjectService';

const tabs = [
  { label: 'New Faculty', key: 'new' },
  { label: 'Load Distribution', key: 'load' },
  { label: 'Teacher List', key: 'list' },
  { label: 'Daily Tasks', key: 'tasks' },
];

const classOptions = ['FY-A', 'FY-B', 'SY-A', 'SY-B', 'TY-A', 'TY-B'];

function TeachersPage() {
  const [activeTab, setActiveTab] = useState('new');
  // New Faculty form state (unchanged)
  const [form, setForm] = useState({
    fullName: '', email: '', phone: '', department: '', loginId: '', password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Teacher List state
  const [teachers, setTeachers] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [page, setPage] = useState(1);
  const perPage = 10;
  const [editModal, setEditModal] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // Load Distribution state
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [loadSubjects, setLoadSubjects] = useState([]); // array of subject codes
  const [loadClass, setLoadClass] = useState('');
  const [loadTiming, setLoadTiming] = useState('');
  const [loadSuccess, setLoadSuccess] = useState('');
  const [loadError, setLoadError] = useState('');

  // Daily Tasks state
  const [taskDate, setTaskDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [taskTeacherId, setTaskTeacherId] = useState('');
  const [taskList, setTaskList] = useState([{ period: '', subject: '', class: '', time: '' }]);
  const [taskSuccess, setTaskSuccess] = useState('');
  const [taskError, setTaskError] = useState('');
  const [viewedTasks, setViewedTasks] = useState([]);

  // Department and subject state for Add Faculty
  const [departments, setDepartments] = useState([]);
  const [allSubjects, setAllSubjects] = useState([]);
  const [selectedSubjects, setSelectedSubjects] = useState([]);

  useEffect(() => {
    getDepartments().then(setDepartments);
    getSubjects().then(setAllSubjects);
  }, []);

  // Fetch teachers
  useEffect(() => {
    if (activeTab === 'list' || activeTab === 'load') fetchTeachers();
    // eslint-disable-next-line
  }, [activeTab]);

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const data = await getTeachers();
      setTeachers(data);
    } catch (err) {
      setError('Failed to fetch teachers');
    } finally {
      setLoading(false);
    }
  };

  // Filtered and paginated teachers
  const filtered = teachers.filter(t =>
    (t.fullName.toLowerCase().includes(search.toLowerCase()) ||
      t.email.toLowerCase().includes(search.toLowerCase())) &&
    (filter === 'All' || t.department?.name === filter)
  );
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  // Edit teacher
  const openEdit = (teacher) => {
    setEditForm({ ...teacher });
    setEditError('');
    setEditModal(true);
  };
  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError('');
    try {
      await updateTeacher(editForm._id, editForm);
      setEditModal(false);
      fetchTeachers();
    } catch (err) {
      setEditError(err.message);
    } finally {
      setEditLoading(false);
    }
  };

  // Delete teacher
  const openDelete = (teacher) => {
    setDeleteTarget(teacher);
    setDeleteError('');
    setDeleteModal(true);
  };
  const handleDelete = async () => {
    setDeleteLoading(true);
    setDeleteError('');
    try {
      await deleteTeacher(deleteTarget._id);
      setDeleteModal(false);
      fetchTeachers();
    } catch (err) {
      setDeleteError(err.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Load Distribution logic
  const selectedTeacher = teachers.find(t => t._id === selectedTeacherId);
  useEffect(() => {
    if (selectedTeacher) {
      setLoadSubjects(selectedTeacher.loadAssigned || []);
      setLoadClass(selectedTeacher.classAssigned || '');
      setLoadTiming(selectedTeacher.timing || '');
    } else {
      setLoadSubjects([]);
      setLoadClass('');
      setLoadTiming('');
    }
    setLoadSuccess('');
    setLoadError('');
  }, [selectedTeacherId]);

  const handleLoadSave = async (e) => {
    e.preventDefault();
    setLoadSuccess('');
    setLoadError('');
    try {
      await updateTeacher(selectedTeacherId, {
        ...selectedTeacher,
        loadAssigned: loadSubjects,
        classAssigned: loadClass,
        timing: loadTiming
      });
      setLoadSuccess('Load distribution updated!');
      fetchTeachers();
    } catch (err) {
      setLoadError(err.message);
    }
  };

  // Daily Tasks logic
  useEffect(() => {
    if (activeTab === 'tasks' && taskTeacherId && teachers.length) {
      const teacher = teachers.find(t => t._id === taskTeacherId);
      if (teacher && teacher.dailyTasks && teacher.dailyTasks[taskDate]) {
        setViewedTasks(teacher.dailyTasks[taskDate]);
      } else {
        setViewedTasks([]);
      }
    }
  }, [activeTab, taskTeacherId, taskDate, teachers]);

  const handleTaskChange = (idx, field, value) => {
    setTaskList(list => list.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  };
  const addTaskRow = () => setTaskList(list => [...list, { period: '', subject: '', class: '', time: '' }]);
  const removeTaskRow = idx => setTaskList(list => list.filter((_, i) => i !== idx));

  const handleTaskAssign = async (e) => {
    e.preventDefault();
    setTaskSuccess('');
    setTaskError('');
    try {
      const teacher = teachers.find(t => t._id === taskTeacherId);
      const dailyTasks = { ...(teacher.dailyTasks || {}) };
      dailyTasks[taskDate] = taskList;
      await updateTeacher(taskTeacherId, { ...teacher, dailyTasks });
      setTaskSuccess('Daily timetable assigned!');
      fetchTeachers();
    } catch (err) {
      setTaskError(err.message);
    }
  };

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddFaculty = async (e, selectedSubjects) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      // 1. Create teacher in /api/teachers
      const teacherRes = await fetch('/api/teachers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: form.fullName,
          email: form.email,
          phone: form.phone,
          department: form.department,
          subjects: selectedSubjects // Pass selected subjects
        })
      });
      if (!teacherRes.ok) {
        const data = await teacherRes.json();
        throw new Error(data.error || 'Failed to add teacher');
      }
      // 2. Create user login in /api/auth/register (assuming such endpoint exists)
      const userRes = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.fullName,
          email: form.email,
          loginId: form.loginId,
          password: form.password,
          role: 'teacher'
        })
      });
      if (!userRes.ok) {
        const data = await userRes.json();
        throw new Error(data.error || 'Failed to create login');
      }
      setSuccess('Faculty added and login created successfully!');
      setForm({ fullName: '', email: '', phone: '', department: '', loginId: '', password: '' });
      setSelectedSubjects([]); // Reset selected subjects after successful addition
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDepartmentChange = (e) => {
    handleInputChange(e);
    setSelectedSubjects([]); // Reset subjects when department changes
  };

  const handleSubjectToggle = (subjectId) => {
    setSelectedSubjects(prev =>
      prev.includes(subjectId)
        ? prev.filter(id => id !== subjectId)
        : [...prev, subjectId]
    );
  };

  // Find selected department's subjects
  const departmentObj = departments.find(dep => dep._id === form.department);
  const departmentSubjects = departmentObj
    ? allSubjects.filter(sub => departmentObj.subjects.includes(sub._id))
    : [];

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar active="Teachers" />
      <main className="flex-1 p-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Teachers Management</h1>
          {/* Tabs */}
          <div className="flex gap-4 mb-8">
            {tabs.map(tab => (
              <button
                key={tab.key}
                className={`px-4 py-2 rounded-2xl font-semibold transition-all ${activeTab === tab.key ? 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>
          {/* Tab Content */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 min-h-[300px]">
            {activeTab === 'new' && (
              <div>
                <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Add New Faculty</h2>
                {error && <div className="mb-4 p-2 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded">{error}</div>}
                {success && <div className="mb-4 p-2 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 rounded">{success}</div>}
                <form className="space-y-4" onSubmit={e => handleAddFaculty(e, selectedSubjects)}>
                  <div>
                    <label className="block mb-1 font-medium dark:text-gray-200">Full Name</label>
                    <input type="text" name="fullName" value={form.fullName} onChange={handleInputChange} className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-900 dark:text-white border-gray-300 dark:border-gray-700" required />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium dark:text-gray-200">Email</label>
                    <input type="email" name="email" value={form.email} onChange={handleInputChange} className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-900 dark:text-white border-gray-300 dark:border-gray-700" required />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium dark:text-gray-200">Phone</label>
                    <input type="text" name="phone" value={form.phone} onChange={handleInputChange} className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-900 dark:text-white border-gray-300 dark:border-gray-700" />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium dark:text-gray-200">Department</label>
                    <select name="department" value={form.department} onChange={handleDepartmentChange} className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-900 dark:text-white border-gray-300 dark:border-gray-700" required>
                      <option value="">Select Department</option>
                      {departments.map(dep => (
                        <option key={dep._id} value={dep._id}>{dep.name}</option>
                      ))}
                    </select>
                  </div>
                 {departmentSubjects.length > 0 && (
                   <div>
                     <label className="block mb-1 font-medium dark:text-gray-200">Subjects to Teach</label>
                     <div className="border rounded p-2 max-h-40 overflow-y-auto bg-white dark:bg-gray-900 dark:text-white border-gray-300 dark:border-gray-700">
                       {departmentSubjects.map(sub => (
                         <label key={sub._id} className="flex items-center gap-2 mb-1">
                           <input
                             type="checkbox"
                             checked={selectedSubjects.includes(sub._id)}
                             onChange={() => handleSubjectToggle(sub._id)}
                           />
                           <span>{sub.name} ({sub.code})</span>
                         </label>
                       ))}
                     </div>
                   </div>
                 )}
                  <div>
                    <label className="block mb-1 font-medium dark:text-gray-200">Login ID</label>
                    <input type="text" name="loginId" value={form.loginId} onChange={handleInputChange} className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-900 dark:text-white border-gray-300 dark:border-gray-700" required />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium dark:text-gray-200">Password</label>
                    <input type="password" name="password" value={form.password} onChange={handleInputChange} className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-900 dark:text-white border-gray-300 dark:border-gray-700" required />
                  </div>
                  <button type="submit" className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-4 py-2 rounded w-full font-semibold hover:scale-105 transition-transform" disabled={loading}>{loading ? 'Adding...' : 'Add Faculty'}</button>
                </form>
              </div>
            )}
            {activeTab === 'load' && (
              <div>
                <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Load Distribution</h2>
                <form className="space-y-4" onSubmit={handleLoadSave}>
                  <div>
                    <label className="block mb-1 font-medium dark:text-gray-200">Select Teacher</label>
                    <select value={selectedTeacherId} onChange={e => setSelectedTeacherId(e.target.value)} className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-900 dark:text-white border-gray-300 dark:border-gray-700" required>
                      <option value="">Select Teacher</option>
                      {teachers.map(t => (
                        <option key={t._id} value={t._id}>{t.fullName} ({t.department?.name || t.department})</option>
                      ))}
                    </select>
                  </div>
                  {selectedTeacher && (
                    <>
                      <div>
                        <label className="block mb-1 font-medium dark:text-gray-200">Assign Subjects</label>
                        <select multiple value={loadSubjects} onChange={e => setLoadSubjects(Array.from(e.target.selectedOptions, o => o.value))} className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-900 dark:text-white border-gray-300 dark:border-gray-700">
                          {allSubjects.map(sub => (
                            <option key={sub._id} value={sub._id}>{sub.name} ({sub.code})</option>
                          ))}
                        </select>
                        <span className="text-xs text-gray-500 dark:text-gray-400">Hold Ctrl (Windows) or Cmd (Mac) to select multiple</span>
                      </div>
                      <div>
                        <label className="block mb-1 font-medium dark:text-gray-200">Assign Class</label>
                        <select value={loadClass} onChange={e => setLoadClass(e.target.value)} className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-900 dark:text-white border-gray-300 dark:border-gray-700">
                          <option value="">Select Class</option>
                          {classOptions.map(cls => (
                            <option key={cls} value={cls}>{cls}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block mb-1 font-medium dark:text-gray-200">Class Timing</label>
                        <input type="text" value={loadTiming} onChange={e => setLoadTiming(e.target.value)} className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-900 dark:text-white border-gray-300 dark:border-gray-700" placeholder="e.g. Mon 9:00-10:00" />
                      </div>
                      {loadError && <div className="mb-2 p-2 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded">{loadError}</div>}
                      {loadSuccess && <div className="mb-2 p-2 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 rounded">{loadSuccess}</div>}
                      <button type="submit" className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-4 py-2 rounded w-full font-semibold hover:scale-105 transition-transform">Save Load</button>
                    </>
                  )}
                </form>
              </div>
            )}
            {activeTab === 'list' && (
              <div>
                <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Teacher List</h2>
                {loading ? (
                  <div className="py-8 text-center">Loading...</div>
                ) : (
                  <TeacherTable
                    teachers={paginated}
                    onEdit={openEdit}
                    onDelete={openDelete}
                    search={search}
                    setSearch={setSearch}
                    filter={filter}
                    setFilter={setFilter}
                    page={page}
                    setPage={setPage}
                    total={filtered.length}
                    perPage={perPage}
                  />
                )}
                {/* Edit Modal */}
                {editModal && (
                  <EditTeacherModal
                    open={editModal}
                    onClose={() => setEditModal(false)}
                    onSubmit={handleEditSubmit}
                    loading={editLoading}
                    error={editError}
                    form={editForm}
                    onChange={handleEditChange}
                    departmentOptions={departments} // Pass departments for edit
                  />
                )}
                {/* Delete Modal */}
                {deleteModal && (
                  <ConfirmDelete
                    open={deleteModal}
                    onClose={() => setDeleteModal(false)}
                    onConfirm={handleDelete}
                    loading={deleteLoading}
                    teacherName={deleteTarget?.fullName}
                    error={deleteError}
                  />
                )}
              </div>
            )}
            {activeTab === 'tasks' && (
              <div>
                <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Daily Task Generator</h2>
                <form className="space-y-4 mb-6" onSubmit={handleTaskAssign}>
                  <div className="flex gap-4">
                    <div>
                      <label className="block mb-1 font-medium dark:text-gray-200">Date</label>
                      <input type="date" value={taskDate} onChange={e => setTaskDate(e.target.value)} className="border rounded px-3 py-2 bg-white dark:bg-gray-900 dark:text-white border-gray-300 dark:border-gray-700" />
                    </div>
                    <div>
                      <label className="block mb-1 font-medium dark:text-gray-200">Select Teacher</label>
                      <select value={taskTeacherId} onChange={e => setTaskTeacherId(e.target.value)} className="border rounded px-3 py-2 bg-white dark:bg-gray-900 dark:text-white border-gray-300 dark:border-gray-700">
                        <option value="">Select Teacher</option>
                        {teachers.map(t => (
                          <option key={t._id} value={t._id}>{t.fullName} ({t.department?.name || t.department})</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block mb-1 font-medium dark:text-gray-200">Assign Periods/Tasks</label>
                    <div className="space-y-2">
                      {taskList.map((task, idx) => (
                        <div key={idx} className="flex gap-2 items-center">
                          <input type="text" placeholder="Period" value={task.period} onChange={e => handleTaskChange(idx, 'period', e.target.value)} className="border rounded px-2 py-1 w-20 bg-white dark:bg-gray-900 dark:text-white border-gray-300 dark:border-gray-700" />
                          <select value={task.subject} onChange={e => handleTaskChange(idx, 'subject', e.target.value)} className="border rounded px-2 py-1 bg-white dark:bg-gray-900 dark:text-white border-gray-300 dark:border-gray-700">
                            <option value="">Subject</option>
                            {allSubjects.map(sub => (
                              <option key={sub._id} value={sub._id}>{sub.name}</option>
                            ))}
                          </select>
                          <select value={task.class} onChange={e => handleTaskChange(idx, 'class', e.target.value)} className="border rounded px-2 py-1 bg-white dark:bg-gray-900 dark:text-white border-gray-300 dark:border-gray-700">
                            <option value="">Class</option>
                            {classOptions.map(cls => (
                              <option key={cls} value={cls}>{cls}</option>
                            ))}
                          </select>
                          <input type="text" placeholder="Time" value={task.time} onChange={e => handleTaskChange(idx, 'time', e.target.value)} className="border rounded px-2 py-1 w-32 bg-white dark:bg-gray-900 dark:text-white border-gray-300 dark:border-gray-700" />
                          <button type="button" onClick={() => removeTaskRow(idx)} className="text-red-500 hover:underline">Remove</button>
                        </div>
                      ))}
                    </div>
                    <button type="button" onClick={addTaskRow} className="mt-2 text-blue-600 hover:underline">+ Add Period</button>
                  </div>
                  {taskError && <div className="mb-2 p-2 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded">{taskError}</div>}
                  {taskSuccess && <div className="mb-2 p-2 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 rounded">{taskSuccess}</div>}
                  <button type="submit" className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-4 py-2 rounded font-semibold hover:scale-105 transition-transform">Assign Timetable</button>
                </form>
                <div>
                  <h3 className="font-semibold mb-2 text-gray-800 dark:text-white">Assigned Timetable for {taskDate}:</h3>
                  {viewedTasks.length === 0 ? (
                    <div className="text-gray-500 dark:text-gray-400">No tasks assigned for this date.</div>
                  ) : (
                    <table className="w-full border text-sm">
                      <thead>
                        <tr className="bg-gray-100 dark:bg-gray-700">
                          <th className="border px-2 py-1 text-gray-700 dark:text-gray-200">Period</th>
                          <th className="border px-2 py-1 text-gray-700 dark:text-gray-200">Subject</th>
                          <th className="border px-2 py-1 text-gray-700 dark:text-gray-200">Class</th>
                          <th className="border px-2 py-1 text-gray-700 dark:text-gray-200">Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {viewedTasks.map((task, idx) => (
                          <tr key={idx} className="bg-white dark:bg-gray-900">
                            <td className="border px-2 py-1 text-gray-800 dark:text-gray-100">{task.period}</td>
                            <td className="border px-2 py-1 text-gray-800 dark:text-gray-100">{allSubjects.find(s => s._id === task.subject)?.name || task.subject}</td>
                            <td className="border px-2 py-1 text-gray-800 dark:text-gray-100">{task.class}</td>
                            <td className="border px-2 py-1 text-gray-800 dark:text-gray-100">{task.time}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default TeachersPage; 