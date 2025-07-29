import axios from 'axios';

const API = '/api/subjects';

export async function getSubjects() {
  const res = await axios.get(API);
  return res.data;
}

export async function addSubject(data) {
  const res = await axios.post(API, data);
  return res.data;
}

export async function updateSubject(id, data) {
  const res = await axios.put(`${API}/${id}`, data);
  return res.data;
}

export async function deleteSubject(id) {
  const res = await axios.delete(`${API}/${id}`);
  return res.data;
} 