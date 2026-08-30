import { useState, useEffect } from "react";

export function useAdminIp() {
  const [ip, setIp] = useState(null > null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const detectIp = async () => {
      try {
        const res = await fetch("https://api.ipify.org?format=json");
        if (!res.ok) throw new Error("Error al obtener IP");
        const data = await res.json();
        setIp(data.ip);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setIsLoading(false);
      }
    };

    detectIp();
  }, []); // Solo se ejecuta una vez al montar el componente

  return { ip, isLoading, error };
}
