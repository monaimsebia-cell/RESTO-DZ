import React from 'react';
import { Order, Tenant } from '../../core/types';
import { formatDA } from '../../core/calculations';

interface PrintableReceiptProps {
  order: Order;
  tenant: Tenant;
  paperWidth?: '58mm' | '80mm';
}

export const PrintableReceipt: React.FC<PrintableReceiptProps> = ({
  order,
  tenant,
  paperWidth = tenant.settings?.branding?.paperWidth || '80mm',
}) => {
  const is58mm = paperWidth === '58mm';

  return (
    <div
      id="printable-receipt"
      className={`bg-white text-black font-mono mx-auto p-4 border border-gray-300 shadow-sm leading-tight select-text ${
        is58mm ? 'max-w-[260px] text-[11px]' : 'max-w-[340px] text-xs'
      }`}
    >
      {/* Header */}
      <div className="text-center border-b border-black pb-2 mb-2">
        <h1 className="font-black text-sm uppercase tracking-wider">{tenant.name}</h1>
        <p className="text-[10px] whitespace-pre-line mt-0.5">
          {tenant.settings?.branding?.receiptHeader || `${tenant.address}\n${tenant.city} — Tél: ${tenant.phone}`}
        </p>
        <div className="mt-1.5 flex items-center justify-between text-[10px] border-t border-dashed border-gray-400 pt-1">
          <span>Ticket: <strong className="font-mono">{order.orderNumber}</strong></span>
          <span>{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>

      {/* Order Info */}
      <div className="text-[10px] mb-2 space-y-0.5">
        <div className="flex justify-between">
          <span>Date : {new Date(order.createdAt).toLocaleDateString()}</span>
          <span>Caissier : {order.cashierName.split(' ')[0]}</span>
        </div>
        <div className="flex justify-between font-bold">
          <span>Service : {order.type === 'dine_in' ? `SUR PLACE (${order.tableName || 'Table'})` : order.type === 'takeaway' ? 'À EMPORTER' : 'LIVRAISON'}</span>
        </div>
        {order.customerName && (
          <div className="text-gray-700">Client : {order.customerName} ({order.customerPhone || ''})</div>
        )}
        {order.deliveryAddress && (
          <div className="text-gray-700 italic">Adr : {order.deliveryAddress}</div>
        )}
      </div>

      {/* Items Table */}
      <div className="border-t border-b border-black py-1 mb-2">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-dashed border-gray-400 text-[10px]">
              <th className="py-0.5">Qté</th>
              <th className="py-0.5">Article</th>
              <th className="py-0.5 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dotted divide-gray-300">
            {order.items.map(item => (
              <tr key={item.id} className="align-top">
                <td className="py-1 font-bold">{item.quantity}x</td>
                <td className="py-1 pr-1">
                  <div>{item.productName}</div>
                  {item.selectedVariation && (
                    <div className="text-[9px] text-gray-600">[{item.selectedVariation.name}]</div>
                  )}
                  {item.selectedExtras?.map((e, idx) => (
                    <div key={idx} className="text-[9px] text-gray-600">+ {e.name} ({e.price} DA)</div>
                  ))}
                  {item.notes && <div className="text-[9px] italic text-gray-500">Note: {item.notes}</div>}
                </td>
                <td className="py-1 text-right font-bold whitespace-nowrap">
                  {item.subtotal} DA
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals Section */}
      <div className="space-y-1 text-xs border-b border-black pb-2 mb-2">
        <div className="flex justify-between text-[11px]">
          <span>Sous-total :</span>
          <span>{order.subtotal} DA</span>
        </div>
        {order.discountAmount > 0 && (
          <div className="flex justify-between text-[11px] text-red-600">
            <span>Remise :</span>
            <span>-{order.discountAmount} DA</span>
          </div>
        )}
        {order.taxAmount > 0 && (
          <div className="flex justify-between text-[10px] text-gray-600">
            <span>TVA ({tenant.settings?.taxRatePercent || 9}%) :</span>
            <span>{order.taxAmount} DA</span>
          </div>
        )}
        {order.deliveryFee > 0 && (
          <div className="flex justify-between text-[11px]">
            <span>Livraison :</span>
            <span>+{order.deliveryFee} DA</span>
          </div>
        )}
        <div className="flex justify-between text-sm font-black border-t border-black pt-1">
          <span>NET À PAYER :</span>
          <span>{order.total} DA</span>
        </div>
      </div>

      {/* Payments */}
      <div className="text-[10px] mb-3 space-y-0.5">
        {order.payments.map((p, idx) => (
          <div key={idx} className="space-y-0.5">
            <div className="flex justify-between">
              <span>
                Paiement (
                {p.method === 'cash'
                  ? 'Espèces'
                  : p.method === 'qr_wallet'
                  ? `Wallet QR ${p.walletProvider === 'baridimob' ? 'BaridiMob' : p.walletProvider === 'wimpay' ? 'Wimpay' : 'Mobile'}`
                  : 'Carte CIB/Edahabia'}
                ) :
              </span>
              <span className="font-bold">{p.amount} DA</span>
            </div>
            {p.transactionRef && (
              <div className="text-[9px] text-gray-600 font-mono">
                Réf: {p.transactionRef}
              </div>
            )}
          </div>
        ))}
        {order.payments[0]?.tenderedCash && (
          <>
            <div className="flex justify-between text-gray-700">
              <span>Espèces reçues :</span>
              <span>{order.payments[0].tenderedCash} DA</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>Monnaie rendue :</span>
              <span>{order.payments[0].changeGiven || 0} DA</span>
            </div>
          </>
        )}
      </div>

      {/* Footer & Barcode/QR simulation */}
      <div className="text-center text-[10px] space-y-1 pt-1 border-t border-dashed border-gray-400">
        <p className="font-semibold whitespace-pre-line">
          {tenant.settings?.branding?.receiptFooter || 'Merci pour votre visite ! Saha ftourkoum !'}
        </p>
        <p className="text-[9px] text-gray-500 font-mono">
          Propulsé par RESTO-DZ SaaS • {order.id}
        </p>
      </div>
    </div>
  );
};
