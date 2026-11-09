import React, { useState } from 'react';
import {
  Landmark,
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle2,
  Receipt,
  Printer,
  DollarSign,
  TrendingDown,
  TrendingUp,
  X,
  CreditCard,
  Banknote,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatDA, reconcileCashDrawer } from '../../core/calculations';

export const CashRegisterManager: React.FC = () => {
  const {
    activeCashSession,
    cashSessions,
    openCashSession,
    closeCashSession,
    recordCashExpense,
    currentBranch,
    currentUser,
    t,
    language,
  } = useApp();

  const [activeModal, setActiveModal] = useState<'open' | 'close' | 'expense' | 'zreport' | null>(null);
  const [openingFloatInput, setOpeningFloatInput] = useState<number>(15000);
  const [registerNameInput, setRegisterNameInput] = useState<string>('Caisse N°1 Comptoir');
  const [countedCashInput, setCountedCashInput] = useState<number>(activeCashSession?.expectedCashInDrawer || 0);
  const [closingNotes, setClosingNotes] = useState<string>('');

  // Expense modal fields
  const [expenseAmount, setExpenseAmount] = useState<number>(1500);
  const [expenseCategory, setExpenseCategory] = useState<string>('raw_materials');
  const [expenseDescription, setExpenseDescription] = useState<string>('Achat pain d’urgence');

  const handleOpenRegister = async () => {
    await openCashSession(openingFloatInput, registerNameInput);
    setActiveModal(null);
  };

  const handleCloseRegister = async () => {
    await closeCashSession(countedCashInput, closingNotes);
    setActiveModal(null);
  };

  const handleRecordExpense = async () => {
    if (expenseAmount <= 0) return;
    await recordCashExpense(expenseAmount, expenseCategory, expenseDescription);
    setActiveModal(null);
    setExpenseAmount(0);
    setExpenseDescription('');
  };

  // Reconcile simulation for current open drawer
  const reconciliation = activeCashSession
    ? reconcileCashDrawer(
        activeCashSession.openingCash,
        activeCashSession.cashSales,
        activeCashSession.cashDeposits,
        activeCashSession.cashWithdrawals,
        activeCashSession.refundsAmount,
        countedCashInput
      )
    : null;

  return (
    <div className="p-6 space-y-6 text-white max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#1E1E22] p-5 rounded-2xl border border-[#2D2D35] shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/20 border border-amber-500/40 rounded-xl text-amber-400">
            <Landmark className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white flex items-center gap-2">
              {t.crTitle}
            </h1>
            <p className="text-xs text-[#9CA3AF] mt-0.5">
              {currentBranch.name} • Suivi rigoureux des entrées, sorties et rapport Z de clôture
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activeCashSession ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveModal('expense')}
                className="px-3.5 py-2 rounded-xl bg-red-600/20 hover:bg-red-600/40 text-red-300 border border-red-600/50 text-xs font-bold transition-colors"
              >
                + {t.crRecordExpense}
              </button>
              <button
                onClick={() => {
                  setCountedCashInput(activeCashSession.expectedCashInDrawer);
                  setActiveModal('close');
                }}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-black text-xs font-black shadow-lg shadow-amber-950/40 transition-colors flex items-center gap-1.5"
              >
                <Lock className="w-4 h-4" />
                <span>{t.crCloseRegister}</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => setActiveModal('open')}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-lg shadow-emerald-950/40 transition-colors flex items-center gap-2"
            >
              <Unlock className="w-4 h-4" />
              <span>{t.crOpenRegister}</span>
            </button>
          )}
        </div>
      </div>

      {/* ACTIVE SESSION DASHBOARD */}
      {activeCashSession ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#1E1E22] border border-[#2D2D35] p-4 rounded-xl">
              <span className="text-xs text-[#9CA3AF] font-medium">{t.crOpeningBalance}</span>
              <div className="text-2xl font-black text-white mt-1">
                {formatDA(activeCashSession.openingCash, language === 'ar')}
              </div>
              <span className="text-[11px] text-[#9CA3AF]">
                Ouvert à {new Date(activeCashSession.openedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            <div className="bg-[#1E1E22] border border-[#2D2D35] p-4 rounded-xl">
              <span className="text-xs text-[#9CA3AF] font-medium">{t.crCashSales}</span>
              <div className="text-2xl font-black text-emerald-400 mt-1">
                +{formatDA(activeCashSession.cashSales, language === 'ar')}
              </div>
              <span className="text-[11px] text-emerald-300">
                Encaissements en espèces
              </span>
            </div>

            <div className="bg-[#1E1E22] border border-[#2D2D35] p-4 rounded-xl">
              <span className="text-xs text-[#9CA3AF] font-medium">{t.crCashWithdrawals}</span>
              <div className="text-2xl font-black text-red-400 mt-1">
                -{formatDA(activeCashSession.cashWithdrawals, language === 'ar')}
              </div>
              <span className="text-[11px] text-red-300">
                Dépenses caisse / Achats d'urgence
              </span>
            </div>

            <div className="bg-gradient-to-br from-amber-950/50 to-[#1E1E22] border border-amber-600/50 p-4 rounded-xl">
              <span className="text-xs text-amber-300 font-bold uppercase">{t.crExpectedDrawer}</span>
              <div className="text-2xl font-black text-amber-400 mt-1">
                {formatDA(activeCashSession.expectedCashInDrawer, language === 'ar')}
              </div>
              <span className="text-[11px] text-[#D1D5DB]">
                Fond initial + Ventes - Dépenses
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-[#1E1E22] border border-[#2D2D35] rounded-2xl p-8 text-center text-[#9CA3AF]">
          <Lock className="w-10 h-10 text-amber-500 mx-auto mb-2" />
          <h3 className="text-base font-bold text-white">Aucune caisse n'est ouverte actuellement</h3>
          <p className="text-xs text-[#9CA3AF] mt-1">
            Veuillez ouvrir une session de caisse en indiquant le fond de caisse initial pour commencer à encaisser.
          </p>
        </div>
      )}

      {/* SESSIONS HISTORY TABLE */}
      <div className="bg-[#1E1E22] border border-[#2D2D35] rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 bg-[#161618] border-b border-[#2D2D35] flex items-center justify-between">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Receipt className="w-4 h-4 text-amber-400" />
            Historique des Sessions & Rapports Z
          </h3>
          <span className="text-xs text-[#9CA3AF]">{cashSessions.length} session(s)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#D1D5DB]">
            <thead className="bg-[#1A1A1E] text-[#9CA3AF] uppercase text-[10px] tracking-wider border-b border-[#2D2D35]">
              <tr>
                <th className="py-3 px-4">Session & Caissier</th>
                <th className="py-3 px-4">Statut</th>
                <th className="py-3 px-4">Fond Initial</th>
                <th className="py-3 px-4">Ventes Espèces</th>
                <th className="py-3 px-4">Ventes CB/CIB</th>
                <th className="py-3 px-4">Espèces Théoriques</th>
                <th className="py-3 px-4">Compté Réel</th>
                <th className="py-3 px-4 text-right">Écart (Discrepancy)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2D2D35]">
              {cashSessions.map(session => (
                <tr key={session.id} className="hover:bg-[#25252A] transition-colors">
                  <td className="py-3.5 px-4 font-medium">
                    <div className="font-bold text-white">{session.registerName}</div>
                    <div className="text-[11px] text-[#9CA3AF]">{session.cashierName} • {session.id}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        session.status === 'open'
                          ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800'
                          : 'bg-[#2A2A30] text-[#9CA3AF]'
                      }`}
                    >
                      {session.status === 'open' ? 'En cours' : 'Clôturée'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono">{formatDA(session.openingCash, language === 'ar')}</td>
                  <td className="py-3.5 px-4 font-mono text-emerald-400">+{formatDA(session.cashSales, language === 'ar')}</td>
                  <td className="py-3.5 px-4 font-mono">{formatDA(session.cardSales, language === 'ar')}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-white">
                    {formatDA(session.expectedCashInDrawer, language === 'ar')}
                  </td>
                  <td className="py-3.5 px-4 font-mono">
                    {session.actualCountedCash !== undefined
                      ? formatDA(session.actualCountedCash, language === 'ar')
                      : '—'}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold">
                    {session.discrepancy !== undefined ? (
                      <span
                        className={
                          session.discrepancy === 0
                            ? 'text-emerald-400'
                            : session.discrepancy > 0
                            ? 'text-blue-400'
                            : 'text-red-400'
                        }
                      >
                        {session.discrepancy > 0 ? '+' : ''}
                        {formatDA(session.discrepancy, language === 'ar')}
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* OPEN SESSION MODAL */}
      {activeModal === 'open' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1E1E22] border border-[#2D2D35] w-full max-w-md rounded-2xl p-5 space-y-4 text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#2D2D35] pb-2">
              <h3 className="font-bold text-base text-white">Ouverture de Session de Caisse</h3>
              <button onClick={() => setActiveModal(null)} className="p-1 text-[#9CA3AF] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div>
              <label className="text-xs text-[#9CA3AF] font-bold mb-1 block">Nom du Point d'Encaissement</label>
              <input
                type="text"
                value={registerNameInput}
                onChange={e => setRegisterNameInput(e.target.value)}
                className="w-full bg-[#161618] border border-[#2D2D35] rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-[#9CA3AF] font-bold mb-1 block">Fond de Caisse Initial (DA)</label>
              <input
                type="number"
                value={openingFloatInput}
                onChange={e => setOpeningFloatInput(Number(e.target.value))}
                className="w-full bg-[#161618] border border-[#2D2D35] rounded-xl px-3 py-2 text-white font-mono text-base font-bold focus:outline-none"
              />
            </div>
            <button
              onClick={handleOpenRegister}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors"
            >
              Confirmer & Ouvrir la Caisse
            </button>
          </div>
        </div>
      )}

      {/* CLOSE SESSION MODAL WITH DISCREPANCY RECONCILIATION */}
      {activeModal === 'close' && activeCashSession && reconciliation && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1E1E22] border border-[#2D2D35] w-full max-w-md rounded-2xl p-5 space-y-4 text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#2D2D35] pb-2">
              <h3 className="font-bold text-base text-white">Clôture de Caisse & Rapport Z</h3>
              <button onClick={() => setActiveModal(null)} className="p-1 text-[#9CA3AF] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-[#161618] p-3 rounded-xl border border-[#2D2D35] space-y-2 text-xs">
              <div className="flex justify-between text-[#9CA3AF]">
                <span>Espèces Théoriques Attendues :</span>
                <span className="font-mono font-bold text-white">
                  {formatDA(reconciliation.expectedCashInDrawer, language === 'ar')}
                </span>
              </div>
            </div>

            <div>
              <label className="text-xs text-[#9CA3AF] font-bold mb-1 block">
                Espèces Réellement Comptées dans le Tiroir (DA) *
              </label>
              <input
                type="number"
                value={countedCashInput}
                onChange={e => setCountedCashInput(Number(e.target.value))}
                className="w-full bg-[#161618] border border-[#2D2D35] rounded-xl px-3 py-2 text-white font-mono text-base font-bold focus:outline-none"
              />
            </div>

            {/* Discrepancy Alert */}
            <div
              className={`p-3 rounded-xl text-xs font-bold flex items-center justify-between border ${
                reconciliation.isBalanced
                  ? 'bg-emerald-950/40 border-emerald-800 text-emerald-400'
                  : reconciliation.discrepancy > 0
                  ? 'bg-blue-950/40 border-blue-800 text-blue-300'
                  : 'bg-red-950/40 border-red-800 text-red-400'
              }`}
            >
              <span>{reconciliation.isBalanced ? 'Caisse parfaitement équilibrée' : reconciliation.discrepancy > 0 ? 'Frais / Surplus en caisse' : 'Attention : Déficit de caisse'} :</span>
              <span className="font-mono text-sm">
                {reconciliation.discrepancy > 0 ? '+' : ''}
                {formatDA(reconciliation.discrepancy, language === 'ar')}
              </span>
            </div>

            <div>
              <label className="text-xs text-[#9CA3AF] font-bold mb-1 block">Notes / Justification de fin de shift</label>
              <input
                type="text"
                value={closingNotes}
                onChange={e => setClosingNotes(e.target.value)}
                placeholder="ex: Tout conforme, monnaie vérifiée..."
                className="w-full bg-[#161618] border border-[#2D2D35] rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>

            <button
              onClick={handleCloseRegister}
              className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-black font-black text-xs transition-colors"
            >
              Clôturer Définitivement & Générer Rapport Z
            </button>
          </div>
        </div>
      )}

      {/* RECORD EXPENSE MODAL */}
      {activeModal === 'expense' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1E1E22] border border-[#2D2D35] w-full max-w-md rounded-2xl p-5 space-y-4 text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#2D2D35] pb-2">
              <h3 className="font-bold text-base text-white">Dépense Immédiate du Tiroir-Caisse</h3>
              <button onClick={() => setActiveModal(null)} className="p-1 text-[#9CA3AF] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div>
              <label className="text-xs text-[#9CA3AF] font-bold mb-1 block">Montant Décaissé (DA)</label>
              <input
                type="number"
                value={expenseAmount}
                onChange={e => setExpenseAmount(Number(e.target.value))}
                className="w-full bg-[#161618] border border-[#2D2D35] rounded-xl px-3 py-2 text-white font-mono text-base font-bold focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-[#9CA3AF] font-bold mb-1 block">Catégorie</label>
              <select
                value={expenseCategory}
                onChange={e => setExpenseCategory(e.target.value)}
                className="w-full bg-[#161618] border border-[#2D2D35] rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              >
                <option value="raw_materials">Achats Ingrédients / Pain / Boucherie</option>
                <option value="cleaning">Produits d'Entretien & Hygiène</option>
                <option value="maintenance">Dépannage & Maintenance</option>
                <option value="miscellaneous">Autre petite dépense</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-[#9CA3AF] font-bold mb-1 block">Description / Réf Reçu</label>
              <input
                type="text"
                value={expenseDescription}
                onChange={e => setExpenseDescription(e.target.value)}
                placeholder="ex: Facturette boulangerie 15 baguettes..."
                className="w-full bg-[#161618] border border-[#2D2D35] rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>
            <button
              onClick={handleRecordExpense}
              disabled={expenseAmount <= 0}
              className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white font-bold text-xs transition-colors"
            >
              Enregistrer la Sortie de Caisse
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
