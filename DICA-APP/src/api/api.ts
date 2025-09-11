import axios from "axios";
import type { AxiosResponse, InternalAxiosRequestConfig } from "axios";

// Crear instancia de axios
const api = axios.create({
  baseURL: "http://localhost:3000/api", // Ajustá a tu backend
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor de request
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.set("Authorization", `Bearer ${token}`);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de response
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error("Sesión expirada o token inválido");
      localStorage.removeItem("token");
    }
    return Promise.reject(error);
  }
);

export default api;
