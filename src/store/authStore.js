import { create } from "zustand";
import api from "../lib/api";

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: !!localStorage.getItem("access_token"),

  login: async (username, password, otp_code) => {
    try {
      const response = await api.post("/auth/login", {
        username,
        password,
        otp_code,
      });
      const { access_token, refresh_token } = response.data;

      localStorage.setItem("access_token", access_token);
      localStorage.setItem("refresh_token", refresh_token);

      set({ user: { username }, isAuthenticated: true });
      return { success: true };
    } catch (error) {
      const message =
        error.response?.status === 401
          ? "Credenciales o código OTP incorrectos"
          : error.response?.status === 429
            ? "Demasiados intentos. Espera 60 segundos."
            : "Error de conexión con el servidor";
      return { success: false, message };
    }
  },

  logout: () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    set({ user: null, isAuthenticated: false });
  },
}));
