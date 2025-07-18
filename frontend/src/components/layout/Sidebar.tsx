import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  BookOpen,
  Brain,
  FileQuestion,
  FileText,
  BarChart3,
  Calendar,
  Settings,
  CreditCard,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Trophy,
  Zap
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/utils/cn';
import { useAuthStore } from '@/store/authStore';
import { motion, AnimatePresence } from 'framer-motion';

const menuItems = [
  { icon: Home, label: 'Dashboard', path: '/dashboard' },
  { icon: BookOpen, label: 'Cursos', path: '/courses' },
  { icon: FileQuestion, label: 'Questões', path: '/questions' },
  { icon: Brain, label: 'Flashcards', path: '/flashcards' },
  { icon: Trophy, label: 'Simulados', path: '/simulations' },
  { icon: FileText, label: 'Resumos', path: '/summaries' },
  { icon: BarChart3, label: 'Desempenho', path: '/performance' },
  { icon: Calendar, label: 'Cronograma', path: '/schedule' },
];

const bottomItems = [
  { icon: CreditCard, label: 'Assinatura', path: '/subscription' },
  { icon: Settings, label: 'Configurações', path: '/settings' },
];

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const toggleSidebar = () => setIsOpen(!isOpen);
  const toggleMobileSidebar = () => setIsMobileOpen(!isMobileOpen);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={toggleMobileSidebar}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-primary-600 text-white"
      >
        {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleMobileSidebar}
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          width: isOpen ? 280 : 80,
          x: isMobileOpen ? 0 : -280,
        }}
        className={cn(
          'fixed lg:relative top-0 left-0 h-screen bg-primary-600 text-white z-40',
          'flex flex-col transition-all duration-300 ease-in-out',
          'lg:translate-x-0'
        )}
      >
        {/* Header */}
        <div className="p-4 border-b border-primary-500">
          <div className="flex items-center justify-between">
            <motion.div
              animate={{ opacity: isOpen ? 1 : 0 }}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 bg-accent-500 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6" />
              </div>
              {isOpen && (
                <span className="text-xl font-bold">StudyPro</span>
              )}
            </motion.div>
            
            <button
              onClick={toggleSidebar}
              className="hidden lg:block p-1.5 rounded-lg hover:bg-primary-500 transition-colors"
            >
              <ChevronRight
                className={cn(
                  'w-5 h-5 transition-transform',
                  !isOpen && 'rotate-180'
                )}
              />
            </button>
          </div>
        </div>

        {/* User Info */}
        {user && (
          <div className="p-4 border-b border-primary-500">
            <div className="flex items-center gap-3">
              <img
                src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=14242f&color=fff`}
                alt={user.name}
                className="w-10 h-10 rounded-full"
              />
              {isOpen && (
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{user.name}</p>
                  <p className="text-xs text-primary-200 truncate">{user.subscription?.plan}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all',
                  'hover:bg-primary-500',
                  isActive && 'bg-primary-700 shadow-lg',
                  !isOpen && 'justify-center'
                )}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {isOpen && (
                  <span className="font-medium">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Navigation */}
        <div className="p-4 border-t border-primary-500 space-y-1">
          {bottomItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all',
                  'hover:bg-primary-500',
                  !isOpen && 'justify-center'
                )}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {isOpen && (
                  <span className="font-medium">{item.label}</span>
                )}
              </Link>
            );
          })}
          
          <button
            onClick={logout}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all',
              'hover:bg-red-600 text-left',
              !isOpen && 'justify-center'
            )}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {isOpen && (
              <span className="font-medium">Sair</span>
            )}
          </button>
        </div>
      </motion.aside>
    </>
  );
}