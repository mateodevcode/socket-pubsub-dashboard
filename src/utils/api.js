import axios from "axios";

// Usa la variable de entorno, con un fallback por si acaso
const API_URL = import.meta.env.VITE_API_URL || "/api";

// Crear la instancia de Axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para agregar el token JWT automáticamente a cada petición
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token"); // O sessionStorage, según tu preferencia
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Interceptor para manejar errores de autenticación (ej: token expirado)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Aquí podrías limpiar el localStorage y redirigir al login
      console.warn("Sesión expirada o no autorizada. Redirigiendo al login...");
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      window.location.href = "/login"; // Descomenta cuando tengas la ruta de login
    }
    return Promise.reject(error);
  },
);

export default api;
