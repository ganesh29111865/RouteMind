/**
 * RouteMind API Client Service
 */
import axios from 'axios';

const API_BASE = '/api';

export const fetchRoutes = async () => {
  const res = await axios.get(`${API_BASE}/dataset/routes`);
  return res.data;
};

export const loginUser = async (email, password) => {
  const res = await axios.post(`${API_BASE}/auth/login`, { email, password });
  return res.data;
};

export const fetchCurrentUser = async (token) => {
  const res = await axios.get(`${API_BASE}/auth/me?token=${token}`);
  return res.data;
};

export const logoutUser = async (token) => {
  const res = await axios.post(`${API_BASE}/auth/logout?token=${token}`);
  return res.data;
};



export const fetchRouteById = async (routeId) => {
  const res = await axios.get(`${API_BASE}/dataset/route/${routeId}`);
  return res.data;
};

export const runBaselineOptimization = async (routeId) => {
  const res = await axios.post(`${API_BASE}/optimize/baseline?route_id=${routeId}`);
  return res.data;
};

export const runConstrainedOptimization = async (routeId, constraints = {}) => {
  const res = await axios.post(`${API_BASE}/optimize/constrained?route_id=${routeId}`, constraints);
  return res.data;
};

export const uploadDatasetFile = async (file) => {

  const formData = new FormData();
  formData.append('file', file);
  const res = await axios.post(`${API_BASE}/dataset/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data;
};

export const simulateDynamicEvent = async (routeId, event, constraints = {}) => {
  const res = await axios.post(`${API_BASE}/replan/simulate?route_id=${routeId}`, {
    event,
    constraints
  }, {
    headers: { 'Content-Type': 'application/json' }
  });
  return res.data;
};

export const fetchPendingApprovals = async () => {
  const res = await axios.get(`${API_BASE}/approval/pending`);
  return res.data;
};

export const processApprovalAction = async (requestId, action, notes = '') => {
  const res = await axios.post(`${API_BASE}/approval/action`, {
    request_id: requestId,
    action,
    supervisor_notes: notes
  });
  return res.data;
};

export const runBenchmark = async (routeId = 'ROUTE_AMZN_BOM_4001') => {
  const res = await axios.get(`${API_BASE}/benchmark/run?route_id=${routeId}`);
  return res.data;
};




