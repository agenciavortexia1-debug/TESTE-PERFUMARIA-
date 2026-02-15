
import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  UserPlus, 
  Search, 
  Minus, 
  Plus,
  CheckCircle2,
  X,
  Package,
  Sparkles,
  ChevronUp
} from 'lucide-react';
import { DB } from '../services/db.ts';
import { Product, Customer, Sale, PaymentMethod, PaymentStatus, Installment, SaleItem } from '../types.ts';

const Sales: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [installments, setInstallments] = useState(1);
  const [searchProduct, setSearchProduct] = useState('');
  const [searchCustomer, setSearchCustomer] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isCartOpenMobile, setIsCartOpenMobile] = useState(false);

  useEffect(() => {
    setProducts(DB.getProducts());
    setCustomers(DB.getCustomers());
  }, []);

  const addToCart = (product: Product) => {
    const existing = cart.find(i => i.productId === product.id);
    if (existing) {
      if (existing.quantity >= product.stock) return alert('Estoque insuficiente');
      setCart(cart.map(i => i.productId === product.id ? { ...i, quantity: i.quantity + 1, total: (i.quantity + 1) * i.unitPrice } : i));
    } else {
      if (product.stock <= 0) return alert('Estoque insuficiente');
      setCart([...cart, { productId: product.id, productName: product.name, quantity: 1, unitPrice: product.price, total: product.price }]);
    }
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(cart.map(i => {
      if (i.productId === productId) {
        const product = products.find(p => p.id === productId);
        const newQty = Math.max(0, i.quantity + delta);
        if (product && newQty > product.stock) return i;
        return newQty === 0 ? null : { ...i, quantity: newQty, total: newQty * i.unitPrice };
      }
      return i;
    }).filter(Boolean) as SaleItem[]);
  };

  const total = cart.reduce((acc, i) => acc + i.total, 0);

  const handleCheckout = () => {
    if (!selectedCustomer) return alert('Selecione um cliente');
    if (cart.length === 0) return alert('Carrinho vazio');

    const saleId = Math.random().toString(36).substr(2, 9);
    const sale: Sale = {
      id: saleId,
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
      items: cart,
      total: total,
      paymentMethod: paymentMethod,
      installmentsCount: installments,
      date: new Date().toISOString()
    };

    const newInstallments: Installment[] = [];
    if (paymentMethod === PaymentMethod.INSTALLMENTS) {
      const amountPerInst = total / installments;
      for (let i = 1; i <= installments; i++) {
        const dueDate = new Date();
        dueDate.setMonth(dueDate.getMonth() + i);
        newInstallments.push({
          id: Math.random().toString(36).substr(2, 9),
          saleId,
          number: i,
          amount: amountPerInst,
          dueDate: dueDate.toISOString(),
          status: PaymentStatus.PENDING
        });
      }
    }

    DB.addSale(sale, newInstallments);
    setIsSuccess(true);
    setCart([]);
    setSelectedCustomer(null);
    setPaymentMethod(PaymentMethod.CASH);
    setInstallments(1);
    setProducts(DB.getProducts());
    setIsCartOpenMobile(false);
  };

  const filteredProducts = searchProduct.length > 0 
    ? products.filter(p => 
        p.name.toLowerCase().includes(searchProduct.toLowerCase()) || 
        p.brand.toLowerCase().includes(searchProduct.toLowerCase())
      )
    : [];

  const filteredCustomers = searchCustomer.length > 0 
    ? customers.filter(c => 
        c.name.toLowerCase().includes(searchCustomer.toLowerCase()) ||
        c.cpf.includes(searchCustomer)
      )
    : [];

  return (
    <div className="flex flex-col gap-4 pb-24 lg:pb-0 lg:grid lg:grid-cols-12 lg:items-start animate-in fade-in duration-300">
      
      {/* Search & Results Section */}
      <div className="lg:col-span-8 space-y-3">
        {/* Compact Search Bars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input 
              className="w-full pl-8 pr-3 py-2.5 border dark:border-slate-800 dark:bg-slate-900 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all focus:ring-1 focus:ring-indigo-500 bg-white dark:text-white"
              placeholder="FRAGRÂNCIA..." 
              value={searchProduct}
              onChange={e => setSearchProduct(e.target.value)}
            />
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input 
              className="w-full pl-8 pr-3 py-2.5 border dark:border-slate-800 dark:bg-slate-900 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all focus:ring-1 focus:ring-indigo-500 bg-white dark:text-white"
              placeholder="CLIENTE..." 
              value={searchCustomer}
              onChange={e => setSearchCustomer(e.target.value)}
            />
          </div>
        </div>

        {/* Customer Selection Info */}
        {(filteredCustomers.length > 0 || selectedCustomer) && (
          <div className="bg-slate-50 dark:bg-slate-900/50 p-2 rounded border dark:border-slate-800 flex flex-wrap gap-1.5">
            {selectedCustomer ? (
              <div className="flex items-center gap-2 bg-indigo-600 text-white px-3 py-1.5 rounded text-[9px] font-black uppercase tracking-widest shadow-md">
                <UserPlus size={12} />
                {selectedCustomer.name}
                <button onClick={() => {setSelectedCustomer(null); setSearchCustomer('');}} className="ml-1 hover:text-rose-200"><X size={12} /></button>
              </div>
            ) : (
              filteredCustomers.map(c => (
                <button 
                  key={c.id} 
                  onClick={() => {setSelectedCustomer(c); setSearchCustomer('');}}
                  className="px-3 py-1.5 rounded bg-white dark:bg-slate-800 border dark:border-slate-700 hover:border-indigo-500 text-slate-600 dark:text-slate-300 text-[9px] font-black uppercase tracking-widest transition-all"
                >
                  {c.name}
                </button>
              ))
            )}
          </div>
        )}

        {/* Product Results Grid */}
        <div className="min-h-[200px]">
          {searchProduct.length === 0 && !selectedCustomer && cart.length === 0 ? (
            /* Oculto em dispositivos móveis conforme solicitado (hidden md:flex) */
            <div className="hidden md:flex py-12 flex-col items-center justify-center bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg text-center">
              <Sparkles size={24} className="text-slate-300 mb-3" />
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Aguardando busca de produtos...</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2">
              {filteredProducts.map(p => (
                <button 
                  key={p.id} 
                  disabled={p.stock <= 0}
                  onClick={() => addToCart(p)}
                  className={`flex flex-col p-3 rounded-md border dark:border-slate-800 bg-white dark:bg-slate-900 text-left transition-all hover:border-indigo-500 ${p.stock <= 0 ? 'opacity-40 grayscale' : 'shadow-sm active:scale-95'}`}
                >
                  <h4 className="font-black text-slate-800 dark:text-slate-100 text-[10px] truncate uppercase mb-0.5">{p.name}</h4>
                  <p className="text-[8px] text-slate-400 mb-2 uppercase font-bold truncate">{p.brand} · {p.ml}ML</p>
                  <div className="mt-auto flex items-center justify-between">
                    <span className="text-indigo-600 dark:text-indigo-400 font-black text-[10px]">R$ {p.price.toFixed(0)}</span>
                    <div className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 p-1 rounded">
                      <Plus size={12} />
                    </div>
                  </div>
                </button>
              ))}
              {searchProduct.length > 0 && filteredProducts.length === 0 && (
                <div className="col-span-full py-8 text-center text-slate-400">
                  <Package size={20} className="mx-auto mb-1 opacity-20" />
                  <p className="text-[9px] font-bold uppercase tracking-widest">Nada encontrado</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Cart Sidebar (Desktop) / Modal (Mobile) */}
      <div className={`
        lg:col-span-4 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col 
        fixed inset-x-0 bottom-0 z-[70] h-[80vh] transition-transform duration-300 transform
        lg:relative lg:translate-y-0 lg:h-[calc(100vh-140px)] lg:sticky lg:top-6
        ${isCartOpenMobile ? 'translate-y-0' : 'translate-y-full lg:translate-y-0'}
      `}>
        {/* Cart Header */}
        <div className="p-3 border-b dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 rounded-t-lg">
          <h2 className="text-[10px] font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest flex items-center gap-2">
            <ShoppingCart size={14} />
            CONFERÊNCIA
          </h2>
          <button onClick={() => setIsCartOpenMobile(false)} className="lg:hidden p-1 text-slate-400"><X size={20} /></button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {cart.map(item => (
            <div key={item.productId} className="flex gap-2 items-center border-b dark:border-slate-800 pb-2 last:border-0">
              <div className="flex-1 min-w-0">
                <h5 className="text-[10px] font-black text-slate-800 dark:text-slate-200 truncate uppercase">{item.productName}</h5>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 rounded px-1 py-0.5">
                    <button onClick={() => updateQuantity(item.productId, -1)} className="p-0.5 hover:text-indigo-600"><Minus size={10} /></button>
                    <span className="text-[10px] font-black w-4 text-center dark:text-white">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.productId, 1)} className="p-0.5 hover:text-indigo-600"><Plus size={10} /></button>
                  </div>
                  <span className="text-[8px] font-black text-slate-400">R$ {item.unitPrice.toFixed(0)}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] font-black text-slate-900 dark:text-white">R$ {item.total.toFixed(0)}</div>
                <button onClick={() => updateQuantity(item.productId, -item.quantity)} className="text-rose-500 text-[8px] uppercase font-black mt-1">REMOVER</button>
              </div>
            </div>
          ))}
          {cart.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-slate-300 py-12">
              <ShoppingCart size={32} strokeWidth={1} />
              <p className="text-[8px] font-black uppercase tracking-widest mt-2">Vazio</p>
            </div>
          )}
        </div>

        {/* Checkout Controls */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/30 border-t dark:border-slate-800 space-y-3">
          <div className="grid grid-cols-2 gap-1">
            {[
              { id: PaymentMethod.CASH, label: 'DINHEIRO' },
              { id: PaymentMethod.PIX, label: 'PIX' },
              { id: PaymentMethod.CREDIT_CARD, label: 'CARTÃO' },
              { id: PaymentMethod.INSTALLMENTS, label: 'PARCELAS' },
            ].map(method => (
              <button 
                key={method.id}
                onClick={() => setPaymentMethod(method.id as PaymentMethod)}
                className={`py-2 rounded text-[8px] font-black uppercase border transition-all ${paymentMethod === method.id ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-800'}`}
              >
                {method.label}
              </button>
            ))}
          </div>

          {paymentMethod === PaymentMethod.INSTALLMENTS && (
            <select 
              value={installments} 
              onChange={e => setInstallments(Number(e.target.value))}
              className="w-full p-2 rounded border dark:border-slate-800 bg-white dark:bg-slate-900 text-[10px] font-black uppercase dark:text-white outline-none"
            >
              {[2,3,4,5,6,10,12].map(n => <option key={n} value={n}>{n}x de R$ {(total/n).toFixed(2)}</option>)}
            </select>
          )}

          <div className="flex items-center justify-between py-2 border-t border-dashed dark:border-slate-700">
            <span className="text-[9px] font-black uppercase text-slate-400">TOTAL</span>
            <span className="text-lg font-black text-slate-900 dark:text-white tracking-tighter">R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </div>

          <button 
            disabled={cart.length === 0 || !selectedCustomer}
            onClick={handleCheckout}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-30 text-white rounded font-black uppercase text-[10px] tracking-[0.2em] shadow-lg active:scale-95 transition-all"
          >
            FINALIZAR VENDA
          </button>
        </div>
      </div>

      {/* Floating Bottom Bar (Mobile Only) */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 bg-white dark:bg-slate-900 border-t dark:border-slate-800 p-3 flex items-center justify-between z-[60] shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        <div className="flex flex-col">
          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">ITENS: {cart.length}</span>
          <span className="text-sm font-black text-slate-900 dark:text-white">R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
        </div>
        <button 
          onClick={() => setIsCartOpenMobile(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-md text-[10px] font-black uppercase tracking-widest shadow-xl active:scale-95"
        >
          REVISAR E PAGAR
          <ChevronUp size={14} />
        </button>
      </div>

      {/* Success Modal */}
      {isSuccess && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4">
          <div className="text-center text-white animate-in zoom-in duration-300">
            <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl">
              <CheckCircle2 size={32} />
            </div>
            <h2 className="text-xl font-black uppercase italic mb-1">CONCLUÍDO</h2>
            <p className="text-slate-400 text-[9px] font-black uppercase mb-8">Venda registrada com sucesso.</p>
            <button 
              onClick={() => setIsSuccess(false)}
              className="w-full bg-white text-indigo-950 px-8 py-3 rounded font-black uppercase text-[10px] tracking-widest hover:bg-indigo-50"
            >
              PRÓXIMA VENDA
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sales;
