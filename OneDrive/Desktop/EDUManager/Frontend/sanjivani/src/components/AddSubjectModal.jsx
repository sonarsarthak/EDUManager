import React, { useState } from 'react';

function AddSubjectModal({ open, onClose, onSubmit }) {
  const [form, setForm] = useState({ name: '', code: '', weeklyHours: '' });
  const [error, setError] = useState('');
  if (!open) return null;

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleSubmit = e => {
    e.preventDefault();
    if (!form.name || !form.code || !form.weeklyHours) {
      setError('All fields are required');
      return;
    }
    setError('');
    onSubmit({ ...form, weeklyHours: Number(form.weeklyHours) });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md relative animate-fade-in">
        <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-700" onClick={onClose}>&times;</button>
        <h3 className="text-xl font-bold mb-4">Add Subject</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Subject Name</label>
            <input type="text" name="name" value={form.name} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
          </div>
          <div>
            <label className="block mb-1 font-medium">Subject Code</label>
            <input type="text" name="code" value={form.code} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
          </div>
          {/* Remove semester field */}
          <div>
            <label className="block mb-1 font-medium">Weekly Hours</label>
            <input type="number" name="weeklyHours" value={form.weeklyHours} onChange={handleChange} className="w-full border rounded px-3 py-2" required min={1} />
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded w-full font-semibold">Add Subject</button>
        </form>
      </div>
    </div>
  );
}

export default AddSubjectModal; 