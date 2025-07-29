import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import { getDepartments, addDepartment, updateDepartment, deleteDepartment } from '../services/departmentService';
import DepartmentTable from '../components/DepartmentTable';
import AddDepartmentModal from '../components/AddDepartmentModal';
import EditDepartmentModal from '../components/EditDepartmentModal';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const departmentOptions = ['AIDS', 'ENTC', 'CIVIL', 'MECH', 'COMP', 'ELEC'];
const semesterOptions = [
  'SEM I', 'SEM II', 'SEM III', 'SEM IV', 'SEM V', 'SEM VI', 'SEM VII', 'SEM VIII'
];

function DepartmentDashboard() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('All');
  const [filterSem, setFilterSem] = useState('All');
  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [editDepartment, setEditDepartment] = useState(null);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [page, setPage] = useState(1);
  const perPage = 8;

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const data = await getDepartments();
      setDepartments(data);
    } catch (err) {
      toast.error('Failed to fetch departments');
    } finally {
      setLoading(false);
    }
  };

  // Filtered and paginated departments
  const filtered = departments.filter(d =>
    (d.name.toLowerCase().includes(search.toLowerCase())) &&
    (filterDept === 'All' || d.name === filterDept) &&
    (filterSem === 'All' || d.semester === filterSem)
  );
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  // Add
  const handleAdd = async (form) => {
    try {
      await addDepartment(form);
      toast.success('Department added!');
      setAddModal(false);
      fetchDepartments();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add department');
    }
  };

  // Edit
  const handleEdit = async (form) => {
    try {
      await updateDepartment(editDepartment._id, form);
      toast.success('Department updated!');
      setEditModal(false);
      fetchDepartments();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update department');
    }
  };

  // Delete
  const handleDelete = async () => {
    try {
      await deleteDepartment(deleteTarget._id);
      toast.success('Department deleted!');
      setDeleteModal(false);
      fetchDepartments();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete department');
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar active="Departments" />
      <main className="flex-1 p-8">
        <ToastContainer position="top-right" autoClose={2000} />
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Department Management</h1>
            <button
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold shadow"
              onClick={() => setAddModal(true)}
            >
              + Add Department
            </button>
          </div>
          
          <div className="flex gap-4 mb-4 flex-wrap">
            <input
              type="text"
              placeholder="Search by department name..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="border rounded px-3 py-2 w-64 bg-white dark:bg-gray-900 dark:text-white border-gray-300 dark:border-gray-700"
            />
            <select value={filterDept} onChange={e => setFilterDept(e.target.value)} className="border rounded px-3 py-2 bg-white dark:bg-gray-900 dark:text-white border-gray-300 dark:border-gray-700">
              <option value="All">All Departments</option>
              {departmentOptions.map(dep => (
                <option key={dep} value={dep}>{dep}</option>
              ))}
            </select>
            <select value={filterSem} onChange={e => setFilterSem(e.target.value)} className="border rounded px-3 py-2 bg-white dark:bg-gray-900 dark:text-white border-gray-300 dark:border-gray-700">
              <option value="All">All Semesters</option>
              {semesterOptions.map(sem => (
                <option key={sem} value={sem}>{sem}</option>
              ))}
            </select>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
            <DepartmentTable
              departments={paginated}
              loading={loading}
              page={page}
              setPage={setPage}
              perPage={perPage}
              total={filtered.length}
              onEdit={department => { setEditDepartment(department); setEditModal(true); }}
              onDelete={department => { setDeleteTarget(department); setDeleteModal(true); }}
            />
          </div>
        </div>
        
        {/* Modals */}
        {addModal && (
          <AddDepartmentModal
            open={addModal}
            onClose={() => setAddModal(false)}
            onSubmit={handleAdd}
          />
        )}
        {editModal && (
          <EditDepartmentModal
            open={editModal}
            onClose={() => setEditModal(false)}
            onSubmit={handleEdit}
            department={editDepartment}
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

export default DepartmentDashboard; 