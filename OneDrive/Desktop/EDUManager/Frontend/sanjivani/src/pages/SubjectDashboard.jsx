import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import { getSubjects, addSubject, updateSubject, deleteSubject } from '../services/subjectService';
import SubjectTable from '../components/SubjectTable';
import AddSubjectModal from '../components/AddSubjectModal';
import EditSubjectModal from '../components/EditSubjectModal';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const semesterOptions = [
  'SEM I', 'SEM II', 'SEM III', 'SEM IV', 'SEM V', 'SEM VI', 'SEM VII', 'SEM VIII'
];

function SubjectDashboard() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  // Remove filterSem state
  // const [filterSem, setFilterSem] = useState('All');
  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [editSubject, setEditSubject] = useState(null);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [page, setPage] = useState(1);
  const perPage = 8;

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const data = await getSubjects();
      setSubjects(data);
    } catch (err) {
      toast.error('Failed to fetch subjects');
    } finally {
      setLoading(false);
    }
  };

  // Filtered and paginated subjects
  const filtered = subjects.filter(s =>
    ((s.name && s.name.toLowerCase().includes(search.toLowerCase())) ||
      (s.code && s.code.toLowerCase().includes(search.toLowerCase())))
    // Remove semester filter
    //(filterSem === 'All' || s.semester === filterSem)
  );
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  // Add
  const handleAdd = async (form) => {
    try {
      await addSubject(form);
      toast.success('Subject added!');
      setAddModal(false);
      fetchSubjects();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add subject');
    }
  };
  // Edit
  const handleEdit = async (form) => {
    try {
      await updateSubject(editSubject._id, form);
      toast.success('Subject updated!');
      setEditModal(false);
      fetchSubjects();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update subject');
    }
  };
  // Delete
  const handleDelete = async () => {
    try {
      await deleteSubject(deleteTarget._id);
      toast.success('Subject deleted!');
      setDeleteModal(false);
      fetchSubjects();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete subject');
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar active="Subjects" />
      <main className="flex-1 p-8">
        <ToastContainer position="top-right" autoClose={2000} />
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Subject Management</h1>
            <button
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold shadow"
              onClick={() => setAddModal(true)}
            >
              + Add Subject
            </button>
          </div>
          <div className="flex gap-4 mb-4 flex-wrap">
            <input
              type="text"
              placeholder="Search by name or code..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="border rounded px-3 py-2 w-64 bg-white dark:bg-gray-900 dark:text-white border-gray-300 dark:border-gray-700"
            />
            {/* Remove semester filter dropdown */}
            {/*
            <select value={filterSem} onChange={e => setFilterSem(e.target.value)} className="border rounded px-3 py-2">
              <option value="All">All Semesters</option>
              {semesterOptions.map(sem => (
                <option key={sem} value={sem}>{sem}</option>
              ))}
            </select>
            */}
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
            <SubjectTable
              subjects={paginated}
              loading={loading}
              page={page}
              setPage={setPage}
              perPage={perPage}
              total={filtered.length}
              onEdit={subject => { setEditSubject(subject); setEditModal(true); }}
              onDelete={subject => { setDeleteTarget(subject); setDeleteModal(true); }}
            />
          </div>
        </div>
        {/* Modals */}
        {addModal && (
          <AddSubjectModal
            open={addModal}
            onClose={() => setAddModal(false)}
            onSubmit={handleAdd}
            // Remove semesterOptions
          />
        )}
        {editModal && (
          <EditSubjectModal
            open={editModal}
            onClose={() => setEditModal(false)}
            onSubmit={handleEdit}
            form={editSubject}
            // Remove semesterOptions
          />
        )}
        {deleteModal && (
          <ConfirmDeleteModal
            open={deleteModal}
            onClose={() => setDeleteModal(false)}
            onConfirm={handleDelete}
            subjectName={deleteTarget?.name}
          />
        )}
      </main>
    </div>
  );
}

export default SubjectDashboard; 