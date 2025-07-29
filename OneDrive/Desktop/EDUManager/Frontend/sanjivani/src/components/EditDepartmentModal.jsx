import React, { useState, useEffect } from 'react';
import { getSubjects } from '../services/departmentService';

const EditDepartmentModal = ({ open, onClose, onSubmit, department }) => {
  const [form, setForm] = useState({
    name: '',
    semester: '',
    subjects: []
  });
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && department) {
      setForm({
        name: department.name || '',
        semester: department.semester || '',
        subjects: department.subjects?.map(subject => subject._id) || []
      });
      fetchSubjects();
    }
  }, [open, department]);

  const fetchSubjects = async () => {
    try {
      const subjects = await getSubjects();
      setAvailableSubjects(subjects);
    } catch (error) {
      console.error('Failed to fetch subjects:', error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.semester.trim()) {
      alert('Please fill in all required fields');
      return;
    }
    onSubmit(form);
  };

  const handleSubjectToggle = (subjectId) => {
    setForm(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subjectId)
        ? prev.subjects.filter(id => id !== subjectId)
        : [...prev.subjects, subjectId]
    }));
  };

  const filteredSubjects = availableSubjects.filter(subject => 
    subject.department === form.name || !form.name
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Edit Department</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Department Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department Name *
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter department name"
                required
              />
            </div>

            {/* Semester */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Semester *
              </label>
              <select
                value={form.semester}
                onChange={(e) => setForm(prev => ({ ...prev, semester: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              >
                <option value="">Select Semester</option>
                <option value="SEM I">SEM I</option>
                <option value="SEM II">SEM II</option>
                <option value="SEM III">SEM III</option>
                <option value="SEM IV">SEM IV</option>
                <option value="SEM V">SEM V</option>
                <option value="SEM VI">SEM VI</option>
                <option value="SEM VII">SEM VII</option>
                <option value="SEM VIII">SEM VIII</option>
              </select>
            </div>

            {/* Subjects Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Subjects ({form.subjects.length} selected)
              </label>
              <div className="border border-gray-300 rounded-md p-3 max-h-48 overflow-y-auto">
                {filteredSubjects.length > 0 ? (
                  <div className="space-y-2">
                    {filteredSubjects.map((subject) => (
                      <label key={subject._id} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.subjects.includes(subject._id)}
                          onChange={() => handleSubjectToggle(subject._id)}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-sm text-gray-700">
                          {subject.name} ({subject.code}) - {subject.semester}
                        </span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">
                    {form.name 
                      ? `No subjects found for ${form.name} department. Add subjects first.`
                      : 'Select a department to see available subjects.'
                    }
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Department'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditDepartmentModal; 