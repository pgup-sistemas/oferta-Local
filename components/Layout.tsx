
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, Heart, User, QrCode, Store, LogIn, PlusCircle, 
  BarChart2, ChevronLeft, ChevronRight, Bell, LogOut, 
  Package, Menu, X, Megaphone 
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';
import OnboardingTour from './OnboardingTour';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Desktop Sidebar State
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  // Mobile Drawer State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Navigation items based on role
  const getNavItems = () => {
    if (!user) {
      return [
        { icon: Home, label: 'Início', path: '/' },
        { icon: LogIn, label: 'Entrar', path: '/login' },
      ];
    }

    if (user.role === UserRole.BUSINESS) {
      return [
        { icon: BarChart2, label: 'Dashboard', path: '/dashboard' },
        { icon: Package, label: 'Estoque', path: '/inventory' },
        { icon: Megaphone, label: 'Campanhas', path: '/campaigns' },
        { icon: PlusCircle, label: 'Nova Oferta', path: '/new-promo' },
        { icon: QrCode, label: 'Validar', path: '/validate' },
        { icon: User, label: 'Perfil', path: '/profile' },
      ];
    }

    // Standard User
    return [
      { icon: Home, label: 'Início', path: '/' },
      { icon: Heart, label: 'Favoritos', path: '/favorites' },
      { icon: QrCode, label: 'Ler QR', path: '/scanner' },
      { icon: Bell, label: 'Alertas', path: '/notifications' },
      { icon: User, label: 'Perfil', path: '/profile' },
    ];
  };

  const navItems = getNavItems();

  // Helper to render nav links (used in both Desktop Sidebar and Mobile Drawer)
  const renderNavLinks = (mobile = false) => (
    <nav className={`space-y-2 ${mobile ? 'px-4 mt-6' : 'p-3 mt-2'}`}>
      {navItems.map((item) => (
        <button
          key={item.path}
          onClick={() => navigate(item.path)}
          title={!mobile && isSidebarCollapsed ? item.label : ''}
          className={`w-full flex items-center rounded-xl transition-all duration-200 group relative ${
            isActive(item.path)
              ? 'bg-primary-50 text-primary-700 font-bold'
              : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
          } ${
            !mobile && isSidebarCollapsed 
              ? 'justify-center p-3' 
              : 'px-4 py-3 gap-3'
          }`}
        >
          <item.icon 
            size={22} 
            className={`transition-transform duration-200 ${
              isActive(item.path) ? 'scale-110' : 'group-hover:scale-110'
            }`} 
          />
          
          <span className={`whitespace-nowrap transition-all duration-300 ${
            !mobile && isSidebarCollapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100 block'
          }`}>
            {item.label}
          </span>

          {/* Active Dot Indicator for Collapsed Desktop */}
          {!mobile && isSidebarCollapsed && isActive(item.path) && (
            <div className="absolute right-2 top-2 w-1.5 h-1.5 bg-primary-500 rounded-full"></div>
          )}
        </button>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row overflow-x-hidden font-sans">
      
      <OnboardingTour />

      {/* ==================================================
          MOBILE DRAWER (OVERLAY SIDEBAR)
      ================================================== */}
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300 ${
          isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* Drawer */}
      <aside 
        className={`fixed inset-y-0 left-0 w-72 bg-white z-50 md:hidden transform transition-transform duration-300 ease-in-out shadow-2xl flex flex-col ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-5 flex items-center justify-between border-b border-gray-100 h-16">
          <div className="flex items-center gap-3">
            <div className="bg-primary-600 p-1.5 rounded-lg shadow-sm">
              <Store className="text-white h-5 w-5" />
            </div>
            <span className="font-bold text-lg text-gray-900 tracking-tight">Oferta Local</span>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        {/* Mobile User Info Header */}
        {user && (
          <div className="p-5 bg-gray-50 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <img 
                src={user.avatar_url || "https://via.placeholder.com/40"} 
                alt="User" 
                className="w-12 h-12 rounded-full border-2 border-white shadow-sm" 
              />
              <div className="overflow-hidden">
                <p className="font-bold text-gray-900 truncate">{user.name}</p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto no-scrollbar">
          {renderNavLinks(true)}
        </div>

        {/* Mobile Logout */}
        {user && (
          <div className="p-4 border-t border-gray-100">
            <button 
              onClick={() => { logout(); navigate('/login'); }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors font-medium"
            >
              <LogOut size={22} />
              <span>Sair da Conta</span>
            </button>
          </div>
        )}
      </aside>


      {/* ==================================================
          DESKTOP SIDEBAR (Fixed Left)
      ================================================== */}
      <aside 
        className={`hidden md:flex flex-col bg-white border-r border-gray-200 h-screen sticky top-0 z-30 transition-all duration-300 ease-in-out shadow-sm ${
          isSidebarCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Toggle Button */}
        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="absolute -right-3 top-9 bg-white border border-gray-200 rounded-full p-1 text-gray-500 hover:text-primary-600 hover:border-primary-300 shadow-sm transition-colors z-40"
        >
          {isSidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        {/* Logo Section */}
        <div className={`p-6 flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3'} border-b border-gray-100 h-20 transition-all`}>
          <div className="bg-primary-600 p-2 rounded-xl shadow-lg shadow-primary-500/20 flex-shrink-0">
            <Store className="text-white h-6 w-6" />
          </div>
          <div className={`overflow-hidden transition-all duration-300 ${isSidebarCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
            <span className="font-bold text-xl text-gray-900 tracking-tight whitespace-nowrap">Oferta Local</span>
          </div>
        </div>
        
        {/* Navigation */}
        <div className="flex-1 overflow-y-auto no-scrollbar">
          {renderNavLinks(false)}
        </div>

        {/* User Footer */}
        {user && (
          <div className="p-4 border-t border-gray-100 bg-gray-50/30">
            <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center flex-col gap-2' : 'gap-3'} mb-2 transition-all`}>
              <img 
                src={user.avatar_url || "https://via.placeholder.com/40"} 
                alt="User" 
                className="w-10 h-10 rounded-full border-2 border-white shadow-sm flex-shrink-0" 
              />
              
              <div className={`overflow-hidden transition-all duration-300 ${isSidebarCollapsed ? 'w-0 h-0 opacity-0' : 'w-auto opacity-100'}`}>
                <p className="text-sm font-bold text-gray-900 truncate max-w-[140px]">{user.name}</p>
                <p className="text-xs text-gray-500 truncate capitalize">{user.role === 'business' ? 'Comerciante' : 'Consumidor'}</p>
              </div>
            </div>
            
            <button 
              onClick={() => { logout(); navigate('/login'); }}
              title="Sair"
              className={`w-full flex items-center rounded-lg text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors ${
                isSidebarCollapsed ? 'justify-center p-2' : 'gap-2 px-3 py-2'
              }`}
            >
              <LogOut size={18} />
              <span className={`transition-all duration-300 ${isSidebarCollapsed ? 'w-0 opacity-0 hidden' : 'block'}`}>Sair</span>
            </button>
          </div>
        )}
      </aside>


      {/* ==================================================
          MAIN CONTENT AREA
      ================================================== */}
      <div className="flex-1 flex flex-col min-w-0 h-screen">
        
        {/* MOBILE HEADER (Sticky) */}
        <header className="md:hidden fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md border-b border-gray-200 z-20 px-4 h-16 flex items-center justify-between shadow-sm transition-all">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Menu size={24} />
            </button>
            <div className="flex items-center gap-2" onClick={() => navigate('/')}>
              <div className="bg-primary-600 p-1 rounded-md shadow-sm">
                <Store className="text-white h-4 w-4" />
              </div>
              <h1 className="font-bold text-lg text-gray-900 tracking-tight">Oferta Local</h1>
            </div>
          </div>

          {user ? (
            <div 
              className="w-9 h-9 rounded-full bg-primary-100 border border-primary-200 p-0.5 cursor-pointer hover:scale-105 transition-transform" 
              onClick={() => navigate('/profile')}
            >
              <img src={user.avatar_url} className="w-full h-full rounded-full object-cover" alt="Avatar" />
            </div>
          ) : (
             <button onClick={() => navigate('/login')} className="text-sm font-bold text-primary-600 bg-primary-50 px-3 py-1.5 rounded-lg">Entrar</button>
          )}
        </header>

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-gray-50 scroll-smooth">
           {/* Padding top for mobile header, padding bottom for mobile nav */}
           <div className="max-w-5xl mx-auto p-4 md:p-8 pt-20 pb-24 md:pt-8 md:pb-8 animate-in fade-in duration-300 min-h-full">
            {children}
          </div>
        </main>
      </div>


      {/* ==================================================
          MOBILE BOTTOM NAV (Frequent Actions)
      ================================================== */}
      <nav className="md:hidden fixed bottom-0 w-full bg-white border-t border-gray-200 flex justify-around items-center pb-[env(safe-area-inset-bottom)] h-[calc(60px+env(safe-area-inset-bottom))] z-30 shadow-[0_-4px_10px_-1px_rgba(0,0,0,0.05)]">
        {navItems.slice(0, 5).map((item) => {
          const active = isActive(item.path);
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-all active:scale-95 ${
                active ? 'text-primary-600' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <div className={`p-1 rounded-xl transition-all ${active ? 'bg-primary-50 -translate-y-1 shadow-sm' : ''}`}>
                <item.icon size={24} strokeWidth={active ? 2.5 : 2} />
              </div>
              <span className={`text-[10px] font-medium transition-all ${active ? 'opacity-100 font-bold' : 'opacity-80'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

    </div>
  );
};

export default Layout;
