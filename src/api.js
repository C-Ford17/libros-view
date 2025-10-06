import axios from "axios";

// Centralized Axios instance for the app
const api = axios.create({
  baseURL: "http://localhost:8080",
  headers: { "Content-Type": "application/json" },
});

// Attach Authorization header from localStorage on every request, except for public GET endpoints
api.interceptors.request.use((config) => {
  const method = (config.method || "get").toLowerCase();
  const url = (config.url || "").toString();

  // Detect public GET endpoints configured as permitAll in backend security chain
  const isPublicGet =
    method === "get" && (
      url.includes("/api/v1/clients/") ||
      url.endsWith("/api/v1/clients") ||
      url.includes("/api/v1/titles")
    );

  if (!isPublicGet) {
    const token = window.localStorage.getItem("auth-token");
    if (token) {
      config.headers = config.headers || {};
      config.headers["Authorization"] = `Bearer ${token}`;
    }
  }
  return config;
});

// Normalize 401 handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      // optional: notify listeners so UI can react (e.g., hide auth-only UI)
      window.dispatchEvent(new Event("auth-changed"));
    }
    return Promise.reject(error);
  }
);

export default api;
