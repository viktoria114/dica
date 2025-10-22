// api.ts
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // centralizado en un futuro
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor response
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error("Sesión expirada o token inválido");
      localStorage.removeItem("token");
    }
    return Promise.reject(error);
  }
);

export default api;
