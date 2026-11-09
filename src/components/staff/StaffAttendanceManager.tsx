import React, { useState } from 'react';
import {
  Users,
  Clock,
  UserPlus,
  CheckCircle,
  Calendar,
  DollarSign,
  Shield,
  X,
  Phone,
  Mail,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { User, UserRole, AttendanceRecord } from '../../core/types';
import { formatDA } from '../../core/calculations';

export const StaffAttendanceManager: React.FC = () => {
  const { users, currentBranch, currentTenant, t, language } = useApp();

  const [activeTab, setActiveTab] = useState<'employees' | 'attendance'>('employees');
  const [clockedUsers, setClockedUsers] = useState<Record<string, string>>({
    user_cashier_sarah: '08:55',
    user_chef_rachid: '09:00',
    user_waiter_yacine: '10:30',
  });

  const tenantUsers = users.filter(u => u.tenantId === currentTenant.id);

  const toggleClock = (userId: string) => {
    setClockedUsers(prev => {
      const copy = { ...prev };
      if (copy[userId]) {
        delete copy[userId];
      } else {
        copy[userId] = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      return copy;
    });
  };

  return (
    <div className="p-6 space-y-6 text-white max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#1E1E22] p-5 rounded-2xl border border-[#2D2D35] shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-600/20 border border-blue-600/40 rounded-xl text-blue-400">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white flex items-center gap-2">
              {t.navStaff} & Pointage Horaire
            </h1>
            <p className="text-xs text-[#9CA3AF] mt-0.5">
              Gestion des collaborateurs, fiches de postes, pointage d'arrivée et départs
            </p>
          </div>
        </div>

        {/* View Switcher */}
        <div className="flex bg-[#161618] border border-[#2D2D35] p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('employees')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'employees' ? 'bg-[#E53935] text-white shadow-sm' : 'text-[#9CA3AF] hover:text-white'
            }`}
          >
            Équipe Active ({tenantUsers.length})
          </button>
          <button
            onClick={() => setActiveTab('attendance')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'attendance' ? 'bg-[#E53935] text-white shadow-sm' : 'text-[#9CA3AF] hover:text-white'
            }`}
          >
            Pointage en Direct
          </button>
        </div>
      </div>

      {activeTab === 'employees' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tenantUsers.map(emp => (
            <div
              key={emp.id}
              className="bg-[#1E1E22] border border-[#2D2D35] rounded-2xl p-5 flex flex-col justify-between shadow-xl space-y-4"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-white">{emp.name}</h3>
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#2A2A30] text-amber-400 mt-1">
                      {emp.role.replace('_', ' ')}
                    </span>
                  </div>
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      clockedUsers[emp.id] ? 'bg-emerald-400 animate-pulse' : 'bg-gray-600'
                    }`}
                    title={clockedUsers[emp.id] ? 'Actuellement en service' : 'Absent / Non pointé'}
                  />
                </div>

                <div className="mt-3 space-y-1 text-xs text-[#9CA3AF]">
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-[#6B7280]" />
                    <span>{emp.email}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#6B7280]" />
                    <span>{emp.phone}</span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-[#2D2D35] grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[#9CA3AF] text-[10px]">Salaire de Base</span>
                    <div className="font-mono font-bold text-white">
                      {formatDA(emp.monthlySalary, language === 'ar')}
                    </div>
                  </div>
                  <div>
                    <span className="text-[#9CA3AF] text-[10px]">Taux Heure Supp.</span>
                    <div className="font-mono font-bold text-amber-400">
                      {formatDA(emp.hourlyOvertimeRate, language === 'ar')}/h
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-[#2D2D35] flex items-center justify-between">
                <span className="text-[11px] text-[#9CA3AF]">
                  PIN POS : <strong className="font-mono text-white">{emp.pinCode || '****'}</strong>
                </span>
                <button
                  onClick={() => toggleClock(emp.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    clockedUsers[emp.id]
                      ? 'bg-red-600/20 text-red-300 border border-red-600/50 hover:bg-red-600/40'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  }`}
                >
                  {clockedUsers[emp.id] ? 'Pointer Départ' : 'Pointer Arrivée'}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* LIVE ATTENDANCE SHEET */
        <div className="bg-[#1E1E22] border border-[#2D2D35] rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 bg-[#161618] border-b border-[#2D2D35] flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              Registre de Présence en Direct (Aujourd'hui)
            </h3>
            <span className="text-xs text-emerald-400 font-bold">
              {Object.keys(clockedUsers).length} collaborateur(s) en poste
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#D1D5DB]">
              <thead className="bg-[#1A1A1E] text-[#9CA3AF] uppercase text-[10px] tracking-wider border-b border-[#2D2D35]">
                <tr>
                  <th className="py-3 px-4">Employé</th>
                  <th className="py-3 px-4">Poste</th>
                  <th className="py-3 px-4">Heure d'Arrivée</th>
                  <th className="py-3 px-4">Statut Pointage</th>
                  <th className="py-3 px-4 text-right">Action Rapide</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2D2D35]">
                {tenantUsers.map(u => {
                  const clockTime = clockedUsers[u.id];
                  return (
                    <tr key={u.id} className="hover:bg-[#25252A] transition-colors">
                      <td className="py-3.5 px-4 font-bold text-white text-sm">{u.name}</td>
                      <td className="py-3.5 px-4 capitalize text-[#9CA3AF]">{u.role.replace('_', ' ')}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                        {clockTime ? clockTime : '—'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            clockTime
                              ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800'
                              : 'bg-[#2A2A30] text-[#9CA3AF]'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${clockTime ? 'bg-emerald-400' : 'bg-gray-600'}`} />
                          {clockTime ? 'En Poste' : 'Non Pointé'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => toggleClock(u.id)}
                          className="px-3 py-1 bg-[#2A2A30] hover:bg-[#34343C] text-white border border-[#3E3E48] rounded-lg text-xs font-semibold"
                        >
                          {clockTime ? 'Fin de Service' : 'Débuter Shift'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
