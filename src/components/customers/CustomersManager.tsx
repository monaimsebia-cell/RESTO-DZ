import React, { useState } from 'react';
import {
  Users,
  Search,
  Plus,
  Phone,
  Mail,
  MapPin,
  Award,
  Wallet,
  ShoppingBag,
  CheckCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Customer } from '../../core/types';
import { formatDA } from '../../core/calculations';

export const CustomersManager: React.FC = () => {
  const { currentTenant, t, language } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([
    {
      id: 'cust_1',
      tenantId: currentTenant.id,
      name: 'Mourad Belkacem',
      phone: '0550 11 22 33',
      email: 'mourad@gmail.com',
      address: 'Didouche Mourad, Alger',
      totalSpent: 48500,
      ordersCount: 14,
      loyaltyPoints: 480,
      accountCredit: 1500,
    },
    {
      id: 'cust_2',
      tenantId: currentTenant.id,
      name: 'Yasmine Cherif',
      phone: '0661 44 55 66',
      email: 'yasmine.ch@yahoo.fr',
      address: 'Telemly, Alger',
      totalSpent: 32000,
      ordersCount: 9,
      loyaltyPoints: 320,
      accountCredit: 0,
    },
    {
      id: 'cust_3',
      tenantId: currentTenant.id,
      name: 'Karim Bouzid',
      phone: '0661 22 33 44',
      email: 'karim.bouzid@outlook.com',
      address: '12 Bd des Martyrs, Alger',
      totalSpent: 64200,
      ordersCount: 22,
      loyaltyPoints: 640,
      accountCredit: 0,
    },
  ]);

  const filtered = customers.filter(
    c =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery)
  );

  return (
    <div className="p-6 space-y-6 text-white max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#1E1E22] p-5 rounded-2xl border border-[#2D2D35] shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/20 border border-amber-500/40 rounded-xl text-amber-400">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white flex items-center gap-2">
              {t.navCustomers} & Programme de Fidélité
            </h1>
            <p className="text-xs text-[#9CA3AF] mt-0.5">
              Historique des commandes, fidélisation par points et solde portefeuille client
            </p>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Rechercher nom, téléphone..."
            className="bg-[#161618] border border-[#2D2D35] rounded-xl pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#E53935] w-64"
          />
        </div>
      </div>

      {/* Customers Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(cust => (
          <div
            key={cust.id}
            className="bg-[#1E1E22] border border-[#2D2D35] rounded-2xl p-5 flex flex-col justify-between shadow-xl space-y-4 hover:border-amber-500/50 transition-colors"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-sm text-white">{cust.name}</h3>
                  <div className="text-xs text-[#9CA3AF] mt-0.5">{cust.phone}</div>
                </div>
                <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full text-xs font-bold font-mono">
                  <Award className="w-3.5 h-3.5" />
                  <span>{cust.loyaltyPoints} pts</span>
                </div>
              </div>

              {cust.address && (
                <div className="mt-3 flex items-center gap-1.5 text-xs text-[#9CA3AF]">
                  <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" />
                  <span className="truncate">{cust.address}</span>
                </div>
              )}

              <div className="mt-3 pt-3 border-t border-[#2D2D35] grid grid-cols-3 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-[#9CA3AF]">Commandes</span>
                  <div className="font-mono font-bold text-white mt-0.5">{cust.ordersCount}</div>
                </div>
                <div>
                  <span className="text-[10px] text-[#9CA3AF]">Total Dépensé</span>
                  <div className="font-mono font-bold text-emerald-400 mt-0.5">
                    {formatDA(cust.totalSpent, language === 'ar')}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-[#9CA3AF]">Solde Crédit</span>
                  <div className="font-mono font-bold text-blue-400 mt-0.5">
                    {formatDA(cust.accountCredit, language === 'ar')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
