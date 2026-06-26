export interface Product {
  id: string;
  name: string;
  sku: string;
  stock: number;
  purchasePrice: number;
  sellingPrice: number;
  category: string;
}

export interface TransactionItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Transaction {
  id: string;
  date: string;
  type: 'SALE' | 'PURCHASE';
  items: TransactionItem[];
  total: number;
  paymentMethod?: 'tunai' | 'tempo' | 'tf';
}

export interface Expense {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
}

export interface DebtPayment {
  id: string;
  date: string;
  amount: number;
}

export interface Debt {
  id: string;
  date: string;
  description: string;
  amount: number;
  paidAmount: number;
  status: 'UNPAID' | 'PAID';
  payments: DebtPayment[];
}
