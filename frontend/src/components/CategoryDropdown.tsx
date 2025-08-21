import { ChevronRight, Folder, FolderOpen, FileText } from 'lucide-react';
import { Category } from '@/services/categoryService';

interface CategoryDropdownProps {
  categories: Category[];
  selectedValue: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  isLoading?: boolean;
  placeholder?: string;
  showAll?: boolean;
  className?: string;
}

export function CategoryDropdown({
  categories,
  selectedValue,
  onChange,
  disabled = false,
  isLoading = false,
  placeholder = "SELECIONE",
  showAll = true,
  className = ""
}: CategoryDropdownProps) {
  
  // Renderizar opções de forma hierárquica com indentação
  const renderCategoryOptions = (cats: Category[], level: number = 0): JSX.Element[] => {
    const options: JSX.Element[] = [];
    
    cats.forEach(cat => {
      // Adicionar prefixo visual baseado no nível
      const prefix = level === 0 ? '' : '┗━ '.padStart((level * 4) + 3, '\u00A0');
      const icon = cat.children && cat.children.length > 0 ? '📁' : '📄';
      
      options.push(
        <option 
          key={cat.id} 
          value={cat.name}
          className={`${level > 0 ? 'text-gray-600 dark:text-gray-400' : 'font-semibold'}`}
        >
          {prefix}{icon} {cat.name}
          {cat.children && cat.children.length > 0 && ` (${cat.children.length})`}
        </option>
      );
      
      // Renderizar children recursivamente
      if (cat.children && cat.children.length > 0) {
        options.push(...renderCategoryOptions(cat.children, level + 1));
      }
    });
    
    return options;
  };
  
  // Agrupar categorias por tipo para melhor organização
  const groupedCategories = categories.reduce((acc, cat) => {
    const type = cat.type || 'other';
    if (!acc[type]) acc[type] = [];
    acc[type].push(cat);
    return acc;
  }, {} as Record<string, Category[]>);

  return (
    <select
      value={selectedValue}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled || isLoading}
      className={`px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
        bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white 
        font-police-body uppercase tracking-wider 
        focus:ring-2 focus:ring-accent-500 focus:border-transparent 
        transition-all disabled:opacity-50 disabled:cursor-not-allowed
        ${className}`}
    >
      {isLoading ? (
        <option>CARREGANDO...</option>
      ) : (
        <>
          {showAll && <option value="Todos">📊 TODOS</option>}
          {!showAll && <option value="">{placeholder}</option>}
          
          {/* Renderizar categorias agrupadas por tipo */}
          {Object.entries(groupedCategories).map(([type, cats]) => {
            const typeLabel = {
              'subject': '📚 DISCIPLINAS',
              'topic': '📝 TÓPICOS',
              'exam_board': '🏛️ BANCAS',
              'year': '📅 ANOS',
              'other': '📂 OUTROS'
            }[type] || type.toUpperCase();
            
            return (
              <optgroup key={type} label={`━━━ ${typeLabel} ━━━`}>
                {renderCategoryOptions(cats)}
              </optgroup>
            );
          })}
        </>
      )}
    </select>
  );
}