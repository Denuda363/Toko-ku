import React, { useMemo } from 'react';
import { Product, Transaction, Expense } from '../types';
import { formatIDR } from '../store';
import { TrendingUp, TrendingDown, Wallet, ShoppingBag, Package, Boxes } from 'lucide-react';

interface DashboardProps {
  products: Product[];
  transactions: Transaction[];
  expenses: Expense[];
}

export default function Dashboard({ products, transactions, expenses }: DashboardProps) {
  // Calculate today's sales
  const today = new Date().toISOString().split('T')[0];
  
  const todaySales = useMemo(() => {
    return transactions
      .filter(t => t.type === 'SALE' && t.date.startsWith(today))
      .reduce((sum, t) => sum + t.total, 0);
  }, [transactions, today]);

  // Calculate this month's revenue (Omset)
  const thisMonth = today.substring(0, 7); // YYYY-MM
  
  const monthlyRevenue = useMemo(() => {
    return transactions
      .filter(t => t.type === 'SALE' && t.date.startsWith(thisMonth))
      .reduce((sum, t) => sum + t.total, 0);
  }, [transactions, thisMonth]);

  // Calculate this month's expenses & purchases
  const monthlyExpenses = useMemo(() => {
    const opEx = expenses
      .filter(e => e.date.startsWith(thisMonth))
      .reduce((sum, e) => sum + e.amount, 0);
      
    // Optional: Include purchases in expenses or keep them separate.
    // Usually COGS (Cost of Goods Sold) is used for net profit, but for simple cashflow we might use purchases.
    const purchases = transactions
      .filter(t => t.type === 'PURCHASE' && t.date.startsWith(thisMonth))
      .reduce((sum, t) => sum + t.total, 0);
      
    return opEx + purchases;
  }, [expenses, transactions, thisMonth]);

  const netProfit = monthlyRevenue - monthlyExpenses;

  // Low stock products
  const lowStockProducts = products.filter(p => p.stock <= 5).sort((a, b) => a.stock - b.stock);

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <p className="text-slate-400 text-sm font-medium uppercase tracking-widest mb-1">Overview Bisnis</p>
          <h2 className="text-3xl font-bold italic tracking-tighter text-white">Selamat Pagi, Partner!</h2>
        </div>
        <div className="bg-white/5 backdrop-blur px-4 py-2 rounded-lg border border-white/10 flex items-center gap-3 w-full md:w-auto">
          <span className="text-sm font-mono text-white flex-1 md:flex-none text-center md:text-left">{new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}</span>
          <div className="w-[1px] h-4 bg-white/20"></div>
          <span className="text-sm text-emerald-400 font-bold uppercase tracking-wider">Online</span>
        </div>
      </header>
      
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/10 backdrop-blur-xl border border-white/10 p-6 rounded-2xl">
          <p className="text-slate-400 text-xs font-semibold uppercase mb-2">Omset Harian</p>
          <h3 className="text-2xl font-bold text-white">{formatIDR(todaySales)}</h3>
          <div className="mt-2 text-emerald-400 text-xs flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"></path></svg>
            <span>+12.5% vs Kemarin</span>
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-xl border border-white/10 p-6 rounded-2xl">
          <p className="text-slate-400 text-xs font-semibold uppercase mb-2">Omset Bersih</p>
          <h3 className="text-2xl font-bold text-emerald-400">{formatIDR(netProfit)}</h3>
          <p className="text-slate-500 text-[10px] mt-2 uppercase tracking-wide">Margin: 26.3%</p>
        </div>
        <div className="bg-white/10 backdrop-blur-xl border border-white/10 p-6 rounded-2xl">
          <p className="text-slate-400 text-xs font-semibold uppercase mb-2">Pengeluaran</p>
          <h3 className="text-2xl font-bold text-rose-400">{formatIDR(monthlyExpenses)}</h3>
          <p className="text-slate-500 text-[10px] mt-2 uppercase tracking-wide">Pembelian Stok & Listrik</p>
        </div>
        <div className="bg-white/10 backdrop-blur-xl border border-white/10 p-6 rounded-2xl">
          <p className="text-slate-400 text-xs font-semibold uppercase mb-2">Stok Kritis</p>
          <h3 className="text-2xl font-bold text-amber-400">{lowStockProducts.length} <span className="text-sm font-normal">Produk</span></h3>
          <p className="text-slate-500 text-[10px] mt-2 uppercase tracking-wide">Perlu Segera Order</p>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions */}
        <div className="lg:col-span-2 bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-white/10 flex justify-between items-center">
            <h3 className="font-bold text-white">Transaksi Terbaru</h3>
            <button className="text-xs text-emerald-400 hover:underline">Lihat Semua</button>
          </div>
          <div className="divide-y divide-white/5">
            {transactions.slice(0, 5).map(trx => (
              <div key={trx.id} className="p-6 flex items-center justify-between hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${trx.type === 'SALE' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                    {trx.type === 'SALE' ? <TrendingUp className="w-5 h-5" /> : <Package className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="font-medium text-white">{trx.id}</p>
                    <p className="text-sm text-slate-400">{new Date(trx.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute:'2-digit' })}</p>
                  </div>
                </div>
                <div className={`font-semibold ${trx.type === 'SALE' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {trx.type === 'SALE' ? '+' : '-'}{formatIDR(trx.total)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
          <div className="px-6 py-5 border-b border-white/10">
            <h3 className="font-bold text-white">Peringatan Stok Tipis</h3>
          </div>
          <div className="p-6">
            {lowStockProducts.length > 0 ? (
              <div className="space-y-4">
                {lowStockProducts.map(p => (
                  <div key={p.id} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-white">{p.name}</p>
                      <p className="text-xs text-slate-400">SKU: {p.sku}</p>
                    </div>
                    <div className="px-3 py-1 rounded-full text-xs font-medium bg-rose-500/20 text-rose-400 border border-rose-500/20">
                      Sisa {p.stock}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400">
                <Boxes className="w-12 h-12 mx-auto text-white/20 mb-3" />
                <p>Semua stok produk aman.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, amount, icon: Icon, trend, trendUp, color }: any) {
  const colorMap: Record<string, string> = {
    emerald: 'text-emerald-400 bg-white/10 border border-white/5',
    blue: 'text-blue-400 bg-white/10 border border-white/5',
    rose: 'text-rose-400 bg-white/10 border border-white/5',
    indigo: 'text-indigo-400 bg-white/10 border border-white/5',
  };
  
  const textColors: Record<string, string> = {
    emerald: 'text-emerald-400',
    blue: 'text-blue-400',
    rose: 'text-rose-400',
    indigo: 'text-indigo-400',
  };

  return (
    <div className="bg-white/10 backdrop-blur-xl border border-white/10 p-6 rounded-2xl">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-slate-400 text-xs font-semibold uppercase mb-2">{title}</p>
          <h4 className={`text-2xl font-bold ${title.includes('Bersih') ? textColors[color] : 'text-white'}`}>{formatIDR(amount)}</h4>
        </div>
        <div className={`p-3 rounded-lg ${colorMap[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      {trend && (
        <div className="mt-2 text-xs flex items-center gap-1">
          <span className={`font-medium ${trendUp ? 'text-emerald-400' : 'text-rose-400'}`}>
            {trend}
          </span>
          <span className="text-slate-500 ml-1">dari bulan lalu</span>
        </div>
      )}
    </div>
  );
}
