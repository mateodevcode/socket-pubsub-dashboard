import {
  FaNetworkWired,
  FaUserShield,
  FaExclamationTriangle,
  FaServer,
  FaFlag,
  FaUserClock,
  FaSkull,
} from "react-icons/fa";

export const ActiveConnectionsCard = ({ data, adminIp, serverIp }) => {
  // Detectar formato de datos
  const isSessionFormat = (item) => {
    return item.user !== undefined || item.from !== undefined;
  };

  const isConnectionFormat = (item) => {
    return item.peer_ip !== undefined || item.local_ip !== undefined;
  };

  // Transformar datos de conexión TCP a formato de sesión
  const transformConnectionToSession = (conn) => {
    // Determinar si la IP es del admin
    const isAdmin = adminIp && conn.peer_ip === adminIp;

    // Determinar estado del usuario (si no tenemos info, asumir externo)
    const userStatus = isAdmin ? "EXPECTED" : "UNKNOWN";
    const ipStatus = isAdmin ? "KNOWN" : "EXTERNAL";

    // Extraer nombre de usuario de la IP (si es admin, es root)
    const user = isAdmin ? "root" : "unknown";

    return {
      user: user,
      from: conn.peer_ip,
      login: "N/A", // No tenemos esta info en conexiones TCP
      idle: "0s",
      what: conn.local_port === 22 ? "ssh" : "tcp-connection",
      user_status: userStatus,
      ip_status: ipStatus,
      suspicious_command: false,
      country: conn.country || "XX",
      // Mantener datos originales para contexto
      _original: conn,
      _type: "connection",
    };
  };

  // Normalizar datos
  const normalizedData = data.map((item) => {
    if (isSessionFormat(item)) {
      return { ...item, _type: "session" };
    } else if (isConnectionFormat(item)) {
      return transformConnectionToSession(item);
    }
    return item;
  });

  // Función para determinar estado de sesión (adaptada)
  const getSessionStatus = (session) => {
    const { from, ip_status, user_status, suspicious_command, _type } = session;

    // Si es conexión TCP sin autenticación
    if (_type === "connection") {
      const isAdmin = adminIp && from === adminIp;
      if (isAdmin) {
        return {
          label: "ADMIN",
          color: "bg-blue-900/30 text-blue-400 border-blue-700",
          icon: <FaUserShield className="w-4 h-4" />,
          priority: 0,
        };
      }
      return {
        label: "🌐 CONEXIÓN",
        color: "bg-gray-900/30 text-gray-400 border-gray-700",
        icon: <FaNetworkWired className="w-4 h-4" />,
        priority: 1,
      };
    }

    // Lógica para sesiones (formato nuevo)
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

    if (ip_status === "EXTERNAL") {
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

  // Ordenar datos por prioridad
  const sortedData = [...normalizedData].sort((a, b) => {
    const statusA = getSessionStatus(a);
    const statusB = getSessionStatus(b);
    return statusB.priority - statusA.priority;
  });

  // Calcular estadísticas
  const stats = {
    total: normalizedData.length,
    admin: normalizedData.filter((s) => {
      if (s._type === "connection") {
        return adminIp && s.from === adminIp;
      }
      return adminIp && s.from === adminIp && s.user_status === "EXPECTED";
    }).length,
    suspicious: normalizedData.filter(
      (s) => s.user_status === "SUSPICIOUS" || s.suspicious_command,
    ).length,
    external: normalizedData.filter((s) => s.ip_status === "EXTERNAL").length,
    internal: normalizedData.filter((s) => s.ip_status === "INTERNAL").length,
  };

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
              {normalizedData.some((s) => s._type === "session")
                ? "🎯 Sesiones Activas en Vivo"
                : "🌐 Conexiones Activas"}
            </h3>
            <p className="text-xs text-gray-400">
              {normalizedData.some((s) => s._type === "session")
                ? "Usuarios REALMENTE conectados AHORA (no intentos fallidos)"
                : "Sesiones TCP establecidas en tiempo real"}
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

      {/* ESTADÍSTICAS */}
      {normalizedData.length > 0 && (
        <div className="grid grid-cols-4 gap-3 mb-4">
          <div className="bg-gray-900/30 rounded-lg p-2 text-center border border-gray-700/50">
            <div className="text-xs text-gray-400">Total</div>
            <div className="text-lg font-bold text-cyan-400">{stats.total}</div>
          </div>
          <div className="bg-gray-900/30 rounded-lg p-2 text-center border border-gray-700/50">
            <div className="text-xs text-gray-400">Admin</div>
            <div className="text-lg font-bold text-blue-400">{stats.admin}</div>
          </div>
          <div className="bg-gray-900/30 rounded-lg p-2 text-center border border-gray-700/50">
            <div className="text-xs text-gray-400">Sospechosos</div>
            <div className="text-lg font-bold text-rose-400">
              {stats.suspicious}
            </div>
          </div>
          <div className="bg-gray-900/30 rounded-lg p-2 text-center border border-gray-700/50">
            <div className="text-xs text-gray-400">Externos</div>
            <div className="text-lg font-bold text-yellow-400">
              {stats.external}
            </div>
          </div>
        </div>
      )}

      {/* CONTENIDO */}
      {!normalizedData || normalizedData.length === 0 ? (
        <div className="text-center py-12 text-gray-500 flex flex-col items-center gap-2">
          <FaUserClock className="w-8 h-8 opacity-50" />
          <p>✅ No hay conexiones activas en este momento.</p>
          <p className="text-xs text-gray-600">
            Servidor: <span className="font-mono">{serverIp}</span>
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
          {sortedData.map((session, idx) => {
            const status = getSessionStatus(session);
            const isConnection = session._type === "connection";

            return (
              <div
                key={`${session.from || session.peer_ip}-${idx}`}
                className={`flex items-center justify-between p-4 rounded-lg border transition-all ${status.color}`}
              >
                <div className="flex items-center gap-4 flex-1">
                  {status.icon}
                  <div className="flex flex-col flex-1">
                    {/* Usuario / IP */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-sm font-bold">
                        {isConnection ? session.from : session.user}
                      </span>
                      <span className="text-gray-500 text-xs">@</span>
                      <span className="font-mono text-sm">{session.from}</span>
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
                      {session.suspicious_command && (
                        <span className="text-[10px] bg-orange-800 text-orange-200 px-1.5 py-0.5 rounded font-bold animate-pulse">
                          💀 COMANDO SOSPECHOSO
                        </span>
                      )}
                    </div>

                    {/* Detalles */}
                    <div className="flex items-center gap-3 mt-1 text-[11px] opacity-80 flex-wrap">
                      {isConnection ? (
                        // Mostrar detalles de conexión TCP
                        <>
                          <span className="text-gray-400">Local:</span>
                          <span className="font-mono text-gray-300">
                            {session._original?.local_ip}:
                            {session._original?.local_port}
                          </span>
                          <span className="text-gray-600">→</span>
                          <span className="text-gray-400">Remoto:</span>
                          <span className="font-mono text-gray-300">
                            {session._original?.peer_port}
                          </span>
                          <span className="text-gray-600">•</span>
                          <span className="text-gray-400">PID:</span>
                          <span className="font-mono text-gray-300">
                            {session._original?.pid || 0}
                          </span>
                        </>
                      ) : (
                        // Mostrar detalles de sesión
                        <>
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
                        </>
                      )}
                      {session.country && session.country !== "XX" && (
                        <>
                          <span className="text-gray-600">•</span>
                          <img
                            src={`https://flagcdn.com/w20/${session.country.toLowerCase()}.png`}
                            alt={session.country}
                            className="w-4 h-3 rounded-sm"
                          />
                          <span className="font-bold">{session.country}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Badge */}
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

      {/* LEYENDA */}
      <div className="mt-4 pt-4 border-t border-gray-700/50 flex flex-wrap gap-3 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <FaUserShield className="text-blue-500" /> Tu IP (Segura)
        </span>
        <span className="flex items-center gap-1">
          <FaSkull className="text-red-500" /> Usuario No Esperado
        </span>
        <span className="flex items-center gap-1">
          <FaExclamationTriangle className="text-orange-500" /> Comando
          Sospechoso
        </span>
        <span className="flex items-center gap-1">
          <FaFlag className="text-yellow-500" /> IP Externa
        </span>
        <span className="flex items-center gap-1 ml-auto">
          <FaServer className="text-green-500" /> IP Interna (Segura)
        </span>
      </div>
    </div>
  );
};
