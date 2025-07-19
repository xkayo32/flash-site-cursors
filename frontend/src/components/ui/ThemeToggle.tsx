import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from './Button';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setTheme('light')}
        className={`p-2 ${
          theme === 'light' 
            ? 'bg-white dark:bg-gray-700 shadow-sm' 
            : ''
        }`}
        title="Tema Claro"
      >
        <Sun className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setTheme('dark')}
        className={`p-2 ${
          theme === 'dark' 
            ? 'bg-white dark:bg-gray-700 shadow-sm' 
            : ''
        }`}
        title="Tema Escuro"
      >
        <Moon className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setTheme('system')}
        className={`p-2 ${
          theme === 'system' 
            ? 'bg-white dark:bg-gray-700 shadow-sm' 
            : ''
        }`}
        title="Seguir Sistema"
      >
        <Monitor className="w-4 h-4" />
      </Button>
    </div>
  );
}

export default ThemeToggle;