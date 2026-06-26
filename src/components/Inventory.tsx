import React, { useState, useMemo } from 'react';
import { Product } from '../types';
import { formatIDR } from '../store';
import { Boxes, Search, Edit2, Plus, Trash2 } from 'lucide-react';

interface InventoryProps {
  products: Product[];
  onUpdateProduct: (product: Product) => void;
  onAddProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
}

export default function Inventory({ products, onUpdateProduct, onAddProduct, onDeleteProduct }: InventoryProps) {
  const [search, setSearch] = useState('');
  const [isEditing, setIsEditing] = useState<Product | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<Product>>({});

  const filteredProducts = useMemo(() => {
    return products.filter(p => 
      p.name.toLowerCase().includes(search.toLowerCase()) || 
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
    );
  }, [products, search]);

  const handleEditClick = (product: Product) => {
    setIsEditing(product);
    setFormData(product);
  };

  const handleAddClick = () => {
    setIsAdding(true);
    setFormData({
      id: `PRD-${Date.now()}`,
      name: '',
      sku: '',
      stock: 0,
      purchasePrice: 0,
      sellingPrice: 0,
      category: ''
    });
  };

  const handleCancel = () => {
    setIsEditing(null);
    setIsAdding(false);
    setFormData({});
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing) {
      onUpdateProduct(formData as Product);
      setIsEditing(null);
    } else if (isAdding) {
      onAddProduct(formData as Product);
      setIsAdding(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/20">
            <Boxes className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Manajemen Stok & Harga</h2>
            <p className="text-slate-400">Kelola master data produk Anda di sini.</p>
          </div>
        </div>
        <button onClick={handleAddClick} className="w-full md:w-auto bg-amber-500 hover:bg-amber-400 text-black px-4 py-2 rounded-lg font-bold flex justify-center items-center gap-2 transition-colors uppercase text-sm">
          <Plus className="w-4 h-4" /> Produk Baru
        </button>
      </div>

      {(isEditing || isAdding) && (
        <div className="bg-white/10 backdrop-blur-xl p-6 rounded-2xl border border-white/10 mb-6">
          <h3 className="font-bold text-white text-lg mb-4">{isEditing ? 'Edit Produk' : 'Tambah Produk Baru'}</h3>
          <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-semibold text-slate-400 tracking-wide">Nama Produk</label>
              <input required type="text" className="w-full bg-black/50 border border-white/10 text-white rounded-lg p-2 focus:border-amber-500 outline-none" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-semibold text-slate-400 tracking-wide">SKU (Kode Barang)</label>
              <input required type="text" className="w-full bg-black/50 border border-white/10 text-white rounded-lg p-2 focus:border-amber-500 outline-none" value={formData.sku || ''} onChange={e => setFormData({...formData, sku: e.target.value})} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-semibold text-slate-400 tracking-wide">Kategori</label>
              <input required type="text" className="w-full bg-black/50 border border-white/10 text-white rounded-lg p-2 focus:border-amber-500 outline-none" value={formData.category || ''} onChange={e => setFormData({...formData, category: e.target.value})} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-semibold text-slate-400 tracking-wide">Stok Awal</label>
              <input required type="number" min="0" className="w-full bg-black/50 border border-white/10 text-white rounded-lg p-2 focus:border-amber-500 outline-none" value={formData.stock || 0} onChange={e => setFormData({...formData, stock: parseInt(e.target.value) || 0})} disabled={isEditing !== null} title={isEditing ? "Stok diupdate via pembelian/penjualan" : ""} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-semibold text-slate-400 tracking-wide">Harga Beli (Modal)</label>
              <input required type="number" min="0" className="w-full bg-black/50 border border-white/10 text-white rounded-lg p-2 focus:border-amber-500 outline-none" value={formData.purchasePrice || 0} onChange={e => setFormData({...formData, purchasePrice: parseInt(e.target.value) || 0})} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-semibold text-slate-400 tracking-wide">Harga Jual</label>
              <input required type="number" min="0" className="w-full bg-black/50 border border-white/10 text-white rounded-lg p-2 focus:border-amber-500 outline-none" value={formData.sellingPrice || 0} onChange={e => setFormData({...formData, sellingPrice: parseInt(e.target.value) || 0})} />
            </div>
            <div className="md:col-span-2 flex justify-end gap-3 mt-4">
              <button type="button" onClick={handleCancel} className="px-4 py-2 border border-white/10 text-white hover:bg-white/5 rounded-lg font-bold transition-colors uppercase text-sm">Batal</button>
              <button type="submit" className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black rounded-lg font-bold transition-colors uppercase text-sm">Simpan</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Cari produk..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-black/50 border border-white/10 rounded-lg text-white focus:border-amber-500 outline-none placeholder-slate-500"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="text-[10px] uppercase text-slate-500 border-b border-white/5">
                <th className="px-6 py-4 font-semibold tracking-wider">Info Produk</th>
                <th className="px-6 py-4 font-semibold tracking-wider text-right">Harga Modal</th>
                <th className="px-6 py-4 font-semibold tracking-wider text-right">Harga Jual</th>
                <th className="px-6 py-4 font-semibold tracking-wider text-center">Stok</th>
                <th className="px-6 py-4 font-semibold tracking-wider text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-white/5">
              {filteredProducts.map(product => (
                <tr key={product.id} className="hover:bg-white/5">
                  <td className="px-6 py-4">
                    <div className="font-medium text-white">{product.name}</div>
                    <div className="text-xs text-slate-400">{product.sku} &bull; {product.category}</div>
                  </td>
                  <td className="px-6 py-4 text-right text-slate-400">{formatIDR(product.purchasePrice)}</td>
                  <td className="px-6 py-4 text-right font-bold text-amber-400">{formatIDR(product.sellingPrice)}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                      product.stock > 10 ? 'bg-white/10 text-slate-300' :
                      product.stock > 0 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/20' : 'bg-rose-500/20 text-rose-400 border border-rose-500/20'
                    }`}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button 
                        onClick={() => handleEditClick(product)}
                        className="text-slate-400 hover:text-amber-400 hover:bg-amber-500/20 transition-colors p-2 rounded-lg"
                        title="Edit Harga/Info"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => {
                          if (window.confirm(`Hapus produk ${product.name}?`)) {
                            onDeleteProduct(product.id);
                          }
                        }}
                        className="text-slate-400 hover:text-rose-400 hover:bg-rose-500/20 transition-colors p-2 rounded-lg"
                        title="Hapus Produk"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    Produk tidak ditemukan
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
