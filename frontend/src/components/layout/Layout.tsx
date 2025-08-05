import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Toaster } from 'react-hot-toast';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export function Layout() {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header with Theme Toggle */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
          <div className="flex justify-end items-center">
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
  );
}