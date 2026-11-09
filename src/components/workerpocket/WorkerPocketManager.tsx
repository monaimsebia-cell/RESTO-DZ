import React, { useState } from 'react';
import {
  Wallet,
  Clock,
  Plus,
  Receipt,
  DollarSign,
  TrendingUp,
  UserCheck,
  FileText,
  Printer,
  X,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { WorkerPocket, WorkerTransaction } from '../../core/types';
import { formatDA } from '../../core/calculations';

export const WorkerPocketManager: React.FC = () => {
  const { workerPockets, recordWorkerTransaction, t, language } = useApp();

  const [selectedUserId, setSelectedUserId] = useState<string>(workerPockets[0]?.userId || '');
  const [activeModal, setActiveModal] = useState<'advance' | 'overtime' | 'salary' | 'statement' | null>(null);
  const [amountInput, setAmountInput] = useState<number>(0);
  const [notesInput, setNotesInput] = useState<string>('');

  const activePocket = workerPockets.find(p => p.userId === selectedUserId) || workerPockets[0];

  const handleRecordAdvance = async () => {
    if (amountInput <= 0 || !activePocket) return;
    await recordWorkerTransaction(
      activePocket.userId,
      'advance',
      amountInput,
      notesInput || 'Acompte sur salaire accordé'
    );
    setActiveModal(null);
    setAmountInput(0);
    setNotesInput('');
  };

  const handleRecordQuickOvertime = async (amount: number) => {
    if (!activePocket) return;
    await recordWorkerTransaction(
      activePocket.userId,
      'overtime_payout',
      amount,
      `Heures supplémentaires rapides (+${amount} DA)`
    );
  };

  const handleRecordSalaryPayout = async () => {
    if (amountInput <= 0 || !activePocket) return;
    await recordWorkerTransaction(
      activePocket.userId,
      'salary_payment',
      amountInput,
      notesInput || 'Versement salaire mensuel'
    );
    setActiveModal(null);
    setAmountInput(0);
    setNotesInput('');
  };

  return (
    <div className="p-6 space-y-6 text-white max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#1E1E22] p-5 rounded-2xl border border-[#2D2D35] shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-400">
            <Wallet className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white flex items-center gap-2">
              {t.wpTitle}
            </h1>
            <p className="text-xs text-[#9CA3AF] mt-0.5">
              Distinction rigoureuse entre salaire acquis, acomptes perçus et solde net restant dû
            </p>
          </div>
        </div>

        {/* Worker Selector Dropdown */}
        <div className="flex items-center gap-2 bg-[#161618] border border-[#2D2D35] px-3 py-2 rounded-xl">
          <UserCheck className="w-4 h-4 text-emerald-400" />
          <select
            value={selectedUserId}
            onChange={e => setSelectedUserId(e.target.value)}
            className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer"
          >
            {workerPockets.map(pocket => (
              <option key={pocket.userId} value={pocket.userId} className="bg-[#1E1E22] text-white">
                {pocket.userName} ({pocket.role.replace('_', ' ')})
              </option>
            ))}
          </select>
        </div>
      </div>

      {activePocket && (
        <>
          {/* Top KPI Cards for Active Worker */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#1E1E22] border border-[#2D2D35] p-4 rounded-xl">
              <span className="text-xs text-[#9CA3AF] font-medium">{t.wpEarnedSalary}</span>
              <div className="text-2xl font-black text-white mt-1">
                {formatDA(activePocket.salaryEarned, language === 'ar')}
              </div>
              <span className="text-[11px] text-[#9CA3AF]">
                Base contractuelle: {formatDA(activePocket.baseSalary, language === 'ar')}
              </span>
            </div>

            <div className="bg-[#1E1E22] border border-[#2D2D35] p-4 rounded-xl">
              <span className="text-xs text-[#9CA3AF] font-medium">{t.wpOvertime}</span>
              <div className="text-2xl font-black text-amber-400 mt-1">
                +{formatDA(activePocket.overtimeTotal, language === 'ar')}
              </div>
              <span className="text-[11px] text-amber-300">
                {activePocket.overtimeHours} heures supplémentaires
              </span>
            </div>

            <div className="bg-[#1E1E22] border border-[#2D2D35] p-4 rounded-xl">
              <span className="text-xs text-[#9CA3AF] font-medium">{t.wpAdvances}</span>
              <div className="text-2xl font-black text-red-400 mt-1">
                -{formatDA(activePocket.advancesTaken, language === 'ar')}
              </div>
              <span className="text-[11px] text-[#9CA3AF]">Déjà déduit du solde net</span>
            </div>

            <div className="bg-gradient-to-br from-emerald-950/60 to-[#1E1E22] border border-emerald-800/60 p-4 rounded-xl">
              <span className="text-xs text-emerald-300 font-bold uppercase">{t.wpRemaining}</span>
              <div className="text-2xl font-black text-emerald-400 mt-1">
                {formatDA(activePocket.remainingSalary, language === 'ar')}
              </div>
              <span className="text-[11px] text-[#D1D5DB]">À verser en fin de période</span>
            </div>
          </div>

          {/* QUICK OVERTIME BUTTONS & ACTIONS BAR */}
          <div className="bg-[#1E1E22] border border-[#2D2D35] p-5 rounded-2xl shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  {t.wpQuickOvertime} (Boutons Rapides en DA)
                </h3>
                <p className="text-xs text-[#9CA3AF] mt-0.5">
                  Rémunération instantanée d'heures ou d'efforts supplémentaires pour {activePocket.userName}
                </p>
              </div>

              {/* Quick Overtime DA buttons specifically requested in prompt: 200 DA, 300 DA, 400 DA */}
              <div className="flex items-center gap-2">
                {[200, 300, 400].map(da => (
                  <button
                    key={da}
                    onClick={() => handleRecordQuickOvertime(da)}
                    className="px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/40 border border-amber-500/40 text-amber-300 text-xs font-black transition-all hover:scale-105 active:scale-95"
                  >
                    +{da} DA
                  </button>
                ))}
              </div>
            </div>

            {/* Main Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-[#2D2D35]">
              <button
                onClick={() => {
                  setAmountInput(3000);
                  setActiveModal('advance');
                }}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-600/20 hover:bg-red-600/40 text-red-300 border border-red-600/50 text-xs font-bold transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>{t.wpGiveAdvance}</span>
              </button>

              <button
                onClick={() => {
                  setAmountInput(activePocket.remainingSalary);
                  setActiveModal('salary');
                }}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-950/40 transition-colors"
              >
                <DollarSign className="w-4 h-4" />
                <span>{t.wpPaySalary}</span>
              </button>

              <button
                onClick={() => setActiveModal('statement')}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#2A2A30] hover:bg-[#34343C] text-white border border-[#3E3E48] text-xs font-bold transition-colors"
              >
                <FileText className="w-4 h-4" />
                <span>{t.wpPrintSlip}</span>
              </button>
            </div>
          </div>

          {/* Transactions History Table */}
          <div className="bg-[#1E1E22] border border-[#2D2D35] rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 bg-[#161618] border-b border-[#2D2D35] flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-400" />
                {t.wpTransactions}
              </h3>
              <span className="text-xs text-[#9CA3AF]">
                {activePocket.transactions.length} opération(s) enregistrée(s)
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#D1D5DB]">
                <thead className="bg-[#1A1A1E] text-[#9CA3AF] uppercase text-[10px] tracking-wider border-b border-[#2D2D35]">
                  <tr>
                    <th className="py-3 px-4">Date & Réf</th>
                    <th className="py-3 px-4">Nature de l'Opération</th>
                    <th className="py-3 px-4">Détails / Motif</th>
                    <th className="py-3 px-4">Enregistré Par</th>
                    <th className="py-3 px-4 text-right">Montant (DA)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2D2D35]">
                  {activePocket.transactions.map(tx => (
                    <tr key={tx.id} className="hover:bg-[#25252A] transition-colors">
                      <td className="py-3 px-4 font-mono">
                        <div>{tx.date}</div>
                        <div className="text-[10px] text-[#9CA3AF]">{tx.receiptNumber || tx.id}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            tx.type === 'advance'
                              ? 'bg-red-950/60 text-red-400 border border-red-800'
                              : tx.type === 'overtime_payout'
                              ? 'bg-amber-950/60 text-amber-300 border border-amber-800'
                              : 'bg-emerald-950/60 text-emerald-300 border border-emerald-800'
                          }`}
                        >
                          {tx.type === 'advance'
                            ? 'Acompte Perçu'
                            : tx.type === 'overtime_payout'
                            ? 'Heures Supp.'
                            : 'Versement Salaire'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-white font-medium">{tx.notes}</td>
                      <td className="py-3 px-4 text-[#9CA3AF]">{tx.recordedBy}</td>
                      <td
                        className={`py-3 px-4 text-right font-black font-mono text-sm ${
                          tx.type === 'advance' ? 'text-red-400' : 'text-emerald-400'
                        }`}
                      >
                        {tx.type === 'advance' ? '-' : '+'}
                        {formatDA(tx.amount, language === 'ar')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ADVANCE MODAL */}
      {activeModal === 'advance' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1E1E22] border border-[#2D2D35] w-full max-w-md rounded-2xl p-5 space-y-4 text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#2D2D35] pb-2">
              <h3 className="font-bold text-base text-white">Octroyer un Acompte Financier</h3>
              <button onClick={() => setActiveModal(null)} className="p-1 text-[#9CA3AF] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div>
              <label className="text-xs text-[#9CA3AF] font-bold mb-1 block">Montant de l'acompte (DA)</label>
              <input
                type="number"
                value={amountInput}
                onChange={e => setAmountInput(Number(e.target.value))}
                className="w-full bg-[#161618] border border-[#2D2D35] rounded-xl px-3 py-2 text-white font-mono text-base font-bold focus:outline-none focus:border-red-500"
              />
            </div>
            <div>
              <label className="text-xs text-[#9CA3AF] font-bold mb-1 block">Motif / Justification</label>
              <input
                type="text"
                value={notesInput}
                onChange={e => setNotesInput(e.target.value)}
                placeholder="ex: Urgence médicale, avance loyer..."
                className="w-full bg-[#161618] border border-[#2D2D35] rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>
            <button
              onClick={handleRecordAdvance}
              disabled={amountInput <= 0}
              className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white font-bold text-xs transition-colors"
            >
              Confirmer le Versement de l'Acompte
            </button>
          </div>
        </div>
      )}

      {/* SALARY STATEMENT SLIP PREVIEW MODAL */}
      {activeModal === 'statement' && activePocket && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1E1E22] border border-[#2D2D35] w-full max-w-lg rounded-2xl p-5 space-y-4 text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#2D2D35] pb-2">
              <h3 className="font-bold text-base text-white">Fiche de Paie & Relevé Salarial</h3>
              <button onClick={() => setActiveModal(null)} className="p-1 text-[#9CA3AF] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-white text-black p-5 rounded-xl font-mono text-xs space-y-3 leading-tight select-text">
              <div className="border-b border-black pb-2 text-center">
                <h2 className="font-bold text-sm uppercase">RELEVÉ DE SALAIRE OFFICIEL</h2>
                <p className="text-[10px] text-gray-700">Mois : Novembre 2026 • Système RESTO-DZ</p>
              </div>

              <div className="flex justify-between text-xs">
                <div>
                  <strong>Employé :</strong> {activePocket.userName}
                </div>
                <div>
                  <strong>Poste :</strong> {activePocket.role.toUpperCase()}
                </div>
              </div>

              <table className="w-full border-t border-b border-black py-2 my-2 text-xs">
                <tbody>
                  <tr>
                    <td>Salaire de Base Mensuel :</td>
                    <td className="text-right font-bold">{activePocket.baseSalary} DA</td>
                  </tr>
                  <tr>
                    <td>Salaire Acquis (Prorata jours) :</td>
                    <td className="text-right font-bold">{activePocket.salaryEarned} DA</td>
                  </tr>
                  <tr>
                    <td>Heures Supplémentaires (+{activePocket.overtimeHours}h) :</td>
                    <td className="text-right font-bold text-green-700">+{activePocket.overtimeTotal} DA</td>
                  </tr>
                  <tr>
                    <td>Acomptes Déjà Versés (A déduire) :</td>
                    <td className="text-right font-bold text-red-600">-{activePocket.advancesTaken} DA</td>
                  </tr>
                  <tr className="border-t border-black font-bold text-sm">
                    <td className="pt-2">NET RESTANT À PAYER :</td>
                    <td className="pt-2 text-right">{activePocket.remainingSalary} DA</td>
                  </tr>
                </tbody>
              </table>

              <div className="text-[10px] text-gray-600 flex justify-between pt-2">
                <span>Signature Employé</span>
                <span>Cachet & Signature Direction</span>
              </div>
            </div>

            <button
              onClick={() => window.print()}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimer Fiche de Salaire</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
