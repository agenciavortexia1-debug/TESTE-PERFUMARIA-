
import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  ShoppingBag,
  Clock, 
  Menu, 
  X,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  MessageSquare,
  BarChart3,
  History,
  Download,
  Settings as SettingsIcon,
  LogOut,
  Smartphone,
  Share,
  PlusSquare,
  CheckCircle2,
  Loader2,
  ShieldCheck
} from 'lucide-react';

import Dashboard from './pages/Dashboard.tsx';
import Customers from './pages/Customers.tsx';
import Inventory from './pages/Inventory.tsx';
import Sales from './pages/Sales.tsx';
import Receivables from './pages/Receivables.tsx';
import FollowUp from './pages/FollowUp.tsx';
import KPI from './pages/KPI.tsx';
import SalesHistory from './pages/SalesHistory.tsx';
import SettingsPage from './pages/Settings.tsx';
import Login from './pages/Login.tsx';
import { DB } from './services/db.ts';
import { AppSettings } from './types.ts';

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
    <path d="M38 72 C38 82 62 82 62 72 L62 55 C62 50 38 50 38 55 Z" stroke="currentColor" strokeWidth="2" />
    <rect x="47" y="46" width="6" height="4" fill="currentColor" />
    <circle cx="68" cy="65" r="5" fill="currentColor" />
  </svg>
);

const NavItem: React.FC<{ 
  to: string; 
  icon: any; 
  label: string; 
  active: boolean; 
  collapsed: boolean;
  onClick?: () => void 
}> = ({ to, icon: Icon, label, active, collapsed, onClick }) => (
  <Link 
    to={to} 
    onClick={onClick}
    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
      active 
        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-indigo-600'
    }`}
    title={collapsed ? label : ''}
  >
    <Icon size={20} className="flex-shrink-0" />
    {!collapsed && <span className="font-black text-[10px] uppercase tracking-[0.15em] whitespace-nowrap overflow-hidden text-ellipsis">{label}</span>}
  </Link>
);

interface AppContentProps {
  deferredPrompt: any;
  setDeferredPrompt: (p: any) => void;
}

const AppContent: React.FC<AppContentProps> = ({ deferredPrompt, setDeferredPrompt }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => sessionStorage.getItem('ef_auth') === 'true');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [settings, setSettings] = useState<AppSettings>(DB.getSettings());
  const [isInstalling, setIsInstalling] = useState(false);
  const [installProgress, setInstallProgress] = useState(0);
  const [showInstallGuide, setShowInstallGuide] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('ef_theme');
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  
  const location = useLocation();
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;

  const handleSettingsChange = useCallback(() => {
    const updatedSettings = DB.getSettings();
    setSettings(updatedSettings);
    document.title = updatedSettings.systemName;
    
    if (updatedSettings.appIconUrl) {
      const links = document.querySelectorAll("link[rel*='icon']");
      links.forEach(link => { (link as HTMLLinkElement).href = updatedSettings.appIconUrl; });
      const appleIcon = document.querySelector("link[rel='apple-touch-icon']");
      if (appleIcon) appleIcon.setAttribute('href', updatedSettings.appIconUrl);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('settingsUpdated', handleSettingsChange);
    handleSettingsChange();
    return () => window.removeEventListener('settingsUpdated', handleSettingsChange);
  }, [handleSettingsChange]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('ef_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('ef_theme', 'light');
    }
  }, [isDarkMode]);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowInstallGuide(true);
      return;
    }
    
    if (deferredPrompt) {
      setIsInstalling(true);
      setInstallProgress(0);

      const interval = setInterval(() => {
        setInstallProgress(prev => {
          if (prev >= 98) {
            clearInterval(interval);
            return 98;
          }
          return prev + Math.random() * 20;
        });
      }, 200);

      setTimeout(async () => {
        clearInterval(interval);
        setInstallProgress(100);
        
        try {
          deferredPrompt.prompt();
          const { outcome } = await deferredPrompt.userChoice;
          console.log('User choice outcome:', outcome);
          if (outcome === 'accepted') {
            setDeferredPrompt(null);
          }
        } catch (err) {
          console.error('Erro ao disparar prompt:', err);
          setShowInstallGuide(true);
        } finally {
          setIsInstalling(false);
        }
      }, 1200);
    } else {
      setShowInstallGuide(true);
    }
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
    sessionStorage.setItem('ef_auth', 'true');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('ef_auth');
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleSidebar = () => setIsCollapsed(!isCollapsed);
  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const navigation = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/kpi', icon: BarChart3, label: 'Desempenho' },
    { to: '/vendas', icon: ShoppingBag, label: 'PDV' },
    { to: '/historico', icon: History, label: 'Histórico' },
    { to: '/produtos', icon: Package, label: 'Estoque' },
    { to: '/clientes', icon: Users, label: 'Clientes' },
    { to: '/acompanhamento', icon: MessageSquare, label: 'Feedbacks' },
    { to: '/receber', icon: Clock, label: 'Contas' },
    { to: '/personalizar', icon: SettingsIcon, label: 'Personalizar' },
  ];

  const displayLogo = settings.logoUrl || settings.appIconUrl;

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      
      <header className="md:hidden bg-[#0f172a] border-b border-slate-800 px-5 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2">
          {displayLogo ? <img src={displayLogo} className="w-8 h-8 object-contain rounded-md" /> : <BrandLogoDefault className="text-[#E2D1B1]" />}
          <span className="font-black text-lg tracking-tighter text-white uppercase italic truncate max-w-[180px]">
            {settings.systemName}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={toggleTheme} className="p-2 text-slate-400">
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button onClick={toggleMenu} className="p-2 text-slate-400">
            <Menu size={24} />
          </button>
        </div>
      </header>

      <aside className={`
        fixed inset-y-0 left-0 z-50 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transform transition-all duration-400
        md:relative md:translate-x-0
        ${isCollapsed ? 'md:w-20' : 'md:w-64'}
        ${isMenuOpen ? 'translate-x-0 w-[280px] shadow-2xl' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className={`p-5 border-b border-slate-800 flex items-center bg-[#0f172a] text-white transition-all ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
           <div className="flex items-center gap-2 overflow-hidden">
            {displayLogo ? <img src={displayLogo} className="w-8 h-8 object-contain rounded-md flex-shrink-0" /> : <BrandLogoDefault className="text-[#E2D1B1] flex-shrink-0" />}
            {!isCollapsed && <span className="font-black text-lg uppercase italic tracking-tighter truncate">{settings.systemName}</span>}
          </div>
          <button onClick={() => setIsMenuOpen(false)} className="md:hidden p-2 text-slate-400">
            <X size={22}/>
          </button>
        </div>
        
        <nav className="px-4 space-y-2 mt-6">
          {navigation.map((item) => (
            <NavItem 
              key={item.to} 
              to={item.to}
              icon={item.icon}
              label={item.label}
              collapsed={isCollapsed}
              active={location.pathname === item.to}
              onClick={() => setIsMenuOpen(false)}
            />
          ))}
        </nav>

        <div className="absolute bottom-6 left-0 w-full px-4 space-y-1">
          {!isStandalone && (
            <button 
              onClick={handleInstallClick}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/10 hover:bg-indigo-100 dark:hover:bg-indigo-900/20 transition-all mb-1 ${isCollapsed ? 'justify-center' : ''}`}
            >
              <Download size={20} />
              {!isCollapsed && <span className="font-black text-[10px] uppercase tracking-widest text-left leading-tight">Instalar App<br/><span className="text-[7px] opacity-70">Download Oficial</span></span>}
            </button>
          )}

          <button onClick={handleLogout} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/10 ${isCollapsed ? 'justify-center' : ''}`}>
            <LogOut size={20} />
            {!isCollapsed && <span className="font-black text-[10px] uppercase tracking-widest">Sair</span>}
          </button>
          <button onClick={toggleTheme} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 ${isCollapsed ? 'justify-center' : ''}`}>
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            {!isCollapsed && <span className="font-black text-[10px] uppercase tracking-widest">{isDarkMode ? 'Dia' : 'Noite'}</span>}
          </button>
          <button onClick={toggleSidebar} className={`hidden md:flex w-full items-center gap-3 px-4 py-3 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 ${isCollapsed ? 'justify-center' : ''}`}>
            {isCollapsed ? <ChevronRight size={20} /> : <><ChevronLeft size={20} /><span className="font-black text-[10px] uppercase tracking-widest">Recolher</span></>}
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto min-h-screen-ios">
        <div className="max-w-7xl mx-auto p-4 md:p-10">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/vendas" element={<Sales />} />
            <Route path="/historico" element={<SalesHistory />} />
            <Route path="/produtos" element={<Inventory />} />
            <Route path="/clientes" element={<Customers />} />
            <Route path="/receber" element={<Receivables />} />
            <Route path="/acompanhamento" element={<FollowUp />} />
            <Route path="/kpi" element={<KPI />} />
            <Route path="/personalizar" element={<SettingsPage />} />
          </Routes>
        </div>
      </main>

      {isInstalling && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-[#020617] backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-xs p-8 text-center shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="relative w-32 h-32 mx-auto mb-8">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-slate-100 dark:text-slate-800"/>
                <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="6" fill="transparent" strokeDasharray={364.4} strokeDashoffset={364.4 - (364.4 * installProgress) / 100} className="text-indigo-600 transition-all duration-300 ease-out"/>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <Smartphone size={40} className="text-indigo-600 animate-pulse mb-1" />
                <span className="text-xs font-black text-indigo-600">{Math.round(installProgress)}%</span>
              </div>
            </div>
            <div className="flex items-center justify-center gap-2 mb-2">
              <ShieldCheck size={16} className="text-emerald-500" />
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">Preparando App</h3>
            </div>
          </div>
        </div>
      )}

      {showInstallGuide && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-sm shadow-2xl border border-slate-200 dark:border-slate-800 p-6 text-center">
            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-amber-600">
              <Smartphone size={24} />
            </div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase italic tracking-tighter mb-4">Instalação Manual</h2>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed mb-6">
              O instalador automático está em espera. <br/>
              1. Toque nos 3 pontinhos do Chrome <br/>
              2. Selecione "Instalar Aplicativo"
            </p>
            <button onClick={() => setShowInstallGuide(false)} className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all shadow-lg">Entendi</button>
          </div>
        </div>
      )}

      {isMenuOpen && <div className="fixed inset-0 bg-slate-950/80 z-40 md:hidden backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsMenuOpen(false)} />}
    </div>
  );
};

const App: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      console.log('Evento beforeinstallprompt capturado com sucesso na raiz!');
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  return (
    <Router>
      <AppContent deferredPrompt={deferredPrompt} setDeferredPrompt={setDeferredPrompt} />
    </Router>
  );
};

export default App;
