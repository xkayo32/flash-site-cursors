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
  Upload
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
  }
];

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, clearAuth } = useAuthStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
          animate={{ x: 0 }}
          className={`${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 fixed lg:relative z-20 w-64 h-full bg-primary-900 dark:bg-gray-800 transition-transform duration-300`}
        >
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="p-6 border-b border-primary-800 dark:border-gray-700 hidden lg:block">
              <Logo variant="full" size="md" theme="dark" />
              <div className="mt-3 flex items-center gap-2 text-primary-300">
                <Shield className="w-4 h-4" />
                <span className="text-sm font-medium">Painel Administrativo</span>
              </div>
            </div>

            {/* User Info */}
            <div className="p-4 border-b border-primary-800 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <img
                  src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name}&background=14242f&color=fff`}
                  alt={user?.name}
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <p className="text-sm font-medium text-white">
                    {user?.name}
                  </p>
                  <p className="text-xs text-primary-400">
                    Administrador
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4">
              <ul className="space-y-2">
                {adminNavItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <li key={item.path}>
                      <Link
                        to={item.path}
                        onClick={() => setIsSidebarOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                          isActive
                            ? 'bg-primary-800 dark:bg-gray-700 text-white'
                            : 'text-primary-300 hover:bg-primary-800 dark:hover:bg-gray-700 hover:text-white'
                        }`}
                      >
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium">{item.title}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* Footer Actions */}
            <div className="p-4 border-t border-primary-800 dark:border-gray-700 space-y-2">
              <Button
                variant="ghost"
                className="w-full justify-start gap-2 text-primary-300 hover:text-white hover:bg-primary-800 dark:hover:bg-gray-700"
                onClick={handleBackToStudent}
              >
                <ChevronLeft className="w-4 h-4" />
                Voltar ao Portal
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start gap-2 text-primary-300 hover:text-white hover:bg-primary-800 dark:hover:bg-gray-700"
              >
                <Settings className="w-4 h-4" />
                Configurações
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start gap-2 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4" />
                Sair
              </Button>
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
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                {adminNavItems.find(item => item.path === location.pathname)?.title || 'Admin'}
              </h1>
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