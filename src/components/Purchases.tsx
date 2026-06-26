import React, { useState, useMemo } from 'react';
import { Product, TransactionItem, Transaction } from '../types';
import { formatIDR } from '../store';
import { PackagePlus, Plus, Search, Trash2, History, FileText } from 'lucide-react';

interface PurchasesProps {
  products: Product[];
  transactions: Transaction[];
  onPurchase: (items: TransactionItem[], total: number, paymentMethod: 'tunai' | 'tempo' | 'tf', date?: string) => void;
  onCancelTransaction: (id: string) => void;
}

export default function Purchases({ products, transactions, onPurchase, onCancelTransaction }: PurchasesProps) {
  const [selectedProduct, setSelectedProduct] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [purchasePrice, setPurchasePrice] = useState(0);
  const [cart, setCart] = useState<TransactionItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'tunai' | 'tempo' | 'tf'>('tunai');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const getLocalDatetime = (dateString?: string) => {
    const d = dateString ? new Date(dateString) : new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  };

  const [transactionDate, setTransactionDate] = useState(() => getLocalDatetime());

  const recentPurchases = useMemo(() => {
    return transactions.filter(t => t.type === 'PURCHASE').slice(0, 50);
  }, [transactions]);

  const handleSelectProduct = (productId: string) => {
    setSelectedProduct(productId);
    const prod = products.find(p => p.id === productId);
    if (prod) {
      setPurchasePrice(prod.purchasePrice);
      setQuantity(1);
    }
  };

  const handleAddToList = () => {
    if (!selectedProduct || quantity <= 0 || purchasePrice <= 0) return;
    
    const prod = products.find(p => p.id === selectedProduct);
    if (!prod) return;

    const newItem: TransactionItem = {
      productId: prod.id,
      name: prod.name,
      quantity,
      price: purchasePrice,
      subtotal: quantity * purchasePrice
    };

    setCart(prev => {
      const existing = prev.findIndex(item => item.productId === prod.id);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing].quantity += quantity;
        updated[existing].subtotal = updated[existing].quantity * updated[existing].price;
        return updated;
      }
      return [...prev, newItem];
    });

    // Reset form
    setSelectedProduct('');
    setSearchTerm('');
    setQuantity(1);
    setPurchasePrice(0);
  };

  const handleRemoveItem = (productId: string) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
  };

  const total = cart.reduce((sum, item) => sum + item.subtotal, 0);

  const handleSubmit = () => {
    if (cart.length === 0) return;
    onPurchase(cart, total, paymentMethod, new Date(transactionDate).toISOString());
    setCart([]);
    setSelectedProduct('');
    setSearchTerm('');
    setPaymentMethod('tunai');
    
    // Reset date to now
    setTransactionDate(getLocalDatetime());
    
    alert('Pembelian barang berhasil dicatat! Stok bertambah.');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-500/20 text-blue-400 rounded-xl border border-blue-500/20">
            <PackagePlus className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Pembelian Stok Barang</h2>
            <p className="text-slate-400">Catat belanja barang (kulakan) untuk menambah stok.</p>
          </div>
        </div>
      </div>

      <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-4 md:p-6 border-b border-white/10 flex gap-4">
          <button 
            onClick={() => setIsHistoryOpen(false)}
            className={`px-6 py-2 rounded-md font-bold text-sm transition-colors ${!isHistoryOpen ? 'bg-blue-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
          >
            Input Barang
          </button>
          <button 
            onClick={() => setIsHistoryOpen(true)}
            className={`px-6 py-2 rounded-md font-bold text-sm transition-colors flex items-center gap-2 ${isHistoryOpen ? 'bg-blue-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
          >
            <History className="w-4 h-4" /> Riwayat Pembelian
          </button>
        </div>

        {!isHistoryOpen ? (
          <>
            <div className="p-6 border-b border-white/10 bg-white/5">
              <div className="mb-4 space-y-1">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Tanggal Transaksi</label>
                <input 
                  type="datetime-local" 
                  className="w-full md:w-auto bg-black/50 border border-white/10 text-white rounded-lg p-2.5 focus:border-blue-500 outline-none text-sm"
                  value={transactionDate}
                  onChange={(e) => setTransactionDate(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div className="md:col-span-2 space-y-1 relative">
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Pilih Produk</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="Cari produk..."
                      className="w-full bg-black/50 border border-white/10 text-white rounded-lg p-2.5 focus:border-blue-500 outline-none"
                      value={searchTerm}
                      onFocus={() => setIsDropdownOpen(true)}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setIsDropdownOpen(true);
                        if (selectedProduct) {
                          setSelectedProduct('');
                        }
                      }}
                    />
                    {isDropdownOpen && (
                      <>
                        <div 
                          className="fixed inset-0 z-10"
                          onClick={() => setIsDropdownOpen(false)}
                        />
                        <div className="absolute z-20 w-full mt-1 bg-gray-900 border border-white/10 rounded-lg max-h-60 overflow-y-auto shadow-xl">
                          {products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase())).map(p => (
                            <button
                              key={p.id}
                              className="w-full text-left px-4 py-3 border-b border-white/5 hover:bg-white/10 text-white text-sm flex justify-between items-center transition-colors"
                              onClick={() => {
                                handleSelectProduct(p.id);
                                setSearchTerm(p.name);
                                setIsDropdownOpen(false);
                              }}
                            >
                              <span className="font-medium">{p.name}</span>
                              <span className="text-slate-400 text-xs">Stok: {p.stock}</span>
                            </button>
                          ))}
                          {products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 && (
                            <div className="p-4 text-center text-slate-400 text-sm">Produk tidak ditemukan</div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Jumlah (Qty)</label>
                  <input 
                    type="number" 
                    min="1"
                    className="w-full bg-black/50 border border-white/10 text-white rounded-lg p-2.5 focus:border-blue-500 outline-none"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Harga Beli Satuan</label>
                  <input 
                    type="number" 
                    min="0"
                    className="w-full bg-black/50 border border-white/10 text-white rounded-lg p-2.5 focus:border-blue-500 outline-none"
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <button 
                  onClick={handleAddToList}
                  disabled={!selectedProduct || quantity <= 0 || purchasePrice <= 0}
                  className="flex items-center gap-2 bg-blue-500 hover:bg-blue-400 disabled:bg-white/10 disabled:text-white/30 text-white font-bold px-4 py-2.5 rounded-lg transition-colors uppercase text-sm"
                >
                  <Plus className="w-4 h-4" /> Tambah ke Daftar
                </button>
              </div>
            </div>

            <div className="p-0 overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="text-[10px] uppercase text-slate-500 border-b border-white/5">
                    <th className="px-6 py-3 font-semibold">Produk</th>
                    <th className="px-6 py-3 font-semibold text-right">Harga Beli</th>
                    <th className="px-6 py-3 font-semibold text-right">Qty</th>
                    <th className="px-6 py-3 font-semibold text-right">Subtotal</th>
                    <th className="px-6 py-3 font-semibold text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-white/5">
                  {cart.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                        Belum ada barang yang ditambahkan
                      </td>
                    </tr>
                  ) : (
                    cart.map(item => (
                      <tr key={item.productId} className="hover:bg-white/5">
                        <td className="px-6 py-4 font-medium text-white">{item.name}</td>
                        <td className="px-6 py-4 text-right text-slate-400">{formatIDR(item.price)}</td>
                        <td className="px-6 py-4 text-right text-white">{item.quantity}</td>
                        <td className="px-6 py-4 text-right font-bold text-white">{formatIDR(item.subtotal)}</td>
                        <td className="px-6 py-4 text-center">
                          <button onClick={() => handleRemoveItem(item.productId)} className="text-rose-400 hover:bg-rose-500/20 p-2 rounded-lg">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                {cart.length > 0 && (
                  <tfoot className="bg-white/5 border-t border-white/10">
                    <tr>
                      <td colSpan={3} className="px-6 py-4 text-right text-xs font-semibold text-slate-400 uppercase">Total Pembelian:</td>
                      <td className="px-6 py-4 text-right font-bold text-blue-400 text-lg">{formatIDR(total)}</td>
                      <td></td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
            
            {cart.length > 0 && (
              <div className="p-6 border-t border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                  <div className="flex flex-col gap-1 w-full md:w-auto">
                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Metode Pembayaran</label>
                    <select 
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as 'tunai' | 'tempo' | 'tf')}
                      className="bg-black/50 border border-white/10 text-white rounded-lg p-2 focus:border-blue-500 outline-none"
                    >
                      <option value="tunai">Tunai</option>
                      <option value="tempo">Tempo (Kredit)</option>
                      <option value="tf">Transfer Bank</option>
                    </select>
                  </div>
                </div>
                <button 
                  onClick={handleSubmit}
                  className="w-full md:w-auto bg-blue-500 hover:bg-blue-400 text-white px-8 py-3 rounded-lg font-bold transition-colors uppercase text-sm mt-4 md:mt-0"
                >
                  Simpan Transaksi Pembelian
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="p-6 space-y-4">
            {recentPurchases.length === 0 ? (
              <div className="text-center text-slate-400 py-10">Belum ada riwayat pembelian.</div>
            ) : (
              recentPurchases.map(trx => (
                <div key={trx.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col md:flex-row justify-between md:items-center gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className="w-4 h-4 text-blue-400" />
                      <span className="font-bold text-white text-sm">{trx.id}</span>
                      <span className="text-xs text-slate-400">&bull; {new Date(trx.date).toLocaleString('id-ID')}</span>
                      {trx.paymentMethod && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 uppercase ml-2 border border-blue-500/20">
                          {trx.paymentMethod}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mb-2">{trx.items.length} item dibeli</p>
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
                      <p className="font-bold text-blue-400">{formatIDR(trx.total)}</p>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          if (window.confirm('Edit transaksi pembelian ini? Stok akan dikurangi sementara dari inventaris sampai Anda menyimpannya ulang.')) {
                            onCancelTransaction(trx.id);
                            setCart([...trx.items]);
                            setTransactionDate(getLocalDatetime(trx.date));
                            if (trx.paymentMethod) {
                              setPaymentMethod(trx.paymentMethod);
                            }
                            setIsHistoryOpen(false);
                          }
                        }}
                        className="p-2 text-amber-400 hover:bg-amber-500/20 rounded-lg transition-colors border border-amber-500/20"
                        title="Edit Pembelian"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button 
                        onClick={() => {
                          if (window.confirm('Batalkan transaksi pembelian ini dan kurangi stok kembali?')) {
                            onCancelTransaction(trx.id);
                          }
                        }}
                        className="p-2 text-rose-400 hover:bg-rose-500/20 rounded-lg transition-colors border border-rose-500/20"
                        title="Hapus Pembelian"
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
  );
}
