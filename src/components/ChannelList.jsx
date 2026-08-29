import { useStore } from "../store/store";
import { useApi } from "../hooks/useApi";
import { Plus } from "lucide-react";
import { useState } from "react";

export const ChannelList = ({ onSelect }) => {
  const channels = useStore((state) => state.channels);
  const selectedChannel = useStore((state) => state.selectedChannel);
  const setChannels = useStore((state) => state.setChannels);
  const { createChannel, getChannels } = useApi();

  const [newChannelName, setNewChannelName] = useState("");
  const [newChannelDesc, setNewChannelDesc] = useState("");

  const handleCreateChannel = async (e) => {
    e.preventDefault();
    if (!newChannelName.trim()) return;

    try {
      await createChannel(newChannelName, newChannelDesc);
      setNewChannelName("");
      setNewChannelDesc("");
      const updated = await getChannels();
      setChannels(updated);
    } catch (error) {
      console.error("Failed to create channel:", error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-4">Canales</h2>

      <form
        onSubmit={handleCreateChannel}
        className="mb-4 p-4 bg-gray-50 rounded"
      >
        <input
          type="text"
          placeholder="Nombre del canal"
          value={newChannelName}
          onChange={(e) => setNewChannelName(e.target.value)}
          className="w-full px-3 py-2 border rounded mb-2"
        />
        <input
          type="text"
          placeholder="Descripción (opcional)"
          value={newChannelDesc}
          onChange={(e) => setNewChannelDesc(e.target.value)}
          className="w-full px-3 py-2 border rounded mb-2"
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 flex items-center justify-center gap-2"
        >
          <Plus size={20} /> Crear Canal
        </button>
      </form>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {channels.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No hay canales</p>
        ) : (
          channels.map((channel) => (
            <div
              key={channel.id}
              onClick={() => onSelect(channel)}
              className={`p-3 rounded cursor-pointer transition ${
                selectedChannel?.id === channel.id
                  ? "bg-blue-100 border-2 border-blue-600"
                  : "bg-gray-50 border border-gray-200 hover:bg-gray-100"
              }`}
            >
              <div className="font-semibold">{channel.name}</div>
              {channel.description && (
                <div className="text-sm text-gray-600">
                  {channel.description}
                </div>
              )}
              <div className="text-xs text-gray-500 mt-1">
                {channel.clients_count} clientes
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
