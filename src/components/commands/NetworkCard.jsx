import { useState } from "react";
import { HiOutlineGlobeAlt } from "react-icons/hi";
import { HiOutlineWifi } from "react-icons/hi";
import { PiCopyDuotone } from "react-icons/pi";
import { TbChecks } from "react-icons/tb";

export const NetworkCard = ({ data }) => {
  const [copied, setCopied] = useState(false);

  // Extraer la IP de cualquier formato
  const getIpAddress = () => {
    if (!data) return "No disponible";

    // Si es string directo (la IP)
    if (typeof data === "string" && !data.startsWith("{")) {
      return data.trim().split(/\s+/)[0] || "No disponible";
    }

    // Si es JSON string
    if (typeof data === "string") {
      try {
        const parsed = JSON.parse(data);
        if (parsed.output) {
          return parsed.output.trim().split(/\s+/)[0] || "No disponible";
        }
      } catch (e) {}
    }

    // Si es objeto
    if (typeof data === "object") {
      if (data.output) {
        return data.output.trim().split(/\s+/)[0] || "No disponible";
      }
    }

    return "No disponible";
  };

  const ipAddress = getIpAddress();

  const handleCopy = () => {
    navigator.clipboard.writeText(ipAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!data) {
    return (
      <div className="bg-transparent dark:bg-gray-800 rounded-xl shadow-sm border-2 border-gray-800 p-6 animate-pulse">
        <div className="h-6 bg-gray-700 rounded w-1/3 mb-4"></div>
        <div className="h-12 bg-gray-700 rounded mb-4"></div>
        <div className="h-4 bg-gray-700 rounded w-1/2"></div>
      </div>
    );
  }

  return (
    <div className="bg-transparent dark:bg-gray-800 rounded-xl shadow-sm border-2 border-gray-800 p-6 hover:shadow-lg transition-all duration-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-base font-semibold text-gray-100 dark:text-white flex items-center gap-3">
          <div className="p-2 bg-gray-900 rounded-lg">
            <HiOutlineGlobeAlt className="w-6 h-6 text-amber-500" />
          </div>
          Conectividad de Red
        </h3>
        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-900/30 rounded-full">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-bold text-emerald-400">Online</span>
        </div>
      </div>

      {/* Main IP Display */}
      <div className="mb-6">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          Dirección IP Principal
        </p>
        <div className="flex items-center gap-3 bg-gray-900 p-4 rounded-lg">
          <code className="flex-1 text-base font-mono font-bold text-gray-100 break-all">
            {ipAddress}
          </code>
          <button
            onClick={handleCopy}
            className="p-2 rounded-md hover:bg-gray-700 transition-colors text-gray-400 hover:text-gray-100"
            title="Copiar IP"
          >
            {copied ? (
              <TbChecks className="w-5 h-5 text-emerald-500" />
            ) : (
              <PiCopyDuotone className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Extra Info */}
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <HiOutlineWifi className="w-4 h-4" />
        <span>Agente conectado y reportando métricas</span>
      </div>
    </div>
  );
};
