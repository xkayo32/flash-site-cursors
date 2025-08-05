import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Toaster } from 'react-hot-toast';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Button } from '@/components/ui/Button';
import { PanelLeft } from 'lucide-react';
import { useState, createContext, useContext } from 'react';

// Contexto para controlar o estado da sidebar
const SidebarContext = createContext<{
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}>({
  isCollapsed: false,
  setIsCollapsed: () => {},
});

export const useSidebarContext = () => useContext(SidebarContext);

// Mapeamento de rotas para títulos
const routeTitles: Record<string, string> = {
  '/dashboard': 'COMANDO CENTRAL',
  '/my-courses': 'MINHAS OPERAÇÕES',
  '/courses': 'OPERAÇÕES DISPONÍVEIS',
  '/schedule': 'CRONOGRAMA TÁTICO',
  '/simulations': 'SIMULAÇÕES TÁTICAS',
  '/student/mock-exams': 'SIMULAÇÕES TÁTICAS',
  '/flashcards': 'CARTÕES TÁTICOS',
  '/student/flashcards': 'CARTÕES TÁTICOS',
  '/questions': 'EXERCÍCIOS TÁTICOS',
  '/student/questions': 'EXERCÍCIOS TÁTICOS',
  '/previous-exams': 'ARQUIVO DE PROVAS',
  '/student/previous-exams': 'ARQUIVO DE PROVAS',
  '/summaries': 'BRIEFINGS INTERATIVOS',
  '/student/summaries': 'BRIEFINGS INTERATIVOS',
  '/legislation': 'LEGISLAÇÃO',
  '/student/legislation': 'LEGISLAÇÃO',
  '/tactical': 'PAINEL TÁTICO',
  '/student/tactical-panel': 'PAINEL TÁTICO',
  '/subscription': 'PLANO OPERACIONAL',
  '/student/subscription': 'PLANO OPERACIONAL',
  '/settings': 'CONFIGURAÇÕES',
  '/student/settings': 'CONFIGURAÇÕES',
};

export function Layout() {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const currentTitle = routeTitles[location.pathname] || 'STUDYPRO';

  return (
    <SidebarContext.Provider value={{ isCollapsed, setIsCollapsed }}>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header with Theme Toggle */}
          <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
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
                <h1 className="text-xl font-semibold font-police-title uppercase tracking-wider text-gray-900 dark:text-white">
                  {currentTitle}
                </h1>
              </div>
              <ThemeToggle />
            </div>
          </header>
        
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-4 py-8 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          className: '',
          style: {
            background: '#14242f',
            color: '#fff',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </div>
    </SidebarContext.Provider>
  );
}