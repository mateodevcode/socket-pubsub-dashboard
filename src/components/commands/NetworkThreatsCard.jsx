import { useState, useEffect } from "react";
import {
  FaSatelliteDish,
  FaShieldAlt,
  FaExclamationTriangle,
  FaCheckCircle,
  FaSyncAlt,
  FaHistory,
  FaTrashAlt,
  FaClock,
  FaDatabase,
} from "react-icons/fa";

export const NetworkThreatsCard = ({
  data,
  historyData,
  isLoading,
  onRefresh,
}) => {
  const [viewMode, setViewMode] = useState("live"); // "live" o "history"

  useEffect(() => {
    if (viewMode === "history" && (!historyData || historyData.length === 0)) {
      onRefresh("get_threats_history");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode]);

  const handleClearDB = () => {
    if (
      window.confirm(
        "⚠️ ¿Estás seguro de borrar TODO el historial de la base de datos? Esta acción no se puede deshacer.",
      )
    ) {
      onRefresh("clear_threats_db");
      setViewMode("live");
    }
  };

  const getLevelStyles = (level) => {
    switch (level) {
      case "CRITICAL":
        return "bg-rose-900/30 text-rose-400 border-rose-800";
      case "WARNING":
        return "bg-amber-900/30 text-amber-400 border-amber-800";
      default:
        return "bg-emerald-900/20 text-emerald-400 border-emerald-800";
    }
  };

  const getLevelIcon = (level) => {
    if (level === "CRITICAL")
      return <FaExclamationTriangle className="w-4 h-4" />;
    if (level === "WARNING") return <FaShieldAlt className="w-4 h-4" />;
    return <FaCheckCircle className="w-4 h-4" />;
  };

  const formatTime = (isoString) => {
    if (!isoString) return "N/A";
    const date = new Date(isoString);
    return date.toLocaleString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  // Decidir qué datos mostrar según el modo
  const displayData =
    viewMode === "live" ? data?.threats || [] : historyData || [];

  return (
    <div className="bg-transparent dark:bg-gray-800 rounded-xl shadow-sm border-2 border-gray-800 p-6 hover:shadow-lg transition-all duration-200 w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-900 rounded-lg border border-gray-700">
            {viewMode === "live" ? (
              <FaSatelliteDish className="w-6 h-6 text-cyan-500" />
            ) : (
              <FaDatabase className="w-6 h-6 text-purple-500" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-100">
              {viewMode === "live"
                ? "Radar de Amenazas"
                : "Historial Persistente (SQLite)"}
            </h3>
            <p className="text-xs text-gray-400">
              {viewMode === "live"
                ? "Monitoreo en tiempo real (Push WebSocket)"
                : "Últimas 5 apariciones por IP guardadas en disco"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {viewMode === "history" && (
            <button
              onClick={handleClearDB}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-900/30 hover:bg-rose-900/50 text-rose-400 border border-rose-800 rounded-lg text-xs font-medium transition-colors"
              title="Limpiar base de datos"
            >
              <FaTrashAlt className="w-3 h-3" />
              <span className="hidden sm:inline">Limpiar DB</span>
            </button>
          )}
          <button
            onClick={() =>
              setViewMode(viewMode === "live" ? "history" : "live")
            }
            className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-xs font-medium transition-colors ${
              viewMode === "history"
                ? "bg-purple-900/30 text-purple-400 border-purple-700"
                : "bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600"
            }`}
          >
            <FaHistory className="w-3 h-3" />
            {viewMode === "live" ? "Ver Historial" : "Volver a Tiempo Real"}
          </button>
          <button
            onClick={() =>
              onRefresh(
                viewMode === "live" ? "network_threats" : "get_threats_history",
              )
            }
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 text-gray-300 rounded-lg text-sm font-medium transition-colors border border-gray-600"
          >
            <FaSyncAlt className={isLoading ? "animate-spin" : ""} />
            {isLoading ? "..." : ""}
          </button>
        </div>
      </div>

      {/* Contenido de la lista */}
      {!data && viewMode === "live" && isLoading ? (
        <div className="text-center py-12 text-gray-500">Escaneando red...</div>
      ) : displayData.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          {viewMode === "history"
            ? "No hay registros en la base de datos."
            : "Sin conexiones externas activas detectadas."}
        </div>
      ) : (
        <div className="space-y-2 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
          {displayData.map((item, idx) => (
            <div
              key={`${item.ip}-${idx}`}
              className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${getLevelStyles(item.level)}`}
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  {getLevelIcon(item.level)}
                  <div className="flex flex-col">
                    <span className="font-mono text-sm font-bold">
                      {item.ip}
                    </span>
                    <div className="flex items-center gap-2 mt-1 text-[10px] opacity-80">
                      {item.country && item.country !== "XX" && (
                        <img
                          src={`https://flagcdn.com/w20/${item.country.toLowerCase()}.png`}
                          alt={item.country}
                          className="w-4 h-3 rounded-sm shadow-sm"
                          loading="lazy"
                        />
                      )}
                      <span className="font-bold tracking-wider">
                        {item.country}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <FaClock className="w-3 h-3" />
                        {viewMode === "history"
                          ? formatTime(item.timestamp)
                          : "Ahora"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-1 text-xs opacity-80">
                  <span className="px-2 py-0.5 bg-black/20 rounded font-mono">
                    Puertos: {item.ports}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-[10px] opacity-70 uppercase tracking-wide">
                    Conexiones
                  </p>
                  <p className="text-lg font-bold font-mono">
                    {item.connections}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold border ${getLevelStyles(item.level)}`}
                >
                  {item.level}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Leyenda */}
      <div className="mt-4 pt-4 border-t border-gray-700/50 flex flex-wrap gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <FaCheckCircle className="text-emerald-500" /> SAFE
        </span>
        <span className="flex items-center gap-1">
          <FaShieldAlt className="text-amber-500" /> WARNING
        </span>
        <span className="flex items-center gap-1">
          <FaExclamationTriangle className="text-rose-500" /> CRITICAL
        </span>
        {viewMode === "history" && (
          <span className="ml-auto text-[10px] opacity-70 flex items-center gap-1">
            <FaDatabase className="w-3 h-3" /> Datos persistentes
          </span>
        )}
      </div>
    </div>
  );
};
