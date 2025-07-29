const API_URL = 'http://localhost:5000/api/departments';

export const getDepartments = async () => {
  const response = await fetch(API_URL);
  if (!response.ok) {
    throw new Error('Failed to fetch departments');
  }
  return response.json();
};

export const getSubjects = async () => {
  const response = await fetch(`${API_URL}/subjects`);
  if (!response.ok) {
    throw new Error('Failed to fetch subjects');
  }
  return response.json();
};

export const addDepartment = async (departmentData) => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(departmentData),
  });
  if (!response.ok) {
    throw new Error('Failed to add department');
  }
  return response.json();
};

export const updateDepartment = async (id, departmentData) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(departmentData),
  });
  if (!response.ok) {
    throw new Error('Failed to update department');
  }
  return response.json();
};

export const deleteDepartment = async (id) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete department');
  }
  return response.json();
}; 