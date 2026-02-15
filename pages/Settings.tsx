
import React, { useState, useEffect } from 'react';
import { Save, Upload, Trash2, Layout, Smartphone, Palette, CheckCircle2, Info, Lock, AlertTriangle } from 'lucide-react';
import { DB } from '../services/db.ts';
import { AppSettings } from '../types.ts';

const Settings: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings>(DB.getSettings());
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'logoUrl' | 'appIconUrl') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError("A imagem é muito grande! Use arquivos menores que 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new Image();
      img.src = reader.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = field === 'appIconUrl' ? 512 : 800;
        const scale = Math.min(1, MAX_WIDTH / img.width);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        const compressedData = canvas.toDataURL('image/jpeg', 0.7);
        setSettings(prev => ({ ...prev, [field]: compressedData }));
        setError(null);
      };
    };
    reader.readAsDataURL(file);
  };

  const saveSettings = () => {
    try {
      DB.saveSettings(settings);
      setIsSaved(true);
      window.dispatchEvent(new Event('settingsUpdated'));
      setTimeout(() => setIsSaved(false), 3000);
      setError(null);
    } catch (e) {
      setError("Erro ao salvar! Tente remover uma das imagens para liberar espaço.");
    }
  };

  const resetField = (field: 'logoUrl' | 'appIconUrl') => {
    setSettings({ ...settings, [field]: '' });
  };

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">Personalização</h1>
        <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest">Ajuste a identidade visual e segurança do seu sistema.</p>
      </div>

      {error && (
        <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 p-4 rounded-lg flex items-center gap-3 animate-bounce">
          <AlertTriangle className="text-rose-600" size={20} />
          <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Palette size={18} className="text-indigo-500" />
            <h3 className="text-[11px] font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest">Identidade Nominal</h3>
          </div>
          <div>
            <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Nome do Sistema / Empresa</label>
            <input 
              name="systemName"
              value={settings.systemName}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md focus:ring-1 focus:ring-indigo-500 text-xs font-black dark:text-white outline-none uppercase"
            />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Lock size={18} className="text-rose-500" />
            <h3 className="text-[11px] font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest">Segurança</h3>
          </div>
          <div>
            <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Senha do Sistema</label>
            <input 
              name="password"
              type="password"
              value={settings.password}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md focus:ring-1 focus:ring-indigo-500 text-xs font-black dark:text-white outline-none"
            />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Layout size={18} className="text-indigo-500" />
            <h3 className="text-[11px] font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest">Logo Principal</h3>
          </div>
          <div className="flex flex-col items-center p-6 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg relative min-h-[140px] justify-center">
            {settings.logoUrl ? (
              <div className="relative group">
                <img src={settings.logoUrl} className="max-h-24 object-contain rounded-md" alt="Logo" />
                <button onClick={() => resetField('logoUrl')} className="absolute -top-2 -right-2 p-1 bg-rose-600 text-white rounded-full"><Trash2 size={14} /></button>
              </div>
            ) : (
              <label className="cursor-pointer flex flex-col items-center">
                <Upload size={32} className="text-slate-300 mb-2" />
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Subir Logo</span>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'logoUrl')} />
              </label>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Smartphone size={18} className="text-indigo-500" />
            <h3 className="text-[11px] font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest">Ícone do Sistema</h3>
          </div>
          <div className="flex flex-col items-center p-6 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg relative min-h-[140px] justify-center">
            {settings.appIconUrl ? (
              <div className="relative group">
                <img src={settings.appIconUrl} className="w-16 h-16 object-cover rounded-xl shadow-lg" alt="Icon" />
                <button onClick={() => resetField('appIconUrl')} className="absolute -top-2 -right-2 p-1 bg-rose-600 text-white rounded-full"><Trash2 size={14} /></button>
              </div>
            ) : (
              <label className="cursor-pointer flex flex-col items-center">
                <Smartphone size={32} className="text-slate-300 mb-2" />
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Subir Ícone</span>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'appIconUrl')} />
              </label>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-6 border-t dark:border-slate-800">
        <button 
          onClick={saveSettings}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-md text-[11px] font-black uppercase tracking-[0.2em] transition-all shadow-xl active:scale-95 flex items-center gap-2"
        >
          {isSaved ? <CheckCircle2 size={18} /> : <Save size={18} />}
          {isSaved ? 'SALVO COM SUCESSO' : 'SALVAR ALTERAÇÕES'}
        </button>
      </div>
    </div>
  );
};

export default Settings;
