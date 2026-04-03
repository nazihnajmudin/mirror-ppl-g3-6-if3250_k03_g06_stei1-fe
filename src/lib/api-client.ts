import axios from "axios";

const TOKEN_STORAGE_KEY = "access_token";
const LEGACY_TOKEN_STORAGE_KEY = "accessToken";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor: sisipkan JWT token ke setiap request
apiClient.interceptors.request.use((config) => {
  const token =
    localStorage.getItem(TOKEN_STORAGE_KEY) ||
    localStorage.getItem(LEGACY_TOKEN_STORAGE_KEY);

  // Migrate legacy key to the current key when available.
  if (!localStorage.getItem(TOKEN_STORAGE_KEY) && token) {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
    localStorage.removeItem(LEGACY_TOKEN_STORAGE_KEY);
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log("[API Client] Authorization header set with token");
  } else {
    console.log("[API Client] No token found in localStorage!");
  }
  return config;
});

// Response interceptor: handle token expired
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(LEGACY_TOKEN_STORAGE_KEY);
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;