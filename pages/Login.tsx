
import React, { useState, useEffect } from 'react';
import { Lock, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { DB } from '../services/db.ts';

interface LoginProps {
  onLogin: () => void;
}

const BrandLogoDefault: React.FC<{ size?: number; className?: string }> = ({ size = 24, className = "" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 100 100" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path d="M50 5 L93 30 L93 70 L50 95 L7 70 L7 30 Z" stroke="currentColor" strokeWidth="2.5" />
    <path d="M50 12 L86 32 L86 68 L50 88 L14 68 L14 32 Z" stroke="currentColor" strokeWidth="1" opacity="0.7" />
    <circle cx="50" cy="50" r="15" stroke="currentColor" strokeWidth="1" />
  </svg>
);

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const settings = DB.getSettings();

  const handleLogin = (e?: React.FormEvent) => {
    e?.preventDefault();
    const correctPassword = settings.password || '1234';
    
    if (password === correctPassword) {
      setError(false);
      onLogin();
    } else {
      setError(true);
      setPassword('');
      // Shake effect or feedback
    }
  };

  const SystemLogo = () => {
    if (settings.logoUrl) {
      return <img src={settings.logoUrl} alt="Logo" className="w-16 h-16 object-contain rounded-md mb-4" />;
    }
    return <BrandLogoDefault size={48} className="text-indigo-400 mb-4" />;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] p-6 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-900/10 rounded-full blur-[120px]"></div>

      <div className="w-full max-w-sm z-10 animate-in fade-in zoom-in-95 duration-500">
        <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800 p-10 rounded-2xl shadow-2xl text-center">
          <div className="flex flex-col items-center">
            <SystemLogo />
            <h1 className="text-xl font-black text-white uppercase italic tracking-tighter mb-1">
              {settings.systemName}
            </h1>
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mb-8">Acesso Restrito</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative group">
              <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${error ? 'text-rose-500' : 'text-slate-500 group-focus-within:text-indigo-500'}`} size={16} />
              <input 
                autoFocus
                type="password"
                placeholder="DIGITE A SENHA..."
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(false);
                }}
                className={`w-full pl-12 pr-4 py-4 bg-slate-950 border rounded-lg text-xs font-black text-white outline-none transition-all uppercase tracking-widest ${error ? 'border-rose-500 ring-1 ring-rose-500/20' : 'border-slate-800 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600/30'}`}
              />
            </div>

            {error && (
              <div className="flex items-center justify-center gap-2 text-[10px] font-black text-rose-500 uppercase animate-bounce mt-2">
                <AlertCircle size={12} />
                Senha Incorreta
              </div>
            )}

            <button 
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-lg text-[11px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 shadow-xl shadow-indigo-600/10 active:scale-95"
            >
              <ShieldCheck size={16} />
              Entrar no Sistema
              <ArrowRight size={14} className="opacity-50" />
            </button>
          </form>

          <p className="mt-8 text-[8px] font-bold text-slate-600 uppercase tracking-widest">
            Perfumaria Digital &copy; 2024
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
