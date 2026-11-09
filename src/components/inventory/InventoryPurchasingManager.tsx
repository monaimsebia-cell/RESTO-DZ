import React, { useState } from 'react';
import {
  Boxes,
  AlertTriangle,
  Plus,
  Truck,
  ArrowDownRight,
  ArrowUpRight,
  Search,
  CheckCircle,
  X,
  FileSpreadsheet,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { InventoryItem, Supplier } from '../../core/types';
import { formatDA } from '../../core/calculations';

export const InventoryPurchasingManager: React.FC = () => {
  const { inventoryItems, adjustStockQuantity, currentTenant, t, language } = useApp();

  const [activeTab, setActiveTab] = useState<'inventory' | 'suppliers'>('inventory');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Adjustment modal
  const [adjustmentItem, setAdjustmentItem] = useState<InventoryItem | null>(null);
  const [adjustType, setAdjustType] = useState<'purchase_add' | 'waste' | 'count_adjustment'>('purchase_add');
  const [adjustQuantity, setAdjustQuantity] = useState<number>(5);
  const [adjustReason, setAdjustReason] = useState<string>('Réception commande fournisseur');

  // Filter items
  const filteredItems = inventoryItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const lowStockCount = inventoryItems.filter(i => i.currentStock <= i.minStockAlert).length;

  const handleConfirmAdjustment = async () => {
    if (!adjustmentItem || adjustQuantity <= 0) return;
    await adjustStockQuantity(adjustmentItem.id, adjustType, adjustQuantity, adjustReason);
    setAdjustmentItem(null);
  };

  return (
    <div className="p-6 space-y-6 text-white max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#1E1E22] p-5 rounded-2xl border border-[#2D2D35] shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-600/20 border border-purple-600/40 rounded-xl text-purple-400">
            <Boxes className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white flex items-center gap-2">
              {t.navInventory} & Fournisseurs
            </h1>
            <p className="text-xs text-[#9CA3AF] mt-0.5">
              Gestion des matières premières, réapprovisionnements, déstockage automatique et alertes
            </p>
          </div>
        </div>

        {/* Low Stock Warning Alert */}
        {lowStockCount > 0 && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-950/60 border border-amber-800 text-amber-300 text-xs font-bold animate-pulse">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>{lowStockCount} article(s) sous le seuil d'alerte !</span>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#1E1E22] p-4 rounded-xl border border-[#2D2D35]">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Rechercher matière première ou ingrédient..."
            className="w-full bg-[#161618] border border-[#2D2D35] rounded-xl pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#E53935]"
          />
        </div>

        {/* Category Pill Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {['all', 'raw_meat', 'dairy', 'bakery', 'vegetables', 'beverages', 'packaging'].map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-bold capitalize whitespace-nowrap transition-colors ${
                categoryFilter === cat
                  ? 'bg-[#E53935] text-white'
                  : 'bg-[#161618] text-[#9CA3AF] hover:text-white border border-[#2D2D35]'
              }`}
            >
              {cat === 'all' ? 'Tous' : cat.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Items Table */}
      <div className="bg-[#1E1E22] border border-[#2D2D35] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#D1D5DB]">
            <thead className="bg-[#1A1A1E] text-[#9CA3AF] uppercase text-[10px] tracking-wider border-b border-[#2D2D35]">
              <tr>
                <th className="py-3 px-4">Ingrédient / Matière</th>
                <th className="py-3 px-4">Catégorie</th>
                <th className="py-3 px-4">Stock Actuel</th>
                <th className="py-3 px-4">Seuil d'Alerte</th>
                <th className="py-3 px-4">Coût Moyen / Unité</th>
                <th className="py-3 px-4">Statut Stock</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2D2D35]">
              {filteredItems.map(item => {
                const isLow = item.currentStock <= item.minStockAlert;
                return (
                  <tr key={item.id} className="hover:bg-[#25252A] transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white text-sm">
                      {item.name}
                    </td>
                    <td className="py-3.5 px-4 capitalize text-[#9CA3AF]">
                      {item.category.replace('_', ' ')}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-base text-white">
                      {item.currentStock} <span className="text-xs text-[#9CA3AF]">{item.unit}</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[#9CA3AF]">
                      {item.minStockAlert} {item.unit}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold">
                      {formatDA(item.costPerUnit, language === 'ar')} /{item.unit}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          isLow
                            ? 'bg-red-950/60 text-red-400 border border-red-800 animate-pulse'
                            : 'bg-emerald-950/60 text-emerald-400 border border-emerald-800'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${isLow ? 'bg-red-400' : 'bg-emerald-400'}`} />
                        {isLow ? 'Alerte Stock Bas' : 'Stock Optimal'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => {
                          setAdjustmentItem(item);
                          setAdjustQuantity(5);
                        }}
                        className="px-3 py-1 bg-[#2A2A30] hover:bg-[#34343C] text-white border border-[#3E3E48] rounded-lg text-xs font-semibold transition-colors"
                      >
                        Ajuster / Réceptionner
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* STOCK ADJUSTMENT MODAL */}
      {adjustmentItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1E1E22] border border-[#2D2D35] w-full max-w-md rounded-2xl p-5 space-y-4 text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#2D2D35] pb-2">
              <div>
                <h3 className="font-bold text-base text-white">Mouvement de Stock</h3>
                <p className="text-xs text-[#9CA3AF]">{adjustmentItem.name}</p>
              </div>
              <button onClick={() => setAdjustmentItem(null)} className="p-1 text-[#9CA3AF] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="text-xs text-[#9CA3AF] font-bold mb-1 block">Type d'Opération</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'purchase_add', label: '+ Réception Achat' },
                  { id: 'waste', label: '- Perte / Gaspillage' },
                  { id: 'count_adjustment', label: '± Inventaire Physique' },
                ].map(op => (
                  <button
                    key={op.id}
                    type="button"
                    onClick={() => setAdjustType(op.id as any)}
                    className={`py-2 px-1 text-center text-xs font-bold rounded-lg border transition-all ${
                      adjustType === op.id
                        ? 'bg-[#E53935] text-white border-[#E53935]'
                        : 'bg-[#161618] border-[#2D2D35] text-[#9CA3AF]'
                    }`}
                  >
                    {op.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-[#9CA3AF] font-bold mb-1 block">
                Quantité ({adjustmentItem.unit})
              </label>
              <input
                type="number"
                value={adjustQuantity}
                onChange={e => setAdjustQuantity(Number(e.target.value))}
                className="w-full bg-[#161618] border border-[#2D2D35] rounded-xl px-3 py-2 text-white font-mono text-base font-bold focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs text-[#9CA3AF] font-bold mb-1 block">Motif / Justification</label>
              <input
                type="text"
                value={adjustReason}
                onChange={e => setAdjustReason(e.target.value)}
                className="w-full bg-[#161618] border border-[#2D2D35] rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>

            <button
              onClick={handleConfirmAdjustment}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors"
            >
              Enregistrer le Mouvement
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
