import { RamCard } from "../components/commands/RamCard";

// Aquí iremos agregando los componentes a medida que los creemos
export const COMPONENT_REGISTRY = {
  ram_info: RamCard,
  // disk_space: DiskCard,       // (Futuro)
  // os_info: OsInfoCard,        // (Futuro)
};

// Función helper para renderizar dinámicamente
export const renderDynamicComponent = (action, payload) => {
  const Component = COMPONENT_REGISTRY[action];

  if (Component) {
    return <Component data={payload} />;
  }

  // Fallback por si llega un comando que aún no tiene componente visual
  return (
    <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm font-mono text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
      <p className="font-bold mb-2 text-gray-800 dark:text-gray-200">
        📦 {action}
      </p>
      <pre className="whitespace-pre-wrap">
        {typeof payload === "object"
          ? JSON.stringify(payload, null, 2)
          : payload}
      </pre>
    </div>
  );
};
