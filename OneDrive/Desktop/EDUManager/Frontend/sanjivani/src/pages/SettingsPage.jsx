import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

function SettingsPage() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState('light');
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    // Load saved theme from localStorage
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  const applyTheme = (selectedTheme) => {
    const root = document.documentElement;
    if (selectedTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', selectedTheme);
  };

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    applyTheme(newTheme);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.clear();
    navigate('/login', { replace: true });
  };

  const handleExportData = () => {
    // Placeholder for data export functionality
    alert('Data export feature will be implemented soon!');
  };

  const handleBackupData = () => {
    // Placeholder for backup functionality
    alert('Backup feature will be implemented soon!');
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar active="Settings" />
      
      <div className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Settings & Preferences
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Customize your EDUManager experience
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Appearance Settings */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <span className="mr-2">🎨</span>
              Appearance
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Theme
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleThemeChange('light')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      theme === 'light'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2">☀️</div>
                      <div className="font-medium text-gray-900 dark:text-white">Light</div>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => handleThemeChange('dark')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      theme === 'dark'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2">🌙</div>
                      <div className="font-medium text-gray-900 dark:text-white">Dark</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Notifications Settings */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <span className="mr-2">🔔</span>
              Notifications
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">Email Notifications</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Receive updates via email</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications}
                    onChange={(e) => setNotifications(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">Auto Refresh</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Auto-refresh dashboard data</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoRefresh}
                    onChange={(e) => setAutoRefresh(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Data Management */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <span className="mr-2">💾</span>
              Data Management
            </h3>
            
            <div className="space-y-3">
              <button
                onClick={handleExportData}
                className="w-full flex items-center justify-between p-3 text-left bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">Export Data</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Download your data as CSV</div>
                </div>
                <span className="text-gray-400">📤</span>
              </button>
              
              <button
                onClick={handleBackupData}
                className="w-full flex items-center justify-between p-3 text-left bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">Backup Data</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Create a backup of your data</div>
                </div>
                <span className="text-gray-400">💿</span>
              </button>
            </div>
          </div>

          {/* Account Actions */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <span className="mr-2">👤</span>
              Account
            </h3>
            
            <div className="space-y-3">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-between p-3 text-left bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
              >
                <div>
                  <div className="font-medium text-red-700 dark:text-red-400">Sign Out</div>
                  <div className="text-sm text-red-600 dark:text-red-500">Logout from your account</div>
                </div>
                <span className="text-red-400">🚪</span>
              </button>
            </div>
          </div>
        </div>

        {/* Legal & About */}
        <div className="mt-8 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <span className="mr-2">📋</span>
            Legal & About
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => setShowTerms(true)}
              className="text-left p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <div className="font-medium text-gray-900 dark:text-white">Terms & Conditions</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Read our terms of service</div>
            </button>
            
            <button
              onClick={() => setShowPrivacy(true)}
              className="text-left p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <div className="font-medium text-gray-900 dark:text-white">Privacy Policy</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Learn about data privacy</div>
            </button>
          </div>
          
          {/* Developer Info */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                Developed with ❤️ by
              </div>
              <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                AadeshSofTech Solutions
              </div>
              <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                EDUManager v2.0.0
              </div>
            </div>
          </div>
        </div>

        {/* Terms & Conditions Modal */}
        {showTerms && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Terms & Conditions</h3>
                  <button
                    onClick={() => setShowTerms(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    ✕
                  </button>
                </div>
                <div className="text-gray-700 dark:text-gray-300 space-y-4">
                  <p>By using EDUManager, you agree to the following terms:</p>
                  <ul className="list-disc list-inside space-y-2">
                    <li>You will use the system responsibly and ethically</li>
                    <li>All data entered must be accurate and up-to-date</li>
                    <li>You will not share your login credentials</li>
                    <li>The system is for educational purposes only</li>
                    <li>We reserve the right to modify these terms</li>
                  </ul>
                  <p className="text-sm text-gray-500">Last updated: December 2024</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Privacy Policy Modal */}
        {showPrivacy && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Privacy Policy</h3>
                  <button
                    onClick={() => setShowPrivacy(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    ✕
                  </button>
                </div>
                <div className="text-gray-700 dark:text-gray-300 space-y-4">
                  <p>Your privacy is important to us. This policy explains how we handle your data:</p>
                  <ul className="list-disc list-inside space-y-2">
                    <li>We collect only necessary information for system functionality</li>
                    <li>Your data is stored securely and encrypted</li>
                    <li>We do not share your data with third parties</li>
                    <li>You can request data deletion at any time</li>
                    <li>We use cookies for essential functionality only</li>
                  </ul>
                  <p className="text-sm text-gray-500">Last updated: December 2024</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SettingsPage; 