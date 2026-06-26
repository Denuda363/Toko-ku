import React, { useState, useEffect, useRef } from 'react';
import { Bell, AlertCircle, AlertTriangle, X } from 'lucide-react';
import { Product, Debt } from '../types';
import { formatIDR } from '../store';

interface NotificationsProps {
  products: Product[];
  debts: Debt[];
}

export default function Notifications({ products, debts }: NotificationsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Generate notifications
  const lowStockProducts = products.filter(p => p.stock <= 5);
  const unpaidDebts = debts.filter(d => d.status === 'UNPAID');

  const notifications = [
    ...lowStockProducts.map(p => ({
      id: `stock-${p.id}`,
      type: 'warning',
      title: 'Stok Menipis',
      message: `${p.name} tersisa ${p.stock} item. Segera lakukan restok.`,
      icon: AlertTriangle,
      color: 'text-amber-400',
      bgColor: 'bg-amber-400/20'
    })),
    ...unpaidDebts.map(d => ({
      id: `debt-${d.id}`,
      type: 'danger',
      title: 'Utang Belum Lunas',
      message: `${d.description} (Sisa: ${formatIDR(d.amount - d.paidAmount)}) belum lunas.`,
      icon: AlertCircle,
      color: 'text-rose-400',
      bgColor: 'bg-rose-400/20'
    }))
  ];

  const unreadCount = notifications.length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative z-50" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 bg-black/50 hover:bg-black/70 rounded-xl backdrop-blur-xl border border-white/10 text-white transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 max-h-[80vh] overflow-y-auto bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
          <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
            <h3 className="font-bold text-white flex items-center gap-2">
              <Bell className="w-4 h-4" /> Notifikasi
            </h3>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="divide-y divide-white/5">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-sm">
                Tidak ada notifikasi baru
              </div>
            ) : (
              notifications.map(notif => (
                <div key={notif.id} className="p-4 hover:bg-white/5 transition-colors flex gap-3">
                  <div className={`mt-0.5 p-2 rounded-full h-fit ${notif.bgColor}`}>
                    <notif.icon className={`w-4 h-4 ${notif.color}`} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">{notif.title}</h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{notif.message}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
