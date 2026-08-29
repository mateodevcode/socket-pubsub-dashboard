import {
  FaSkull,
  FaUserShield,
  FaExclamationTriangle,
  FaCheckCircle,
} from "react-icons/fa";

export const TopAttackersCard = ({ data, adminIp, isLoading }) => {
  // 👇 NUEVA FUNCIÓN: Clasificación inteligente
  const getThreatLevel = (item) => {
    // 1. Si es mi IP, siempre es ADMIN (azul)
    if (adminIp && item.ip === adminIp) {
      return {
        level: "ADMIN",
        color: "bg-blue-900/30 text-blue-400 border-blue-700",
        pulse: false,
      };
    }

    const total = item.total_connections || 0;

    // 2. Clasificación por cantidad de conexiones
    if (total > 30) {
      return {
        level: "CRITICAL",
        color: "bg-rose-900/40 text-rose-300 border-rose-600",
        pulse: true,
      };
    }
    if (total > 20) {
      return {
        level: "CRITICAL",
        color: "bg-rose-900/30 text-rose-400 border-rose-800",
        pulse: false,
      };
    }
    if (total > 5) {
      return {
        level: "WARNING",
        color: "bg-amber-900/30 text-amber-400 border-amber-800",
        pulse: false,
      };
    }
    return {
      level: "SAFE",
      color: "bg-emerald-900/20 text-emerald-400 border-emerald-800",
      pulse: false,
    };
  };

  const getLevelIcon = (level) => {
    switch (level) {
      case "ADMIN":
        return <FaUserShield className="w-4 h-4" />;
      case "CRITICAL":
        return <FaSkull className="w-4 h-4" />;
      case "WARNING":
        return <FaExclamationTriangle className="w-4 h-4" />;
      default:
        return <FaCheckCircle className="w-4 h-4" />;
    }
  };

  const formatTime = (isoString) => {
    if (!isoString) return "N/A";
    const date = new Date(isoString);
    return date.toLocaleString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="bg-transparent dark:bg-gray-800 rounded-xl shadow-sm border-2 border-gray-800 p-6 hover:shadow-lg transition-all duration-200 w-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-900 rounded-lg border border-gray-700">
            <FaSkull className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-100">
              Top Atacantes Acumulados
            </h3>
            <p className="text-xs text-gray-400">
              IPs ordenadas por volumen total • Tu IP marcada como protegida
            </p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-500">
          Cargando historial...
        </div>
      ) : !data || data.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No hay atacantes registrados aún.
        </div>
      ) : (
        <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
          {data.map((item, idx) => {
            const threat = getThreatLevel(item);

            return (
              <div
                key={item.ip}
                className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${threat.color} ${threat.pulse ? "animate-pulse" : ""}`}
              >
                <div className="flex items-center gap-4">
                  <div className="text-2xl font-bold text-gray-500 w-8">
                    #{idx + 1}
                  </div>
                  {getLevelIcon(threat.level)}
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold">
                        {item.ip}
                      </span>
                      {threat.level === "ADMIN" && (
                        <span className="text-[10px] bg-blue-800 text-blue-200 px-1.5 py-0.5 rounded font-bold">
                          🏠 TÚ
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-[10px] opacity-80">
                      {item.country && item.country !== "XX" && (
                        <img
                          src={`https://flagcdn.com/w20/${item.country.toLowerCase()}.png`}
                          alt={item.country}
                          className="w-4 h-3 rounded-sm"
                        />
                      )}
                      <span className="font-bold">{item.country}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-[10px] opacity-70 uppercase">Total</p>
                    <p className="text-xl font-bold font-mono">
                      {item.total_connections}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] opacity-70 uppercase">Puertos</p>
                    <p className="text-xs font-mono">{item.ports}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] opacity-70 uppercase">
                      Primera vez
                    </p>
                    <p className="text-xs">{formatTime(item.first_seen)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] opacity-70 uppercase">
                      Última vez
                    </p>
                    <p className="text-xs">{formatTime(item.last_seen)}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold border ${threat.color}`}
                  >
                    {threat.level}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Leyenda */}
      <div className="mt-4 pt-4 border-t border-gray-700/50 flex flex-wrap gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <FaUserShield className="text-blue-500" /> ADMIN (tu IP)
        </span>
        <span className="flex items-center gap-1">
          <FaCheckCircle className="text-emerald-500" /> SAFE (≤5)
        </span>
        <span className="flex items-center gap-1">
          <FaExclamationTriangle className="text-amber-500" /> WARNING (&gt;5)
        </span>
        <span className="flex items-center gap-1">
          <FaSkull className="text-rose-500" /> CRITICAL (&gt;20)
        </span>
        <span className="flex items-center gap-1 animate-pulse">
          <FaSkull className="text-rose-400" /> CRITICAL (&gt;30) palpitante
        </span>
      </div>
    </div>
  );
};
