import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Sales from './components/Sales';
import Purchases from './components/Purchases';
import Inventory from './components/Inventory';
import Accounting from './components/Accounting';
import Settings from './components/Settings';
import Notifications from './components/Notifications';
import { useAppStore } from './store';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const store = useAppStore();

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard products={store.products} transactions={store.transactions} expenses={store.expenses} />;
      case 'sales':
        return <Sales products={store.products} transactions={store.transactions} onCheckout={store.addSale} onUpdateTransaction={store.updateSale} onCancelTransaction={store.cancelSaleTransaction} />;
      case 'purchases':
        return <Purchases products={store.products} transactions={store.transactions} onPurchase={store.addPurchase} onUpdateTransaction={store.updatePurchase} onCancelTransaction={store.cancelPurchaseTransaction} />;
      case 'inventory':
        return <Inventory products={store.products} onUpdateProduct={store.updateProduct} onAddProduct={store.addProduct} onDeleteProduct={store.deleteProduct} />;
      case 'accounting':
        return <Accounting 
          transactions={store.transactions} 
          expenses={store.expenses} 
          debts={store.debts}
          onAddExpense={store.addExpense} 
          onUpdateExpense={store.updateExpense} 
          onDeleteExpense={store.deleteExpense} 
          onAddDebt={store.addDebt}
          onAddDebtPayment={store.addDebtPayment}
          onUpdateDebt={store.updateDebt}
          onDeleteDebt={store.deleteDebt}
        />;
      case 'settings':
        return <Settings 
          onExportData={store.exportData}
          onImportData={store.importData}
          onResetData={store.resetData}
        />;
      default:
        return <Dashboard products={store.products} transactions={store.transactions} expenses={store.expenses} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0f172a] text-white font-sans overflow-hidden relative">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-600/20 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none"></div>
      
      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-[60] bg-black/50 backdrop-blur-xl border-b border-white/10 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
             <span className="font-bold text-black text-xl">K</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight">Dn-Toko</h1>
        </div>
        <Notifications products={store.products} debts={store.debts} />
      </div>

      {/* Desktop Top Right Controls */}
      <div className="hidden md:flex fixed top-4 right-4 z-[60] items-center gap-2">
        <Notifications products={store.products} debts={store.debts} />
      </div>

      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 p-4 md:p-8 pt-20 md:pt-8 pb-24 md:pb-8 overflow-y-auto h-screen relative z-10 w-full">
        {renderContent()}
      </main>
    </div>
  );
}
