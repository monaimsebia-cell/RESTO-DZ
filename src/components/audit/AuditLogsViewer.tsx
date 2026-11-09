import React, { useState } from 'react';
import { ShieldAlert, Search, Filter, Clock, UserCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AuditLogsViewer: React.FC = () => {
  const { auditLogs, currentTenant, isSuperAdminMode, t } = useApp();

  const [search, setSearch] = useState('');
  const displayedLogs = isSuperAdminMode
    ? auditLogs
    : auditLogs.filter(l => !l.tenantId || l.tenantId === currentTenant.id);

  const filtered = displayedLogs.filter(
    l =>
      l.description.toLowerCase().includes(search.toLowerCase()) ||
      l.userName.toLowerCase().includes(search.toLowerCase()) ||
      l.action.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 text-white max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#1E1E22] p-5 rounded-2xl border border-[#2D2D35] shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-600/20 border border-red-600/40 rounded-xl text-[#E53935]">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white flex items-center gap-2">
              {t.navAuditLogs} (Traçabilité & Sécurité)
            </h1>
            <p className="text-xs text-[#9CA3AF] mt-0.5">
              Enregistrement immuable de toutes les actions administratives, financières et opérationnelles
            </p>
          </div>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher action, utilisateur..."
            className="bg-[#161618] border border-[#2D2D35] rounded-xl pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#E53935] w-64"
          />
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-[#1E1E22] border border-[#2D2D35] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#D1D5DB]">
            <thead className="bg-[#1A1A1E] text-[#9CA3AF] uppercase text-[10px] tracking-wider border-b border-[#2D2D35]">
              <tr>
                <th className="py-3 px-4">Date & Heure</th>
                <th className="py-3 px-4">Utilisateur</th>
                <th className="py-3 px-4">Module</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Détails de l'Opération</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2D2D35]">
              {filtered.map(log => (
                <tr key={log.id} className="hover:bg-[#25252A] transition-colors">
                  <td className="py-3.5 px-4 font-mono text-[11px] text-[#9CA3AF]">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-white flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-blue-400" />
                    <span>{log.userName}</span>
                  </td>
                  <td className="py-3.5 px-4 uppercase text-[10px] font-bold text-[#9CA3AF]">
                    {log.module}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-[#2A2A30] text-amber-400">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-white font-medium">{log.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
