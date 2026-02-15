
import React, { useState, useEffect } from 'react';
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
  LogOut
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

// Ícone padrão caso nenhum seja enviado
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

const AppContent: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => sessionStorage.getItem('ef_auth') === 'true');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [settings, setSettings] = useState<AppSettings>(DB.getSettings());
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('ef_theme');
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  
  const location = useLocation();

  const updateDynamicManifest = (currentSettings: AppSettings) => {
    // Cria um manifesto dinâmico para que o ícone de instalação reflita o upload do usuário
    const iconUrl = currentSettings.appIconUrl || 'https://cdn-icons-png.flaticon.com/512/3062/3062250.png';
    const manifest = {
      "name": currentSettings.systemName,
      "short_name": currentSettings.systemName.split(' ')[0],
      "description": "Sistema de Gestão Personalizado",
      "start_url": "./index.html",
      "display": "standalone",
      "background_color": "#0f172a",
      "theme_color": "#4f46e5",
      "icons": [
        { "src": iconUrl, "sizes": "192x192", "type": "image/png" },
        { "src": iconUrl, "sizes": "512x512", "type": "image/png" }
      ]
    };
    
    const stringManifest = JSON.stringify(manifest);
    const blob = new Blob([stringManifest], {type: 'application/json'});
    const manifestURL = URL.createObjectURL(blob);
    
    const oldManifest = document.querySelector('link[rel="manifest"]');
    if (oldManifest) {
      oldManifest.setAttribute('href', manifestURL);
    }
  };

  useEffect(() => {
    const handleSettingsChange = () => {
      const updatedSettings = DB.getSettings();
      setSettings(updatedSettings);
      document.title = updatedSettings.systemName;
      
      // Atualiza Favicon
      if (updatedSettings.appIconUrl) {
        const links = document.querySelectorAll("link[rel*='icon']");
        links.forEach(link => { (link as HTMLLinkElement).href = updatedSettings.appIconUrl; });
        
        // Atualiza Apple Touch Icon
        const appleIcon = document.querySelector("link[rel='apple-touch-icon']");
        if (appleIcon) appleIcon.setAttribute('href', updatedSettings.appIconUrl);
      }
      
      updateDynamicManifest(updatedSettings);
    };

    window.addEventListener('settingsUpdated', handleSettingsChange);
    handleSettingsChange();
    return () => window.removeEventListener('settingsUpdated', handleSettingsChange);
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('ef_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('ef_theme', 'light');
    }
  }, [isDarkMode]);

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

  const SystemLogo = () => {
    // Prioriza Logo da Sidebar, se não houver, usa o Ícone do App, se não houver, usa o SVG padrão
    const displayImg = settings.logoUrl || settings.appIconUrl;
    if (displayImg) {
      return <img src={displayImg} alt="Logo" className="w-8 h-8 object-contain rounded-md" />;
    }
    return <BrandLogoDefault size={24} className="text-[#E2D1B1] flex-shrink-0" />;
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      
      {/* Header Mobile */}
      <header className="md:hidden bg-[#0f172a] border-b border-slate-800 px-5 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <SystemLogo />
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

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transform transition-all duration-400
        md:relative md:translate-x-0
        ${isCollapsed ? 'md:w-20' : 'md:w-64'}
        ${isMenuOpen ? 'translate-x-0 w-[280px] shadow-2xl' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className={`p-5 border-b border-slate-800 flex items-center bg-[#0f172a] text-white transition-all ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
           <div className="flex items-center gap-2 overflow-hidden">
            <SystemLogo />
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

        <div className="absolute bottom-6 left-0 w-full px-4 space-y-2">
          <button 
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/10 ${isCollapsed ? 'justify-center' : ''}`}
          >
            <LogOut size={20} />
            {!isCollapsed && <span className="font-black text-[10px] uppercase tracking-widest">Sair</span>}
          </button>
          <button 
            onClick={toggleTheme}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 ${isCollapsed ? 'justify-center' : ''}`}
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            {!isCollapsed && <span className="font-black text-[10px] uppercase tracking-widest">{isDarkMode ? 'Modo Dia' : 'Modo Noite'}</span>}
          </button>
          <button 
            onClick={toggleSidebar}
            className={`hidden md:flex w-full items-center gap-3 px-4 py-3 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 ${isCollapsed ? 'justify-center' : ''}`}
          >
            {isCollapsed ? <ChevronRight size={20} /> : <><ChevronLeft size={20} /><span className="font-black text-[10px] uppercase tracking-widest">Recolher</span></>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
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

      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/80 z-40 md:hidden backdrop-blur-sm animate-in fade-in duration-300" 
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </div>
  );
};

const App: React.FC = () => (
  <Router>
    <AppContent />
  </Router>
);

export default App;
