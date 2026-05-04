import axios from "axios";

// Get API host from window.__ENV__ (runtime) or import.meta.env (build time)
const getApiHost = () => {
  return (
    window.__ENV__?.VITE_REACT_APP_API_HOST ||
    import.meta.env.VITE_REACT_APP_API_HOST ||
    "http://localhost:5000"
  );
};

// Get token from localStorage
const getToken = () => localStorage.getItem("accessToken");

// Create axios instance with base configuration
const api = axios.create();

// Request interceptor: inject Authorization header and resolve baseURL
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Resolve baseURL on each request to support runtime env injection via window.__ENV__
  config.baseURL = getApiHost();
  return config;
});

// Response interceptor: handle 401 and auto-logout
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear auth data and redirect to login
      localStorage.removeItem("isAuthenticated");
      localStorage.removeItem("accessToken");
      window.location.href = "/session/signin";
    }
    return Promise.reject(error);
  }
);

export default api;
