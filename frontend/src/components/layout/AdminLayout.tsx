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
  PanelLeft
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo';
import { useAuthStore } from '@/store/authStore';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

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
          <Logo variant="full" size="sm" />
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
          initial={{ x: -250 }}
          animate={{ 
            x: 0,
            width: isCollapsed ? 80 : 256 
          }}
          className={`${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 fixed lg:relative z-20 h-full bg-primary-900 dark:bg-gray-800 transition-transform duration-300`}
          style={{ overflow: 'hidden' }}
        >
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="p-6 border-b border-primary-800 dark:border-gray-700 hidden lg:block">
              <div className={isCollapsed ? "flex justify-center" : "flex flex-col"}>
                <Logo 
                  variant={isCollapsed ? "icon" : "full"} 
                  size={isCollapsed ? "sm" : "md"} 
                  theme="dark" 
                  className="flex-shrink-0"
                />
                {!isCollapsed && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2, delay: 0.1 }}
                    className="mt-3 flex items-center gap-2 text-primary-300"
                  >
                    <Shield className="w-4 h-4" />
                    <span className="text-sm font-medium">Painel Administrativo</span>
                  </motion.div>
                )}
              </div>
            </div>

            {/* User Info */}
            <div className="p-4 border-b border-primary-800 dark:border-gray-700">
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
                    <p className="text-sm font-medium text-white truncate">
                      {user?.name}
                    </p>
                    <p className="text-xs text-primary-400 truncate">
                      Administrador
                    </p>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Navigation */}
            <nav className={`flex-1 ${isCollapsed ? 'px-2 py-4 overflow-hidden' : 'p-4 overflow-y-auto'}`}>
              <ul className="space-y-2">
                {adminNavItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <li key={item.path}>
                      <div className="relative group">
                        <Link
                          to={item.path}
                          onClick={() => setIsSidebarOpen(false)}
                          className={`flex items-center rounded-lg transition-all ${
                            isActive
                              ? 'bg-primary-800 dark:bg-gray-700 text-white shadow-lg'
                              : 'text-primary-300 hover:bg-primary-800 dark:hover:bg-gray-700 hover:text-white'
                          } ${
                            isCollapsed ? 'justify-center px-2 py-2.5' : 'gap-3 px-4 py-3'
                          }`}
                        >
                          <item.icon className="w-5 h-5 flex-shrink-0" />
                          {!isCollapsed && (
                            <motion.span 
                              initial={{ opacity: 0, width: 0 }}
                              animate={{ opacity: 1, width: "auto" }}
                              exit={{ opacity: 0, width: 0 }}
                              transition={{ duration: 0.2 }}
                              className="font-medium whitespace-nowrap overflow-hidden"
                            >
                              {item.title}
                            </motion.span>
                          )}
                        </Link>
                        
                        {/* Tooltip for collapsed state */}
                        {isCollapsed && (
                          <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-2 bg-primary-800 text-white text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-50 border border-primary-600">
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-primary-800"></div>
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
            <div className={`border-t border-primary-800 dark:border-gray-700 space-y-1 ${isCollapsed ? 'px-2 py-4' : 'p-4'}`}>
              <div className="relative group">
                <Button
                  variant="ghost"
                  className={`w-full flex items-center rounded-lg transition-all text-primary-300 hover:text-white hover:bg-primary-800 dark:hover:bg-gray-700 ${
                    isCollapsed ? 'justify-center px-2 py-2.5' : 'justify-start gap-3 px-3 py-2.5'
                  }`}
                  onClick={handleBackToStudent}
                >
                  <ChevronLeft className="w-5 h-5 flex-shrink-0" />
                  {!isCollapsed && (
                    <motion.span 
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                      className="font-medium whitespace-nowrap overflow-hidden"
                    >
                      Voltar ao Portal
                    </motion.span>
                  )}
                </Button>
                {isCollapsed && (
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-2 bg-primary-800 text-white text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-50 border border-primary-600">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-primary-800"></div>
                    Voltar ao Portal
                  </div>
                )}
              </div>

              <div className="relative group">
                <Button
                  variant="ghost"
                  className={`w-full flex items-center rounded-lg transition-all text-primary-300 hover:text-white hover:bg-primary-800 dark:hover:bg-gray-700 ${
                    isCollapsed ? 'justify-center px-2 py-2.5' : 'justify-start gap-3 px-3 py-2.5'
                  }`}
                  onClick={() => navigate('/admin/settings')}
                >
                  <Settings className="w-5 h-5 flex-shrink-0" />
                  {!isCollapsed && (
                    <motion.span 
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                      className="font-medium whitespace-nowrap overflow-hidden"
                    >
                      Configurações
                    </motion.span>
                  )}
                </Button>
                {isCollapsed && (
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-2 bg-primary-800 text-white text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-50 border border-primary-600">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-primary-800"></div>
                    Configurações
                  </div>
                )}
              </div>

              <div className="relative group">
                <Button
                  variant="ghost"
                  className={`w-full flex items-center rounded-lg transition-all text-red-400 hover:text-red-300 hover:bg-red-600 ${
                    isCollapsed ? 'justify-center px-2 py-2.5' : 'justify-start gap-3 px-3 py-2.5'
                  }`}
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