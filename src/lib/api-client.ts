import axios from "axios";

const TOKEN_STORAGE_KEY = "access_token";
const LEGACY_TOKEN_STORAGE_KEY = "accessToken";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  timeout: 120000, // Increased to 2 minutes for heavy Excel processing
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
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
  }

  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }

  return config;
});

// Response interceptor: handle token expired
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect to login if we're not already on the login page
    if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(LEGACY_TOKEN_STORAGE_KEY);
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
