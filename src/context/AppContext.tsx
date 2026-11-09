/**
 * RESTO-DZ Application Context & State Management
 * Provides multi-tenant workspace state, role simulation, i18n, themes, and offline sync.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Tenant,
  Branch,
  User,
  UserRole,
  Category,
  Product,
  InventoryItem,
  RestaurantTable,
  Order,
  CashRegisterSession,
  WorkerPocket,
  Language,
  ThemeMode,
  SubscriptionPlan,
  AuditLogEntry,
  PlatformAnnouncement,
} from '../core/types';
import {
  initialSubscriptionPlans,
  initialTenants,
  initialBranches,
  initialUsers,
  initialCategories,
  initialProducts,
  initialInventoryItems,
  initialTables,
  initialOrders,
  initialCashSession,
  initialWorkerPockets,
  initialAuditLogs,
  initialAnnouncements,
} from '../core/seedData';
import { getTranslation } from '../core/i18n';

interface AppContextType {
  // Navigation & Platform Mode
  isSuperAdminMode: boolean;
  setIsSuperAdminMode: (val: boolean) => void;
  activeTenantId: string;
  setActiveTenantId: (id: string) => void;
  activeBranchId: string;
  setActiveBranchId: (id: string) => void;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  currentUser: User;
  setCurrentUser: (user: User) => void;

  // Language & Theme
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  t: ReturnType<typeof getTranslation>;

  // Offline-first & Sync
  isOnline: boolean;
  setIsOnline: (val: boolean) => void;
  syncQueueCount: number;
  triggerManualSync: () => Promise<void>;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (val: boolean) => void;

  // Data Store
  tenants: Tenant[];
  currentTenant: Tenant;
  branches: Branch[];
  currentBranch: Branch;
  users: User[];
  plans: SubscriptionPlan[];
  categories: Category[];
  products: Product[];
  inventoryItems: InventoryItem[];
  tables: RestaurantTable[];
  orders: Order[];
  cashSessions: CashRegisterSession[];
  activeCashSession?: CashRegisterSession;
  workerPockets: WorkerPocket[];
  auditLogs: AuditLogEntry[];
  announcements: PlatformAnnouncement[];

  // Mutations
  createNewOrder: (order: Partial<Order>) => Promise<Order>;
  updateOrderStatus: (orderId: string, status?: Order['status'], kitchenStatus?: 'pending'|'preparing'|'ready', station?: string) => Promise<void>;
  updateTableStatus: (tableId: string, status: RestaurantTable['status'], currentOrderId?: string) => Promise<void>;
  openCashSession: (openingCash: number, registerName?: string) => Promise<void>;
  closeCashSession: (actualCountedCash: number, notes?: string) => Promise<void>;
  recordCashExpense: (amount: number, category: string, description: string) => Promise<void>;
  recordWorkerTransaction: (userId: string, type: string, amount: number, notes: string) => Promise<void>;
  adjustStockQuantity: (inventoryItemId: string, type: 'purchase_add'|'waste'|'count_adjustment', quantity: number, reason: string) => Promise<void>;
  registerNewTenant: (tenantData: any) => Promise<Tenant>;
  updateTenantStatus: (tenantId: string, updates: Partial<Tenant>) => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSuperAdminMode, setIsSuperAdminMode] = useState<boolean>(false);
  const [activeTenantId, setActiveTenantId] = useState<string>('tenant_bahdja');
  const [activeBranchId, setActiveBranchId] = useState<string>('branch_bahdja_didouche');
  const [currentRole, setCurrentRole] = useState<UserRole>('owner');
  const [language, setLanguage] = useState<Language>('fr');
  const [theme, setTheme] = useState<ThemeMode>('dark');
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [syncQueueCount, setSyncQueueCount] = useState<number>(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Core Data
  const [tenants, setTenants] = useState<Tenant[]>(initialTenants);
  const [branches, setBranches] = useState<Branch[]>(initialBranches);
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [plans, setPlans] = useState<SubscriptionPlan[]>(initialSubscriptionPlans);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>(initialInventoryItems);
  const [tables, setTables] = useState<RestaurantTable[]>(initialTables);
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [cashSessions, setCashSessions] = useState<CashRegisterSession[]>([initialCashSession]);
  const [workerPockets, setWorkerPockets] = useState<WorkerPocket[]>(initialWorkerPockets);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(initialAuditLogs);
  const [announcements, setAnnouncements] = useState<PlatformAnnouncement[]>(initialAnnouncements);

  // Active user representation
  const currentUser = users.find(u => u.role === currentRole && (currentRole === 'super_admin' || u.tenantId === activeTenantId)) || users[1];

  // Current tenant and branch
  const currentTenant = tenants.find(t => t.id === activeTenantId) || tenants[0];
  const currentBranch = branches.find(b => b.id === activeBranchId && b.tenantId === activeTenantId) || branches.find(b => b.tenantId === activeTenantId) || branches[0];
  const activeCashSession = cashSessions.find(s => s.tenantId === activeTenantId && s.status === 'open');

  // Translation helper
  const t = getTranslation(language);

  // Update HTML and body direction when language changes (RTL for Arabic, LTR for French)
  useEffect(() => {
    const dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.dir = dir;
    document.documentElement.lang = language;
    document.body.dir = dir;
    document.body.setAttribute('dir', dir);
  }, [language]);

  // Update body theme class
  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
  }, [theme]);

  // Fetch initial data from server or seed fallback
  useEffect(() => {
    async function fetchPlatformData() {
      try {
        const res = await fetch('/api/platform/tenants');
        if (res.ok) {
          const remoteTenants = await res.json();
          if (Array.isArray(remoteTenants) && remoteTenants.length > 0) {
            setTenants(remoteTenants);
          }
        }
      } catch (e) {
        console.warn('Backend running in local fallback mode', e);
      }
    }
    fetchPlatformData();
  }, []);

  // Fetch tenant-isolated data whenever activeTenantId changes
  useEffect(() => {
    async function fetchTenantData() {
      if (isSuperAdminMode) return;
      try {
        const res = await fetch(`/api/tenants/${activeTenantId}/data`);
        if (res.ok) {
          const data = await res.json();
          if (data.branches) setBranches(data.branches);
          if (data.categories) setCategories(data.categories);
          if (data.products) setProducts(data.products);
          if (data.inventoryItems) setInventoryItems(data.inventoryItems);
          if (data.tables) setTables(data.tables);
          if (data.orders) setOrders(data.orders);
          if (data.cashSessions) setCashSessions(data.cashSessions);
          if (data.workerPockets) setWorkerPockets(data.workerPockets);
          if (data.auditLogs) setAuditLogs(data.auditLogs);
          if (data.branches && data.branches.length > 0) {
            setActiveBranchId(data.branches[0].id);
          }
        }
      } catch (e) {
        console.warn('Using local tenant store');
      }
    }
    fetchTenantData();
  }, [activeTenantId, isSuperAdminMode]);

  // Offline sync trigger
  const triggerManualSync = async () => {
    if (syncQueueCount === 0) return;
    try {
      await fetch(`/api/tenants/${activeTenantId}/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actions: [] }),
      });
      setSyncQueueCount(0);
    } catch (e) {
      console.error('Failed to sync offline queue', e);
    }
  };

  // Create new order
  const createNewOrder = async (orderPayload: Partial<Order>): Promise<Order> => {
    const newOrder: Order = {
      id: `ord_${Date.now()}`,
      orderNumber: `#DZ-${1040 + orders.length + 1}`,
      tenantId: activeTenantId,
      branchId: activeBranchId,
      type: orderPayload.type || 'dine_in',
      tableId: orderPayload.tableId,
      tableName: orderPayload.tableName,
      areaName: orderPayload.areaName,
      customerName: orderPayload.customerName,
      customerPhone: orderPayload.customerPhone,
      deliveryAddress: orderPayload.deliveryAddress,
      deliveryFee: orderPayload.deliveryFee || 0,
      status: 'preparing',
      items: orderPayload.items || [],
      subtotal: orderPayload.subtotal || 0,
      discountAmount: orderPayload.discountAmount || 0,
      taxAmount: orderPayload.taxAmount || 0,
      total: orderPayload.total || 0,
      paymentStatus: orderPayload.paymentStatus || 'unpaid',
      payments: orderPayload.payments || [],
      createdAt: new Date().toISOString(),
      cashierId: currentUser.id,
      cashierName: currentUser.name,
      notes: orderPayload.notes,
    };

    // Optimistic local state update
    setOrders(prev => [newOrder, ...prev]);

    // If dine-in, mark table occupied
    if (newOrder.type === 'dine_in' && newOrder.tableId) {
      setTables(prev =>
        prev.map(t => (t.id === newOrder.tableId ? { ...t, status: 'occupied', currentOrderId: newOrder.id } : t))
      );
    }

    // Try posting to backend
    if (isOnline) {
      try {
        await fetch(`/api/tenants/${activeTenantId}/orders`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newOrder),
        });
      } catch (e) {
        setSyncQueueCount(q => q + 1);
      }
    } else {
      setSyncQueueCount(q => q + 1);
    }

    return newOrder;
  };

  // Update Order Status
  const updateOrderStatus = async (
    orderId: string,
    status?: Order['status'],
    kitchenStatus?: 'pending' | 'preparing' | 'ready',
    station?: string
  ) => {
    setOrders(prev =>
      prev.map(order => {
        if (order.id !== orderId) return order;
        const updated = { ...order };
        if (status) updated.status = status;
        if (kitchenStatus && station) {
          updated.items = order.items.map(item => {
            if (station === 'expo' || item.station === station) {
              return { ...item, kitchenStatus };
            }
            return item;
          });
          if (updated.items.every(i => i.kitchenStatus === 'ready') && updated.status === 'preparing') {
            updated.status = 'ready';
          }
        }
        return updated;
      })
    );

    // Free table if order completed
    if (status === 'completed') {
      const order = orders.find(o => o.id === orderId);
      if (order && order.tableId) {
        setTables(prev =>
          prev.map(t => (t.id === order.tableId ? { ...t, status: 'available', currentOrderId: undefined } : t))
        );
      }
    }

    if (isOnline) {
      try {
        await fetch(`/api/tenants/${activeTenantId}/orders/${orderId}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status, kitchenStatus, station }),
        });
      } catch (e) {
        setSyncQueueCount(q => q + 1);
      }
    } else {
      setSyncQueueCount(q => q + 1);
    }
  };

  // Update Table Status
  const updateTableStatus = async (tableId: string, status: RestaurantTable['status'], currentOrderId?: string) => {
    setTables(prev =>
      prev.map(t => (t.id === tableId ? { ...t, status, currentOrderId: currentOrderId ?? t.currentOrderId } : t))
    );
    if (isOnline) {
      try {
        await fetch(`/api/tenants/${activeTenantId}/tables/${tableId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status, currentOrderId }),
        });
      } catch (e) {
        setSyncQueueCount(q => q + 1);
      }
    }
  };

  // Cash Register: Open Session
  const openCashSession = async (openingCash: number, registerName?: string) => {
    const newSession: CashRegisterSession = {
      id: `session_${Date.now()}`,
      tenantId: activeTenantId,
      branchId: activeBranchId,
      registerName: registerName || 'Caisse Principale',
      cashierId: currentUser.id,
      cashierName: currentUser.name,
      status: 'open',
      openedAt: new Date().toISOString(),
      openingCash,
      cashSales: 0,
      cardSales: 0,
      cashDeposits: 0,
      cashWithdrawals: 0,
      refundsCount: 0,
      refundsAmount: 0,
      expectedCashInDrawer: openingCash,
    };

    setCashSessions(prev => [newSession, ...prev]);

    if (isOnline) {
      try {
        await fetch(`/api/tenants/${activeTenantId}/cash-register/session`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'open',
            openingCash,
            registerName,
            cashierId: currentUser.id,
            cashierName: currentUser.name,
            branchId: activeBranchId,
          }),
        });
      } catch (e) {
        setSyncQueueCount(q => q + 1);
      }
    }
  };

  // Cash Register: Close Session
  const closeCashSession = async (actualCountedCash: number, notes?: string) => {
    if (!activeCashSession) return;
    const discrepancy = actualCountedCash - activeCashSession.expectedCashInDrawer;

    setCashSessions(prev =>
      prev.map(s =>
        s.id === activeCashSession.id
          ? {
              ...s,
              status: 'closed',
              closedAt: new Date().toISOString(),
              actualCountedCash,
              discrepancy,
              closingNotes: notes,
            }
          : s
      )
    );

    if (isOnline) {
      try {
        await fetch(`/api/tenants/${activeTenantId}/cash-register/session`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'close', actualCountedCash, closingNotes: notes }),
        });
      } catch (e) {
        setSyncQueueCount(q => q + 1);
      }
    }
  };

  // Cash Register: Expense
  const recordCashExpense = async (amount: number, category: string, description: string) => {
    if (!activeCashSession) return;

    setCashSessions(prev =>
      prev.map(s =>
        s.id === activeCashSession.id
          ? {
              ...s,
              cashWithdrawals: s.cashWithdrawals + amount,
              expectedCashInDrawer: s.expectedCashInDrawer - amount,
            }
          : s
      )
    );

    if (isOnline) {
      try {
        await fetch(`/api/tenants/${activeTenantId}/cash-register/session`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'expense',
            expense: { amount, category, description, recordedBy: currentUser.name },
          }),
        });
      } catch (e) {
        setSyncQueueCount(q => q + 1);
      }
    }
  };

  // Worker Pocket Transaction
  const recordWorkerTransaction = async (userId: string, type: string, amount: number, notes: string) => {
    setWorkerPockets(prev =>
      prev.map(pocket => {
        if (pocket.userId !== userId) return pocket;
        const tx = {
          id: `tx_${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          type: type as any,
          amount,
          notes,
          recordedBy: currentUser.name,
          receiptNumber: `WP-${Date.now().toString().slice(-6)}`,
        };

        const updated = { ...pocket, transactions: [tx, ...pocket.transactions] };
        if (type === 'advance') {
          updated.advancesTaken += amount;
          updated.remainingSalary = Math.max(0, updated.remainingSalary - amount);
        } else if (type === 'overtime_payout' || type === 'bonus') {
          updated.overtimeTotal += amount;
          updated.remainingSalary += amount;
        } else if (type === 'salary_payment') {
          updated.salaryReceived += amount;
          updated.remainingSalary = Math.max(0, updated.remainingSalary - amount);
        }
        return updated;
      })
    );

    if (isOnline) {
      try {
        await fetch(`/api/tenants/${activeTenantId}/workers/pocket/transaction`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, type, amount, notes, recordedBy: currentUser.name }),
        });
      } catch (e) {
        setSyncQueueCount(q => q + 1);
      }
    }
  };

  // Adjust stock quantity
  const adjustStockQuantity = async (
    inventoryItemId: string,
    type: 'purchase_add' | 'waste' | 'count_adjustment',
    quantity: number,
    reason: string
  ) => {
    setInventoryItems(prev =>
      prev.map(item => {
        if (item.id !== inventoryItemId) return item;
        let newStock = item.currentStock;
        if (type === 'purchase_add' || type === 'count_adjustment') {
          newStock = Math.round((newStock + quantity) * 100) / 100;
        } else {
          newStock = Math.max(0, Math.round((newStock - quantity) * 100) / 100);
        }
        return { ...item, currentStock: newStock };
      })
    );

    if (isOnline) {
      try {
        await fetch(`/api/tenants/${activeTenantId}/inventory/movement`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            inventoryItemId,
            type,
            quantity,
            reason,
            recordedBy: currentUser.name,
          }),
        });
      } catch (e) {
        setSyncQueueCount(q => q + 1);
      }
    }
  };

  // Register New Tenant (via Onboarding Wizard)
  const registerNewTenant = async (tenantData: any): Promise<Tenant> => {
    const newTenant: Tenant = {
      id: `tenant_${Date.now()}`,
      name: tenantData.name,
      businessType: tenantData.businessType || 'burger_restaurant',
      phone: tenantData.phone,
      email: tenantData.email,
      address: tenantData.address,
      city: tenantData.city || 'Alger',
      country: 'Algérie',
      planId: tenantData.planId || 'plan_pro',
      subscriptionStatus: 'trial',
      trialEndsAt: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      subscriptionExpiresAt: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      branchesCount: 1,
      createdAt: new Date().toISOString().split('T')[0],
      status: 'active',
      settings: {
        services: tenantData.services || {
          dineIn: true,
          takeaway: true,
          delivery: true,
          reservations: true,
          kitchenStations: true,
          tableManagement: true,
        },
        branding: {
          primaryColor: tenantData.primaryColor || '#E53935',
          secondaryColor: '#FF3B30',
          receiptHeader: `${tenantData.name.toUpperCase()}\n${tenantData.city || 'Alger'}\nTél: ${tenantData.phone}`,
          receiptFooter: 'Merci pour votre visite ! Saha ftourkoum !',
          showLogoOnReceipt: true,
          paperWidth: tenantData.paperWidth || '80mm',
        },
        taxRatePercent: 9,
        enableTax: true,
        currency: 'DA',
        timezone: 'Africa/Algiers',
        defaultLanguage: tenantData.defaultLanguage || 'fr',
      },
    };

    setTenants(prev => [newTenant, ...prev]);
    setActiveTenantId(newTenant.id);
    setIsSuperAdminMode(false);

    if (isOnline) {
      try {
        await fetch('/api/platform/tenants', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newTenant),
        });
      } catch (e) {
        console.warn('Tenant stored locally');
      }
    }

    return newTenant;
  };

  // Update tenant status
  const updateTenantStatus = async (tenantId: string, updates: Partial<Tenant>) => {
    setTenants(prev => prev.map(t => (t.id === tenantId ? { ...t, ...updates } : t)));
    if (isOnline) {
      try {
        await fetch(`/api/platform/tenants/${tenantId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        });
      } catch (e) {
        console.warn('Update failed on remote');
      }
    }
  };

  return (
    <AppContext.Provider
      value={{
        isSuperAdminMode,
        setIsSuperAdminMode,
        activeTenantId,
        setActiveTenantId,
        activeBranchId,
        setActiveBranchId,
        currentRole,
        setCurrentRole,
        currentUser,
        setCurrentUser: () => {},
        language,
        setLanguage,
        theme,
        setTheme,
        t,
        isOnline,
        setIsOnline,
        syncQueueCount,
        triggerManualSync,
        isMobileMenuOpen,
        setIsMobileMenuOpen,
        tenants,
        currentTenant,
        branches,
        currentBranch,
        users,
        plans,
        categories,
        products,
        inventoryItems,
        tables,
        orders,
        cashSessions,
        activeCashSession,
        workerPockets,
        auditLogs,
        announcements,
        createNewOrder,
        updateOrderStatus,
        updateTableStatus,
        openCashSession,
        closeCashSession,
        recordCashExpense,
        recordWorkerTransaction,
        adjustStockQuantity,
        registerNewTenant,
        updateTenantStatus,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
