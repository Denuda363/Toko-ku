import React from 'react';
import { Settings as SettingsIcon, Store, Printer, Bell, Shield, Database } from 'lucide-react';

export default function Settings() {
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
          <SettingNav icon={Store} label="Profil Toko" active />
          <SettingNav icon={Printer} label="Struk & Printer" />
          <SettingNav icon={Bell} label="Notifikasi" />
          <SettingNav icon={Shield} label="Keamanan & Akses" />
          <SettingNav icon={Database} label="Backup & Restore" />
        </div>

        <div className="md:col-span-2">
          <div className="bg-black/20 backdrop-blur-xl rounded-2xl shadow-sm border border-white/10 p-6">
            <h3 className="text-lg font-bold text-white mb-6 border-b border-white/10 pb-4">Informasi Toko</h3>
            
            <form className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-semibold text-slate-400 tracking-wide">Nama Toko</label>
                <input type="text" defaultValue="KelontongKu Jaya" className="w-full bg-black/50 border border-white/10 text-white rounded-lg p-2.5 focus:border-slate-500 outline-none" />
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
                <input type="text" defaultValue="Terima kasih telah berbelanja di KelontongKu!" className="w-full bg-black/50 border border-white/10 text-white rounded-lg p-2.5 focus:border-slate-500 outline-none" />
              </div>
              
              <div className="pt-4 flex justify-end">
                <button type="button" className="bg-slate-200 hover:bg-white text-black px-6 py-2.5 rounded-lg font-bold transition-colors uppercase text-sm">
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingNav({ icon: Icon, label, active = false }: any) {
  return (
    <button className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold uppercase tracking-wide transition-colors ${
      active ? 'bg-white/10 text-white border border-white/10' : 'text-slate-400 hover:text-white hover:bg-white/5'
    }`}>
      <Icon className="w-5 h-5" />
      {label}
    </button>
  );
}
