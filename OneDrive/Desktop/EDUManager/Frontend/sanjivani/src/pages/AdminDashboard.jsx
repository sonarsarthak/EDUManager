import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalTeachers: 0,
    totalSubjects: 0,
    totalDepartments: 0,
    totalTimetables: 0,
    recentActivity: [],
    departmentStats: [],
    teacherWorkload: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch real-time data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [teachersRes, subjectsRes, departmentsRes] = await Promise.all([
        fetch('/api/teachers'),
        fetch('/api/subjects'),
        fetch('/api/departments')
      ]);

      const teachers = await teachersRes.json();
      const subjects = await subjectsRes.json();
      const departments = await departmentsRes.json();

      // Calculate statistics
      const departmentStats = departments.map(dept => ({
        name: dept.name,
        teacherCount: teachers.filter(t => t.department?.name === dept.name).length,
        subjectCount: subjects.filter(s => s.department?.name === dept.name).length
      }));

      const teacherWorkload = teachers.map(teacher => ({
        name: teacher.name,
        department: teacher.department?.name || 'Unknown',
        totalHours: (teacher.lectureHours || 0) + (teacher.tutorialHours || 0) + (teacher.practicalHours || 0)
      }));

      setStats({
        totalTeachers: teachers.length,
        totalSubjects: subjects.length,
        totalDepartments: departments.length,
        totalTimetables: 0, // Will be updated when timetable generation is implemented
        recentActivity: [
          { action: 'New teacher added', time: '2 hours ago', type: 'success' },
          { action: 'Timetable generated', time: '4 hours ago', type: 'info' },
          { action: 'Subject updated', time: '6 hours ago', type: 'warning' },
          { action: 'Department created', time: '1 day ago', type: 'success' }
        ],
        departmentStats,
        teacherWorkload
      });
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    
    // Refresh data every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex">
        <Sidebar active="Dashboard" />
        <div className="flex-1 p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white p-6 rounded-lg shadow">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar active="Dashboard" />
      
      <div className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome to EDUManager
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Real-time overview of your educational institution
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Teachers</p>
                <p className="text-3xl font-bold">{stats.totalTeachers}</p>
              </div>
              <div className="text-4xl">👨‍🏫</div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Total Subjects</p>
                <p className="text-3xl font-bold">{stats.totalSubjects}</p>
              </div>
              <div className="text-4xl">📚</div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Departments</p>
                <p className="text-3xl font-bold">{stats.totalDepartments}</p>
              </div>
              <div className="text-4xl">🏢</div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Timetables</p>
                <p className="text-3xl font-bold">{stats.totalTimetables}</p>
              </div>
              <div className="text-4xl">📅</div>
            </div>
          </div>
        </div>

        {/* Charts and Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Department Statistics */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Department Overview</h3>
            <div className="space-y-4">
              {stats.departmentStats.map((dept, index) => (
                                 <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                   <div className="flex items-center space-x-3">
                     <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                     <span className="font-medium text-gray-900 dark:text-white">{dept.name}</span>
                   </div>
                   <div className="flex space-x-4 text-sm text-gray-600 dark:text-gray-400">
                     <span>{dept.teacherCount} Teachers</span>
                     <span>{dept.subjectCount} Subjects</span>
                   </div>
                 </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {stats.recentActivity.map((activity, index) => (
                                 <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                   <div className={`w-2 h-2 rounded-full ${
                     activity.type === 'success' ? 'bg-green-500' :
                     activity.type === 'warning' ? 'bg-yellow-500' :
                     'bg-blue-500'
                   }`}></div>
                   <div className="flex-1">
                     <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.action}</p>
                     <p className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</p>
                   </div>
                 </div>
              ))}
            </div>
          </div>
        </div>

        {/* Teacher Workload Table */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Teacher Workload Summary</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Teacher
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Total Hours
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {stats.teacherWorkload.slice(0, 10).map((teacher, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {teacher.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {teacher.department}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {teacher.totalHours} hrs
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        teacher.totalHours > 20 ? 'bg-red-100 text-red-800' :
                        teacher.totalHours > 15 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {teacher.totalHours > 20 ? 'High' : teacher.totalHours > 15 ? 'Medium' : 'Normal'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <button 
            onClick={() => navigate('/teachers')}
            className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105 cursor-pointer"
          >
            <div className="text-2xl mb-2">👨‍🏫</div>
            <div className="font-semibold">Manage Teachers</div>
            <div className="text-sm opacity-90">View and edit faculty</div>
          </button>
          
          <button 
            onClick={() => navigate('/subjects')}
            className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105 cursor-pointer"
          >
            <div className="text-2xl mb-2">📚</div>
            <div className="font-semibold">Manage Subjects</div>
            <div className="text-sm opacity-90">View and edit courses</div>
          </button>
          
          <button 
            onClick={() => navigate('/TimetableGenerator')}
            className="bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105 cursor-pointer"
          >
            <div className="text-2xl mb-2">📅</div>
            <div className="font-semibold">Generate Timetable</div>
            <div className="text-sm opacity-90">Create new schedule</div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 