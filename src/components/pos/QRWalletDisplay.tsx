import React, { useState, useEffect, useRef } from 'react';
import {
  QrCode,
  Smartphone,
  RefreshCw,
  CheckCircle2,
  Copy,
  Check,
  Maximize2,
  Minimize2,
  Clock,
  Sparkles,
  ShieldCheck,
  Building2,
} from 'lucide-react';
import {
  buildQRWalletPayload,
  generateQRCodeDataURL,
  isQRExpired,
  WalletProvider,
} from '../../core/qrPayment';
import { formatDA } from '../../core/calculations';

interface QRWalletDisplayProps {
  amount: number;
  merchantId: string;
  merchantName: string;
  branchId: string;
  branchName: string;
  orderType: string;
  tableNumber?: string;
  language: 'en' | 'fr' | 'ar';
  onPaymentSuccess: (paymentData: {
    method: 'qr_wallet';
    amount: number;
    walletProvider: WalletProvider;
    transactionRef: string;
    qrPayload: string;
  }) => void;
  onCancel?: () => void;
}

export const QRWalletDisplay: React.FC<QRWalletDisplayProps> = ({
  amount,
  merchantId,
  merchantName,
  branchId,
  branchName,
  orderType,
  tableNumber,
  language,
  onPaymentSuccess,
}) => {
  const [provider, setProvider] = useState<WalletProvider>('baridimob');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [qrPayload, setQrPayload] = useState<string>('');
  const [txRef, setTxRef] = useState<string>('');
  const [expiresAt, setExpiresAt] = useState<number>(Date.now() + 300000);
  const [secondsLeft, setSecondsLeft] = useState<number>(300);
  const [isExpired, setIsExpired] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [isCustomerFacing, setIsCustomerFacing] = useState<boolean>(false);
  const [isSimulatingSuccess, setIsSimulatingSuccess] = useState<boolean>(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState<boolean>(false);

  // Play audio chime on success
  const playSuccessChime = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.start();
      osc.stop(ctx.currentTime + 0.36);
    } catch {
      // AudioContext fallback
    }
  };

  // Generate dynamic QR
  const generateNewQR = async (selectedProvider = provider) => {
    const { payloadString, data } = buildQRWalletPayload({
      merchantId,
      merchantName,
      branchId,
      branchName,
      amount,
      orderType,
      tableNumber,
      provider: selectedProvider,
      validitySeconds: 300,
    });

    setQrPayload(payloadString);
    setTxRef(data.ref);
    setExpiresAt(data.expiresAt);
    setSecondsLeft(300);
    setIsExpired(false);
    setPaymentConfirmed(false);

    const url = await generateQRCodeDataURL(payloadString, {
      width: 400,
      margin: 2,
      color: {
        dark: '#0A0A0C',
        light: '#FFFFFF',
      },
    });
    setQrDataUrl(url);
  };

  // Initial load and provider changes
  useEffect(() => {
    generateNewQR(provider);
  }, [provider, amount]);

  // Expiration countdown ticker
  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = Math.max(0, Math.round((expiresAt - Date.now()) / 1000));
      setSecondsLeft(remaining);
      if (remaining === 0) {
        setIsExpired(true);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [expiresAt]);

  // Copy transaction reference
  const handleCopyRef = () => {
    if (!txRef) return;
    navigator.clipboard.writeText(txRef);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Trigger simulated scan confirmation
  const handleSimulatePayment = () => {
    if (isExpired || paymentConfirmed) return;
    setIsSimulatingSuccess(true);

    setTimeout(() => {
      setIsSimulatingSuccess(false);
      setPaymentConfirmed(true);
      playSuccessChime();

      setTimeout(() => {
        onPaymentSuccess({
          method: 'qr_wallet',
          amount,
          walletProvider: provider,
          transactionRef: txRef,
          qrPayload,
        });
      }, 800);
    }, 800);
  };

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const timeFormatted = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  const providerDetails = {
    baridimob: {
      name: 'BaridiMob QR',
      labelAr: 'بريدي موب (بريد الجزائر)',
      badge: 'Algérie Poste',
      color: 'from-amber-600 to-yellow-600',
      activeBorder: 'border-amber-500',
      tagline: 'Scanner avec BaridiMob',
    },
    wimpay: {
      name: 'Wimpay-BNA QR',
      labelAr: 'ويم باي (البنك الوطني الجزائري)',
      badge: 'Banque BNA',
      color: 'from-emerald-600 to-teal-700',
      activeBorder: 'border-emerald-500',
      tagline: 'Scanner avec Wimpay BNA',
    },
    dz_pay: {
      name: 'Universal DZ-Pay',
      labelAr: 'رمز الدفع الشامل (SATIM / CIB)',
      badge: 'SATIM Interop',
      color: 'from-red-600 to-rose-700',
      activeBorder: 'border-red-500',
      tagline: 'Toute application bancaire CIB',
    },
  };

  const currentDetails = providerDetails[provider as keyof typeof providerDetails] || providerDetails.baridimob;

  return (
    <div className={`relative flex flex-col ${isCustomerFacing ? 'fixed inset-0 z-50 bg-[#0E0E10] p-6 lg:p-12 overflow-y-auto' : 'w-full'}`}>
      {/* Top Header with Customer Facing toggle */}
      <div className="flex items-center justify-between pb-3 border-b border-[#2D2D35] mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-red-600 to-amber-600 flex items-center justify-center text-white shadow-md">
            <QrCode className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-black text-white flex items-center gap-1.5">
              <span>{language === 'ar' ? 'الدفع عبر الهاتف ورمز QR' : 'Paiement QR Code Mobile'}</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                Instantané
              </span>
            </h4>
            <p className="text-[11px] text-[#9CA3AF]">
              {language === 'ar' ? 'امسح الرمز بواسطة تطبيقك البنكي' : 'Le client scanne avec son wallet bancaire'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsCustomerFacing(!isCustomerFacing)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#2A2A30] hover:bg-[#34343C] text-xs font-semibold text-[#9CA3AF] hover:text-white transition"
            title="Basculer vers l’écran orienté client"
          >
            {isCustomerFacing ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">
              {isCustomerFacing ? 'Mode Caisse' : 'Vue Client'}
            </span>
          </button>
        </div>
      </div>

      {/* Wallet Provider Switcher */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        {(['baridimob', 'wimpay', 'dz_pay'] as WalletProvider[]).map(p => {
          const info = providerDetails[p as keyof typeof providerDetails];
          const isSelected = provider === p;
          return (
            <button
              key={p}
              type="button"
              onClick={() => {
                setProvider(p);
                generateNewQR(p);
              }}
              className={`p-2 rounded-xl border text-center transition-all ${
                isSelected
                  ? `bg-[#24242C] ${info.activeBorder} shadow-md text-white`
                  : 'bg-[#161618] border-[#2D2D35] text-[#9CA3AF] hover:text-white'
              }`}
            >
              <div className="text-[11px] font-bold truncate">
                {language === 'ar' ? info.labelAr : info.name}
              </div>
              <div className="text-[9px] text-[#6B7280] uppercase tracking-wider mt-0.5">
                {info.badge}
              </div>
            </button>
          );
        })}
      </div>

      {/* QR Display Card */}
      <div className="relative bg-[#161618] rounded-2xl border border-[#2D2D35] p-4 flex flex-col items-center justify-center text-center overflow-hidden">
        {/* Success Overlay */}
        {paymentConfirmed && (
          <div className="absolute inset-0 z-20 bg-emerald-950/95 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-white animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xl shadow-emerald-900/50 mb-3 animate-bounce">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h3 className="text-lg font-black">
              {language === 'ar' ? 'تم استلام وتأكيد الدفع!' : 'Paiement Reçu et Confirmé !'}
            </h3>
            <p className="text-xs text-emerald-300 mt-1">
              {language === 'ar'
                ? `المبلغ المسدد: ${formatDA(amount, true)} عبر ${currentDetails.labelAr}`
                : `Montant de ${formatDA(amount)} validé par ${currentDetails.name}`}
            </p>
            <div className="mt-3 font-mono text-[11px] text-emerald-400 bg-emerald-900/40 px-3 py-1 rounded-full border border-emerald-700/60">
              Réf: {txRef}
            </div>
          </div>
        )}

        {/* Expired Overlay */}
        {isExpired && !paymentConfirmed && (
          <div className="absolute inset-0 z-20 bg-black/90 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-white">
            <Clock className="w-12 h-12 text-amber-500 mb-2" />
            <h4 className="text-sm font-bold text-white">
              {language === 'ar' ? 'انتهت صلاحية الرمز المؤقت' : 'Code QR Expiré'}
            </h4>
            <p className="text-xs text-[#9CA3AF] mt-1 max-w-xs">
              {language === 'ar'
                ? 'لحماية المعاملات، يتم تجديد الرمز كل 5 دقائق. اضغط للتجديد'
                : 'Pour des raisons de sécurité, le QR dynamique expire après 5 minutes.'}
            </p>
            <button
              onClick={() => generateNewQR()}
              className="mt-4 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#E53935] hover:bg-[#D32F2F] text-white text-xs font-bold shadow-lg transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'توليد رمز جديد' : 'Régénérer le Code QR'}</span>
            </button>
          </div>
        )}

        {/* Amount to pay banner */}
        <div className="w-full bg-[#1F1F24] rounded-xl p-2.5 mb-3 border border-[#2D2D35] flex items-center justify-between">
          <div className="text-left">
            <span className="text-[10px] text-[#9CA3AF] uppercase tracking-wider block">
              {language === 'ar' ? 'المبلغ المستحق للدفع' : 'Net à Encaisser'}
            </span>
            <div className="text-lg font-black text-[#E53935] font-mono leading-none mt-0.5">
              {formatDA(amount, language === 'ar')}
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-amber-400">
              <Clock className="w-3 h-3" />
              <span>{timeFormatted}</span>
            </div>
            <span className="text-[9px] text-[#6B7280]">
              {language === 'ar' ? 'صلاحية ديناميكية' : 'QR Sécurisé'}
            </span>
          </div>
        </div>

        {/* QR Code Container with Scanning Corners */}
        <div className="relative p-3 bg-white rounded-2xl shadow-xl shadow-black/40">
          {/* Target corner marks */}
          <div className="absolute top-1 left-1 w-4 h-4 border-t-2 border-l-2 border-red-600 rounded-tl pointer-events-none" />
          <div className="absolute top-1 right-1 w-4 h-4 border-t-2 border-r-2 border-red-600 rounded-tr pointer-events-none" />
          <div className="absolute bottom-1 left-1 w-4 h-4 border-b-2 border-l-2 border-red-600 rounded-bl pointer-events-none" />
          <div className="absolute bottom-1 right-1 w-4 h-4 border-b-2 border-r-2 border-red-600 rounded-br pointer-events-none" />

          {qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt="Transaction QR Code"
              className={`rounded-lg object-contain transition-all ${
                isCustomerFacing ? 'w-64 h-64 lg:w-80 lg:h-80' : 'w-48 h-48 sm:w-56 sm:h-56'
              }`}
            />
          ) : (
            <div className="w-48 h-48 flex items-center justify-center bg-gray-100 rounded-lg text-gray-400">
              <RefreshCw className="w-6 h-6 animate-spin text-red-600" />
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-3 space-y-1 text-center">
          <p className="text-xs font-bold text-white flex items-center justify-center gap-1">
            <Smartphone className="w-3.5 h-3.5 text-amber-400" />
            <span>{language === 'ar' ? currentDetails.labelAr : currentDetails.tagline}</span>
          </p>
          <p className="text-[11px] text-[#9CA3AF] max-w-xs">
            {language === 'ar'
              ? 'افتح التطبيق، اختر مسح الرمز، ثم أكد المبلغ على شاشتك'
              : 'Ouvrez votre appli, scannez ce code puis confirmez le montant sur votre mobile.'}
          </p>
        </div>

        {/* Transaction Reference & Copy */}
        <div className="mt-3 w-full flex items-center justify-between bg-[#111113] px-3 py-1.5 rounded-lg border border-[#2D2D35] text-[10px]">
          <span className="text-[#9CA3AF] font-medium">
            {language === 'ar' ? 'المرجع :' : 'Réf :'}
          </span>
          <span className="font-mono font-bold text-white tracking-wider truncate max-w-[170px]">
            {txRef}
          </span>
          <button
            type="button"
            onClick={handleCopyRef}
            className="p-1 rounded text-[#9CA3AF] hover:text-white hover:bg-[#2A2A30] transition"
            title="Copier la référence"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Bottom Actions: Simulate Payment received & Regenerate */}
      <div className="mt-3 space-y-2">
        <button
          type="button"
          onClick={handleSimulatePayment}
          disabled={isExpired || isSimulatingSuccess || paymentConfirmed}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-950/40 disabled:opacity-40 transition-all active:scale-[0.98]"
        >
          {isSimulatingSuccess ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>
                {language === 'ar' ? 'جاري التحقق من عملية الدفع...' : 'Vérification du paiement en direct...'}
              </span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              <span>
                {language === 'ar' ? 'محاكاة تأكيد الدفع من الهاتف' : 'Simuler Scan Client & Validation Réussie'}
              </span>
            </>
          )}
        </button>

        <div className="flex items-center justify-between text-[11px] text-[#9CA3AF] px-1">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Cryptage SATIM v2</span>
          </span>
          <button
            type="button"
            onClick={() => generateNewQR()}
            className="flex items-center gap-1 hover:text-white transition"
          >
            <RefreshCw className="w-3 h-3" />
            <span>{language === 'ar' ? 'تحديث الرمز' : 'Actualiser'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
