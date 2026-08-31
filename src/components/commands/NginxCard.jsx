import { useState } from "react";
import { SiNginx } from "react-icons/si";
import { HiOutlineChevronDown, HiOutlineChevronUp } from "react-icons/hi";
import { FiAlertTriangle, FiCheckCircle } from "react-icons/fi";

export const NginxCard = ({ data }) => {
  const [expanded, setExpanded] = useState(false);

  const getDaysLeft = (expiryString) => {
    try {
      const expiryDate = new Date(expiryString);
      const now = new Date();
      const diffTime = expiryDate - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    } catch (e) {
      return 0;
    }
  };

  if (!data) {
    return (
      <div className="bg-transparent dark:bg-gray-800 rounded-xl shadow-sm border-2 border-gray-800 p-6 animate-pulse lg:col-span-2">
        <div className="h-6 bg-gray-700 rounded w-1/3 mb-6"></div>
        <div className="space-y-3">
          <div className="h-10 bg-gray-700 rounded"></div>
          <div className="h-10 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  const isNginxActive = data.nginx_active === "active";
  const statusIcon = isNginxActive ? (
    <FiCheckCircle className="w-5 h-5 text-emerald-500" />
  ) : (
    <FiAlertTriangle className="w-5 h-5 text-red-500" />
  );

  const getStatusColor = () => {
    if (isNginxActive)
      return "text-emerald-400 bg-emerald-900/20 border-emerald-800";
    return "text-red-400 bg-red-900/20 border-red-800";
  };

  const getCertColor = (days) => {
    if (days > 30)
      return "text-emerald-400 bg-emerald-900/20 border-emerald-800";
    if (days > 7) return "text-amber-400 bg-amber-900/20 border-amber-800";
    return "text-red-400 bg-red-900/20 border-red-800";
  };

  return (
    <div className="bg-transparent dark:bg-gray-800 rounded-xl shadow-sm border-2 border-gray-800 p-6 hover:shadow-lg transition-all duration-200 lg:col-span-2">
      {/* Header */}
      <div
        className="flex items-center justify-between mb-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-900 rounded-lg">
            <SiNginx className="w-6 h-6 text-emerald-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-100 flex items-center gap-2">
              Nginx Status
              {statusIcon}
              <span
                className={`text-xs font-bold px-2 py-1 rounded-full border ${getStatusColor()}`}
              >
                {isNginxActive ? "ACTIVO" : "INACTIVO"}
              </span>
            </h3>
            <p className="text-xs text-gray-400">
              {data.sites?.length || 0} sitios activos • Actualizado cada 5 min
            </p>
          </div>
        </div>
        <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
          {expanded ? (
            <HiOutlineChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <HiOutlineChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>
      </div>

      {/* Resumen rápido */}
      <div className="grid grid-cols-4 gap-4 mb-4">
        <div className="text-center p-3 bg-gray-900 rounded-lg">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
            Sitios
          </p>
          <p className="text-2xl font-bold text-gray-100">
            {data.sites?.length || 0}
          </p>
        </div>
        <div className="text-center p-3 bg-gray-900 rounded-lg">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
            Certificados
          </p>
          <p className="text-2xl font-bold text-gray-100">
            {data.certs?.length || 0}
          </p>
        </div>
        <div className="text-center p-3 bg-gray-900 rounded-lg">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
            Puertos
          </p>
          <p className="text-2xl font-bold text-gray-100">
            {data.ports?.length || 0}
          </p>
        </div>
        <div className="text-center p-3 bg-gray-900 rounded-lg">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
            Estado
          </p>
          <p
            className={`text-2xl font-bold ${isNginxActive ? "text-emerald-400" : "text-red-400"}`}
          >
            {isNginxActive ? "✅" : "❌"}
          </p>
        </div>
      </div>

      {/* Panel expandible */}
      {expanded && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Sitios */}
          <div>
            <h4 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider">
              Sitios Virtuales
            </h4>
            <div className="space-y-2">
              {(data.sites || []).map((site, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-2 bg-gray-900 rounded-lg"
                >
                  <span className="text-lg">🌐</span>
                  <span className="text-sm font-mono text-gray-200">
                    {site}
                  </span>
                  <span className="ml-auto text-xs text-emerald-400">
                    ✅ SSL
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Certificados */}
          {(data.certs || []).length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider">
                Certificados SSL
              </h4>
              <div className="space-y-2">
                {data.certs.map((cert, idx) => {
                  const daysLeft = getDaysLeft(cert.expiry);
                  return (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg border ${getCertColor(daysLeft)}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-mono font-bold">
                          {cert.domain}
                        </span>
                        <span className="text-xs font-bold">
                          {daysLeft > 0
                            ? `${daysLeft} días restantes`
                            : "⚠️ Vencido"}
                        </span>
                      </div>
                      <p className="text-xs opacity-75 mt-1">
                        Expira: {cert.expiry}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Puertos */}
          {(data.ports || []).length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider">
                Puertos en Escucha
              </h4>
              <div className="flex flex-wrap gap-2">
                {data.ports.map((port, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-blue-900/30 text-blue-400 rounded-full text-xs font-mono border border-blue-800"
                  >
                    {port}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Logs de errores */}
          {(data.errors || []).length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider flex items-center gap-2">
                <FiAlertTriangle className="w-4 h-4 text-amber-500" />
                Últimos Errores (Ruido de red / Deploys)
              </h4>
              <div className="bg-gray-950 rounded-lg p-3 max-h-48 overflow-y-auto font-mono text-xs">
                {data.errors.map((error, idx) => (
                  <div
                    key={idx}
                    className="mb-2 text-red-400/80 border-b border-gray-800 pb-2 last:border-0 break-all"
                  >
                    {error}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
