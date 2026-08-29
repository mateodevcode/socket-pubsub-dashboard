import { useStore } from "../store/store";
import { Trash2, Filter } from "lucide-react";
import { useState, useEffect } from "react";

export const EventLog = () => {
  const events = useStore((state) => state.events);
  const clearEvents = useStore((state) => state.clearEvents);
  const [clientId, setClientId] = useState("");
  const [showOnlyForMe, setShowOnlyForMe] = useState(false);

  // Obtener el clientId de la URL o localStorage
  useEffect(() => {
    const id = localStorage.getItem("clientId") || "unknown";
    setClientId(id);
  }, []);

  // Filtrar eventos si el usuario lo desea
  const filteredEvents = showOnlyForMe
    ? events.filter(
        (event) =>
          event.targets.includes("*") || event.targets.includes(clientId),
      )
    : events;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Eventos en Vivo</h2>
        <div className="flex gap-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showOnlyForMe}
              onChange={(e) => setShowOnlyForMe(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm flex items-center gap-1">
              <Filter size={16} /> Solo para mí
            </span>
          </label>
          <button
            onClick={clearEvents}
            className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 flex items-center gap-1"
          >
            <Trash2 size={16} /> Limpiar
          </button>
        </div>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto font-mono text-sm">
        {filteredEvents.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Sin eventos</p>
        ) : (
          filteredEvents.map((event, idx) => {
            const isForMe =
              event.targets.includes("*") || event.targets.includes(clientId);

            return (
              <div
                key={idx}
                className={`p-2 rounded border ${
                  isForMe
                    ? "bg-green-50 border-green-200"
                    : "bg-yellow-50 border-yellow-200 opacity-60"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-gray-600 text-xs">
                      {new Date(event.timestamp * 1000).toLocaleTimeString()}
                    </div>
                    <div className="font-semibold text-blue-600">
                      {event.channel}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      De: <span className="font-mono">{event.source}</span>
                    </div>
                  </div>
                  <div className="text-xs text-gray-600 text-right">
                    {event.targets.includes("*") ? (
                      <span className="bg-blue-100 px-2 py-1 rounded">
                        📢 Todos
                      </span>
                    ) : (
                      <span className="bg-purple-100 px-2 py-1 rounded">
                        📍 {event.targets.length} cliente(s)
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-gray-800 break-all mt-2 bg-white p-2 rounded text-xs">
                  {JSON.stringify(event.payload, null, 2).substring(0, 200)}
                  {JSON.stringify(event.payload).length > 200 && "..."}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
