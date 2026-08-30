import {
  FaNetworkWired,
  FaUserShield,
  FaExclamationTriangle,
  FaServer,
  FaFlag,
  FaUserClock,
  FaTerminal,
  FaSkull,
  FaGlobe,
} from "react-icons/fa";

export const ActiveConnectionsCard = ({ data, adminIp, serverIp }) => {
  const getSessionStatus = (session) => {
    const { ip_status, user_status, suspicious_command, from } = session;

    if (adminIp && from === adminIp && user_status === "EXPECTED") {
      return {
        label: "ADMIN",
        color: "bg-blue-900/30 text-blue-400 border-blue-700",
        icon: <FaUserShield className="w-4 h-4" />,
        priority: 0,
      };
    }
    if (user_status === "SUSPICIOUS") {
      return {
        label: "🚨 INTRUSO",
        color: "bg-red-900/40 text-red-400 border-red-700 animate-pulse",
        icon: <FaSkull className="w-4 h-4" />,
        priority: 3,
      };
    }
    if (suspicious_command) {
      return {
        label: "⚠️ REVERSE SHELL",
        color:
          "bg-orange-900/40 text-orange-400 border-orange-700 animate-pulse",
        icon: <FaExclamationTriangle className="w-4 h-4" />,
        priority: 3,
      };
    }
    if (ip_status === "EXTERNAL" || ip_status === "KNOWN_EXTERNAL") {
      return {
        label: "🌍 EXTERNO",
        color: "bg-yellow-900/30 text-yellow-400 border-yellow-700",
        icon: <FaFlag className="w-4 h-4" />,
        priority: 2,
      };
    }
    if (ip_status === "INTERNAL") {
      return {
        label: "🏠 INTERNO",
        color: "bg-green-900/30 text-green-400 border-green-700",
        icon: <FaServer className="w-4 h-4" />,
        priority: 1,
      };
    }
    return {
      label: "👤 USUARIO",
      color: "bg-gray-900/30 text-gray-400 border-gray-700",
      icon: <FaUserClock className="w-4 h-4" />,
      priority: 1,
    };
  };

  const getWebStatus = (conn) => {
    if (adminIp && conn.peer_ip === adminIp) {
      return {
        label: "ADMIN",
        color: "bg-blue-900/30 text-blue-400 border-blue-700",
        icon: <FaUserShield className="w-4 h-4" />,
      };
    }
    return {
      label: "EXTERNO",
      color: "bg-yellow-900/30 text-yellow-400 border-yellow-700",
      icon: <FaGlobe className="w-4 h-4" />,
    };
  };

  const sshSessions = data?.ssh_sessions || [];
  const webConnections = data?.web_connections || [];

  return (
    <div className="bg-transparent dark:bg-gray-800 rounded-xl shadow-sm border-2 border-gray-800 p-6 hover:shadow-lg transition-all duration-200 w-full">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-900 rounded-lg border border-gray-700">
            <FaNetworkWired className="w-6 h-6 text-cyan-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-100">
              🎯 Sesiones Activas en Vivo
            </h3>
            <p className="text-xs text-gray-400">
              Usuarios autenticados y conexiones web en tiempo real
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

      {/* BLOQUE 1: SSH SESSIONS */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <FaTerminal className="text-emerald-400" />
          <h4 className="text-sm font-semibold text-gray-300">
            Sesiones SSH (Usuarios autenticados)
          </h4>
          <span className="text-xs bg-gray-800 px-2 py-0.5 rounded-full text-gray-400">
            {sshSessions.length}
          </span>
        </div>

        {sshSessions.length === 0 ? (
          <div className="text-center py-6 text-gray-500 flex flex-col items-center gap-1">
            <FaUserClock className="w-6 h-6 opacity-50" />
            <p className="text-sm">No hay sesiones SSH activas.</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
            {sshSessions.map((session, idx) => {
              const status = getSessionStatus(session);
              return (
                <div
                  key={`ssh-${session.from}-${session.user}-${idx}`}
                  className={`flex items-center justify-between p-3 rounded-lg border transition-all ${status.color}`}
                >
                  <div className="flex items-center gap-3 flex-1">
                    {status.icon}
                    <div className="flex flex-col flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-sm font-bold">
                          {session.user}
                        </span>
                        <span className="text-gray-500 text-xs">@</span>
                        <span className="font-mono text-sm">
                          {session.from}
                        </span>
                        {status.label === "ADMIN" && (
                          <span className="text-[10px] bg-blue-800 text-blue-200 px-1.5 py-0.5 rounded font-bold">
                            🏠 TÚ
                          </span>
                        )}
                        {session.user_status === "SUSPICIOUS" && (
                          <span className="text-[10px] bg-red-800 text-red-200 px-1.5 py-0.5 rounded font-bold animate-pulse">
                            🚨 USUARIO NO ESPERADO
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-[11px] opacity-80 flex-wrap">
                        <span className="text-gray-400">Login:</span>
                        <span className="font-mono text-gray-300">
                          {session.login || "N/A"}
                        </span>
                        <span className="text-gray-600">•</span>
                        <span className="text-gray-400">IDLE:</span>
                        <span className="font-mono text-gray-300">
                          {session.idle || "0s"}
                        </span>
                        <span className="text-gray-600">•</span>
                        <span className="text-gray-400">Comando:</span>
                        <span className="font-mono text-gray-300 truncate max-w-[200px]">
                          {session.what || "bash"}
                        </span>
                        {session.ip_status !== "INTERNAL" && (
                          <>
                            <span className="text-gray-600">•</span>
                            <FaFlag className="text-yellow-500 w-3 h-3" />
                            <span className="font-bold text-yellow-400">
                              {session.country || "XX"}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold border ${status.color}`}
                  >
                    {status.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* BLOQUE 2: WEB CONNECTIONS */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <FaGlobe className="text-blue-400" />
          <h4 className="text-sm font-semibold text-gray-300">
            Conexiones Web (HTTP/HTTPS)
          </h4>
          <span className="text-xs bg-gray-800 px-2 py-0.5 rounded-full text-gray-400">
            {webConnections.length}
          </span>
        </div>

        {webConnections.length === 0 ? (
          <div className="text-center py-6 text-gray-500 flex flex-col items-center gap-1">
            <FaGlobe className="w-6 h-6 opacity-50" />
            <p className="text-sm">No hay conexiones web activas.</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
            {webConnections.map((conn, idx) => {
              const status = getWebStatus(conn);
              return (
                <div
                  key={`web-${conn.peer_ip}-${conn.port}-${idx}`}
                  className={`flex items-center justify-between p-3 rounded-lg border transition-all ${status.color}`}
                >
                  <div className="flex items-center gap-3 flex-1">
                    {status.icon}
                    <div className="flex flex-col flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-sm font-bold">
                          {conn.peer_ip}
                        </span>
                        {status.label === "ADMIN" && (
                          <span className="text-[10px] bg-blue-800 text-blue-200 px-1.5 py-0.5 rounded font-bold">
                            🏠 TÚ
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-[11px] opacity-80 flex-wrap">
                        <span className="text-gray-400">Puerto:</span>
                        <span className="font-mono text-gray-300">
                          {conn.port}
                        </span>
                        <span className="text-gray-600">•</span>
                        <span className="text-gray-400">Conexiones:</span>
                        <span className="font-mono text-gray-300">
                          {conn.count}
                        </span>
                        <span className="text-gray-600">•</span>
                        <FaFlag className="text-yellow-500 w-3 h-3" />
                        <span className="font-bold text-yellow-400">
                          {conn.country || "XX"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold border ${status.color}`}
                  >
                    {status.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* LEYENDA */}
      <div className="mt-4 pt-4 border-t border-gray-700/50 flex flex-wrap gap-3 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <FaUserShield className="text-blue-500" /> Admin (seguro)
        </span>
        <span className="flex items-center gap-1">
          <FaSkull className="text-red-500" /> Usuario no esperado
        </span>
        <span className="flex items-center gap-1">
          <FaExclamationTriangle className="text-orange-500" /> Comando
          sospechoso
        </span>
        <span className="flex items-center gap-1">
          <FaFlag className="text-yellow-500" /> IP externa
        </span>
        <span className="flex items-center gap-1 ml-auto">
          <FaServer className="text-green-500" /> IP interna (segura)
        </span>
      </div>
    </div>
  );
};
