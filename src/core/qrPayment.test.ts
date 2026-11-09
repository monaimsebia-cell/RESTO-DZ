import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  generateTransactionRef,
  calculateChecksum,
  buildQRWalletPayload,
  isQRExpired,
  parseQRPayload,
  generateQRCodeDataURL,
} from './qrPayment.ts';

test('generateTransactionRef produces unique formatted references with prefix', () => {
  const ref1 = generateTransactionRef('DZ-TX');
  const ref2 = generateTransactionRef('DZ-TX');
  assert.ok(ref1.startsWith('DZ-TX-'));
  assert.ok(ref2.startsWith('DZ-TX-'));
  assert.notEqual(ref1, ref2);
});

test('calculateChecksum produces deterministic non-empty hex hash', () => {
  const c1 = calculateChecksum('TX-101', 2500, 1700000000);
  const c2 = calculateChecksum('TX-101', 2500, 1700000000);
  const c3 = calculateChecksum('TX-101', 3000, 1700000000);
  assert.equal(c1, c2);
  assert.notEqual(c1, c3);
  assert.ok(c1.length > 0);
});

test('buildQRWalletPayload creates valid payload structure and URI string', () => {
  const { payloadString, data } = buildQRWalletPayload({
    merchantId: 'tenant_alger_01',
    merchantName: 'El Bahdja Burger',
    branchId: 'branch_didouche',
    branchName: 'Didouche Mourad',
    amount: 1850,
    orderType: 'dine_in',
    tableNumber: 'T04',
    provider: 'baridimob',
    validitySeconds: 180,
  });

  assert.equal(data.amount, 1850);
  assert.equal(data.currency, 'DZD');
  assert.equal(data.provider, 'baridimob');
  assert.equal(data.tableNumber, 'T04');
  assert.ok(payloadString.startsWith('dzpay://checkout?'));
  assert.ok(payloadString.includes('amt=1850'));
  assert.ok(payloadString.includes('cur=DZD'));
});

test('isQRExpired accurately detects active vs expired timestamps', () => {
  const now = 1700000000;
  assert.equal(isQRExpired(now + 10000, now), false); // Still 10s left
  assert.equal(isQRExpired(now - 1000, now), true); // Expired 1s ago
});

test('parseQRPayload recovers reference, amount, and merchant details from URI', () => {
  const { payloadString, data } = buildQRWalletPayload({
    merchantId: 'tenant_or_02',
    merchantName: 'Pizzeria Bella Napoli',
    branchId: 'branch_or_01',
    branchName: 'Front de Mer',
    amount: 3200,
    orderType: 'takeaway',
    provider: 'wimpay',
  });

  const parsed = parseQRPayload(payloadString);
  assert.ok(parsed);
  assert.equal(parsed?.ref, data.ref);
  assert.equal(parsed?.amount, 3200);
  assert.equal(parsed?.merchantId, 'tenant_or_02');
  assert.equal(parsed?.provider, 'wimpay');
});

test('generateQRCodeDataURL generates a valid base64 PNG data URL', async () => {
  const dataUrl = await generateQRCodeDataURL('dzpay://checkout?amt=1500&cur=DZD', { width: 200 });
  assert.ok(dataUrl.startsWith('data:image/png;base64,'));
  assert.ok(dataUrl.length > 100);
});
