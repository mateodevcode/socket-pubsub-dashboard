import { FaDocker } from "react-icons/fa";
import { useState, useEffect } from "react";

export const DockerTableCard = ({ data }) => {
  const [containers, setContainers] = useState([]);
  const [recentChanges, setRecentChanges] = useState({
    added: [],
    removed: [],
    changed: [],
  });
  const [alertLevel, setAlertLevel] = useState("normal"); // "normal", "warning", "critical"
  const [highlightedContainers, setHighlightedContainers] = useState(new Set());

  // Inicializar contenedores
  useEffect(() => {
    console.log("📋 DockerTableCard - Recibió data:", data);
    if (data?.full_state?.containers) {
      console.log(
        "✅ Cargando desde full_state, cantidad:",
        data.full_state.containers.length,
      );
      setContainers(data.full_state.containers);
    } else if (data?.containers) {
      console.log(
        "✅ Cargando desde containers, cantidad:",
        data.containers.length,
      );
      setContainers(data.containers);
    }
  }, [data]); // ✅ CAMBIADO: era [data?.full_state], ahora es [data]

  // Procesar delta
  useEffect(() => {
    if (!data?.delta) return;

    const { added, removed, changed } = data.delta;
    console.log("🔄 Delta procesado:", { added, removed, changed });

    if (added.length > 0 || removed.length > 0) {
      // 🚨 ALERTA: Contenedores agregados o eliminados
      setAlertLevel(
        added.length > 0 && removed.length > 0 ? "critical" : "warning",
      );

      // Browser notification
      if (added.length > 0) {
        console.log("🚨 Enviando notificación de contenedores agregados");
        new Notification("🚨 Nuevo contenedor detectado!", {
          body: `${added.map((c) => c.name).join(", ")}`,
          icon: "⚠️",
          tag: "docker-alert",
          requireInteraction: true,
        });
      }
      if (removed.length > 0) {
        console.log("💀 Enviando notificación de contenedores eliminados");
        new Notification("⚠️ Contenedor eliminado", {
          body: `${removed.map((c) => c.name).join(", ")}`,
          icon: "⚠️",
          tag: "docker-alert",
        });
      }
    }

    if (changed.length > 0) {
      setAlertLevel("warning");
    }

    // Actualizar lista de contenedores
    setContainers((prev) => {
      let updated = [...prev];

      // Agregar nuevos
      updated = [
        ...updated,
        ...added.map((c) => ({
          name: c.name,
          status: c.status,
          size: c.size,
          isNew: true,
          addedAt: new Date(),
        })),
      ];

      // Eliminar
      updated = updated.filter((c) => !removed.some((r) => r.name === c.name));

      // Cambiar status
      updated = updated.map((c) => {
        const change = changed.find((ch) => ch.name === c.name);
        if (change) {
          return {
            ...c,
            status: change.status_after,
            changed: true,
            changedAt: new Date(),
          };
        }
        return c;
      });

      console.log("📦 Estado de contenedores actualizado:", updated);
      return updated;
    });

    // Guardar cambios recientes
    setRecentChanges({ added, removed, changed });

    // Highlight por 5 segundos
    const allChangedNames = new Set([
      ...added.map((c) => c.name),
      ...removed.map((c) => c.name),
      ...changed.map((c) => c.name),
    ]);
    setHighlightedContainers(allChangedNames);

    const timeout = setTimeout(() => {
      setHighlightedContainers(new Set());
      setAlertLevel("normal");
    }, 5000);

    return () => clearTimeout(timeout);
  }, [data?.delta, data?.timestamp]); // ✅ Esto está bien

  // Request notification permission
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // ✅ DEBUGGING: Muestra skeleton si no hay contenedores
  if (!containers || containers.length === 0) {
    console.log("⏳ DockerTableCard - Sin contenedores, mostrando skeleton");
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

  const getStatusColor = (status, isNew, changed) => {
    if (isNew)
      return "bg-red-500/30 text-red-400 border-red-500/50 border-2 font-bold animate-pulse";
    if (changed)
      return "bg-amber-500/30 text-amber-400 border-amber-500/50 border-2 font-bold";

    const lowerStatus = status.toLowerCase();
    if (lowerStatus.includes("up"))
      return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
    if (lowerStatus.includes("exited"))
      return "bg-red-500/20 text-red-400 border-red-500/30";
    return "bg-gray-500/20 text-gray-400 border-gray-500/30";
  };

  const getBorderColor = () => {
    if (alertLevel === "critical") return "border-red-600 bg-red-950/20";
    if (alertLevel === "warning") return "border-amber-600 bg-amber-950/20";
    return "border-gray-800";
  };

  const getHeaderBg = () => {
    if (alertLevel === "critical") return "bg-red-900/30";
    if (alertLevel === "warning") return "bg-amber-900/30";
    return "bg-gray-900/30";
  };

  return (
    <div
      className={`bg-transparent dark:bg-gray-800 rounded-xl shadow-sm border-2 p-6 hover:shadow-lg transition-all duration-200 lg:col-span-2 ${getBorderColor()}`}
    >
      {/* HEADER CON ALERTA */}
      <div
        className={`flex items-center justify-between mb-6 p-3 rounded-lg ${getHeaderBg()}`}
      >
        <h3 className="text-lg font-semibold text-gray-100 flex items-center gap-3">
          <div className="p-2 bg-gray-900 rounded-lg">
            <FaDocker className="w-6 h-6 text-blue-500" />
          </div>
          Contenedores Docker
          {alertLevel !== "normal" && (
            <span
              className="text-xs font-bold px-2 py-1 rounded-full animate-pulse"
              style={{
                backgroundColor:
                  alertLevel === "critical"
                    ? "rgba(239, 68, 68, 0.3)"
                    : "rgba(217, 119, 6, 0.3)",
                color: alertLevel === "critical" ? "#ef4444" : "#d97706",
              }}
            >
              {alertLevel === "critical" ? "🚨 ALERTA CRÍTICA" : "⚠️ CAMBIOS"}
            </span>
          )}
        </h3>
        <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-900/30 text-blue-400 border border-blue-800">
          {containers.length} Totales
        </span>
      </div>

      {/* RESUMEN DE CAMBIOS */}
      {(recentChanges.added.length > 0 ||
        recentChanges.removed.length > 0 ||
        recentChanges.changed.length > 0) && (
        <div className="mb-4 p-3 bg-gray-900/50 rounded-lg border border-gray-700 text-xs">
          {recentChanges.added.length > 0 && (
            <div className="text-red-400 mb-1">
              🚨 Agregados: {recentChanges.added.map((c) => c.name).join(", ")}
            </div>
          )}
          {recentChanges.removed.length > 0 && (
            <div className="text-amber-400 mb-1">
              💀 Eliminados:{" "}
              {recentChanges.removed.map((c) => c.name).join(", ")}
            </div>
          )}
          {recentChanges.changed.length > 0 && (
            <div className="text-amber-300">
              🔄 Modificados:{" "}
              {recentChanges.changed
                .map(
                  (c) => `${c.name} (${c.status_before} → ${c.status_after})`,
                )
                .join(", ")}
            </div>
          )}
        </div>
      )}

      {/* TABLA */}
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
            {containers.map((container, idx) => {
              const isHighlighted = highlightedContainers.has(container.name);
              const isNew = container.isNew;
              const changed = container.changed;

              return (
                <tr
                  key={idx}
                  className={`group transition-all duration-300 ${
                    isHighlighted
                      ? isNew
                        ? "bg-red-900/30 border-l-4 border-red-500"
                        : changed
                          ? "bg-amber-900/30 border-l-4 border-amber-500"
                          : "bg-gray-900/50"
                      : "hover:bg-gray-900/50"
                  }`}
                >
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      {isNew && (
                        <span className="text-red-500 font-bold text-lg">
                          🚨
                        </span>
                      )}
                      {changed && (
                        <span className="text-amber-500 font-bold text-lg">
                          🔄
                        </span>
                      )}
                      <span
                        className="text-sm font-medium text-gray-200 font-mono truncate block max-w-150 md:max-w-xs"
                        title={container.name}
                      >
                        {container.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 pr-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(container.status, isNew, changed)}`}
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
              );
            })}
          </tbody>
        </table>
      </div>

      {/* TIMESTAMP */}
      {data?.timestamp && (
        <div className="mt-4 text-xs text-gray-500 text-center">
          Última actualización: {new Date(data.timestamp).toLocaleTimeString()}
        </div>
      )}
    </div>
  );
};
