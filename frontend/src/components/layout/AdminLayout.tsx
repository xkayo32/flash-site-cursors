import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  FileText,
  Users,
  Brain,
  BarChart3,
  BookOpen,
  Scale,
  LogOut,
  ChevronLeft,
  Settings,
  Menu,
  X,
  Shield,
  Upload,
  Tag,
  PanelLeft,
  GripVertical,
  Layers
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
    title: 'Dashboard',
    icon: LayoutDashboard,
    path: '/admin/dashboard'
  },
  {
    title: 'Gestão de Conteúdo',
    icon: FileText,
    path: '/admin/content'
  },
  {
    title: 'Cursos',
    icon: BookOpen,
    path: '/admin/courses'
  },
  {
    title: 'Resumos Interativos',
    icon: FileText,
    path: '/admin/summaries'
  },
  {
    title: 'Legislação',
    icon: Scale,
    path: '/admin/legislation'
  },
  {
    title: 'Gestão de Usuários',
    icon: Users,
    path: '/admin/users'
  },
  {
    title: 'Banco de Questões',
    icon: Brain,
    path: '/admin/questions'
  },
  {
    title: 'Flashcards',
    icon: Layers,
    path: '/admin/flashcards'
  },
  {
    title: 'Analytics',
    icon: BarChart3,
    path: '/admin/analytics'
  },
  {
    title: 'Importação em Massa',
    icon: Upload,
    path: '/admin/import'
  },
  {
    title: 'Categorias',
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <StudyProLogo variant="full" size="sm" />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
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
            'lg:translate-x-0',
            // Military/police theme background with tactical elements
            resolvedTheme === 'dark' 
              ? 'bg-gradient-to-b from-gray-900 via-gray-900 to-gray-800 border-r-2 border-gray-700 shadow-gray-900/50' 
              : 'bg-gradient-to-b from-white via-gray-50 to-gray-100 border-r-2 border-military-base/20 shadow-military-base/10'
          )}
          style={{ overflow: 'hidden', position: 'relative' }}
        >
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className={cn(
              "p-6 border-b-2 hidden lg:block relative",
              resolvedTheme === 'dark' 
                ? 'border-gray-700 bg-gray-800/50' 
                : 'border-military-base/30 bg-military-base/5'
            )}>
              <div className={isCollapsed ? "flex justify-center" : "flex flex-col"}>
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
                    className={cn(
                      "mt-3 flex items-center gap-2 p-2 rounded-md border border-dashed",
                      resolvedTheme === 'dark' 
                        ? 'text-gray-400 border-gray-600 bg-gray-800/50' 
                        : 'text-military-base border-military-base/30 bg-military-base/5'
                    )}
                  >
                    <Shield className="w-4 h-4" />
                    <span className="text-sm font-semibold font-police-subtitle uppercase tracking-wider">COMANDO CENTRAL</span>
                  </motion.div>
                )}
              </div>
            </div>

            {/* User Info */}
            <div className={cn(
              "p-4 border-b-2 relative",
              resolvedTheme === 'dark' 
                ? 'border-gray-700 bg-gray-800/30' 
                : 'border-military-base/20 bg-military-base/5'
            )}>
              <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
                <img
                  src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name}&background=${resolvedTheme === 'dark' ? '14242f' : '14242f'}&color=fff`}
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
                    <p className={cn(
                      "text-sm font-semibold truncate font-police-body",
                      resolvedTheme === 'dark' 
                        ? 'text-white' 
                        : 'text-gray-900'
                    )}>
                      {user?.name}
                    </p>
                    <p className={cn(
                      "text-xs truncate font-police-subtitle uppercase tracking-wider",
                      resolvedTheme === 'dark' 
                        ? 'text-yellow-400' 
                        : 'text-military-base'
                    )}>
                      ADMINISTRADOR
                    </p>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Navigation */}
            <nav className={cn(
              "flex-1 relative",
              isCollapsed ? 'px-2 py-4 overflow-hidden' : 'p-4 overflow-y-auto',
              // Add tactical pattern overlay
              resolvedTheme === 'dark' 
                ? 'bg-gradient-to-b from-transparent to-gray-900/20' 
                : 'bg-gradient-to-b from-transparent to-military-base/5'
            )}>
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
                            'flex items-center rounded-lg transition-all duration-300 border border-transparent font-police-body font-medium',
                            isCollapsed ? 'justify-center px-2 py-2.5' : 'gap-3 px-4 py-3',
                            // Active state with tactical styling
                            isActive && resolvedTheme === 'dark' && 'bg-gradient-to-r from-gray-800 to-gray-700 text-white shadow-lg border-gray-600 shadow-gray-700/20',
                            isActive && resolvedTheme === 'light' && 'bg-gradient-to-r from-military-base to-military-base/90 text-white shadow-lg border-military-base/50 shadow-military-base/30',
                            // Inactive state - dark theme with tactical hover
                            !isActive && resolvedTheme === 'dark' && 'text-gray-300 hover:bg-gradient-to-r hover:from-gray-800 hover:to-gray-700 hover:text-white hover:border-gray-600',
                            // Inactive state - light theme with tactical hover
                            !isActive && resolvedTheme === 'light' && 'text-gray-600 hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-50 hover:text-military-base hover:border-military-base/20'
                          )}
                        >
                          <item.icon className="w-5 h-5 flex-shrink-0" />
                          {!isCollapsed && (
                            <motion.span 
                              initial={{ opacity: 0, width: 0 }}
                              animate={{ opacity: 1, width: "auto" }}
                              exit={{ opacity: 0, width: 0 }}
                              transition={{ duration: 0.2 }}
                              className="font-semibold whitespace-nowrap overflow-hidden tracking-wide"
                            >
                              {item.title}
                            </motion.span>
                          )}
                        </Link>
                        
                        {/* Tooltip for collapsed state */}
                        {isCollapsed && (
                          <div className={cn(
                            "absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-2 text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-50",
                            resolvedTheme === 'dark' 
                              ? 'bg-gray-800 text-white border border-gray-600' 
                              : 'bg-white text-gray-900 border border-gray-300'
                          )}>
                            <div className={cn(
                              "absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent",
                              resolvedTheme === 'dark' 
                                ? 'border-r-gray-800' 
                                : 'border-r-white'
                            )}></div>
                            {item.title}
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
              "border-t-2 space-y-1 relative",
              isCollapsed ? 'px-2 py-4' : 'p-4',
              resolvedTheme === 'dark' 
                ? 'border-gray-700 bg-gradient-to-t from-gray-900 to-transparent' 
                : 'border-military-base/30 bg-gradient-to-t from-military-base/5 to-transparent'
            )}>
              <div className="relative group">
                <Button
                  variant="ghost"
                  className={cn(
                    'w-full flex items-center rounded-lg transition-all duration-300 font-police-body font-medium border border-transparent',
                    isCollapsed ? 'justify-center px-2 py-2.5' : 'justify-start gap-3 px-3 py-2.5',
                    resolvedTheme === 'dark' 
                      ? 'text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-gray-800 hover:to-gray-700 hover:border-gray-600' 
                      : 'text-gray-600 hover:text-military-base hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-50 hover:border-military-base/20'
                  )}
                  onClick={handleBackToStudent}
                >
                  <ChevronLeft className="w-5 h-5 flex-shrink-0" />
                  {!isCollapsed && (
                    <motion.span 
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                      className="font-semibold whitespace-nowrap overflow-hidden tracking-wide"
                    >
                      Voltar ao Portal
                    </motion.span>
                  )}
                </Button>
                {isCollapsed && (
                  <div className={cn(
                    "absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-2 text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-50",
                    resolvedTheme === 'dark' 
                      ? 'bg-gray-800 text-white border border-gray-600' 
                      : 'bg-white text-gray-900 border border-gray-300'
                  )}>
                    <div className={cn(
                      "absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent",
                      resolvedTheme === 'dark' 
                        ? 'border-r-gray-800' 
                        : 'border-r-white'
                    )}></div>
                    Voltar ao Portal
                  </div>
                )}
              </div>

              <div className="relative group">
                <Button
                  variant="ghost"
                  className={cn(
                    'w-full flex items-center rounded-lg transition-all duration-300 font-police-body font-medium border border-transparent',
                    isCollapsed ? 'justify-center px-2 py-2.5' : 'justify-start gap-3 px-3 py-2.5',
                    resolvedTheme === 'dark' 
                      ? 'text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-gray-800 hover:to-gray-700 hover:border-gray-600' 
                      : 'text-gray-600 hover:text-military-base hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-50 hover:border-military-base/20'
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
                      className="font-semibold whitespace-nowrap overflow-hidden tracking-wide"
                    >
                      Configurações
                    </motion.span>
                  )}
                </Button>
                {isCollapsed && (
                  <div className={cn(
                    "absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-2 text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-50",
                    resolvedTheme === 'dark' 
                      ? 'bg-gray-800 text-white border border-gray-600' 
                      : 'bg-white text-gray-900 border border-gray-300'
                  )}>
                    <div className={cn(
                      "absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent",
                      resolvedTheme === 'dark' 
                        ? 'border-r-gray-800' 
                        : 'border-r-white'
                    )}></div>
                    Configurações
                  </div>
                )}
              </div>

              <div className="relative group">
                <Button
                  variant="ghost"
                  className={cn(
                    'w-full flex items-center rounded-lg transition-all duration-300 font-police-body font-medium border border-transparent',
                    'text-red-400 hover:text-red-300 hover:bg-gradient-to-r hover:from-red-600 hover:to-red-700 hover:border-red-500/50 hover:shadow-lg hover:shadow-red-600/20',
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
                      className="font-semibold whitespace-nowrap overflow-hidden tracking-wide"
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
          {/* Top Bar */}
          <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 hidden lg:block">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                >
                  <PanelLeft className="w-5 h-5" />
                </Button>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {adminNavItems.find(item => item.path === location.pathname)?.title || 'Admin'}
                </h1>
              </div>
              <div className="flex items-center gap-4">
                <ThemeToggle />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBackToStudent}
                  className="gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Portal do Aluno
                </Button>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}