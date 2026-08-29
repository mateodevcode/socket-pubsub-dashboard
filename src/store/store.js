import { create } from "zustand";

export const useStore = create((set) => ({
  // Estado
  channels: [],
  selectedChannel: null,
  clients: [],
  stats: { channels: 0, total_clients: 0 },
  events: [],
  isConnected: false,
  loading: false,
  error: null,

  // Metricas
  ramData: null,
  setRamData: (data) => set({ ramData: data }),

  // Acciones
  setChannels: (channels) => set({ channels }),
  setSelectedChannel: (channel) => set({ selectedChannel: channel }),
  setClients: (clients) => set({ clients }),
  setStats: (stats) => set({ stats }),
  addEvent: (event) =>
    set((state) => ({
      events: [event, ...state.events].slice(0, 100),
    })),
  setConnected: (connected) => set({ isConnected: connected }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
  clearEvents: () => set({ events: [] }),
}));
