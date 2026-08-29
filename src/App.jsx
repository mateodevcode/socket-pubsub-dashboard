import { useEffect, useState } from "react";
import { useStore } from "./store/store";
import { useApi } from "./hooks/useApi";
import { useWebSocket } from "./hooks/useWebSocket";
import { EventEmitter } from "./components/EventEmitter";
import { EventLog } from "./components/EventLog";
import { Stats } from "./components/Stats";
import { AlertCircle } from "lucide-react";
import { ChannelList } from "./components/ChannelList";
import { ClientsList } from "./components/ClientsList";

function App() {
  const [clientId] = useState(
    "dashboard-" + Math.random().toString(36).substr(2, 9),
  );

  const selectedChannel = useStore((state) => state.selectedChannel);
  const error = useStore((state) => state.error);
  const clearError = useStore((state) => state.clearError);

  const setChannels = useStore((state) => state.setChannels);
  const setStats = useStore((state) => state.setStats);

  const { getChannels, getStats } = useApi();

  // WebSocket connection
  useWebSocket(selectedChannel?.id, clientId);

  // Cargar datos iniciales - Solo se ejecuta UNA VEZ al montar
  useEffect(() => {
    const loadData = async () => {
      try {
        const chans = await getChannels();
        setChannels(chans);
        const s = await getStats();
        setStats(s);
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };

    // Cargar inmediatamente
    loadData();

    // Actualizar cada 5 segundos
    const interval = setInterval(loadData, 5000);

    // Limpiar al desmontar
    return () => clearInterval(interval);
  }, []); // ← ARRAY VACÍO: Se ejecuta solo una vez

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">
            Socket Pub/Sub Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Tu ID:{" "}
            <code className="bg-gray-200 px-2 py-1 rounded">{clientId}</code>
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 rounded flex items-center gap-3">
            <AlertCircle className="text-red-600" />
            <div>
              <p className="font-semibold text-red-800">{error}</p>
              <button
                onClick={clearError}
                className="text-sm text-red-600 hover:text-red-800 underline"
              >
                Descartar
              </button>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="mb-8">
          <Stats />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Channel List */}
          <div>
            <ChannelList
              onSelect={(channel) =>
                useStore.setState({ selectedChannel: channel })
              }
            />
          </div>

          {/* Right: Event Emitter, Clients, and Log */}
          <div className="lg:col-span-2 space-y-6">
            <EventEmitter />
            <ClientsList />
            <EventLog />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
