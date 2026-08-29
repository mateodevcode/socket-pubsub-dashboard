import {
  FaNetworkWired,
  FaUserShield,
  FaExclamationTriangle,
  FaServer,
  FaFlag,
} from "react-icons/fa";

export const ActiveConnectionsCard = ({ data, adminIp, serverIp }) => {
  const getConnectionStatus = (ip) => {
    if (adminIp && ip === adminIp) {
      return {
        label: "ADMIN",
        color: "bg-blue-900/30 text-blue-400 border-blue-700",
        icon: <FaUserShield className="w-4 h-4" />,
      };
    }
    return {
      label: "SOSPECHOSO",
      color: "bg-rose-900/30 text-rose-400 border-rose-700 animate-pulse",
      icon: <FaExclamationTriangle className="w-4 h-4" />,
    };
  };

  return (
    <div className="bg-transparent dark:bg-gray-800 rounded-xl shadow-sm border-2 border-gray-800 p-6 hover:shadow-lg transition-all duration-200 w-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-900 rounded-lg border border-gray-700">
            <FaNetworkWired className="w-6 h-6 text-cyan-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-100">
              Conexiones Activas Ahora
            </h3>
            <p className="text-xs text-gray-400">
              Sesiones TCP establecidas en tiempo real
            </p>
          </div>
        </div>
        {serverIp && serverIp !== "unknown" && (
          <div className="flex items-center gap-2 bg-gray-900/50 px-3 py-1.5 rounded-lg border border-gray-700">
            <FaServer className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-mono text-gray-300">{serverIp}</span>
          </div>
        )}
      </div>

      {!data || data.length === 0 ? (
        <div className="text-center py-12 text-gray-500 flex flex-col items-center gap-2">
          <FaNetworkWired className="w-8 h-8 opacity-50" />
          <p>No hay conexiones externas activas en este momento.</p>
          {serverIp && serverIp !== "unknown" && (
            <p className="text-xs text-gray-600">
              Servidor: <span className="font-mono">{serverIp}</span>
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          {data.map((conn, idx) => {
            const status = getConnectionStatus(conn.peer_ip);
            return (
              <div
                key={`${conn.peer_ip}-${conn.peer_port}-${idx}`}
                className={`flex items-center justify-between p-4 rounded-lg border transition-all ${status.color}`}
              >
                <div className="flex items-center gap-4 flex-1">
                  {status.icon}
                  <div className="flex flex-col flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold">
                        {conn.peer_ip}
                      </span>
                      {status.label === "ADMIN" && (
                        <span className="text-[10px] bg-blue-800 text-blue-200 px-1.5 py-0.5 rounded font-bold">
                          🏠 TÚ
                        </span>
                      )}
                      <span className="text-[10px] text-gray-500">
                        PID: {conn.pid || 0}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-[11px] opacity-80">
                      <span className="text-gray-400">Local:</span>
                      <span className="font-mono text-gray-300">
                        {conn.local_ip}:{conn.local_port}
                      </span>
                      <span className="text-gray-600">→</span>
                      <span className="text-gray-400">Remoto:</span>
                      <span className="font-mono text-gray-300">
                        {conn.peer_port}
                      </span>
                      <span className="text-gray-600">•</span>
                      {conn.country && conn.country !== "XX" && (
                        <>
                          <img
                            src={`https://flagcdn.com/w20/${conn.country.toLowerCase()}.png`}
                            alt={conn.country}
                            className="w-4 h-3 rounded-sm"
                          />
                          <span className="font-bold">{conn.country}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold border ${status.color}`}
                  >
                    {status.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-700/50 flex flex-wrap gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <FaUserShield className="text-blue-500" /> Tu IP (Segura)
        </span>
        <span className="flex items-center gap-1">
          <FaExclamationTriangle className="text-rose-500" /> IP Desconocida
          (Revisar)
        </span>
        <span className="flex items-center gap-1 ml-auto">
          <FaFlag className="text-yellow-500" /> País según IP
        </span>
      </div>
    </div>
  );
};
