import { useState, useEffect, useRef } from "react";
import { VITE_CORE_REST_URL, VITE_CORE_WS_URL } from "../config/config";
import { IoStatsChartOutline } from "react-icons/io5";
import { SiNginx } from "react-icons/si";
import { FaDocker } from "react-icons/fa";
import { IoTrashBinOutline } from "react-icons/io5";
import { FaNetworkWired } from "react-icons/fa";
import { RamCard } from "../components/commands/RamCard";
import { DiskCard } from "../components/commands/DiskCard";
import { OsInfoCard } from "../components/commands/OsInfoCard";
import { NetworkCard } from "../components/commands/NetworkCard";
import { DockerTableCard } from "../components/commands/DockerTableCard";
import { NginxCard } from "../components/commands/NginxCard";
import { PortsCard } from "../components/commands/PortsCard";
import { UptimeCard } from "../components/commands/UptimeCard";
import { DockerCleanupCard } from "../components/commands/DockerCleanupCard";
import { InstalledToolsCard } from "../components/commands/InstalledToolsCard";
import { NetworkThreatsCard } from "../components/commands/NetworkThreatsCard";
import { TopAttackersCard } from "../components/commands/TopAttackersCard";
import { ActiveConnectionsCard } from "../components/commands/ActiveConnectionsCard";
import { useAuthStore } from "../store/authStore";
import { getLogColor } from "../lib/getLogColor";
import { parseDashboardData } from "../lib/parseDashboardData";
import { useAdminIp } from "../hooks/useAdminIp";

export default function AdminPanel() {
  const { user, logout } = useAuthStore();
  const { ip: adminIp } = useAdminIp();

  const [logs, setLogs] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [actionsChannelId, setActionsChannelId] = useState("");
  const [eventsChannelId, setEventsChannelId] = useState("");

  // ============================================
  // DINÁMICOS (Actualizan cada 5s desde servidor)
  // ============================================
  const [ramInfo, setRamInfo] = useState(null);
  const [diskSpace, setDiskSpace] = useState(null);
  const [dockerInfo, setDockerInfo] = useState(null);
  const [uptimeCheck, setUptimeCheck] = useState(null);

  // ============================================
  // FIJOS (Cargan UNA VEZ al inicio)
  // ============================================
  const [osInfo, setOsInfo] = useState(null);
  const [ipInfo, setIpInfo] = useState(null);
  const [nginxFull, setNginxFull] = useState(null);

  // ============================================
  // OCASIONALES / BAJO DEMANDA
  // ============================================
  const [portsData, setPortsData] = useState(null);
  const [portsLoading, setPortsLoading] = useState(false);
  const [dockerDfData, setDockerDfData] = useState(null);
  const [dockerDfLoading, setDockerDfLoading] = useState(false);
  const [isPruning, setIsPruning] = useState(false);
  const [pruneMessage, setPruneMessage] = useState("");
  const [toolsData, setToolsData] = useState(null);
  const [toolsLoading, setToolsLoading] = useState(false);
  const [threatsData, setThreatsData] = useState(null);
  const [threatsLoading, setThreatsLoading] = useState(false);
  const [threatsHistory, setThreatsHistory] = useState([]);
  const [topAttackers, setTopAttackers] = useState([]);
  const [connectionsData, setConnectionsData] = useState({
    server_ip: null,
    ssh_sessions: [],
    web_connections: [],
  });

  const wsRef = useRef(null);
  const hasRequestedFixedData = useRef(false);

  // ============================================
  // DETECTAR IP PROPIA AL CARGAR
  // ============================================
  useEffect(() => {
    if (adminIp) {
      sendCommand("set_admin_ip", { ip: adminIp });
      console.log("🏠 Tu IP detectada:", adminIp);
    }
  }, [adminIp]);

  // ============================================
  // 1. OBTENER UUIDs DE CANALES
  // ============================================
  useEffect(() => {
    const fetchChannelIds = async () => {
      try {
        const res = await fetch(`${VITE_CORE_REST_URL}/channels`);
        const json = await res.json();
        if (json.success && json.data) {
          const actionsChannel = json.data.find(
            (ch) => ch.name === "admin-actions",
          );
          const eventsChannel = json.data.find(
            (ch) => ch.name === "admin-events",
          );
          if (actionsChannel) setActionsChannelId(actionsChannel.id);
          if (eventsChannel) setEventsChannelId(eventsChannel.id);
        }
      } catch (error) {
        console.error("Error obteniendo canales:", error);
      }
    };
    fetchChannelIds();
  }, []);

  // ============================================
  // 2. WEBSOCKET: Escucha pasiva de dashboard
  // ============================================
  useEffect(() => {
    if (!eventsChannelId) return;

    const ws = new WebSocket(VITE_CORE_WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      addLog("✅ Conectado al Core WebSocket", "success");
      ws.send(
        JSON.stringify({
          channel: eventsChannelId,
          client_id: `frontend-admin-${Date.now()}`,
        }),
      );
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);

        // Filtrar mensajes del admin-agent
        if (msg.source === "admin-agent-01" || msg.agent === "admin-agent-01") {
          const data = msg.payload || msg;
          const { type, action, success, output } = data;

          // ✅ DINÁMICOS: Actualiza cada 5s
          if (action === "ram_info") {
            setRamInfo(parseDashboardData(output));
          }
          if (action === "disk_space") {
            setDiskSpace(parseDashboardData(output));
          }
          if (action === "docker_info") {
            setDockerInfo({
              containers: data.full_state?.containers || [],
              delta: data.delta || {
                added: [],
                removed: [],
                changed: [],
              },
              timestamp: data.timestamp,
              success: data.success,
            });
          }

          if (action === "uptime_check") {
            setUptimeCheck(parseDashboardData(output));
          }

          // ✅ FIJOS: Carga una vez
          if (action === "os_info") {
            setOsInfo(parseDashboardData(output));
          }
          if (action === "ip_info") {
            setIpInfo(output);
          }
          if (action === "nginx_full") {
            setNginxFull(parseDashboardData(output));
          }

          // ✅ OCASIONALES: Bajo demanda
          if (action === "ports_info") {
            setPortsData(parseDashboardData(output));
            setPortsLoading(false);
          }

          if (action === "docker_df") {
            setDockerDfData(parseDashboardData(output));
            setDockerDfLoading(false);
          }

          if (action === "installed_tools") {
            setToolsData(parseDashboardData(output));
            setToolsLoading(false);
          }

          if (action === "network_threats") {
            setThreatsData(parseDashboardData(output));
            setThreatsLoading(false);
          }

          if (action === "get_threats_history") {
            if (success) {
              const parsedOutput = parseDashboardData(output);
              setThreatsHistory(parsedOutput?.history || []);
            }
            setThreatsLoading(false);
          }

          if (action === "clear_threats_db") {
            if (success) {
              setThreatsHistory([]);
              setTimeout(() => sendCommand("get_threats_history"), 500);
            }
            setThreatsLoading(false);
          }

          if (action === "get_top_attackers") {
            if (success) {
              const parsedOutput = parseDashboardData(output);
              setTopAttackers(parsedOutput?.attackers || []);
            }
          }

          if (action === "get_active_connections") {
            if (success) {
              const parsedOutput = parseDashboardData(output);
              setConnectionsData(parsedOutput);
            }
          }

          if (action === "docker_prune") {
            setIsPruning(false);
            setPruneMessage(
              success
                ? "Limpieza completada exitosamente."
                : "Error al ejecutar la limpieza.",
            );
            setTimeout(() => sendCommand("docker_df"), 500);
          }

          // ✅ RESPUESTAS MANUALES: Muestra en logs
          if (type === "manual") {
            addLog(`\n🎯 --- RESPUESTA: ${action} ---`, "header");
            addLog(
              `Éxito: ${success ? "✅ Sí" : "❌ No"}`,
              success ? "success" : "error",
            );
            if (!success) addLog(`Error:\n${output}`, "error");
            else addLog(`Salida:\n${output}`, "output");
            addLog(`----------------------------\n`, "header");
          }
        }
      } catch (error) {
        console.error("Error parseando mensaje:", error);
      }
    };

    ws.onerror = () => addLog("❌ Error en WebSocket", "error");
    ws.onclose = () => {
      setIsConnected(false);
      addLog("🔌 Desconectado del Core", "warning");
    };

    return () => ws.close();
  }, [eventsChannelId]);

  // ============================================
  // 3. SOLICITAR DATOS FIJOS UNA SOLA VEZ
  // ============================================
  useEffect(() => {
    if (!isConnected || !actionsChannelId || hasRequestedFixedData.current)
      return;

    hasRequestedFixedData.current = true;

    const timer = setTimeout(() => {
      sendCommand("os_info");
      sendCommand("ip_info");
      sendCommand("nginx_full");
    }, 500);

    return () => clearTimeout(timer);
  }, [isConnected, actionsChannelId]);

  // ============================================
  // FUNCIONES AUXILIARES
  // ============================================
  const addLog = (message, type = "info") => {
    setLogs((prev) => [
      ...prev,
      { message, type, timestamp: new Date().toLocaleTimeString() },
    ]);
  };

  const sendCommand = async (action, extraPayload = {}) => {
    if (!actionsChannelId)
      return addLog("❌ No se pudo obtener el ID del canal", "error");

    if (action === "ports_info") {
      setPortsLoading(true);
      setPortsData(null);
    }

    addLog(`📤 Enviando comando: ${action}`, "info");
    try {
      const res = await fetch(
        `${VITE_CORE_REST_URL}/channels/${actionsChannelId}/events`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            source: "frontend-admin",
            targets: ["*"],
            payload: { action, ...extraPayload },
          }),
        },
      );
      const json = await res.json();
      if (json.success) addLog(`✅ Comando '${action}' enviado`, "success");
      else {
        addLog(`❌ Error: ${json.error}`, "error");
        if (action === "ports_info") setPortsLoading(false);
      }
    } catch (error) {
      addLog(`❌ Error de red: ${error.message}`, "error");
      if (action === "ports_info") setPortsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <IoStatsChartOutline /> Admin Panel{" "}
              <span className="text-slate-500 text-lg font-normal hidden sm:inline">
                | Dashboard en Tiempo Real
              </span>
            </h1>
            <p className="text-slate-400 mt-2 text-sm">
              Monitoreo y control de infraestructura VPS
            </p>
          </div>

          <div className="flex justify-between items-center gap-4">
            <button
              onClick={logout}
              className="bg-red-600 px-4 py-2 rounded hover:bg-red-700"
            >
              Cerrar Sesión
            </button>
            <p className="text-green-400">✅ Bienvenido, {user?.username}</p>
          </div>

          <div className="flex items-center gap-3">
            {adminIp && (
              <div className="px-3 py-2 rounded-full border border-blue-800 bg-blue-950/50 text-blue-400 flex items-center gap-2 font-mono text-xs shadow-sm">
                <span>🏠 Admin:</span>
                <span className="font-bold text-blue-300">{adminIp}</span>
                <span className="text-[10px] bg-blue-800 text-blue-200 px-1.5 py-0.5 rounded">
                  Protegida
                </span>
              </div>
            )}

            <div
              className={`px-4 py-2 rounded-full border flex items-center gap-2 font-mono text-sm w-min ${
                isConnected
                  ? "bg-emerald-950/50 border-emerald-800 text-emerald-400"
                  : "bg-red-950/50 border-red-800 text-red-400"
              }`}
            >
              <span
                className={`relative flex h-2.5 w-2.5 ${isConnected ? "" : "hidden"}`}
              >
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              {isConnected ? "Conectado" : "Desconectado"}
            </div>
          </div>
        </div>

        {/* DASHBOARD: Métricas del Servidor */}
        <div>
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
            Métricas del Sistema
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            <div className="flex flex-col gap-6">
              <div className="transition-all duration-300">
                <OsInfoCard data={osInfo} />
              </div>
              <div className="transition-all duration-300">
                <NetworkCard data={ipInfo} />
              </div>
            </div>
            <div className="flex flex-col gap-6">
              <div className="transition-all duration-300">
                <RamCard data={ramInfo} />
              </div>
              <div className="transition-all duration-300">
                <DiskCard data={diskSpace} />
              </div>
            </div>
          </div>

          <div className="w-full flex flex-col gap-6 mt-6">
            <div className="transition-all duration-300 w-full">
              <DockerTableCard data={dockerInfo} />
            </div>
            <div className="transition-all duration-300 w-full">
              <NginxCard data={nginxFull} />
            </div>
            <div className="transition-all duration-300 w-full mt-6">
              <UptimeCard data={uptimeCheck} />
            </div>
          </div>

          <div className="transition-all duration-300 w-full mt-6">
            <PortsCard
              data={portsData}
              isLoading={portsLoading}
              onRefresh={() => sendCommand("ports_info")}
            />
          </div>

          <div className="transition-all duration-300 w-full mt-6">
            <DockerCleanupCard
              data={dockerDfData}
              isLoading={dockerDfLoading}
              onRefresh={(action) => {
                setDockerDfLoading(true);
                sendCommand(action);
              }}
              onPrune={() => {
                setIsPruning(true);
                setPruneMessage("");
                sendCommand("docker_prune");
              }}
              isPruning={isPruning}
              pruneMessage={pruneMessage}
            />
          </div>

          <div className="transition-all duration-300 w-full mt-6">
            <InstalledToolsCard
              data={toolsData}
              isLoading={toolsLoading}
              onRefresh={(action) => {
                setToolsLoading(true);
                sendCommand(action);
              }}
            />
          </div>

          <div className="transition-all duration-300 w-full mt-6">
            <NetworkThreatsCard
              data={threatsData}
              historyData={threatsHistory}
              isLoading={threatsLoading}
              onRefresh={(action) => {
                setThreatsLoading(true);
                sendCommand(action);
              }}
            />
          </div>

          <div className="transition-all duration-300 w-full mt-6">
            <TopAttackersCard
              data={topAttackers}
              adminIp={adminIp}
              isLoading={false}
            />
          </div>

          <div className="transition-all duration-300 w-full mt-6">
            <ActiveConnectionsCard
              data={connectionsData}
              adminIp={adminIp}
              serverIp={connectionsData.server_ip}
            />
          </div>
        </div>

        {/* COMANDOS MANUALES (On-Demand) */}
        <div>
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
            Comandos Bajo Demanda
          </h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => sendCommand("docker_ps")}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-lg font-medium transition-all flex items-center gap-2 hover:border-blue-500/50"
            >
              <FaDocker /> Docker PS
            </button>
            <button
              onClick={() => sendCommand("nginx_status")}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-lg font-medium transition-all flex items-center gap-2 hover:border-emerald-500/50"
            >
              <SiNginx /> Nginx Status
            </button>
            <button
              onClick={() => sendCommand("ports_info")}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-lg font-medium transition-all flex items-center gap-2 hover:border-indigo-500/50"
            >
              <FaNetworkWired /> Puertos Abiertos
            </button>
            <button
              onClick={() => setLogs([])}
              className="px-4 py-2.5 bg-slate-800 hover:bg-red-900/30 border border-slate-700 hover:border-red-800 text-slate-400 hover:text-red-400 rounded-lg font-medium transition-all flex items-center gap-2 ml-auto"
            >
              <IoTrashBinOutline /> Limpiar Logs
            </button>
          </div>
        </div>

        {/* CONSOLA DE LOGS */}
        <div>
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
            Consola de Eventos
          </h2>
          <div className="bg-slate-900 rounded-lg border border-slate-800 h-64 overflow-y-auto font-mono text-sm shadow-inner p-4">
            {logs.length === 0 ? (
              <div className="text-slate-600 italic flex items-center h-full justify-center">
                Esperando comandos manuales o eventos del sistema...
              </div>
            ) : (
              logs.map((log, idx) => (
                <div
                  key={idx}
                  className="mb-1.5 border-b border-slate-800/50 pb-1.5 last:border-0 last:pb-0"
                >
                  <span className="text-slate-600 mr-2">[{log.timestamp}]</span>
                  <span className={getLogColor(log.type)}>{log.message}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
