import { useStore } from '../store/store';

export const Stats = () => {
  const stats = useStore((state) => state.stats);
  const isConnected = useStore((state) => state.isConnected);

  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-gray-600 text-sm">Canales</div>
        <div className="text-4xl font-bold text-blue-600">{stats?.channels}</div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-gray-600 text-sm">Clientes Conectados</div>
        <div className="text-4xl font-bold text-green-600">{stats?.total_clients}</div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-gray-600 text-sm">Estado WebSocket</div>
        <div className={`text-2xl font-bold ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
          {isConnected ? '🟢 Conectado' : '🔴 Desconectado'}
        </div>
      </div>
    </div>
  );
};
