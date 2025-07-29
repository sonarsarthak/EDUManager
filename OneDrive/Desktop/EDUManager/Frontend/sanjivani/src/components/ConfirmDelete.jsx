import React from 'react';

function ConfirmDelete({ open, onClose, onConfirm, loading, teacherName, error }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50 transition-opacity">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm relative animate-fade-in">
        <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-700" onClick={onClose}>&times;</button>
        <h3 className="text-lg font-bold mb-4">Delete Teacher</h3>
        <p className="mb-4">Are you sure you want to delete <span className="font-semibold">{teacherName}</span>?</p>
        {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
        <div className="flex justify-end gap-2">
          <button className="px-4 py-2 rounded bg-gray-200" onClick={onClose} disabled={loading}>Cancel</button>
          <button className="px-4 py-2 rounded bg-gradient-to-r from-red-500 to-pink-600 text-white font-semibold hover:scale-105 transition-transform" onClick={onConfirm} disabled={loading}>{loading ? 'Deleting...' : 'Delete'}</button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDelete; 