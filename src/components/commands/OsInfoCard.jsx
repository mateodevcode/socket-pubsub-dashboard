import { FaMicrochip } from "react-icons/fa";
import { BsHash } from "react-icons/bs";
import { CiServer } from "react-icons/ci";

export const OsInfoCard = ({ data }) => {
  if (!data) {
    return (
      <div className="bg-transparent dark:bg-gray-800 rounded-xl shadow-sm border-2 border-gray-800 p-6 animate-pulse">
        <div className="h-6 bg-gray-700 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-16 bg-gray-700 rounded-lg"></div>
          <div className="h-16 bg-gray-700 rounded-lg"></div>
          <div className="h-16 bg-gray-700 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-transparent dark:bg-gray-800 rounded-xl shadow-sm border-2 border-gray-800 p-6 hover:shadow-lg transition-all duration-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-base font-semibold text-gray-100 dark:text-white flex items-center gap-3">
          <div className="p-2 bg-gray-900 rounded-lg">
            <CiServer className="w-6 h-6 text-purple-500" />
          </div>
          Identidad del Servidor
        </h3>
      </div>

      {/* Info Grid */}
      <div className="space-y-4">
        {/* OS Name & Version */}
        <div className="p-4 bg-gray-900 rounded-lg">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
            Sistema Operativo
          </p>
          <p className="text-lg font-bold text-gray-100">
            {data.os_name} {data.os_version}
          </p>
        </div>

        {/* Kernel */}
        <div className="p-4 bg-gray-900 rounded-lg flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
              Kernel
            </p>
            <p
              className="text-lg font-medium text-gray-300 truncate max-w-50"
              title={data.kernel_version}
            >
              {data.kernel_version}
            </p>
          </div>
          <BsHash className="w-5 h-5 text-gray-500" />
        </div>

        {/* CPU Info */}
        <div className="p-4 bg-gray-900 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Procesador
            </p>
            <span className="text-xs font-bold px-2 py-0.5 bg-purple-900/50 text-purple-400 rounded">
              {data.cpu_cores} Cores
            </span>
          </div>
          <div className="flex items-center gap-2">
            <FaMicrochip className="w-5 h-5 text-purple-500" />
            <p
              className="text-sm font-medium text-gray-300 truncate"
              title={data.cpu_brand}
            >
              {data.cpu_brand}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
