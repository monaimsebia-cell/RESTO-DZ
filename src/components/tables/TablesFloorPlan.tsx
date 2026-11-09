import React, { useState } from 'react';
import {
  Grid,
  Users,
  Plus,
  ArrowRightLeft,
  CheckCircle,
  Receipt,
  Utensils,
  Clock,
  Sparkles,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { RestaurantTable, DiningArea } from '../../core/types';
import { formatDA } from '../../core/calculations';

export const TablesFloorPlan: React.FC = () => {
  const { tables, orders, currentBranch, updateTableStatus, t, language } = useApp();

  const areas: DiningArea[] = currentBranch?.diningAreas?.length
    ? currentBranch.diningAreas
    : [
        { id: 'area_rdc', name: 'Salle Principale (RDC)' },
        { id: 'area_terrasse', name: 'Terrasse' },
      ];

  const [selectedAreaId, setSelectedAreaId] = useState<string>(areas[0]?.id || 'area_rdc');
  const [activeTableModal, setActiveTableModal] = useState<RestaurantTable | null>(null);
  const [transferTargetId, setTransferTargetId] = useState<string>('');

  const branchTables = tables.filter(t => t.branchId === currentBranch.id);
  const areaTables = branchTables.filter(t => t.areaId === selectedAreaId);

  // Status counters
  const availableCount = branchTables.filter(t => t.status === 'available').length;
  const occupiedCount = branchTables.filter(t => t.status === 'occupied').length;
  const reservedCount = branchTables.filter(t => t.status === 'reserved').length;
  const billingCount = branchTables.filter(t => t.status === 'billing').length;

  const handleTableClick = (table: RestaurantTable) => {
    setActiveTableModal(table);
  };

  const currentOrder = activeTableModal?.currentOrderId
    ? orders.find(o => o.id === activeTableModal.currentOrderId)
    : null;

  const handleFreeTable = async (tableId: string) => {
    await updateTableStatus(tableId, 'available', undefined);
    setActiveTableModal(null);
  };

  const handleSetOccupied = async (tableId: string) => {
    await updateTableStatus(tableId, 'occupied');
    setActiveTableModal(null);
  };

  const handleSetReserved = async (tableId: string) => {
    await updateTableStatus(tableId, 'reserved');
    setActiveTableModal(null);
  };

  const handleTransferTable = async () => {
    if (!activeTableModal || !transferTargetId) return;
    const orderId = activeTableModal.currentOrderId;
    await updateTableStatus(activeTableModal.id, 'available', undefined);
    await updateTableStatus(transferTargetId, 'occupied', orderId);
    setActiveTableModal(null);
    setTransferTargetId('');
  };

  return (
    <div className="p-6 space-y-6 text-white max-w-7xl mx-auto">
      {/* Top Floor Plan Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#1E1E22] p-5 rounded-2xl border border-[#2D2D35] shadow-xl">
        <div>
          <h1 className="text-xl font-black text-white flex items-center gap-2">
            <Grid className="w-5 h-5 text-[#E53935]" />
            {t.tablesTitle}
          </h1>
          <p className="text-xs text-[#9CA3AF] mt-0.5">
            {currentBranch.name} • Visualisation en temps réel de l'occupation des salles
          </p>
        </div>

        {/* Status Legend Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-400 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Libres ({availableCount})</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-950/40 border border-amber-800/60 text-amber-300 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>Occupées ({occupiedCount})</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-950/40 border border-purple-800/60 text-purple-300 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-purple-400" />
            <span>Réservées ({reservedCount})</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-950/40 border border-blue-800/60 text-blue-300 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-blue-400" />
            <span>Addition ({billingCount})</span>
          </div>
        </div>
      </div>

      {/* Dining Area Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {areas.map(area => (
          <button
            key={area.id}
            onClick={() => setSelectedAreaId(area.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedAreaId === area.id
                ? 'bg-[#E53935] text-white shadow-lg shadow-red-950/40'
                : 'bg-[#1E1E22] text-[#9CA3AF] hover:text-white border border-[#2D2D35]'
            }`}
          >
            <Utensils className="w-3.5 h-3.5" />
            <span>{area.name}</span>
          </button>
        ))}
      </div>

      {/* Interactive Tables Floor Canvas */}
      <div className="bg-[#161618] border border-[#2D2D35] rounded-2xl p-6 min-h-[480px] relative shadow-inner">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {areaTables.map(table => {
            const isOccupied = table.status === 'occupied';
            const isReserved = table.status === 'reserved';
            const isBilling = table.status === 'billing';

            let borderStyle = 'border-emerald-500/50 bg-emerald-950/20 hover:border-emerald-400';
            let badgeBg = 'bg-emerald-500/20 text-emerald-400';
            if (isOccupied) {
              borderStyle = 'border-amber-500/60 bg-amber-950/30 hover:border-amber-400 shadow-md shadow-amber-950/20';
              badgeBg = 'bg-amber-500/20 text-amber-300';
            } else if (isReserved) {
              borderStyle = 'border-purple-500/50 bg-purple-950/20 hover:border-purple-400';
              badgeBg = 'bg-purple-500/20 text-purple-300';
            } else if (isBilling) {
              borderStyle = 'border-blue-500/50 bg-blue-950/20 hover:border-blue-400';
              badgeBg = 'bg-blue-500/20 text-blue-300';
            }

            return (
              <button
                key={table.id}
                onClick={() => handleTableClick(table)}
                className={`flex flex-col justify-between p-4 rounded-2xl border ${borderStyle} transition-all duration-150 hover:scale-[1.03] text-left aspect-square group`}
              >
                <div className="flex items-start justify-between w-full">
                  <span className="font-black text-lg text-white font-mono">{table.number}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${badgeBg}`}>
                    {table.status}
                  </span>
                </div>

                <div className="my-auto py-2">
                  <div className="flex items-center gap-1.5 text-xs text-[#9CA3AF]">
                    <Users className="w-3.5 h-3.5" />
                    <span>{table.capacity} couverts</span>
                  </div>
                  {table.assignedWaiterName && (
                    <div className="text-[11px] text-amber-300 font-medium mt-1">
                      Serveur : {table.assignedWaiterName}
                    </div>
                  )}
                  {table.currentOrderId && (
                    <div className="text-[10px] font-mono text-emerald-400 mt-1 font-bold">
                      Ticket {table.currentOrderId}
                    </div>
                  )}
                </div>

                <div className="w-full pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-[#9CA3AF] group-hover:text-white">
                  <span>Détails & Actions</span>
                  <span>→</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* TABLE INTERACTION MODAL */}
      {activeTableModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1E1E22] border border-[#2D2D35] w-full max-w-md rounded-2xl p-5 space-y-4 text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#2D2D35] pb-3">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <span>Table {activeTableModal.number}</span>
                  <span className="text-xs font-bold text-[#9CA3AF]">({activeTableModal.capacity} couverts)</span>
                </h3>
                <p className="text-xs text-[#9CA3AF] capitalize">Statut actuel : {activeTableModal.status}</p>
              </div>
              <button
                onClick={() => setActiveTableModal(null)}
                className="p-1 rounded-lg text-[#9CA3AF] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current Order details if occupied */}
            {currentOrder ? (
              <div className="bg-[#161618] p-3 rounded-xl border border-[#2D2D35] space-y-2 text-xs">
                <div className="flex justify-between items-center font-bold">
                  <span className="text-[#9CA3AF]">Commande en cours :</span>
                  <span className="font-mono text-white">{currentOrder.orderNumber}</span>
                </div>
                <div className="flex justify-between text-[#9CA3AF]">
                  <span>Total commande :</span>
                  <span className="font-bold text-white font-mono">{formatDA(currentOrder.total, language === 'ar')}</span>
                </div>
                <div className="flex justify-between text-[#9CA3AF]">
                  <span>Statut cuisine :</span>
                  <span className="font-bold text-amber-400 capitalize">{currentOrder.status}</span>
                </div>
                <div className="pt-2 border-t border-[#2D2D35] max-h-32 overflow-y-auto space-y-1">
                  {currentOrder.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between text-[11px]">
                      <span>{it.quantity}x {it.productName}</span>
                      <span className="font-mono">{it.subtotal} DA</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-[#161618] p-3 rounded-xl border border-[#2D2D35] text-center text-xs text-[#9CA3AF]">
                Aucune commande ouverte sur cette table.
              </div>
            )}

            {/* Transfer table dropdown */}
            {activeTableModal.status === 'occupied' && (
              <div className="bg-[#161618] p-3 rounded-xl border border-[#2D2D35] space-y-2">
                <label className="text-xs font-bold text-[#9CA3AF] flex items-center gap-1.5">
                  <ArrowRightLeft className="w-3.5 h-3.5 text-amber-400" />
                  Transférer la commande vers une autre table
                </label>
                <div className="flex gap-2">
                  <select
                    value={transferTargetId}
                    onChange={e => setTransferTargetId(e.target.value)}
                    className="flex-1 bg-[#1E1E22] border border-[#2D2D35] rounded-lg px-2.5 py-1.5 text-xs text-white"
                  >
                    <option value="">Sélectionner table cible disponible...</option>
                    {branchTables
                      .filter(t => t.id !== activeTableModal.id && t.status === 'available')
                      .map(t => (
                        <option key={t.id} value={t.id}>
                          {t.number} ({t.capacity} places)
                        </option>
                      ))}
                  </select>
                  <button
                    onClick={handleTransferTable}
                    disabled={!transferTargetId}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-black font-bold text-xs rounded-lg transition-colors"
                  >
                    Transférer
                  </button>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              {activeTableModal.status !== 'available' ? (
                <button
                  onClick={() => handleFreeTable(activeTableModal.id)}
                  className="py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors"
                >
                  Libérer la Table
                </button>
              ) : (
                <button
                  onClick={() => handleSetOccupied(activeTableModal.id)}
                  className="py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-black font-bold text-xs transition-colors"
                >
                  Occuper la Table
                </button>
              )}

              {activeTableModal.status !== 'reserved' ? (
                <button
                  onClick={() => handleSetReserved(activeTableModal.id)}
                  className="py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-colors"
                >
                  Réserver Table
                </button>
              ) : (
                <button
                  onClick={() => handleFreeTable(activeTableModal.id)}
                  className="py-2.5 rounded-xl bg-[#2A2A30] hover:bg-[#34343C] text-white font-bold text-xs transition-colors"
                >
                  Annuler Réservation
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
