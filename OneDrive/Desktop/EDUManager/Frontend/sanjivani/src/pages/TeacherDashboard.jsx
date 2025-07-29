import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function TeacherSidebar({ active, onNavigate, onLogout, onThemeToggle, isDarkMode }) {
  return (
    <aside className="w-56 bg-gradient-to-b from-blue-900 via-blue-800 to-blue-900 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-white flex flex-col py-6 px-4 min-h-screen shadow-xl">
      <div className="mb-8 text-center">
        <div className="text-2xl font-bold tracking-wider text-blue-100 mb-2">EDUManager</div>
        <div className="text-xs text-blue-300 tracking-widest">TEACHER PORTAL</div>
      </div>
      <nav className="flex-1 space-y-1">
        <button 
          onClick={() => onNavigate('dashboard')}
          className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center space-x-3 ${active === 'dashboard' ? 'bg-blue-600 dark:bg-blue-700 text-white shadow-lg transform scale-105' : 'hover:bg-blue-700/50 dark:hover:bg-gray-700 text-blue-100 dark:text-gray-200 hover:text-white'}`}
        >
          <span>📊</span>
          <span>Dashboard</span>
        </button>
        <button 
          onClick={() => onNavigate('settings')}
          className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center space-x-3 ${active === 'settings' ? 'bg-blue-600 dark:bg-blue-700 text-white shadow-lg transform scale-105' : 'hover:bg-blue-700/50 dark:hover:bg-gray-700 text-blue-100 dark:text-gray-200 hover:text-white'}`}
        >
          <span>⚙️</span>
          <span>Settings</span>
        </button>
      </nav>
      
      {/* Theme Toggle Button */}
      <div className="mt-auto pt-4 border-t border-blue-700 dark:border-gray-700">
        <button 
          onClick={onThemeToggle}
          className="w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center space-x-3 hover:bg-blue-700/50 dark:hover:bg-gray-700 text-blue-100 dark:text-gray-200 hover:text-white mb-2"
        >
          <span>{isDarkMode ? '☀️' : '🌙'}</span>
          <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
        <button 
          onClick={onLogout}
          className="w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center space-x-3 hover:bg-red-600/50 text-red-100 hover:text-white"
        >
          <span>🚪</span>
          <span>Logout</span>
        </button>
        <div className="text-center text-xs text-blue-300 dark:text-gray-400 mt-2">
          <div>© 2024 EDUManager</div>
        </div>
      </div>
    </aside>
  );
}

const TeacherDashboard = () => {
  const [teacher, setTeacher] = useState(null);
  const [timetable, setTimetable] = useState([]); // Placeholder for timetable data
  const [tasks, setTasks] = useState([]); // Placeholder for daily tasks
  const [activePage, setActivePage] = useState('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Load saved theme from localStorage
    const savedTheme = localStorage.getItem('theme') || 'light';
    setIsDarkMode(savedTheme === 'dark');
    applyTheme(savedTheme);
  }, []);

  const applyTheme = (selectedTheme) => {
    const root = document.documentElement;
    if (selectedTheme === 'dark') {
      root.classList.add('dark');
      setIsDarkMode(true);
    } else {
      root.classList.remove('dark');
      setIsDarkMode(false);
    }
    localStorage.setItem('theme', selectedTheme);
  };

  const handleThemeToggle = () => {
    const newTheme = isDarkMode ? 'light' : 'dark';
    applyTheme(newTheme);
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');

    if (!user || user.role !== 'teacher' || !token) {
      navigate('/login');
      return;
    }

    // Fetch teacher by email ONCE, then use that for everything
    const fetchAllTeacherData = async () => {
      try {
        const response = await fetch(`/api/teachers?email=${user.email}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (response.ok) {
          const teachers = await response.json();
          if (teachers.length > 0) {
            const teacherData = teachers[0];
            setTeacher(teacherData); // Only use backend teacher object

            // Fetch timetable
            const timetableResponse = await fetch(`/api/timetable/teacher/${teacherData._id}`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });
            if (timetableResponse.ok) {
              const timetableData = await timetableResponse.json();
              setTimetable(timetableData);
            }

            // Fetch tasks
            const tasksResponse = await fetch(`/api/tasks/teacher/${teacherData._id}`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });
            if (tasksResponse.ok) {
              const tasksData = await tasksResponse.json();
              setTasks(tasksData);
            }
          }
        }
      } catch (error) {
        console.log('Could not fetch teacher data:', error);
      }
    };

    fetchAllTeacherData();
  }, [navigate]);

  if (!teacher) return null;

  const handleNavigate = (page) => {
    setActivePage(page);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const renderDashboardContent = () => (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">👨‍🏫 Welcome, {teacher.fullName || teacher.name}</h1>
      {/* Profile Card */}
      <div className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow">
        <h2 className="text-xl font-semibold mb-2 text-blue-800 dark:text-blue-200">Profile</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-gray-700 dark:text-gray-300 font-medium">Name:</div>
            <div className="text-gray-900 dark:text-white">{teacher.fullName || teacher.name}</div>
          </div>
          <div>
            <div className="text-gray-700 dark:text-gray-300 font-medium">Department:</div>
            <div className="text-gray-900 dark:text-white">{teacher.department?.name || teacher.department}</div>
          </div>
          <div>
            <div className="text-gray-700 dark:text-gray-300 font-medium">Email:</div>
            <div className="text-gray-900 dark:text-white">{teacher.email}</div>
          </div>
          <div>
            <div className="text-gray-700 dark:text-gray-300 font-medium">Phone:</div>
            <div className="text-gray-900 dark:text-white">{teacher.phone || 'Not provided'}</div>
          </div>
          {teacher.loadAssigned && teacher.loadAssigned.length > 0 && (
            <div>
              <div className="text-gray-700 dark:text-gray-300 font-medium">Assigned Subjects:</div>
              <div className="text-gray-900 dark:text-white">{teacher.loadAssigned.join(', ')}</div>
            </div>
          )}
          {teacher.classAssigned && (
            <div>
              <div className="text-gray-700 dark:text-gray-300 font-medium">Assigned Class:</div>
              <div className="text-gray-900 dark:text-white">{teacher.classAssigned}</div>
            </div>
          )}
        </div>
      </div>

             {/* Timetable Section */}
       <div className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow">
         <h2 className="text-xl font-semibold mb-4 text-blue-800 dark:text-blue-200">Your Timetable</h2>
         {timetable && timetable.length > 0 ? (
           <div className="overflow-x-auto">
             <table className="min-w-full bg-white dark:bg-gray-700 rounded-lg overflow-hidden">
               <thead className="bg-blue-50 dark:bg-gray-600">
                 <tr>
                   <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Time</th>
                   <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Subject</th>
                   <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Class</th>
                   <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Room</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                 {timetable.map((slot, index) => (
                   <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-600">
                     <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{slot.time}</td>
                     <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{slot.subject}</td>
                     <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{slot.class}</td>
                     <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{slot.room || 'TBD'}</td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
         ) : (
           <div className="text-center py-8">
             <div className="text-gray-400 dark:text-gray-500 text-6xl mb-4">📅</div>
             <p className="text-gray-600 dark:text-gray-400">No timetable assigned yet.</p>
             <p className="text-sm text-gray-500 dark:text-gray-500">Your timetable will appear here once it's generated by the admin.</p>
           </div>
         )}
       </div>

       {/* Daily Tasks Section */}
       <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow">
         <h2 className="text-xl font-semibold mb-4 text-blue-800 dark:text-blue-200">Today's Tasks</h2>
         {tasks && tasks.length > 0 ? (
           <div className="space-y-3">
             {tasks.map((task, index) => (
               <div key={index} className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                 <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                 <div className="flex-1">
                   <p className="text-sm font-medium text-gray-900 dark:text-white">{task.title}</p>
                   <p className="text-xs text-gray-500 dark:text-gray-400">{task.description}</p>
                 </div>
                 <div className="text-xs text-gray-500 dark:text-gray-400">{task.time}</div>
               </div>
             ))}
           </div>
         ) : (
           <div className="text-center py-8">
             <div className="text-gray-400 dark:text-gray-500 text-6xl mb-4">✅</div>
             <p className="text-gray-600 dark:text-gray-400">No tasks assigned for today.</p>
             <p className="text-sm text-gray-500 dark:text-gray-500">Enjoy your day!</p>
           </div>
         )}
       </div>
    </div>
  );

  const renderSettingsContent = () => (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">⚙️ Settings</h1>
      
      {/* Profile Settings */}
      <div className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow">
        <h2 className="text-xl font-semibold mb-4 text-blue-800 dark:text-blue-200">Profile Settings</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
            <input
              type="text"
              defaultValue={teacher.fullName || teacher.name}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
            <input
              type="email"
              defaultValue={teacher.email}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone Number</label>
            <input
              type="tel"
              defaultValue={teacher.phone || ''}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
            Update Profile
          </button>
        </div>
      </div>

      {/* Password Settings */}
      <div className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow">
        <h2 className="text-xl font-semibold mb-4 text-blue-800 dark:text-blue-200">Change Password</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current Password</label>
            <input
              type="password"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">New Password</label>
            <input
              type="password"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Confirm New Password</label>
            <input
              type="password"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
            Change Password
          </button>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow">
        <h2 className="text-xl font-semibold mb-4 text-blue-800 dark:text-blue-200">Notification Settings</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">Email Notifications</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Receive notifications about your classes and tasks</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">Class Reminders</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Get reminded about upcoming classes</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

             {/* Theme Settings */}
       <div className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow">
         <h2 className="text-xl font-semibold mb-4 text-blue-800 dark:text-blue-200">Appearance</h2>
         <div className="space-y-4">
           <div className="flex items-center justify-between">
             <div>
               <h3 className="font-medium text-gray-900 dark:text-white">Theme</h3>
               <p className="text-sm text-gray-600 dark:text-gray-400">Choose your preferred theme</p>
             </div>
             <button
               onClick={handleThemeToggle}
               className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
             >
               <span>{isDarkMode ? '☀️' : '🌙'}</span>
               <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
             </button>
           </div>
         </div>
       </div>

       {/* Logout Section */}
       <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 shadow">
         <h2 className="text-xl font-semibold mb-4 text-red-800 dark:text-red-200">Account</h2>
         <div className="space-y-4">
           <p className="text-sm text-red-600 dark:text-red-400">
             Click the button below to securely log out of your account.
           </p>
           <button 
             onClick={handleLogout}
             className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors font-medium"
           >
             🚪 Logout
           </button>
         </div>
       </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      <TeacherSidebar 
        active={activePage} 
        onNavigate={handleNavigate} 
        onLogout={handleLogout} 
        onThemeToggle={handleThemeToggle}
        isDarkMode={isDarkMode}
      />
      <main className="flex-1 p-8">
        {activePage === 'dashboard' ? renderDashboardContent() : renderSettingsContent()}
      </main>
    </div>
  );
};

export default TeacherDashboard; 