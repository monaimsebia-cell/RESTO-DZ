import React, { useState } from 'react';
import {
  Flame,
  Clock,
  CheckCircle2,
  AlertCircle,
  Volume2,
  Check,
  ChevronRight,
  Filter,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Order } from '../../core/types';

export const KitchenDisplaySystem: React.FC = () => {
  const { orders, currentBranch, updateOrderStatus, t } = useApp();

  const [selectedStation, setSelectedStation] = useState<string>('all');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Filter orders that are preparing or ready
  const activeOrders = orders.filter(
    o => o.branchId === currentBranch.id && (o.status === 'preparing' || o.status === 'pending' || o.status === 'ready')
  );

  const stations = [
    { id: 'all', label: t.kdsAllStations, icon: '🔥' },
    { id: 'grill', label: t.kdsGrill, icon: '🥩' },
    { id: 'fryer', label: t.kdsFryer, icon: '🍟' },
    { id: 'pizza', label: t.kdsPizza, icon: '🍕' },
    { id: 'drinks', label: t.kdsDrinks, icon: '🥤' },
    { id: 'expo', label: t.kdsExpo, icon: '🛎️' },
  ];

  // Elapsed minutes helper
  const getElapsedMinutes = (createdAt: string) => {
    const elapsedMs = Date.now() - new Date(createdAt).getTime();
    return Math.max(1, Math.floor(elapsedMs / 60000));
  };

  const handleBumpItem = async (orderId: string, station: string) => {
    await updateOrderStatus(orderId, undefined, 'ready', station);
  };

  const handleBumpEntireOrder = async (orderId: string) => {
    await updateOrderStatus(orderId, 'ready', 'ready', 'expo');
  };

  const handleCompleteOrder = async (orderId: string) => {
    await updateOrderStatus(orderId, 'completed');
  };

  return (
    <div className="p-6 space-y-6 text-white max-w-7xl mx-auto">
      {/* KDS Header & Station Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#1E1E22] p-5 rounded-2xl border border-[#2D2D35] shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-600/20 border border-red-600/40 rounded-xl text-[#E53935]">
            <Flame className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white flex items-center gap-2">
              {t.kdsTitle}
            </h1>
            <p className="text-xs text-[#9CA3AF] mt-0.5">
              {currentBranch.name} • Synchronisation cuisine en direct
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-colors ${
              soundEnabled
                ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800'
                : 'bg-[#2A2A30] text-[#9CA3AF] border-[#3E3E48]'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>{soundEnabled ? 'Alerte Sonore Active' : 'Son Muet'}</span>
          </button>
        </div>
      </div>

      {/* Station Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {stations.map(st => (
          <button
            key={st.id}
            onClick={() => setSelectedStation(st.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedStation === st.id
                ? 'bg-[#E53935] text-white shadow-lg shadow-red-950/40'
                : 'bg-[#1E1E22] text-[#9CA3AF] hover:text-white border border-[#2D2D35]'
            }`}
          >
            <span>{st.icon}</span>
            <span>{st.label}</span>
          </button>
        ))}
      </div>

      {/* Live Order Tickets Grid */}
      {activeOrders.length === 0 ? (
        <div className="bg-[#1E1E22] border border-[#2D2D35] rounded-2xl p-12 text-center text-[#9CA3AF]">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">Toutes les commandes sont prêtes !</h3>
          <p className="text-xs text-[#9CA3AF] mt-1">
            Les nouvelles commandes envoyées depuis la caisse ou les serveurs apparaîtront instantanément ici.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {activeOrders.map(order => {
            const elapsed = getElapsedMinutes(order.createdAt);
            const isLate = elapsed > 15;
            const isWarning = elapsed > 8 && !isLate;
            const isAllReady = order.status === 'ready';

            // Filter items for current station if not all
            const displayItems =
              selectedStation === 'all' || selectedStation === 'expo'
                ? order.items
                : order.items.filter(i => i.station === selectedStation);

            if (displayItems.length === 0) return null;

            return (
              <div
                key={order.id}
                className={`bg-[#1E1E22] border rounded-2xl overflow-hidden flex flex-col justify-between transition-all shadow-lg ${
                  isAllReady
                    ? 'border-emerald-500/80 shadow-emerald-950/30'
                    : isLate
                    ? 'border-red-500 shadow-red-950/40 animate-pulse'
                    : isWarning
                    ? 'border-amber-500 shadow-amber-950/30'
                    : 'border-[#2D2D35]'
                }`}
              >
                {/* Ticket Top Header */}
                <div
                  className={`p-3.5 flex items-center justify-between text-xs font-bold ${
                    isAllReady
                      ? 'bg-emerald-950/60 text-emerald-300'
                      : isLate
                      ? 'bg-red-950/80 text-red-200'
                      : isWarning
                      ? 'bg-amber-950/70 text-amber-200'
                      : 'bg-[#161618] text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base font-black">{order.orderNumber}</span>
                    <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-black/30 font-extrabold">
                      {order.type === 'dine_in' ? `Table ${order.tableName}` : order.type === 'takeaway' ? 'Emporter' : 'Livraison'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 font-mono text-xs">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{elapsed} min</span>
                  </div>
                </div>

                {/* Ticket Customer / Note Info */}
                {order.notes && (
                  <div className="bg-amber-500/15 border-b border-amber-500/30 px-3.5 py-1.5 text-xs text-amber-300 font-semibold italic flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>"{order.notes}"</span>
                  </div>
                )}

                {/* Ticket Items List */}
                <div className="p-3.5 space-y-2.5 flex-1 divide-y divide-[#2D2D35]">
                  {displayItems.map(item => (
                    <div key={item.id} className="pt-2 first:pt-0 flex items-start justify-between gap-2 text-xs">
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-black text-sm text-white px-1.5 py-0.5 rounded bg-[#2A2A30] font-mono">
                            {item.quantity}x
                          </span>
                          <span
                            className={`font-bold ${
                              item.kitchenStatus === 'ready'
                                ? 'line-through text-[#6B7280]'
                                : 'text-white'
                            }`}
                          >
                            {item.productName}
                          </span>
                        </div>
                        {item.selectedVariation && (
                          <div className="text-[11px] text-amber-400 font-medium pl-8">
                            [{item.selectedVariation.name}]
                          </div>
                        )}
                        {item.selectedExtras?.map((e, idx) => (
                          <div key={idx} className="text-[10px] text-emerald-400 pl-8">
                            + {e.name}
                          </div>
                        ))}
                        {item.notes && (
                          <div className="text-[10px] text-red-300 italic pl-8">
                            Note: {item.notes}
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => handleBumpItem(order.id, item.station)}
                        className={`p-1.5 rounded-lg text-xs font-bold transition-colors ${
                          item.kitchenStatus === 'ready'
                            ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800'
                            : 'bg-[#2A2A30] hover:bg-emerald-600 text-white'
                        }`}
                        title="Marquer prêt"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Ticket Bump Footer */}
                <div className="p-3 bg-[#161618] border-t border-[#2D2D35]">
                  {!isAllReady ? (
                    <button
                      onClick={() => handleBumpEntireOrder(order.id)}
                      className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-950/40 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{t.kdsBumpTicket}</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleCompleteOrder(order.id)}
                      className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-1.5"
                    >
                      <span>Servi & Clôturé</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
