import {
  UtensilsCrossed,
  ShieldCheck,
  Store,
  MapPin,
  UserCheck,
  Globe,
  Sun,
  Moon,
  Wifi,
  WifiOff,
  PlusCircle,
  RefreshCw,
  Bell,
  Menu,
  X as XIcon,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserRole, Language } from '../core/types';
import { PWAInstallButton } from './common/PWAInstallButton';

interface HeaderProps {
  onOpenOnboarding: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenOnboarding }) => {
  const {
    isSuperAdminMode,
    setIsSuperAdminMode,
    tenants,
    currentTenant,
    setActiveTenantId,
    branches,
    currentBranch,
    setActiveBranchId,
    currentRole,
    setCurrentRole,
    currentUser,
    language,
    setLanguage,
    theme,
    setTheme,
    isOnline,
    setIsOnline,
    syncQueueCount,
    triggerManualSync,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    t,
  } = useApp();

  const tenantBranches = branches.filter(b => b.tenantId === currentTenant.id);

  const rolesList: { role: UserRole; label: string; icon: string }[] = [
    { role: 'super_admin', label: 'Super Admin', icon: '⚡' },
    { role: 'owner', label: 'Owner / CEO', icon: '👑' },
    { role: 'branch_manager', label: 'Branch Manager', icon: '👔' },
    { role: 'cashier', label: 'Cashier / Caisse', icon: '💵' },
    { role: 'kitchen_worker', label: 'Kitchen Chef', icon: '👨‍🍳' },
    { role: 'waiter', label: 'Waiter / Salle', icon: '🍽️' },
    { role: 'delivery_worker', label: 'Delivery Driver', icon: '🛵' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#161618] border-b border-[#2D2D35] px-4 py-2.5 flex items-center justify-between text-white shadow-md">
      {/* Left: Platform Logo & Portal Switcher & Mobile Menu Button */}
      <div className="flex items-center gap-3">
        {/* Mobile menu toggle */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-1.5 rounded-lg bg-[#1E1E22] text-[#9CA3AF] hover:text-white border border-[#2D2D35]"
          aria-label="Toggle Navigation Menu"
        >
          {isMobileMenuOpen ? <XIcon className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
        </button>

        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E53935] to-[#B71C1C] flex items-center justify-center shadow-lg shadow-red-950/40">
            <UtensilsCrossed className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-lg tracking-wider text-white">RESTO<span className="text-[#E53935]">-DZ</span></span>
              <span className="text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider bg-[#2A2A30] text-[#9CA3AF] border border-[#3E3E48]">
                SaaS v2.4
              </span>
            </div>
            <p className="text-[11px] text-[#9CA3AF] -mt-0.5 hidden sm:block">
              {t.platformSubtitle}
            </p>
          </div>
        </div>

        {/* Portal Switch Button (SuperAdmin vs Tenant) */}
        <div className="hidden lg:flex items-center ml-2 p-0.5 rounded-lg bg-[#1E1E22] border border-[#2D2D35]">
          <button
            onClick={() => setIsSuperAdminMode(false)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              !isSuperAdminMode
                ? 'bg-[#E53935] text-white shadow-sm'
                : 'text-[#9CA3AF] hover:text-white'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            {t.restaurantPortal}
          </button>
          <button
            onClick={() => {
              setIsSuperAdminMode(true);
              setCurrentRole('super_admin');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              isSuperAdminMode
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-[#9CA3AF] hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            {t.superAdminPortal}
          </button>
        </div>
      </div>

      {/* Middle: Active Restaurant & Branch Selector (If in Restaurant Workspace) */}
      {!isSuperAdminMode ? (
        <div className="flex items-center gap-2">
          {/* Tenant Switcher */}
          <div className="flex items-center gap-1.5 bg-[#1E1E22] border border-[#2D2D35] px-2.5 py-1.5 rounded-lg">
            <Store className="w-4 h-4 text-[#E53935]" />
            <select
              value={currentTenant.id}
              onChange={e => setActiveTenantId(e.target.value)}
              className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer max-w-[140px] sm:max-w-[180px] truncate"
              aria-label="Select Restaurant"
            >
              {tenants.map(tenant => (
                <option key={tenant.id} value={tenant.id} className="bg-[#1E1E22] text-white">
                  {tenant.name} ({tenant.city})
                </option>
              ))}
            </select>
          </div>

          {/* Branch Switcher */}
          {tenantBranches.length > 0 && (
            <div className="hidden md:flex items-center gap-1.5 bg-[#1E1E22] border border-[#2D2D35] px-2.5 py-1.5 rounded-lg">
              <MapPin className="w-3.5 h-3.5 text-amber-500" />
              <select
                value={currentBranch?.id}
                onChange={e => setActiveBranchId(e.target.value)}
                className="bg-transparent text-xs font-medium text-[#9CA3AF] hover:text-white focus:outline-none cursor-pointer max-w-[160px] truncate"
                aria-label="Select Branch"
              >
                {tenantBranches.map(branch => (
                  <option key={branch.id} value={branch.id} className="bg-[#1E1E22] text-white">
                    {branch.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Register New Tenant Button */}
          <button
            onClick={onOpenOnboarding}
            className="flex items-center gap-1 bg-[#2A2A30] hover:bg-[#34343C] text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-[#3E3E48] text-white transition-colors"
            title="Register new restaurant"
          >
            <PlusCircle className="w-3.5 h-3.5 text-[#E53935]" />
            <span className="hidden sm:inline">+ Nouveau Restaurant</span>
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2 bg-amber-950/40 border border-amber-800/60 px-3 py-1 rounded-lg">
          <ShieldCheck className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-bold text-amber-300">
            Console d'Administration Globale Multi-Tenants
          </span>
        </div>
      )}

      {/* Right: Role Switcher Simulation, Language, Offline Sync, Theme */}
      <div className="flex items-center gap-2">
        {/* Fast Role Simulator Dropdown */}
        <div className="flex items-center gap-1.5 bg-[#1E1E22] border border-[#2D2D35] px-2 py-1 rounded-lg">
          <span className="text-xs">👤</span>
          <select
            value={currentRole}
            onChange={e => {
              const r = e.target.value as UserRole;
              setCurrentRole(r);
              if (r === 'super_admin') setIsSuperAdminMode(true);
            }}
            className="bg-transparent text-xs font-medium text-white focus:outline-none cursor-pointer"
            aria-label="Simulate Role"
          >
            {rolesList.map(item => (
              <option key={item.role} value={item.role} className="bg-[#1E1E22] text-white">
                {item.icon} {item.label}
              </option>
            ))}
          </select>
        </div>

        {/* Language Switcher: Toggle between Arabic (العربية) and French (Français) */}
        <div
          className="flex items-center bg-[#1E1E22] border border-[#2D2D35] rounded-xl p-0.5 shadow-xs"
          role="group"
          aria-label="Language Switcher (Français / العربية)"
        >
          <button
            onClick={() => setLanguage('fr')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              language === 'fr'
                ? 'bg-gradient-to-r from-[#E53935] to-[#D32F2F] text-white shadow-sm'
                : 'text-[#9CA3AF] hover:text-white hover:bg-[#25252A]'
            }`}
            title="Passer en Français (LTR)"
            aria-pressed={language === 'fr'}
          >
            <span className="text-xs">🇫🇷</span>
            <span>FR</span>
            <span className="hidden xl:inline text-[11px] font-normal opacity-90">Français</span>
          </button>
          <button
            onClick={() => setLanguage('ar')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              language === 'ar'
                ? 'bg-gradient-to-r from-[#E53935] to-[#D32F2F] text-white shadow-sm'
                : 'text-[#9CA3AF] hover:text-white hover:bg-[#25252A]'
            }`}
            title="التحويل إلى اللغة العربية (RTL)"
            aria-pressed={language === 'ar'}
          >
            <span className="text-xs">🇩🇿</span>
            <span>العربية</span>
          </button>
        </div>

        {/* Offline / Online Sync Simulation Toggle */}
        <button
          onClick={() => {
            if (isOnline) {
              setIsOnline(false);
            } else {
              setIsOnline(true);
              triggerManualSync();
            }
          }}
          className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
            isOnline
              ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/60'
              : 'bg-amber-950/60 text-amber-300 border-amber-700 animate-pulse'
          }`}
          title={isOnline ? t.onlineMode : `${t.offlineMode} (${syncQueueCount} actions en attente)`}
        >
          {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
          <span className="hidden xl:inline">{isOnline ? 'En ligne' : 'Hors-ligne'}</span>
          {syncQueueCount > 0 && (
            <span className="bg-amber-500 text-black px-1.5 py-0.2 rounded-full text-[10px] font-black">
              {syncQueueCount}
            </span>
          )}
        </button>

        {/* PWA Install Button */}
        <PWAInstallButton />

        {/* Theme Mode Toggle (Dark / Light) */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-1.5 rounded-lg bg-[#1E1E22] hover:bg-[#2A2A30] border border-[#2D2D35] text-[#9CA3AF] hover:text-white transition-colors"
          title={theme === 'dark' ? t.lightMode : t.darkMode}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
        </button>
      </div>
    </header>
  );
};
