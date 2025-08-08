import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  FileText,
  Users,
  Brain,
  BookOpen,
  Scale,
  LogOut,
  ChevronLeft,
  Settings,
  Menu,
  X,
  Shield,
  Tag,
  PanelLeft,
  GripVertical,
  Layers,
  Target
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { StudyProLogo } from '@/components/ui/StudyProLogo';
import { useAuthStore } from '@/store/authStore';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/utils/cn';

const adminNavItems = [
  {
    title: 'COMANDO CENTRAL',
    icon: LayoutDashboard,
    path: '/admin/dashboard'
  },
  {
    title: 'ARSENAL OPERACIONAL',
    icon: FileText,
    path: '/admin/content'
  },
  {
    title: 'MISSÕES TÁTICAS',
    icon: BookOpen,
    path: '/admin/courses'
  },
  {
    title: 'BRIEFINGS INTEL',
    icon: FileText,
    path: '/admin/summaries'
  },
  {
    title: 'CÓDIGOS OPERACIONAIS',
    icon: Scale,
    path: '/admin/legislation'
  },
  {
    title: 'GESTÃO DE TROPAS',
    icon: Users,
    path: '/admin/users'
  },
  {
    title: 'BANCO TÁTICO',
    icon: Brain,
    path: '/admin/questions'
  },
  {
    title: 'ARSENAL INTEL',
    icon: Layers,
    path: '/admin/flashcards'
  },
  {
    title: 'OPERAÇÕES TÁTICAS',
    icon: Target,
    path: '/admin/mock-exams'
  },
  {
    title: 'MISSÕES ANTERIORES',
    icon: FileText,
    path: '/admin/previous-exams'
  },
  {
    title: 'CLASSIFICAÇÕES',
    icon: Tag,
    path: '/admin/categories'
  }
];

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, clearAuth } = useAuthStore();
  const { resolvedTheme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(280);
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Sidebar configuration constants
  const SIDEBAR_CONFIG = {
    MIN_WIDTH: 200,
    MAX_WIDTH: 430, // 280px + 150px
    COLLAPSED_WIDTH: 80,
    DEFAULT_WIDTH: 280,
    RESIZE_DELAY: 200,
    ANIMATION_DURATION: 300
  };

  useEffect(() => {
    // Load saved width from localStorage
    const savedWidth = localStorage.getItem('adminSidebarWidth');
    if (savedWidth) {
      setSidebarWidth(Number(savedWidth));
    }
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      
      const newWidth = e.clientX;
      if (newWidth >= SIDEBAR_CONFIG.MIN_WIDTH && newWidth <= SIDEBAR_CONFIG.MAX_WIDTH) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      if (isResizing) {
        setIsResizing(false);
        // Save width to localStorage
        localStorage.setItem('adminSidebarWidth', sidebarWidth.toString());
      }
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      // Prevent text selection while resizing
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'col-resize';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
  }, [isResizing, sidebarWidth]);

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  const handleBackToStudent = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-50 to-white dark:from-black dark:via-gray-900 dark:to-gray-800 relative">
      {/* Tactical Background Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.08] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(250,204,21,0.3) 1px, transparent 0)',
          backgroundSize: '20px 20px'
        }}
      />
      {/* Mobile Header */}
      <div className="lg:hidden bg-gradient-to-r from-gray-800 via-[#14242f] to-gray-900 border-b-4 border-accent-500 p-4 relative overflow-hidden">
        {/* Tactical Corner Accents */}
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-accent-500/30" />
        <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-accent-500/20" />
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <StudyProLogo variant="full" size="sm" />
            <div className="w-px h-8 bg-accent-500/50" />
            <span className="font-police-title text-accent-500 text-sm uppercase tracking-ultra-wide font-bold">ADMIN</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle className="border-accent-500/30 hover:border-accent-500" />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="text-white hover:text-accent-500 hover:bg-white/10 border border-accent-500/30 hover:border-accent-500"
            >
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex h-screen">
        {/* Sidebar */}
        <motion.aside
          ref={sidebarRef}
          initial={{ x: -250 }}
          animate={{ 
            x: 0,
            width: isCollapsed ? SIDEBAR_CONFIG.COLLAPSED_WIDTH : sidebarWidth 
          }}
          className={cn(
            'fixed lg:relative z-20 h-full transition-transform duration-300 shadow-2xl',
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full',
            'lg:translate-x-0 relative overflow-hidden',
            // Military/Tactical gradient background
            'bg-gradient-to-b from-gray-800 via-[#14242f] to-gray-900',
            'border-r-4 border-accent-500 shadow-2xl shadow-accent-500/20'
          )}
        >
          {/* Tactical Side Stripe */}
          <div className="absolute right-0 top-0 w-1 h-full bg-gradient-to-b from-accent-500 via-accent-600 to-accent-500 opacity-80" />
          
          {/* Tactical Pattern Overlay */}
          <div 
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage: `repeating-linear-gradient(
                45deg,
                transparent,
                transparent 35px,
                rgba(250, 204, 21, 0.1) 35px,
                rgba(250, 204, 21, 0.1) 70px
              )`
            }}
          />
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="p-6 border-b-4 border-accent-500/30 bg-gradient-to-r from-gray-900/50 to-gray-800/50 hidden lg:block relative overflow-hidden">
              {/* Corner Accents */}
              <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-accent-500/40" />
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-accent-500/20" />
              <div className={`${isCollapsed ? "flex justify-center" : "flex flex-col"} relative z-10`}>
                <StudyProLogo 
                  variant={isCollapsed ? "icon" : "full"} 
                  size={isCollapsed ? "sm" : "md"}
                  className="flex-shrink-0"
                />
                {!isCollapsed && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2, delay: 0.1 }}
                    className="mt-3 flex items-center gap-2 p-3 rounded-lg bg-gradient-to-r from-accent-500/10 to-accent-600/5 border-2 border-accent-500/20 backdrop-blur-sm"
                  >
                    <Shield className="w-5 h-5 text-accent-500" />
                    <span className="text-sm font-bold font-police-title uppercase tracking-ultra-wide text-white">COMANDO CENTRAL</span>
                  </motion.div>
                )}
              </div>
            </div>

            {/* User Info */}
            <div className="p-4 border-b-4 border-accent-500/30 bg-gradient-to-r from-gray-800/30 to-gray-700/30 relative">
              {/* Tactical Stripe */}
              <div className="absolute left-0 top-0 w-1 h-full bg-accent-500/60" />
              <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
                <div className="relative">
                  <img
                    src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name}&background=14242f&color=facc15`}
                    alt={user?.name}
                    className="w-12 h-12 rounded-full flex-shrink-0 border-3 border-accent-500 shadow-lg shadow-accent-500/30"
                  />
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-accent-500 rounded-full border-2 border-gray-900 animate-pulse" />
                </div>
                {!isCollapsed && (
                  <motion.div 
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex-1 min-w-0"
                  >
                    <p className="text-sm font-bold truncate font-police-body text-white">
                      {user?.name}
                    </p>
                    <p className="text-xs truncate font-police-title uppercase tracking-ultra-wide text-accent-500 font-bold">
                      COMANDO TÁTICO
                    </p>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Navigation */}
            <nav className={cn(
              "flex-1 relative",
              isCollapsed ? 'px-2 py-4 overflow-hidden' : 'p-4 overflow-y-auto',
              // Tactical background gradient
              'bg-gradient-to-b from-transparent via-gray-900/5 to-gray-900/20'
            )}>
              {/* Navigation Background Pattern */}
              <div 
                className="absolute inset-0 opacity-[0.05] pointer-events-none"
                style={{
                  backgroundImage: `repeating-linear-gradient(
                    90deg,
                    transparent,
                    transparent 10px,
                    rgba(250, 204, 21, 0.1) 10px,
                    rgba(250, 204, 21, 0.1) 11px
                  )`
                }}
              />
              <ul className="space-y-2">
                {adminNavItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <li key={item.path}>
                      <div className="relative group">
                        <Link
                          to={item.path}
                          onClick={() => setIsSidebarOpen(false)}
                          className={cn(
                            'flex items-center rounded-lg transition-all duration-300 font-police-body font-semibold relative overflow-hidden group',
                            isCollapsed ? 'justify-center px-3 py-3' : 'gap-3 px-4 py-3.5',
                            // Active state - Military Command Style
                            isActive && 'bg-gradient-to-r from-accent-500/20 via-accent-500/10 to-transparent text-accent-500 border-l-4 border-l-accent-500 shadow-lg shadow-accent-500/20 backdrop-blur-sm',
                            // Inactive state - Tactical hover effects
                            !isActive && 'text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-gray-700/50 hover:to-transparent hover:border-l-4 hover:border-l-accent-500/50 hover:shadow-md'
                          )}
                        >
                          {/* Tactical Corner Accent for Active */}
                          {isActive && (
                            <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-accent-500/60" />
                          )}
                          
                          {/* Hover Tactical Stripe */}
                          <div className="absolute left-0 top-0 w-1 h-full bg-accent-500/0 group-hover:bg-accent-500/60 transition-all duration-300" />
                        >
                          <item.icon className={cn(
                            "w-5 h-5 flex-shrink-0 relative z-10",
                            isActive && "text-accent-500 drop-shadow-lg",
                            !isActive && "group-hover:text-accent-500 group-hover:scale-110 transition-all duration-300"
                          )} />
                          {!isCollapsed && (
                            <motion.span 
                              initial={{ opacity: 0, width: 0 }}
                              animate={{ opacity: 1, width: "auto" }}
                              exit={{ opacity: 0, width: 0 }}
                              transition={{ duration: 0.2 }}
                              className="font-bold whitespace-nowrap overflow-hidden tracking-wider uppercase text-sm relative z-10"
                            >
                              {item.title}
                            </motion.span>
                          )}
                        </Link>
                        
                        {/* Tactical Tooltip for collapsed state */}
                        {isCollapsed && (
                          <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-4 py-3 text-sm rounded-lg shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-50 bg-gradient-to-r from-gray-900 via-[#14242f] to-gray-800 text-white border-2 border-accent-500/50 backdrop-blur-md">
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-900"></div>
                            {/* Tactical accent */}
                            <div className="absolute top-0 right-0 w-2 h-2 bg-accent-500/60 rounded-br-lg" />
                            <span className="font-police-body font-semibold uppercase tracking-wider">{item.title}</span>
                          </div>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* Footer Actions */}
            <div className={cn(
              "border-t-4 border-accent-500/30 space-y-2 relative",
              isCollapsed ? 'px-2 py-4' : 'p-4',
              'bg-gradient-to-t from-gray-900/50 via-gray-800/30 to-transparent'
            )}>
              {/* Footer Tactical Elements */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent-500/50 to-transparent" />
              <div className="relative group">
                <Button
                  variant="ghost"
                  className={cn(
                    'w-full flex items-center rounded-lg transition-all duration-300 font-police-body font-semibold border border-transparent group relative overflow-hidden',
                    isCollapsed ? 'justify-center px-3 py-3' : 'justify-start gap-3 px-4 py-3',
                    'text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-gray-700/50 hover:to-transparent hover:border-l-4 hover:border-l-accent-500/60 hover:shadow-md'
                  )}
                  onClick={handleBackToStudent}
                >
                  {/* Hover Tactical Stripe */}
                  <div className="absolute left-0 top-0 w-1 h-full bg-accent-500/0 group-hover:bg-accent-500/60 transition-all duration-300" />
                  
                  <ChevronLeft className="w-5 h-5 flex-shrink-0 group-hover:text-accent-500 group-hover:scale-110 transition-all duration-300 relative z-10" />
                  {!isCollapsed && (
                    <motion.span 
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                      className="font-bold whitespace-nowrap overflow-hidden tracking-wider uppercase text-sm relative z-10"
                    >
                      VOLTAR AO PORTAL
                    </motion.span>
                  )}
                </Button>
                {isCollapsed && (
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-4 py-3 text-sm rounded-lg shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-50 bg-gradient-to-r from-gray-900 via-[#14242f] to-gray-800 text-white border-2 border-accent-500/50 backdrop-blur-md">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-900"></div>
                    <div className="absolute top-0 right-0 w-2 h-2 bg-accent-500/60 rounded-br-lg" />
                    <span className="font-police-body font-semibold uppercase tracking-wider">VOLTAR AO PORTAL</span>
                  </div>
                )}
              </div>

              <div className="relative group">
                <Button
                  variant="ghost"
                  className={cn(
                    'w-full flex items-center rounded-lg transition-all duration-300 font-police-body font-semibold border border-transparent group relative overflow-hidden',
                    isCollapsed ? 'justify-center px-3 py-3' : 'justify-start gap-3 px-4 py-3',
                    'text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-gray-700/50 hover:to-transparent hover:border-l-4 hover:border-l-accent-500/60 hover:shadow-md'
                  )}
                  onClick={() => navigate('/admin/settings')}
                >
                  {/* Hover Tactical Stripe */}
                  <div className="absolute left-0 top-0 w-1 h-full bg-accent-500/0 group-hover:bg-accent-500/60 transition-all duration-300" />
                  
                  <Settings className="w-5 h-5 flex-shrink-0 group-hover:text-accent-500 group-hover:scale-110 transition-all duration-300 relative z-10" />
                  {!isCollapsed && (
                    <motion.span 
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                      className="font-bold whitespace-nowrap overflow-hidden tracking-wider uppercase text-sm relative z-10"
                    >
                      CONFIGURAÇÕES
                    </motion.span>
                  )}
                </Button>
                {isCollapsed && (
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-4 py-3 text-sm rounded-lg shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-50 bg-gradient-to-r from-gray-900 via-[#14242f] to-gray-800 text-white border-2 border-accent-500/50 backdrop-blur-md">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-900"></div>
                    <div className="absolute top-0 right-0 w-2 h-2 bg-accent-500/60 rounded-br-lg" />
                    <span className="font-police-body font-semibold uppercase tracking-wider">CONFIGURAÇÕES</span>
                  </div>
                )}
              </div>

              <div className="relative group">
                <Button
                  variant="ghost"
                  className={cn(
                    'w-full flex items-center rounded-lg transition-all duration-300 font-police-body font-semibold border border-transparent group relative overflow-hidden',
                    'text-red-400 hover:text-red-100 hover:bg-gradient-to-r hover:from-red-600/50 hover:to-red-700/50 hover:border-l-4 hover:border-l-red-500 hover:shadow-lg hover:shadow-red-600/20',
                    isCollapsed ? 'justify-center px-3 py-3' : 'justify-start gap-3 px-4 py-3'
                  )}
                  onClick={handleLogout}
                >
                  {/* Danger Tactical Stripe */}
                  <div className="absolute left-0 top-0 w-1 h-full bg-red-500/0 group-hover:bg-red-500/80 transition-all duration-300" />
                  
                  <LogOut className="w-5 h-5 flex-shrink-0 group-hover:text-red-100 group-hover:scale-110 transition-all duration-300 relative z-10" />
                  {!isCollapsed && (
                    <motion.span 
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                      className="font-bold whitespace-nowrap overflow-hidden tracking-wider uppercase text-sm relative z-10"
                    >
                      SAIR
                    </motion.span>
                  )}
                </Button>
                {isCollapsed && (
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-4 py-3 bg-gradient-to-r from-red-800 via-red-700 to-red-800 text-white text-sm rounded-lg shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-50 border-2 border-red-500/50 backdrop-blur-md">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-red-800"></div>
                    <div className="absolute top-0 right-0 w-2 h-2 bg-red-400/60 rounded-br-lg" />
                    <span className="font-police-body font-semibold uppercase tracking-wider">SAIR</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Resize Handle - only show on desktop when sidebar is not collapsed */}
          {!isCollapsed && (
            <div
              className={cn(
                "hidden lg:block absolute right-0 top-0 h-full w-1 hover:w-2 cursor-col-resize transition-all duration-200 group",
                isResizing && resolvedTheme === 'dark' && "bg-gray-600 w-2",
                isResizing && resolvedTheme === 'light' && "bg-gray-400 w-2",
                !isResizing && resolvedTheme === 'dark' && "bg-gray-700 hover:bg-gray-600",
                !isResizing && resolvedTheme === 'light' && "bg-gray-300 hover:bg-gray-400"
              )}
              onMouseDown={(e) => {
                e.preventDefault();
                setIsResizing(true);
              }}
              role="separator"
              aria-orientation="vertical"
              aria-label="Redimensionar barra lateral"
              tabIndex={0}
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <GripVertical className="w-4 h-4 text-white/80" />
              </div>
            </div>
          )}
        </motion.aside>

        {/* Overlay for mobile */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-10 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Tactical Command Header */}
          <header className="bg-gradient-to-r from-gray-800 via-[#14242f] to-gray-900 border-b-4 border-accent-500 px-6 py-4 hidden lg:block relative overflow-hidden">
            {/* Tactical Background Pattern */}
            <div 
              className="absolute inset-0 opacity-[0.03] pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(250,204,21,0.3) 1px, transparent 0)',
                backgroundSize: '20px 20px'
              }}
            />
            
            {/* Corner Accents */}
            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-accent-500/30" />
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-accent-500/20" />
            
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  className="text-gray-300 hover:text-accent-500 hover:bg-white/10 border border-accent-500/30 hover:border-accent-500 transition-all duration-300"
                >
                  <PanelLeft className="w-5 h-5" />
                </Button>
                <div className="w-px h-8 bg-accent-500/50" />
                <div className="flex items-center gap-3">
                  <Shield className="w-6 h-6 text-accent-500" />
                  <h1 className="text-xl font-bold text-white font-police-title uppercase tracking-ultra-wide">
                    {adminNavItems.find(item => item.path === location.pathname)?.title || 'COMANDO CENTRAL'}
                  </h1>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <ThemeToggle className="border-accent-500/30 hover:border-accent-500" />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBackToStudent}
                  className="gap-2 text-gray-300 hover:text-white hover:bg-white/10 border border-accent-500/30 hover:border-accent-500 font-police-body font-semibold uppercase tracking-wider transition-all duration-300"
                >
                  <ChevronLeft className="w-4 h-4" />
                  PORTAL DO ALUNO
                </Button>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-100 via-gray-50 to-white dark:from-black dark:via-gray-900 dark:to-gray-800 relative">
            {/* Content Background Pattern */}
            <div 
              className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05] pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(250,204,21,0.3) 1px, transparent 0)',
                backgroundSize: '30px 30px'
              }}
            />
            <div className="relative z-10">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}