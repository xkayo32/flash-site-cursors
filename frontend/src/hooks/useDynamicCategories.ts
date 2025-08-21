import { useState, useEffect, useCallback } from 'react';
import { categoryService, Category } from '@/services/categoryService';

interface UseDynamicCategoriesReturn {
  // Estados
  categories: Category[];
  subcategories: Category[];
  selectedCategory: string;
  selectedSubcategory: string;
  isLoadingCategories: boolean;
  isLoadingSubcategories: boolean;
  
  // Funções
  setSelectedCategory: (category: string) => void;
  setSelectedSubcategory: (subcategory: string) => void;
  refreshCategories: () => Promise<void>;
  getCategoryOptions: () => string[];
  getSubcategoryOptions: () => string[];
}

export function useDynamicCategories(): UseDynamicCategoriesReturn {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [selectedSubcategory, setSelectedSubcategory] = useState('Todas');
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isLoadingSubcategories, setIsLoadingSubcategories] = useState(false);

  // Carregar categorias principais
  const loadCategories = useCallback(async () => {
    setIsLoadingCategories(true);
    try {
      const hierarchy = await categoryService.getCategoryHierarchy();
      console.log('Category hierarchy received:', hierarchy);
      console.log('Total categories:', hierarchy.length);
      
      // Debug: mostrar categorias com children
      console.log('Categories with children from API:');
      hierarchy.forEach(cat => {
        if (cat.children && cat.children.length > 0) {
          console.log(`✅ "${cat.name}" has ${cat.children.length} children:`, cat.children.map(c => c.name));
        }
      });
      
      // Filtrar apenas categorias do tipo 'subject' para o dropdown principal
      let subjectCategories = hierarchy.filter(cat => cat.type === 'subject');
      console.log('Subject categories filtered:', subjectCategories);
      
      // Se não encontrou categorias 'subject', usar todas as categorias sem parent_id
      if (subjectCategories.length === 0) {
        console.log('No subject categories found, using all parent categories');
        subjectCategories = hierarchy.filter(cat => !cat.parent_id || cat.parent_id === null);
      }
      
      setCategories(subjectCategories);
    } catch (error) {
      console.error('Error loading categories:', error);
      // Sem fallback - apenas categorias vazias se API falhar
      setCategories([]);
    } finally {
      setIsLoadingCategories(false);
    }
  }, []);

  // Função recursiva para buscar categoria em qualquer nível
  const findCategoryRecursive = useCallback((categories: Category[], name: string): Category | undefined => {
    for (const cat of categories) {
      if (cat.name === name) {
        return cat;
      }
      if (cat.children && cat.children.length > 0) {
        const found = findCategoryRecursive(cat.children, name);
        if (found) return found;
      }
    }
    return undefined;
  }, []);

  // Carregar subcategorias quando categoria principal muda
  const loadSubcategories = useCallback((categoryName: string) => {
    if (categoryName === 'Todos') {
      setSubcategories([]);
      setSelectedSubcategory('Todas');
      return;
    }

    // Buscar categoria recursivamente (pode estar em qualquer nível)
    const selectedCat = findCategoryRecursive(categories, categoryName);
    console.log('Selected category:', selectedCat);
    
    if (selectedCat?.children) {
      console.log('Mapping children directly:', selectedCat.children);
      // Suporta múltiplos níveis - children podem ter suas próprias children
      setSubcategories(selectedCat.children);
    } else {
      console.log('No children found for category:', categoryName);
      setSubcategories([]);
    }
  }, [categories, findCategoryRecursive]);


  // Função para atualizar categoria selecionada
  const handleSetSelectedCategory = useCallback((category: string) => {
    setSelectedCategory(category);
    setSelectedSubcategory('Todas'); // Reset subcategoria
    loadSubcategories(category);
  }, [loadSubcategories]);

  // Função para atualizar subcategoria selecionada
  const handleSetSelectedSubcategory = useCallback((subcategory: string) => {
    setSelectedSubcategory(subcategory);
  }, []);

  // Função recursiva para obter todas as categorias em todos os níveis
  const getAllCategoriesRecursive = useCallback((cats: Category[]): string[] => {
    let allNames: string[] = [];
    for (const cat of cats) {
      allNames.push(cat.name);
      if (cat.children && cat.children.length > 0) {
        allNames = allNames.concat(getAllCategoriesRecursive(cat.children));
      }
    }
    return allNames;
  }, []);

  // Obter opções de categoria para dropdown
  const getCategoryOptions = useCallback(() => {
    // Obter todas as categorias recursivamente e remover duplicatas
    const allNames = getAllCategoriesRecursive(categories);
    const uniqueNames = [...new Set(allNames)];
    return ['Todos', ...uniqueNames];
  }, [categories, getAllCategoriesRecursive]);

  // Obter opções de subcategoria para dropdown (suporta níveis aninhados)
  const getSubcategoryOptions = useCallback(() => {
    if (selectedCategory === 'Todos' || subcategories.length === 0) {
      return ['Todas'];
    }
    // Obter todas as subcategorias recursivamente (incluindo sub-subcategorias)
    const allSubNames = getAllCategoriesRecursive(subcategories);
    return ['Todas', ...allSubNames];
  }, [selectedCategory, subcategories, getAllCategoriesRecursive]);

  // Carregar categorias ao inicializar
  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // Recarregar subcategorias quando categorias mudam
  useEffect(() => {
    if (selectedCategory !== 'Todos' && categories.length > 0) {
      loadSubcategories(selectedCategory);
    }
  }, [selectedCategory, categories, loadSubcategories]);

  return {
    // Estados
    categories,
    subcategories,
    selectedCategory,
    selectedSubcategory,
    isLoadingCategories,
    isLoadingSubcategories,
    
    // Funções
    setSelectedCategory: handleSetSelectedCategory,
    setSelectedSubcategory: handleSetSelectedSubcategory,
    refreshCategories: loadCategories,
    getCategoryOptions,
    getSubcategoryOptions,
  };
}