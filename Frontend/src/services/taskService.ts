import axios from "axios";

const API_URL = "http://localhost:5000/api/tasks";

export const getTasks = async () => {
  const res = await axios.get(API_URL);
  return res.data;
};

export const createTask = async (task: any) => {
  const res = await axios.post(API_URL, task);
  return res.data;
};

export const applyToTask = async (taskId: string, userId: string) => {
  const res = await axios.post(`${API_URL}/${taskId}/apply`, { userId });
  return res.data;
};

export const assignTask = async (taskId: string, userId: string) => {
  const res = await axios.post(`${API_URL}/${taskId}/assign`, { userId });
  return res.data;
};

export const completeTask = async (taskId: string) => {
  const res = await axios.post(`${API_URL}/${taskId}/complete`);
  return res.data;
};

export const deleteTask = async (taskId: string) => {
  const res = await axios.delete(`${API_URL}/${taskId}`);
  return res.data;
};
export const updateTask = async (taskId: string, updates: any) => {
  const res = await axios.put(`${API_URL}/${taskId}`, updates);
  return res.data;
};

export const getTaskStats = async () => {
  const res = await axios.get(`${API_URL}/stats/summary`);
  return res.data; 
};
