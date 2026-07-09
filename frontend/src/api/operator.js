import apiClient from "./axios";
import { jwtDecode } from "jwt-decode";

const getRole = () => {
  const token = sessionStorage.getItem("camtrace_token");
  if (!token) return null;
  try { return jwtDecode(token).role; } catch (e) { return null; }
};

export const startInspection = async (qrText) => {
  const res = await apiClient.post("/operator/inspection", { qr_text: qrText });
  return res.data;
};

export const getChecklist = async () => {
  const res = await apiClient.get("/operator/checklist");
  return res.data;
};

export const getInspection = async (id) => {
  const res = await apiClient.get(`/operator/inspection/${id}`);
  return res.data;
};

export const saveResponse = async (payload) => {
  const endpoint = getRole() === "MANAGER" ? "/manager/inspection/response" : "/operator/response";
  const res = await apiClient.put(endpoint, payload);
  return res.data;
};

export const uploadPhoto = async (inspectionId, checklistId, file) => {
  const formData = new FormData();
  formData.append("inspection_id", inspectionId);
  formData.append("checklist_id", checklistId);
  formData.append("file", file);
  const endpoint = getRole() === "MANAGER" ? "/manager/inspection/photo" : "/operator/photos";
  const res = await apiClient.post(endpoint, formData, { headers: { "Content-Type": "multipart/form-data" } });
  return res.data;
};

export const deletePhoto = async (photoId) => {
  const endpoint = getRole() === "MANAGER" ? `/manager/inspection/photo/${photoId}` : `/operator/photos/${photoId}`;
  const res = await apiClient.delete(endpoint);
  return res.data;
};

export const submitInspection = async (id) => {
  const endpoint = getRole() === "MANAGER" ? `/manager/inspection/${id}/submit` : `/operator/inspection/${id}/submit`;
  const res = await apiClient.post(endpoint);
  return res.data;
};
