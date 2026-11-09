import React from 'react';
import {
  LayoutDashboard,
  Calculator,
  Grid,
  ShoppingBag,
  Truck,
  Flame,
  BookOpen,
  Boxes,
  TruckIcon,
  Users,
  Clock,
  Wallet,
  Landmark,
  TrendingUp,
  FileSpreadsheet,
  ShieldAlert,
  CreditCard,
  Building2,
  DollarSign,
  Radio,
  Activity,
  Receipt,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export type ActiveTab =
  // Tenant Tabs
  | 'dashboard'
  | 'pos'
  | 'tables'
  | 'takeaway'
  | 'delivery'
  | 'kds'
  | 'catalog'
  | 'inventory'
  | 'purchasing'
  | 'customers'
  | 'staff'
  | 'worker_pocket'
  | 'cash_register'
  | 'financials'
  | 'reports'
  | 'subscription'
  | 'audit_logs'
  // Super Admin Tabs
  | 'sa_overview'
  | 'sa_tenants'
  | 'sa_plans'
  | 'sa_invoices'
  | 'sa_announcements'
  | 'sa_audit';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const {
    isSuperAdminMode,
    currentRole,
    currentTenant,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    t,
  } = useApp();

  // Tenant navigation items with role-based visibility
  const tenantNavItems: { id: ActiveTab; label: string; icon: React.ReactNode; roles?: string[] }[] = [
    { id: 'dashboard', label: t.navDashboard, icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'pos', label: t.navPOS, icon: <Calculator className="w-4 h-4" /> },
    { id: 'tables', label: t.navTables, icon: <Grid className="w-4 h-4" /> },
    { id: 'takeaway', label: t.navTakeaway, icon: <ShoppingBag className="w-4 h-4" /> },
    { id: 'delivery', label: t.navDelivery, icon: <Truck className="w-4 h-4" /> },
    { id: 'kds', label: t.navKDS, icon: <Flame className="w-4 h-4" /> },
    { id: 'catalog', label: t.navCatalog, icon: <BookOpen className="w-4 h-4" /> },
    { id: 'inventory', label: t.navInventory, icon: <Boxes className="w-4 h-4" /> },
    { id: 'purchasing', label: t.navPurchasing, icon: <TruckIcon className="w-4 h-4" /> },
    { id: 'customers', label: t.navCustomers, icon: <Users className="w-4 h-4" /> },
    { id: 'staff', label: t.navStaff, icon: <Clock className="w-4 h-4" /> },
    { id: 'worker_pocket', label: t.navWorkerPocket, icon: <Wallet className="w-4 h-4" /> },
    { id: 'cash_register', label: t.navCashRegister, icon: <Landmark className="w-4 h-4" /> },
    { id: 'financials', label: t.navFinancials, icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'reports', label: t.navReports, icon: <FileSpreadsheet className="w-4 h-4" /> },
    { id: 'subscription', label: t.navSubscription, icon: <CreditCard className="w-4 h-4" /> },
    { id: 'audit_logs', label: t.navAuditLogs, icon: <ShieldAlert className="w-4 h-4" /> },
  ];

  // Super Admin navigation items
  const superAdminNavItems: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: 'sa_overview', label: t.saOverview, icon: <Activity className="w-4 h-4" /> },
    { id: 'sa_tenants', label: t.saTenantsList, icon: <Building2 className="w-4 h-4" /> },
    { id: 'sa_plans', label: t.saManagePlans, icon: <DollarSign className="w-4 h-4" /> },
    { id: 'sa_invoices', label: t.saInvoices, icon: <Receipt className="w-4 h-4" /> },
    { id: 'sa_announcements', label: t.saAnnouncements, icon: <Radio className="w-4 h-4" /> },
    { id: 'sa_audit', label: t.saAuditing, icon: <ShieldAlert className="w-4 h-4" /> },
  ];

  const items = isSuperAdminMode ? superAdminNavItems : tenantNavItems;

  const handleSelectTab = (id: ActiveTab) => {
    setActiveTab(id);
    setIsMobileMenuOpen(false);
  };

  const navContent = (
    <div className="flex flex-col justify-between h-full py-3 px-2">
      <div>
        {/* Workspace Brand Badge */}
        {!isSuperAdminMode && (
          <div className="mb-3 px-3 py-2 rounded-xl bg-[#1E1E22] border border-[#2D2D35]">
            <p className="text-[10px] uppercase font-bold text-[#9CA3AF] tracking-wider">Établissement Actif</p>
            <p className="text-xs font-bold text-white truncate">{currentTenant.name}</p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className={`w-2 h-2 rounded-full ${currentTenant.subscriptionStatus === 'active' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              <span className="text-[10px] text-[#9CA3AF] capitalize">
                Plan {currentTenant.planId.replace('plan_', '')} ({currentTenant.subscriptionStatus})
              </span>
            </div>
          </div>
        )}

        {isSuperAdminMode && (
          <div className="mb-3 px-3 py-2 rounded-xl bg-amber-950/30 border border-amber-800/50">
            <p className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">Super Administrateur</p>
            <p className="text-xs font-bold text-white">Gestion SaaS Globale</p>
          </div>
        )}

        {/* Nav Links */}
        <nav className="space-y-0.5">
          {items.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-[#E53935] text-white shadow-md shadow-red-950/30'
                    : 'text-[#9CA3AF] hover:text-white hover:bg-[#1E1E22]'
                }`}
              >
                {item.icon}
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Role Indicator at Bottom */}
      <div className="pt-2 border-t border-[#2D2D35] px-2 text-[11px] text-[#9CA3AF]">
        <div className="flex items-center justify-between">
          <span className="font-semibold capitalize text-white">
            {currentRole.replace('_', ' ')}
          </span>
          <span className="text-[10px] bg-[#2A2A30] px-1.5 py-0.5 rounded text-amber-400 font-mono">
            DZ
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex w-56 shrink-0 bg-[#161618] border-r border-[#2D2D35] flex-col h-[calc(100vh-58px)] sticky top-[58px] overflow-y-auto">
        {navContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex">
          <div className="w-64 max-w-[80vw] bg-[#161618] border-r border-[#2D2D35] h-full flex flex-col shadow-2xl relative">
            <div className="p-3 border-b border-[#2D2D35] flex items-center justify-between">
              <span className="font-bold text-xs text-white uppercase tracking-wider">Menu RESTO-DZ</span>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1 rounded-lg text-[#9CA3AF] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {navContent}
            </div>
          </div>
          <div className="flex-1" onClick={() => setIsMobileMenuOpen(false)} />
        </div>
      )}
    </>
  );
};
