import React, { useState, useEffect } from 'react';
import { getDepartments } from '../services/departmentService';
import { getSubjects } from '../services/subjectService';

function AddTeacherModal({ open, onClose, onSubmit, loading, error, form, onChange }) {
  const [departments, setDepartments] = useState([]);
  const [allSubjects, setAllSubjects] = useState([]);
  const [selectedSubjects, setSelectedSubjects] = useState([]);

  useEffect(() => {
    if (open) {
      getDepartments().then(setDepartments);
      getSubjects().then(setAllSubjects);
    }
  }, [open]);

  const handleDepartmentChange = (e) => {
    onChange(e);
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

  if (!open) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50 transition-opacity">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative animate-fade-in">
        <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-700" onClick={onClose}>&times;</button>
        <h3 className="text-xl font-bold mb-4">Add New Teacher</h3>
        <form onSubmit={e => onSubmit(e, selectedSubjects)} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Full Name</label>
            <input type="text" name="fullName" value={form.fullName} onChange={onChange} className="w-full border rounded px-3 py-2" required />
          </div>
          <div>
            <label className="block mb-1 font-medium">Email</label>
            <input type="email" name="email" value={form.email} onChange={onChange} className="w-full border rounded px-3 py-2" required />
          </div>
          <div>
            <label className="block mb-1 font-medium">Phone</label>
            <input type="text" name="phone" value={form.phone} onChange={onChange} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block mb-1 font-medium">Department</label>
            <select name="department" value={form.department} onChange={handleDepartmentChange} className="w-full border rounded px-3 py-2" required>
              <option value="">Select Department</option>
              {departments.map(dep => (
                <option key={dep._id} value={dep._id}>{dep.name}</option>
              ))}
            </select>
          </div>
          {departmentSubjects.length > 0 && (
            <div>
              <label className="block mb-1 font-medium">Subjects to Teach</label>
              <div className="border rounded p-2 max-h-40 overflow-y-auto">
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
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <button type="submit" className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-4 py-2 rounded w-full font-semibold hover:scale-105 transition-transform" disabled={loading}>{loading ? 'Adding...' : 'Add Teacher'}</button>
        </form>
      </div>
    </div>
  );
}

export default AddTeacherModal; 