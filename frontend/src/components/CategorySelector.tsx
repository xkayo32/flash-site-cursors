import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronDown, Folder, FolderOpen, FileText, Search, X } from 'lucide-react';
import { Category } from '@/services/categoryService';

interface CategorySelectorProps {
  categories: Category[];
  selectedValue: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  isLoading?: boolean;
  placeholder?: string;
  showAll?: boolean;
  label?: string;
}

export function CategorySelector({
  categories,
  selectedValue,
  onChange,
  disabled = false,
  isLoading = false,
  placeholder = "Selecione uma categoria",
  showAll = true,
  label = "Categoria"
}: CategorySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Função para toggle expandir/colapsar categoria
  const toggleExpanded = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  // Função para selecionar categoria
  const handleSelect = (value: string) => {
    console.log('CategorySelector handleSelect called with:', value, typeof value);
    onChange(value);
    setIsOpen(false);
    setSearchTerm('');
  };

  // Função para filtrar categorias baseado na busca
  const filterCategories = (cats: Category[], term: string): Category[] => {
    if (!term) return cats;
    
    return cats.reduce((acc, cat) => {
      const matchesSearch = cat.name.toLowerCase().includes(term.toLowerCase());
      const filteredChildren = cat.children ? filterCategories(cat.children, term) : [];
      
      if (matchesSearch || filteredChildren.length > 0) {
        acc.push({
          ...cat,
          children: filteredChildren
        });
      }
      
      return acc;
    }, [] as Category[]);
  };

  // Renderizar categoria com hierarquia
  const renderCategory = (cat: Category, level: number = 0) => {
    const hasChildren = cat.children && cat.children.length > 0;
    const isExpanded = expandedCategories.has(cat.id);
    const isSelected = selectedValue === cat.name;
    
    // Cores baseadas no tipo
    const typeColors = {
      'subject': 'text-blue-600 dark:text-blue-400',
      'topic': 'text-green-600 dark:text-green-400',
      'exam_board': 'text-purple-600 dark:text-purple-400',
      'year': 'text-orange-600 dark:text-orange-400'
    };
    
    const color = typeColors[cat.type as keyof typeof typeColors] || 'text-gray-600 dark:text-gray-400';

    return (
      <div key={cat.id} className="select-none">
        <div 
          className={`
            flex items-center gap-2 px-3 py-2 rounded-lg
            transition-all duration-200
            ${isSelected 
              ? 'bg-accent-500/20 text-accent-600 dark:text-accent-400 font-semibold' 
              : 'hover:bg-gray-100 dark:hover:bg-gray-800'
            }
            ${hasChildren ? 'cursor-default' : 'cursor-pointer'}
          `}
          style={{ paddingLeft: `${(level * 20) + 12}px` }}
          onClick={() => {
            // Se tem filhos, apenas expande/colapsa ao clicar no item
            // Se não tem filhos, seleciona
            if (hasChildren) {
              toggleExpanded(cat.id);
            } else {
              handleSelect(cat.name);
            }
          }}
          onDoubleClick={() => {
            // Double click sempre seleciona, mesmo se tiver filhos
            if (hasChildren) {
              handleSelect(cat.name);
            }
          }}
        >
          {/* Expand/Collapse button */}
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleExpanded(cat.id);
              }}
              className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          )}
          
          {/* Icon */}
          <div 
            className={`${color} ${!hasChildren ? 'cursor-pointer' : ''}`}
            onClick={(e) => {
              if (hasChildren) {
                e.stopPropagation();
                toggleExpanded(cat.id);
              }
            }}
          >
            {hasChildren ? (
              isExpanded ? <FolderOpen className="w-4 h-4" /> : <Folder className="w-4 h-4" />
            ) : (
              <FileText className="w-4 h-4" />
            )}
          </div>
          
          {/* Name - sempre selecionável com double click */}
          <span 
            className={`flex-1 ${hasChildren ? 'select-text' : ''}`}
            title={hasChildren ? "Clique para expandir, duplo clique para selecionar" : "Clique para selecionar"}
          >
            {cat.name}
          </span>
          
          {/* Count badge */}
          {hasChildren && (
            <span className="text-xs bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded">
              {cat.children.length}
            </span>
          )}
        </div>
        
        {/* Render children */}
        <AnimatePresence>
          {hasChildren && isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              {cat.children.map(child => renderCategory(child, level + 1))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const filteredCategories = filterCategories(categories, searchTerm);
  
  // Agrupar por tipo
  const groupedCategories = filteredCategories.reduce((acc, cat) => {
    const type = cat.type || 'other';
    if (!acc[type]) acc[type] = [];
    acc[type].push(cat);
    return acc;
  }, {} as Record<string, Category[]>);

  return (
    <div className="relative">
      {/* Label */}
      {label && (
        <label className="block text-sm font-police-subtitle uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>
      )}
      
      {/* Selected value display */}
      <button
        onClick={() => !disabled && !isLoading && setIsOpen(!isOpen)}
        disabled={disabled || isLoading}
        className={`
          w-full px-4 py-2.5 
          border border-gray-300 dark:border-gray-600 rounded-lg
          bg-gray-50 dark:bg-gray-800 
          text-left font-police-body uppercase tracking-wider
          focus:ring-2 focus:ring-accent-500 focus:border-transparent
          transition-all duration-200
          ${disabled || isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}
          ${isOpen ? 'ring-2 ring-accent-500 border-transparent' : ''}
        `}
      >
        <div className="flex items-center justify-between">
          <span className={selectedValue === 'Todos' || !selectedValue ? 'text-gray-500' : 'text-gray-900 dark:text-white'}>
            {isLoading ? 'CARREGANDO...' : (selectedValue || placeholder)}
          </span>
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>
      
      {/* Dropdown menu */}
      <AnimatePresence>
        {isOpen && !disabled && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-[9999] mt-2 w-full bg-white dark:bg-gray-900 
              border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl
              max-h-96 overflow-hidden"
            style={{ zIndex: 9999 }}
          >
            {/* Instructions */}
            <div className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              📁 <strong>Com subpastas:</strong> 1 clique expande | Duplo clique seleciona
              <br />
              📄 <strong>Sem subpastas:</strong> 1 clique seleciona
            </div>
            
            {/* Search bar */}
            <div className="p-3 border-b border-gray-200 dark:border-gray-700">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar categoria..."
                  className="w-full pl-10 pr-10 py-2 
                    bg-gray-50 dark:bg-gray-800 
                    border border-gray-200 dark:border-gray-700 rounded-lg
                    text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
                  onClick={(e) => e.stopPropagation()}
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 
                      text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            
            {/* Categories list */}
            <div className="max-h-80 overflow-y-auto p-2">
              {showAll && (
                <div 
                  className={`
                    flex items-center gap-2 px-3 py-2 cursor-pointer rounded-lg
                    transition-all duration-200 mb-2
                    ${selectedValue === 'Todos'
                      ? 'bg-accent-500/20 text-accent-600 dark:text-accent-400 font-semibold' 
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                    }
                  `}
                  onClick={() => handleSelect('Todos')}
                >
                  <span className="text-lg">📊</span>
                  <span>TODOS</span>
                </div>
              )}
              
              {/* Grouped categories */}
              {Object.entries(groupedCategories).map(([type, cats]) => {
                const typeLabels = {
                  'subject': '📚 DISCIPLINAS',
                  'topic': '📝 TÓPICOS',
                  'exam_board': '🏛️ BANCAS',
                  'year': '📅 ANOS',
                  'other': '📂 OUTROS'
                };
                
                return (
                  <div key={type} className="mb-4">
                    <div className="px-3 py-1 text-xs font-police-subtitle uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      {typeLabels[type as keyof typeof typeLabels] || type}
                    </div>
                    {cats.map(cat => renderCategory(cat))}
                  </div>
                );
              })}
              
              {filteredCategories.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Nenhuma categoria encontrada
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}