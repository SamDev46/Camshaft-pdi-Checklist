import axios from "axios";
import { API_BASE_URL, API_TIMEOUT } from "../constants/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
});

apiClient.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("camtrace_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Offline / Network Error detection
    if (!error.response) {
      error.response = {
        data: { detail: "No internet connection. Please check your network and try again." }
      };
      return Promise.reject(error);
    }
    
    // Standardize backend error responses from Phase 8 global handler
    if (error.response.data && typeof error.response.data.success !== 'undefined') {
      if (!error.response.data.success) {
        error.response.data.detail = error.response.data.message;
      }
    }

    if (error.response.status === 401) {
      if (error.config.url !== '/auth/login') {
          sessionStorage.removeItem("camtrace_token");
          window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
