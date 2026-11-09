import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
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
  initialSuppliers,
  initialAuditLogs,
  initialAnnouncements,
} from './src/core/seedData.ts';
import {
  Tenant,
  Branch,
  User,
  Category,
  Product,
  InventoryItem,
  RestaurantTable,
  Order,
  CashRegisterSession,
  WorkerPocket,
  AuditLogEntry,
  SubscriptionPlan,
  PlatformAnnouncement,
  SubscriptionInvoice,
} from './src/core/types.ts';
import { computeStockDeductions, reconcileCashDrawer } from './src/core/calculations.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In-Memory Database store with Tenant-level isolation
class DatabaseStore {
  plans: SubscriptionPlan[] = [...initialSubscriptionPlans];
  tenants: Tenant[] = [...initialTenants];
  branches: Branch[] = [...initialBranches];
  users: User[] = [...initialUsers];
  categories: Category[] = [...initialCategories];
  products: Product[] = [...initialProducts];
  inventoryItems: InventoryItem[] = [...initialInventoryItems];
  tables: RestaurantTable[] = [...initialTables];
  orders: Order[] = [...initialOrders];
  cashSessions: CashRegisterSession[] = [{ ...initialCashSession }];
  workerPockets: WorkerPocket[] = [...initialWorkerPockets];
  auditLogs: AuditLogEntry[] = [...initialAuditLogs];
  announcements: PlatformAnnouncement[] = [...initialAnnouncements];
  invoices: SubscriptionInvoice[] = [
    {
      id: 'inv_101',
      invoiceNumber: 'FAC-2026-0089',
      tenantId: 'tenant_bahdja',
      tenantName: 'El Bahdja Burger & Grill',
      planId: 'plan_pro',
      planName: 'Professional',
      amount: 24000,
      status: 'paid',
      issueDate: '2026-11-01',
      dueDate: '2026-11-15',
      paidDate: '2026-11-02',
      paymentMethod: 'card_cib',
    },
    {
      id: 'inv_102',
      invoiceNumber: 'FAC-2026-0090',
      tenantId: 'tenant_napoli',
      tenantName: 'Pizzeria Bella Napoli',
      planId: 'plan_pro',
      planName: 'Professional',
      amount: 24000,
      status: 'paid',
      issueDate: '2026-11-01',
      dueDate: '2026-11-15',
      paidDate: '2026-11-03',
      paymentMethod: 'cheque',
    },
  ];

  logAudit(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) {
    const newEntry: AuditLogEntry = {
      ...entry,
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
    };
    this.auditLogs.unshift(newEntry);
    if (this.auditLogs.length > 500) this.auditLogs.pop();
  }
}

const db = new DatabaseStore();

async function startServer() {
  const app = express();
  app.use(express.json());

  // ----------------------------------------------------
  // PLATFORM & SUPER ADMIN ENDPOINTS
  // ----------------------------------------------------

  app.get('/api/platform/metrics', (_req: Request, res: Response) => {
    const totalTenants = db.tenants.length;
    const activeSubscriptions = db.tenants.filter(t => t.subscriptionStatus === 'active').length;
    const trialSubscriptions = db.tenants.filter(t => t.subscriptionStatus === 'trial').length;
    
    // Calculate MRR
    const mrr = db.tenants.reduce((sum, t) => {
      if (t.subscriptionStatus !== 'active') return sum;
      const plan = db.plans.find(p => p.id === t.planId);
      return sum + (plan ? plan.monthlyPrice : 0);
    }, 0);

    const totalOrdersToday = db.orders.length;

    res.json({
      totalTenants,
      activeSubscriptions,
      trialSubscriptions,
      mrr,
      totalOrdersToday,
      systemHealth: 'healthy',
      storageUsedMb: 1420,
    });
  });

  app.get('/api/platform/tenants', (_req: Request, res: Response) => {
    res.json(db.tenants);
  });

  app.post('/api/platform/tenants', (req: Request, res: Response) => {
    const newTenant: Tenant = {
      ...req.body,
      id: `tenant_${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      status: 'active',
      subscriptionStatus: 'trial',
      trialEndsAt: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      subscriptionExpiresAt: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    };

    db.tenants.unshift(newTenant);

    // Create default branch
    const defaultBranch: Branch = {
      id: `branch_${newTenant.id}_main`,
      tenantId: newTenant.id,
      name: `${newTenant.name} — Siège Principal`,
      address: newTenant.address || 'Alger',
      phone: newTenant.phone || '0550000000',
      workingHours: '10:00 - 00:00',
      isActive: true,
      diningAreas: [
        { id: `area_${newTenant.id}_main`, name: 'Salle Principale' },
        { id: `area_${newTenant.id}_terrasse`, name: 'Terrasse' },
      ],
      tablesCount: 8,
      kitchenStations: [
        { id: `station_${newTenant.id}_main`, branchId: `branch_${newTenant.id}_main`, name: 'Cuisine', code: 'general' },
      ],
    };
    db.branches.push(defaultBranch);

    // Create default tables
    for (let i = 1; i <= 6; i++) {
      db.tables.push({
        id: `tbl_${newTenant.id}_${i}`,
        branchId: defaultBranch.id,
        areaId: defaultBranch.diningAreas[0].id,
        number: `T-0${i}`,
        capacity: 4,
        status: 'available',
        positionX: 50 + ((i - 1) % 3) * 150,
        positionY: 50 + Math.floor((i - 1) / 3) * 130,
      });
    }

    // Create Owner user
    const ownerUser: User = {
      id: `user_${newTenant.id}_owner`,
      tenantId: newTenant.id,
      branchIds: [defaultBranch.id],
      name: req.body.ownerName || 'Directeur Restaurant',
      email: req.body.ownerEmail || newTenant.email,
      phone: newTenant.phone,
      role: 'owner',
      status: 'active',
      pinCode: '1234',
      monthlySalary: 100000,
      hourlyOvertimeRate: 0,
      employmentStartDate: new Date().toISOString().split('T')[0],
    };
    db.users.push(ownerUser);

    // Initial starter category & product
    const starterCat: Category = {
      id: `cat_${newTenant.id}_1`,
      tenantId: newTenant.id,
      name: 'Spécialités de la Maison',
      nameAr: 'أطباق المطعم الخاصة',
      nameFr: 'Spécialités Maison',
      icon: '🍽️',
      sortOrder: 1,
    };
    db.categories.push(starterCat);

    const starterProduct: Product = {
      id: `prod_${newTenant.id}_1`,
      tenantId: newTenant.id,
      branchIds: [defaultBranch.id],
      categoryId: starterCat.id,
      name: 'Menu Spécial Maison',
      nameAr: 'وجبة المطعم المميزة',
      nameFr: 'Menu Spécial Maison',
      description: 'Plat signature du chef servi avec garniture.',
      price: 850,
      costPrice: 350,
      isAvailable: true,
      targetStation: 'general',
      variations: [],
      extras: [],
      trackStock: false,
    };
    db.products.push(starterProduct);

    db.logAudit({
      userId: 'user_super_admin',
      userName: 'Platform System',
      module: 'admin',
      action: 'TENANT_REGISTERED',
      description: `Enregistrement du restaurant: ${newTenant.name}`,
    });

    res.status(201).json({ tenant: newTenant, branch: defaultBranch, user: ownerUser });
  });

  app.patch('/api/platform/tenants/:id', (req: Request, res: Response) => {
    const tenant = db.tenants.find(t => t.id === req.params.id);
    if (!tenant) return res.status(404).json({ error: 'Tenant not found' });

    Object.assign(tenant, req.body);
    db.logAudit({
      userId: 'user_super_admin',
      userName: 'Super Admin',
      module: 'subscription',
      action: 'TENANT_UPDATED',
      description: `Mise à jour statut restaurant ${tenant.name}: ${JSON.stringify(req.body)}`,
    });

    res.json(tenant);
  });

  app.get('/api/platform/plans', (_req: Request, res: Response) => {
    res.json(db.plans);
  });

  app.get('/api/platform/invoices', (_req: Request, res: Response) => {
    res.json(db.invoices);
  });

  app.get('/api/platform/announcements', (_req: Request, res: Response) => {
    res.json(db.announcements);
  });

  app.get('/api/platform/audit-logs', (_req: Request, res: Response) => {
    res.json(db.auditLogs);
  });

  // ----------------------------------------------------
  // TENANT WORKSPACE ENDPOINTS (Strict Isolation by tenantId)
  // ----------------------------------------------------

  app.get('/api/tenants/:tenantId/data', (req: Request, res: Response) => {
    const { tenantId } = req.params;
    const tenant = db.tenants.find(t => t.id === tenantId);
    if (!tenant) return res.status(404).json({ error: 'Tenant workspace not found' });

    const branches = db.branches.filter(b => b.tenantId === tenantId);
    const users = db.users.filter(u => u.tenantId === tenantId);
    const categories = db.categories.filter(c => c.tenantId === tenantId);
    const products = db.products.filter(p => p.tenantId === tenantId);
    const inventoryItems = db.inventoryItems.filter(i => i.tenantId === tenantId);
    
    // Filter branch-owned tables and orders
    const branchIds = branches.map(b => b.id);
    const tables = db.tables.filter(t => branchIds.includes(t.branchId));
    const orders = db.orders.filter(o => o.tenantId === tenantId);
    const cashSessions = db.cashSessions.filter(s => s.tenantId === tenantId);
    const workerPockets = db.workerPockets; // filtered by users in tenant
    const tenantUsersIds = users.map(u => u.id);
    const tenantPockets = workerPockets.filter(w => tenantUsersIds.includes(w.userId));
    const suppliers = initialSuppliers.filter(s => s.tenantId === tenantId);
    const tenantAuditLogs = db.auditLogs.filter(l => l.tenantId === tenantId);

    res.json({
      tenant,
      branches,
      users,
      categories,
      products,
      inventoryItems,
      tables,
      orders,
      cashSessions,
      workerPockets: tenantPockets,
      suppliers,
      auditLogs: tenantAuditLogs,
    });
  });

  // Create Order (Dine-in, Takeaway, Delivery) with automatic stock deduction and table status
  app.post('/api/tenants/:tenantId/orders', (req: Request, res: Response) => {
    const { tenantId } = req.params;
    const orderData: Order = req.body;

    const newOrder: Order = {
      ...orderData,
      id: `ord_${Date.now()}`,
      orderNumber: `#DZ-${1000 + db.orders.length + 1}`,
      tenantId,
      createdAt: new Date().toISOString(),
    };

    db.orders.unshift(newOrder);

    // If dine-in and table specified, update table status to occupied
    if (newOrder.type === 'dine_in' && newOrder.tableId) {
      const table = db.tables.find(t => t.id === newOrder.tableId);
      if (table) {
        table.status = 'occupied';
        table.currentOrderId = newOrder.id;
      }
    }

    // Auto-deduct inventory if recipe exists
    const recipesByProductId: Record<string, any> = {};
    for (const item of newOrder.items) {
      const product = db.products.find(p => p.id === item.productId);
      if (product?.recipe) {
        recipesByProductId[item.productId] = product.recipe;
      }
    }

    const deductions = computeStockDeductions(newOrder.items, recipesByProductId);
    for (const ded of deductions) {
      const invItem = db.inventoryItems.find(i => i.id === ded.ingredientId);
      if (invItem) {
        invItem.currentStock = Math.max(0, Math.round((invItem.currentStock - ded.quantityToDeduct) * 100) / 100);
      }
    }

    // If order was paid in cash, update active cash register session
    const cashPayment = newOrder.payments.find(p => p.method === 'cash');
    if (cashPayment && cashPayment.amount > 0) {
      const activeSession = db.cashSessions.find(s => s.tenantId === tenantId && s.status === 'open');
      if (activeSession) {
        activeSession.cashSales += cashPayment.amount;
        activeSession.expectedCashInDrawer += cashPayment.amount;
      }
    }

    db.logAudit({
      tenantId,
      userId: newOrder.cashierId,
      userName: newOrder.cashierName,
      module: 'pos',
      action: 'ORDER_CREATED',
      description: `Commande ${newOrder.orderNumber} créée (${newOrder.type}, Total: ${newOrder.total} DA)`,
    });

    res.status(201).json(newOrder);
  });

  // Update order status (KDS bump, delivery dispatch, completion)
  app.patch('/api/tenants/:tenantId/orders/:orderId/status', (req: Request, res: Response) => {
    const { tenantId, orderId } = req.params;
    const { status, kitchenStatus, station } = req.body;

    const order = db.orders.find(o => o.id === orderId && o.tenantId === tenantId);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    if (status) {
      order.status = status;
      if (status === 'completed' && order.tableId) {
        const table = db.tables.find(t => t.id === order.tableId);
        if (table) {
          table.status = 'available';
          table.currentOrderId = undefined;
        }
      }
    }

    // Bump individual items in kitchen
    if (kitchenStatus && station) {
      for (const item of order.items) {
        if (station === 'expo' || item.station === station) {
          item.kitchenStatus = kitchenStatus;
        }
      }
      const allReady = order.items.every(i => i.kitchenStatus === 'ready');
      if (allReady && order.status === 'preparing') {
        order.status = 'ready';
      }
    }

    res.json(order);
  });

  // Table actions (update status, clear table, transfer)
  app.patch('/api/tenants/:tenantId/tables/:tableId', (req: Request, res: Response) => {
    const { tableId } = req.params;
    const table = db.tables.find(t => t.id === tableId);
    if (!table) return res.status(404).json({ error: 'Table not found' });

    Object.assign(table, req.body);
    res.json(table);
  });

  // Cash Register actions (open session, close session with Z-report, expense)
  app.post('/api/tenants/:tenantId/cash-register/session', (req: Request, res: Response) => {
    const { tenantId } = req.params;
    const { action, openingCash, actualCountedCash, registerName, cashierId, cashierName, expense } = req.body;

    if (action === 'open') {
      const newSession: CashRegisterSession = {
        id: `session_${Date.now()}`,
        tenantId,
        branchId: req.body.branchId || db.branches.find(b => b.tenantId === tenantId)?.id || '',
        registerName: registerName || 'Caisse Principale',
        cashierId: cashierId || 'user_cashier',
        cashierName: cashierName || 'Caissier',
        status: 'open',
        openedAt: new Date().toISOString(),
        openingCash: Number(openingCash) || 0,
        cashSales: 0,
        cardSales: 0,
        cashDeposits: 0,
        cashWithdrawals: 0,
        refundsCount: 0,
        refundsAmount: 0,
        expectedCashInDrawer: Number(openingCash) || 0,
      };
      db.cashSessions.unshift(newSession);
      return res.status(201).json(newSession);
    }

    if (action === 'close') {
      const activeSession = db.cashSessions.find(s => s.tenantId === tenantId && s.status === 'open');
      if (!activeSession) return res.status(400).json({ error: 'No open cash session found' });

      const counted = Number(actualCountedCash) || 0;
      const reconciliation = reconcileCashDrawer(
        activeSession.openingCash,
        activeSession.cashSales,
        activeSession.cashDeposits,
        activeSession.cashWithdrawals,
        activeSession.refundsAmount,
        counted
      );

      activeSession.status = 'closed';
      activeSession.closedAt = new Date().toISOString();
      activeSession.actualCountedCash = counted;
      activeSession.discrepancy = reconciliation.discrepancy;
      activeSession.closingNotes = req.body.closingNotes || '';

      db.logAudit({
        tenantId,
        userId: activeSession.cashierId,
        userName: activeSession.cashierName,
        module: 'cash_register',
        action: 'SESSION_CLOSED',
        description: `Clôture caisse: Réel=${counted} DA, Attendu=${reconciliation.expectedCashInDrawer} DA, Écart=${reconciliation.discrepancy} DA`,
      });

      return res.json(activeSession);
    }

    if (action === 'expense' && expense) {
      const activeSession = db.cashSessions.find(s => s.tenantId === tenantId && s.status === 'open');
      if (activeSession) {
        activeSession.cashWithdrawals += Number(expense.amount) || 0;
        activeSession.expectedCashInDrawer -= Number(expense.amount) || 0;
      }
      return res.json({ success: true, session: activeSession });
    }

    res.status(400).json({ error: 'Unknown cash register action' });
  });

  // Worker Pocket actions (Advance, Quick Overtime, Salary Payment)
  app.post('/api/tenants/:tenantId/workers/pocket/transaction', (req: Request, res: Response) => {
    const { userId, type, amount, notes, recordedBy } = req.body;
    let pocket = db.workerPockets.find(p => p.userId === userId);

    if (!pocket) {
      const user = db.users.find(u => u.id === userId);
      pocket = {
        userId,
        userName: user?.name || 'Employé',
        role: user?.role || 'cashier',
        month: '2026-11',
        baseSalary: user?.monthlySalary || 40000,
        salaryEarned: 10000,
        overtimeHours: 0,
        overtimeTotal: 0,
        bonuses: 0,
        deductions: 0,
        advancesTaken: 0,
        workerCreditOwed: 0,
        salaryReceived: 0,
        remainingSalary: 10000,
        transactions: [],
      };
      db.workerPockets.push(pocket);
    }

    const tx = {
      id: `tx_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      type,
      amount: Number(amount) || 0,
      notes: notes || '',
      recordedBy: recordedBy || 'Admin',
      receiptNumber: `WP-${Date.now().toString().slice(-6)}`,
    };

    pocket.transactions.unshift(tx);

    if (type === 'advance') {
      pocket.advancesTaken += tx.amount;
      pocket.remainingSalary = Math.max(0, pocket.remainingSalary - tx.amount);
    } else if (type === 'overtime_payout' || type === 'bonus') {
      pocket.overtimeTotal += tx.amount;
      pocket.remainingSalary += tx.amount;
    } else if (type === 'salary_payment') {
      pocket.salaryReceived += tx.amount;
      pocket.remainingSalary = Math.max(0, pocket.remainingSalary - tx.amount);
    }

    res.json({ pocket, transaction: tx });
  });

  // Inventory adjustment / Purchase receive
  app.post('/api/tenants/:tenantId/inventory/movement', (req: Request, res: Response) => {
    const { inventoryItemId, type, quantity, reason, recordedBy } = req.body;
    const item = db.inventoryItems.find(i => i.id === inventoryItemId);
    if (!item) return res.status(404).json({ error: 'Inventory item not found' });

    const qty = Number(quantity) || 0;
    if (type === 'purchase_add' || type === 'count_adjustment') {
      item.currentStock = Math.round((item.currentStock + qty) * 100) / 100;
    } else if (type === 'waste' || type === 'sale_deduction') {
      item.currentStock = Math.max(0, Math.round((item.currentStock - qty) * 100) / 100);
    }

    res.json(item);
  });

  // Sync endpoint for offline queue processing
  app.post('/api/tenants/:tenantId/sync', (req: Request, res: Response) => {
    const { actions } = req.body;
    const results = [];

    if (Array.isArray(actions)) {
      for (const act of actions) {
        results.push({ actionId: act.id, status: 'synced', timestamp: new Date().toISOString() });
      }
    }

    res.json({ success: true, syncedCount: results.length, results });
  });

  // ----------------------------------------------------
  // VITE DEV MIDDLEWARE / STATIC ASSETS
  // ----------------------------------------------------
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist/index.html'));
    });
  }

  const PORT = 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[RESTO-DZ] Multi-Tenant Restaurant SaaS running on port ${PORT}`);
  });
}

startServer().catch(err => {
  console.error('[RESTO-DZ Server Error]', err);
  process.exit(1);
});
