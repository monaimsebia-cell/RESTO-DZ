/**
 * RESTO-DZ — Multi-Tenant Restaurant Management SaaS Platform
 * Main Application Shell & View Routing
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { OnboardingWizardModal } from './components/onboarding/OnboardingWizardModal';

// Views
import { SuperAdminDashboard } from './components/superadmin/SuperAdminDashboard';
import { RestaurantDashboard } from './components/dashboard/RestaurantDashboard';
import { POSTerminal } from './components/pos/POSTerminal';
import { TablesFloorPlan } from './components/tables/TablesFloorPlan';
import { KitchenDisplaySystem } from './components/kds/KitchenDisplaySystem';
import { DeliveryDispatch } from './components/delivery/DeliveryDispatch';
import { CatalogRecipesManager } from './components/catalog/CatalogRecipesManager';
import { InventoryPurchasingManager } from './components/inventory/InventoryPurchasingManager';
import { WorkerPocketManager } from './components/workerpocket/WorkerPocketManager';
import { CashRegisterManager } from './components/cashregister/CashRegisterManager';
import { FinancialsReports } from './components/financials/FinancialsReports';
import { StaffAttendanceManager } from './components/staff/StaffAttendanceManager';
import { CustomersManager } from './components/customers/CustomersManager';
import { TenantSubscriptionView } from './components/subscription/TenantSubscriptionView';
import { AuditLogsViewer } from './components/audit/AuditLogsViewer';

const MainShell: React.FC = () => {
  const { isSuperAdminMode } = useApp();
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);

  // If in Super Admin mode, route to super admin views
  const renderContent = () => {
    if (isSuperAdminMode) {
      return (
        <SuperAdminDashboard
          onOpenOnboarding={() => setIsOnboardingOpen(true)}
          activeSubTab={activeTab}
        />
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return <RestaurantDashboard onNavigateTab={(tab: ActiveTab) => setActiveTab(tab)} />;
      case 'pos':
      case 'takeaway':
        return <POSTerminal />;
      case 'tables':
        return <TablesFloorPlan />;
      case 'kds':
        return <KitchenDisplaySystem />;
      case 'delivery':
        return <DeliveryDispatch />;
      case 'catalog':
        return <CatalogRecipesManager />;
      case 'inventory':
      case 'purchasing':
        return <InventoryPurchasingManager />;
      case 'worker_pocket':
        return <WorkerPocketManager />;
      case 'cash_register':
        return <CashRegisterManager />;
      case 'financials':
      case 'reports':
        return <FinancialsReports />;
      case 'staff':
        return <StaffAttendanceManager />;
      case 'customers':
        return <CustomersManager />;
      case 'subscription':
        return <TenantSubscriptionView />;
      case 'audit_logs':
        return <AuditLogsViewer />;
      default:
        return <RestaurantDashboard onNavigateTab={(tab: ActiveTab) => setActiveTab(tab)} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#101012] flex flex-col font-sans">
      <Header onOpenOnboarding={() => setIsOnboardingOpen(true)} />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <main className="flex-1 overflow-y-auto bg-[#101012]">
          {renderContent()}
        </main>
      </div>

      {/* 8-Step Restaurant Onboarding & Registration Wizard */}
      <OnboardingWizardModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainShell />
    </AppProvider>
  );
}
