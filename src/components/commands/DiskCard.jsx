import { PiDatabaseLight } from "react-icons/pi";

export const DiskCard = ({ data }) => {
  if (!data) {
    return (
      <div className="bg-transparent dark:bg-gray-800 rounded-xl shadow-sm border-2 border-gray-800 p-6 animate-pulse">
        <div className="h-6 bg-gray-700 rounded w-1/3 mb-4"></div>
        <div className="h-3 bg-gray-700 rounded w-full mb-6"></div>
        <div className="grid grid-cols-3 gap-4">
          <div className="h-16 bg-gray-700 rounded-lg"></div>
          <div className="h-16 bg-gray-700 rounded-lg"></div>
          <div className="h-16 bg-gray-700 rounded-lg"></div>
        </div>
      </div>
    );
  }

  const getColor = (pct) => {
    if (pct < 60) return "bg-emerald-600";
    if (pct < 80) return "bg-yellow-500";
    if (pct < 90) return "bg-orange-500";
    return "bg-red-500";
  };

  const getTextColor = (pct) => {
    if (pct < 60) return "text-emerald-500";
    if (pct < 80) return "text-yellow-500";
    if (pct < 90) return "text-orange-500";
    return "text-red-500";
  };

  const barColor = getColor(data.percent);
  const textColor = getTextColor(data.percent);

  return (
    <div className="bg-transparent dark:bg-gray-800 rounded-xl shadow-sm border-2 border-gray-800 p-6 hover:shadow-lg transition-all duration-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-gray-100 dark:text-white flex items-center gap-3">
          <div className="p-2 bg-gray-900 rounded-lg">
            <PiDatabaseLight className="w-6 h-6 text-emerald-500" />
          </div>
          Almacenamiento
        </h3>
        <span
          className={`text-xs font-bold px-4 py-1.5 rounded-full text-white ${barColor}`}
        >
          {data.percent}% Usado
        </span>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
          <div
            className={`h-1.5 rounded-full transition-all duration-700 ease-out ${barColor}`}
            style={{ width: `${data.percent}%` }}
          ></div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4">
        {/* Total */}
        <div className="text-center p-3 bg-gray-900 rounded-lg">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
            Total
          </p>
          <p className="text-xl font-bold text-gray-100">{data.total_human}</p>
        </div>

        {/* Usado */}
        <div
          className={`text-center p-3 bg-gray-900 rounded-lg border-2 ${textColor} border-current`}
        >
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
            Usado
          </p>
          <p className={`text-xl font-bold ${textColor}`}>{data.used_human}</p>
        </div>

        {/* Disponible */}
        <div className="text-center p-3 bg-gray-900 rounded-lg border-2 border-emerald-900">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
            Disponible
          </p>
          <p className="text-xl font-bold text-emerald-500">
            {data.available_human}
          </p>
        </div>
      </div>
    </div>
  );
};
