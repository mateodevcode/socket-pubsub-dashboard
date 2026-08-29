import { FaDocker } from "react-icons/fa";

export const DockerTableCard = ({ data }) => {
  if (!data || !data.containers) {
    return (
      <div className="bg-transparent dark:bg-gray-800 rounded-xl shadow-sm border-2 border-gray-800 p-6 animate-pulse lg:col-span-2">
        <div className="h-6 bg-gray-700 rounded w-1/3 mb-6"></div>
        <div className="space-y-3">
          <div className="h-10 bg-gray-700 rounded"></div>
          <div className="h-10 bg-gray-700 rounded"></div>
          <div className="h-10 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    const lowerStatus = status.toLowerCase();
    if (lowerStatus.includes("up"))
      return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
    if (lowerStatus.includes("exited"))
      return "bg-red-500/20 text-red-400 border-red-500/30";
    return "bg-gray-500/20 text-gray-400 border-gray-500/30";
  };

  return (
    <div className="bg-transparent dark:bg-gray-800 rounded-xl shadow-sm border-2 border-gray-800 p-6 hover:shadow-lg transition-all duration-200 lg:col-span-2">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-100 flex items-center gap-3">
          <div className="p-2 bg-gray-900 rounded-lg">
            <FaDocker className="w-6 h-6 text-blue-500" />
          </div>
          Contenedores Docker
        </h3>
        <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-900/30 text-blue-400 border border-blue-800">
          {data.containers.length} Totales
        </span>
      </div>

      {/* Mini Tabla Moderna */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Nombre
              </th>
              <th className="pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Estado
              </th>
              <th className="pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">
                Tamaño
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700/50">
            {data.containers.map((container, idx) => (
              <tr
                key={idx}
                className="group hover:bg-gray-900/50 transition-colors"
              >
                <td className="py-3 pr-4">
                  <span
                    className="text-sm font-medium text-gray-200 font-mono truncate block max-w-[150px] md:max-w-xs"
                    title={container.name}
                  >
                    {container.name}
                  </span>
                </td>
                <td className="py-3 pr-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(container.status)}`}
                  >
                    {container.status}
                  </span>
                </td>
                <td className="py-3 text-right">
                  <span className="text-sm font-semibold text-gray-300">
                    {container.size}
                  </span>
                </td>
              </tr>
            ))}

            {data.containers.length === 0 && (
              <tr>
                <td
                  colSpan="3"
                  className="py-8 text-center text-gray-500 text-sm"
                >
                  No hay contenedores en el sistema
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
