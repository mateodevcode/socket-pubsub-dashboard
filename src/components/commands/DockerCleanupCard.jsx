import { useState } from "react";
import {
  FaTrashAlt,
  FaRecycle,
  FaHdd,
  FaExclamationTriangle,
  FaTimes,
  FaSpinner,
} from "react-icons/fa";

export const DockerCleanupCard = ({
  data,
  isLoading,
  onRefresh,
  onPrune,
  isPruning,
  pruneMessage,
}) => {
  const [showModal, setShowModal] = useState(false);

  const handlePruneClick = () => setShowModal(true);
  const handleCancel = () => setShowModal(false);
  const handleConfirm = () => {
    setShowModal(false);
    onPrune();
  };

  // Determinar si hay datos para mostrar
  const hasData = data && data.df && data.df.length > 0;

  return (
    <div className="bg-transparent dark:bg-gray-800 rounded-xl shadow-sm border-2 border-gray-800 p-6 hover:shadow-lg transition-all duration-200 w-full relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-900 rounded-lg border border-gray-700">
            <FaRecycle className="w-6 h-6 text-rose-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-100">
              Limpieza de Docker
            </h3>
            <p className="text-xs text-gray-400">
              Gestión de espacio y caché de build
            </p>
          </div>
        </div>
        <button
          onClick={handlePruneClick}
          disabled={isPruning || isLoading || !hasData}
          className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors border border-rose-500/30"
        >
          {isPruning ? <FaSpinner className="animate-spin" /> : <FaTrashAlt />}
          {isPruning ? "Limpiando..." : "Limpiar Basura"}
        </button>
      </div>

      {/* Mensaje post-limpieza */}
      {pruneMessage && (
        <div className="mb-4 p-3 bg-emerald-900/20 border border-emerald-800 rounded-lg text-emerald-400 text-sm font-mono flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <span>✅</span> {pruneMessage}
        </div>
      )}

      {/* Contenido principal */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
          <FaSpinner className="w-8 h-8 animate-spin text-blue-400 mb-4" />
          <p className="text-sm">Cargando información de disco...</p>
        </div>
      ) : !hasData ? (
        <div className="text-center py-8 text-gray-500">
          <p className="text-sm">No hay datos de uso de Docker disponibles.</p>
          {onRefresh && (
            <button
              onClick={() => onRefresh("docker_df")}
              className="mt-3 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm text-gray-200 transition-colors"
            >
              Reintentar
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-700">
          <table className="w-full text-left">
            <thead className="bg-gray-900/80">
              <tr>
                <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase">
                  Tipo
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase">
                  Total
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase">
                  Activos
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase">
                  Tamaño
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-amber-400 uppercase">
                  Recuperable
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50 bg-gray-800/30">
              {data.df.map((item, idx) => (
                <tr
                  key={idx}
                  className="group hover:bg-gray-700/30 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <FaHdd className="w-3 h-3 text-gray-500" />
                      <span className="text-sm font-medium text-gray-200">
                        {item.type}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400">
                    {item.total}
                  </td>
                  <td className="px-4 py-3 text-sm text-emerald-400 font-medium">
                    {item.active}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-300 font-mono">
                    {item.size}
                  </td>
                  <td className="px-4 py-3 text-sm text-amber-400 font-mono font-bold">
                    {item.reclaimable}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de Confirmación */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={handleCancel}
          ></div>

          <div className="relative bg-gray-900 border-2 border-rose-800 rounded-xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
            <button
              onClick={handleCancel}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-200 transition-colors"
            >
              <FaTimes className="w-5 h-5" />
            </button>

            <div className="flex justify-center mb-4">
              <div className="p-4 bg-rose-900/30 rounded-full border-2 border-rose-700">
                <FaExclamationTriangle className="w-8 h-8 text-rose-500" />
              </div>
            </div>

            <h3 className="text-xl font-bold text-gray-100 text-center mb-3">
              ¿Autorizar limpieza de Docker?
            </h3>
            <p className="text-sm text-gray-400 text-center mb-6 leading-relaxed">
              Esta acción eliminará de forma segura:
            </p>

            <ul className="text-sm text-gray-300 space-y-2 mb-6 bg-gray-800/50 p-4 rounded-lg border border-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-rose-400 mt-1">•</span>
                <span>
                  Contenedores detenidos (
                  <code className="text-xs bg-gray-900 px-1 rounded">
                    Exited
                  </code>
                  )
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-400 mt-1">•</span>
                <span>Redes no utilizadas por ningún contenedor</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-400 mt-1">•</span>
                <span>
                  Imágenes huérfanas (
                  <code className="text-xs bg-gray-900 px-1 rounded">
                    dangling
                  </code>
                  )
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-400 mt-1">•</span>
                <span>Caché de build sobrante</span>
              </li>
            </ul>

            <div className="p-3 bg-emerald-900/20 border border-emerald-800 rounded-lg mb-6">
              <p className="text-xs text-emerald-400 text-center font-medium">
                ✅ Tus servicios activos NO serán afectados
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                disabled={isPruning}
                className="flex-1 px-4 py-2.5 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg font-medium transition-colors border border-gray-600"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirm}
                disabled={isPruning}
                className="flex-1 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-medium transition-colors border border-rose-500/50 flex items-center justify-center gap-2"
              >
                <FaTrashAlt className="w-4 h-4" />
                Autorizar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
