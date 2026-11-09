/**
 * RESTO-DZ Multi-Tenant Restaurant SaaS Platform
 * Core Data Models & Type Definitions
 */

export type Language = 'ar' | 'fr' | 'en';
export type ThemeMode = 'dark' | 'light';

// ==========================================
// 1. PLATFORM & SUPER ADMIN
// ==========================================

export type SubscriptionStatus = 'trial' | 'active' | 'past_due' | 'suspended' | 'cancelled' | 'expired';

export interface SubscriptionPlan {
  id: string;
  name: string;
  nameAr?: string;
  nameFr?: string;
  description: string;
  monthlyPrice: number; // in DZD (DA)
  annualPrice: number;
  trialDays: number;
  maxBranches: number;
  maxStaff: number;
  maxDevices: number;
  storageMb: number;
  features: string[];
  isPopular?: boolean;
}

export interface SubscriptionInvoice {
  id: string;
  invoiceNumber: string;
  tenantId: string;
  tenantName: string;
  planId: string;
  planName: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue' | 'cancelled';
  issueDate: string;
  dueDate: string;
  paidDate?: string;
  paymentMethod?: 'manual_transfer' | 'cheque' | 'cash' | 'card_cib' | 'edahabia';
  notes?: string;
}

export interface PlatformAnnouncement {
  id: string;
  title: string;
  content: string;
  level: 'info' | 'warning' | 'urgent';
  createdAt: string;
  active: boolean;
}

export interface PlatformMetrics {
  totalTenants: number;
  activeSubscriptions: number;
  trialSubscriptions: number;
  mrr: number; // Monthly Recurring Revenue
  totalOrdersToday: number;
  systemHealth: 'healthy' | 'degraded' | 'maintenance';
  storageUsedMb: number;
}

// ==========================================
// 2. TENANT & BRANCH
// ==========================================

export type BusinessType = 
  | 'fast_food'
  | 'traditional'
  | 'cafe'
  | 'pizzeria'
  | 'bakery'
  | 'snack_bar'
  | 'burger_restaurant'
  | 'sandwich_shop'
  | 'delivery_kitchen'
  | 'other';

export interface TenantSettings {
  services: {
    dineIn: boolean;
    takeaway: boolean;
    delivery: boolean;
    reservations: boolean;
    kitchenStations: boolean;
    tableManagement: boolean;
  };
  branding: {
    primaryColor: string;
    secondaryColor: string;
    logoUrl?: string;
    receiptHeader: string;
    receiptFooter: string;
    showLogoOnReceipt: boolean;
    paperWidth: '58mm' | '80mm';
  };
  taxRatePercent: number;
  enableTax: boolean;
  currency: string; // e.g. "DA"
  timezone: string;
  defaultLanguage: Language;
}

export interface Tenant {
  id: string;
  name: string;
  businessType: BusinessType;
  logo?: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  country: string;
  planId: string;
  subscriptionStatus: SubscriptionStatus;
  subscriptionExpiresAt: string;
  trialEndsAt?: string;
  branchesCount: number;
  settings: TenantSettings;
  createdAt: string;
  status: 'active' | 'suspended' | 'pending_approval';
}

export interface DiningArea {
  id: string;
  name: string;
}

export interface RestaurantTable {
  id: string;
  branchId: string;
  areaId: string;
  number: string;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved' | 'billing';
  currentOrderId?: string;
  assignedWaiterId?: string;
  assignedWaiterName?: string;
  positionX: number;
  positionY: number;
}

export interface KitchenStation {
  id: string;
  branchId: string;
  name: string;
  code: 'grill' | 'fryer' | 'pizza' | 'cold_prep' | 'drinks' | 'expo' | 'general';
  isExpo?: boolean;
}

export interface Branch {
  id: string;
  tenantId: string;
  name: string;
  address: string;
  phone: string;
  workingHours: string;
  isActive: boolean;
  diningAreas: DiningArea[];
  tablesCount: number;
  kitchenStations: KitchenStation[];
  defaultCashRegisterId?: string;
}

// ==========================================
// 3. USERS, ROLES & WORKER POCKET
// ==========================================

export type UserRole =
  | 'super_admin'
  | 'owner'
  | 'restaurant_admin'
  | 'general_manager'
  | 'branch_manager'
  | 'cashier'
  | 'waiter'
  | 'kitchen_worker'
  | 'delivery_worker'
  | 'stock_manager'
  | 'accountant';

export interface User {
  id: string;
  tenantId?: string; // empty for super_admin
  branchIds: string[];
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  status: 'active' | 'inactive';
  pinCode?: string; // For rapid POS & KDS terminal unlock
  monthlySalary: number; // Base salary in DA
  hourlyOvertimeRate: number; // in DA/hour
  employmentStartDate: string;
}

export interface AttendanceRecord {
  id: string;
  tenantId: string;
  branchId: string;
  userId: string;
  userName: string;
  date: string; // YYYY-MM-DD
  clockInTime: string; // HH:MM
  clockOutTime?: string; // HH:MM
  breakMinutes: number;
  overtimeMinutes: number;
  status: 'present' | 'absent' | 'late' | 'excused';
  notes?: string;
  approvedBy?: string;
}

export interface WorkerTransaction {
  id: string;
  date: string;
  type: 'advance' | 'salary_payment' | 'overtime_payout' | 'bonus' | 'deduction' | 'credit_given';
  amount: number;
  notes: string;
  recordedBy: string;
  receiptNumber?: string;
}

export interface WorkerPocket {
  userId: string;
  userName: string;
  role: UserRole;
  month: string; // YYYY-MM
  baseSalary: number;
  salaryEarned: number; // Pro-rated or scheduled earned
  overtimeHours: number;
  overtimeTotal: number;
  bonuses: number;
  deductions: number;
  advancesTaken: number; // Money already given in advance
  workerCreditOwed: number; // Loans or purchases made by worker
  salaryReceived: number; // Actual cash paid so far
  remainingSalary: number; // Still owed to employee
  transactions: WorkerTransaction[];
}

// ==========================================
// 4. CATALOG, PRODUCTS & RECIPES
// ==========================================

export interface Category {
  id: string;
  tenantId: string;
  name: string;
  nameAr?: string;
  nameFr?: string;
  icon?: string;
  sortOrder: number;
}

export interface ProductVariation {
  id: string;
  name: string; // e.g. "Small", "Regular", "Large"
  priceDelta: number;
  costDelta?: number;
}

export interface ProductExtra {
  id: string;
  name: string; // e.g. "Extra Cheese", "Double Sauce", "Fries"
  price: number;
  cost?: number;
}

export interface RecipeIngredient {
  ingredientId: string;
  name: string;
  quantity: number; // per 1 portion of product
  unit: string; // g, ml, piece, etc.
  unitCost: number;
}

export interface Recipe {
  id: string;
  tenantId: string;
  productId: string;
  ingredients: RecipeIngredient[];
  packagingCost: number;
  laborEstimateCost: number;
  totalCost: number;
}

export interface Product {
  id: string;
  tenantId: string;
  branchIds: string[];
  categoryId: string;
  name: string;
  nameAr?: string;
  nameFr?: string;
  description: string;
  price: number;
  costPrice: number;
  image?: string;
  isAvailable: boolean;
  targetStation: 'grill' | 'fryer' | 'pizza' | 'cold_prep' | 'drinks' | 'general';
  variations: ProductVariation[];
  extras: ProductExtra[];
  recipe?: Recipe;
  trackStock: boolean;
  inventoryItemId?: string;
}

// ==========================================
// 5. INVENTORY & PURCHASING
// ==========================================

export interface InventoryItem {
  id: string;
  tenantId: string;
  branchId: string;
  name: string;
  category: 'raw_meat' | 'dairy' | 'vegetables' | 'bakery' | 'beverages' | 'packaging' | 'spices_sauces' | 'other';
  currentStock: number;
  minStockAlert: number;
  unit: 'kg' | 'g' | 'l' | 'ml' | 'piece' | 'box';
  costPerUnit: number;
  supplierId?: string;
  supplierName?: string;
  expiryDate?: string;
}

export interface StockMovement {
  id: string;
  tenantId: string;
  branchId: string;
  inventoryItemId: string;
  itemName: string;
  type: 'sale_deduction' | 'purchase_add' | 'waste' | 'transfer_in' | 'transfer_out' | 'count_adjustment';
  quantity: number; // positive or negative
  balanceAfter: number;
  date: string;
  reason: string;
  referenceId?: string; // Order ID or PO ID
  recordedBy: string;
}

export interface Supplier {
  id: string;
  tenantId: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  balanceOwed: number; // in DA
  paymentTerms: string;
}

export interface PurchaseOrderItem {
  inventoryItemId: string;
  itemName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
}

export interface PurchaseOrder {
  id: string;
  orderNumber: string;
  tenantId: string;
  branchId: string;
  supplierId: string;
  supplierName: string;
  items: PurchaseOrderItem[];
  totalAmount: number;
  amountPaid: number;
  status: 'ordered' | 'received' | 'partially_received' | 'cancelled';
  createdAt: string;
  receivedAt?: string;
  invoiceNumber?: string;
}

// ==========================================
// 6. POS, ORDERS & TABLES
// ==========================================

export type OrderType = 'dine_in' | 'takeaway' | 'delivery';
export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'delivered' | 'completed' | 'cancelled';
export type PaymentMethod = 'cash' | 'card' | 'qr_wallet' | 'mixed' | 'customer_account';

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productNameAr?: string;
  productNameFr?: string;
  quantity: number;
  unitPrice: number;
  selectedVariation?: ProductVariation;
  selectedExtras: ProductExtra[];
  notes?: string;
  kitchenStatus: 'pending' | 'preparing' | 'ready';
  station: 'grill' | 'fryer' | 'pizza' | 'cold_prep' | 'drinks' | 'general';
  subtotal: number;
}

export interface OrderPayment {
  method: 'cash' | 'card' | 'qr_wallet' | 'customer_account';
  amount: number;
  tenderedCash?: number;
  changeGiven?: number;
  walletProvider?: 'baridimob' | 'wimpay' | 'generic_wallet';
  transactionRef?: string;
  qrPayload?: string;
}

export interface Order {
  id: string;
  orderNumber: string; // e.g. #DZ-1042
  tenantId: string;
  branchId: string;
  type: OrderType;
  tableId?: string;
  tableName?: string;
  areaName?: string;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  deliveryAddress?: string;
  deliveryFee: number;
  assignedDriverId?: string;
  assignedDriverName?: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  discountAmount: number;
  discountReason?: string;
  taxAmount: number;
  total: number;
  paymentStatus: 'unpaid' | 'paid' | 'partial';
  payments: OrderPayment[];
  createdAt: string;
  preparedAt?: string;
  completedAt?: string;
  cashierId: string;
  cashierName: string;
  notes?: string;
}

export interface Customer {
  id: string;
  tenantId: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  notes?: string;
  loyaltyPoints: number;
  totalSpent: number;
  ordersCount: number;
  accountCredit: number; // Can have pre-paid wallet balance
}

// ==========================================
// 7. CASH REGISTER & FINANCIALS
// ==========================================

export interface CashRegisterSession {
  id: string;
  tenantId: string;
  branchId: string;
  registerName: string;
  cashierId: string;
  cashierName: string;
  status: 'open' | 'closed';
  openedAt: string;
  closedAt?: string;
  openingCash: number;
  cashSales: number;
  cardSales: number;
  cashDeposits: number;
  cashWithdrawals: number;
  refundsCount: number;
  refundsAmount: number;
  expectedCashInDrawer: number;
  actualCountedCash?: number;
  discrepancy?: number; // actual - expected
  closingNotes?: string;
}

export interface CashExpense {
  id: string;
  sessionId: string;
  tenantId: string;
  branchId: string;
  category: 'raw_materials' | 'cleaning' | 'utilities' | 'staff_meals' | 'maintenance' | 'miscellaneous';
  amount: number;
  description: string;
  recordedBy: string;
  createdAt: string;
}

// ==========================================
// 8. AUDIT LOGS & PROMOTIONS
// ==========================================

export interface AuditLogEntry {
  id: string;
  tenantId?: string;
  userId: string;
  userName: string;
  module: 'auth' | 'pos' | 'inventory' | 'staff' | 'cash_register' | 'finance' | 'admin' | 'subscription';
  action: string;
  description: string;
  previousValue?: string;
  newValue?: string;
  timestamp: string;
  ipAddress?: string;
}

export interface Promotion {
  id: string;
  tenantId: string;
  name: string;
  code: string;
  type: 'percentage' | 'fixed_da' | 'bogo';
  discountValue: number;
  minOrderAmount?: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}
