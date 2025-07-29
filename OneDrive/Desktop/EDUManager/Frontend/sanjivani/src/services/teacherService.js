const API = '/api/teachers';

export async function getTeachers() {
  const res = await fetch(API);
  if (!res.ok) throw new Error('Failed to fetch teachers');
  return res.json();
}

export async function addTeacher(data) {
  const res = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error((await res.json()).error || 'Failed to add teacher');
  return res.json();
}

export async function updateTeacher(id, data) {
  const res = await fetch(`${API}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error((await res.json()).error || 'Failed to update teacher');
  return res.json();
}

export async function deleteTeacher(id) {
  const res = await fetch(`${API}/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error((await res.json()).error || 'Failed to delete teacher');
  return res.json();
} 