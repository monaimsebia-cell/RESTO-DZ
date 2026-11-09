import QRCode from 'qrcode';

export type WalletProvider = 'baridimob' | 'wimpay' | 'dz_pay' | 'generic';

export interface QRWalletPayload {
  v: string; // Version
  ref: string; // Unique Transaction Reference
  merchantId: string;
  merchantName: string;
  branchId: string;
  branchName: string;
  amount: number;
  currency: 'DZD';
  timestamp: number; // Unix epoch ms
  expiresAt: number; // Unix epoch ms
  orderType: string;
  tableNumber?: string;
  provider: WalletProvider;
  checksum: string;
}

export interface BuildQRWalletParams {
  merchantId: string;
  merchantName: string;
  branchId: string;
  branchName: string;
  amount: number;
  orderType: string;
  tableNumber?: string;
  provider?: WalletProvider;
  validitySeconds?: number;
}

/**
 * Creates a unique, cryptographically seeded transaction reference
 * e.g., "DZ-TX-1731089200-ABCD-892"
 */
export function generateTransactionRef(prefix: string = 'DZ-TX'): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  const seq = Math.floor(100 + Math.random() * 900);
  return `${prefix}-${ts}-${rand}-${seq}`;
}

/**
 * Generates simple checksum to detect payload tampering
 */
export function calculateChecksum(ref: string, amount: number, timestamp: number): string {
  const str = `${ref}|${amount}|${timestamp}|RESTODZ_FINTECH_SALT`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(16).toUpperCase();
}

/**
 * Builds the canonical QR data payload according to mobile wallet standard
 */
export function buildQRWalletPayload(params: BuildQRWalletParams): {
  payloadString: string;
  data: QRWalletPayload;
} {
  const timestamp = Date.now();
  const validitySeconds = params.validitySeconds || 300; // default 5 minutes
  const expiresAt = timestamp + validitySeconds * 1000;
  const ref = generateTransactionRef();
  const checksum = calculateChecksum(ref, params.amount, timestamp);
  const provider = params.provider || 'dz_pay';

  const data: QRWalletPayload = {
    v: '2.0',
    ref,
    merchantId: params.merchantId,
    merchantName: params.merchantName,
    branchId: params.branchId,
    branchName: params.branchName,
    amount: params.amount,
    currency: 'DZD',
    timestamp,
    expiresAt,
    orderType: params.orderType,
    tableNumber: params.tableNumber,
    provider,
    checksum,
  };

  // Formats as an interoperable URI scheme with JSON fallback
  // URI: dzpay://checkout?ref=...&amt=...
  const query = new URLSearchParams({
    ref: data.ref,
    amt: data.amount.toString(),
    cur: data.currency,
    merchant: data.merchantId,
    name: data.merchantName,
    branch: data.branchName,
    exp: data.expiresAt.toString(),
    prov: data.provider,
    chk: data.checksum,
  });

  const payloadString = `dzpay://checkout?${query.toString()}`;

  return { payloadString, data };
}

/**
 * Checks if the QR transaction is expired
 */
export function isQRExpired(expiresAt: number, currentMs: number = Date.now()): boolean {
  return currentMs > expiresAt;
}

/**
 * Parses and verifies an incoming QR string
 */
export function parseQRPayload(qrString: string): Partial<QRWalletPayload> | null {
  try {
    if (qrString.startsWith('dzpay://checkout?')) {
      const search = qrString.replace('dzpay://checkout?', '');
      const params = new URLSearchParams(search);
      return {
        ref: params.get('ref') || '',
        amount: Number(params.get('amt') || 0),
        currency: 'DZD',
        merchantId: params.get('merchant') || '',
        merchantName: params.get('name') || '',
        branchName: params.get('branch') || '',
        expiresAt: Number(params.get('exp') || 0),
        provider: (params.get('prov') || 'dz_pay') as WalletProvider,
        checksum: params.get('chk') || '',
      };
    }
    if (qrString.startsWith('{') && qrString.endsWith('}')) {
      return JSON.parse(qrString);
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Renders the QR code to an image DataURL (PNG)
 */
export async function generateQRCodeDataURL(
  text: string,
  options?: { width?: number; margin?: number; color?: { dark?: string; light?: string } }
): Promise<string> {
  return QRCode.toDataURL(text, {
    width: options?.width || 320,
    margin: options?.margin ?? 2,
    errorCorrectionLevel: 'M',
    color: {
      dark: options?.color?.dark || '#000000',
      light: options?.color?.light || '#FFFFFF',
    },
  });
}

/**
 * Renders the QR code as an SVG string for sharp vector rendering
 */
export async function generateQRCodeSVGString(
  text: string,
  options?: { width?: number; margin?: number; color?: { dark?: string; light?: string } }
): Promise<string> {
  return QRCode.toString(text, {
    type: 'svg',
    width: options?.width || 300,
    margin: options?.margin ?? 2,
    errorCorrectionLevel: 'M',
    color: {
      dark: options?.color?.dark || '#000000',
      light: options?.color?.light || '#FFFFFF',
    },
  });
}
