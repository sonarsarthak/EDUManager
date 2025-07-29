import React from 'react';
import { MdEdit, MdDelete } from 'react-icons/md';

function SubjectTable({ subjects, loading, page, setPage, perPage, total, onEdit, onDelete }) {
  const totalPages = Math.ceil(total / perPage);
  return (
    <div>
      <table className="min-w-full table-auto text-sm bg-white dark:bg-gray-900 rounded-xl overflow-hidden">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-800">
            <th className="px-3 py-2 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-200">Code</th>
            <th className="px-3 py-2 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-200">Name</th>
            {/* Remove Department and Semester columns */}
            <th className="px-3 py-2 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-200">Weekly Hours</th>
            <th className="px-3 py-2 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-200">Edit</th>
            <th className="px-3 py-2 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-200">Delete</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={5} className="text-center py-8 text-gray-700 dark:text-gray-200">Loading...</td></tr>
          ) : subjects.length === 0 ? (
            <tr><td colSpan={5} className="text-center py-8 text-gray-500 dark:text-gray-400">No subjects found.</td></tr>
          ) : (
            subjects.map(sub => (
              <tr key={sub._id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                <td className="border border-gray-200 dark:border-gray-700 px-3 py-2 text-gray-900 dark:text-gray-200">{sub.code}</td>
                <td className="border border-gray-200 dark:border-gray-700 px-3 py-2 text-gray-900 dark:text-gray-200">{sub.name}</td>
                {/* Remove Department and Semester cells */}
                <td className="border border-gray-200 dark:border-gray-700 px-3 py-2 text-gray-900 dark:text-gray-200">{sub.weeklyHours}</td>
                <td className="border border-gray-200 dark:border-gray-700 px-3 py-2 text-center">
                  <button onClick={() => onEdit(sub)} className="p-2 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900"><MdEdit className="text-indigo-600 dark:text-indigo-400 text-lg" /></button>
                </td>
                <td className="border border-gray-200 dark:border-gray-700 px-3 py-2 text-center">
                  <button onClick={() => onDelete(sub)} className="p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900"><MdDelete className="text-red-600 dark:text-red-400 text-lg" /></button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-end gap-2 mt-4">
          <button
            className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200"
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
          >Prev</button>
          <span className="px-2 dark:text-gray-200">Page {page} of {totalPages}</span>
          <button
            className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200"
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
          >Next</button>
        </div>
      )}
    </div>
  );
}

export default SubjectTable; 