import React from 'react';
import { MdEdit, MdDelete } from 'react-icons/md';

function TeacherTable({ teachers, onEdit, onDelete, search, setSearch, filter, setFilter, page, setPage, total, perPage }) {
  const departments = ['All', ...Array.from(new Set(teachers.map(t => t.department?.name || t.department)))];
  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}  
            className="border rounded px-3 py-2 w-64"
          />
          <select value={filter} onChange={e => setFilter(e.target.value)} className="border rounded px-3 py-2">
            {departments.map(dep => (
              <option key={dep} value={dep}>{dep}</option>
            ))}
          </select>
        </div>
        <div className="text-gray-500 text-sm">Total: {total}</div>
      </div>
      <div className="overflow-x-auto rounded-2xl shadow-lg">
        <table className="min-w-full text-sm text-left">
          <thead className="sticky top-0 bg-gray-100 z-10">
            <tr>
              <th className="py-3 px-4">Name</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">Department</th>
              <th className="py-3 px-4">Phone</th>
              <th className="py-3 px-4">Edit</th>
              <th className="py-3 px-4">Delete</th>
            </tr>
          </thead>
          <tbody>
            {teachers.length === 0 ? (
              <tr><td colSpan="6" className="text-center py-6">No teachers found.</td></tr>
            ) : (
              teachers.map(teacher => (
                <tr key={teacher._id} className="border-b hover:bg-gray-50 transition duration-200">
                  <td className="py-2 px-4 font-medium text-gray-800">{teacher.fullName}</td>
                  <td className="py-2 px-4 text-gray-600">{teacher.email}</td>
                  <td className="py-2 px-4 text-gray-600">{teacher.department?.name || teacher.department}</td>
                  <td className="py-2 px-4 text-gray-600">{teacher.phone}</td>
                  <td className="py-2 px-4">
                    <button className="text-blue-600 hover:text-blue-800 transition" onClick={() => onEdit(teacher)}>
                      <MdEdit size={20} />
                    </button>
                  </td>
                  <td className="py-2 px-4">
                    <button className="text-red-600 hover:text-red-800 transition" onClick={() => onDelete(teacher)}>
                      <MdDelete size={20} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Pagination placeholder */}
      <div className="flex justify-end mt-4 gap-2">
        <button className="px-3 py-1 rounded bg-gray-200" onClick={() => setPage(page - 1)} disabled={page === 1}>Prev</button>
        <span className="px-2">Page {page}</span>
        <button className="px-3 py-1 rounded bg-gray-200" onClick={() => setPage(page + 1)} disabled={teachers.length < perPage}>Next</button>
      </div>
    </div>
  );
}

export default TeacherTable; 