import React, { useState, useMemo } from 'react';
import { Transaction, Expense } from '../types';
import { formatIDR } from '../store';
import { Calculator, Plus, TrendingUp, TrendingDown, Receipt, Trash2, Edit2 } from 'lucide-react';

interface AccountingProps {
  transactions: Transaction[];
  expenses: Expense[];
  onAddExpense: (description: string, amount: number, category: string) => void;
  onUpdateExpense: (expense: Expense) => void;
  onDeleteExpense: (expenseId: string) => void;
}

export default function Accounting({ transactions, expenses, onAddExpense, onUpdateExpense, onDeleteExpense }: AccountingProps) {
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState(0);
  const [category, setCategory] = useState('');
  const [filterMonth, setFilterMonth] = useState(new Date().toISOString().substring(0, 7)); // YYYY-MM
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

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

  const handleEditClick = (expense: Expense) => {
    setEditingExpense(expense);
    setDesc(expense.description);
    setAmount(expense.amount);
    setCategory(expense.category);
  };

  // Calculations based on filtered month
  const { totalSales, totalPurchases, totalExpenses } = useMemo(() => {
    const monthSales = transactions.filter(t => t.type === 'SALE' && t.date.startsWith(filterMonth));
    const monthPurchases = transactions.filter(t => t.type === 'PURCHASE' && t.date.startsWith(filterMonth));
    const monthExpenses = expenses.filter(e => e.date.startsWith(filterMonth));

    return {
      totalSales: monthSales.reduce((sum, t) => sum + t.total, 0),
      totalPurchases: monthPurchases.reduce((sum, t) => sum + t.total, 0),
      totalExpenses: monthExpenses.reduce((sum, e) => sum + e.amount, 0)
    };
  }, [transactions, expenses, filterMonth]);

  const grossProfit = totalSales - totalPurchases;
  const netProfit = grossProfit - totalExpenses;

  // Filter lists
  const filteredExpenses = expenses.filter(e => e.date.startsWith(filterMonth)).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

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
        <input 
          type="month" 
          value={filterMonth}
          onChange={e => setFilterMonth(e.target.value)}
          className="bg-black/50 border border-white/10 text-white rounded-lg p-2 font-medium focus:border-purple-500 outline-none w-full md:w-auto"
        />
      </div>

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
          <p className="text-xl font-bold text-rose-400">{formatIDR(totalExpenses)}</p>
        </div>
        <div className={`p-5 rounded-2xl border backdrop-blur-xl shadow-sm ${netProfit >= 0 ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-rose-500/10 border-rose-500/20'}`}>
          <p className={`text-[10px] uppercase font-semibold mb-2 flex items-center gap-1 ${netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {netProfit >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            Laba Bersih
          </p>
          <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{formatIDR(netProfit)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
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

        {/* Daftar Pengeluaran */}
        <div className="lg:col-span-2 bg-black/20 backdrop-blur-xl rounded-2xl shadow-sm border border-white/10 overflow-hidden">
          <div className="p-6 border-b border-white/10 bg-white/5">
            <h3 className="font-bold text-white">Riwayat Pengeluaran ({filterMonth})</h3>
          </div>
          <div className="divide-y divide-white/5">
            {filteredExpenses.length === 0 ? (
              <div className="p-8 text-center text-slate-400">Tidak ada data pengeluaran di bulan ini.</div>
            ) : (
              filteredExpenses.map(expense => (
                <div key={expense.id} className="p-6 flex justify-between items-center hover:bg-white/5 transition-colors">
                  <div>
                    <p className="font-medium text-white">{expense.description}</p>
                    <p className="text-xs text-slate-400 mt-1">{new Date(expense.date).toLocaleDateString('id-ID')} &bull; {expense.category}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="font-bold text-rose-400 text-right">
                      -{formatIDR(expense.amount)}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleEditClick(expense)} className="p-2 text-slate-400 hover:text-amber-400 hover:bg-amber-500/20 rounded-lg transition-colors" title="Edit">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => {
                        if (window.confirm('Hapus pengeluaran ini?')) {
                          onDeleteExpense(expense.id);
                        }
                      }} className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/20 rounded-lg transition-colors" title="Hapus">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
