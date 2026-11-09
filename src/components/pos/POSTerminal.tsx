import React, { useState } from 'react';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  Printer,
  Pause,
  Send,
  CreditCard,
  Banknote,
  Percent,
  CheckCircle,
  X,
  Users,
  MapPin,
  Utensils,
  ChevronRight,
  QrCode,
  Smartphone,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Product, OrderItem, OrderType, OrderPayment, Order } from '../../core/types';
import { calculateOrderTotals, formatDA } from '../../core/calculations';
import { PrintableReceipt } from '../receipt/PrintableReceipt';
import { QRWalletDisplay } from './QRWalletDisplay';
import { generateTransactionRef } from '../../core/qrPayment';

export const POSTerminal: React.FC = () => {
  const {
    products,
    categories,
    tables,
    currentTenant,
    currentBranch,
    createNewOrder,
    t,
    language,
  } = useApp();

  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [orderType, setOrderType] = useState<OrderType>('dine_in');
  const [selectedTableId, setSelectedTableId] = useState<string>(tables[0]?.id || '');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [deliveryAddress, setDeliveryAddress] = useState<string>('');
  const [deliveryFee, setDeliveryFee] = useState<number>(200);

  // Cart Items
  const [cartItems, setCartItems] = useState<OrderItem[]>([]);
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [enableTax, setEnableTax] = useState<boolean>(currentTenant.settings?.enableTax ?? true);

  // Modals
  const [customizingProduct, setCustomizingProduct] = useState<Product | null>(null);
  const [customVariation, setCustomVariation] = useState<any>(null);
  const [customExtras, setCustomExtras] = useState<any[]>([]);
  const [customNotes, setCustomNotes] = useState<string>('');

  // Payment Modal
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'qr_wallet' | 'mixed'>('cash');
  const [tenderedCash, setTenderedCash] = useState<number>(0);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  // Held Tickets
  const [heldOrders, setHeldOrders] = useState<any[]>([]);

  // Filter products by category and search
  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategoryId === 'all' || product.categoryId === selectedCategoryId;
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.nameAr && product.nameAr.includes(searchQuery)) ||
      (product.nameFr && product.nameFr.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch && product.isAvailable;
  });

  // Totals
  const taxRate = currentTenant.settings?.taxRatePercent || 9;
  const totals = calculateOrderTotals(
    cartItems,
    'percentage',
    discountPercent,
    taxRate,
    enableTax,
    orderType === 'delivery' ? deliveryFee : 0
  );

  // Handle product click: if has variations or extras, customize; else direct add
  const handleProductClick = (product: Product) => {
    if ((product.variations && product.variations.length > 0) || (product.extras && product.extras.length > 0)) {
      setCustomizingProduct(product);
      setCustomVariation(product.variations?.[0] || null);
      setCustomExtras([]);
      setCustomNotes('');
    } else {
      addToCartDirect(product);
    }
  };

  const addToCartDirect = (product: Product, variation?: any, extras: any[] = [], notes: string = '') => {
    const extraPrice = extras.reduce((sum, e) => sum + e.price, 0);
    const varPriceDelta = variation?.priceDelta || 0;
    const unitPrice = product.price + varPriceDelta + extraPrice;

    const newItem: OrderItem = {
      id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      productId: product.id,
      productName: product.name,
      productNameAr: product.nameAr,
      productNameFr: product.nameFr,
      quantity: 1,
      unitPrice,
      selectedVariation: variation,
      selectedExtras: extras,
      notes,
      kitchenStatus: 'pending',
      station: product.targetStation,
      subtotal: unitPrice,
    };

    setCartItems(prev => [...prev, newItem]);
    setCustomizingProduct(null);
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setCartItems(prev =>
      prev
        .map(item => {
          if (item.id !== itemId) return item;
          const newQty = item.quantity + delta;
          if (newQty <= 0) return null;
          return {
            ...item,
            quantity: newQty,
            subtotal: newQty * item.unitPrice,
          };
        })
        .filter(Boolean) as OrderItem[]
    );
  };

  const removeItem = (itemId: string) => {
    setCartItems(prev => prev.filter(i => i.id !== itemId));
  };

  const clearCart = () => {
    setCartItems([]);
    setDiscountPercent(0);
  };

  const holdTicket = () => {
    if (cartItems.length === 0) return;
    setHeldOrders(prev => [
      ...prev,
      {
        id: `held_${Date.now()}`,
        items: cartItems,
        orderType,
        selectedTableId,
        customerName,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    clearCart();
  };

  const resumeTicket = (held: any) => {
    setCartItems(held.items);
    setOrderType(held.orderType);
    setSelectedTableId(held.selectedTableId);
    setCustomerName(held.customerName);
    setHeldOrders(prev => prev.filter(h => h.id !== held.id));
  };

  const openPaymentModal = (defaultMethod: 'cash' | 'card' | 'qr_wallet' | 'mixed' = 'cash') => {
    if (cartItems.length === 0) return;
    setPaymentMethod(defaultMethod);
    setTenderedCash(totals.total);
    setIsPaymentModalOpen(true);
  };

  const handleQRSuccess = async (qrPaymentData: {
    method: 'qr_wallet';
    amount: number;
    walletProvider: any;
    transactionRef: string;
    qrPayload: string;
  }) => {
    const selectedTable = tables.find(t => t.id === selectedTableId);
    const newOrder = await createNewOrder({
      type: orderType,
      tableId: orderType === 'dine_in' ? selectedTableId : undefined,
      tableName: orderType === 'dine_in' ? selectedTable?.number : undefined,
      customerName: customerName || undefined,
      customerPhone: customerPhone || undefined,
      deliveryAddress: orderType === 'delivery' ? deliveryAddress : undefined,
      deliveryFee: orderType === 'delivery' ? deliveryFee : 0,
      items: cartItems,
      subtotal: totals.subtotal,
      discountAmount: totals.discountAmount,
      taxAmount: totals.taxAmount,
      total: totals.total,
      paymentStatus: 'paid',
      payments: [
        {
          method: 'qr_wallet',
          amount: totals.total,
          walletProvider: qrPaymentData.walletProvider,
          transactionRef: qrPaymentData.transactionRef,
          qrPayload: qrPaymentData.qrPayload,
        },
      ],
    });

    setIsPaymentModalOpen(false);
    setCompletedOrder(newOrder);
    clearCart();
  };

  const handleCompletePayment = async () => {
    const selectedTable = tables.find(t => t.id === selectedTableId);
    const payments: OrderPayment[] = [];

    if (paymentMethod === 'cash') {
      payments.push({
        method: 'cash',
        amount: totals.total,
        tenderedCash,
        changeGiven: Math.max(0, tenderedCash - totals.total),
      });
    } else if (paymentMethod === 'card') {
      payments.push({
        method: 'card',
        amount: totals.total,
      });
    } else if (paymentMethod === 'qr_wallet') {
      payments.push({
        method: 'qr_wallet',
        amount: totals.total,
        walletProvider: 'baridimob',
        transactionRef: generateTransactionRef(),
      });
    } else {
      // Split 50-50 for demo
      payments.push({ method: 'cash', amount: Math.round(totals.total / 2) });
      payments.push({ method: 'card', amount: totals.total - Math.round(totals.total / 2) });
    }

    const newOrder = await createNewOrder({
      type: orderType,
      tableId: orderType === 'dine_in' ? selectedTableId : undefined,
      tableName: orderType === 'dine_in' ? selectedTable?.number : undefined,
      customerName: customerName || undefined,
      customerPhone: customerPhone || undefined,
      deliveryAddress: orderType === 'delivery' ? deliveryAddress : undefined,
      deliveryFee: orderType === 'delivery' ? deliveryFee : 0,
      items: cartItems,
      subtotal: totals.subtotal,
      discountAmount: totals.discountAmount,
      taxAmount: totals.taxAmount,
      total: totals.total,
      paymentStatus: 'paid',
      payments,
    });

    setIsPaymentModalOpen(false);
    setCompletedOrder(newOrder);
    clearCart();
  };

  const handleSendToKitchenOnly = async () => {
    if (cartItems.length === 0) return;
    const selectedTable = tables.find(t => t.id === selectedTableId);

    await createNewOrder({
      type: orderType,
      tableId: orderType === 'dine_in' ? selectedTableId : undefined,
      tableName: orderType === 'dine_in' ? selectedTable?.number : undefined,
      customerName: customerName || undefined,
      customerPhone: customerPhone || undefined,
      deliveryAddress: orderType === 'delivery' ? deliveryAddress : undefined,
      deliveryFee: orderType === 'delivery' ? deliveryFee : 0,
      items: cartItems,
      subtotal: totals.subtotal,
      discountAmount: totals.discountAmount,
      taxAmount: totals.taxAmount,
      total: totals.total,
      paymentStatus: 'unpaid',
      payments: [],
    });

    clearCart();
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-58px)] overflow-hidden bg-[#101012] text-white">
      {/* LEFT: PRODUCTS CATALOG & CATEGORIES */}
      <div className="flex-1 flex flex-col p-4 overflow-hidden border-b lg:border-b-0 lg:border-r border-[#2D2D35]">
        {/* Search & Held Tickets Bar */}
        <div className="flex items-center gap-3 mb-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={t.posSearchProducts}
              className="w-full bg-[#1E1E22] border border-[#2D2D35] rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-[#E53935]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-[#9CA3AF] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {heldOrders.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto">
              <span className="text-[10px] text-amber-400 font-bold uppercase whitespace-nowrap">En attente :</span>
              {heldOrders.map((h, i) => (
                <button
                  key={h.id}
                  onClick={() => resumeTicket(h)}
                  className="px-2.5 py-1.5 rounded-lg bg-amber-950/60 border border-amber-700 text-amber-300 text-xs font-bold whitespace-nowrap hover:bg-amber-900/80 transition-colors"
                >
                  #{i + 1} ({h.items.length} art.) {h.time}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-3 shrink-0">
          <button
            onClick={() => setSelectedCategoryId('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategoryId === 'all'
                ? 'bg-[#E53935] text-white shadow-md shadow-red-950/30'
                : 'bg-[#1E1E22] text-[#9CA3AF] hover:text-white border border-[#2D2D35]'
            }`}
          >
            {t.posAllCategories}
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategoryId(cat.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategoryId === cat.id
                  ? 'bg-[#E53935] text-white shadow-md shadow-red-950/30'
                  : 'bg-[#1E1E22] text-[#9CA3AF] hover:text-white border border-[#2D2D35]'
              }`}
            >
              <span>{cat.icon || '🍽️'}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 pr-1">
          {filteredProducts.map(product => (
            <button
              key={product.id}
              onClick={() => handleProductClick(product)}
              className="bg-[#1E1E22] hover:bg-[#25252A] active:scale-[0.98] border border-[#2D2D35] hover:border-[#E53935]/50 p-3 rounded-2xl flex flex-col justify-between text-left transition-all group relative overflow-hidden"
            >
              <div>
                <div className="flex items-start justify-between gap-1 mb-1.5">
                  <span className="text-xl">
                    {product.categoryId === 'cat_burgers' ? '🍔' : product.categoryId === 'cat_drinks' ? '🥤' : '🍟'}
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#2A2A30] text-amber-400 font-mono">
                    {product.targetStation}
                  </span>
                </div>
                <h4 className="font-bold text-xs text-white line-clamp-2 leading-tight group-hover:text-red-400 transition-colors">
                  {language === 'ar' && product.nameAr ? product.nameAr : product.name}
                </h4>
                <p className="text-[10px] text-[#9CA3AF] line-clamp-1 mt-0.5">
                  {product.description}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-[#2D2D35] flex items-center justify-between">
                <span className="font-black text-sm text-white">
                  {formatDA(product.price, language === 'ar')}
                </span>
                <span className="w-6 h-6 rounded-lg bg-[#2A2A30] group-hover:bg-[#E53935] flex items-center justify-center text-xs text-white transition-colors">
                  +
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* RIGHT: TICKET / ACTIVE ORDER CART */}
      <div className="w-full lg:w-96 shrink-0 bg-[#161618] flex flex-col h-full border-t lg:border-t-0 border-[#2D2D35]">
        {/* Service Type Switcher */}
        <div className="p-3 bg-[#1A1A1E] border-b border-[#2D2D35] space-y-2">
          <div className="grid grid-cols-3 gap-1 bg-[#121214] p-1 rounded-xl border border-[#2D2D35]">
            <button
              onClick={() => setOrderType('dine_in')}
              className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                orderType === 'dine_in'
                  ? 'bg-[#E53935] text-white shadow-sm'
                  : 'text-[#9CA3AF] hover:text-white'
              }`}
            >
              🍽️ {t.posDineIn}
            </button>
            <button
              onClick={() => setOrderType('takeaway')}
              className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                orderType === 'takeaway'
                  ? 'bg-[#E53935] text-white shadow-sm'
                  : 'text-[#9CA3AF] hover:text-white'
              }`}
            >
              🛍️ {t.posTakeaway}
            </button>
            <button
              onClick={() => setOrderType('delivery')}
              className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                orderType === 'delivery'
                  ? 'bg-[#E53935] text-white shadow-sm'
                  : 'text-[#9CA3AF] hover:text-white'
              }`}
            >
              🛵 {t.posDelivery}
            </button>
          </div>

          {/* Conditional Controls based on Service Type */}
          {orderType === 'dine_in' ? (
            <div className="flex items-center gap-2 bg-[#1E1E22] px-2.5 py-1.5 rounded-lg border border-[#2D2D35]">
              <Utensils className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-xs text-[#9CA3AF]">Table :</span>
              <select
                value={selectedTableId}
                onChange={e => setSelectedTableId(e.target.value)}
                className="bg-transparent text-xs font-bold text-white focus:outline-none flex-1 cursor-pointer"
              >
                {tables.map(tbl => (
                  <option key={tbl.id} value={tbl.id} className="bg-[#1E1E22] text-white">
                    {tbl.number} ({tbl.capacity} places) — {tbl.status}
                  </option>
                ))}
              </select>
            </div>
          ) : orderType === 'delivery' ? (
            <div className="space-y-1.5 bg-[#1E1E22] p-2 rounded-lg border border-[#2D2D35] text-xs">
              <input
                type="text"
                placeholder="Nom client & Tél..."
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                className="w-full bg-[#121214] border border-[#2D2D35] rounded px-2 py-1 text-white text-xs"
              />
              <input
                type="text"
                placeholder="Adresse complète livraison..."
                value={deliveryAddress}
                onChange={e => setDeliveryAddress(e.target.value)}
                className="w-full bg-[#121214] border border-[#2D2D35] rounded px-2 py-1 text-white text-xs"
              />
            </div>
          ) : (
            <input
              type="text"
              placeholder="Nom ou bip de commande à emporter..."
              value={customerName}
              onChange={e => setCustomerName(e.target.value)}
              className="w-full bg-[#1E1E22] border border-[#2D2D35] rounded-lg px-2.5 py-1.5 text-xs text-white"
            />
          )}
        </div>

        {/* Ticket Items List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-[#9CA3AF] text-center p-4">
              <Utensils className="w-10 h-10 text-[#2D2D35] mb-2" />
              <p className="text-xs font-bold">{t.posCartEmpty}</p>
              <p className="text-[11px] text-[#6B7280] mt-1">{t.posAddItemsHint}</p>
            </div>
          ) : (
            cartItems.map(item => (
              <div
                key={item.id}
                className="p-2.5 rounded-xl bg-[#1E1E22] border border-[#2D2D35] flex items-start justify-between gap-2 text-xs"
              >
                <div className="flex-1">
                  <div className="font-bold text-white">{item.productName}</div>
                  {item.selectedVariation && (
                    <div className="text-[10px] text-amber-400 font-semibold">
                      [{item.selectedVariation.name}]
                    </div>
                  )}
                  {item.selectedExtras?.map((e, idx) => (
                    <div key={idx} className="text-[10px] text-[#9CA3AF]">
                      + {e.name} ({e.price} DA)
                    </div>
                  ))}
                  {item.notes && (
                    <div className="text-[10px] text-gray-400 italic">"{item.notes}"</div>
                  )}
                  <div className="text-xs font-mono font-bold text-emerald-400 mt-1">
                    {formatDA(item.subtotal, language === 'ar')}
                  </div>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-1 bg-[#121214] p-1 rounded-lg border border-[#2D2D35]">
                  <button
                    onClick={() => updateQuantity(item.id, -1)}
                    className="w-5 h-5 rounded bg-[#2A2A30] hover:bg-[#34343C] flex items-center justify-center text-white"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-6 text-center font-bold text-xs text-white">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, 1)}
                    className="w-5 h-5 rounded bg-[#2A2A30] hover:bg-[#34343C] flex items-center justify-center text-white"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="w-5 h-5 rounded hover:bg-red-950/60 text-[#9CA3AF] hover:text-red-400 flex items-center justify-center ml-0.5"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Calculations & Discounts */}
        <div className="p-3 bg-[#1A1A1E] border-t border-[#2D2D35] space-y-1.5 text-xs">
          <div className="flex items-center justify-between text-[#9CA3AF]">
            <span>{t.posSubtotal}</span>
            <span className="font-mono text-white">{formatDA(totals.subtotal, language === 'ar')}</span>
          </div>

          {/* Quick Discount Picker */}
          <div className="flex items-center justify-between text-[#9CA3AF]">
            <span className="flex items-center gap-1">
              <Percent className="w-3 h-3 text-red-400" />
              {t.posDiscount}
            </span>
            <div className="flex gap-1">
              {[0, 5, 10, 15].map(pct => (
                <button
                  key={pct}
                  onClick={() => setDiscountPercent(pct)}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    discountPercent === pct
                      ? 'bg-red-600 text-white'
                      : 'bg-[#2A2A30] text-[#9CA3AF] hover:text-white'
                  }`}
                >
                  {pct}%
                </button>
              ))}
            </div>
          </div>

          {totals.discountAmount > 0 && (
            <div className="flex items-center justify-between text-red-400 font-semibold">
              <span>Remise déduite</span>
              <span>-{formatDA(totals.discountAmount, language === 'ar')}</span>
            </div>
          )}

          {enableTax && (
            <div className="flex items-center justify-between text-[#9CA3AF] text-[11px]">
              <span>TVA ({taxRate}%)</span>
              <span className="font-mono">{formatDA(totals.taxAmount, language === 'ar')}</span>
            </div>
          )}

          {orderType === 'delivery' && (
            <div className="flex items-center justify-between text-[#9CA3AF]">
              <span>{t.posDeliveryFee}</span>
              <span className="font-mono text-white">{formatDA(totals.deliveryFee, language === 'ar')}</span>
            </div>
          )}

          <div className="pt-2 border-t border-[#2D2D35] flex items-center justify-between text-base font-black text-white">
            <span>{t.posTotal}</span>
            <span className="text-[#E53935] font-mono text-lg">{formatDA(totals.total, language === 'ar')}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-3 bg-[#161618] border-t border-[#2D2D35] space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={holdTicket}
              disabled={cartItems.length === 0}
              className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[#2A2A30] hover:bg-[#34343C] text-xs font-bold text-amber-300 disabled:opacity-40 transition-colors"
            >
              <Pause className="w-3.5 h-3.5" />
              {t.posHoldOrder}
            </button>
            <button
              onClick={handleSendToKitchenOnly}
              disabled={cartItems.length === 0}
              className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white disabled:opacity-40 shadow-sm transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              {t.posSendKitchen}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => openPaymentModal('qr_wallet')}
              disabled={cartItems.length === 0}
              className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white font-bold text-xs shadow-md shadow-amber-950/40 disabled:opacity-40 transition-all active:scale-[0.98]"
              title="Générer QR code dynamique pour BaridiMob / Wimpay"
            >
              <QrCode className="w-4 h-4" />
              <span>{language === 'ar' ? 'دفع عبر QR' : 'QR Wallet Pay'}</span>
            </button>
            <button
              onClick={() => openPaymentModal('cash')}
              disabled={cartItems.length === 0}
              className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-gradient-to-r from-[#E53935] to-[#D32F2F] hover:from-[#D32F2F] hover:to-[#B71C1C] text-white font-black text-xs shadow-md shadow-red-950/40 disabled:opacity-40 transition-all active:scale-[0.98]"
            >
              <Banknote className="w-4 h-4" />
              <span>{t.posPayNow}</span>
            </button>
          </div>
        </div>
      </div>

      {/* PRODUCT CUSTOMIZATION MODAL */}
      {customizingProduct && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1E1E22] border border-[#2D2D35] w-full max-w-md rounded-2xl p-5 space-y-4 text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#2D2D35] pb-3">
              <div>
                <h3 className="font-bold text-base text-white">{customizingProduct.name}</h3>
                <p className="text-xs text-[#9CA3AF]">{customizingProduct.description}</p>
              </div>
              <button
                onClick={() => setCustomizingProduct(null)}
                className="p-1 rounded-lg text-[#9CA3AF] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Variations */}
            {customizingProduct.variations?.length > 0 && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#9CA3AF] uppercase">Format / Déclinaison</label>
                <div className="grid grid-cols-2 gap-2">
                  {customizingProduct.variations.map(v => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setCustomVariation(v)}
                      className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                        customVariation?.id === v.id
                          ? 'bg-[#E53935]/20 border-[#E53935] text-white'
                          : 'bg-[#161618] border-[#2D2D35] text-[#9CA3AF] hover:text-white'
                      }`}
                    >
                      <div className="font-bold">{v.name}</div>
                      <div className="text-[10px] text-amber-400">
                        {v.priceDelta > 0 ? `+${v.priceDelta} DA` : v.priceDelta < 0 ? `${v.priceDelta} DA` : 'Inclus'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Extras */}
            {customizingProduct.extras?.length > 0 && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#9CA3AF] uppercase">Suppléments & Options</label>
                <div className="grid grid-cols-2 gap-2">
                  {customizingProduct.extras.map(extra => {
                    const isSelected = customExtras.some(e => e.id === extra.id);
                    return (
                      <button
                        key={extra.id}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setCustomExtras(prev => prev.filter(e => e.id !== extra.id));
                          } else {
                            setCustomExtras(prev => [...prev, extra]);
                          }
                        }}
                        className={`p-2 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-emerald-950/40 border-emerald-600 text-emerald-300'
                            : 'bg-[#161618] border-[#2D2D35] text-[#9CA3AF] hover:text-white'
                        }`}
                      >
                        <span>{extra.name}</span>
                        <span className="font-bold text-[10px]">+{extra.price} DA</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Kitchen Notes */}
            <div>
              <label className="text-xs font-bold text-[#9CA3AF] uppercase mb-1 block">Remarques Cuisine</label>
              <input
                type="text"
                value={customNotes}
                onChange={e => setCustomNotes(e.target.value)}
                placeholder="ex: Sans oignons, bien cuit, sauce à part..."
                className="w-full bg-[#161618] border border-[#2D2D35] rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>

            <button
              onClick={() =>
                addToCartDirect(customizingProduct, customVariation, customExtras, customNotes)
              }
              className="w-full py-2.5 rounded-xl bg-[#E53935] hover:bg-[#D32F2F] text-white font-bold text-xs shadow-lg transition-colors"
            >
              Ajouter au Ticket
            </button>
          </div>
        </div>
      )}

      {/* PAYMENT & CHECKOUT MODAL */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1E1E22] border border-[#2D2D35] w-full max-w-lg rounded-2xl p-5 space-y-4 text-white shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#2D2D35] pb-3">
              <h3 className="font-black text-base text-white">Règlement de la Commande</h3>
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="p-1 rounded-lg text-[#9CA3AF] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-center py-2 bg-[#161618] rounded-xl border border-[#2D2D35]">
              <span className="text-xs text-[#9CA3AF]">Montant Total Dû</span>
              <div className="text-2xl font-black text-[#E53935]">
                {formatDA(totals.total, language === 'ar')}
              </div>
            </div>

            {/* Payment Method Switcher */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'cash', label: 'Espèces', icon: <Banknote className="w-4 h-4" /> },
                { id: 'card', label: 'CIB / Edahabia', icon: <CreditCard className="w-4 h-4" /> },
                { id: 'qr_wallet', label: 'QR Mobile', icon: <QrCode className="w-4 h-4 text-amber-400" /> },
                { id: 'mixed', label: 'Mixte', icon: <Percent className="w-4 h-4" /> },
              ].map(m => (
                <button
                  key={m.id}
                  onClick={() => setPaymentMethod(m.id as any)}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-bold transition-all ${
                    paymentMethod === m.id
                      ? 'bg-[#E53935] text-white border-[#E53935] shadow-md shadow-red-950/40'
                      : 'bg-[#161618] border-[#2D2D35] text-[#9CA3AF] hover:text-white'
                  }`}
                >
                  {m.icon}
                  <span className="mt-1 text-[11px] text-center leading-tight">{m.label}</span>
                </button>
              ))}
            </div>

            {/* QR Mobile Wallet Payment View */}
            {paymentMethod === 'qr_wallet' && (
              <QRWalletDisplay
                amount={totals.total}
                merchantId={currentTenant.id}
                merchantName={currentTenant.name}
                branchId={currentBranch?.id || ''}
                branchName={currentBranch?.name || ''}
                orderType={orderType}
                tableNumber={tables.find(t => t.id === selectedTableId)?.number}
                language={language}
                onPaymentSuccess={handleQRSuccess}
              />
            )}

            {/* Card TPE View */}
            {paymentMethod === 'card' && (
              <div className="p-4 rounded-xl bg-[#161618] border border-[#2D2D35] text-center space-y-2">
                <div className="w-10 h-10 mx-auto rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div className="text-xs font-bold text-white">
                  Terminal TPE Satim / GIE Monétique Connecté
                </div>
                <p className="text-[11px] text-[#9CA3AF]">
                  Insérez ou présentez la carte CIB ou Edahabia du client sur le lecteur TPE.
                </p>
              </div>
            )}

            {/* Cash Calculations */}
            {paymentMethod === 'cash' && (
              <div className="space-y-3 bg-[#161618] p-3 rounded-xl border border-[#2D2D35]">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#9CA3AF]">Espèces remises par le client :</span>
                  <input
                    type="number"
                    value={tenderedCash}
                    onChange={e => setTenderedCash(Number(e.target.value))}
                    className="w-28 bg-[#1E1E22] border border-[#2D2D35] rounded-lg px-2 py-1 text-right font-mono font-bold text-white"
                  />
                </div>

                {/* Quick bill denominations */}
                <div className="flex gap-1.5 justify-end">
                  {[1000, 2000, 5000].map(bill => (
                    <button
                      key={bill}
                      type="button"
                      onClick={() => setTenderedCash(bill)}
                      className="px-2 py-1 bg-[#2A2A30] hover:bg-[#34343C] rounded text-xs font-mono font-bold text-white"
                    >
                      {bill} DA
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setTenderedCash(totals.total)}
                    className="px-2 py-1 bg-[#E53935]/20 text-[#E53935] hover:bg-[#E53935]/40 rounded text-xs font-mono font-bold"
                  >
                    Exact
                  </button>
                </div>

                <div className="flex justify-between items-center text-sm font-bold pt-2 border-t border-[#2D2D35]">
                  <span>Monnaie à rendre :</span>
                  <span
                    className={`font-mono ${
                      tenderedCash - totals.total < 0 ? 'text-red-400' : 'text-emerald-400'
                    }`}
                  >
                    {formatDA(Math.max(0, tenderedCash - totals.total), language === 'ar')}
                  </span>
                </div>
              </div>
            )}

            {paymentMethod !== 'qr_wallet' && (
              <button
                onClick={handleCompletePayment}
                disabled={paymentMethod === 'cash' && tenderedCash < totals.total}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-black text-sm shadow-lg shadow-emerald-950/40 transition-colors"
              >
                Valider l'Encaissement & Imprimer Ticket
              </button>
            )}
          </div>
        </div>
      )}

      {/* COMPLETED ORDER RECEIPT MODAL */}
      {completedOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1E1E22] border border-[#2D2D35] w-full max-w-sm rounded-2xl p-5 space-y-4 text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#2D2D35] pb-2">
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle className="w-5 h-5" />
                <span className="font-bold text-sm">Commande Encaissée !</span>
              </div>
              <button
                onClick={() => setCompletedOrder(null)}
                className="p-1 rounded-lg text-[#9CA3AF] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printable Receipt Preview */}
            <div className="max-h-[60vh] overflow-y-auto bg-gray-100 p-2 rounded-xl">
              <PrintableReceipt order={completedOrder} tenant={currentTenant} />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => window.print()}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#E53935] hover:bg-[#D32F2F] text-white font-bold text-xs shadow-md transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimer Reçu</span>
              </button>
              <button
                onClick={() => setCompletedOrder(null)}
                className="px-4 py-2.5 rounded-xl bg-[#2A2A30] hover:bg-[#34343C] text-white font-bold text-xs"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
