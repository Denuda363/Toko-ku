import { useState, useEffect } from 'react';
import { Product, Transaction, Expense, TransactionItem, Debt, DebtPayment } from './types';

const INITIAL_PRODUCTS: Product[] = [
  { id: '1', name: 'Beras Premium 5kg', sku: 'BRS-001', stock: 20, purchasePrice: 60000, sellingPrice: 65000, category: 'Sembako' },
  { id: '2', name: 'Minyak Goreng 2L', sku: 'MG-002', stock: 15, purchasePrice: 32000, sellingPrice: 35000, category: 'Sembako' },
  { id: '3', name: 'Gula Pasir 1kg', sku: 'GL-003', stock: 30, purchasePrice: 14000, sellingPrice: 16000, category: 'Sembako' },
  { id: '4', name: 'Mie Instan Goreng', sku: 'MI-004', stock: 100, purchasePrice: 2500, sellingPrice: 3000, category: 'Makanan' },
  { id: '5', name: 'Kopi Bubuk 100g', sku: 'KP-005', stock: 25, purchasePrice: 10000, sellingPrice: 12000, category: 'Minuman' },
];

const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'TRX-001',
    date: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
    type: 'SALE',
    items: [
      { productId: '1', name: 'Beras Premium 5kg', quantity: 2, price: 65000, subtotal: 130000 },
      { productId: '2', name: 'Minyak Goreng 2L', quantity: 1, price: 35000, subtotal: 35000 }
    ],
    total: 165000
  },
  {
    id: 'TRX-002',
    date: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    type: 'SALE',
    items: [
      { productId: '4', name: 'Mie Instan Goreng', quantity: 5, price: 3000, subtotal: 15000 },
      { productId: '3', name: 'Gula Pasir 1kg', quantity: 2, price: 16000, subtotal: 32000 }
    ],
    total: 47000
  },
  {
    id: 'TRX-003',
    date: new Date().toISOString(), // today
    type: 'SALE',
    items: [
      { productId: '5', name: 'Kopi Bubuk 100g', quantity: 3, price: 12000, subtotal: 36000 }
    ],
    total: 36000
  },
  {
    id: 'TRX-004',
    date: new Date(Date.now() - 86400000 * 3).toISOString(), // 3 days ago
    type: 'PURCHASE',
    items: [
      { productId: '1', name: 'Beras Premium 5kg', quantity: 10, price: 60000, subtotal: 600000 }
    ],
    total: 600000
  }
];

const INITIAL_EXPENSES: Expense[] = [
  { id: 'EXP-001', date: new Date(Date.now() - 86400000 * 2).toISOString(), description: 'Bayar Listrik', amount: 150000, category: 'Utilitas' },
  { id: 'EXP-002', date: new Date(Date.now() - 86400000).toISOString(), description: 'Plastik Kresek', amount: 25000, category: 'Perlengkapan' }
];

export function useAppStore() {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [expenses, setExpenses] = useState<Expense[]>(INITIAL_EXPENSES);
  const [debts, setDebts] = useState<Debt[]>([]);

  // Automatically sync tempo purchases into debts if needed, or manage them separately.
  // Actually, let's keep debts as a general module.

  const addDebt = (description: string, amount: number, date?: string) => {
    const newDebt: Debt = {
      id: `DBT-${Date.now()}`,
      date: date || new Date().toISOString(),
      description,
      amount,
      paidAmount: 0,
      status: 'UNPAID',
      payments: []
    };
    setDebts([newDebt, ...debts]);
  };

  const addDebtPayment = (debtId: string, amount: number, date?: string) => {
    setDebts(debts.map(d => {
      if (d.id === debtId) {
        const newPaidAmount = d.paidAmount + amount;
        const newPayment = {
          id: `PMT-${Date.now()}`,
          date: date || new Date().toISOString(),
          amount
        };
        return {
          ...d,
          paidAmount: newPaidAmount,
          status: newPaidAmount >= d.amount ? 'PAID' : 'UNPAID',
          payments: [...d.payments, newPayment]
        };
      }
      return d;
    }));
  };

  const updateDebt = (updatedDebt: Debt) => {
    setDebts(debts.map(d => d.id === updatedDebt.id ? updatedDebt : d));
  };

  const deleteDebt = (debtId: string) => {
    setDebts(debts.filter(d => d.id !== debtId));
  };


  // In a real app, we would sync this to localStorage or a database.
  
  const addSale = (items: TransactionItem[], total: number, date?: string) => {
    const newTransaction: Transaction = {
      id: `TRX-${Date.now()}`,
      date: date || new Date().toISOString(),
      type: 'SALE',
      items,
      total
    };
    setTransactions([newTransaction, ...transactions]);
    
    // Deduct stock
    setProducts(products.map(p => {
      const soldItem = items.find(i => i.productId === p.id);
      if (soldItem) {
        return { ...p, stock: p.stock - soldItem.quantity };
      }
      return p;
    }));
  };

  const updateSale = (id: string, items: TransactionItem[], total: number, date?: string) => {
    const oldTrx = transactions.find(t => t.id === id);
    if (!oldTrx || oldTrx.type !== 'SALE') return;

    let currentProducts = [...products];
    // Revert old items
    oldTrx.items.forEach(oldItem => {
      const pIndex = currentProducts.findIndex(p => p.id === oldItem.productId);
      if (pIndex >= 0) {
        currentProducts[pIndex] = { ...currentProducts[pIndex], stock: currentProducts[pIndex].stock + oldItem.quantity };
      }
    });

    // Apply new items
    items.forEach(newItem => {
      const pIndex = currentProducts.findIndex(p => p.id === newItem.productId);
      if (pIndex >= 0) {
        currentProducts[pIndex] = { ...currentProducts[pIndex], stock: currentProducts[pIndex].stock - newItem.quantity };
      }
    });

    setProducts(currentProducts);
    setTransactions(transactions.map(t => t.id === id ? {
      ...t,
      items,
      total,
      date: date || t.date
    } : t));
  };

  const addPurchase = (items: TransactionItem[], total: number, paymentMethod?: 'tunai' | 'tempo' | 'tf', date?: string) => {
    const newTransaction: Transaction = {
      id: `TRX-${Date.now()}`,
      date: date || new Date().toISOString(),
      type: 'PURCHASE',
      items,
      total,
      paymentMethod
    };
    setTransactions([newTransaction, ...transactions]);
    
    if (paymentMethod === 'tempo') {
      const debtDesc = `Pembelian Tempo (${items.length} item)`;
      const newDebt: Debt = {
        id: `DBT-${Date.now()}`,
        date: date || new Date().toISOString(),
        description: debtDesc,
        amount: total,
        paidAmount: 0,
        status: 'UNPAID',
        payments: []
      };
      setDebts([newDebt, ...debts]);
    }

    // Increase stock
    setProducts(products.map(p => {
      const boughtItem = items.find(i => i.productId === p.id);
      if (boughtItem) {
        return { ...p, stock: p.stock + boughtItem.quantity };
      }
      return p;
    }));
  };

  const updatePurchase = (id: string, items: TransactionItem[], total: number, paymentMethod?: 'tunai' | 'tempo' | 'tf', date?: string) => {
    const oldTrx = transactions.find(t => t.id === id);
    if (!oldTrx || oldTrx.type !== 'PURCHASE') return;

    let currentProducts = [...products];
    // Revert old items
    oldTrx.items.forEach(oldItem => {
      const pIndex = currentProducts.findIndex(p => p.id === oldItem.productId);
      if (pIndex >= 0) {
        currentProducts[pIndex] = { ...currentProducts[pIndex], stock: currentProducts[pIndex].stock - oldItem.quantity };
      }
    });

    // Apply new items
    items.forEach(newItem => {
      const pIndex = currentProducts.findIndex(p => p.id === newItem.productId);
      if (pIndex >= 0) {
        currentProducts[pIndex] = { ...currentProducts[pIndex], stock: currentProducts[pIndex].stock + newItem.quantity };
      }
    });

    setProducts(currentProducts);
    setTransactions(transactions.map(t => t.id === id ? {
      ...t,
      items,
      total,
      paymentMethod: paymentMethod || t.paymentMethod,
      date: date || t.date
    } : t));
  };

  const updateProduct = (updatedProduct: Product) => {
    setProducts(products.map(p => p.id === updatedProduct.id ? updatedProduct : p));
  };
  
  const addProduct = (product: Product) => {
    setProducts([...products, product]);
  };

  const deleteProduct = (productId: string) => {
    setProducts(products.filter(p => p.id !== productId));
  };

  const addExpense = (description: string, amount: number, category: string) => {
    const newExpense: Expense = {
      id: `EXP-${Date.now()}`,
      date: new Date().toISOString(),
      description,
      amount,
      category
    };
    setExpenses([newExpense, ...expenses]);
  };

  const updateExpense = (updatedExpense: Expense) => {
    setExpenses(expenses.map(e => e.id === updatedExpense.id ? updatedExpense : e));
  };

  const deleteExpense = (expenseId: string) => {
    setExpenses(expenses.filter(e => e.id !== expenseId));
  };

  const cancelSaleTransaction = (transactionId: string) => {
    const trx = transactions.find(t => t.id === transactionId);
    if (!trx || trx.type !== 'SALE') return;
    
    // Revert stock
    setProducts(products.map(p => {
      const returnedItem = trx.items.find(i => i.productId === p.id);
      if (returnedItem) {
        return { ...p, stock: p.stock + returnedItem.quantity };
      }
      return p;
    }));
    
    // Remove transaction
    setTransactions(transactions.filter(t => t.id !== transactionId));
  };

  const cancelPurchaseTransaction = (transactionId: string) => {
    const trx = transactions.find(t => t.id === transactionId);
    if (!trx || trx.type !== 'PURCHASE') return;
    
    // Revert stock (decrease)
    setProducts(products.map(p => {
      const returnedItem = trx.items.find(i => i.productId === p.id);
      if (returnedItem) {
        return { ...p, stock: p.stock - returnedItem.quantity };
      }
      return p;
    }));
    
    // Remove transaction
    setTransactions(transactions.filter(t => t.id !== transactionId));
  };

  const exportData = () => {
    return JSON.stringify({
      products,
      transactions,
      expenses,
      debts
    });
  };

  const importData = (jsonData: string) => {
    try {
      const parsed = JSON.parse(jsonData);
      if (parsed.products) setProducts(parsed.products);
      if (parsed.transactions) setTransactions(parsed.transactions);
      if (parsed.expenses) setExpenses(parsed.expenses);
      if (parsed.debts) setDebts(parsed.debts);
      return true;
    } catch (e) {
      console.error("Gagal mengimpor data:", e);
      return false;
    }
  };

  const resetData = () => {
    if (window.confirm("Peringatan: Semua data akan dihapus dan dikembalikan ke data awal. Anda yakin?")) {
      setProducts(INITIAL_PRODUCTS);
      setTransactions(INITIAL_TRANSACTIONS);
      setExpenses(INITIAL_EXPENSES);
      setDebts([]);
    }
  };

  return {
    products,
    transactions,
    expenses,
    debts,
    addSale,
    updateSale,
    addPurchase,
    updatePurchase,
    addExpense,
    updateExpense,
    deleteExpense,
    updateProduct,
    addProduct,
    deleteProduct,
    cancelSaleTransaction,
    cancelPurchaseTransaction,
    addDebt,
    addDebtPayment,
    updateDebt,
    deleteDebt,
    exportData,
    importData,
    resetData
  };
}

// Utility to format currency
export const formatIDR = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};
