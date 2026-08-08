import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://routemind-1.onrender.com/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const uploadDataset = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await axios.post(`${API_BASE_URL}/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const optimizeRoute = async (params) => {
  const response = await api.post('/optimize', params);
  return response.data;
};

export const replanRoute = async (params) => {
  const response = await api.post('/replan', params);
  return response.data;
};

export const fetchRoutes = async () => {
  const response = await api.get('/routes');
  return response.data;
};

export const fetchRouteById = async (id) => {
  const response = await api.get(`/routes/${id}`);
  return response.data;
};

export const fetchPendingApprovals = async () => {
  const response = await api.get('/approvals/pending');
  return response.data;
};

export const approveRoute = async (approvalId, reason = '') => {
  const response = await api.post('/approve', { approval_id: approvalId, reason });
  return response.data;
};

export const rejectRoute = async (approvalId, reason = '') => {
  const response = await api.post('/reject', { approval_id: approvalId, reason });
  return response.data;
};

export const fetchMetrics = async () => {
  const response = await api.get('/metrics');
  return response.data;
};

export const fetchAIExplanation = async (params) => {
  const response = await api.post('/explain', params);
  return response.data;
};
