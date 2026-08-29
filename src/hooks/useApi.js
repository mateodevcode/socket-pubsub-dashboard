import axios from "axios";
import { useStore } from "../store/store";
import { VITE_API_URL } from "../config/config";

const api = axios.create({
  baseURL: VITE_API_URL,
  headers: { "Content-Type": "application/json" },
});

export const useApi = () => {
  const setError = useStore((state) => state.setError);
  const clearError = useStore((state) => state.clearError);

  const handleError = (error) => {
    const message = error.response?.data?.error || error.message;
    setError(message);
  };

  return {
    // Canales
    createChannel: async (name, description) => {
      try {
        clearError();
        const response = await api.post("/channels", { name, description });
        return response.data.data;
      } catch (error) {
        handleError(error);
        throw error;
      }
    },

    getChannels: async () => {
      try {
        clearError();
        const response = await api.get("/channels");
        return response.data.data || [];
      } catch (error) {
        handleError(error);
        return [];
      }
    },

    getChannel: async (id) => {
      try {
        const response = await api.get(`/channels/${id}`);
        return response.data.data;
      } catch (error) {
        handleError(error);
        throw error;
      }
    },

    // Eventos
    emitEvent: async (channelId, source, targets, payload) => {
      try {
        clearError();
        const response = await api.post(`/channels/${channelId}/events`, {
          source,
          targets,
          payload,
        });
        return response.data;
      } catch (error) {
        handleError(error);
        throw error;
      }
    },

    // Clientes
    getClients: async (channelId) => {
      try {
        const response = await api.get(`/channels/${channelId}/clients`);
        return response.data.data || [];
      } catch (error) {
        handleError(error);
        return [];
      }
    },

    // Stats
    getStats: async () => {
      try {
        const response = await api.get("/stats");
        return response.data.data;
      } catch (error) {
        handleError(error);
        return { channels: 0, total_clients: 0 };
      }
    },
  };
};
