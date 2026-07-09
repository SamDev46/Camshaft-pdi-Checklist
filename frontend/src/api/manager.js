import apiClient from "./axios";
import { jwtDecode } from "jwt-decode";

const getRole = () => {
  const token = sessionStorage.getItem("camtrace_token");
  if (!token) return null;
  try { return jwtDecode(token).role; } catch (e) { return null; }
};

export const getDashboardStats = async () => {
  const res = await apiClient.get("/manager/dashboard");
  return res.data;
};

export const getInspections = async () => {
  const endpoint = getRole() === "ADMIN" ? "/admin/inspections" : "/manager/inspections";
  const res = await apiClient.get(endpoint);
  return res.data;
};

export const getInspectionDetails = async (id) => {
  const endpoint = getRole() === "ADMIN" ? `/admin/inspection/${id}` : `/manager/inspection/${id}`;
  const res = await apiClient.get(endpoint);
  return res.data;
};

export const getManagerChecklist = async () => {
  const endpoint = getRole() === "ADMIN" ? "/admin/checklist" : "/manager/checklist";
  const res = await apiClient.get(endpoint);
  return res.data;
};

export const createChecklist = async (data) => {
  const res = await apiClient.post("/manager/checklist", data);
  return res.data;
};

export const updateChecklist = async (id, data) => {
  const res = await apiClient.put(`/manager/checklist/${id}`, data);
  return res.data;
};

export const deleteChecklist = async (id) => {
  const res = await apiClient.delete(`/manager/checklist/${id}`);
  return res.data;
};
