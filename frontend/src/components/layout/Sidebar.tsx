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
  Zap,
  Scale,
  Target,
  GraduationCap,
  TrendingUp,
  Moon,
  Sun,
  GripVertical
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { cn } from '@/utils/cn';
import { useAuthStore } from '@/store/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from '@/components/ui/Logo';
import { useTheme } from '@/contexts/ThemeContext';

const menuItems = [
  { icon: Home, label: 'Dashboard', path: '/dashboard' },
  { icon: BookOpen, label: 'Meus Cursos', path: '/my-courses' },
  { icon: GraduationCap, label: 'Explorar Cursos', path: '/courses' },
  { icon: Calendar, label: 'Cronograma', path: '/schedule' },
  { icon: Trophy, label: 'Simulados', path: '/simulations' },
  { icon: Brain, label: 'Flashcards', path: '/flashcards' },
  { icon: FileQuestion, label: 'Questões', path: '/questions' },
  { icon: FileText, label: 'Resumos Interativos', path: '/summaries' },
  { icon: Scale, label: 'Legislação', path: '/legislation' },
  { icon: Target, label: 'Painel Tático', path: '/tactical' },
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
  const { theme, setTheme, resolvedTheme } = useTheme();

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
        }}
        className={cn(
          'lg:relative top-0 left-0 h-screen bg-primary-600 dark:bg-gray-800 text-white z-40',
          'flex flex-col transition-all duration-300 ease-in-out',
          'fixed lg:translate-x-0',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
        style={{ overflow: 'hidden' }}
      >
        {/* Header */}
        <div className="p-4 border-b border-primary-500 dark:border-gray-700">
          <div className={cn(
            "flex items-center",
            isOpen ? "justify-between" : "justify-center"
          )}>
            <div className="flex items-center">
              <Logo 
                variant={isOpen ? "full" : "icon"} 
                size="sm" 
                animated={true} 
                className="flex-shrink-0"
              />
            </div>
            
            {isOpen && (
              <button
                onClick={toggleSidebar}
                className="hidden lg:block p-1.5 rounded-lg hover:bg-primary-500 dark:hover:bg-gray-700 transition-colors flex-shrink-0"
              >
                <ChevronRight className="w-5 h-5 transition-transform" />
              </button>
            )}
            
            {!isOpen && (
              <button
                onClick={toggleSidebar}
                className="hidden lg:block absolute top-4 right-2 p-1.5 rounded-lg hover:bg-primary-500 dark:hover:bg-gray-700 transition-colors"
              >
                <ChevronRight className="w-5 h-5 transition-transform rotate-180" />
              </button>
            )}
          </div>
        </div>

        {/* User Info */}
        {user && (
          <div className="p-4 border-b border-primary-500 dark:border-gray-700">
            <div className={cn(
              "flex items-center",
              isOpen ? "gap-3" : "justify-center"
            )}>
              <img
                src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=14242f&color=fff`}
                alt={user.name}
                className="w-10 h-10 rounded-full flex-shrink-0"
              />
              {isOpen && (
                <motion.div 
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex-1 min-w-0"
                >
                  <p className="font-medium truncate">{user.name}</p>
                  <p className="text-xs text-primary-200 truncate">{user.subscription?.plan}</p>
                </motion.div>
              )}
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className={cn(
          "flex-1 space-y-1",
          isOpen ? "p-4 overflow-y-auto" : "px-2 py-4 overflow-hidden"
        )}>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <div key={item.path} className="relative group">
                <Link
                  to={item.path}
                  className={cn(
                    'flex items-center rounded-lg transition-all relative',
                    'hover:bg-primary-500',
                    isActive && 'bg-primary-700 shadow-lg',
                    isOpen ? 'gap-3 px-3 py-2.5' : 'justify-center px-2 py-2.5'
                  )}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {isOpen && (
                    <motion.span 
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                      className="font-medium whitespace-nowrap overflow-hidden"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </Link>
                
                {/* Tooltip para menu minimizado */}
                {!isOpen && (
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-2 bg-primary-800 text-white text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-50 border border-primary-600">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-primary-800"></div>
                    {item.label}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Bottom Navigation */}
        <div className={cn(
          "border-t border-primary-500 space-y-1",
          isOpen ? "p-4" : "px-2 py-4"
        )}>
          {bottomItems.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.path} className="relative group">
                <Link
                  to={item.path}
                  className={cn(
                    'flex items-center rounded-lg transition-all',
                    'hover:bg-primary-500',
                    isOpen ? 'gap-3 px-3 py-2.5' : 'justify-center px-2 py-2.5'
                  )}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {isOpen && (
                    <motion.span 
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                      className="font-medium whitespace-nowrap overflow-hidden"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </Link>
                
                {/* Tooltip para menu minimizado */}
                {!isOpen && (
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-2 bg-primary-800 text-white text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-50 border border-primary-600">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-primary-800"></div>
                    {item.label}
                  </div>
                )}
              </div>
            );
          })}
          
          <div className="relative group">
            <button
              onClick={logout}
              className={cn(
                'w-full flex items-center rounded-lg transition-all text-left',
                'hover:bg-red-600',
                isOpen ? 'gap-3 px-3 py-2.5' : 'justify-center px-2 py-2.5'
              )}
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              {isOpen && (
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
            </button>
            
            {/* Tooltip para menu minimizado */}
            {!isOpen && (
              <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-2 bg-red-800 text-white text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-50 border border-red-600">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-red-800"></div>
                Sair
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          <div className="relative group">
            <button
              onClick={() => {
                const themes: ('light' | 'dark' | 'system')[] = ['light', 'dark', 'system'];
                const currentIndex = themes.indexOf(theme);
                const nextIndex = (currentIndex + 1) % themes.length;
                setTheme(themes[nextIndex]);
              }}
              className={cn(
                'w-full flex items-center rounded-lg transition-all text-left',
                'hover:bg-primary-500 dark:hover:bg-gray-700',
                isOpen ? 'gap-3 px-3 py-2.5' : 'justify-center px-2 py-2.5'
              )}
            >
              {resolvedTheme === 'dark' ? (
                <Moon className="w-5 h-5 flex-shrink-0" />
              ) : (
                <Sun className="w-5 h-5 flex-shrink-0" />
              )}
              {isOpen && (
                <motion.span 
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                  className="font-medium whitespace-nowrap overflow-hidden"
                >
                  {theme === 'light' ? 'Tema Claro' : theme === 'dark' ? 'Tema Escuro' : 'Sistema'}
                </motion.span>
              )}
            </button>
            
            {/* Tooltip para menu minimizado */}
            {!isOpen && (
              <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-2 bg-primary-800 dark:bg-gray-700 text-white text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-50 border border-primary-700 dark:border-gray-600">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-primary-800 dark:border-r-gray-700"></div>
                Tema
              </div>
            )}
          </div>
        </div>
      </motion.aside>
    </>
  );
}