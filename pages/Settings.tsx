
import React, { useState, useEffect } from 'react';
import { Save, Upload, Trash2, Layout, Smartphone, Palette, CheckCircle2, Info } from 'lucide-react';
import { DB } from '../services/db.ts';
import { AppSettings } from '../types.ts';

const Settings: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings>(DB.getSettings());
  const [isSaved, setIsSaved] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'logoUrl' | 'appIconUrl') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettings({ ...settings, [field]: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const saveSettings = () => {
    DB.saveSettings(settings);
    setIsSaved(true);
    // Notifica o App.tsx para atualizar o branding em tempo real
    window.dispatchEvent(new Event('settingsUpdated'));
    setTimeout(() => setIsSaved(false), 3000);
  };

  const resetField = (field: 'logoUrl' | 'appIconUrl') => {
    setSettings({ ...settings, [field]: '' });
  };

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">Personalização</h1>
        <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest">Ajuste a identidade visual do seu sistema.</p>
      </div>

      {/* Alerta de Especificações Técnicas */}
      <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 p-4 rounded-lg flex items-start gap-3">
        <Info className="text-indigo-600 dark:text-indigo-400 shrink-0" size={20} />
        <div>
          <h4 className="text-[10px] font-black text-indigo-900 dark:text-indigo-100 uppercase tracking-widest mb-1">Guia de Dimensões</h4>
          <p className="text-[9px] text-indigo-700 dark:text-indigo-300 font-bold uppercase leading-relaxed">
            Para garantir que sua marca apareça com nitidez máxima em todos os dispositivos, use arquivos <span className="underline">.PNG</span> (fundo transparente) ou <span className="underline">.JPG</span>.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Nome do Sistema */}
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
              placeholder="EX: PERFUMARIA LUXO"
            />
            <p className="text-[8px] text-slate-400 mt-2 font-bold uppercase">Este nome aparecerá no título da aba e na barra lateral.</p>
          </div>
        </div>

        {/* Visualização de Branding */}
        <div className="bg-slate-950 p-6 rounded-lg border border-slate-800 shadow-xl flex flex-col items-center justify-center text-center">
          <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-4">Preview em Tempo Real</p>
          <div className="flex items-center gap-3 bg-slate-900 p-4 rounded-md border border-slate-800 w-full">
            {settings.logoUrl ? (
              <img src={settings.logoUrl} className="w-8 h-8 object-contain rounded" alt="Preview Logo" />
            ) : (
              <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center text-white font-black text-xs">P</div>
            )}
            <span className="text-white font-black uppercase italic tracking-tighter">{settings.systemName}</span>
          </div>
        </div>

        {/* Logo do Sistema */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Layout size={18} className="text-indigo-500" />
              <h3 className="text-[11px] font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest">Logo da Sidebar</h3>
            </div>
            <span className="text-[8px] font-black bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-indigo-600">RECOMENDADO: 256x256 px</span>
          </div>
          <div className="flex flex-col items-center p-6 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg relative group min-h-[140px] justify-center">
            {settings.logoUrl ? (
              <div className="relative group">
                <img src={settings.logoUrl} className="max-h-24 object-contain rounded-md" alt="Logo" />
                <button 
                  onClick={() => resetField('logoUrl')}
                  className="absolute -top-2 -right-2 p-1 bg-rose-600 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ) : (
              <label className="cursor-pointer flex flex-col items-center">
                <Upload size={32} className="text-slate-300 mb-2" />
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Subir Logo (1:1)</span>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'logoUrl')} />
              </label>
            )}
          </div>
          <p className="text-[8px] text-slate-400 text-center font-bold uppercase">Aparece ao lado do nome na barra lateral.</p>
        </div>

        {/* Ícone do App */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Smartphone size={18} className="text-indigo-500" />
              <h3 className="text-[11px] font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest">Ícone do App</h3>
            </div>
            <span className="text-[8px] font-black bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-indigo-600">RECOMENDADO: 512x512 px</span>
          </div>
          <div className="flex flex-col items-center p-6 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg relative group min-h-[140px] justify-center">
            {settings.appIconUrl ? (
              <div className="relative group">
                <img src={settings.appIconUrl} className="w-16 h-16 object-cover rounded-xl shadow-lg border-4 border-white dark:border-slate-800" alt="Icon" />
                <button 
                  onClick={() => resetField('appIconUrl')}
                  className="absolute -top-2 -right-2 p-1 bg-rose-600 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ) : (
              <label className="cursor-pointer flex flex-col items-center">
                <Smartphone size={32} className="text-slate-300 mb-2" />
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Subir Ícone (1:1)</span>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'appIconUrl')} />
              </label>
            )}
          </div>
          <p className="text-[8px] text-slate-400 text-center font-bold uppercase">Aparece na tela inicial do celular e no navegador.</p>
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-6 border-t dark:border-slate-800">
        <button 
          onClick={saveSettings}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-md text-[11px] font-black uppercase tracking-[0.2em] transition-all shadow-xl active:scale-95"
        >
          {isSaved ? <CheckCircle2 size={18} /> : <Save size={18} />}
          {isSaved ? 'ALTERAÇÕES SALVAS' : 'SALVAR BRANDING'}
        </button>
      </div>

      {isSaved && (
        <div className="fixed bottom-10 right-10 bg-emerald-600 text-white px-6 py-4 rounded-lg shadow-2xl animate-in fade-in slide-in-from-right-4 duration-300 z-50 flex items-center gap-3">
          <CheckCircle2 size={24} />
          <div className="flex flex-col">
            <span className="text-xs font-black uppercase tracking-widest">Sucesso</span>
            <span className="text-[10px] font-bold opacity-80 uppercase">A identidade visual foi atualizada em todo o sistema.</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
