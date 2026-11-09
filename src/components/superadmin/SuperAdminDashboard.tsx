import React, { useState } from 'react';
import {
  Building2,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Layers,
  Search,
  ExternalLink,
  Plus,
  Radio,
  FileText,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Tenant, SubscriptionPlan } from '../../core/types';
import { formatDA } from '../../core/calculations';

interface SuperAdminDashboardProps {
  onOpenOnboarding: () => void;
  activeSubTab?: string;
}

export const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({
  onOpenOnboarding,
  activeSubTab = 'sa_overview',
}) => {
  const {
    tenants,
    plans,
    updateTenantStatus,
    setActiveTenantId,
    setIsSuperAdminMode,
    auditLogs,
    announcements,
    t,
    language,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'trial' | 'suspended'>('all');
  const [selectedPlanForEdit, setSelectedPlanForEdit] = useState<SubscriptionPlan | null>(null);

  // Compute Platform Metrics
  const totalTenants = tenants.length;
  const activeCount = tenants.filter(t => t.subscriptionStatus === 'active').length;
  const trialCount = tenants.filter(t => t.subscriptionStatus === 'trial').length;
  const suspendedCount = tenants.filter(t => t.subscriptionStatus === 'suspended').length;

  const totalMRR = tenants.reduce((acc, tenant) => {
    if (tenant.subscriptionStatus !== 'active') return acc;
    const plan = plans.find(p => p.id === tenant.planId);
    return acc + (plan?.monthlyPrice || 0);
  }, 0);

  // Filter tenants
  const filteredTenants = tenants.filter(tenant => {
    const matchesSearch =
      tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tenant.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tenant.phone.includes(searchQuery);
    const matchesStatus = statusFilter === 'all' || tenant.subscriptionStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSupportAccess = (tenant: Tenant) => {
    setActiveTenantId(tenant.id);
    setIsSuperAdminMode(false);
  };

  return (
    <div className="p-6 space-y-6 text-white max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-amber-950/40 via-[#1E1E22] to-[#1E1E22] p-5 rounded-2xl border border-amber-800/40 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/20 border border-amber-500/30 rounded-xl text-amber-400">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white flex items-center gap-2">
              Console Super Administrateur SaaS RESTO-DZ
            </h1>
            <p className="text-xs text-[#9CA3AF] mt-0.5">
              Supervision centrale de l'ensemble des établissements, abonnements et infrastructures
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenOnboarding}
            className="flex items-center gap-2 bg-[#E53935] hover:bg-[#D32F2F] text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-red-950/40 transition-colors"
          >
            <Plus className="w-4 h-4" />
            + Déployer un Restaurant
          </button>
        </div>
      </div>

      {/* Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#1E1E22] border border-[#2D2D35] p-4 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-xs text-[#9CA3AF] font-medium">{t.saTotalTenants}</p>
            <p className="text-2xl font-black text-white mt-1">{totalTenants}</p>
            <span className="text-[11px] text-emerald-400 font-semibold">100% isolés et partitionnés</span>
          </div>
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Building2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#1E1E22] border border-[#2D2D35] p-4 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-xs text-[#9CA3AF] font-medium">{t.saMRR}</p>
            <p className="text-2xl font-black text-white mt-1">{formatDA(totalMRR, language === 'ar')}</p>
            <span className="text-[11px] text-emerald-400 font-semibold">{activeCount} abonnements payants</span>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#1E1E22] border border-[#2D2D35] p-4 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-xs text-[#9CA3AF] font-medium">{t.saTrialTenants}</p>
            <p className="text-2xl font-black text-amber-400 mt-1">{trialCount}</p>
            <span className="text-[11px] text-amber-300 font-medium">14 à 21 jours de grâce</span>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#1E1E22] border border-[#2D2D35] p-4 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-xs text-[#9CA3AF] font-medium">{t.saSystemHealth}</p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <p className="text-sm font-black text-emerald-400">Opérationnel (99.98%)</p>
            </div>
            <span className="text-[11px] text-[#9CA3AF]">Latence moyenne: 18ms</span>
          </div>
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Layers className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* RESTAURANT DIRECTORY TABLE */}
      <div className="bg-[#1E1E22] border border-[#2D2D35] rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 bg-[#161618] border-b border-[#2D2D35] flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">{t.saTenantsList}</h2>
            <span className="bg-[#2A2A30] text-xs font-bold px-2 py-0.5 rounded-full text-[#9CA3AF]">
              {filteredTenants.length}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Box */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#9CA3AF] absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Rechercher nom, ville, tél..."
                className="bg-[#1E1E22] border border-[#2D2D35] rounded-xl pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#E53935] w-56"
              />
            </div>

            {/* Status Filter */}
            <div className="flex bg-[#1E1E22] border border-[#2D2D35] rounded-xl p-0.5">
              {(['all', 'active', 'trial', 'suspended'] as const).map(st => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg capitalize transition-colors ${
                    statusFilter === st ? 'bg-[#E53935] text-white' : 'text-[#9CA3AF] hover:text-white'
                  }`}
                >
                  {st === 'all' ? 'Tous' : st}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tenants Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#D1D5DB]">
            <thead className="bg-[#1A1A1E] text-[#9CA3AF] uppercase text-[10px] tracking-wider border-b border-[#2D2D35]">
              <tr>
                <th className="py-3 px-4">{t.saColRestaurant}</th>
                <th className="py-3 px-4">{t.saColCity}</th>
                <th className="py-3 px-4">{t.saColPlan}</th>
                <th className="py-3 px-4">{t.saColStatus}</th>
                <th className="py-3 px-4">{t.saColExpiry}</th>
                <th className="py-3 px-4 text-right">{t.saColActions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2D2D35]">
              {filteredTenants.map(tenant => {
                const plan = plans.find(p => p.id === tenant.planId);
                return (
                  <tr key={tenant.id} className="hover:bg-[#25252A] transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white text-sm">{tenant.name}</div>
                      <div className="text-[11px] text-[#9CA3AF]">{tenant.email} • {tenant.phone}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="capitalize">{tenant.businessType.replace('_', ' ')}</span>
                      <div className="text-[11px] text-[#9CA3AF]">{tenant.city}, {tenant.country}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-white">
                        {language === 'ar' && plan?.nameAr ? plan.nameAr : plan?.name || tenant.planId}
                      </span>
                      <div className="text-[11px] text-[#9CA3AF]">
                        {formatDA(plan?.monthlyPrice || 0, language === 'ar')}{t.saPerMonth}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          tenant.subscriptionStatus === 'active'
                            ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800'
                            : tenant.subscriptionStatus === 'trial'
                            ? 'bg-amber-950/60 text-amber-300 border border-amber-800'
                            : 'bg-red-950/60 text-red-400 border border-red-800'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${tenant.subscriptionStatus === 'active' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                        {tenant.subscriptionStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px]">
                      {tenant.subscriptionStatus === 'trial' ? tenant.trialEndsAt : tenant.subscriptionExpiresAt}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Impersonate / Support Access */}
                        <button
                          onClick={() => handleSupportAccess(tenant)}
                          className="flex items-center gap-1 px-2.5 py-1 bg-amber-600/20 hover:bg-amber-600/40 text-amber-300 border border-amber-600/50 rounded-lg text-xs font-semibold transition-colors"
                          title={t.saImpersonate}
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>{language === 'ar' ? 'المساحة' : 'Espace'}</span>
                        </button>

                        {/* Actions according to status */}
                        {tenant.subscriptionStatus !== 'active' ? (
                          <button
                            onClick={() => updateTenantStatus(tenant.id, { subscriptionStatus: 'active' })}
                            className="px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-600/50 rounded-lg text-xs font-semibold"
                            title={t.saApproveTenant}
                          >
                            {language === 'ar' ? 'تفعيل' : 'Activer'}
                          </button>
                        ) : (
                          <button
                            onClick={() => updateTenantStatus(tenant.id, { subscriptionStatus: 'suspended' })}
                            className="px-2.5 py-1 bg-red-600/20 hover:bg-red-600/40 text-red-300 border border-red-600/50 rounded-lg text-xs font-semibold"
                            title={t.saSuspendTenant}
                          >
                            {language === 'ar' ? 'تجميد' : 'Suspendre'}
                          </button>
                        )}

                        <button
                          onClick={() => {
                            const newDate = new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0];
                            updateTenantStatus(tenant.id, { trialEndsAt: newDate, subscriptionStatus: 'trial' });
                          }}
                          className="px-2 py-1 bg-[#2A2A30] hover:bg-[#34343C] text-[#D1D5DB] border border-[#3E3E48] rounded-lg text-xs"
                          title="Prolonger l'essai de 14 jours"
                        >
                          +14j
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* PLANS & PRICING MANAGER */}
      <div className="bg-[#1E1E22] border border-[#2D2D35] p-5 rounded-2xl shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              {t.saManagePlans}
            </h2>
            <p className="text-xs text-[#9CA3AF] mt-0.5">
              Configuration des tarifs mensuels en Dinars Algériens (DA), quotas de succursales et fonctionnalités
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map(plan => (
            <div
              key={plan.id}
              className="bg-[#161618] border border-[#2D2D35] p-4 rounded-xl flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-white text-sm">
                    {language === 'ar' && plan.nameAr ? plan.nameAr : plan.name}
                  </h3>
                  <span className="text-[10px] bg-[#2A2A30] text-amber-400 font-bold px-2 py-0.5 rounded">
                    Max {plan.maxBranches} {language === 'ar' ? 'فروع' : 'succursale(s)'}
                  </span>
                </div>
                <div className="mt-2 text-2xl font-black text-white">
                  {formatDA(plan.monthlyPrice, language === 'ar')}
                  <span className="text-xs text-[#9CA3AF] font-normal"> {t.saPerMonth}</span>
                </div>
                <div className="text-[11px] text-[#9CA3AF] mt-1">
                  {t.saPerYear} {formatDA(plan.annualPrice, language === 'ar')}
                </div>
                <p className="text-xs text-[#D1D5DB] mt-2">{plan.description}</p>
                <div className="mt-3 pt-3 border-t border-[#2D2D35] space-y-1 text-xs text-[#9CA3AF]">
                  <div className="flex justify-between">
                    <span>{t.saMaxStaff}</span>
                    <span className="text-white font-bold">{plan.maxStaff}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t.saMaxDevices}</span>
                    <span className="text-white font-bold">{plan.maxDevices}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t.saTrialIncluded}</span>
                    <span className="text-emerald-400 font-bold">{plan.trialDays} {language === 'ar' ? 'يوم' : 'jours'}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* PLATFORM AUDIT LOGS */}
      <div className="bg-[#1E1E22] border border-[#2D2D35] p-5 rounded-2xl shadow-xl">
        <h2 className="text-base font-bold text-white flex items-center gap-2 mb-3">
          <FileText className="w-4 h-4 text-blue-400" />
          {t.saAuditing} (Journal Central Sécurisé)
        </h2>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {auditLogs.map(log => (
            <div
              key={log.id}
              className="p-2.5 rounded-lg bg-[#161618] border border-[#2D2D35] flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#2A2A30] text-amber-400">
                  {log.action}
                </span>
                <span className="text-white font-medium">{log.description}</span>
              </div>
              <div className="text-[#9CA3AF] text-[11px]">
                {log.userName} • {new Date(log.timestamp).toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
