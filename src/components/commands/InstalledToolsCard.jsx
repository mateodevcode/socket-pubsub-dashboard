import { useState } from "react";
import {
  FaSyncAlt,
  FaSearch,
  FaCode,
  FaGlobe,
  FaDatabase,
  FaDocker,
  FaTools,
  FaChartLine,
  FaBox,
} from "react-icons/fa";

const CATEGORIES = {
  all: { label: "Todas", icon: FaBox },
  languages: { label: "Lenguajes", icon: FaCode },
  web_servers: { label: "Web Servers", icon: FaGlobe },
  databases: { label: "Bases de Datos", icon: FaDatabase },
  containers: { label: "Contenedores", icon: FaDocker },
  dev_tools: { label: "Herramientas Dev", icon: FaTools },
  monitoring: { label: "Monitoreo", icon: FaChartLine },
  utilities: { label: "Utilidades", icon: FaBox },
};

export const InstalledToolsCard = ({ data, isLoading, onRefresh }) => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const getStatusBadge = (status) => {
    if (status === "running")
      return (
        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-900/30 text-emerald-400 border border-emerald-800">
          Activo
        </span>
      );
    if (status === "stopped")
      return (
        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-gray-800 text-gray-400 border border-gray-700">
          Detenido
        </span>
      );
    return null;
  };

  const filteredTools =
    data?.tools?.filter((tool) => {
      const matchesCategory =
        activeCategory === "all" || tool.category === activeCategory;
      const matchesSearch =
        tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tool.binary.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    }) || [];

  const getIcon = (category) => {
    const IconComponent = CATEGORIES[category]?.icon;
    return IconComponent ? (
      <IconComponent className="w-4 h-4" />
    ) : (
      <FaBox className="w-4 h-4" />
    );
  };

  return (
    <div className="bg-transparent dark:bg-gray-800 rounded-xl shadow-sm border-2 border-gray-800 p-6 hover:shadow-lg transition-all duration-200 w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-900 rounded-lg border border-gray-700">
            <FaTools className="w-6 h-6 text-cyan-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-100">
              Software Instalado
            </h3>
            <p className="text-xs text-gray-400">
              Inventario de herramientas del sistema
            </p>
          </div>
        </div>
        <button
          onClick={() => onRefresh("installed_tools")}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors border border-cyan-500/30"
        >
          <FaSyncAlt className={isLoading ? "animate-spin" : ""} />
          {isLoading ? "Escaneando..." : "Actualizar"}
        </button>
      </div>

      {/* Controles: Búsqueda y Tabs */}
      <div className="space-y-4 mb-6">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Buscar herramienta o binario..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-sm text-gray-200 focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {Object.entries(CATEGORIES).map(([key, { label, icon: Icon }]) => (
            <button
              key={key}
              onClick={() => setActiveCategory(key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                activeCategory === key
                  ? "bg-cyan-900/30 text-cyan-400 border-cyan-700"
                  : "bg-gray-900 text-gray-400 border-gray-700 hover:bg-gray-800"
              }`}
            >
              <Icon className="w-3 h-3" /> {label}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Herramientas */}
      {!data || isLoading ? (
        <div className="text-center py-12 text-gray-500">
          {isLoading
            ? "Escaneando sistema..."
            : "Haz clic en 'Actualizar' para ver el software instalado."}
        </div>
      ) : filteredTools.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No se encontraron herramientas con esos filtros.
        </div>
      ) : (
        <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
          {filteredTools.map((tool, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg border border-gray-700/50 hover:border-gray-600 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 flex items-center justify-center bg-gray-800 rounded-md text-cyan-500">
                  {getIcon(tool.category)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-200">
                    {tool.name}
                  </p>
                  <p className="text-xs text-gray-500 font-mono">
                    {tool.binary}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-right">
                <div>
                  <p className="text-xs text-gray-500">Versión</p>
                  <p className="text-sm font-mono text-gray-300">
                    {tool.version}
                  </p>
                </div>
                <div className="hidden sm:block">
                  <p className="text-xs text-gray-500">Instalado</p>
                  <p className="text-xs font-mono text-gray-400">
                    {tool.install_date.split(" ")[0]}
                  </p>
                </div>
                {/* {getStatusBadge(tool.status)} */}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer Resumen */}
      {data && !isLoading && (
        <div className="mt-4 pt-4 border-t border-gray-700/50 text-xs text-gray-500 flex justify-between">
          <span>
            Mostrando {filteredTools.length} de {data.tools.length} herramientas
          </span>
          <span>
            {data.tools.filter((t) => t.status === "running").length} servicios
            activos
          </span>
        </div>
      )}
    </div>
  );
};
