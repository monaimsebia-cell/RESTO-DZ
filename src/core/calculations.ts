/**
 * RESTO-DZ Core Calculations & Decoupled Pure Logic
 */

import { OrderItem, Recipe, RecipeIngredient } from './types';

export interface OrderTotalResult {
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  deliveryFee: number;
  total: number;
}

export function calculateOrderTotals(
  items: OrderItem[],
  discountType: 'percentage' | 'fixed' = 'percentage',
  discountValue: number = 0,
  taxRatePercent: number = 0,
  enableTax: boolean = false,
  deliveryFee: number = 0
): OrderTotalResult {
  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);

  let discountAmount = 0;
  if (discountType === 'percentage') {
    discountAmount = Math.round((subtotal * Math.max(0, Math.min(100, discountValue))) / 100);
  } else {
    discountAmount = Math.min(subtotal, Math.max(0, discountValue));
  }

  const taxableBase = Math.max(0, subtotal - discountAmount);
  const taxAmount = enableTax ? Math.round((taxableBase * Math.max(0, taxRatePercent)) / 100) : 0;
  const safeDeliveryFee = Math.max(0, deliveryFee);
  const total = taxableBase + taxAmount + safeDeliveryFee;

  return {
    subtotal,
    discountAmount,
    taxAmount,
    deliveryFee: safeDeliveryFee,
    total,
  };
}

export interface RecipeCostResult {
  ingredientsCost: number;
  packagingCost: number;
  laborEstimateCost: number;
  totalCost: number;
  sellingPrice: number;
  grossProfit: number;
  grossMarginPercent: number;
}

export function calculateRecipeCost(
  ingredients: RecipeIngredient[],
  packagingCost: number = 0,
  laborEstimateCost: number = 0,
  sellingPrice: number = 0
): RecipeCostResult {
  const ingredientsCost = ingredients.reduce((sum, ing) => sum + (ing.quantity * ing.unitCost), 0);
  const totalCost = Math.round(ingredientsCost + Math.max(0, packagingCost) + Math.max(0, laborEstimateCost));
  const safeSellingPrice = Math.max(0, sellingPrice);
  const grossProfit = safeSellingPrice - totalCost;
  const grossMarginPercent = safeSellingPrice > 0 ? Math.round((grossProfit / safeSellingPrice) * 100) : 0;

  return {
    ingredientsCost: Math.round(ingredientsCost),
    packagingCost,
    laborEstimateCost,
    totalCost,
    sellingPrice: safeSellingPrice,
    grossProfit,
    grossMarginPercent,
  };
}

export interface WorkerPocketTotalsResult {
  baseSalary: number;
  salaryEarned: number;
  overtimeHours: number;
  overtimeRate: number;
  overtimeTotal: number;
  bonuses: number;
  deductions: number;
  totalEarnings: number;
  advancesTaken: number;
  salaryReceived: number;
  remainingSalary: number;
}

export function calculateWorkerPocketTotals(params: {
  baseSalary: number;
  workedDays?: number;
  totalDaysInMonth?: number;
  overtimeHours?: number;
  overtimeRate?: number;
  overtimeFlatBonus?: number;
  bonuses?: number;
  deductions?: number;
  advancesTaken?: number;
  salaryReceived?: number;
}): WorkerPocketTotalsResult {
  const {
    baseSalary,
    workedDays = 30,
    totalDaysInMonth = 30,
    overtimeHours = 0,
    overtimeRate = 0,
    overtimeFlatBonus = 0,
    bonuses = 0,
    deductions = 0,
    advancesTaken = 0,
    salaryReceived = 0,
  } = params;

  // Pro-rate salary if partial attendance
  const salaryEarned = Math.round((baseSalary * Math.min(totalDaysInMonth, Math.max(0, workedDays))) / totalDaysInMonth);
  const overtimeTotal = Math.round((overtimeHours * overtimeRate) + overtimeFlatBonus);
  const totalEarnings = salaryEarned + overtimeTotal + bonuses - deductions;

  // Remaining salary = total earnings minus what was already taken in cash advances and regular payroll payouts
  const remainingSalary = Math.max(0, totalEarnings - advancesTaken - salaryReceived);

  return {
    baseSalary,
    salaryEarned,
    overtimeHours,
    overtimeRate,
    overtimeTotal,
    bonuses,
    deductions,
    totalEarnings,
    advancesTaken,
    salaryReceived,
    remainingSalary,
  };
}

export interface CashSessionReconciliationResult {
  openingCash: number;
  cashSales: number;
  cashDeposits: number;
  cashWithdrawals: number;
  refundsAmount: number;
  expectedCashInDrawer: number;
  actualCountedCash: number;
  discrepancy: number; // positive = surplus, negative = deficit
  isBalanced: boolean;
}

export function reconcileCashDrawer(
  openingCash: number,
  cashSales: number,
  cashDeposits: number,
  cashWithdrawals: number,
  refundsAmount: number,
  actualCountedCash: number
): CashSessionReconciliationResult {
  const expectedCashInDrawer = Math.round(openingCash + cashSales + cashDeposits - cashWithdrawals - refundsAmount);
  const discrepancy = Math.round(actualCountedCash - expectedCashInDrawer);
  const isBalanced = discrepancy === 0;

  return {
    openingCash,
    cashSales,
    cashDeposits,
    cashWithdrawals,
    refundsAmount,
    expectedCashInDrawer,
    actualCountedCash,
    discrepancy,
    isBalanced,
  };
}

export interface StockDeductionItem {
  ingredientId: string;
  name: string;
  quantityToDeduct: number;
  unit: string;
}

export function computeStockDeductions(
  orderItems: OrderItem[],
  recipesByProductId: Record<string, Recipe>
): StockDeductionItem[] {
  const deductionsMap = new Map<string, StockDeductionItem>();

  for (const item of orderItems) {
    const recipe = recipesByProductId[item.productId];
    if (!recipe || !recipe.ingredients) continue;

    for (const ing of recipe.ingredients) {
      const deductionAmount = ing.quantity * item.quantity;
      const existing = deductionsMap.get(ing.ingredientId);
      if (existing) {
        existing.quantityToDeduct += deductionAmount;
      } else {
        deductionsMap.set(ing.ingredientId, {
          ingredientId: ing.ingredientId,
          name: ing.name,
          quantityToDeduct: deductionAmount,
          unit: ing.unit,
        });
      }
    }
  }

  return Array.from(deductionsMap.values());
}

export function formatDA(amount: number, isArabic: boolean = false): string {
  const formatted = new Intl.NumberFormat('fr-DZ', {
    maximumFractionDigits: 0,
  }).format(amount);

  return isArabic ? `${formatted} دج` : `${formatted} DA`;
}
