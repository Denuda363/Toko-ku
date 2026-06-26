import React from 'react';
import { LayoutDashboard, ShoppingCart, PackagePlus, Boxes, Calculator, Settings } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const navItems = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'sales', label: 'Kasir', icon: ShoppingCart },
    { id: 'purchases', label: 'Beli', icon: PackagePlus },
    { id: 'inventory', label: 'Stok', icon: Boxes },
    { id: 'accounting', label: 'Buku', icon: Calculator },
    { id: 'settings', label: 'Atur', icon: Settings },
  ];

  const desktopLabels = {
    'dashboard': 'Dashboard',
    'sales': 'Penjualan',
    'purchases': 'Pembelian',
    'inventory': 'Stok & Harga',
    'accounting': 'Akuntansi',
    'settings': 'Pengaturan'
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col fixed md:static inset-y-0 left-0 w-64 h-full bg-black/30 backdrop-blur-2xl border-r border-white/10 z-10 transition-transform duration-300">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
               <span className="font-bold text-black text-xl">K</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight">Kelontong<span className="text-emerald-400 text-xs ml-1">PRO</span></h1>
          </div>
          <nav className="flex-1 py-6">
            <ul className="space-y-1 px-3">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                        isActive
                          ? 'bg-white/10 text-emerald-400 border border-white/10'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{desktopLabels[item.id as keyof typeof desktopLabels]}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
        <div className="mt-auto p-8 border-t border-white/5 bg-black/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-400 to-blue-500"></div>
            <div>
              <p className="text-sm font-semibold">Admin Toko</p>
              <p className="text-xs text-slate-400">Toko Sederhana</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav 
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-2xl border-t border-white/10"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center justify-center w-14 h-14 rounded-xl transition-colors ${
                  isActive
                    ? 'text-emerald-400'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <div className={`p-1.5 rounded-lg mb-1 ${isActive ? 'bg-emerald-500/20' : ''}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-medium leading-none">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
