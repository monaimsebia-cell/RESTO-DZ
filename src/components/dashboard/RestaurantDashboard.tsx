import React from 'react';
import {
  TrendingUp,
  ShoppingBag,
  Clock,
  CheckCircle,
  Truck,
  Landmark,
  AlertTriangle,
  Flame,
  Users,
  Utensils,
  ArrowUpRight,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatDA } from '../../core/calculations';

interface RestaurantDashboardProps {
  onNavigateTab: (tab: any) => void;
}

export const RestaurantDashboard: React.FC<RestaurantDashboardProps> = ({ onNavigateTab }) => {
  const {
    currentTenant,
    currentBranch,
    orders,
    products,
    inventoryItems,
    activeCashSession,
    tables,
    t,
    language,
  } = useApp();

  const branchOrders = orders.filter(o => o.branchId === currentBranch.id);
  const todaySales = branchOrders
    .filter(o => o.paymentStatus === 'paid')
    .reduce((sum, o) => sum + o.total, 0);

  const totalOrdersCount = branchOrders.length;
  const preparingCount = branchOrders.filter(o => o.status === 'preparing' || o.status === 'pending').length;
  const completedCount = branchOrders.filter(o => o.status === 'completed').length;
  const deliveryCount = branchOrders.filter(o => o.type === 'delivery').length;
  const avgOrderValue = totalOrdersCount > 0 ? Math.round(todaySales / Math.max(1, totalOrdersCount)) : 0;

  const lowStockItems = inventoryItems.filter(i => i.currentStock <= i.minStockAlert);
  const occupiedTables = tables.filter(t => t.status === 'occupied').length;

  return (
    <div className="p-6 space-y-6 text-white max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-red-950/40 via-[#1E1E22] to-[#1E1E22] p-5 rounded-2xl border border-red-900/40 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-600/20 border border-red-600/40 rounded-xl text-[#E53935]">
            <Utensils className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white flex items-center gap-2">
              {currentTenant.name}
            </h1>
            <p className="text-xs text-[#9CA3AF] mt-0.5">
              Succursale : <strong className="text-white">{currentBranch.name}</strong> • Opérations en direct
            </p>
          </div>
        </div>

        {/* Quick Action POS Launch */}
        <button
          onClick={() => onNavigateTab('pos')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#E53935] hover:bg-[#D32F2F] text-white font-black text-xs shadow-lg shadow-red-950/40 transition-all hover:scale-105"
        >
          <span>Ouvrir Caisse / Nouvelle Commande</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#1E1E22] border border-[#2D2D35] p-4 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-[#9CA3AF] font-medium">Chiffre du Jour</span>
            <div className="text-2xl font-black text-white mt-1">
              {formatDA(todaySales, language === 'ar')}
            </div>
            <span className="text-[11px] text-emerald-400 font-semibold">{totalOrdersCount} commandes passées</span>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#1E1E22] border border-[#2D2D35] p-4 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-[#9CA3AF] font-medium">Panier Moyen</span>
            <div className="text-2xl font-black text-white mt-1">
              {formatDA(avgOrderValue, language === 'ar')}
            </div>
            <span className="text-[11px] text-[#9CA3AF]">Par client / ticket</span>
          </div>
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <ShoppingBag className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#1E1E22] border border-[#2D2D35] p-4 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-[#9CA3AF] font-medium">En Cuisine (KDS)</span>
            <div className="text-2xl font-black text-amber-400 mt-1">
              {preparingCount}
            </div>
            <span className="text-[11px] text-amber-300">En cours de préparation</span>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Flame className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#1E1E22] border border-[#2D2D35] p-4 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-[#9CA3AF] font-medium">État Tiroir Caisse</span>
            <div className="text-sm font-black text-white mt-1 flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${activeCashSession ? 'bg-emerald-400' : 'bg-red-400'}`} />
              <span>{activeCashSession ? 'Caisse Ouverte' : 'Fermée'}</span>
            </div>
            <span className="text-[11px] text-[#9CA3AF]">
              {activeCashSession ? formatDA(activeCashSession.expectedCashInDrawer, language === 'ar') : 'Ouvrir session'}
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Landmark className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* OPERATIONS SHORTCUTS & ALERTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Operations Modules */}
        <div className="lg:col-span-2 bg-[#1E1E22] border border-[#2D2D35] p-5 rounded-2xl shadow-xl space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Accès Rapide aux Modules Opérationnels
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { id: 'pos', title: 'Caisse & Vente', desc: 'Prendre commande rapide', icon: '🛒', color: 'border-red-500/40 hover:bg-red-950/20' },
              { id: 'tables', title: 'Plan de Salle', desc: `${occupiedTables} tables occupées`, icon: '🍽️', color: 'border-emerald-500/40 hover:bg-emerald-950/20' },
              { id: 'kds', title: 'Écran Cuisine', desc: `${preparingCount} tickets actifs`, icon: '👨‍🍳', color: 'border-amber-500/40 hover:bg-amber-950/20' },
              { id: 'delivery', title: 'Livraisons', desc: `${deliveryCount} expéditions`, icon: '🛵', color: 'border-blue-500/40 hover:bg-blue-950/20' },
              { id: 'worker_pocket', title: 'Worker Pocket', desc: 'Acomptes & salaires', icon: '💼', color: 'border-purple-500/40 hover:bg-purple-950/20' },
              { id: 'cash_register', title: 'Session Caisse', desc: 'Clôture & rapport Z', icon: '💵', color: 'border-indigo-500/40 hover:bg-indigo-950/20' },
            ].map(m => (
              <button
                key={m.id}
                onClick={() => onNavigateTab(m.id)}
                className={`p-3.5 rounded-xl bg-[#161618] border ${m.color} text-left transition-all hover:scale-105 active:scale-95 flex flex-col justify-between`}
              >
                <span className="text-2xl mb-2">{m.icon}</span>
                <div>
                  <div className="font-bold text-xs text-white">{m.title}</div>
                  <div className="text-[11px] text-[#9CA3AF] mt-0.5">{m.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Live Alerts & Low Stock */}
        <div className="bg-[#1E1E22] border border-[#2D2D35] p-5 rounded-2xl shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-[#2D2D35] pb-2">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Alertes Stocks & Stocks Bas
            </h3>
            <button
              onClick={() => onNavigateTab('inventory')}
              className="text-[11px] text-[#E53935] hover:underline font-semibold"
            >
              Gérer
            </button>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {lowStockItems.length === 0 ? (
              <div className="text-center py-6 text-xs text-emerald-400">
                <CheckCircle className="w-8 h-8 mx-auto mb-1 opacity-80" />
                <span>Tous les stocks sont à un niveau optimal</span>
              </div>
            ) : (
              lowStockItems.map(item => (
                <div
                  key={item.id}
                  className="p-2.5 rounded-xl bg-[#161618] border border-red-900/40 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-bold text-white">{item.name}</div>
                    <div className="text-[10px] text-red-400">
                      Reste {item.currentStock} {item.unit} (Seuil: {item.minStockAlert})
                    </div>
                  </div>
                  <button
                    onClick={() => onNavigateTab('inventory')}
                    className="px-2 py-1 bg-[#2A2A30] hover:bg-[#34343C] rounded text-[10px] text-white font-bold"
                  >
                    + Réassort
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
