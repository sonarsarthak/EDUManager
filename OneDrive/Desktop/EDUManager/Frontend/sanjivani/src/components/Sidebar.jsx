import React from 'react';
import { useNavigate } from 'react-router-dom';

const sidebarItems = [
  { label: 'Dashboard', path: '/dashboard', icon: '📊' },
  { label: 'Teachers', path: '/teachers', icon: '👨‍🏫' },
  { label: 'Subjects', path: '/subjects', icon: '📚' },
  { label: 'Departments', path: '/departments', icon: '🏢' },
  { label: 'Assign Workload', path: '/assign-workload', icon: '⚖️' },
  { label: 'Generate Timetable', path: '/TimetableGenerator', icon: '📅' },
  { label: 'Reports', path: '/reports', icon: '📈' },
  { label: 'Settings', path: '/settings', icon: '⚙️' },
];

function Sidebar({ active }) {
  const navigate = useNavigate();
  return (
    <aside className="w-64 bg-gradient-to-b from-blue-900 via-blue-800 to-blue-900 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-white flex flex-col py-6 px-4 min-h-screen shadow-xl">
      {/* Logo and Brand */}
      <div className="mb-8 text-center">
        <div className="text-3xl font-bold tracking-wider text-blue-100 mb-2">
          EDUManager
        </div>
        <div className="text-xs text-blue-300 tracking-widest">
          EDUCATION MANAGEMENT SYSTEM
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        {sidebarItems.map((item) => (
          <button
            key={item.label}
            className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center space-x-3 ${
              active === item.label 
                ? 'bg-blue-600 dark:bg-blue-700 text-white shadow-lg transform scale-105' 
                : 'hover:bg-blue-700/50 dark:hover:bg-gray-700 text-blue-100 dark:text-gray-200 hover:text-white'
            }`}
            onClick={() => navigate(item.path)}
          >
            <span className="text-lg">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
      
      {/* Footer */}
      <div className="mt-auto pt-4 border-t border-blue-700 dark:border-gray-700">
        <div className="text-center text-xs text-blue-300 dark:text-gray-400">
          <div>© 2024 EDUManager</div>
          <div className="mt-1">v2.0.0</div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar; 