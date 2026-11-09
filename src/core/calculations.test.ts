import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateOrderTotals,
  calculateRecipeCost,
  calculateWorkerPocketTotals,
  reconcileCashDrawer,
  computeStockDeductions,
  formatDA,
} from './calculations';
import { OrderItem, Recipe } from './types';

test('calculateOrderTotals applies percentage discount and tax accurately', () => {
  const items: OrderItem[] = [
    {
      id: 'item-1',
      productId: 'p1',
      productName: 'DZ Burger Double Cheese',
      quantity: 2,
      unitPrice: 850,
      selectedExtras: [],
      kitchenStatus: 'pending',
      station: 'grill',
      subtotal: 1700,
    },
    {
      id: 'item-2',
      productId: 'p2',
      productName: 'Frites Maison',
      quantity: 1,
      unitPrice: 250,
      selectedExtras: [],
      kitchenStatus: 'pending',
      station: 'fryer',
      subtotal: 250,
    },
  ];

  // Subtotal = 1950 DA, 10% discount = 195 DA, Tax base = 1755 DA, 19% tax = 333 DA, delivery = 200 DA
  const res = calculateOrderTotals(items, 'percentage', 10, 19, true, 200);

  assert.equal(res.subtotal, 1950);
  assert.equal(res.discountAmount, 195);
  assert.equal(res.taxAmount, 333);
  assert.equal(res.deliveryFee, 200);
  assert.equal(res.total, 1755 + 333 + 200);
});

test('calculateRecipeCost computes total cost, gross profit and margins', () => {
  const ingredients = [
    { ingredientId: 'ing-1', name: 'Steak Haché Boeuf 150g', quantity: 0.15, unit: 'kg', unitCost: 1800 }, // 270 DA
    { ingredientId: 'ing-2', name: 'Pain Burger Brioché', quantity: 1, unit: 'piece', unitCost: 60 }, // 60 DA
    { ingredientId: 'ing-3', name: 'Fromage Cheddar', quantity: 2, unit: 'piece', unitCost: 35 }, // 70 DA
    { ingredientId: 'ing-4', name: 'Sauce Algérienne', quantity: 30, unit: 'g', unitCost: 0.8 }, // 24 DA
  ];

  // Ingredients cost = 270 + 60 + 70 + 24 = 424 DA
  // Packaging = 40 DA, Labor = 50 DA => Total Cost = 514 DA
  // Selling Price = 950 DA => Gross Profit = 436 DA (46% margin)
  const res = calculateRecipeCost(ingredients, 40, 50, 950);

  assert.equal(res.ingredientsCost, 424);
  assert.equal(res.totalCost, 514);
  assert.equal(res.grossProfit, 436);
  assert.equal(res.grossMarginPercent, 46);
});

test('calculateWorkerPocketTotals distinguishes earned, advances and remaining balance', () => {
  const result = calculateWorkerPocketTotals({
    baseSalary: 45000, // 45,000 DA
    workedDays: 30,
    totalDaysInMonth: 30,
    overtimeHours: 10,
    overtimeRate: 300, // 3,000 DA overtime
    bonuses: 2000,
    deductions: 500,
    advancesTaken: 10000, // 10,000 DA took as mid-month advance
    salaryReceived: 20000, // 20,000 DA received
  });

  // Total earnings = 45000 + 3000 + 2000 - 500 = 49500 DA
  // Remaining = 49500 - 10000 - 20000 = 19500 DA
  assert.equal(result.totalEarnings, 49500);
  assert.equal(result.remainingSalary, 19500);
});

test('reconcileCashDrawer correctly detects surplus, deficit and balanced state', () => {
  // Opening: 10000 DA, Cash Sales: 45000 DA, Deposits: 5000 DA, Withdrawals: 3000 DA, Refunds: 1000 DA
  // Expected in drawer = 10000 + 45000 + 5000 - 3000 - 1000 = 56000 DA
  const balanced = reconcileCashDrawer(10000, 45000, 5000, 3000, 1000, 56000);
  assert.equal(balanced.expectedCashInDrawer, 56000);
  assert.equal(balanced.discrepancy, 0);
  assert.equal(balanced.isBalanced, true);

  const deficit = reconcileCashDrawer(10000, 45000, 5000, 3000, 1000, 55500);
  assert.equal(deficit.discrepancy, -500);
  assert.equal(deficit.isBalanced, false);
});

test('computeStockDeductions aggregates ingredients across multiple ordered items', () => {
  const items: OrderItem[] = [
    {
      id: 'i1',
      productId: 'p1',
      productName: 'Burger Classic',
      quantity: 3,
      unitPrice: 700,
      selectedExtras: [],
      kitchenStatus: 'pending',
      station: 'grill',
      subtotal: 2100,
    },
  ];

  const recipes: Record<string, Recipe> = {
    p1: {
      id: 'r1',
      tenantId: 't1',
      productId: 'p1',
      ingredients: [
        { ingredientId: 'ing-meat', name: 'Steak 120g', quantity: 0.12, unit: 'kg', unitCost: 1500 },
        { ingredientId: 'ing-bun', name: 'Pain Brioché', quantity: 1, unit: 'piece', unitCost: 50 },
      ],
      packagingCost: 30,
      laborEstimateCost: 40,
      totalCost: 250,
    },
  };

  const deductions = computeStockDeductions(items, recipes);
  assert.equal(deductions.length, 2);

  const meatDeduction = deductions.find(d => d.ingredientId === 'ing-meat');
  assert.ok(meatDeduction);
  // 3 * 0.12 = 0.36 kg
  assert.equal(Math.round(meatDeduction.quantityToDeduct * 100) / 100, 0.36);
});

test('formatDA outputs valid currency string for Latin and Arabic', () => {
  assert.equal(formatDA(1500, false), '1 500 DA');
  assert.equal(formatDA(1500, true), '1 500 دج');
});
