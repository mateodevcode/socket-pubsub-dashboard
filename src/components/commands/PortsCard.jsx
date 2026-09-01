import {
  FaNetworkWired,
  FaSyncAlt,
  FaGlobe,
  FaDocker,
  FaLock,
} from "react-icons/fa";

// 📚 Base de datos IANA de puertos comunes (fallback inteligente)
const IANA_PORT_DB = {
  20: "FTP (Datos)",
  21: "FTP (Control)",
  22: "SSH",
  23: "Telnet",
  25: "SMTP (Email)",
  53: "DNS",
  67: "DHCP (Servidor)",
  68: "DHCP (Cliente)",
  80: "HTTP (Web)",
  110: "POP3 (Email)",
  143: "IMAP (Email)",
  443: "HTTPS (Web Seguro)",
  465: "SMTPS (Email Seguro)",
  587: "SMTP (Envío)",
  993: "IMAPS",
  995: "POP3S",
  1433: "Microsoft SQL Server",
  1521: "Oracle DB",
  2049: "NFS",
  3306: "MySQL/MariaDB",
  3389: "RDP (Escritorio Remoto)",
  5432: "PostgreSQL",
  5433: "PostgreSQL (Alt)",
  5900: "VNC (Escritorio Remoto)",
  6379: "Redis",
  8080: "HTTP Alternativo",
  8443: "HTTPS Alternativo",
  9090: "Web Admin",
  9200: "Elasticsearch",
  9300: "Elasticsearch (Cluster)",
  11211: "Memcached",
  27017: "MongoDB",
  27018: "MongoDB (Shard)",
  6380: "Redis (Alt)",
  19999: "Netdata",
  8125: "StatsD (Netdata)",
  4317: "OpenTelemetry",
  3000: "Dev Server (Node/React)",
  3001: "Microservicio Backend",
  3004: "WebSocket Server",
  3005: "Socket Core",
  514: "Syslog",
  161: "SNMP",
  162: "SNMP Trap",
  6881: "BitTorrent",
  8888: "Jupyter Notebook",
  9000: "PHP-FPM / SonarQube",
  10250: "Kubernetes Kubelet",
  2375: "Docker API (No seguro)",
  2376: "Docker API (TLS)",
};

export const PortsCard = ({ data, isLoading, onRefresh }) => {
  const getDescription = (portNum, process) => {
    // Prioridad 1: Base de datos IANA
    if (IANA_PORT_DB[portNum]) return IANA_PORT_DB[portNum];

    // Prioridad 2: Inferencia por proceso
    if (process === "nginx") return "Servidor Web";
    if (process === "sshd") return "Servidor SSH";
    if (process === "docker-proxy") return "Contenedor Docker";
    if (process === "netdata") return "Monitoreo";
    if (process === "postgres" || process === "postgres_central")
      return "Base de Datos";
    if (process === "redis") return "Cache en Memoria";
    if (process === "node" || process === "rust-admin-agent")
      return "Aplicación";

    return "Servicio personalizado";
  };

  const inferProcess = (portNum, originalProcess) => {
    if (originalProcess && originalProcess !== "unknown")
      return originalProcess;

    // Fallback por puerto conocido
    const processByPort = {
      80: "nginx",
      443: "nginx",
      22: "sshd",
      19999: "netdata",
      3001: "docker-proxy",
      3004: "docker-proxy",
      3005: "docker-proxy",
      5433: "docker-proxy",
      6379: "redis",
      3306: "mysql",
      27017: "mongod",
      8080: "java/node",
      9090: "prometheus",
      9200: "elasticsearch",
      41641: "Tailscale",
    };

    return processByPort[portNum] || "system";
  };

  const categorizePorts = (ports) => {
    const seenPorts = new Set();
    const exposed = [],
      docker = [],
      local = [];

    ports.forEach((p) => {
      const portNum = parseInt(
        p.address
          .split(":")
          .pop()
          .replace(/[^0-9]/g, ""),
        10,
      );
      if (seenPorts.has(portNum)) return;
      seenPorts.add(portNum);

      const cleanProcess = inferProcess(portNum, p.process);
      const item = {
        ...p,
        portNum,
        process: cleanProcess,
        description: getDescription(portNum, cleanProcess),
      };

      if (p.address.startsWith("0.0.0.0") || p.address.startsWith("[::]")) {
        exposed.push(item);
      } else if (
        cleanProcess === "docker-proxy" ||
        [3001, 3004, 3005, 5433, 6379, 3306, 27017].includes(portNum)
      ) {
        docker.push(item);
      } else {
        local.push(item);
      }
    });

    const sortFn = (a, b) => a.portNum - b.portNum;
    return {
      exposed: exposed.sort(sortFn),
      docker: docker.sort(sortFn),
      local: local.sort(sortFn),
    };
  };

  const { exposed, docker, local } = data?.ports
    ? categorizePorts(data.ports)
    : { exposed: [], docker: [], local: [] };

  return (
    <div className="bg-transparent dark:bg-gray-800 rounded-xl shadow-sm border-2 border-gray-800 p-6 hover:shadow-lg transition-all duration-200 w-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-900 rounded-lg border border-gray-700">
            <FaNetworkWired className="w-6 h-6 text-indigo-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-100">
              Puertos en Escucha
            </h3>
            <p className="text-xs text-gray-400">
              Análisis de seguridad y servicios activos
            </p>
          </div>
        </div>
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors border border-indigo-500/30"
        >
          <FaSyncAlt className={isLoading ? "animate-spin" : ""} />
          {isLoading ? "Escaneando..." : "Actualizar"}
        </button>
      </div>

      {!data && !isLoading ? (
        <div className="text-center py-12 text-gray-500 bg-gray-900/30 rounded-lg border border-dashed border-gray-700">
          <FaNetworkWired className="w-8 h-8 mx-auto mb-3 opacity-50" />
          <p>
            Haz clic en "Actualizar" para escanear los puertos del servidor.
          </p>
        </div>
      ) : isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent mb-3"></div>
          <p className="text-gray-400">Consultando al agente...</p>
        </div>
      ) : (
        <div className="space-y-2">
          <PortSection
            title="Expuestos a la Red (Públicos)"
            icon={FaGlobe}
            colorClass="text-amber-400"
            ports={exposed}
          />
          <PortSection
            title="Mapeados por Docker"
            icon={FaDocker}
            colorClass="text-blue-400"
            ports={docker}
          />
          <PortSection
            title="Locales y del Sistema"
            icon={FaLock}
            colorClass="text-emerald-400"
            ports={local}
          />

          {exposed.length === 0 &&
            docker.length === 0 &&
            local.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No se encontraron puertos en escucha.
              </div>
            )}
        </div>
      )}
    </div>
  );
};

const PortSection = ({ title, icon: Icon, colorClass, ports }) => {
  const getBindColor = (address) => {
    if (
      address.startsWith("127.0.0.1") ||
      address.startsWith("::1") ||
      address.includes("127.0.0.5")
    )
      return "text-emerald-400";
    if (address.startsWith("0.0.0.0") || address.startsWith("[::]"))
      return "text-amber-400";
    return "text-blue-400";
  };

  if (ports.length === 0) return null;
  return (
    <div className="mb-6 last:mb-0">
      <h4
        className={`text-sm font-semibold ${colorClass} mb-3 flex items-center gap-2 uppercase tracking-wider`}
      >
        <Icon className="w-4 h-4" /> {title} ({ports.length})
      </h4>
      <div className="overflow-x-auto rounded-lg border border-gray-700">
        <table className="w-full text-left">
          <thead className="bg-gray-900/80">
            <tr>
              <th className="px-4 py-2.5 text-xs font-semibold text-gray-400">
                Proto
              </th>
              <th className="px-4 py-2.5 text-xs font-semibold text-gray-400">
                Dirección
              </th>
              <th className="px-4 py-2.5 text-xs font-semibold text-gray-400">
                Proceso
              </th>
              <th className="px-4 py-2.5 text-xs font-semibold text-gray-400">
                Descripción
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700/50 bg-gray-800/30">
            {ports.map((port, idx) => (
              <tr
                key={idx}
                className="group hover:bg-gray-700/30 transition-colors"
              >
                <td className="px-4 py-3">
                  <span className="text-xs font-mono font-bold bg-gray-900 px-2 py-1 rounded text-gray-300 border border-gray-700">
                    {port.protocol}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`text-sm font-mono font-medium ${getBindColor(port.address)}`}
                  >
                    {port.address}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-gray-200 font-semibold">
                    {port.process}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs text-gray-400 italic">
                    {port.description}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
