import { useEffect, useState, useRef } from "react";
import { useStore } from "../store/store";
import { useApi } from "../hooks/useApi";
import { Users } from "lucide-react";

export const ClientsList = () => {
  const selectedChannel = useStore((state) => state.selectedChannel);
  const events = useStore((state) => state.events);
  const [clients, setClients] = useState([]);
  const clientIdRef = useRef(localStorage.getItem("clientId") || "unknown");
  const lastEventIdRef = useRef(null); // Trackear último evento procesado
  const { getClients } = useApi();

  // Inicializar clientes una sola vez cuando cambia el canal
  useEffect(() => {
    if (!selectedChannel) {
      setClients([]);
      return;
    }

    const initClients = async () => {
      try {
        const data = await getClients(selectedChannel.id);
        setClients(data);
      } catch (error) {
        console.error("Error fetching clients:", error);
        setClients([]);
      }
    };

    initClients();
  }, [selectedChannel]); // ← SOLO selectedChannel

  // Escuchar eventos de cliente conectado/desconectado
  useEffect(() => {
    if (!events || events.length === 0) return;

    const lastEvent = events[0];

    // Evitar procesar el mismo evento múltiples veces
    if (lastEventIdRef.current === lastEvent.id) return;

    if (
      lastEvent.payload?.type === "client_joined" ||
      lastEvent.payload?.type === "client_left"
    ) {
      lastEventIdRef.current = lastEvent.id; // Marcar como procesado

      const clientsList = lastEvent.payload?.clients || [];
      setClients(
        clientsList.map((id) => ({
          id,
          client_type: "WebSocket",
          connected_at: Math.floor(Date.now() / 1000),
        })),
      );

      console.log(
        `👥 ${lastEvent.payload.type}: ${lastEvent.payload.client_id}`,
      );
    }
  }, [events]); // ← Escuchar eventos, pero con protección de duplicados

  if (!selectedChannel) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-500 text-center">Selecciona un canal</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center gap-2 mb-4">
        <Users size={24} />
        <h3 className="text-xl font-bold">
          Clientes Conectados ({clients.length})
        </h3>
      </div>

      {clients.length === 0 ? (
        <p className="text-gray-500 text-center py-4">
          Sin clientes conectados
        </p>
      ) : (
        <div className="space-y-2">
          {clients.map((client) => (
            <div
              key={client.id}
              className={`p-3 border rounded transition ${
                client.id === clientIdRef.current
                  ? "bg-green-50 border-green-200"
                  : "bg-blue-50 border-blue-200"
              }`}
            >
              <div className="font-mono text-sm font-bold text-gray-900 break-all">
                {client.id}
                {client.id === clientIdRef.current && " (Tú)"}
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-600">
                <span>🟢 WebSocket</span>
                <span>
                  {new Date(client.connected_at * 1000).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
