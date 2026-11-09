import React, { useState } from 'react';
import {
  Truck,
  Phone,
  MapPin,
  Clock,
  CheckCircle2,
  DollarSign,
  User,
  ArrowRight,
  Send,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatDA } from '../../core/calculations';

export const DeliveryDispatch: React.FC = () => {
  const { orders, users, updateOrderStatus, t, language } = useApp();

  const [activeTab, setActiveTab] = useState<'pending' | 'out' | 'delivered'>('pending');

  const deliveryOrders = orders.filter(o => o.type === 'delivery');
  const drivers = users.filter(u => u.role === 'delivery_worker');

  const pendingDelivery = deliveryOrders.filter(o => o.status === 'preparing' || o.status === 'ready' || o.status === 'pending');
  const outForDelivery = deliveryOrders.filter(o => o.status === 'delivered'); // in transit
  const completedDelivery = deliveryOrders.filter(o => o.status === 'completed');

  const handleDispatch = async (orderId: string) => {
    await updateOrderStatus(orderId, 'delivered');
  };

  const handleMarkDelivered = async (orderId: string) => {
    await updateOrderStatus(orderId, 'completed');
  };

  return (
    <div className="p-6 space-y-6 text-white max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#1E1E22] p-5 rounded-2xl border border-[#2D2D35] shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-600/20 border border-blue-600/40 rounded-xl text-blue-400">
            <Truck className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white flex items-center gap-2">
              {t.navDelivery} & Expéditions Coursiers
            </h1>
            <p className="text-xs text-[#9CA3AF] mt-0.5">
              Affectation des livreurs, suivi des adresses et encaissements à la livraison
            </p>
          </div>
        </div>

        {/* Status Tabs */}
        <div className="flex bg-[#161618] border border-[#2D2D35] p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'pending' ? 'bg-[#E53935] text-white' : 'text-[#9CA3AF] hover:text-white'
            }`}
          >
            En Préparation ({pendingDelivery.length})
          </button>
          <button
            onClick={() => setActiveTab('out')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'out' ? 'bg-amber-600 text-white' : 'text-[#9CA3AF] hover:text-white'
            }`}
          >
            En Cours de Route ({outForDelivery.length})
          </button>
          <button
            onClick={() => setActiveTab('delivered')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'delivered' ? 'bg-emerald-600 text-white' : 'text-[#9CA3AF] hover:text-white'
            }`}
          >
            Livrées & Encaissées ({completedDelivery.length})
          </button>
        </div>
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {deliveryOrders.map(order => (
          <div
            key={order.id}
            className="bg-[#1E1E22] border border-[#2D2D35] rounded-2xl p-5 flex flex-col justify-between shadow-xl space-y-4 hover:border-blue-500/50 transition-colors"
          >
            <div>
              <div className="flex items-center justify-between border-b border-[#2D2D35] pb-3">
                <span className="font-mono text-base font-black text-white">{order.orderNumber}</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    order.status === 'completed'
                      ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800'
                      : order.status === 'delivered'
                      ? 'bg-amber-950/60 text-amber-300 border border-amber-800'
                      : 'bg-blue-950/60 text-blue-400 border border-blue-800'
                  }`}
                >
                  {order.status === 'delivered' ? 'En Route' : order.status}
                </span>
              </div>

              {/* Customer and Address */}
              <div className="mt-3 space-y-1.5 text-xs">
                <div className="flex items-center gap-2 text-white font-bold">
                  <User className="w-3.5 h-3.5 text-blue-400" />
                  <span>{order.customerName || 'Client Particulier'}</span>
                </div>
                {order.customerPhone && (
                  <div className="flex items-center gap-2 text-[#9CA3AF]">
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="font-mono">{order.customerPhone}</span>
                  </div>
                )}
                {order.deliveryAddress && (
                  <div className="flex items-start gap-2 text-[#D1D5DB] bg-[#161618] p-2 rounded-xl border border-[#2D2D35]">
                    <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                    <span className="text-[11px] leading-tight">{order.deliveryAddress}</span>
                  </div>
                )}
              </div>

              {/* Items summary */}
              <div className="mt-3 pt-2 border-t border-[#2D2D35] text-[11px] text-[#9CA3AF] space-y-0.5">
                {order.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span>{it.quantity}x {it.productName}</span>
                    <span className="font-mono">{it.subtotal} DA</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total & Action Footer */}
            <div className="pt-3 border-t border-[#2D2D35] flex items-center justify-between">
              <div>
                <span className="text-[10px] text-[#9CA3AF]">Total à encaisser</span>
                <div className="font-mono font-black text-sm text-emerald-400">
                  {formatDA(order.total, language === 'ar')}
                </div>
              </div>

              {order.status === 'preparing' || order.status === 'ready' ? (
                <button
                  onClick={() => handleDispatch(order.id)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Départ Coursier</span>
                </button>
              ) : order.status === 'delivered' ? (
                <button
                  onClick={() => handleMarkDelivered(order.id)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md transition-colors"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Encaissé & Livré</span>
                </button>
              ) : (
                <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Livrée
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
