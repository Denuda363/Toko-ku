import React, { useState, useRef } from 'react';
import { Settings as SettingsIcon, Store, Printer, Bell, Shield, Database, Download, Upload, AlertTriangle } from 'lucide-react';

interface SettingsProps {
  onExportData?: () => string;
  onImportData?: (data: string) => boolean;
  onResetData?: () => void;
}

export default function Settings({ onExportData, onImportData, onResetData }: SettingsProps) {
  const [activeTab, setActiveTab] = useState('profil');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    if (!onExportData) return;
    const data = onExportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_kelontongku_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onImportData) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        if (window.confirm('Mengembalikan data dari file backup akan menimpa semua data saat ini. Anda yakin?')) {
          const success = onImportData(result);
          if (success) {
            alert('Data berhasil dipulihkan!');
          } else {
            alert('Gagal memulihkan data. File mungkin rusak atau tidak valid.');
          }
        }
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-slate-500/20 text-slate-300 rounded-xl border border-slate-500/20">
          <SettingsIcon className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Pengaturan</h2>
          <p className="text-slate-400">Konfigurasi aplikasi toko kelontong Anda.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-2">
          <SettingNav icon={Store} label="Profil Toko" active={activeTab === 'profil'} onClick={() => setActiveTab('profil')} />
          <SettingNav icon={Printer} label="Struk & Printer" active={activeTab === 'printer'} onClick={() => setActiveTab('printer')} />
          <SettingNav icon={Bell} label="Notifikasi" active={activeTab === 'notifikasi'} onClick={() => setActiveTab('notifikasi')} />
          <SettingNav icon={Shield} label="Keamanan & Akses" active={activeTab === 'keamanan'} onClick={() => setActiveTab('keamanan')} />
          <SettingNav icon={Database} label="Backup & Restore" active={activeTab === 'backup'} onClick={() => setActiveTab('backup')} />
        </div>

        <div className="md:col-span-2">
          {activeTab === 'profil' && (
            <div className="bg-black/20 backdrop-blur-xl rounded-2xl shadow-sm border border-white/10 p-6">
              <h3 className="text-lg font-bold text-white mb-6 border-b border-white/10 pb-4">Informasi Toko</h3>
              
              <form className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-semibold text-slate-400 tracking-wide">Nama Toko</label>
                  <input type="text" defaultValue="Dn-Toko Jaya" className="w-full bg-black/50 border border-white/10 text-white rounded-lg p-2.5 focus:border-slate-500 outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-semibold text-slate-400 tracking-wide">Nomor Telepon</label>
                  <input type="tel" defaultValue="081234567890" className="w-full bg-black/50 border border-white/10 text-white rounded-lg p-2.5 focus:border-slate-500 outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-semibold text-slate-400 tracking-wide">Alamat Lengkap</label>
                  <textarea rows={3} defaultValue="Jl. Merdeka No. 45, Kecamatan Maju, Kota Baru" className="w-full bg-black/50 border border-white/10 text-white rounded-lg p-2.5 focus:border-slate-500 outline-none"></textarea>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-semibold text-slate-400 tracking-wide">Pesan di Struk Bawah</label>
                  <input type="text" defaultValue="Terima kasih telah berbelanja di Dn-Toko!" className="w-full bg-black/50 border border-white/10 text-white rounded-lg p-2.5 focus:border-slate-500 outline-none" />
                </div>
                
                <div className="pt-4 flex justify-end">
                  <button type="button" className="bg-slate-200 hover:bg-white text-black px-6 py-2.5 rounded-lg font-bold transition-colors uppercase text-sm">
                    Simpan Perubahan
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'backup' && (
            <div className="bg-black/20 backdrop-blur-xl rounded-2xl shadow-sm border border-white/10 p-6 space-y-6">
              <h3 className="text-lg font-bold text-white mb-6 border-b border-white/10 pb-4">Manajemen Data</h3>
              
              <div className="space-y-4">
                <div className="p-4 rounded-xl border border-white/10 bg-white/5 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                  <div>
                    <h4 className="font-bold text-white">Backup Data</h4>
                    <p className="text-sm text-slate-400 mt-1">Unduh seluruh data (produk, transaksi, hutang, pengeluaran) ke perangkat Anda sebagai file cadangan.</p>
                  </div>
                  <button onClick={handleExport} className="shrink-0 flex items-center gap-2 bg-purple-500 hover:bg-purple-400 text-white px-4 py-2 rounded-lg font-bold transition-colors uppercase text-xs">
                    <Download className="w-4 h-4" /> Backup Sekarang
                  </button>
                </div>

                <div className="p-4 rounded-xl border border-white/10 bg-white/5 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                  <div>
                    <h4 className="font-bold text-white">Restore Data</h4>
                    <p className="text-sm text-slate-400 mt-1">Pulihkan data dari file backup yang pernah Anda unduh. <span className="text-amber-400">Data saat ini akan tertimpa.</span></p>
                  </div>
                  <div>
                    <input 
                      type="file" 
                      accept=".json" 
                      ref={fileInputRef} 
                      onChange={handleImport} 
                      className="hidden" 
                    />
                    <button onClick={() => fileInputRef.current?.click()} className="shrink-0 flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-2 rounded-lg font-bold transition-colors uppercase text-xs">
                      <Upload className="w-4 h-4" /> Pilih File Backup
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/5 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mt-8">
                  <div>
                    <h4 className="font-bold text-rose-400 flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Reset Data Aplikasi</h4>
                    <p className="text-sm text-slate-400 mt-1">Hapus semua data secara permanen dan kembalikan ke pengaturan awal. <span className="font-bold">Tindakan ini tidak dapat dibatalkan.</span></p>
                  </div>
                  <button onClick={onResetData} className="shrink-0 bg-rose-500 hover:bg-rose-400 text-white px-4 py-2 rounded-lg font-bold transition-colors uppercase text-xs">
                    Reset Semua Data
                  </button>
                </div>
              </div>
            </div>
          )}

          {['printer', 'notifikasi', 'keamanan'].includes(activeTab) && (
            <div className="bg-black/20 backdrop-blur-xl rounded-2xl shadow-sm border border-white/10 p-6 flex flex-col items-center justify-center min-h-[300px] text-center">
              <div className="p-4 bg-white/5 rounded-full mb-4">
                <SettingsIcon className="w-8 h-8 text-slate-500" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Fitur Belum Tersedia</h3>
              <p className="text-slate-400 max-w-sm">Pengaturan untuk menu ini sedang dalam tahap pengembangan dan akan segera hadir.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SettingNav({ icon: Icon, label, active = false, onClick }: any) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold uppercase tracking-wide transition-colors ${
      active ? 'bg-white/10 text-white border border-white/10' : 'text-slate-400 hover:text-white hover:bg-white/5'
    }`}>
      <Icon className="w-5 h-5" />
      {label}
    </button>
  );
}
