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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-50 to-white dark:from-black dark:via-gray-900 dark:to-gray-800">
      {/* Mobile Header */}
      <div className="lg:hidden bg-gray-900 dark:bg-gray-950 border-b border-gray-700 dark:border-gray-800 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <StudyProLogo variant="full" size="sm" />
            <span className="font-police-title text-white text-sm uppercase tracking-ultra-wide font-bold">ADMIN</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="text-white hover:bg-gray-800"
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
            'fixed lg:relative z-20 h-full transition-transform duration-300 shadow-xl',
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full',
            'lg:translate-x-0',
            'bg-gray-900 dark:bg-gray-950 text-white border-r border-gray-700 dark:border-gray-800'
          )}
        >
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="p-4 border-b border-gray-700 dark:border-gray-800 hidden lg:block">
              <div className={`${isCollapsed ? "flex justify-center" : "flex flex-col"}`}>
                <StudyProLogo 
                  variant={isCollapsed ? "icon" : "full"} 
                  size={isCollapsed ? "sm" : "md"}
                  className="flex-shrink-0"
                />
              </div>
            </div>

            {/* User Info */}
            <div className="p-4 border-b border-gray-700 dark:border-gray-800">
              <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
                <img
                  src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name}&background=14242f&color=fff`}
                  alt={user?.name}
                  className="w-10 h-10 rounded-full flex-shrink-0"
                />
                {!isCollapsed && (
                  <motion.div 
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex-1 min-w-0"
                  >
                    <p className="text-sm font-medium truncate font-police-body uppercase tracking-wider">
                      {user?.name}
                    </p>
                    <p className="text-xs text-gray-400 truncate font-police-body uppercase tracking-wider">
                      ADMINISTRADOR
                    </p>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Navigation */}
            <nav className={cn(
              "flex-1 space-y-1",
              isCollapsed ? 'px-2 py-4 overflow-hidden' : 'p-4 overflow-y-auto'
            )}>
              <ul className="space-y-1">
                {adminNavItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <li key={item.path}>
                      <div className="relative group">
                        <Link
                          to={item.path}
                          onClick={() => setIsSidebarOpen(false)}
                          className={cn(
                            'flex items-center rounded-lg transition-all relative',
                            'hover:bg-gray-800 dark:hover:bg-gray-800',
                            isActive && 'bg-gray-800 dark:bg-gray-800 shadow-lg border-l-2 border-white',
                            isCollapsed ? 'justify-center px-2 py-2.5' : 'gap-3 px-3 py-2.5'
                          )}
                        >
                          <item.icon className="w-5 h-5 flex-shrink-0" />
                          {!isCollapsed && (
                            <motion.span 
                              initial={{ opacity: 0, width: 0 }}
                              animate={{ opacity: 1, width: "auto" }}
                              exit={{ opacity: 0, width: 0 }}
                              transition={{ duration: 0.2 }}
                              className="font-medium whitespace-nowrap overflow-hidden font-police-body uppercase tracking-wider text-sm"
                            >
                              {item.title}
                            </motion.span>
                          )}
                        </Link>
                        
                        {/* Tooltip for collapsed state */}
                        {isCollapsed && (
                          <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-50 border border-gray-600">
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-800"></div>
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
              "border-t border-gray-700 dark:border-gray-800 space-y-1",
              isCollapsed ? 'px-2 py-4' : 'p-4'
            )}>
              <div className="relative group">
                <Button
                  variant="ghost"
                  className={cn(
                    'w-full flex items-center rounded-lg transition-all',
                    'hover:bg-gray-800 dark:hover:bg-gray-800',
                    isCollapsed ? 'justify-center px-2 py-2.5' : 'justify-start gap-3 px-3 py-2.5'
                  )}
                  onClick={() => navigate('/admin/settings')}
                >
                  <Settings className="w-5 h-5 flex-shrink-0" />
                  {!isCollapsed && (
                    <motion.span 
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                      className="font-medium whitespace-nowrap overflow-hidden font-police-body uppercase tracking-wider text-sm"
                    >
                      CONFIGURAÇÕES
                    </motion.span>
                  )}
                </Button>
                {isCollapsed && (
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-50 border border-gray-600">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-800"></div>
                    <span className="font-police-body font-semibold uppercase tracking-wider">CONFIGURAÇÕES</span>
                  </div>
                )}
              </div>

              <div className="relative group">
                <Button
                  variant="ghost"
                  className={cn(
                    'w-full flex items-center rounded-lg transition-all',
                    'hover:bg-gray-700 dark:hover:bg-gray-800',
                    isCollapsed ? 'justify-center px-2 py-2.5' : 'justify-start gap-3 px-3 py-2.5'
                  )}
                  onClick={handleLogout}
                >
                  <LogOut className="w-5 h-5 flex-shrink-0" />
                  {!isCollapsed && (
                    <motion.span 
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                      className="font-medium whitespace-nowrap overflow-hidden"
                    >
                      Sair
                    </motion.span>
                  )}
                </Button>
                {isCollapsed && (
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-2 bg-red-800 text-white text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-50 border border-red-600">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-red-800"></div>
                    Sair
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
                isResizing ? "bg-gray-600 dark:bg-gray-600 w-2" : "bg-gray-700 dark:bg-gray-700 hover:bg-gray-600 dark:hover:bg-gray-600"
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
          {/* Header */}
          <header className="bg-gray-900 dark:bg-gray-950 border-b border-gray-700 dark:border-gray-800 px-6 py-4 hidden lg:block">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  className="text-gray-300 hover:text-white hover:bg-gray-800"
                >
                  <PanelLeft className="w-5 h-5" />
                </Button>
                <div className="flex items-center gap-3">
                  <Shield className="w-6 h-6 text-white" />
                  <h1 className="text-xl font-bold text-white font-police-title uppercase tracking-ultra-wide">
                    {adminNavItems.find(item => item.path === location.pathname)?.title || 'COMANDO CENTRAL'}
                  </h1>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <ThemeToggle />
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-100 via-gray-50 to-white dark:from-black dark:via-gray-900 dark:to-gray-800">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}