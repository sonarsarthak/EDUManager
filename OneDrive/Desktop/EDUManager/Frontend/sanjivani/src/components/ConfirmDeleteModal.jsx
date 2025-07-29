import React from 'react';

function ConfirmDeleteModal({ open, onClose, onConfirm, subjectName }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md relative animate-fade-in text-center">
        <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-700" onClick={onClose}>&times;</button>
        <h3 className="text-xl font-bold mb-4">Delete Subject</h3>
        <p className="mb-6">Are you sure you want to delete subject <span className="font-semibold">{subjectName}</span>?</p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={onConfirm}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded font-semibold shadow"
          >
            Yes, Delete
          </button>
          <button
            onClick={onClose}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded font-semibold shadow"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDeleteModal; 