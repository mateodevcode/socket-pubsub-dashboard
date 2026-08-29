import { FaGlobe, FaCheckCircle, FaTimesCircle, FaClock } from "react-icons/fa";

export const UptimeCard = ({ data }) => {
  if (!data || !data.sites) {
    return (
      <div className="bg-transparent dark:bg-gray-800 rounded-xl shadow-sm border-2 border-gray-800 p-6 animate-pulse w-full">
        <div className="h-6 bg-gray-700 rounded w-1/3 mb-6"></div>
        <div className="space-y-3">
          <div className="h-12 bg-gray-700 rounded"></div>
          <div className="h-12 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  const getStatusBadge = (isUp, statusCode) => {
    if (isUp) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-900/30 text-emerald-400 border border-emerald-800">
          <FaCheckCircle className="w-3 h-3" /> UP ({statusCode})
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-900/30 text-red-400 border border-red-800">
        <FaTimesCircle className="w-3 h-3" /> DOWN ({statusCode || "ERR"})
      </span>
    );
  };

  return (
    <div className="bg-transparent dark:bg-gray-800 rounded-xl shadow-sm border-2 border-gray-800 p-6 hover:shadow-lg transition-all duration-200 w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-900 rounded-lg border border-gray-700">
            <FaGlobe className="w-6 h-6 text-purple-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-100">
              Monitoreo de Clientes
            </h3>
            <p className="text-xs text-gray-400">
              Verificación automática cada 2 minutos
            </p>
          </div>
        </div>
        <span className="text-xs font-bold px-3 py-1 rounded-full bg-purple-900/30 text-purple-400 border border-purple-800">
          {data.sites.length} Sitios
        </span>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto rounded-lg border border-gray-700">
        <table className="w-full text-left">
          <thead className="bg-gray-900/80">
            <tr>
              <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase">
                Dominio
              </th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase">
                Estado
              </th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase">
                Respuesta
              </th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase text-right">
                Última Verificación
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700/50 bg-gray-800/30">
            {data.sites.map((site, idx) => (
              <tr
                key={idx}
                className="group hover:bg-gray-700/30 transition-colors"
              >
                <td className="px-4 py-3">
                  <a
                    href={`https://${site.domain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-blue-400 hover:text-blue-300 hover:underline flex items-center gap-2"
                  >
                    {site.domain}
                  </a>
                </td>
                <td className="px-4 py-3">
                  {getStatusBadge(site.is_up, site.status_code)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <FaClock className="w-3 h-3 text-gray-500" />
                    <span
                      className={`text-sm font-mono font-medium ${site.response_time_ms > 1000 ? "text-amber-400" : "text-gray-300"}`}
                    >
                      {site.response_time_ms} ms
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="text-xs text-gray-400 font-mono">
                    {site.last_checked}
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
