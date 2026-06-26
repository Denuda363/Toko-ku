import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Sales from './components/Sales';
import Purchases from './components/Purchases';
import Inventory from './components/Inventory';
import Accounting from './components/Accounting';
import Settings from './components/Settings';
import { useAppStore } from './store';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const store = useAppStore();

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard products={store.products} transactions={store.transactions} expenses={store.expenses} />;
      case 'sales':
        return <Sales products={store.products} transactions={store.transactions} onCheckout={store.addSale} onCancelTransaction={store.cancelSaleTransaction} />;
      case 'purchases':
        return <Purchases products={store.products} transactions={store.transactions} onPurchase={store.addPurchase} onCancelTransaction={store.cancelPurchaseTransaction} />;
      case 'inventory':
        return <Inventory products={store.products} onUpdateProduct={store.updateProduct} onAddProduct={store.addProduct} onDeleteProduct={store.deleteProduct} />;
      case 'accounting':
        return <Accounting transactions={store.transactions} expenses={store.expenses} onAddExpense={store.addExpense} onUpdateExpense={store.updateExpense} onDeleteExpense={store.deleteExpense} />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard products={store.products} transactions={store.transactions} expenses={store.expenses} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0f172a] text-white font-sans overflow-hidden relative">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-600/20 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none"></div>
      
      {/* Mobile menu button */}
      <button 
        className="md:hidden fixed top-4 right-4 z-[60] p-2 bg-black/50 rounded-lg backdrop-blur-xl border border-white/10 text-white"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      <Sidebar activeTab={activeTab} setActiveTab={(tab) => { setActiveTab(tab); setIsSidebarOpen(false); }} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <main className="flex-1 p-4 md:p-8 overflow-y-auto h-screen relative z-10 w-full">
        {renderContent()}
      </main>
    </div>
  );
}
