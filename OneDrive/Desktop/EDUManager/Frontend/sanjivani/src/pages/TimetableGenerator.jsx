import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar.jsx';

const TimetableGenerator = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [excelLoading, setExcelLoading] = useState(false);
  const [excelMsg, setExcelMsg] = useState('');
  const [excelError, setExcelError] = useState('');
  const [stats, setStats] = useState({ departments: 0, subjects: 0, teachers: 0 });
  const [timetableStats, setTimetableStats] = useState(null);
  const [directUploadLoading, setDirectUploadLoading] = useState(false);
  const [directUploadResult, setDirectUploadResult] = useState(null);
  const [directUploadError, setDirectUploadError] = useState('');
  const [comprehensiveLoading, setComprehensiveLoading] = useState(false);
  const [comprehensiveResult, setComprehensiveResult] = useState(null);
  const [comprehensiveError, setComprehensiveError] = useState('');

  // Fetch stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [d, s, t] = await Promise.all([
          fetch('/api/departments').then(r => r.json()),
          fetch('/api/subjects').then(r => r.json()),
          fetch('/api/teachers').then(r => r.json()),
        ]);
        setStats({ departments: d.length, subjects: s.length, teachers: t.length });
      } catch {
        setStats({ departments: 0, subjects: 0, teachers: 0 });
      }
    };
    fetchStats();
  }, [excelMsg]);

  const handleExcelUpload = async (e) => {
    e.preventDefault();
    setExcelLoading(true);
    setExcelMsg('');
    setExcelError('');
    // Get the file from the input
    const fileInput = e.target.file || e.target.elements.file;
    const file = fileInput && fileInput.files && fileInput.files[0];
    if (!file) {
      setExcelError('No file selected');
      setExcelLoading(false);
      return;
    }
    const formData = new FormData();
    formData.append('file', file); // 'file' must match backend
    try {
      const res = await fetch('/api/departments/upload-excel', {
        method: 'POST',
        body: formData,
      });
      let data;
      try {
        data = await res.json();
      } catch (jsonErr) {
        throw new Error('Server returned an invalid response');
      }
      if (!res.ok) throw new Error(data.error || 'Failed to upload Excel');
      setExcelMsg(data.message || 'Excel data imported!');
    } catch (err) {
      setExcelError(err.message);
    } finally {
      setExcelLoading(false);
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    setResult(null);
    setError('');
    setTimetableStats(null);
    try {
      const res = await fetch('/api/departments/generate-timetable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate timetable');
      setResult(data);
      setTimetableStats(data.stats);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleComprehensiveGenerate = async () => {
    setComprehensiveLoading(true);
    setComprehensiveResult(null);
    setComprehensiveError('');
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found. Please login again.');
      }
      
      console.log('Sending request to generate comprehensive timetable...');
      
      const res = await fetch('/api/timetable/generate-comprehensive', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({}) // Add empty body for POST request
      });
      
      console.log('Response status:', res.status);
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${res.status}: ${res.statusText}`);
      }
      
      const data = await res.json();
      console.log('Response data:', data);
      setComprehensiveResult(data);
    } catch (err) {
      console.error('Error generating comprehensive timetable:', err);
      setComprehensiveError(err.message);
    } finally {
      setComprehensiveLoading(false);
    }
  };

  const handleDirectExcelUpload = async (e) => {
    e.preventDefault();
    setDirectUploadLoading(true);
    setDirectUploadResult(null);
    setDirectUploadError('');
    
    const file = e.target.file.files[0];
    if (!file) {
      setDirectUploadError('Please select a file');
      setDirectUploadLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/departments/generate-from-excel', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate timetable from Excel');
      setDirectUploadResult(data);
    } catch (err) {
      setDirectUploadError(err.message);
    } finally {
      setDirectUploadLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar active="Generate Timetable" />
      <main className="flex-1 p-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">🎯 Automated Timetable Generator</h1>
          
          {/* Comprehensive Timetable Generation Section */}
          <div className="mb-8 p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200 shadow dark:bg-gray-800 dark:border-gray-700 dark:shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-green-800 dark:text-white">🎓 Generate Comprehensive Timetable with Faculty Names</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Generate a complete timetable in the format you specified with faculty names included. 
              This will create an Excel file with days and periods, showing course information and faculty names.
            </p>
            <button
              onClick={handleComprehensiveGenerate}
              className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-700 hover:to-blue-700 transition-all dark:bg-green-600 dark:hover:bg-green-700"
              disabled={comprehensiveLoading}
            >
              {comprehensiveLoading ? '🔄 Generating...' : '🎓 Generate Comprehensive Timetable'}
            </button>
            {comprehensiveError && <div className="text-red-600 mt-2 p-2 bg-red-50 rounded dark:bg-red-900 dark:text-red-300">{comprehensiveError}</div>}
          </div>

          {/* Comprehensive Results */}
          {comprehensiveResult && (
            <div className="mb-8 bg-green-50 border border-green-200 rounded p-4 dark:bg-green-900 dark:border-green-700">
              <h2 className="text-xl font-semibold mb-2 text-green-800 dark:text-white">✅ Comprehensive Timetable Generated Successfully!</h2>
              
              {comprehensiveResult.stats && (
                <div className="mb-4 p-4 bg-white rounded border dark:bg-gray-700 dark:border-gray-600">
                  <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">📊 Generation Statistics</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{comprehensiveResult.stats.totalTeachers || 0}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Total Teachers</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">{comprehensiveResult.stats.totalSubjects || 0}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Total Subjects</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{comprehensiveResult.stats.days || 0}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Days</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600 dark:text-red-400">{comprehensiveResult.stats.periods || 0}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Periods</div>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="mt-4">
                <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">📥 Download Generated File</h3>
                <div className="flex flex-wrap gap-3">
                  <a 
                    href={comprehensiveResult.downloadUrl} 
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors dark:bg-green-600 dark:hover:bg-green-700"
                    download
                  >
                    📋 Download Comprehensive Timetable (Excel)
                  </a>
                </div>
              </div>
            </div>
          )}
          
          {comprehensiveResult && comprehensiveResult.timetable && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">📋 Timetable Preview</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full border text-sm bg-white dark:bg-gray-800">
                  <thead>
                    <tr>
                      <th className="border px-2 py-1">Day</th>
                      {['P1','P2','P3','P4','P5','P6'].map(period => (
                        <th key={period} className="border px-2 py-1">{period}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {['Mon','Tue','Wed','Thu','Fri','Sat'].map(day => (
                      <tr key={day}>
                        <td className="border px-2 py-1 font-bold">{day}</td>
                        {['P1','P2','P3','P4','P5','P6'].map(period => (
                          <td key={period} className="border px-2 py-1 whitespace-pre-line">
                            {comprehensiveResult.timetable[day]?.[period] || ''}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {/* Direct Excel Upload Section */}
          <div className="mb-8 p-6 bg-white rounded-lg border border-gray-200 shadow dark:bg-gray-800 dark:border-gray-700 dark:shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-blue-800 dark:text-white">🚀 Quick Generate from Excel</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">Upload an Excel file directly to generate timetables without saving to database first.</p>
            <form onSubmit={handleDirectExcelUpload} className="flex gap-4 items-center mb-3">
              <input 
                type="file" 
                name="file" 
                accept=".xlsx,.xls" 
                className="border rounded px-3 py-2 flex-1 bg-white dark:bg-gray-900 dark:border-gray-600 dark:text-white placeholder-gray-400 dark:placeholder-gray-500" 
                required
              />
              <button 
                type="submit" 
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all dark:bg-blue-600 dark:hover:bg-blue-700" 
                disabled={directUploadLoading}
              >
                {directUploadLoading ? '🔄 Generating...' : '⚡ Generate Timetable'}
              </button>
            </form>
            {directUploadError && <div className="text-red-600 mb-2 p-2 bg-red-50 rounded dark:bg-red-900 dark:text-red-300">{directUploadError}</div>}
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">📋 Expected columns: Branch, Semester, Course Code, Course Name, L/T/P, Main Faculty, Co-Faculty</div>
            <a 
              href="/api/departments/download-template" 
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium dark:text-blue-400 dark:hover:text-blue-300"
              download
            >
              📥 Download Excel Template
            </a>
          </div>

          {/* Database Upload Section */}
          <div className="mb-8 p-4 bg-gray-50 rounded border border-gray-200 shadow dark:bg-gray-900 dark:border-gray-700 dark:shadow-lg">
            <h2 className="text-lg font-semibold mb-2 dark:text-white">📥 Upload Excel to Database</h2>
            <form onSubmit={handleExcelUpload} className="flex gap-4 items-center mb-2">
              <input type="file" name="file" accept=".xlsx,.xls" className="border rounded px-2 py-1 bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white placeholder-gray-400 dark:placeholder-gray-500" />
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded dark:bg-blue-600 dark:hover:bg-blue-700" disabled={excelLoading}>{excelLoading ? 'Uploading...' : 'Upload'}</button>
            </form>
            {excelMsg && <div className="text-green-700 mb-2 dark:text-green-300">{excelMsg}</div>}
            {excelError && <div className="text-red-600 mb-2 dark:text-red-300">{excelError}</div>}
            <div className="text-sm text-gray-700 dark:text-gray-300">Accepted: .xlsx, .xls | This will import departments, subjects, and teachers to database.</div>
          </div>
          <div className="mb-8 p-4 bg-gray-50 rounded border border-gray-200 shadow dark:bg-gray-900 dark:border-gray-700 dark:shadow-lg">
            <h2 className="text-lg font-semibold mb-2 dark:text-white">📊 Current Database Summary</h2>
            <ul className="list-disc ml-6 text-gray-800 dark:text-gray-300">
              <li>Total Departments: <b>{stats.departments}</b></li>
              <li>Total Subjects: <b>{stats.subjects}</b></li>
              <li>Total Teachers: <b>{stats.teachers}</b></li>
            </ul>
          </div>
          <button
            onClick={handleGenerate}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold shadow mb-6 dark:bg-indigo-600 dark:hover:bg-indigo-700"
            disabled={loading}
          >
            {loading ? '🔄 Generating...' : '🎯 Generate from Database'}
          </button>
          {error && <div className="text-red-600 mb-4 dark:text-red-300">{error}</div>}
          
          {/* Direct Upload Results */}
          {directUploadResult && (
            <div className="bg-blue-50 border border-blue-200 rounded p-4 mt-4 dark:bg-blue-900 dark:border-blue-700">
              <h2 className="text-xl font-semibold mb-2 text-blue-800 dark:text-white">✅ Direct Timetable Generated Successfully!</h2>
              
              {directUploadResult.stats && (
                <div className="mb-4 p-4 bg-white rounded border dark:bg-gray-700 dark:border-gray-600">
                  <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">📊 Generation Statistics</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{directUploadResult.stats.courses || 0}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Total Courses</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">{directUploadResult.stats.sessions_scheduled || 0}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Sessions Scheduled</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{directUploadResult.stats.success_rate || 0}%</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Success Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600 dark:text-red-400">{directUploadResult.stats.conflicts || 0}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Conflicts</div>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="mt-4">
                <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">📥 Download Generated Files</h3>
                <div className="flex flex-wrap gap-3">
                  <a 
                    href={directUploadResult.downloadLinks?.class || '/api/departments/download/class_timetable.csv'} 
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors dark:bg-blue-600 dark:hover:bg-blue-700"
                    download
                  >
                    📋 Class Timetable (CSV)
                  </a>
                  <a 
                    href={directUploadResult.downloadLinks?.faculty || '/api/departments/download/faculty_timetable.csv'} 
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors dark:bg-green-600 dark:hover:bg-green-700"
                    download
                  >
                    👨‍🏫 Faculty Timetable (CSV)
                  </a>
                  <a 
                    href={directUploadResult.downloadLinks?.summary || '/api/departments/download/department_summary.csv'} 
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors dark:bg-purple-600 dark:hover:bg-purple-700"
                    download
                  >
                    📊 Department Summary (CSV)
                  </a>
                </div>
              </div>
            </div>
          )}
          
          {result && (
          <div className="bg-green-50 border border-green-200 rounded p-4 mt-4 dark:bg-green-900 dark:border-green-700">
            <h2 className="text-xl font-semibold mb-2 text-green-800 dark:text-white">✅ Timetable Generated Successfully!</h2>
            
            {timetableStats && (
              <div className="mb-4 p-4 bg-white rounded border dark:bg-gray-700 dark:border-gray-600">
                <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">📊 Generation Statistics</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{timetableStats.courses || 0}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Total Courses</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">{timetableStats.sessions_scheduled || 0}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Sessions Scheduled</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{timetableStats.success_rate || 0}%</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Success Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">{timetableStats.conflicts || 0}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Conflicts</div>
                  </div>
                </div>
                
                {timetableStats.faculty_summary && (
                  <div className="mt-4">
                    <h4 className="font-semibold mb-2 dark:text-white">👨‍🏫 Faculty Workload Summary</h4>
                    <div className="text-sm text-gray-700 dark:text-gray-300 max-h-32 overflow-y-auto">
                      {Object.entries(timetableStats.faculty_summary).slice(0, 5).map(([faculty, sessions]) => (
                        <div key={faculty} className="flex justify-between">
                          <span>{faculty}</span>
                          <span className="font-medium dark:text-gray-300">{sessions} sessions</span>
                        </div>
                      ))}
                      {Object.keys(timetableStats.faculty_summary).length > 5 && (
                        <div className="text-gray-500 italic dark:text-gray-400">... and {Object.keys(timetableStats.faculty_summary).length - 5} more</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">📥 Download Generated Files</h3>
              <div className="flex flex-wrap gap-3">
                <a 
                  href={result.downloadLinks?.class || '/api/departments/download/class_timetable.csv'} 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors dark:bg-blue-600 dark:hover:bg-blue-700"
                  download
                >
                  📋 Class Timetable (CSV)
                </a>
                <a 
                  href={result.downloadLinks?.faculty || '/api/departments/download/faculty_timetable.csv'} 
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors dark:bg-green-600 dark:hover:bg-green-700"
                  download
                >
                  👨‍🏫 Faculty Timetable (CSV)
                </a>
                <a 
                  href={result.downloadLinks?.summary || '/api/departments/download/department_summary.csv'} 
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors dark:bg-purple-600 dark:hover:bg-purple-700"
                  download
                >
                  📊 Department Summary (CSV)
                </a>
              </div>
            </div>
            
            {result.output && (
              <details className="mt-4">
                <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                  🔍 View Generation Log
                </summary>
                <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-3 rounded mt-2 overflow-x-auto whitespace-pre-wrap dark:text-gray-300">
                  {result.output}
                </pre>
              </details>
            )}
          </div>
        )}
      </div>
    </main>
  </div>
  );
};

export default TimetableGenerator; 