import React, { useState, useMemo } from 'react';
import { Product, TransactionItem, Transaction } from '../types';
import { formatIDR } from '../store';
import { Search, Plus, Minus, Trash2, ShoppingCart, X, History, FileText } from 'lucide-react';

interface SalesProps {
  products: Product[];
  transactions: Transaction[];
  onCheckout: (items: TransactionItem[], total: number, date?: string) => void;
  onCancelTransaction: (id: string) => void;
}

export default function Sales({ products, transactions, onCheckout, onCancelTransaction }: SalesProps) {
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<TransactionItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [transactionDate, setTransactionDate] = useState(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  });

  const getLocalDatetime = (dateString?: string) => {
    const d = dateString ? new Date(dateString) : new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => 
      p.name.toLowerCase().includes(search.toLowerCase()) || 
      p.sku.toLowerCase().includes(search.toLowerCase())
    );
  }, [products, search]);

  const recentSales = useMemo(() => {
    return transactions.filter(t => t.type === 'SALE').slice(0, 50);
  }, [transactions]);

  const getProductCartQty = (productId: string) => {
    return cart.find(item => item.productId === productId)?.quantity || 0;
  };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev; // Cannot exceed stock
        return prev.map(item => 
          item.productId === product.id 
            ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.price }
            : item
        );
      }
      return [...prev, { productId: product.id, name: product.name, quantity: 1, price: product.sellingPrice, subtotal: product.sellingPrice }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.productId === productId) {
          const product = products.find(p => p.id === productId);
          const newQty = item.quantity + delta;
          if (newQty <= 0) return item; // Handled by remove
          if (product && newQty > product.stock) return item; // Exceeds stock
          return { ...item, quantity: newQty, subtotal: newQty * item.price };
        }
        return item;
      });
    });
  };

  const setQuantityDirectly = (productId: string, quantity: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.productId === productId) {
          const product = products.find(p => p.id === productId);
          let newQty = quantity;
          if (newQty <= 0) newQty = 1;
          if (product && newQty > product.stock) newQty = product.stock;
          return { ...item, quantity: newQty, subtotal: newQty * item.price };
        }
        return item;
      });
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const total = cart.reduce((sum, item) => sum + item.subtotal, 0);

  const handleCheckout = () => {
    if (cart.length === 0) return;
    onCheckout(cart, total, new Date(transactionDate).toISOString());
    setCart([]);
    setIsCartOpen(false);
    
    // Reset date to now
    setTransactionDate(getLocalDatetime());
    
    alert('Transaksi berhasil disimpan!');
  };

  return (
    <div className="h-auto md:h-[calc(100vh-2rem)] flex flex-col md:flex-row gap-6 relative">
      {/* Product List */}
      <div className="flex-1 bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden flex flex-col min-h-[400px] mb-20 md:mb-0">
        <div className="p-4 md:p-6 border-b border-white/10 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex bg-white/5 border border-white/10 p-1 rounded-lg w-full md:w-auto">
            <button 
              onClick={() => setIsHistoryOpen(false)}
              className={`flex-1 md:flex-none px-6 py-2 rounded-md font-bold text-sm transition-colors ${!isHistoryOpen ? 'bg-emerald-500 text-black shadow-sm' : 'text-slate-400 hover:text-white'}`}
            >
              Katalog
            </button>
            <button 
              onClick={() => setIsHistoryOpen(true)}
              className={`flex-1 md:flex-none px-6 py-2 rounded-md font-bold text-sm transition-colors flex items-center justify-center gap-2 ${isHistoryOpen ? 'bg-emerald-500 text-black shadow-sm' : 'text-slate-400 hover:text-white'}`}
            >
              <History className="w-4 h-4" /> Riwayat
            </button>
          </div>
          
          {!isHistoryOpen && (
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input 
                type="text" 
                placeholder="Cari produk atau SKU..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-emerald-500 text-white placeholder-slate-400"
              />
            </div>
          )}
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-24 md:pb-6">
          {!isHistoryOpen ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProducts.map(product => {
                const cartQty = getProductCartQty(product.id);
                return (
                  <button
                    key={product.id}
                    onClick={() => addToCart(product)}
                    disabled={product.stock === 0}
                    className="flex flex-col text-left p-4 rounded-xl border border-white/10 bg-white/5 hover:border-emerald-500 hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
                  >
                    {cartQty > 0 && (
                      <div className="absolute top-2 right-2 bg-emerald-500 text-black text-[10px] font-bold px-2 py-1 rounded-full z-10">
                        {cartQty}x
                      </div>
                    )}
                    {cartQty > 0 && (
                      <div className="absolute inset-0 bg-emerald-500/5 pointer-events-none"></div>
                    )}
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1">{product.category}</span>
                    <span className="font-semibold text-white line-clamp-2 mb-2 group-hover:text-emerald-400 transition-colors">{product.name}</span>
                    <div className="mt-auto pt-4 flex flex-col md:flex-row md:justify-between md:items-end w-full gap-2">
                      <span className="font-bold text-white text-sm md:text-base">{formatIDR(product.sellingPrice)}</span>
                      <span className={`text-[10px] px-2 py-1 rounded-md font-medium w-fit ${product.stock > 5 ? 'bg-white/10 text-slate-300' : 'bg-rose-500/20 text-rose-400'}`}>
                        Stok: {product.stock}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="space-y-4">
              {recentSales.length === 0 ? (
                <div className="text-center text-slate-400 py-10">Belum ada riwayat transaksi.</div>
              ) : (
                recentSales.map(trx => (
                  <div key={trx.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <FileText className="w-4 h-4 text-emerald-400" />
                        <span className="font-bold text-white text-sm">{trx.id}</span>
                        <span className="text-xs text-slate-400">&bull; {new Date(trx.date).toLocaleString('id-ID')}</span>
                      </div>
                      <p className="text-xs text-slate-400 mb-2">{trx.items.length} item terjual</p>
                      <div className="flex flex-wrap gap-2">
                        {trx.items.map(item => (
                          <span key={item.productId} className="text-[10px] px-2 py-1 bg-white/10 rounded-md text-slate-300">
                            {item.name} ({item.quantity}x)
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t border-white/10 md:border-0">
                      <div className="text-right">
                        <p className="text-[10px] text-slate-400 uppercase font-semibold">Total</p>
                        <p className="font-bold text-emerald-400">{formatIDR(trx.total)}</p>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            if (window.confirm('Edit transaksi ini? Stok akan dikembalikan sementara ke inventaris sampai Anda menyimpannya ulang.')) {
                              onCancelTransaction(trx.id);
                              setCart([...trx.items]);
                              setTransactionDate(getLocalDatetime(trx.date));
                              setIsHistoryOpen(false);
                              setIsCartOpen(true);
                            }
                          }}
                          className="p-2 text-amber-400 hover:bg-amber-500/20 rounded-lg transition-colors border border-amber-500/20"
                          title="Edit Transaksi"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button 
                          onClick={() => {
                            if (window.confirm('Batalkan transaksi ini dan kembalikan stok?')) {
                              onCancelTransaction(trx.id);
                            }
                          }}
                          className="p-2 text-rose-400 hover:bg-rose-500/20 rounded-lg transition-colors border border-rose-500/20"
                          title="Batalkan Transaksi (Hapus)"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Floating Mobile Cart Button */}
      {cart.length > 0 && !isCartOpen && (
        <div className="md:hidden fixed bottom-6 left-4 right-4 z-40">
          <button 
            onClick={() => setIsCartOpen(true)}
            className="w-full bg-emerald-500 text-black p-4 rounded-xl font-bold flex justify-between items-center shadow-[0_8px_30px_rgb(0,0,0,0.5)] border border-emerald-400/50"
          >
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              <span>{totalItems} Item</span>
            </div>
            <span>{formatIDR(total)}</span>
          </button>
        </div>
      )}

      {/* Mobile Cart Overlay */}
      {isCartOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setIsCartOpen(false)}
        />
      )}

      {/* Shopping Cart Sidebar / Bottom Sheet */}
      <div className={`
        fixed inset-x-0 bottom-0 z-50 transform transition-transform duration-300 ease-in-out h-[80vh] md:h-auto
        md:static md:w-96 bg-gray-900 md:bg-white/10 md:backdrop-blur-xl border-t md:border border-white/10 rounded-t-3xl md:rounded-2xl flex flex-col md:min-h-[400px]
        ${isCartOpen ? 'translate-y-0' : 'translate-y-full md:translate-y-0'}
      `}>
        <div className="p-4 md:p-6 border-b border-white/10 flex justify-between items-center">
          <h2 className="font-bold text-white flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-emerald-400" />
            Keranjang Belanja
          </h2>
          <button 
            className="md:hidden p-2 text-slate-400 hover:text-white"
            onClick={() => setIsCartOpen(false)}
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          <div className="space-y-1 mb-2">
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Tanggal Transaksi</label>
            <input 
              type="datetime-local" 
              className="w-full bg-black/50 border border-white/10 text-white rounded-lg p-2 focus:border-emerald-500 outline-none text-sm"
              value={transactionDate}
              onChange={(e) => setTransactionDate(e.target.value)}
            />
          </div>
          {cart.length === 0 ? (
            <div className="text-center text-slate-400 py-10">
              Keranjang masih kosong
            </div>
          ) : (
            cart.map(item => (
              <div key={item.productId} className="flex justify-between items-center py-4 border-b border-white/5 last:border-0">
                <div className="flex-1">
                  <h4 className="font-medium text-white text-sm">{item.name}</h4>
                  <p className="text-slate-400 text-xs mt-1">{formatIDR(item.price)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-white/10 bg-white/5 rounded-lg overflow-hidden">
                    <button onClick={() => updateQuantity(item.productId, -1)} disabled={item.quantity <= 1} className="p-1.5 md:p-2 text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-50">
                      <Minus className="w-3 h-3" />
                    </button>
                    <input 
                      type="number" 
                      value={item.quantity === 0 ? '' : item.quantity} 
                      onChange={(e) => setQuantityDirectly(item.productId, parseInt(e.target.value) || 0)}
                      className="w-8 md:w-10 text-center text-sm font-medium text-white bg-transparent border-none focus:outline-none focus:ring-0 appearance-none m-0 p-0"
                    />
                    <button onClick={() => updateQuantity(item.productId, 1)} className="p-1.5 md:p-2 text-slate-400 hover:text-white hover:bg-white/10">
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <button onClick={() => removeFromCart(item.productId)} className="text-rose-400 hover:bg-rose-500/20 p-2 rounded-md transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="p-4 md:p-6 border-t border-white/10 bg-gray-900 md:bg-transparent rounded-b-2xl space-y-4">
          <div className="flex justify-between items-end">
            <span className="text-slate-400 text-[10px] font-semibold uppercase">Total Tagihan</span>
            <span className="text-2xl font-bold text-emerald-400">{formatIDR(total)}</span>
          </div>
          <button 
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-white/10 disabled:text-white/30 disabled:cursor-not-allowed text-black font-bold py-3 md:py-4 rounded-lg transition-colors uppercase tracking-wide text-sm"
          >
            Selesaikan Pembayaran
          </button>
        </div>
      </div>
    </div>
  );
}
