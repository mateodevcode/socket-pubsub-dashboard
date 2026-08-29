import { useEffect, useRef } from "react";
import { useStore } from "../store/store";
import { VITE_CORE_WS_URL } from "../config/config";

export const useWebSocket = (channelId, clientId) => {
  const ws = useRef(null);
  const setConnected = useStore((state) => state.setConnected);
  const addEvent = useStore((state) => state.addEvent);
  const setError = useStore((state) => state.setError);

  useEffect(() => {
    if (clientId) {
      localStorage.setItem("clientId", clientId);
    }
  }, [clientId]);

  useEffect(() => {
    if (!channelId || !clientId) return;

    ws.current = new WebSocket(VITE_CORE_WS_URL);

    ws.current.onopen = () => {
      setConnected(true);
      console.log(`✅ WebSocket conectado. ClientId: ${clientId}`);
      ws.current.send(
        JSON.stringify({ channel: channelId, client_id: clientId }),
      );
    };

    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.error) {
          setError(data.error);
        } else {
          console.log("📨 Evento recibido:", data);
          // SIEMPRE agregar al array events - incluyendo eventos del sistema
          addEvent(data);

          // Log especial para eventos del sistema
          if (
            data.payload?.type === "client_joined" ||
            data.payload?.type === "client_left"
          ) {
            console.log(`👥 ${data.payload.type}: ${data.payload.client_id}`);
          }
        }
      } catch (error) {
        console.error("Failed to parse message:", error);
      }
    };

    ws.current.onerror = (error) => {
      setError("WebSocket connection error");
      console.error("WebSocket error:", error);
    };

    ws.current.onclose = () => {
      setConnected(false);
      console.log("❌ WebSocket desconectado");
    };

    return () => {
      if (ws.current) ws.current.close();
    };
  }, [channelId, clientId, setConnected, addEvent, setError]);

  return ws.current;
};
