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
  GripVertical,
  ClipboardList,
  Command,
  Shield,
  Crosshair,
  Activity,
  Binoculars,
  Flame,
  FileCheck,
  Archive,
  Gavel,
  Radar,
  Wallet,
  Cog
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { cn } from '@/utils/cn';
import { useAuthStore } from '@/store/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from '@/components/ui/Logo';

const menuItems = [
  { icon: Command, label: 'COMANDO CENTRAL', path: '/dashboard' },
  { icon: Activity, label: 'MINHAS OPERAÇÕES', path: '/my-courses' },
  { icon: Binoculars, label: 'OPERAÇÕES DISPONÍVEIS', path: '/courses' },
  { icon: Calendar, label: 'CRONOGRAMA TÁTICO', path: '/schedule' },
  { icon: Target, label: 'SIMULAÇÕES TÁTICAS', path: '/simulations' },
  { icon: Flame, label: 'CARTÕES TÁTICOS', path: '/flashcards' },
  { icon: Crosshair, label: 'EXERCÍCIOS TÁTICOS', path: '/questions' },
  { icon: Archive, label: 'ARQUIVO DE PROVAS', path: '/previous-exams' },
  { icon: FileCheck, label: 'BRIEFINGS INTERATIVOS', path: '/summaries' },
  { icon: Gavel, label: 'LEGISLAÇÃO', path: '/legislation' },
  { icon: Radar, label: 'PAINEL TÁTICO', path: '/tactical' },
];

const bottomItems = [
  { icon: CreditCard, label: 'COMANDO FINANCEIRO', path: '/payment' },
  { icon: Wallet, label: 'PLANO OPERACIONAL', path: '/subscription' },
  { icon: Cog, label: 'CONFIGURAÇÕES', path: '/settings' },
];

import { useSidebarContext } from './Layout';

export function Sidebar() {
  const { isCollapsed } = useSidebarContext();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(280);
  const [isResizing, setIsResizing] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const isOpen = !isCollapsed;

  const MIN_WIDTH = 200;
  const MAX_WIDTH = 430; // 280px + 150px
  const COLLAPSED_WIDTH = 80;

  useEffect(() => {
    // Load saved width from localStorage
    const savedWidth = localStorage.getItem('sidebarWidth');
    if (savedWidth) {
      setSidebarWidth(Number(savedWidth));
    }
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      
      const newWidth = e.clientX;
      if (newWidth >= MIN_WIDTH && newWidth <= MAX_WIDTH) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      if (isResizing) {
        setIsResizing(false);
        // Save width to localStorage
        localStorage.setItem('sidebarWidth', sidebarWidth.toString());
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

  const toggleMobileSidebar = () => setIsMobileOpen(!isMobileOpen);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={toggleMobileSidebar}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800 transition-colors"
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
        ref={sidebarRef}
        initial={false}
        animate={{
          width: isOpen ? sidebarWidth : COLLAPSED_WIDTH,
        }}
        className={cn(
          'lg:relative top-0 left-0 h-screen bg-gray-900 dark:bg-gray-950 text-white z-40',
          'flex flex-col transition-all duration-300 ease-in-out shadow-xl border-r border-gray-700 dark:border-gray-800',
          'fixed lg:translate-x-0',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
        style={{ overflow: 'hidden' }}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-700 dark:border-gray-800">
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
            
          </div>
        </div>

        {/* User Info */}
        {user && (
          <div className="p-4 border-b border-gray-700 dark:border-gray-800">
            <div className={cn(
              "flex items-center",
              isOpen ? "gap-3" : "justify-center"
            )}>
              <img
                src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=14242f&color=fff`}
                alt={user.name}
                className="w-10 h-10 rounded-full flex-shrink-0 cursor-pointer hover:ring-2 hover:ring-accent-500 transition-all"
                onClick={() => window.location.href = '/settings'}
              />
              {isOpen && (
                <motion.div 
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex-1 min-w-0"
                >
                  <p className="font-medium truncate font-police-body uppercase tracking-wider">{user.name}</p>
                  <p className="text-xs text-gray-400 truncate font-police-body uppercase tracking-wider">{user.subscription?.plan}</p>
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
                    'hover:bg-gray-800 dark:hover:bg-gray-800',
                    isActive && 'bg-gray-800 dark:bg-gray-800 shadow-lg border-l-2 border-white',
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
                      className="font-medium whitespace-nowrap overflow-hidden font-police-body uppercase tracking-wider text-sm"
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
                      className="font-medium whitespace-nowrap overflow-hidden font-police-body uppercase tracking-wider text-sm"
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
                'hover:bg-gray-700 dark:hover:bg-gray-800',
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

        </div>

        {/* Resize Handle - only show on desktop when sidebar is open */}
        {isOpen && (
          <div
            className={cn(
              "hidden lg:block absolute right-0 top-0 h-full w-1 hover:w-2 cursor-col-resize transition-all duration-200 group",
              isResizing ? "bg-primary-400 dark:bg-gray-600 w-2" : "bg-primary-500 dark:bg-gray-700 hover:bg-primary-400 dark:hover:bg-gray-600"
            )}
            onMouseDown={(e) => {
              e.preventDefault();
              setIsResizing(true);
            }}
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <GripVertical className="w-4 h-4 text-white/80" />
            </div>
          </div>
        )}
      </motion.aside>
    </>
  );
}