import React from 'react';
import { LayoutDashboard, ShoppingCart, PackagePlus, Boxes, Calculator, Settings, Store } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function Sidebar({ activeTab, setActiveTab, isOpen, setIsOpen }: SidebarProps) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'sales', label: 'Penjualan', icon: ShoppingCart },
    { id: 'purchases', label: 'Pembelian', icon: PackagePlus },
    { id: 'inventory', label: 'Stok & Harga', icon: Boxes },
    { id: 'accounting', label: 'Akuntansi', icon: Calculator },
    { id: 'settings', label: 'Pengaturan', icon: Settings },
  ];

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
      <aside className={`fixed md:static inset-y-0 left-0 w-64 h-full bg-black/80 md:bg-black/30 backdrop-blur-2xl border-r border-white/10 flex flex-col z-50 md:z-10 transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
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
                  <span className="font-medium">{item.label}</span>
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
    </>
  );
}
