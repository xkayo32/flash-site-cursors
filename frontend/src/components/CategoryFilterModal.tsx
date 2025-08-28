import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Filter, ChevronDown, ChevronRight, FolderOpen, Folder, Tag, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { categoryService, type Category } from '@/services/categoryService';
import { cn } from '@/lib/utils';

interface CategoryFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCategories: string[];
  onCategoriesChange: (categories: string[]) => void;
  title?: string;
}

export function CategoryFilterModal({
  isOpen,
  onClose,
  selectedCategories,
  onCategoriesChange,
  title = "FILTRAR POR CATEGORIAS TÁTICAS"
}: CategoryFilterModalProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isOpen) {
      loadCategories();
    }
  }, [isOpen]);

  const loadCategories = async () => {
    try {
      setLoadingCategories(true);
      const categories = await categoryService.getCategoryHierarchy();
      if (Array.isArray(categories)) {
        setCategories(categories);
      }
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    } finally {
      setLoadingCategories(false);
    }
  };

  const toggleCategoryExpansion = (categoryId: string) => {
    setExpandedCategories(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(categoryId)) {
        newExpanded.delete(categoryId);
      } else {
        newExpanded.add(categoryId);
      }
      return newExpanded;
    });
  };

  // Função para encontrar todos os filhos de uma categoria
  const findAllChildren = (categoryId: string, cats: Category[] = categories): string[] => {
    const children: string[] = [];
    
    const addChildren = (cats: Category[]) => {
      cats.forEach(cat => {
        if (cat.id === categoryId && cat.children) {
          cat.children.forEach(child => {
            children.push(child.id);
            addChildren(cat.children!);
          });
        } else if (cat.children) {
          addChildren(cat.children);
        }
      });
    };
    
    addChildren(cats);
    return children;
  };

  // Função para encontrar todos os pais de uma categoria
  const findParentChain = (categoryId: string, cats: Category[] = categories): string[] => {
    const parentChain: string[] = [];
    
    const findParent = (cats: Category[], targetId: string): Category | null => {
      for (const cat of cats) {
        if (cat.children) {
          for (const child of cat.children) {
            if (child.id === targetId) {
              return cat;
            }
            const found = findParent(cat.children, targetId);
            if (found) return found;
          }
        }
      }
      return null;
    };
    
    let currentId = categoryId;
    while (currentId) {
      const parent = findParent(cats, currentId);
      if (parent) {
        parentChain.push(parent.id);
        currentId = parent.id;
      } else {
        break;
      }
    }
    
    return parentChain;
  };

  const handleCategoryToggle = (categoryId: string) => {
    let newSelectedCategories = [...selectedCategories];
    
    if (selectedCategories.includes(categoryId)) {
      // Desmarcando: remover a categoria e todos os filhos
      const allChildren = findAllChildren(categoryId);
      newSelectedCategories = newSelectedCategories.filter(id => 
        id !== categoryId && !allChildren.includes(id)
      );
    } else {
      // Marcando: adicionar a categoria e todos os pais
      newSelectedCategories.push(categoryId);
      const parentChain = findParentChain(categoryId);
      parentChain.forEach(parentId => {
        if (!newSelectedCategories.includes(parentId)) {
          newSelectedCategories.push(parentId);
        }
      });
    }
    
    onCategoriesChange(newSelectedCategories);
  };

  // Obter nomes das categorias selecionadas
  const getSelectedCategoryNames = (): string[] => {
    const names: string[] = [];
    
    const findCategoryName = (cats: Category[], targetId: string): string | null => {
      for (const cat of cats) {
        if (cat.id === targetId) {
          return cat.name;
        }
        if (cat.children) {
          const found = findCategoryName(cat.children, targetId);
          if (found) return found;
        }
      }
      return null;
    };
    
    selectedCategories.forEach(id => {
      const name = findCategoryName(categories, id);
      if (name) names.push(name);
    });
    
    return names;
  };

  // Renderizar árvore de categorias
  const renderCategoryTree = (category: Category, level: number = 0) => {
    const isSelected = selectedCategories.includes(category.id);
    const hasChildren = category.children && category.children.length > 0;
    const isExpanded = expandedCategories.has(category.id);
    
    const isMainCategory = level === 0;
    const indentClass = level > 0 ? 'ml-6 border-l-2 border-gray-200 dark:border-gray-600 pl-4' : '';
    
    return (
      <div key={category.id} className={`${indentClass} ${level > 0 ? 'mt-2' : ''}`}>
        <div 
          className={cn(
            "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all hover:bg-gray-100 dark:hover:bg-gray-700",
            isSelected && "bg-accent-50 dark:bg-accent-900/20 border-accent-500",
            isMainCategory && "border-2 font-bold shadow-md",
            !isMainCategory && "border ml-0"
          )}
        >
          <div className="flex items-center gap-2 flex-1">
            {hasChildren && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleCategoryExpansion(category.id);
                }}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                )}
              </button>
            )}
            
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => handleCategoryToggle(category.id)}
              className="text-accent-500 focus:ring-accent-500 rounded"
              onClick={(e) => e.stopPropagation()}
            />
            
            {hasChildren && isExpanded ? (
              <FolderOpen className={`w-4 h-4 ${isMainCategory ? 'text-accent-500' : 'text-blue-500'}`} />
            ) : hasChildren ? (
              <Folder className={`w-4 h-4 ${isMainCategory ? 'text-accent-500' : 'text-blue-500'}`} />
            ) : (
              <Tag className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            )}
            
            <div 
              className="flex-1 cursor-pointer"
              onClick={() => handleCategoryToggle(category.id)}
            >
              <div className={`font-police-body font-semibold text-gray-900 dark:text-white uppercase tracking-wider ${isMainCategory ? 'text-sm' : 'text-xs'}`}>
                {category.name}
                {hasChildren && ` (${category.children!.length} subcategorias)`}
              </div>
            </div>
          </div>
        </div>
        
        {hasChildren && isExpanded && (
          <div className="mt-2">
            {category.children!.map(child => renderCategoryTree(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-xl z-[10000]"
        >
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-police-title font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                {title}
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            {selectedCategories.length > 0 && (
              <div className="mt-4 p-3 bg-accent-500/10 border border-accent-500/30 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-police-subtitle font-semibold text-gray-900 dark:text-white uppercase tracking-wider text-sm">
                    {selectedCategories.length} CATEGORIAS SELECIONADAS
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onCategoriesChange([])}
                    className="text-xs font-police-body uppercase tracking-wider hover:text-red-500"
                  >
                    LIMPAR TODAS
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {getSelectedCategoryNames().map((name, index) => (
                    <Badge key={index} className="bg-accent-500 text-black font-police-body">
                      {name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            {loadingCategories ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-accent-500 mr-3" />
                <span className="font-police-body text-gray-600 dark:text-gray-400">
                  Carregando categorias...
                </span>
              </div>
            ) : categories.length === 0 ? (
              <div className="text-center py-8">
                <Folder className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="font-police-body text-gray-500 dark:text-gray-400">
                  Nenhuma categoria disponível
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {categories.map(category => renderCategoryTree(category))}
              </div>
            )}
          </div>
          
          <div className="p-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1 font-police-body uppercase tracking-wider"
              >
                CANCELAR
              </Button>
              <Button
                onClick={onClose}
                className="flex-1 bg-accent-500 hover:bg-accent-600 dark:bg-gray-100 dark:hover:bg-accent-650 text-black dark:text-black hover:text-black dark:hover:text-white font-police-body uppercase tracking-wider"
              >
                APLICAR FILTROS
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}