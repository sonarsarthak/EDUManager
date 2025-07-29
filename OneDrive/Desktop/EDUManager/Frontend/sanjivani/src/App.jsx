import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminDashboard from './pages/AdminDashboard.jsx';
import Login from './pages/login.jsx';
import TeachersPage from './pages/TeachersPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import CreateAccount from './pages/createAccount.jsx';
import SubjectDashboard from './pages/SubjectDashboard.jsx';
import DepartmentDashboard from './pages/DepartmentDashboard.jsx';
import TimetableGenerator from './pages/TimetableGenerator.jsx';
import TeacherDashboard from './pages/TeacherDashboard.jsx';

// Placeholder components for missing pages
const AssignWorkloadPage = () => <div className="p-8">Assign Workload Page (to be implemented)</div>;
const GenerateTimetablePage = () => <div className="p-8">Generate Timetable Page (to be implemented)</div>;
const ReportsPage = () => <div className="p-8">Reports Page (to be implemented)</div>;

function App() {
  useEffect(() => {
    // Apply saved theme on app load
    const savedTheme = localStorage.getItem('theme') || 'light';
    const root = document.documentElement;
    if (savedTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/create-account" element={<CreateAccount />} />
      <Route path="/dashboard" element={<AdminDashboard />} />
      <Route path="/teachers" element={<TeachersPage />} />
      <Route path="/subjects" element={<SubjectDashboard />} />
      <Route path="/departments" element={<DepartmentDashboard />} />
      <Route path="/assign-workload" element={<AssignWorkloadPage />} />
      <Route path="/TimetableGenerator" element={<TimetableGenerator />} />
      <Route path="/reports" element={<ReportsPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
    </Routes>
  );
}

export default App; 