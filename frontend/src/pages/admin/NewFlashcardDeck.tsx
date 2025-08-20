import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Target,
  CheckCircle,
  AlertCircle,
  Eye,
  Brain,
  Shield,
  Crosshair,
  BookOpen,
  Tag,
  Globe,
  Lock,
  Plus,
  X,
  Edit,
  Trash2,
  Folder,
  FolderOpen,
  FolderPlus,
  Loader2,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { categoryService, Category, CategoryType } from '@/services/categoryService';
import { flashcardDeckService, CreateDeckData } from '@/services/flashcardDeckService';
import toast from 'react-hot-toast';

const difficulties = ['easy', 'medium', 'hard'];

// Interface para categorias pendentes (antes de salvar)
interface PendingCategory {
  id: string;
  name: string;
  description?: string;
  children: PendingCategory[];
  isExpanded?: boolean;
  isEditing?: boolean;
}

export default function NewFlashcardDeck() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4; // Agora são 4 etapas: Básico, Configurações, Flashcards, Revisão
  const [isLoading, setIsLoading] = useState(false);
  
  // Categories state
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [selectedCategoryLevels, setSelectedCategoryLevels] = useState<{[level: string]: string}>({});
  
  // Quick category creation modal - NOVO SISTEMA
  const [showQuickCategoryModal, setShowQuickCategoryModal] = useState(false);
  const [pendingTree, setPendingTree] = useState<PendingCategory[]>([]);
  const [savingCategories, setSavingCategories] = useState(false);
  
  // Form for adding new category
  const [newCategoryForm, setNewCategoryForm] = useState({
    name: '',
    description: '',
    parentId: null as string | null
  });
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    selectedCategories: [] as string[], // Array of selected category IDs
    difficulty: 'medium',
    isPublic: true,
    tags: '',
    estimatedCards: 0,
    objective: '',
    studyMethod: 'spaced_repetition',
    status: 'draft',
    // Configurações Anki-style
    ankiSettings: {
      newCardsPerDay: 20,
      maxReviewsPerDay: 200,
      desiredRetention: 0.9, // 90%
      learningSteps: [1, 10], // minutos
      graduatingInterval: 1, // dias
      easyInterval: 4, // dias
      startingEase: 2.5,
      maxInterval: 36500, // ~100 anos em dias
      lapseSteps: [10], // minutos para reaprendizagem
      leechThreshold: 8, // falhas consecutivas
      enableFuzzFactor: true
    }
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [newTag, setNewTag] = useState('');
  const [tagsList, setTagsList] = useState<string[]>([]);
  
  // Estado para flashcards sendo criados no deck
  const [deckFlashcards, setDeckFlashcards] = useState<any[]>([]);
  const [currentFlashcardForm, setCurrentFlashcardForm] = useState({
    type: 'basic',
    front: '',
    back: '',
    hint: '',
    explanation: '',
    difficulty: 'medium',
    tags: [] as string[]
  });
  const [editingFlashcardIndex, setEditingFlashcardIndex] = useState<number | null>(null);
  
  // Estado para importação de flashcards existentes
  const [activeTab, setActiveTab] = useState<'create' | 'import' | null>(null);
  const [availableFlashcards, setAvailableFlashcards] = useState<any[]>([]);
  const [loadingFlashcards, setLoadingFlashcards] = useState(false);
  const [flashcardFilters, setFlashcardFilters] = useState({
    search: '',
    category: '',
    type: '',
    difficulty: ''
  });
  const [selectedFlashcards, setSelectedFlashcards] = useState<Set<string>>(new Set());

  // Load categories on component mount
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoadingCategories(true);
    try {
      const response = await categoryService.listCategories();
      if (response.success && response.categories) {
        setCategories(response.categories);
      } else if (response.categories) {
        setCategories(response.categories);
      } else {
        toast.error('Erro ao carregar categorias');
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      toast.error('Erro ao carregar categorias');
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Função para lidar com configurações Anki
  const handleAnkiSettingChange = (setting: string, value: number | boolean) => {
    setFormData(prev => ({
      ...prev,
      ankiSettings: {
        ...prev.ankiSettings,
        [setting]: value
      }
    }));
  };

  // Função utilitária para processar cloze estilo Anki
  const processClozeCard = (text: string) => {
    // Encontrar todas as ocultações {{c1::texto}}, {{c2::texto}}, etc.
    const clozePattern = /\{\{c(\d+)::([^}]+)\}\}/g;
    const matches = [];
    let match;
    
    while ((match = clozePattern.exec(text)) !== null) {
      matches.push({
        number: parseInt(match[1]),
        text: match[2],
        fullMatch: match[0]
      });
    }
    
    if (matches.length === 0) {
      return [{ text, clozeNumber: null }];
    }
    
    // Obter números únicos de cloze
    const uniqueNumbers = [...new Set(matches.map(m => m.number))].sort((a, b) => a - b);
    
    // Gerar um card para cada número de cloze
    return uniqueNumbers.map(number => {
      let cardText = text;
      
      // Para este card, mostrar apenas as ocultações deste número como [...]
      matches.forEach(match => {
        if (match.number === number) {
          cardText = cardText.replace(match.fullMatch, '[...]');
        } else {
          // Outras ocultações mostram o texto completo
          cardText = cardText.replace(match.fullMatch, match.text);
        }
      });
      
      return {
        text: cardText,
        clozeNumber: number,
        answer: matches.filter(m => m.number === number).map(m => m.text).join(', ')
      };
    });
  };

  // Função para contar quantos cards serão gerados
  const countClozeCards = (text: string) => {
    if (!text) return 1;
    const clozePattern = /\{\{c(\d+)::([^}]+)\}\}/g;
    const numbers = new Set();
    let match;
    
    while ((match = clozePattern.exec(text)) !== null) {
      numbers.add(parseInt(match[1]));
    }
    
    return numbers.size > 0 ? numbers.size : 1;
  };

  // Funções para gerenciar flashcards do deck
  const addFlashcardToDeck = () => {
    if (!currentFlashcardForm.front.trim() || (!currentFlashcardForm.back.trim() && currentFlashcardForm.type !== 'cloze')) {
      toast.error('Preencha pelo menos a frente do flashcard');
      return;
    }

    if (editingFlashcardIndex !== null) {
      // Editando flashcard existente - não processar cloze múltiplo para edições
      const updatedFlashcard = {
        id: deckFlashcards[editingFlashcardIndex].id,
        ...currentFlashcardForm,
        category: formData.selectedCategories[0] || 'Geral',
        created_at: deckFlashcards[editingFlashcardIndex].created_at
      };
      
      setDeckFlashcards(prev => {
        const updated = [...prev];
        updated[editingFlashcardIndex] = updatedFlashcard;
        return updated;
      });
      setEditingFlashcardIndex(null);
      toast.success('Flashcard atualizado!');
    } else {
      // Adicionando novo flashcard
      if (currentFlashcardForm.type === 'cloze') {
        // Processar cloze estilo Anki - gerar múltiplos cards
        const clozeCards = processClozeCard(currentFlashcardForm.front);
        const newFlashcards = clozeCards.map((clozeCard, index) => ({
          id: `${Date.now()}_${index}`,
          type: 'cloze',
          front: clozeCard.text,
          back: clozeCard.answer || currentFlashcardForm.back,
          hint: currentFlashcardForm.hint,
          explanation: currentFlashcardForm.explanation,
          difficulty: currentFlashcardForm.difficulty,
          tags: currentFlashcardForm.tags,
          category: formData.selectedCategories[0] || 'Geral',
          created_at: new Date().toISOString(),
          clozeNumber: clozeCard.clozeNumber,
          originalText: currentFlashcardForm.front
        }));
        
        setDeckFlashcards(prev => [...prev, ...newFlashcards]);
        toast.success(`${newFlashcards.length} cards de ocultação adicionados ao arsenal!`);
      } else {
        // Outros tipos de flashcard - comportamento normal
        const newFlashcard = {
          id: Date.now().toString(),
          ...currentFlashcardForm,
          category: formData.selectedCategories[0] || 'Geral',
          created_at: new Date().toISOString()
        };
        
        setDeckFlashcards(prev => [...prev, newFlashcard]);
        toast.success('Flashcard adicionado ao arsenal!');
      }
    }

    // Reset form
    setCurrentFlashcardForm({
      type: 'basic',
      front: '',
      back: '',
      hint: '',
      explanation: '',
      difficulty: 'medium',
      tags: []
    });
  };

  const editFlashcard = (index: number) => {
    const flashcard = deckFlashcards[index];
    setCurrentFlashcardForm(flashcard);
    setEditingFlashcardIndex(index);
  };

  const deleteFlashcard = (index: number) => {
    setDeckFlashcards(prev => prev.filter((_, i) => i !== index));
    toast.success('Flashcard removido!');
  };

  const cancelFlashcardEdit = () => {
    setEditingFlashcardIndex(null);
    setCurrentFlashcardForm({
      type: 'basic',
      front: '',
      back: '',
      hint: '',
      explanation: '',
      difficulty: 'medium',
      tags: []
    });
  };

  // Funções para importação de flashcards existentes
  const loadAvailableFlashcards = async () => {
    setLoadingFlashcards(true);
    try {
      // TODO: Implementar carregamento real dos flashcards da API
      // Por enquanto, simular dados
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockFlashcards = [
        {
          id: '1',
          type: 'basic',
          front: 'O que é o princípio da legalidade?',
          back: 'Ninguém será obrigado a fazer ou deixar de fazer algo senão em virtude de lei',
          category: 'Direito Constitucional',
          difficulty: 'medium',
          created_at: '2024-01-15'
        },
        {
          id: '2',
          type: 'multiple_choice',
          front: 'Qual a hierarquia das normas constitucionais?',
          back: 'Constituição > Lei Complementar > Lei Ordinária > Decreto',
          category: 'Direito Constitucional',
          difficulty: 'hard',
          created_at: '2024-01-10'
        },
        {
          id: '3',
          type: 'true_false',
          front: 'Os direitos fundamentais são absolutos',
          back: 'FALSO - Os direitos fundamentais não são absolutos, podem ser limitados',
          category: 'Direitos Fundamentais',
          difficulty: 'easy',
          created_at: '2024-01-12'
        },
        {
          id: '4',
          type: 'cloze',
          front: 'O {{c1::Estado de Direito}} é caracterizado pela {{c2::supremacia da lei}}',
          back: 'Estado de Direito / supremacia da lei',
          category: 'Teoria do Estado',
          difficulty: 'medium',
          created_at: '2024-01-08'
        },
        {
          id: '5',
          type: 'basic',
          front: 'Defina separação dos poderes',
          back: 'Divisão do poder estatal em três funções: legislativa, executiva e judiciária',
          category: 'Organização do Estado',
          difficulty: 'easy',
          created_at: '2024-01-05'
        }
      ];
      
      setAvailableFlashcards(mockFlashcards);
    } catch (error) {
      console.error('Erro ao carregar flashcards:', error);
      toast.error('Erro ao carregar flashcards existentes');
    } finally {
      setLoadingFlashcards(false);
    }
  };

  const toggleFlashcardSelection = (flashcardId: string) => {
    setSelectedFlashcards(prev => {
      const newSelected = new Set(prev);
      if (newSelected.has(flashcardId)) {
        newSelected.delete(flashcardId);
      } else {
        newSelected.add(flashcardId);
      }
      return newSelected;
    });
  };

  const importSelectedFlashcards = () => {
    const flashcardsToImport = availableFlashcards.filter(fc => selectedFlashcards.has(fc.id));
    
    setDeckFlashcards(prev => {
      // Evitar duplicatas
      const existingIds = new Set(prev.map(fc => fc.id));
      const newFlashcards = flashcardsToImport.filter(fc => !existingIds.has(fc.id));
      return [...prev, ...newFlashcards];
    });
    
    setSelectedFlashcards(new Set());
    toast.success(`${flashcardsToImport.length} flashcards importados para o arsenal!`);
  };

  const selectAllFilteredFlashcards = () => {
    const filtered = getFilteredFlashcards();
    setSelectedFlashcards(new Set(filtered.map(fc => fc.id)));
  };

  const clearSelection = () => {
    setSelectedFlashcards(new Set());
  };

  const getFilteredFlashcards = () => {
    return availableFlashcards.filter(flashcard => {
      const matchesSearch = !flashcardFilters.search || 
        flashcard.front.toLowerCase().includes(flashcardFilters.search.toLowerCase()) ||
        flashcard.back.toLowerCase().includes(flashcardFilters.search.toLowerCase());
      
      const matchesCategory = !flashcardFilters.category || 
        flashcard.category === flashcardFilters.category;
      
      const matchesType = !flashcardFilters.type || 
        flashcard.type === flashcardFilters.type;
      
      const matchesDifficulty = !flashcardFilters.difficulty || 
        flashcard.difficulty === flashcardFilters.difficulty;
      
      return matchesSearch && matchesCategory && matchesType && matchesDifficulty;
    });
  };

  // Carregar flashcards quando mudar para a aba de importação
  useEffect(() => {
    if (activeTab === 'import' && availableFlashcards.length === 0) {
      loadAvailableFlashcards();
    }
  }, [activeTab]);

  // Função para encontrar todos os pais de uma categoria
  const findParentChain = (categoryId: string, cats: Category[] = categories): string[] => {
    const parentChain: string[] = [];
    
    const findParent = (cats: Category[], targetId: string): Category | null => {
      for (const cat of cats) {
        if (cat.children?.some(child => child.id === targetId)) {
          return cat;
        }
        if (cat.children) {
          const found = findParent(cat.children, targetId);
          if (found) return found;
        }
      }
      return null;
    };
    
    let currentId = categoryId;
    while (true) {
      const parent = findParent(cats, currentId);
      if (!parent) break;
      parentChain.unshift(parent.id);
      currentId = parent.id;
    }
    
    return parentChain;
  };

  // Função para encontrar todos os filhos de uma categoria
  const findAllChildren = (categoryId: string, cats: Category[] = categories): string[] => {
    const children: string[] = [];
    
    const findCategory = (cats: Category[], targetId: string): Category | null => {
      for (const cat of cats) {
        if (cat.id === targetId) return cat;
        if (cat.children) {
          const found = findCategory(cat.children, targetId);
          if (found) return found;
        }
      }
      return null;
    };
    
    const collectChildren = (cat: Category) => {
      if (cat.children) {
        cat.children.forEach(child => {
          children.push(child.id);
          collectChildren(child);
        });
      }
    };
    
    const category = findCategory(cats, categoryId);
    if (category) {
      collectChildren(category);
    }
    
    return children;
  };

  const handleCategoryToggle = (categoryId: string) => {
    setFormData(prev => {
      let newSelectedCategories = [...prev.selectedCategories];
      
      if (prev.selectedCategories.includes(categoryId)) {
        // Desmarcando: remover a categoria e todos os filhos
        const allChildren = findAllChildren(categoryId);
        newSelectedCategories = newSelectedCategories.filter(id => 
          id !== categoryId && !allChildren.includes(id)
        );
      } else {
        // Marcando: adicionar a categoria e todos os pais
        const parentChain = findParentChain(categoryId);
        const toAdd = [categoryId, ...parentChain];
        
        toAdd.forEach(id => {
          if (!newSelectedCategories.includes(id)) {
            newSelectedCategories.push(id);
          }
        });
      }
      
      return { ...prev, selectedCategories: newSelectedCategories };
    });
  };

  // Adiciona categoria à árvore pendente
  const handleAddToPendingTree = () => {
    if (!newCategoryForm.name.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }

    const newCategory: PendingCategory = {
      id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: newCategoryForm.name,
      description: newCategoryForm.description,
      children: [],
      isExpanded: true
    };

    if (newCategoryForm.parentId) {
      // Adicionar como subcategoria
      const addToParent = (items: PendingCategory[]): PendingCategory[] => {
        return items.map(item => {
          if (item.id === newCategoryForm.parentId) {
            return {
              ...item,
              children: [...item.children, newCategory],
              isExpanded: true
            };
          }
          if (item.children.length > 0) {
            return {
              ...item,
              children: addToParent(item.children)
            };
          }
          return item;
        });
      };
      setPendingTree(addToParent(pendingTree));
    } else {
      // Adicionar como categoria principal
      setPendingTree([...pendingTree, newCategory]);
    }

    // Limpar form mas manter parent se estava criando subcategoria
    setNewCategoryForm({
      name: '',
      description: '',
      parentId: newCategoryForm.parentId
    });

    toast.success(
      newCategoryForm.parentId ? 'Subcategoria adicionada!' : 'Categoria adicionada!',
      { icon: '✅', duration: 1500 }
    );
  };

  // Remove categoria da árvore
  const handleRemoveFromTree = (categoryId: string) => {
    const removeFromTree = (items: PendingCategory[]): PendingCategory[] => {
      return items.filter(item => {
        if (item.id === categoryId) return false;
        if (item.children.length > 0) {
          item.children = removeFromTree(item.children);
        }
        return true;
      });
    };
    setPendingTree(removeFromTree(pendingTree));
    toast.success('Categoria removida', { icon: '🗑️', duration: 1500 });
  };

  // Toggle expand/collapse
  const handleToggleExpand = (categoryId: string) => {
    const toggleExpand = (items: PendingCategory[]): PendingCategory[] => {
      return items.map(item => {
        if (item.id === categoryId) {
          return { ...item, isExpanded: !item.isExpanded };
        }
        if (item.children.length > 0) {
          return { ...item, children: toggleExpand(item.children) };
        }
        return item;
      });
    };
    setPendingTree(toggleExpand(pendingTree));
  };

  // Salva toda a árvore no banco
  const handleSaveAllCategories = async () => {
    if (pendingTree.length === 0) {
      toast.error('Nenhuma categoria para salvar');
      return;
    }

    setSavingCategories(true);
    let successCount = 0;
    let errorCount = 0;
    const newlyCreatedIds: string[] = [];

    try {
      // Função recursiva para salvar
      const saveCategory = async (
        category: PendingCategory,
        parentId?: string
      ): Promise<string | null> => {
        try {
          const response = await categoryService.createCategory({
            name: category.name,
            type: parentId ? 'topic' : 'subject',
            parent: parentId,
            description: category.description
          });

          if (response.success && response.data) {
            successCount++;
            const savedId = response.data.id;
            newlyCreatedIds.push(savedId);

            // Salvar filhos recursivamente
            for (const child of category.children) {
              await saveCategory(child, savedId);
            }

            return savedId;
          } else {
            errorCount++;
            return null;
          }
        } catch (error) {
          errorCount++;
          return null;
        }
      };

      // Salvar todas as categorias
      for (const category of pendingTree) {
        await saveCategory(category);
      }

      if (successCount > 0) {
        toast.success(`✅ ${successCount} categorias salvas com sucesso!`);
        setPendingTree([]);
        await loadCategories();
        
        // Auto-selecionar as categorias criadas
        setFormData(prev => ({
          ...prev,
          selectedCategories: [...new Set([...prev.selectedCategories, ...newlyCreatedIds])]
        }));
        
        setTimeout(() => setShowQuickCategoryModal(false), 1500);
      }

      if (errorCount > 0) {
        toast.error(`⚠️ ${errorCount} erros ao salvar`);
      }
    } catch (error) {
      toast.error('Erro ao salvar categorias');
    } finally {
      setSavingCategories(false);
    }
  };

  // Conta total de categorias na árvore
  const countCategories = (items: PendingCategory[]): number => {
    let count = 0;
    items.forEach(item => {
      count++;
      if (item.children.length > 0) {
        count += countCategories(item.children);
      }
    });
    return count;
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tagsList.includes(newTag.trim())) {
      setTagsList([...tagsList, newTag.trim().toUpperCase()]);
      setNewTag('');
      toast.success('MARCADOR TÁTICO ADICIONADO', {
        duration: 2000,
        icon: '🎯'
      });
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTagsList(tagsList.filter(tag => tag !== tagToRemove));
    toast.success('MARCADOR TÁTICO REMOVIDO', {
      duration: 2000,
      icon: '❌'
    });
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.title.trim()) {
      newErrors.title = 'O título é obrigatório';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'A descrição é obrigatória';
    }

    if (!formData.objective.trim()) {
      newErrors.objective = 'O objetivo é obrigatório';
    }

    if (formData.selectedCategories.length === 0) {
      newErrors.selectedCategories = 'Selecione pelo menos uma categoria';
    }

    if (formData.estimatedCards < 0) {
      newErrors.estimatedCards = 'O número de cartões não pode ser negativo';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getSelectedCategoryNames = () => {
    const selected = categories.filter(cat => formData.selectedCategories.includes(cat.id));
    const names: string[] = [];
    
    selected.forEach(cat => {
      names.push(cat.name);
      if (cat.children) {
        cat.children.forEach(child => {
          if (formData.selectedCategories.includes(child.id)) {
            names.push(`${cat.name} > ${child.name}`);
          }
        });
      }
    });
    
    return names;
  };

  const handleSave = async (isDraft: boolean = false, goToAddCards: boolean = false) => {
    if (!isDraft && !validateForm()) {
      toast.error('OPERAÇÃO FALHADA: Corrija os campos com erro', {
        icon: '🚨'
      });
      return;
    }

    setIsLoading(true);
    const action = isDraft ? 'salvando rascunho' : 'criando arsenal';
    toast.loading(`${action.charAt(0).toUpperCase() + action.slice(1)}...`, { id: 'save' });

    try {
      // Preparar dados para a API
      const deckData: CreateDeckData = {
        name: formData.title,
        description: formData.description,
        subject: formData.selectedCategories.join(','), // Converter categorias para string
        is_public: formData.isPublic
      };

      // Chamar API real
      const response = await flashcardDeckService.createDeck(deckData);
      
      if (response.success && response.data) {
        const createdDeckId = response.data.id;
        
        // Se há flashcards criados, adicionar ao deck
        if (deckFlashcards.length > 0) {
          toast.loading(`Adicionando ${deckFlashcards.length} flashcards ao arsenal...`, { id: 'save' });
          
          // TODO: Implementar criação de flashcards via API
          // Por enquanto, simular sucesso
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const finalFormData = {
            ...formData,
            tags: tagsList.join(','),
            status: isDraft ? 'draft' : 'published',
            flashcardsCount: deckFlashcards.length
          };
          
          toast.success(`OPERAÇÃO CONCLUÍDA: Arsenal criado com ${deckFlashcards.length} flashcards!`, { id: 'save' });
        } else {
          const finalFormData = {
            ...formData,
            tags: tagsList.join(','),
            status: isDraft ? 'draft' : 'published'
          };
          
          toast.success(`OPERAÇÃO CONCLUÍDA: Arsenal ${isDraft ? 'salvo como rascunho' : 'criado'} com sucesso!`, { id: 'save' });
        }
        
        // Sempre voltar para lista após criar com flashcards
        setTimeout(() => {
          navigate('/admin/flashcards');
        }, 1500);
      } else {
        toast.error('OPERAÇÃO FALHADA: Erro ao salvar arsenal', { id: 'save' });
      }
    } catch (error) {
      console.error('Error saving deck:', error);
      toast.error(`OPERAÇÃO FALHADA: ${error instanceof Error ? error.message : 'Erro desconhecido'}`, { id: 'save' });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreview = () => {
    toast.success('PREVIEW TÁTICO ATIVADO: Arsenal disponível para visualização', {
      duration: 3000,
      icon: '🎯'
    });
  };

  const nextStep = () => {
    if (currentStep === 1) {
      // Validate step 1 fields
      if (!formData.title.trim() || !formData.description.trim()) {
        toast.error('OPERAÇÃO FALHADA: Configure campos obrigatórios', { icon: '🚨' });
        return;
      }
    }
    
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      toast.success(`AVANÇANDO PARA FASE TÁTICA ${currentStep + 1}`, {
        duration: 2000,
        icon: '✅'
      });
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      toast.success(`Voltando para etapa ${currentStep - 1}`, {
        duration: 2000,
        icon: '⬅️'
      });
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    const labels = { easy: 'FÁCIL', medium: 'MÉDIO', hard: 'DIFÍCIL' };
    return labels[difficulty as keyof typeof labels];
  };


  const getStudyMethodLabel = (method: string) => {
    const labels = {
      spaced_repetition: 'REPETIÇÃO ESPAÇADA',
      active_recall: 'RECORDAÇÃO ATIVA',
      flashcards: 'FLASHCARDS TRADICIONAL',
      mixed: 'MÉTODO MISTO'
    };
    return labels[method as keyof typeof labels] || method.toUpperCase();
  };

  const renderCategoryTree = (category: Category, level: number = 0) => {
    const isSelected = formData.selectedCategories.includes(category.id);
    const hasChildren = category.children && category.children.length > 0;

    return (
      <div key={category.id} className={`${level > 0 ? 'ml-6' : ''}`}>
        <div
          className={`
            flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 cursor-pointer
            ${isSelected 
              ? 'bg-accent-500/20 border-accent-500 shadow-sm' 
              : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-accent-500/50'
            }
          `}
          onClick={() => handleCategoryToggle(category.id)}
        >
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => handleCategoryToggle(category.id)}
              className="text-accent-500 focus:ring-accent-500 rounded"
            />
            {hasChildren ? (
              <Folder className="w-4 h-4 text-accent-500" />
            ) : (
              <Tag className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-police-body font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                {category.name}
              </span>
              {level === 0 && (
                <Badge variant="outline" className="text-xs font-police-body">
                  PRINCIPAL
                </Badge>
              )}
            </div>
            {category.description && (
              <p className="text-xs text-gray-600 dark:text-gray-400 font-police-body mt-1">
                {category.description}
              </p>
            )}
          </div>
        </div>
        
        {hasChildren && (
          <div className="mt-2 space-y-1">
            {category.children!.map(child => renderCategoryTree(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  // Renderiza a árvore pendente
  const renderPendingTree = (items: PendingCategory[], level = 0): JSX.Element => {
    return (
      <>
        {items.map(item => (
          <div key={item.id}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`
                group flex items-center gap-2 p-3 rounded-lg border
                ${level === 0 
                  ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700' 
                  : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-600'
                }
                hover:border-accent-500/50 transition-all duration-200
                ${level > 0 ? `ml-${level * 8}` : ''}
              `}
              style={{ marginLeft: level * 32 + 'px' }}
            >
              {/* Expand/Collapse button */}
              {item.children.length > 0 && (
                <button
                  onClick={() => handleToggleExpand(item.id)}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                >
                  {item.isExpanded ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>
              )}

              {/* Icon */}
              <div className="p-2 bg-accent-500/20 rounded-lg">
                {item.children.length > 0 ? (
                  <FolderOpen className="w-4 h-4 text-accent-500" />
                ) : (
                  <Folder className="w-4 h-4 text-accent-500" />
                )}
              </div>

              {/* Name and description */}
              <div className="flex-1">
                <div className="font-semibold text-gray-900 dark:text-white">
                  {item.name}
                </div>
                {item.description && (
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {item.description}
                  </div>
                )}
                {item.children.length > 0 && (
                  <div className="text-xs text-gray-500 mt-1">
                    {item.children.length} subcategoria{item.children.length > 1 ? 's' : ''}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setNewCategoryForm({ ...newCategoryForm, parentId: item.id })}
                  className="h-8 w-8 p-0"
                  title="Adicionar subcategoria"
                >
                  <FolderPlus className="w-4 h-4 text-green-600" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveFromTree(item.id)}
                  className="h-8 w-8 p-0"
                  title="Remover"
                >
                  <X className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            </motion.div>

            {/* Render children */}
            {item.isExpanded && item.children.length > 0 && (
              <div className="mt-2">
                {renderPendingTree(item.children, level + 1)}
              </div>
            )}
          </div>
        ))}
      </>
    );
  };

  const renderQuickCategoryModal = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                🏗️ Construtor de Categorias Aninhadas
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Crie toda a estrutura de categorias antes de salvar no banco
              </p>
            </div>
            <button
              onClick={() => {
                if (pendingTree.length > 0) {
                  if (confirm('Há categorias não salvas. Deseja realmente fechar?')) {
                    setShowQuickCategoryModal(false);
                    setPendingTree([]);
                  }
                } else {
                  setShowQuickCategoryModal(false);
                }
              }}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body - Two columns */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left column - Form */}
          <div className="w-1/3 p-6 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
              ➕ Adicionar Categoria
            </h4>

            {newCategoryForm.parentId && (
              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <span className="text-blue-700 dark:text-blue-300">Criando subcategoria de:</span>
                    <div className="font-semibold text-blue-900 dark:text-blue-100">
                      {(() => {
                        const findName = (items: PendingCategory[], id: string): string => {
                          for (const item of items) {
                            if (item.id === id) return item.name;
                            const found = findName(item.children, id);
                            if (found) return found;
                          }
                          return '';
                        };
                        return findName(pendingTree, newCategoryForm.parentId);
                      })()}
                    </div>
                  </div>
                  <button
                    onClick={() => setNewCategoryForm({ ...newCategoryForm, parentId: null })}
                    className="p-1 hover:bg-blue-100 dark:hover:bg-blue-800 rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nome *
                </label>
                <input
                  type="text"
                  value={newCategoryForm.name}
                  onChange={(e) => setNewCategoryForm({ ...newCategoryForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  placeholder="Ex: Direito Constitucional"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddToPendingTree()}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Descrição
                </label>
                <textarea
                  value={newCategoryForm.description}
                  onChange={(e) => setNewCategoryForm({ ...newCategoryForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  placeholder="Descrição opcional..."
                />
              </div>

              <Button
                onClick={handleAddToPendingTree}
                disabled={!newCategoryForm.name.trim()}
                className="w-full bg-accent-500 hover:bg-accent-600 text-black"
              >
                <Plus className="w-4 h-4 mr-2" />
                {newCategoryForm.parentId ? 'Adicionar Subcategoria' : 'Adicionar Categoria'}
              </Button>

              {!newCategoryForm.parentId && (
                <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  💡 Dica: Use o botão <FolderPlus className="w-3 h-3 inline" /> ao lado de cada categoria para criar subcategorias
                </div>
              )}
            </div>
          </div>

          {/* Right column - Tree view */}
          <div className="flex-1 p-6 overflow-y-auto bg-gray-50 dark:bg-gray-900/50">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-900 dark:text-white">
                🌳 Estrutura Pendente ({countCategories(pendingTree)} categorias)
              </h4>
              {pendingTree.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (confirm('Limpar toda a estrutura?')) {
                      setPendingTree([]);
                      setNewCategoryForm({ name: '', description: '', parentId: null });
                    }
                  }}
                  className="text-red-600 hover:bg-red-50"
                >
                  <X className="w-4 h-4 mr-1" />
                  Limpar Tudo
                </Button>
              )}
            </div>

            {pendingTree.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Folder className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p>Nenhuma categoria adicionada ainda</p>
                <p className="text-sm mt-2">Comece criando uma categoria principal</p>
              </div>
            ) : (
              <div className="space-y-2">
                {renderPendingTree(pendingTree)}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {pendingTree.length > 0 && (
                <span>
                  {countCategories(pendingTree)} categoria(s) prontas para salvar
                </span>
              )}
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowQuickCategoryModal(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSaveAllCategories}
                disabled={pendingTree.length === 0 || savingCategories}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {savingCategories ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Salvar Tudo no Banco
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header Militar/Tático */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-gray-800 via-[#14242f] to-gray-900 dark:from-gray-900 dark:via-[#14242f] dark:to-black p-8 rounded-lg relative overflow-hidden"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,204,21,0.3) 1px, transparent 0)',
          backgroundSize: '20px 20px'
        }}
      >
        {/* Corner accents */}
        <div className="absolute top-0 right-0 w-20 h-20 border-t-4 border-r-4 border-accent-500/30" />
        <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-accent-500/20" />
        
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
          <div className="flex items-center gap-6">
            <Button
              variant="ghost"
              onClick={() => navigate('/admin/flashcards')}
              className="gap-2 font-police-body uppercase tracking-wider hover:bg-white/10 text-white hover:text-accent-500 border border-transparent hover:border-accent-500/30 transition-all duration-300"
            >
              <ArrowLeft className="w-5 h-5" />
              RETORNAR À BASE
            </Button>
            <div className="border-l-4 border-l-accent-500 pl-6">
              <h1 className="text-4xl font-police-title font-bold uppercase tracking-wider text-white">
                NOVO ARSENAL INTEL
              </h1>
              <p className="text-gray-300 font-police-subtitle uppercase tracking-wider mt-1">
                OPERAÇÃO DE CRIAÇÃO DE BARALHO TÁTICO
              </p>
            </div>
          </div>
        
          <div className="flex flex-wrap items-center gap-4">
            <Button
              variant="ghost"
              onClick={handlePreview}
              className="gap-2 font-police-body uppercase tracking-wider hover:bg-white/10 text-white hover:text-accent-500 border border-transparent hover:border-accent-500/30 transition-all duration-300"
            >
              <Eye className="w-5 h-5" />
              PREVIEW TÁTICO
            </Button>
            <Button
              variant="ghost"
              onClick={() => handleSave(true)}
              disabled={isLoading}
              className="gap-2 font-police-body uppercase tracking-wider hover:bg-white/10 text-white hover:text-accent-500 border border-transparent hover:border-accent-500/30 transition-all duration-300 disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              SALVAR RASCUNHO
            </Button>
            <Button
              onClick={() => handleSave(false)}
              disabled={isLoading}
              className="gap-2 bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black font-police-body font-bold uppercase tracking-wider transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50"
            >
              <CheckCircle className="w-5 h-5" />
              {isLoading ? 'PROCESSANDO...' : 'CONFIRMAR OPERAÇÃO'}
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Progress Steps */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-accent-500/30 shadow-xl relative overflow-hidden">
          {/* Tactical stripes */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent-500 via-accent-400 to-accent-500" />
          <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-accent-500/20" />
          
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-police-numbers font-bold text-sm transition-all duration-300 shadow-lg ${
                      step <= currentStep
                        ? 'bg-accent-500 text-black shadow-accent-500/30'
                        : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {step <= currentStep ? <CheckCircle className="w-4 h-4" /> : step}
                  </div>
                  <div className="ml-3">
                    <p className={`font-police-subtitle font-semibold uppercase tracking-wider text-xs ${
                      step <= currentStep ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {step === 1 && 'BRIEFING INICIAL'}
                      {step === 2 && 'CONFIG. TÁTICAS'}
                      {step === 3 && 'CRIAÇÃO ARSENAL'}
                      {step === 4 && 'CONFIRMAÇÃO FINAL'}
                    </p>
                  </div>
                  {step < totalSteps && (
                    <div className={`flex-1 h-px mx-4 ${
                      step < currentStep ? 'bg-accent-500' : 'bg-gray-300 dark:bg-gray-700'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Form Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {currentStep === 1 && (
          <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-accent-500/30 shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden">
            {/* Tactical stripes */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent-500 via-accent-400 to-accent-500" />
            <div className="absolute top-0 right-0 w-20 h-20 border-t-4 border-r-4 border-accent-500/20" />
            
            <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border-b border-accent-500/30">
              <CardTitle className="flex items-center gap-3 font-police-title uppercase tracking-wider text-gray-900 dark:text-white">
                <Target className="w-6 h-6 text-accent-500" />
                ETAPA 1: BRIEFING INICIAL
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-police-subtitle font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wider flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-accent-500" />
                  IDENTIFICAÇÃO TÁTICA DO ARSENAL *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="EX: ARTIGOS DO CÓDIGO PENAL MILITAR"
                  className={`w-full px-4 py-3 border-2 border-accent-500/30 focus:border-accent-500 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-police-body placeholder:uppercase placeholder:tracking-wider placeholder:text-gray-400 focus:ring-2 focus:ring-accent-500/30 transition-all duration-300 hover:border-accent-500/50 ${
                    errors.title ? 'border-red-500' : ''
                  }`}
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600 font-police-body flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.title}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-police-subtitle font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wider flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-accent-500" />
                  BRIEFING OPERACIONAL *
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="DESCREVA O CONTEÚDO E OBJETIVOS TÁTICOS DO ARSENAL..."
                  className={`w-full px-4 py-3 border-2 border-accent-500/30 focus:border-accent-500 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-police-body placeholder:uppercase placeholder:tracking-wider placeholder:text-gray-400 focus:ring-2 focus:ring-accent-500/30 transition-all duration-300 hover:border-accent-500/50 ${
                    errors.description ? 'border-red-500' : ''
                  }`}
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600 font-police-body flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.description}
                  </p>
                )}
              </div>

              {/* Categories Selection */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="flex items-center gap-2 text-sm font-police-subtitle font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    <Shield className="w-4 h-4 text-accent-500" />
                    CATEGORIAS TÁTICAS *
                  </label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowQuickCategoryModal(true)}
                    className="gap-2 font-police-body uppercase tracking-wider text-xs border-accent-500/30 hover:border-accent-500 transition-colors"
                  >
                    <FolderPlus className="w-3 h-3" />
                    NOVA CATEGORIA
                  </Button>
                </div>
                
                <div className={`border-2 rounded-lg p-4 max-h-96 overflow-y-auto space-y-3 ${
                  errors.selectedCategories 
                    ? 'border-red-500' 
                    : 'border-accent-500/30 focus-within:border-accent-500'
                }`}>
                  {loadingCategories ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-accent-500" />
                      <span className="ml-2 font-police-body text-gray-600 dark:text-gray-400">
                        CARREGANDO CATEGORIAS...
                      </span>
                    </div>
                  ) : categories.length > 0 ? (
                    <>
                      <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                        <p className="text-xs font-police-body text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                          💡 DICA TÁTICA: Você pode selecionar múltiplas categorias e níveis para este deck. Isso permitirá organizar os flashcards em diferentes áreas de conhecimento.
                        </p>
                      </div>
                      
                      {categories.map(category => renderCategoryTree(category))}
                      
                      {formData.selectedCategories.length > 0 && (
                        <div className="mt-4 p-3 bg-accent-500/10 border border-accent-500/30 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle className="w-4 h-4 text-accent-500" />
                            <span className="font-police-subtitle font-semibold text-gray-900 dark:text-white uppercase tracking-wider text-sm">
                              CATEGORIAS SELECIONADAS ({formData.selectedCategories.length})
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {getSelectedCategoryNames().map((name, index) => (
                              <Badge key={index} className="bg-accent-500 text-black font-police-body font-semibold text-xs">
                                {name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <Folder className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                      <p className="font-police-body text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        NENHUMA CATEGORIA ENCONTRADA
                      </p>
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => setShowQuickCategoryModal(true)}
                        className="mt-3 gap-2 bg-accent-500 hover:bg-accent-600 text-black font-police-body font-semibold uppercase tracking-wider"
                      >
                        <FolderPlus className="w-4 h-4" />
                        CRIAR PRIMEIRA CATEGORIA
                      </Button>
                    </div>
                  )}
                </div>
                
                {errors.selectedCategories && (
                  <p className="mt-1 text-sm text-red-600 font-police-body flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.selectedCategories}
                  </p>
                )}
              </div>

              {/* Difficulty Selection */}
              <div>
                <label className="block text-sm font-police-subtitle font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wider flex items-center gap-2">
                  <Crosshair className="w-4 h-4 text-accent-500" />
                  NÍVEL DE CLEARANCE *
                </label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => handleInputChange('difficulty', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-accent-500/30 focus:border-accent-500 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-police-body uppercase tracking-wider focus:ring-2 focus:ring-accent-500/30 transition-all duration-300 hover:border-accent-500/50"
                >
                  {difficulties.map(difficulty => (
                    <option key={difficulty} value={difficulty}>
                      {getDifficultyLabel(difficulty)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                  OBJETIVO DO BARALHO *
                </label>
                <textarea
                  rows={2}
                  value={formData.objective}
                  onChange={(e) => handleInputChange('objective', e.target.value)}
                  placeholder="QUAL O OBJETIVO DE APRENDIZAGEM DESTE BARALHO?"
                  className={`w-full px-4 py-2 border rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body placeholder:uppercase placeholder:tracking-wider focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all ${
                    errors.objective ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
                {errors.objective && (
                  <p className="mt-1 text-sm text-red-600 font-police-body flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.objective}
                  </p>
                )}
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={nextStep}
                  className="gap-2 bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black font-police-body font-semibold uppercase tracking-wider transition-colors"
                >
                  PRÓXIMA ETAPA
                  <ArrowLeft className="w-4 h-4 rotate-180" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === 2 && (
          <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-accent-500/30 shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden">
            {/* Tactical stripes */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent-500 via-accent-400 to-accent-500" />
            <div className="absolute top-0 right-0 w-20 h-20 border-t-4 border-r-4 border-accent-500/20" />
            
            <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border-b border-accent-500/30">
              <CardTitle className="flex items-center gap-3 font-police-title uppercase tracking-wider text-gray-900 dark:text-white">
                <Shield className="w-6 h-6 text-accent-500" />
                ETAPA 2: CONFIGURAÇÕES TÁTICAS
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                    MÉTODO DE ESTUDO
                  </label>
                  <select
                    value={formData.studyMethod}
                    onChange={(e) => handleInputChange('studyMethod', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body uppercase tracking-wider focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                  >
                    <option value="spaced_repetition">REPETIÇÃO ESPAÇADA (SM-2)</option>
                    <option value="active_recall">RECORDAÇÃO ATIVA</option>
                    <option value="pomodoro">TÉCNICA POMODORO</option>
                    <option value="traditional">TRADICIONAL</option>
                  </select>
                  <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {formData.studyMethod === 'spaced_repetition' && 'Algoritmo SuperMemo 2 otimizado para memorização'}
                    {formData.studyMethod === 'active_recall' && 'Prática de recuperação ativa da memória'}
                    {formData.studyMethod === 'pomodoro' && 'Sessões de 25min com pausas de 5min'}
                    {formData.studyMethod === 'traditional' && 'Estudo contínuo sem algoritmos especiais'}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                    NÚMERO MÁXIMO DE CARTÕES
                  </label>
                  <input
                    type="number"
                    value={formData.estimatedCards}
                    onChange={(e) => handleInputChange('estimatedCards', parseInt(e.target.value) || 0)}
                    min="0"
                    max="10000"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-numbers focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                    placeholder="0 = ilimitado"
                  />
                  <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    0 = ilimitado, outros valores definem limite máximo
                  </div>
                </div>
              </div>

              {/* Configurações Avançadas Anki-Style - Só mostra para repetição espaçada */}
              {formData.studyMethod === 'spaced_repetition' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="border-t border-accent-500/30 pt-6"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <Brain className="w-5 h-5 text-accent-500" />
                    <h4 className="font-police-subtitle uppercase tracking-wider text-gray-900 dark:text-white font-semibold">
                      🧠 CONFIGURAÇÕES ANKI-STYLE (SM-2)
                    </h4>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Daily Limits */}
                    <div className="space-y-4">
                      <h5 className="font-police-body font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider text-sm">
                        🏆 LIMITES DIÁRIOS
                      </h5>
                      
                      <div>
                        <label className="block text-xs font-police-body text-gray-600 dark:text-gray-400 mb-1 uppercase">
                          Novos Cards por Dia:
                        </label>
                        <input
                          type="number"
                          value={formData.ankiSettings.newCardsPerDay}
                          onChange={(e) => handleAnkiSettingChange('newCardsPerDay', parseInt(e.target.value) || 20)}
                          min="1"
                          max="999"
                          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-numbers focus:ring-2 focus:ring-accent-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-police-body text-gray-600 dark:text-gray-400 mb-1 uppercase">
                          Máx Reviews por Dia:
                        </label>
                        <input
                          type="number"
                          value={formData.ankiSettings.maxReviewsPerDay}
                          onChange={(e) => handleAnkiSettingChange('maxReviewsPerDay', parseInt(e.target.value) || 200)}
                          min="10"
                          max="9999"
                          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-numbers focus:ring-2 focus:ring-accent-500"
                        />
                      </div>
                    </div>
                    
                    {/* Learning Configuration */}
                    <div className="space-y-4">
                      <h5 className="font-police-body font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider text-sm">
                        🎯 APRENDIZAGEM
                      </h5>
                      
                      <div>
                        <label className="block text-xs font-police-body text-gray-600 dark:text-gray-400 mb-1 uppercase">
                          Intervalo de Graduação (dias):
                        </label>
                        <input
                          type="number"
                          value={formData.ankiSettings.graduatingInterval}
                          onChange={(e) => handleAnkiSettingChange('graduatingInterval', parseInt(e.target.value) || 1)}
                          min="1"
                          max="30"
                          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-numbers focus:ring-2 focus:ring-accent-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-police-body text-gray-600 dark:text-gray-400 mb-1 uppercase">
                          Intervalo "Fácil" (dias):
                        </label>
                        <input
                          type="number"
                          value={formData.ankiSettings.easyInterval}
                          onChange={(e) => handleAnkiSettingChange('easyInterval', parseInt(e.target.value) || 4)}
                          min="2"
                          max="30"
                          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-numbers focus:ring-2 focus:ring-accent-500"
                        />
                      </div>
                    </div>
                    
                    {/* Advanced Settings */}
                    <div className="space-y-4">
                      <h5 className="font-police-body font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider text-sm">
                        ⚙️ AVANÇADO
                      </h5>
                      
                      <div>
                        <label className="block text-xs font-police-body text-gray-600 dark:text-gray-400 mb-1 uppercase">
                          Retenção Desejada:
                        </label>
                        <select
                          value={formData.ankiSettings.desiredRetention}
                          onChange={(e) => handleAnkiSettingChange('desiredRetention', parseFloat(e.target.value))}
                          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body focus:ring-2 focus:ring-accent-500"
                        >
                          <option value={0.8}>80% - Fácil</option>
                          <option value={0.85}>85% - Normal</option>
                          <option value={0.9}>90% - Padrão</option>
                          <option value={0.95}>95% - Rigoroso</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-police-body text-gray-600 dark:text-gray-400 mb-1 uppercase">
                          Ease Factor Inicial:
                        </label>
                        <input
                          type="number"
                          value={formData.ankiSettings.startingEase}
                          onChange={(e) => handleAnkiSettingChange('startingEase', parseFloat(e.target.value) || 2.5)}
                          min="1.3"
                          max="3.0"
                          step="0.1"
                          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-numbers focus:ring-2 focus:ring-accent-500"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Expert Settings */}
                  <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-2 mb-3">
                      <Shield className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-police-subtitle uppercase tracking-wider text-blue-700 dark:text-blue-300">
                        🔬 CONFIGURAÇÕES ESPECIALISTAS
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="font-police-body text-blue-700 dark:text-blue-300">Fuzz Factor (variação aleatória):</span>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={formData.ankiSettings.enableFuzzFactor}
                            onChange={(e) => handleAnkiSettingChange('enableFuzzFactor', e.target.checked)}
                            className="rounded border-gray-300 text-accent-500 focus:ring-accent-500"
                          />
                          <span className="font-police-body text-blue-600 dark:text-blue-400">
                            {formData.ankiSettings.enableFuzzFactor ? 'ATIVO' : 'INATIVO'}
                          </span>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="font-police-body text-blue-700 dark:text-blue-300">Leech Threshold:</span>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={formData.ankiSettings.leechThreshold}
                            onChange={(e) => handleAnkiSettingChange('leechThreshold', parseInt(e.target.value) || 8)}
                            min="3"
                            max="20"
                            className="w-16 px-2 py-1 text-sm border border-blue-300 dark:border-blue-600 rounded bg-white dark:bg-blue-900/40 text-blue-900 dark:text-blue-100 font-police-numbers"
                          />
                          <span className="text-xs font-police-body text-blue-600 dark:text-blue-400">falhas</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3 text-xs text-blue-600 dark:text-blue-400 font-police-body">
                      💡 <strong>Dica:</strong> Estas configurações otimizam o algoritmo SM-2 baseado na pesquisa do Anki. 
                      Os valores padrão são recomendados para a maioria dos usuários.
                    </div>
                  </div>
                </motion.div>
              )}

              <div>
                <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                  VISIBILIDADE
                </label>
                <div className="flex items-center gap-4 mt-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="visibility"
                      checked={formData.isPublic}
                      onChange={() => handleInputChange('isPublic', true)}
                      className="text-accent-500 focus:ring-accent-500"
                    />
                    <span className="font-police-body text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      PÚBLICO
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="visibility"
                      checked={!formData.isPublic}
                      onChange={() => handleInputChange('isPublic', false)}
                      className="text-accent-500 focus:ring-accent-500"
                    />
                    <span className="font-police-body text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      PRIVADO
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                  TAGS OPERACIONAIS
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    placeholder="ADICIONAR TAG..."
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body placeholder:uppercase placeholder:tracking-wider focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                  />
                  <Button
                    type="button"
                    onClick={handleAddTag}
                    variant="outline"
                    className="gap-2 font-police-body uppercase tracking-wider border-gray-300 dark:border-gray-600 hover:border-accent-500 dark:hover:border-accent-500 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    ADICIONAR
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tagsList.map((tag, index) => (
                    <Badge 
                      key={index} 
                      variant="secondary" 
                      className="font-police-body font-semibold uppercase tracking-wider bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300 flex items-center gap-1"
                    >
                      <Tag className="w-3 h-3" />
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 hover:text-red-600 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                  {tagsList.length === 0 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-police-body">
                      NENHUMA TAG ADICIONADA
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={prevStep}
                  className="gap-2 font-police-body uppercase tracking-wider border-gray-300 dark:border-gray-600 hover:border-accent-500 dark:hover:border-accent-500 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  ETAPA ANTERIOR
                </Button>
                <Button
                  onClick={nextStep}
                  className="gap-2 bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black font-police-body font-semibold uppercase tracking-wider transition-colors"
                >
                  REVISÃO FINAL
                  <ArrowLeft className="w-4 h-4 rotate-180" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* NOVA ETAPA 3: CRIAÇÃO DE FLASHCARDS */}
        {currentStep === 3 && (
          <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-accent-500/30 shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden">
            {/* Tactical stripes */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent-500 via-accent-400 to-accent-500" />
            <div className="absolute top-0 right-0 w-20 h-20 border-t-4 border-r-4 border-accent-500/20" />
            
            <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border-b border-accent-500/30">
              <CardTitle className="flex items-center gap-3 font-police-title uppercase tracking-wider text-gray-900 dark:text-white">
                <Target className="w-6 h-6 text-accent-500" />
                ETAPA 3: CRIAÇÃO DE ARSENAL
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Seleção de Modo: Criar vs Importar */}
              <div className="mb-6">
                <h4 className="font-police-subtitle font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4 text-center">
                  🎯 ESCOLHA O MODO DE OPERAÇÃO:
                </h4>
                <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
                  <button
                    onClick={() => setActiveTab('create')}
                    className={`p-6 rounded-xl border-2 transition-all duration-300 ${
                      activeTab === 'create'
                        ? 'border-accent-500 bg-accent-50 dark:bg-accent-900/20 shadow-lg'
                        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800/50 hover:border-accent-300 hover:shadow-md'
                    }`}
                  >
                    <div className="text-center">
                      <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                        activeTab === 'create' ? 'bg-accent-500' : 'bg-gray-200 dark:bg-gray-700'
                      }`}>
                        <Plus className={`w-8 h-8 ${
                          activeTab === 'create' ? 'text-black' : 'text-gray-600 dark:text-gray-400'
                        }`} />
                      </div>
                      <h3 className={`font-police-subtitle uppercase tracking-wider text-lg font-bold mb-2 ${
                        activeTab === 'create' ? 'text-accent-600 dark:text-accent-400' : 'text-gray-700 dark:text-gray-300'
                      }`}>
                        CRIAR NOVOS
                      </h3>
                      <p className="text-sm font-police-body text-gray-600 dark:text-gray-400">
                        Crie flashcards do zero com formulário completo
                      </p>
                      {activeTab === 'create' && (
                        <div className="mt-3 flex items-center justify-center gap-2 text-accent-600 dark:text-accent-400">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-xs font-police-body uppercase tracking-wider font-semibold">MODO ATIVO</span>
                        </div>
                      )}
                      {activeTab === null && (
                        <div className="mt-3 text-xs font-police-body text-gray-500 dark:text-gray-500 uppercase tracking-wider">
                          Clique para selecionar
                        </div>
                      )}
                    </div>
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('import')}
                    className={`p-6 rounded-xl border-2 transition-all duration-300 ${
                      activeTab === 'import'
                        ? 'border-accent-500 bg-accent-50 dark:bg-accent-900/20 shadow-lg'
                        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800/50 hover:border-accent-300 hover:shadow-md'
                    }`}
                  >
                    <div className="text-center">
                      <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                        activeTab === 'import' ? 'bg-accent-500' : 'bg-gray-200 dark:bg-gray-700'
                      }`}>
                        <BookOpen className={`w-8 h-8 ${
                          activeTab === 'import' ? 'text-black' : 'text-gray-600 dark:text-gray-400'
                        }`} />
                      </div>
                      <h3 className={`font-police-subtitle uppercase tracking-wider text-lg font-bold mb-2 ${
                        activeTab === 'import' ? 'text-accent-600 dark:text-accent-400' : 'text-gray-700 dark:text-gray-300'
                      }`}>
                        IMPORTAR EXISTENTES
                      </h3>
                      <p className="text-sm font-police-body text-gray-600 dark:text-gray-400">
                        Selecione flashcards já criados no sistema
                      </p>
                      {activeTab === 'import' && (
                        <div className="mt-3 flex items-center justify-center gap-2 text-accent-600 dark:text-accent-400">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-xs font-police-body uppercase tracking-wider font-semibold">MODO ATIVO</span>
                        </div>
                      )}
                      {activeTab === null && (
                        <div className="mt-3 text-xs font-police-body text-gray-500 dark:text-gray-500 uppercase tracking-wider">
                          Clique para selecionar
                        </div>
                      )}
                    </div>
                  </button>
                </div>
              </div>
              {/* Conteúdo do Modo Ativo */}
              {activeTab === null ? (
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600">
                  <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="font-police-subtitle uppercase tracking-wider text-gray-600 dark:text-gray-400 font-semibold mb-2">
                    SELECIONE UM MODO DE OPERAÇÃO
                  </h3>
                  <p className="text-sm font-police-body text-gray-500 dark:text-gray-500">
                    Escolha entre criar novos flashcards ou importar existentes
                  </p>
                </div>
              ) : activeTab === 'create' ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Formulário de Criação de Flashcard */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <Plus className="w-5 h-5 text-accent-500" />
                    <h4 className="font-police-subtitle uppercase tracking-wider text-gray-900 dark:text-white font-semibold">
                      {editingFlashcardIndex !== null ? '✏️ EDITAR FLASHCARD' : '➕ ADICIONAR FLASHCARD'}
                    </h4>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                      TIPO DE FLASHCARD
                    </label>
                    <select
                      value={currentFlashcardForm.type}
                      onChange={(e) => setCurrentFlashcardForm(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body focus:ring-2 focus:ring-accent-500"
                    >
                      <option value="basic">🔵 BÁSICO (Frente/Verso)</option>
                      <option value="basic_inverted">🟢 BÁSICO INVERTIDO</option>
                      <option value="cloze">🟡 LACUNAS (Cloze)</option>
                      <option value="multiple_choice">🟣 MÚLTIPLA ESCOLHA</option>
                      <option value="true_false">🔴 VERDADEIRO/FALSO</option>
                      <option value="type_answer">🟦 DIGITE RESPOSTA</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                      FRENTE DO CARD
                    </label>
                    <textarea
                      value={currentFlashcardForm.front}
                      onChange={(e) => setCurrentFlashcardForm(prev => ({ ...prev, front: e.target.value }))}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body focus:ring-2 focus:ring-accent-500"
                      placeholder={
                        currentFlashcardForm.type === 'cloze' 
                          ? "Use {{c1::palavra}} para criar ocultações. Ex: O {{c1::Estado de Direito}} é caracterizado pela {{c2::supremacia da lei}}"
                          : "Digite a pergunta ou conceito..."
                      }
                    />
                    {currentFlashcardForm.type === 'cloze' && currentFlashcardForm.front && (
                      <div className="mt-2 p-3 bg-accent-50 dark:bg-accent-900/20 rounded-lg border border-accent-200 dark:border-accent-800">
                        <div className="flex items-center gap-2">
                          <Target className="w-4 h-4 text-accent-600" />
                          <span className="text-sm font-police-subtitle uppercase tracking-wider text-accent-700 dark:text-accent-400 font-semibold">
                            📊 CARDS QUE SERÃO GERADOS: {countClozeCards(currentFlashcardForm.front)}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-accent-600 dark:text-accent-400 font-police-body">
                          ⚡ Cada ocultação {`{{c1::}}`}, {`{{c2::}}`}, etc. gera um card separado (estilo Anki)
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                      {currentFlashcardForm.type === 'cloze' ? 'EXPLICAÇÃO EXTRA (OPCIONAL)' : 'VERSO DO CARD'}
                    </label>
                    <textarea
                      value={currentFlashcardForm.back}
                      onChange={(e) => setCurrentFlashcardForm(prev => ({ ...prev, back: e.target.value }))}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body focus:ring-2 focus:ring-accent-500"
                      placeholder={
                        currentFlashcardForm.type === 'cloze'
                          ? "Informações extras sobre o tópico (opcional - as respostas são geradas automaticamente)"
                          : "Digite a resposta ou explicação..."
                      }
                    />
                    {currentFlashcardForm.type === 'cloze' && (
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 font-police-body">
                        💡 As respostas são extraídas automaticamente das ocultações {`{{c1::resposta}}`}
                      </p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                        DIFICULDADE
                      </label>
                      <select
                        value={currentFlashcardForm.difficulty}
                        onChange={(e) => setCurrentFlashcardForm(prev => ({ ...prev, difficulty: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body focus:ring-2 focus:ring-accent-500"
                      >
                        <option value="easy">🟢 FÁCIL</option>
                        <option value="medium">🟡 MÉDIO</option>
                        <option value="hard">🔴 DIFÍCIL</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                        DICA (OPCIONAL)
                      </label>
                      <input
                        type="text"
                        value={currentFlashcardForm.hint}
                        onChange={(e) => setCurrentFlashcardForm(prev => ({ ...prev, hint: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body focus:ring-2 focus:ring-accent-500"
                        placeholder="Dica para ajudar..."
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <Button
                      onClick={addFlashcardToDeck}
                      className="flex-1 bg-accent-500 hover:bg-accent-600 text-black font-police-subtitle uppercase tracking-wider"
                    >
                      {editingFlashcardIndex !== null ? (
                        <><CheckCircle className="w-4 h-4 mr-2" /> ATUALIZAR CARD</>
                      ) : (
                        <><Plus className="w-4 h-4 mr-2" /> ADICIONAR AO ARSENAL</>
                      )}
                    </Button>
                    
                    {editingFlashcardIndex !== null && (
                      <Button
                        onClick={cancelFlashcardEdit}
                        variant="outline"
                        className="font-police-subtitle uppercase tracking-wider"
                      >
                        <X className="w-4 h-4 mr-2" /> CANCELAR
                      </Button>
                    )}
                  </div>
                </div>
                
                {/* Lista de Flashcards Criados */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-police-subtitle uppercase tracking-wider text-gray-900 dark:text-white font-semibold flex items-center gap-2">
                      <Brain className="w-5 h-5 text-accent-500" />
                      ARSENAL CRIADO ({deckFlashcards.length})
                    </h4>
                    
                    {deckFlashcards.length > 0 && (
                      <Badge variant="outline" className="font-police-numbers">
                        {deckFlashcards.length} cards
                      </Badge>
                    )}
                  </div>
                  
                  {deckFlashcards.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 dark:bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
                      <Brain className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500 dark:text-gray-400 font-police-body uppercase tracking-wider">
                        NENHUM FLASHCARD CRIADO
                      </p>
                      <p className="text-sm text-gray-400 dark:text-gray-500 font-police-body mt-1">
                        Adicione flashcards para formar seu arsenal
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {deckFlashcards.map((flashcard, index) => (
                        <div key={flashcard.id} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline" className="text-xs font-police-body">
                                  {flashcard.type === 'basic' ? '🔵 BÁSICO' :
                                   flashcard.type === 'basic_inverted' ? '🟢 INVERTIDO' :
                                   flashcard.type === 'cloze' ? '🟡 LACUNAS' :
                                   flashcard.type === 'multiple_choice' ? '🟣 MÚLTIPLA' :
                                   flashcard.type === 'true_false' ? '🔴 V/F' :
                                   '🟦 DIGITE'}
                                </Badge>
                                <Badge variant={flashcard.difficulty === 'easy' ? 'success' : flashcard.difficulty === 'hard' ? 'destructive' : 'warning'} className="text-xs font-police-body">
                                  {flashcard.difficulty === 'easy' ? 'FÁCIL' : flashcard.difficulty === 'hard' ? 'DIFÍCIL' : 'MÉDIO'}
                                </Badge>
                              </div>
                              <p className="text-sm font-police-body text-gray-900 dark:text-white font-semibold mb-1">
                                📄 {flashcard.front.substring(0, 100)}{flashcard.front.length > 100 ? '...' : ''}
                              </p>
                              <p className="text-xs font-police-body text-gray-600 dark:text-gray-400">
                                💡 {flashcard.back.substring(0, 80)}{flashcard.back.length > 80 ? '...' : ''}
                              </p>
                            </div>
                            
                            <div className="flex gap-2 ml-4">
                              <Button
                                onClick={() => editFlashcard(index)}
                                size="sm"
                                variant="outline"
                                className="text-xs"
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                              <Button
                                onClick={() => deleteFlashcard(index)}
                                size="sm"
                                variant="destructive"
                                className="text-xs"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {deckFlashcards.length > 0 && (
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <p className="text-xs text-blue-700 dark:text-blue-300 font-police-body">
                        💡 <strong>Dica:</strong> Você pode continuar adicionando flashcards ou avançar para revisar e salvar o arsenal.
                      </p>
                    </div>
                  )}
                </div>
              </div>
              ) : (
                /* Aba de Importação de Flashcards Existentes */
                <div className="space-y-6">
                  {/* Filtros de Busca */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div>
                      <input
                        type="text"
                        placeholder="Buscar flashcards..."
                        value={flashcardFilters.search}
                        onChange={(e) => setFlashcardFilters(prev => ({ ...prev, search: e.target.value }))}
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-police-body focus:ring-2 focus:ring-accent-500"
                      />
                    </div>
                    
                    <div>
                      <select
                        value={flashcardFilters.category}
                        onChange={(e) => setFlashcardFilters(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-police-body focus:ring-2 focus:ring-accent-500"
                      >
                        <option value="">Todas as categorias</option>
                        <option value="Direito Constitucional">Direito Constitucional</option>
                        <option value="Direitos Fundamentais">Direitos Fundamentais</option>
                        <option value="Teoria do Estado">Teoria do Estado</option>
                        <option value="Organização do Estado">Organização do Estado</option>
                      </select>
                    </div>
                    
                    <div>
                      <select
                        value={flashcardFilters.type}
                        onChange={(e) => setFlashcardFilters(prev => ({ ...prev, type: e.target.value }))}
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-police-body focus:ring-2 focus:ring-accent-500"
                      >
                        <option value="">Todos os tipos</option>
                        <option value="basic">🔵 Básico</option>
                        <option value="multiple_choice">🟣 Múltipla Escolha</option>
                        <option value="true_false">🔴 Verdadeiro/Falso</option>
                        <option value="cloze">🟡 Lacunas</option>
                      </select>
                    </div>
                    
                    <div>
                      <select
                        value={flashcardFilters.difficulty}
                        onChange={(e) => setFlashcardFilters(prev => ({ ...prev, difficulty: e.target.value }))}
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-police-body focus:ring-2 focus:ring-accent-500"
                      >
                        <option value="">Todas dificuldades</option>
                        <option value="easy">🟢 Fácil</option>
                        <option value="medium">🟡 Médio</option>
                        <option value="hard">🔴 Difícil</option>
                      </select>
                    </div>
                  </div>
                  
                  {/* Ações de Seleção */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Button
                        onClick={selectAllFilteredFlashcards}
                        size="sm"
                        variant="outline"
                        className="font-police-body uppercase tracking-wider"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        SELECIONAR TODOS
                      </Button>
                      
                      <Button
                        onClick={clearSelection}
                        size="sm"
                        variant="outline"
                        className="font-police-body uppercase tracking-wider"
                      >
                        <X className="w-4 h-4 mr-2" />
                        LIMPAR SELEÇÃO
                      </Button>
                      
                      {selectedFlashcards.size > 0 && (
                        <Button
                          onClick={importSelectedFlashcards}
                          className="bg-accent-500 hover:bg-accent-600 text-black font-police-subtitle uppercase tracking-wider"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          IMPORTAR {selectedFlashcards.size} SELECIONADOS
                        </Button>
                      )}
                    </div>
                    
                    <div className="text-sm font-police-body text-gray-600 dark:text-gray-400">
                      {selectedFlashcards.size} de {getFilteredFlashcards().length} selecionados
                    </div>
                  </div>
                  
                  {/* Lista de Flashcards Disponíveis */}
                  {loadingFlashcards ? (
                    <div className="text-center py-8">
                      <Loader2 className="w-8 h-8 text-accent-500 mx-auto mb-3 animate-spin" />
                      <p className="text-gray-600 dark:text-gray-400 font-police-body uppercase tracking-wider">
                        CARREGANDO FLASHCARDS...
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {getFilteredFlashcards().map((flashcard) => (
                        <div
                          key={flashcard.id}
                          className={`p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer ${
                            selectedFlashcards.has(flashcard.id)
                              ? 'border-accent-500 bg-accent-50 dark:bg-accent-900/20'
                              : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 hover:border-accent-300'
                          }`}
                          onClick={() => toggleFlashcardSelection(flashcard.id)}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={selectedFlashcards.has(flashcard.id)}
                                onChange={() => toggleFlashcardSelection(flashcard.id)}
                                className="rounded border-gray-300 text-accent-500 focus:ring-accent-500"
                              />
                              <Badge variant="outline" className="text-xs font-police-body">
                                {flashcard.type === 'basic' ? '🔵 BÁSICO' :
                                 flashcard.type === 'multiple_choice' ? '🟣 MÚLTIPLA' :
                                 flashcard.type === 'true_false' ? '🔴 V/F' :
                                 flashcard.type === 'cloze' ? '🟡 LACUNAS' :
                                 '🟦 OUTRO'}
                              </Badge>
                            </div>
                            
                            <Badge variant={flashcard.difficulty === 'easy' ? 'success' : flashcard.difficulty === 'hard' ? 'destructive' : 'warning'} className="text-xs font-police-body">
                              {flashcard.difficulty === 'easy' ? 'FÁCIL' : flashcard.difficulty === 'hard' ? 'DIFÍCIL' : 'MÉDIO'}
                            </Badge>
                          </div>
                          
                          <div className="space-y-2">
                            <p className="text-sm font-police-body font-semibold text-gray-900 dark:text-white">
                              📄 {flashcard.front.substring(0, 80)}{flashcard.front.length > 80 ? '...' : ''}
                            </p>
                            <p className="text-xs font-police-body text-gray-600 dark:text-gray-400">
                              💡 {flashcard.back.substring(0, 60)}{flashcard.back.length > 60 ? '...' : ''}
                            </p>
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-police-body text-gray-500 dark:text-gray-500">
                                📁 {flashcard.category}
                              </span>
                              <span className="font-police-numbers text-gray-400 dark:text-gray-600">
                                {flashcard.created_at}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {!loadingFlashcards && getFilteredFlashcards().length === 0 && (
                    <div className="text-center py-8 bg-gray-50 dark:bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
                      <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500 dark:text-gray-400 font-police-body uppercase tracking-wider">
                        NENHUM FLASHCARD ENCONTRADO
                      </p>
                      <p className="text-sm text-gray-400 dark:text-gray-500 font-police-body mt-1">
                        Ajuste os filtros ou crie novos flashcards
                      </p>
                    </div>
                  )}
                </div>
              )}
              
              {/* Resumo do Arsenal (sempre visível) */}
              {deckFlashcards.length > 0 && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-police-subtitle uppercase tracking-wider text-gray-900 dark:text-white font-semibold flex items-center gap-2">
                      <Target className="w-5 h-5 text-accent-500" />
                      ARSENAL TOTAL ({deckFlashcards.length} FLASHCARDS)
                    </h4>
                    
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-lg font-police-numbers font-bold text-green-600 dark:text-green-400">
                          {deckFlashcards.filter(c => c.difficulty === 'easy').length}
                        </p>
                        <p className="text-xs font-police-body text-green-500 uppercase">Fáceis</p>
                      </div>
                      <div>
                        <p className="text-lg font-police-numbers font-bold text-yellow-600 dark:text-yellow-400">
                          {deckFlashcards.filter(c => c.difficulty === 'medium').length}
                        </p>
                        <p className="text-xs font-police-body text-yellow-500 uppercase">Médios</p>
                      </div>
                      <div>
                        <p className="text-lg font-police-numbers font-bold text-red-600 dark:text-red-400">
                          {deckFlashcards.filter(c => c.difficulty === 'hard').length}
                        </p>
                        <p className="text-xs font-police-body text-red-500 uppercase">Difíceis</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
        
        {/* ETAPA 4: CONFIRMAÇÃO OPERACIONAL (antiga etapa 3) */}
        {currentStep === 4 && (
          <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-accent-500/30 shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden">
            {/* Tactical stripes */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent-500 via-accent-400 to-accent-500" />
            <div className="absolute top-0 right-0 w-20 h-20 border-t-4 border-r-4 border-accent-500/20" />
            
            <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border-b border-accent-500/30">
              <CardTitle className="flex items-center gap-3 font-police-title uppercase tracking-wider text-gray-900 dark:text-white">
                <Crosshair className="w-6 h-6 text-accent-500" />
                ETAPA 4: CONFIRMAÇÃO OPERACIONAL
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Deck Summary */}
              <div className="p-6 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center border-2 border-gray-300 dark:border-gray-700">
                    <Brain className="w-6 h-6 text-gray-700 dark:text-accent-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-police-subtitle font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-2">
                      {formData.title || 'TÍTULO NÃO INFORMADO'}
                    </h3>
                    <p className="text-sm font-police-body text-gray-600 dark:text-gray-400 mb-4">
                      {formData.description || 'DESCRIÇÃO NÃO INFORMADA'}
                    </p>
                    <div className="space-y-4">
                      {/* Selected Categories */}
                      <div>
                        <p className="font-police-body font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">CATEGORIAS SELECIONADAS</p>
                        <div className="flex flex-wrap gap-2">
                          {getSelectedCategoryNames().length > 0 ? (
                            getSelectedCategoryNames().map((name, index) => (
                              <Badge key={index} className="bg-accent-500 text-black font-police-body font-semibold">
                                {name}
                              </Badge>
                            ))
                          ) : (
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-police-body">NENHUMA CATEGORIA SELECIONADA</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="font-police-body font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">CARTÕES</p>
                          <p className="font-police-numbers text-gray-900 dark:text-white">{formData.estimatedCards}</p>
                        </div>
                        <div>
                          <p className="font-police-body font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">DIFICULDADE</p>
                          <Badge className="bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300 font-police-body font-semibold uppercase tracking-wider">
                            {getDifficultyLabel(formData.difficulty)}
                          </Badge>
                        </div>
                        <div>
                          <p className="font-police-body font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">NÍVEIS SELECIONADOS</p>
                          <p className="font-police-numbers text-gray-900 dark:text-white">{formData.selectedCategories.length}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Objective */}
              <div>
                <h4 className="font-police-subtitle font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-3">
                  OBJETIVO OPERACIONAL
                </h4>
                <p className="text-sm font-police-body text-gray-600 dark:text-gray-400 p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg">
                  {formData.objective || 'OBJETIVO NÃO INFORMADO'}
                </p>
              </div>

              {/* Configuration Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-police-subtitle font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-3">
                    CONFIGURAÇÕES
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="font-police-body text-gray-600 dark:text-gray-400 uppercase tracking-wider">Cartões:</span>
                      <span className="font-police-body text-gray-900 dark:text-white uppercase">{formData.estimatedCards === 0 ? 'ILIMITADO' : formData.estimatedCards}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-police-body text-gray-600 dark:text-gray-400 uppercase tracking-wider">Método:</span>
                      <span className="font-police-body text-gray-900 dark:text-white uppercase">{getStudyMethodLabel(formData.studyMethod)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-police-body text-gray-600 dark:text-gray-400 uppercase tracking-wider">Visibilidade:</span>
                      <div className="flex items-center gap-1">
                        {formData.isPublic ? (
                          <>
                            <Globe className="w-4 h-4 text-accent-500" />
                            <span className="font-police-body text-gray-900 dark:text-white uppercase">PÚBLICO</span>
                          </>
                        ) : (
                          <>
                            <Lock className="w-4 h-4 text-gray-500" />
                            <span className="font-police-body text-gray-900 dark:text-white uppercase">PRIVADO</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-police-subtitle font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-3">
                    TAGS OPERACIONAIS
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {tagsList.length > 0 ? (
                      tagsList.map((tag, index) => (
                        <Badge key={index} variant="outline" className="font-police-body uppercase tracking-wider border-gray-300 dark:border-gray-600">
                          <Tag className="w-3 h-3 mr-1" />
                          {tag}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-police-body">
                        NENHUMA TAG ADICIONADA
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Seção de Flashcards Criados */}
              <div>
                <h4 className="font-police-subtitle font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-accent-500" />
                  ARSENAL CRIADO ({deckFlashcards.length} FLASHCARDS)
                </h4>
                
                {deckFlashcards.length > 0 ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {deckFlashcards.slice(0, 6).map((flashcard, index) => (
                        <div key={flashcard.id} className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-xs font-police-body">
                              {flashcard.type === 'basic' ? '🔵 BÁSICO' :
                               flashcard.type === 'basic_inverted' ? '🟢 INVERTIDO' :
                               flashcard.type === 'cloze' ? '🟡 LACUNAS' :
                               flashcard.type === 'multiple_choice' ? '🟣 MÚLTIPLA' :
                               flashcard.type === 'true_false' ? '🔴 V/F' :
                               '🟦 DIGITE'}
                            </Badge>
                            <Badge variant={flashcard.difficulty === 'easy' ? 'success' : flashcard.difficulty === 'hard' ? 'destructive' : 'warning'} className="text-xs font-police-body">
                              {flashcard.difficulty === 'easy' ? 'FÁCIL' : flashcard.difficulty === 'hard' ? 'DIFÍCIL' : 'MÉDIO'}
                            </Badge>
                          </div>
                          <p className="text-xs font-police-body text-gray-900 dark:text-white font-semibold mb-1">
                            📄 {flashcard.front.substring(0, 60)}{flashcard.front.length > 60 ? '...' : ''}
                          </p>
                          <p className="text-xs font-police-body text-gray-600 dark:text-gray-400">
                            💡 {flashcard.back.substring(0, 50)}{flashcard.back.length > 50 ? '...' : ''}
                          </p>
                        </div>
                      ))}
                    </div>
                    
                    {deckFlashcards.length > 6 && (
                      <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <p className="text-sm text-blue-700 dark:text-blue-300 font-police-body">
                          💡 <strong>E mais {deckFlashcards.length - 6} flashcards...</strong> 
                          Todo o arsenal será criado junto com o deck.
                        </p>
                      </div>
                    )}
                    
                    {/* Resumo estatístico */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="text-center">
                        <p className="text-lg font-police-numbers font-bold text-green-700 dark:text-green-300">{deckFlashcards.length}</p>
                        <p className="text-xs font-police-body text-green-600 dark:text-green-400 uppercase tracking-wider">Total Cards</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-police-numbers font-bold text-blue-700 dark:text-blue-300">
                          {deckFlashcards.filter(c => c.difficulty === 'easy').length}
                        </p>
                        <p className="text-xs font-police-body text-blue-600 dark:text-blue-400 uppercase tracking-wider">Fáceis</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-police-numbers font-bold text-yellow-700 dark:text-yellow-300">
                          {deckFlashcards.filter(c => c.difficulty === 'medium').length}
                        </p>
                        <p className="text-xs font-police-body text-yellow-600 dark:text-yellow-400 uppercase tracking-wider">Médios</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-police-numbers font-bold text-red-700 dark:text-red-300">
                          {deckFlashcards.filter(c => c.difficulty === 'hard').length}
                        </p>
                        <p className="text-xs font-police-body text-red-600 dark:text-red-400 uppercase tracking-wider">Difíceis</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border-2 border-dashed border-yellow-300 dark:border-yellow-700">
                    <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
                    <p className="text-yellow-700 dark:text-yellow-300 font-police-body uppercase tracking-wider font-semibold">
                      NENHUM FLASHCARD CRIADO
                    </p>
                    <p className="text-sm text-yellow-600 dark:text-yellow-400 font-police-body mt-1">
                      O deck será criado vazio. Você pode adicionar flashcards depois.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
                <Button
                  variant="outline"
                  onClick={prevStep}
                  className="gap-2 font-police-body uppercase tracking-wider border-gray-300 dark:border-gray-600 hover:border-accent-500 dark:hover:border-accent-500 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  ETAPA ANTERIOR
                </Button>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => handleSave(true)}
                    disabled={isLoading}
                    className="gap-2 font-police-body uppercase tracking-wider border-gray-300 dark:border-gray-600 hover:border-accent-500 dark:hover:border-accent-500 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    SALVAR RASCUNHO
                  </Button>
                  <Button
                    onClick={() => handleSave(false)}
                    disabled={isLoading}
                    className="gap-2 bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black font-police-body font-semibold uppercase tracking-wider transition-colors disabled:opacity-50"
                  >
                    <CheckCircle className="w-4 h-4" />
                    {isLoading ? 'CRIANDO...' : 'CRIAR ARSENAL'}
                  </Button>
                  {/* Botão removido - flashcards são criados no wizard */}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </motion.div>

      {/* Quick Category Modal */}
      <AnimatePresence>
        {showQuickCategoryModal && renderQuickCategoryModal()}
      </AnimatePresence>
    </div>
  );
}