import React, { useState } from 'react';
import {
  CreditCard,
  CheckCircle,
  Calendar,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  AlertCircle,
  Receipt,
  Download,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatDA } from '../../core/calculations';

export const TenantSubscriptionView: React.FC = () => {
  const { currentTenant, plans, branches, users, t, language } = useApp();

  const currentPlan = plans.find(p => p.id === currentTenant.planId) || plans[1];
  const [isUpgradeRequested, setIsUpgradeRequested] = useState(false);

  const branchesUsed = branches.filter(b => b.tenantId === currentTenant.id).length;
  const staffUsed = users.filter(u => u.tenantId === currentTenant.id).length;

  return (
    <div className="p-6 space-y-6 text-white max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#1E1E22] p-5 rounded-2xl border border-[#2D2D35] shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-600/20 border border-red-600/40 rounded-xl text-[#E53935]">
            <CreditCard className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white flex items-center gap-2">
              {t.navSubscription} & Facturation
            </h1>
            <p className="text-xs text-[#9CA3AF] mt-0.5">
              Formule active, quotas contractuels et historique des règlements d'abonnement SaaS
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
              currentTenant.subscriptionStatus === 'active'
                ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800'
                : 'bg-amber-950/60 text-amber-300 border border-amber-800 animate-pulse'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${currentTenant.subscriptionStatus === 'active' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
            <span>Formule {currentTenant.subscriptionStatus}</span>
          </span>
        </div>
      </div>

      {/* CURRENT PLAN OVERVIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-[#1E1E22] border border-[#2D2D35] p-5 rounded-2xl shadow-xl space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#9CA3AF] tracking-wider">Formule Souscrite</span>
              <h2 className="text-xl font-black text-white mt-0.5">{currentPlan.name}</h2>
            </div>
            <div className="text-right">
              <div className="text-2xl font-black text-white font-mono">
                {formatDA(currentPlan.monthlyPrice, language === 'ar')}
              </div>
              <span className="text-[10px] text-[#9CA3AF]">/mois</span>
            </div>
          </div>

          <div className="bg-[#161618] p-3 rounded-xl border border-[#2D2D35] space-y-1 text-xs">
            <div className="flex justify-between text-[#9CA3AF]">
              <span>Prochaine Échéance :</span>
              <span className="font-mono text-white font-bold">{currentTenant.subscriptionExpiresAt}</span>
            </div>
            <div className="flex justify-between text-[#9CA3AF]">
              <span>Mode de Règlement :</span>
              <span className="text-emerald-400 font-semibold">Virement / Chèque / CIB</span>
            </div>
          </div>

          <button
            onClick={() => setIsUpgradeRequested(true)}
            className="w-full py-2.5 rounded-xl bg-[#E53935] hover:bg-[#D32F2F] text-white font-bold text-xs shadow-md transition-colors"
          >
            {isUpgradeRequested ? 'Demande Transmise au Super Admin !' : 'Changer de Formule / Prolonger'}
          </button>
        </div>

        {/* QUOTA UTILIZATION */}
        <div className="lg:col-span-2 bg-[#1E1E22] border border-[#2D2D35] p-5 rounded-2xl shadow-xl space-y-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Consommation des Quotas Contractuels
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[#161618] p-4 rounded-xl border border-[#2D2D35]">
              <span className="text-xs text-[#9CA3AF]">Succursales Déployées</span>
              <div className="text-2xl font-black text-white mt-1">
                {branchesUsed} <span className="text-sm font-normal text-[#9CA3AF]">/ {currentPlan.maxBranches}</span>
              </div>
              <div className="w-full bg-[#121214] h-2 rounded-full overflow-hidden mt-2">
                <div
                  className="bg-[#E53935] h-full rounded-full"
                  style={{ width: `${(branchesUsed / currentPlan.maxBranches) * 100}%` }}
                />
              </div>
            </div>

            <div className="bg-[#161618] p-4 rounded-xl border border-[#2D2D35]">
              <span className="text-xs text-[#9CA3AF]">Comptes Employés</span>
              <div className="text-2xl font-black text-white mt-1">
                {staffUsed} <span className="text-sm font-normal text-[#9CA3AF]">/ {currentPlan.maxStaff}</span>
              </div>
              <div className="w-full bg-[#121214] h-2 rounded-full overflow-hidden mt-2">
                <div
                  className="bg-blue-500 h-full rounded-full"
                  style={{ width: `${(staffUsed / currentPlan.maxStaff) * 100}%` }}
                />
              </div>
            </div>

            <div className="bg-[#161618] p-4 rounded-xl border border-[#2D2D35]">
              <span className="text-xs text-[#9CA3AF]">Terminaux POS Actifs</span>
              <div className="text-2xl font-black text-white mt-1">
                2 <span className="text-sm font-normal text-[#9CA3AF]">/ {currentPlan.maxDevices}</span>
              </div>
              <div className="w-full bg-[#121214] h-2 rounded-full overflow-hidden mt-2">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: '20%' }} />
              </div>
            </div>
          </div>

          <div className="pt-2">
            <h4 className="text-xs font-bold text-[#9CA3AF] uppercase mb-2">Fonctionnalités Incluses :</h4>
            <div className="grid grid-cols-2 gap-2 text-xs text-[#D1D5DB]">
              {currentPlan.features.map((f, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
