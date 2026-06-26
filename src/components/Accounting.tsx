import React, { useState, useMemo } from 'react';
import { Transaction, Expense, Debt, DebtPayment } from '../types';
import { formatIDR } from '../store';
import { Calculator, Plus, TrendingUp, TrendingDown, Receipt, Trash2, Edit2, CreditCard, BarChart2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';

interface AccountingProps {
  transactions: Transaction[];
  expenses: Expense[];
  debts: Debt[];
  onAddExpense: (description: string, amount: number, category: string) => void;
  onUpdateExpense: (expense: Expense) => void;
  onDeleteExpense: (expenseId: string) => void;
  onAddDebt: (description: string, amount: number, date?: string) => void;
  onAddDebtPayment: (debtId: string, amount: number, date?: string) => void;
  onUpdateDebt: (debt: Debt) => void;
  onDeleteDebt: (debtId: string) => void;
}

export default function Accounting({ 
  transactions, 
  expenses, 
  debts, 
  onAddExpense, 
  onUpdateExpense, 
  onDeleteExpense,
  onAddDebt,
  onAddDebtPayment,
  onUpdateDebt,
  onDeleteDebt
}: AccountingProps) {
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState(0);
  const [category, setCategory] = useState('');
  const [filterType, setFilterType] = useState<'date' | 'week' | 'month' | 'year'>('month');
  const [filterValue, setFilterValue] = useState(new Date().toISOString().substring(0, 7)); // Default to current month
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'laba-rugi' | 'hutang'>('dashboard');

  const [debtDesc, setDebtDesc] = useState('');
  const [debtAmount, setDebtAmount] = useState(0);
  const [paymentAmounts, setPaymentAmounts] = useState<Record<string, number>>({});

  const isMatchFilter = (dateStr: string) => {
    if (filterType === 'week') {
      const d = new Date(dateStr);
      const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
      const dayNum = date.getUTCDay() || 7;
      date.setUTCDate(date.getUTCDate() + 4 - dayNum);
      const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
      const weekNo = Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
      const weekStr = `${date.getUTCFullYear()}-W${weekNo.toString().padStart(2, '0')}`;
      return weekStr === filterValue;
    }
    return dateStr.startsWith(filterValue);
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc || amount <= 0 || !category) return;
    
    if (editingExpense) {
      onUpdateExpense({
        ...editingExpense,
        description: desc,
        amount,
        category
      });
      setEditingExpense(null);
    } else {
      onAddExpense(desc, amount, category);
    }
    
    setDesc('');
    setAmount(0);
    setCategory('');
  };

  const handleAddDebt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!debtDesc || debtAmount <= 0) return;
    onAddDebt(debtDesc, debtAmount);
    setDebtDesc('');
    setDebtAmount(0);
  };

  const handlePayDebt = (debtId: string) => {
    const amount = paymentAmounts[debtId];
    if (!amount || amount <= 0) return;
    onAddDebtPayment(debtId, amount);
    setPaymentAmounts({ ...paymentAmounts, [debtId]: 0 });
  };
  const handleEditClick = (expense: Expense) => {
    setEditingExpense(expense);
    setDesc(expense.description);
    setAmount(expense.amount);
    setCategory(expense.category);
  };

  // Calculations based on filtered month/date/year/week
  const { totalSales, totalPurchases, totalExpenses } = useMemo(() => {
    const monthSales = transactions.filter(t => t.type === 'SALE' && isMatchFilter(t.date));
    const monthPurchases = transactions.filter(t => t.type === 'PURCHASE' && isMatchFilter(t.date));
    const monthExpenses = expenses.filter(e => isMatchFilter(e.date));

    return {
      totalSales: monthSales.reduce((sum, t) => sum + t.total, 0),
      totalPurchases: monthPurchases.reduce((sum, t) => sum + t.total, 0),
      totalExpenses: monthExpenses.reduce((sum, e) => sum + e.amount, 0)
    };
  }, [transactions, expenses, filterValue, filterType]);

  const grossProfit = totalSales - totalPurchases;
  const netProfit = grossProfit - totalExpenses;

  const chartData = useMemo(() => {
    const dataMap: Record<string, { label: string, sortKey: string, Penjualan: number, Pembelian: number, Pengeluaran: number }> = {};

    const addToMap = (dateStr: string, key: 'Penjualan' | 'Pembelian' | 'Pengeluaran', amount: number) => {
      let label = '';
      let sortKey = '';
      if (filterType === 'year') {
        label = dateStr.substring(0, 7); // YYYY-MM
        sortKey = label;
      } else if (filterType === 'month') {
        label = dateStr.substring(8, 10); // DD
        sortKey = label;
      } else if (filterType === 'week') {
        const d = new Date(dateStr);
        const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        const dayIdx = d.getDay();
        label = days[dayIdx];
        sortKey = (dayIdx === 0 ? 7 : dayIdx).toString(); // Senin to Minggu order
      } else {
        label = dateStr.substring(11, 16); // HH:mm
        sortKey = label;
      }

      if (!dataMap[sortKey]) {
        dataMap[sortKey] = { label, sortKey, Penjualan: 0, Pembelian: 0, Pengeluaran: 0 };
      }
      dataMap[sortKey][key] += amount;
    };

    transactions.filter(t => isMatchFilter(t.date)).forEach(t => {
      addToMap(t.date, t.type === 'SALE' ? 'Penjualan' : 'Pembelian', t.total);
    });

    expenses.filter(e => isMatchFilter(e.date)).forEach(e => {
      addToMap(e.date, 'Pengeluaran', e.amount);
    });

    return Object.values(dataMap).sort((a, b) => a.sortKey.localeCompare(b.sortKey));
  }, [transactions, expenses, filterType, filterValue]);

  const combinedHistory = useMemo(() => {
    const history: Array<{
      id: string;
      date: string;
      type: 'Penjualan' | 'Pembelian' | 'Pengeluaran';
      description: string;
      amount: number;
      isPositive: boolean;
      originalData: any;
    }> = [];

    transactions.filter(t => isMatchFilter(t.date)).forEach(t => {
      history.push({
        id: t.id,
        date: t.date,
        type: t.type === 'SALE' ? 'Penjualan' : 'Pembelian',
        description: t.type === 'SALE' ? `Penjualan ${t.items.length} item` : `Pembelian ${t.items.length} item`,
        amount: t.total,
        isPositive: t.type === 'SALE',
        originalData: t
      });
    });

    expenses.filter(e => isMatchFilter(e.date)).forEach(e => {
      history.push({
        id: e.id,
        date: e.date,
        type: 'Pengeluaran',
        description: e.description,
        amount: e.amount,
        isPositive: false,
        originalData: e
      });
    });

    return history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, expenses, filterType, filterValue]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-500/20 text-purple-400 rounded-xl border border-purple-500/20">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Buku Akuntansi</h2>
            <p className="text-slate-400">Laporan laba rugi dan pencatatan pengeluaran operasional.</p>
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
          <select 
            value={filterType}
            onChange={e => {
              const type = e.target.value as 'date' | 'week' | 'month' | 'year';
              setFilterType(type);
              const now = new Date();
              now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
              
              if (type === 'date') {
                setFilterValue(now.toISOString().substring(0, 10));
              } else if (type === 'week') {
                const date = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
                const dayNum = date.getUTCDay() || 7;
                date.setUTCDate(date.getUTCDate() + 4 - dayNum);
                const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
                const weekNo = Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
                setFilterValue(`${date.getUTCFullYear()}-W${weekNo.toString().padStart(2, '0')}`);
              } else if (type === 'month') {
                setFilterValue(now.toISOString().substring(0, 7));
              } else {
                setFilterValue(now.toISOString().substring(0, 4));
              }
            }}
            className="bg-black/50 border border-white/10 text-white rounded-lg p-2 font-medium focus:border-purple-500 outline-none w-full md:w-auto"
          >
            <option value="date">Harian</option>
            <option value="week">Mingguan</option>
            <option value="month">Bulanan</option>
            <option value="year">Tahunan</option>
          </select>
          
          {filterType === 'date' && (
            <input 
              type="date" 
              value={filterValue}
              onChange={e => setFilterValue(e.target.value)}
              className="bg-black/50 border border-white/10 text-white rounded-lg p-2 font-medium focus:border-purple-500 outline-none w-full md:w-auto"
            />
          )}
          {filterType === 'week' && (
            <input 
              type="week" 
              value={filterValue}
              onChange={e => setFilterValue(e.target.value)}
              className="bg-black/50 border border-white/10 text-white rounded-lg p-2 font-medium focus:border-purple-500 outline-none w-full md:w-auto"
            />
          )}
          {filterType === 'month' && (
            <input 
              type="month" 
              value={filterValue}
              onChange={e => setFilterValue(e.target.value)}
              className="bg-black/50 border border-white/10 text-white rounded-lg p-2 font-medium focus:border-purple-500 outline-none w-full md:w-auto"
            />
          )}
          {filterType === 'year' && (
            <input 
              type="number" 
              value={filterValue}
              onChange={e => setFilterValue(e.target.value)}
              min="2000"
              max="2100"
              placeholder="YYYY"
              className="bg-black/50 border border-white/10 text-white rounded-lg p-2 font-medium focus:border-purple-500 outline-none w-full md:w-auto"
            />
          )}
        </div>
      </div>

      <div className="flex gap-4 border-b border-white/10 mb-6 overflow-x-auto">
        <button 
          onClick={() => setActiveTab('dashboard')}
          className={`pb-3 font-semibold text-sm transition-colors relative whitespace-nowrap ${activeTab === 'dashboard' ? 'text-purple-400' : 'text-slate-400 hover:text-white'}`}
        >
          <div className="flex items-center gap-2"><BarChart2 className="w-4 h-4" /> Dashboard</div>
          {activeTab === 'dashboard' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-400 rounded-t-full"></div>}
        </button>
        <button 
          onClick={() => setActiveTab('laba-rugi')}
          className={`pb-3 font-semibold text-sm transition-colors relative whitespace-nowrap ${activeTab === 'laba-rugi' ? 'text-purple-400' : 'text-slate-400 hover:text-white'}`}
        >
          <div className="flex items-center gap-2"><Calculator className="w-4 h-4" /> Laba Rugi & Pengeluaran</div>
          {activeTab === 'laba-rugi' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-400 rounded-t-full"></div>}
        </button>
        <button 
          onClick={() => setActiveTab('hutang')}
          className={`pb-3 font-semibold text-sm transition-colors relative whitespace-nowrap ${activeTab === 'hutang' ? 'text-purple-400' : 'text-slate-400 hover:text-white'}`}
        >
          <div className="flex items-center gap-2"><CreditCard className="w-4 h-4" /> Utang Usaha</div>
          {activeTab === 'hutang' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-400 rounded-t-full"></div>}
        </button>
      </div>

      {activeTab === 'dashboard' ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur-xl p-5 rounded-2xl border border-white/10 shadow-sm">
              <p className="text-[10px] uppercase font-semibold text-slate-400 mb-2">Total Penjualan</p>
              <p className="text-xl font-bold text-emerald-400">{formatIDR(totalSales)}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-xl p-5 rounded-2xl border border-white/10 shadow-sm">
              <p className="text-[10px] uppercase font-semibold text-slate-400 mb-2">Total Pembelian (HPP)</p>
              <p className="text-xl font-bold text-rose-400">{formatIDR(totalPurchases)}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-xl p-5 rounded-2xl border border-white/10 shadow-sm">
              <p className="text-[10px] uppercase font-semibold text-slate-400 mb-2">Pengeluaran Operasional</p>
              <p className="text-xl font-bold text-amber-400">{formatIDR(totalExpenses)}</p>
            </div>
            <div className={`p-5 rounded-2xl border backdrop-blur-xl shadow-sm ${netProfit >= 0 ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-rose-500/10 border-rose-500/20'}`}>
              <p className={`text-[10px] uppercase font-semibold mb-2 flex items-center gap-1 ${netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {netProfit >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                Laba Bersih
              </p>
              <p className={`text-xl font-bold ${netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{formatIDR(netProfit)}</p>
            </div>
          </div>

          <div className="bg-black/20 backdrop-blur-xl rounded-2xl shadow-sm border border-white/10 p-6">
            <h3 className="font-bold text-white mb-6">Grafik Keuangan</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                  <XAxis dataKey="label" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `Rp${(value/1000).toLocaleString('id-ID')}k`} />
                  <RechartsTooltip 
                    cursor={{fill: 'rgba(255,255,255,0.05)'}}
                    contentStyle={{ backgroundColor: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.5rem', color: 'white' }}
                    itemStyle={{ color: 'white' }}
                    formatter={(value: number) => formatIDR(value)}
                  />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Bar dataKey="Penjualan" fill="#34d399" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Pembelian" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Pengeluaran" fill="#fbbf24" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : activeTab === 'laba-rugi' ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-emerald-500/10 backdrop-blur-xl p-6 rounded-2xl border border-emerald-500/20 shadow-sm">
              <p className="text-[10px] uppercase font-semibold text-emerald-400 mb-2">Total Kas Masuk</p>
              <p className="text-3xl font-bold text-emerald-400">{formatIDR(totalSales)}</p>
            </div>
            <div className="bg-rose-500/10 backdrop-blur-xl p-6 rounded-2xl border border-rose-500/20 shadow-sm">
              <p className="text-[10px] uppercase font-semibold text-rose-400 mb-2">Total Kas Keluar</p>
              <p className="text-3xl font-bold text-rose-400">{formatIDR(totalPurchases + totalExpenses)}</p>
            </div>
            <div className={`${netProfit >= 0 ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-rose-500/10 border-rose-500/20'} backdrop-blur-xl p-6 rounded-2xl border shadow-sm`}>
              <p className={`text-[10px] uppercase font-semibold mb-2 ${netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>Posisi Kas (Laba Bersih)</p>
              <p className={`text-3xl font-bold ${netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{formatIDR(netProfit)}</p>
            </div>
          </div>

          <div className="bg-black/20 backdrop-blur-xl rounded-2xl shadow-sm border border-white/10 p-6 overflow-hidden">
            <h3 className="font-bold text-white mb-6">Laporan Laba Rugi ({filterValue})</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-slate-300">Pendapatan Penjualan</span>
                <span className="font-bold text-emerald-400">{formatIDR(totalSales)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-slate-300">Harga Pokok Penjualan (HPP)</span>
                <span className="font-bold text-rose-400">-{formatIDR(totalPurchases)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/10">
                <span className="font-bold text-white">Laba Kotor</span>
                <span className="font-bold text-white">{formatIDR(grossProfit)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-slate-300">Pengeluaran Operasional</span>
                <span className="font-bold text-rose-400">-{formatIDR(totalExpenses)}</span>
              </div>
              <div className="flex justify-between items-center pt-4 mt-4 border-t border-white/20">
                <span className="font-bold text-lg text-white">Laba Bersih</span>
                <span className={`font-bold text-xl ${netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{formatIDR(netProfit)}</span>
              </div>
            </div>
          </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Pengeluaran */}
        <div className="bg-black/20 backdrop-blur-xl rounded-2xl shadow-sm border border-white/10 p-6 h-fit">
          <h3 className="font-bold text-white mb-4 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-purple-400" /> {editingExpense ? 'Edit Pengeluaran' : 'Catat Pengeluaran Baru'}
          </h3>
          <form onSubmit={handleAddExpense} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-semibold text-slate-400 tracking-wide">Keterangan</label>
              <input required type="text" placeholder="Cth: Bayar Listrik, Gaji Karyawan" className="w-full bg-black/50 border border-white/10 text-white placeholder-slate-500 rounded-lg p-2.5 focus:border-purple-500 outline-none" value={desc} onChange={e => setDesc(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-semibold text-slate-400 tracking-wide">Kategori</label>
              <select required className="w-full bg-black/50 border border-white/10 text-white rounded-lg p-2.5 focus:border-purple-500 outline-none" value={category} onChange={e => setCategory(e.target.value)}>
                <option value="">Pilih Kategori</option>
                <option value="Utilitas">Utilitas (Listrik, Air, Internet)</option>
                <option value="Gaji">Gaji Karyawan</option>
                <option value="Perlengkapan">Perlengkapan Toko</option>
                <option value="Sewa">Sewa Tempat</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-semibold text-slate-400 tracking-wide">Jumlah (Rp)</label>
              <input required type="number" min="0" className="w-full bg-black/50 border border-white/10 text-white rounded-lg p-2.5 focus:border-purple-500 outline-none" value={amount || ''} onChange={e => setAmount(parseInt(e.target.value) || 0)} />
            </div>
            <div className="flex gap-2">
              {editingExpense && (
                <button type="button" onClick={() => {
                  setEditingExpense(null);
                  setDesc('');
                  setAmount(0);
                  setCategory('');
                }} className="flex-1 border border-white/10 text-white hover:bg-white/5 font-bold uppercase text-sm py-2.5 rounded-lg transition-colors">
                  Batal
                </button>
              )}
              <button type="submit" className="flex-[2] bg-purple-500 hover:bg-purple-400 text-white font-bold uppercase text-sm py-2.5 rounded-lg transition-colors flex justify-center items-center gap-2">
                <Plus className="w-4 h-4" /> Simpan
              </button>
            </div>
          </form>
        </div>

        {/* Daftar Transaksi */}
        <div className="lg:col-span-2 bg-black/20 backdrop-blur-xl rounded-2xl shadow-sm border border-white/10 overflow-hidden">
          <div className="p-6 border-b border-white/10 bg-white/5">
            <h3 className="font-bold text-white">Riwayat Transaksi & Pengeluaran ({filterValue})</h3>
          </div>
          <div className="divide-y divide-white/5 h-[500px] overflow-y-auto">
            {combinedHistory.length === 0 ? (
              <div className="p-8 text-center text-slate-400">Tidak ada data transaksi di periode ini.</div>
            ) : (
              combinedHistory.map(item => (
                <div key={item.id} className="p-6 flex justify-between items-center hover:bg-white/5 transition-colors">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        item.type === 'Penjualan' ? 'bg-emerald-500/20 text-emerald-400' :
                        item.type === 'Pembelian' ? 'bg-rose-500/20 text-rose-400' :
                        'bg-amber-500/20 text-amber-400'
                      }`}>
                        {item.type}
                      </span>
                      <p className="font-medium text-white">{item.description}</p>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{new Date(item.date).toLocaleDateString('id-ID')} {item.type === 'Pengeluaran' ? `• ${item.originalData.category}` : ''}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className={`font-bold text-right ${item.isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {item.isPositive ? '+' : '-'}{formatIDR(item.amount)}
                    </div>
                    {item.type === 'Pengeluaran' && (
                      <div className="flex gap-2">
                        <button onClick={() => handleEditClick(item.originalData)} className="p-2 text-slate-400 hover:text-amber-400 hover:bg-amber-500/20 rounded-lg transition-colors" title="Edit">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => {
                          if (window.confirm('Hapus pengeluaran ini?')) {
                            onDeleteExpense(item.id);
                          }
                        }} className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/20 rounded-lg transition-colors" title="Hapus">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form Utang */}
          <div className="bg-black/20 backdrop-blur-xl rounded-2xl shadow-sm border border-white/10 p-6 h-fit">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-purple-400" /> Catat Utang Usaha
            </h3>
            <form onSubmit={handleAddDebt} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-semibold text-slate-400 tracking-wide">Keterangan / Kepada</label>
                <input required type="text" placeholder="Cth: Supplier Beras, Sewa Ruko" className="w-full bg-black/50 border border-white/10 text-white placeholder-slate-500 rounded-lg p-2.5 focus:border-purple-500 outline-none" value={debtDesc} onChange={e => setDebtDesc(e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-semibold text-slate-400 tracking-wide">Jumlah Utang (Rp)</label>
                <input required type="number" min="0" className="w-full bg-black/50 border border-white/10 text-white rounded-lg p-2.5 focus:border-purple-500 outline-none" value={debtAmount || ''} onChange={e => setDebtAmount(parseInt(e.target.value) || 0)} />
              </div>
              <button type="submit" className="w-full bg-purple-500 hover:bg-purple-400 text-white font-bold uppercase text-sm py-2.5 rounded-lg transition-colors flex justify-center items-center gap-2">
                <Plus className="w-4 h-4" /> Simpan Utang
              </button>
            </form>
          </div>

          {/* Daftar Utang */}
          <div className="lg:col-span-2 bg-black/20 backdrop-blur-xl rounded-2xl shadow-sm border border-white/10 overflow-hidden">
            <div className="p-6 border-b border-white/10 bg-white/5 flex justify-between items-center">
              <h3 className="font-bold text-white">Daftar Utang Usaha</h3>
              <div className="text-right">
                <p className="text-[10px] uppercase font-semibold text-slate-400">Total Sisa Utang</p>
                <p className="font-bold text-rose-400">{formatIDR(debts.reduce((sum, d) => sum + (d.amount - d.paidAmount), 0))}</p>
              </div>
            </div>
            <div className="divide-y divide-white/5">
              {debts.length === 0 ? (
                <div className="p-8 text-center text-slate-400">Tidak ada catatan utang.</div>
              ) : (
                debts.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(debt => (
                  <div key={debt.id} className="p-6 hover:bg-white/5 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="font-medium text-white">{debt.description}</p>
                        <p className="text-xs text-slate-400 mt-1">{new Date(debt.date).toLocaleDateString('id-ID')}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${debt.status === 'PAID' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                            {debt.status === 'PAID' ? 'LUNAS' : 'BELUM LUNAS'}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg text-white">{formatIDR(debt.amount)}</p>
                        <p className="text-sm text-slate-400">Terbayar: <span className="text-emerald-400">{formatIDR(debt.paidAmount)}</span></p>
                        <p className="text-sm text-slate-400">Sisa: <span className="text-rose-400">{formatIDR(debt.amount - debt.paidAmount)}</span></p>
                      </div>
                    </div>
                    
                    {debt.status !== 'PAID' && (
                      <div className="mt-4 pt-4 border-t border-white/5 flex gap-2">
                        <input 
                          type="number" 
                          min="0"
                          max={debt.amount - debt.paidAmount}
                          placeholder="Jumlah Bayar" 
                          className="flex-1 bg-black/50 border border-white/10 text-white rounded-lg p-2 text-sm focus:border-purple-500 outline-none"
                          value={paymentAmounts[debt.id] || ''}
                          onChange={(e) => setPaymentAmounts({...paymentAmounts, [debt.id]: parseInt(e.target.value) || 0})}
                        />
                        <button 
                          onClick={() => handlePayDebt(debt.id)}
                          disabled={!paymentAmounts[debt.id] || paymentAmounts[debt.id] <= 0 || paymentAmounts[debt.id] > (debt.amount - debt.paidAmount)}
                          className="bg-emerald-500 hover:bg-emerald-400 disabled:bg-white/10 disabled:text-slate-500 text-black font-bold uppercase text-xs px-4 rounded-lg transition-colors"
                        >
                          Bayar
                        </button>
                        <button onClick={() => {
                          if (window.confirm('Hapus catatan utang ini?')) {
                            onDeleteDebt(debt.id);
                          }
                        }} className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/20 rounded-lg transition-colors border border-white/10 ml-2" title="Hapus">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    
                    {debt.payments.length > 0 && (
                      <div className="mt-4 bg-black/30 rounded-lg p-3">
                        <p className="text-xs font-semibold text-slate-400 mb-2 uppercase">Riwayat Pembayaran</p>
                        <div className="space-y-1">
                          {debt.payments.map(p => (
                            <div key={p.id} className="flex justify-between text-sm">
                              <span className="text-slate-300">{new Date(p.date).toLocaleDateString('id-ID')}</span>
                              <span className="text-emerald-400">+{formatIDR(p.amount)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
