import apiClient from "./axios";

export const getAdminDashboard = async () => {
  const res = await apiClient.get("/admin/dashboard");
  return res.data;
};

export const getUsers = async () => {
  const res = await apiClient.get("/admin/users");
  return res.data;
};

export const createUser = async (data) => {
  const res = await apiClient.post("/admin/users", data);
  return res.data;
};

export const updateUser = async (id, data) => {
  const res = await apiClient.put(`/admin/users/${id}`, data);
  return res.data;
};

export const activateUser = async (id) => {
  const res = await apiClient.patch(`/admin/users/${id}/activate`);
  return res.data;
};

export const deactivateUser = async (id) => {
  const res = await apiClient.patch(`/admin/users/${id}/deactivate`);
  return res.data;
};

export const resetPassword = async (id, password) => {
  const res = await apiClient.patch(`/admin/users/${id}/password`, { password });
  return res.data;
};

export const getPassword = async (id) => {
  const res = await apiClient.get(`/admin/users/${id}/password`);
  return res.data;
};

export const getAuditLogs = async () => {
  const res = await apiClient.get("/admin/audit");
  return res.data;
};
