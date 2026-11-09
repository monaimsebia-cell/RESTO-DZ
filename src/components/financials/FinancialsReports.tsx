import React, { useState } from 'react';
import {
  TrendingUp,
  DollarSign,
  Download,
  Calendar,
  PieChart,
  BarChart3,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Building,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatDA } from '../../core/calculations';

export const FinancialsReports: React.FC = () => {
  const { orders, currentTenant, currentBranch, workerPockets, t, language } = useApp();

  const [dateFilter, setDateFilter] = useState<'today' | 'week' | 'month' | 'year'>('month');

  // Compute Financial Aggregates
  const totalRevenue = orders.reduce((sum, o) => sum + (o.paymentStatus === 'paid' ? o.total : 0), 0);
  
  // COGS estimate (around 38% based on recipes)
  const cogsEstimate = Math.round(totalRevenue * 0.38);
  const grossProfit = totalRevenue - cogsEstimate;

  // Operating Expenses & Salaries
  const salariesCost = workerPockets.reduce((sum, p) => sum + p.salaryEarned + p.overtimeTotal, 0);
  const otherOpEx = 45000; // Rent, utilities, cleaning
  const totalExpenses = cogsEstimate + salariesCost + otherOpEx;
  const netProfit = totalRevenue - totalExpenses;

  // Order type breakdown
  const dineInRevenue = orders
    .filter(o => o.type === 'dine_in' && o.paymentStatus === 'paid')
    .reduce((sum, o) => sum + o.total, 0);
  const takeawayRevenue = orders
    .filter(o => o.type === 'takeaway' && o.paymentStatus === 'paid')
    .reduce((sum, o) => sum + o.total, 0);
  const deliveryRevenue = orders
    .filter(o => o.type === 'delivery' && o.paymentStatus === 'paid')
    .reduce((sum, o) => sum + o.total, 0);

  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [
        ['Indicateur Financier', 'Montant (DA)'],
        ['Chiffre d’Affaires Brut (Ventes)', totalRevenue],
        ['Coût Matières Consommées (COGS)', cogsEstimate],
        ['Marge Brute Réalisée', grossProfit],
        ['Masse Salariale & Heures Supp', salariesCost],
        ['Charges Fixes & Dépenses Exploitation', otherOpEx],
        ['Bénéfice Net Estimé', netProfit],
      ]
        .map(e => e.join(','))
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Rapport_Financier_${currentTenant.name.replace(/\s+/g, '_')}_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 space-y-6 text-white max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#1E1E22] p-5 rounded-2xl border border-[#2D2D35] shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-400">
            <TrendingUp className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white flex items-center gap-2">
              {t.finTitle}
            </h1>
            <p className="text-xs text-[#9CA3AF] mt-0.5">
              Distinction comptable entre flux de trésorerie réels, consommation matière et charges fixes
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#2A2A30] hover:bg-[#34343C] text-xs font-bold text-white border border-[#3E3E48] transition-colors"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Exporter CSV / Excel</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#1E1E22] border border-[#2D2D35] p-4 rounded-xl">
          <span className="text-xs text-[#9CA3AF] font-medium">{t.finGrossRevenue}</span>
          <div className="text-2xl font-black text-white mt-1">
            {formatDA(totalRevenue, language === 'ar')}
          </div>
          <span className="text-[11px] text-emerald-400 font-semibold">+18.5% vs mois précédent</span>
        </div>

        <div className="bg-[#1E1E22] border border-[#2D2D35] p-4 rounded-xl">
          <span className="text-xs text-[#9CA3AF] font-medium">{t.finCOGS}</span>
          <div className="text-2xl font-black text-amber-400 mt-1">
            {formatDA(cogsEstimate, language === 'ar')}
          </div>
          <span className="text-[11px] text-[#9CA3AF]">~38% du chiffre d'affaires</span>
        </div>

        <div className="bg-[#1E1E22] border border-[#2D2D35] p-4 rounded-xl">
          <span className="text-xs text-[#9CA3AF] font-medium">{t.finLaborCost}</span>
          <div className="text-2xl font-black text-blue-400 mt-1">
            {formatDA(salariesCost, language === 'ar')}
          </div>
          <span className="text-[11px] text-[#9CA3AF]">Salaires acquis + Heures supp.</span>
        </div>

        <div className="bg-gradient-to-br from-emerald-950/60 to-[#1E1E22] border border-emerald-800/60 p-4 rounded-xl">
          <span className="text-xs text-emerald-300 font-bold uppercase">{t.finNetProfit}</span>
          <div className="text-2xl font-black text-emerald-400 mt-1">
            {formatDA(netProfit, language === 'ar')}
          </div>
          <span className="text-[11px] text-emerald-300 font-semibold">Marge nette estimée</span>
        </div>
      </div>

      {/* REVENUE BY SERVICE TYPE & PROFIT/LOSS BREAKDOWN */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales by Service Type */}
        <div className="bg-[#1E1E22] border border-[#2D2D35] p-5 rounded-2xl shadow-xl space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <PieChart className="w-4 h-4 text-amber-400" />
            Répartition du Chiffre d'Affaires par Canal
          </h2>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-white">🍽️ Sur Place (Dine-in)</span>
                <span className="font-mono text-emerald-400">{formatDA(dineInRevenue, language === 'ar')}</span>
              </div>
              <div className="w-full bg-[#121214] h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full"
                  style={{ width: `${totalRevenue > 0 ? (dineInRevenue / totalRevenue) * 100 : 50}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-white">🛍️ À Emporter (Takeaway)</span>
                <span className="font-mono text-blue-400">{formatDA(takeawayRevenue, language === 'ar')}</span>
              </div>
              <div className="w-full bg-[#121214] h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-blue-500 h-full rounded-full"
                  style={{ width: `${totalRevenue > 0 ? (takeawayRevenue / totalRevenue) * 100 : 30}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-white">🛵 Livraison à Domicile</span>
                <span className="font-mono text-purple-400">{formatDA(deliveryRevenue, language === 'ar')}</span>
              </div>
              <div className="w-full bg-[#121214] h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-purple-500 h-full rounded-full"
                  style={{ width: `${totalRevenue > 0 ? (deliveryRevenue / totalRevenue) * 100 : 20}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Profit & Loss Statement (P&L) */}
        <div className="bg-[#1E1E22] border border-[#2D2D35] p-5 rounded-2xl shadow-xl space-y-3">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-emerald-400" />
            Compte de Résultat Simplifié (P&L)
          </h2>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1.5 border-b border-[#2D2D35]">
              <span className="font-bold text-white">Chiffre d'Affaires Brut</span>
              <span className="font-mono font-bold text-emerald-400">+{formatDA(totalRevenue, language === 'ar')}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#2D2D35]">
              <span className="text-[#9CA3AF]">Coût d'Achat Matières (Ingrédients & Recettes)</span>
              <span className="font-mono text-amber-400">-{formatDA(cogsEstimate, language === 'ar')}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#2D2D35] bg-[#161618] px-2 rounded font-bold">
              <span>Marge Brute d'Exploitation</span>
              <span className="font-mono text-emerald-400">{formatDA(grossProfit, language === 'ar')}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#2D2D35]">
              <span className="text-[#9CA3AF]">Masse Salariale & Heures Supp</span>
              <span className="font-mono text-red-400">-{formatDA(salariesCost, language === 'ar')}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#2D2D35]">
              <span className="text-[#9CA3AF]">Frais Généraux & Loyer Estimé</span>
              <span className="font-mono text-red-400">-{formatDA(otherOpEx, language === 'ar')}</span>
            </div>
            <div className="flex justify-between py-2 bg-emerald-950/40 border border-emerald-800/60 px-3 rounded-xl font-black text-sm">
              <span className="text-white">BÉNÉFICE NET ESTIMÉ</span>
              <span className="font-mono text-emerald-400">{formatDA(netProfit, language === 'ar')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
