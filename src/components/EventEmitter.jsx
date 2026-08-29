import { useEffect, useState, useRef } from "react";
import { useStore } from "../store/store";
import { useApi } from "../hooks/useApi";
import { Send, Users } from "lucide-react";

export const EventEmitter = () => {
  const selectedChannel = useStore((state) => state.selectedChannel);
  const events = useStore((state) => state.events);
  const { emitEvent } = useApi();

  const [source, setSource] = useState("admin");
  const [targetMode, setTargetMode] = useState("all");
  const [selectedClients, setSelectedClients] = useState(new Set());
  const [payloadJson, setPayloadJson] = useState("{}");
  const [sending, setSending] = useState(false);
  const [clients, setClients] = useState([]);
  const lastEventIdRef = useRef(null); // Trackear último evento procesado

  // Escuchar eventos de cliente conectado/desconectado
  useEffect(() => {
    if (!events || events.length === 0 || !selectedChannel) return;

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
    }
  }, [events, selectedChannel]); // ← Con protección de duplicados

  const handleClientToggle = (clientId) => {
    const newSelected = new Set(selectedClients);
    if (newSelected.has(clientId)) {
      newSelected.delete(clientId);
    } else {
      newSelected.add(clientId);
    }
    setSelectedClients(newSelected);
  };

  const handleEmit = async (e) => {
    e.preventDefault();
    if (!selectedChannel) {
      alert("Selecciona un canal primero");
      return;
    }

    try {
      setSending(true);
      const payload = JSON.parse(payloadJson);

      const targetList =
        targetMode === "all"
          ? ["*"]
          : Array.from(selectedClients).length > 0
            ? Array.from(selectedClients)
            : ["*"];

      if (targetMode === "specific" && selectedClients.size === 0) {
        alert("Selecciona al menos un cliente");
        setSending(false);
        return;
      }

      await emitEvent(selectedChannel.id, source, targetList, payload);
      setPayloadJson("{}");
      setSelectedClients(new Set());
      alert(
        `Evento enviado a ${targetList.length === 1 && targetList[0] === "*" ? "todos" : targetList.length + " cliente(s)"}`,
      );
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setSending(false);
    }
  };

  if (!selectedChannel) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-500 text-center">
          Selecciona un canal para emitir eventos
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-4">Emitir Evento</h2>

      <form onSubmit={handleEmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Canal</label>
          <input
            type="text"
            value={selectedChannel.name}
            disabled
            className="w-full px-3 py-2 border rounded bg-gray-50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Source (origen)
          </label>
          <input
            type="text"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            placeholder="ej: admin, inmobiliaria, agente"
            className="w-full px-3 py-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Enviar a</label>
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="targetMode"
                value="all"
                checked={targetMode === "all"}
                onChange={() => setTargetMode("all")}
              />
              <span>📢 Todos los clientes (*)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="targetMode"
                value="specific"
                checked={targetMode === "specific"}
                onChange={() => setTargetMode("specific")}
              />
              <span>📍 Clientes específicos</span>
            </label>
          </div>
        </div>

        {targetMode === "specific" && (
          <div className="p-3 bg-gray-50 border rounded">
            <div className="flex items-center gap-2 mb-2 text-sm font-medium">
              <Users size={16} />
              Selecciona clientes ({selectedClients.size})
            </div>
            {clients.length === 0 ? (
              <p className="text-gray-500 text-sm">Sin clientes conectados</p>
            ) : (
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {clients.map((client) => (
                  <label
                    key={client.id}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedClients.has(client.id)}
                      onChange={() => handleClientToggle(client.id)}
                      className="w-4 h-4"
                    />
                    <span className="text-xs font-mono text-gray-700">
                      {client.id}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1">
            Payload (JSON)
          </label>
          <textarea
            value={payloadJson}
            onChange={(e) => setPayloadJson(e.target.value)}
            className="w-full px-3 py-2 border rounded font-mono text-sm h-32"
          />
        </div>

        <button
          type="submit"
          disabled={sending}
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:bg-gray-400 flex items-center justify-center gap-2"
        >
          <Send size={20} /> {sending ? "Enviando..." : "Emitir Evento"}
        </button>
      </form>
    </div>
  );
};
