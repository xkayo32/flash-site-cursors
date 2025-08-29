import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Eye,
  EyeOff,
  CheckCircle,
  Target,
  BookOpen,
  Edit,
  Image as ImageIcon,
  Brain,
  Folder,
  FolderPlus,
  FolderOpen,
  Trash2,
  Tag,
  Loader2,
  X,
  ChevronRight,
  ChevronDown,
  Plus,
  Shield,
  Command,
  Crosshair,
  Package,
  Layers
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import toast from 'react-hot-toast';
import { StudyProLogo } from '@/components/ui/StudyProLogo';
import ImageOcclusionEditor from '@/components/ImageOcclusionEditor';
import ClozeEditor from '@/components/ClozeEditor';
import { flashcardService, type CreateFlashcardData } from '../../services/flashcardService';
import { flashcardDeckService } from '@/services/flashcardDeckService';
import { categoryService, Category } from '@/services/categoryService';
import { useAuthStore } from '@/store/authStore';

// Interface para categorias pendentes (antes de salvar)
interface PendingCategory {
  id: string;
  name: string;
  description?: string;
  children: PendingCategory[];
  isExpanded?: boolean;
  isEditing?: boolean;
}

export default function NewStudentFlashcard() {
  const navigate = useNavigate();
  const { cardId } = useParams();
  const [searchParams] = useSearchParams();
  const { user } = useAuthStore();
  const isEditing = Boolean(cardId);
  
  // Detectar se está criando flashcard para um deck específico
  const deckMode = searchParams.get('deck');
  const isDeckMode = Boolean(deckMode);
  
  // Deck management state
  const [currentDeck, setCurrentDeck] = useState<any>(null);
  const [deckFlashcards, setDeckFlashcards] = useState<any[]>([]);
  const [showDeckOverview, setShowDeckOverview] = useState(isDeckMode);
  const [activeTab, setActiveTab] = useState<'overview' | 'flashcards' | 'create'>(isDeckMode ? 'overview' : 'create');
  
  // Categories state
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  
  // Quick category creation modal
  const [showQuickCategoryModal, setShowQuickCategoryModal] = useState(false);
  const [pendingTree, setPendingTree] = useState<PendingCategory[]>([]);
  const [savingCategories, setSavingCategories] = useState(false);
  
  // Form for adding new category
  const [newCategoryForm, setNewCategoryForm] = useState({
    name: '',
    description: '',
    parentId: null as string | null
  });

  const [showPreview, setShowPreview] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [showImageOcclusionEditor, setShowImageOcclusionEditor] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [card, setCard] = useState({
    type: 'basic',
    front: '',
    back: '',
    question: '',
    options: ['', '', '', ''],
    correct: 0,
    explanation: '',
    statement: '',
    answer: 'true',
    text: '',
    extra: '',
    hint: '',
    image: '',
    occlusionAreas: [],
    difficulty: 'medium',
    category: '',
    subcategory: '',
    tags: '',
    // Campos extras estilo Anki
    header: '',
    source: '',
    comments: '',
    images: []
  });

  // Load categories and deck info if in deck mode
  useEffect(() => {
    loadCategories();
    // Se está em deck mode, carregar informações do deck
    if (isDeckMode && deckMode) {
      loadDeckInfo(deckMode);
    }
  }, [isDeckMode, deckMode]);

  const loadCategories = async () => {
    try {
      setLoadingCategories(true);
      const categories = await categoryService.getCategoryHierarchy();
      if (Array.isArray(categories)) {
        setCategories(categories);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      toast.error('Erro ao carregar categorias');
    } finally {
      setLoadingCategories(false);
    }
  };

  const loadDeckInfo = async (deckId: string) => {
    try {
      const result = await flashcardDeckService.getDeck(deckId);
      if (result.success && result.data) {
        setCurrentDeck(result.data);
        // Carregar flashcards do deck
        const flashcardsResult = await flashcardService.getFlashcards({ deck_id: deckId });
        if (flashcardsResult.success && flashcardsResult.data) {
          setDeckFlashcards(flashcardsResult.data);
        }
      }
    } catch (error) {
      console.error('Error loading deck:', error);
      toast.error('Erro ao carregar deck');
    }
  };

  // Load flashcard when editing (after categories are loaded)
  useEffect(() => {
    if (isEditing && cardId && categories.length > 0) {
      loadFlashcard(cardId);
    }
  }, [cardId, isEditing, categories.length]);

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
      const parent = findParent(categories, currentId);
      if (parent && !parentChain.includes(parent.id)) {
        parentChain.push(parent.id);
        currentId = parent.id;
      } else {
        break;
      }
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
    
    const category = findCategory(categories, categoryId);
    if (category) {
      collectChildren(category);
    }
    
    return children;
  };

  // Handle category toggle
  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev => {
      let newSelectedCategories = [...prev];
      
      if (prev.includes(categoryId)) {
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
      
      return newSelectedCategories;
    });
  };

  // Category creation functions
  const handleAddToPendingTree = () => {
    if (!newCategoryForm.name.trim()) {
      toast.error('Nome da categoria é obrigatório');
      return;
    }

    const newCategory: PendingCategory = {
      id: 'temp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      name: newCategoryForm.name.trim(),
      description: newCategoryForm.description.trim() || undefined,
      children: [],
      isExpanded: true
    };

    if (newCategoryForm.parentId) {
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
      setPendingTree([...pendingTree, newCategory]);
    }

    setNewCategoryForm({
      name: '',
      description: '',
      parentId: newCategoryForm.parentId
    });

    toast.success(
      newCategoryForm.parentId ? '🎯 Subcategoria adicionada!' : '🎯 Categoria adicionada!',
      { icon: '✅', duration: 1500 }
    );
  };

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
    toast.success('🗑️ Categoria removida', { icon: '🎯', duration: 1500 });
  };

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

      for (const category of pendingTree) {
        await saveCategory(category);
      }

      if (successCount > 0) {
        toast.success(`🎯 ${successCount} categorias salvas com sucesso!`);
        setPendingTree([]);
        await loadCategories();
        
        setSelectedCategories(prev => [...new Set([...prev, ...newlyCreatedIds])]);
        
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

  // Renderiza a árvore de categorias
  const renderCategoryTree = (category: Category, level: number = 0) => {
    const isSelected = selectedCategories.includes(category.id);
    const hasChildren = category.children && category.children.length > 0;
    
    const isMainCategory = level === 0;
    const indentClass = level > 0 ? 'ml-8 border-l-2 border-gray-200 dark:border-gray-600 pl-4' : '';

    return (
      <div key={category.id} className={`${indentClass} ${isMainCategory ? 'mb-4' : 'mb-2'}`}>
        <div
          className={`
            flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 cursor-pointer
            ${isSelected 
              ? 'bg-accent-500/20 border-accent-500 shadow-sm' 
              : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-accent-500/50'
            }
            ${isMainCategory 
              ? 'border-2 font-bold shadow-md' 
              : 'border ml-0'
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
              <FolderOpen className={`w-4 h-4 ${isMainCategory ? 'text-accent-500' : 'text-blue-500'}`} />
            ) : (
              level === 0 ? (
                <Target className="w-4 h-4 text-accent-600" />
              ) : (
                <Crosshair className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              )
            )}
          </div>
          
          <div className="flex-1">
            <div className={`font-police-body font-semibold text-gray-900 dark:text-white uppercase tracking-wider ${isMainCategory ? 'text-sm' : 'text-xs'}`}>
              {category.name}
            </div>
            {category.description && (
              <div className="text-xs text-gray-600 dark:text-gray-400 font-police-body mt-1">
                {category.description}
              </div>
            )}
          </div>

          {hasChildren && (
            <Badge 
              variant="outline" 
              className={`text-xs font-police-body font-semibold ${isMainCategory ? 'bg-accent-500/10' : 'bg-blue-500/10'}`}
            >
              {category.children!.length}
            </Badge>
          )}
        </div>
        
        {hasChildren && (
          <div className="mt-3 space-y-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-px bg-gradient-to-r from-accent-500/20 via-accent-500/40 to-accent-500/20 flex-1"></div>
              <span className="text-xs font-police-body text-accent-600 dark:text-accent-400 uppercase tracking-wider px-2">
                Subcategorias Táticas
              </span>
              <div className="h-px bg-gradient-to-r from-accent-500/20 via-accent-500/40 to-accent-500/20 flex-1"></div>
            </div>
            {category.children!.map(child => renderCategoryTree(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  // Get selected category names
  const getSelectedCategoryNames = () => {
    const selected = categories.filter(cat => selectedCategories.includes(cat.id));
    const names: string[] = [];
    
    const collectNames = (cats: Category[]) => {
      cats.forEach(cat => {
        if (selectedCategories.includes(cat.id)) {
          names.push(cat.name);
        }
        if (cat.children) {
          collectNames(cat.children);
        }
      });
    };
    
    collectNames(categories);
    return names;
  };

  const loadFlashcard = async (id: string) => {
    try {
      setIsLoading(true);
      const response = await flashcardService.getFlashcard(id);
      
      if (response.success && response.data) {
        const flashcard = response.data;
        setCard({
          type: flashcard.type || 'basic',
          front: flashcard.front || '',
          back: flashcard.back || '',
          question: flashcard.question || '',
          options: flashcard.options || ['', '', '', ''],
          correct: flashcard.correct || 0,
          explanation: flashcard.explanation || '',
          statement: flashcard.statement || '',
          answer: flashcard.answer || 'true',
          text: flashcard.text || '',
          extra: flashcard.extra || '',
          hint: flashcard.hint || '',
          image: flashcard.image || '',
          occlusionAreas: flashcard.occlusion_areas || [],
          difficulty: flashcard.difficulty || 'medium',
          category: flashcard.category || '',
          subcategory: flashcard.subcategory || '',
          tags: (flashcard.tags || []).join(', ')
        });
        
        if (flashcard.category) {
          const categoryIds = flashcard.category.split(',').map(name => name.trim());
          const findCategoryIdsByName = (cats: Category[], names: string[]): string[] => {
            const ids: string[] = [];
            const searchInCategories = (categories: Category[]) => {
              categories.forEach(cat => {
                if (names.includes(cat.name)) {
                  ids.push(cat.id);
                }
                if (cat.children) {
                  searchInCategories(cat.children);
                }
              });
            };
            searchInCategories(cats);
            return ids;
          };
          
          const foundIds = findCategoryIdsByName(categories, categoryIds);
          setSelectedCategories(foundIds);
        }
      }
    } catch (error) {
      console.error('Error loading flashcard:', error);
      toast.error('Erro ao carregar flashcard');
    } finally {
      setIsLoading(false);
    }
  };

  const cardTypes = [
    { value: 'basic', label: 'BÁSICO (FRENTE/VERSO)', description: 'Cartão tradicional com pergunta e resposta' },
    { value: 'basic_reversed', label: 'BÁSICO INVERTIDO', description: 'Gera automaticamente cartão inverso' },
    { value: 'cloze', label: 'LACUNAS (CLOZE)', description: 'Texto com lacunas para preencher' },
    { value: 'multiple_choice', label: 'MÚLTIPLA ESCOLHA', description: 'Questão com alternativas' },
    { value: 'true_false', label: 'VERDADEIRO/FALSO', description: 'Afirmação para avaliar' },
    { value: 'type_answer', label: 'DIGITE A RESPOSTA', description: 'Requer digitação da resposta' },
    { value: 'image_occlusion', label: 'OCLUSÃO DE IMAGEM', description: 'Imagem com áreas ocultas' }
  ];

  const templates = {
    basic: {
      front: 'Art. 121 do Código Penal',
      back: 'Matar alguém\\nPena - reclusão, de seis a vinte anos.',
      tags: 'CP, HOMICÍDIO, ARTIGO'
    },
    basic_reversed: {
      front: 'Deserção',
      back: 'Art. 298 CPM',
      extra: 'Ausentar-se o militar, sem licença, da unidade em que serve, ou do lugar em que deve permanecer, por mais de oito dias.\\nPena - detenção, de seis meses a dois anos',
      tags: 'CPM, DESERÇÃO, MILITAR'
    },
    cloze: {
      text: 'Art. 155 CP - Subtrair, para si ou para outrem, coisa {{c1::alheia}} {{c2::móvel}}: Pena - reclusão, de {{c3::um a quatro anos}}, e multa.',
      extra: 'Crime de Furto - Código Penal',
      tags: 'CP, FURTO, PATRIMÔNIO'
    },
    multiple_choice: {
      question: 'Qual a pena para deserção no CPM?',
      options: ['Detenção de 1 a 3 anos', 'Detenção de 6 meses a 2 anos', 'Reclusão de 2 a 8 anos', 'Prisão de 15 dias a 6 meses'],
      correct: 1,
      explanation: 'Art. 298 CPM - Pena: detenção, de seis meses a dois anos',
      tags: 'CPM, DESERÇÃO, PENAS'
    },
    true_false: {
      statement: 'A prisão em flagrante pode ser realizada por qualquer pessoa.',
      answer: 'true',
      explanation: 'Art. 301 do CPP - Qualquer do povo poderá e as autoridades policiais e seus agentes deverão prender quem quer que seja encontrado em flagrante delito.',
      tags: 'CPP, FLAGRANTE, PRISÃO'
    },
    type_answer: {
      question: 'Complete o artigo: "Art. 9º CPM - Consideram-se crimes militares, em tempo de..."',
      answer: 'paz',
      hint: 'Oposto de guerra',
      tags: 'CPM, CRIME MILITAR'
    },
    image_occlusion: {
      image: '/api/placeholder/800/600',
      occlusionAreas: [
        { id: 'area-1', x: 100, y: 50, width: 150, height: 40, answer: 'Coronel', shape: 'rectangle' },
        { id: 'area-2', x: 100, y: 120, width: 150, height: 40, answer: 'Tenente-Coronel', shape: 'rectangle' }
      ],
      extra: 'Hierarquia Militar - Oficiais Superiores',
      tags: 'HIERARQUIA, MILITAR, OFICIAIS'
    }
  };

  const loadTemplate = () => {
    const template = templates[card.type as keyof typeof templates];
    if (template) {
      setCard({ ...card, ...template });
      toast.success('🎯 INTEL TÁTICO CARREGADO: Exemplo pronto para edição!');
    }
  };

  // Função utilitária para processar cloze estilo Anki
  const processClozeCard = (text: string) => {
    const clozePattern = /\{\{c(\d+)::([^}]+)\}\}/g;
    const matches = Array.from(text.matchAll(clozePattern));
    
    if (matches.length === 0) {
      return [{
        text: text,
        answer: '',
        clozeNumber: 0
      }];
    }

    const clozeGroups = new Map<string, Array<{index: number, text: string}>>();
    matches.forEach((match) => {
      const clozeNum = match[1];
      const clozeText = match[2];
      if (!clozeGroups.has(clozeNum)) {
        clozeGroups.set(clozeNum, []);
      }
      clozeGroups.get(clozeNum)?.push({
        index: match.index || 0,
        text: clozeText
      });
    });

    const cards = Array.from(clozeGroups.entries()).map(([clozeNum, group]) => {
      let processedText = text;
      let answer = '';
      
      group.forEach((item) => {
        const pattern = new RegExp(`\\{\\{c${clozeNum}::([^}]+)\\}\\}`, 'g');
        processedText = processedText.replace(pattern, '[...]');
        answer = item.text;
      });
      
      processedText = processedText.replace(/\{\{c\d+::([^}]+)\}\}/g, '$1');
      
      return {
        text: processedText,
        answer: answer,
        clozeNumber: parseInt(clozeNum)
      };
    });

    return cards.sort((a, b) => a.clozeNumber - b.clozeNumber);
  };

  const countClozeCards = (text: string) => {
    if (!text) return 1;
    const clozePattern = /\{\{c(\d+)::([^}]+)\}\}/g;
    const matches = Array.from(text.matchAll(clozePattern));
    
    if (matches.length === 0) return 1;
    
    const numbers = new Set(matches.map(m => m[1]));
    return numbers.size > 0 ? numbers.size : 1;
  };

  const handleSave = async () => {
    // Se está em deck mode, adicionar ao deck
    if (isDeckMode) {
      // Validação e criação do flashcard para adicionar ao deck
      const newFlashcard = {
        id: Date.now().toString(),
        type: card.type,
        front: card.front,
        back: card.back,
        question: card.question,
        options: card.options,
        correct: card.correct,
        explanation: card.explanation,
        statement: card.statement,
        answer: card.answer,
        text: card.text,
        extra: card.extra,
        hint: card.hint,
        image: card.image,
        occlusionAreas: card.occlusionAreas,
        difficulty: card.difficulty,
        category: card.category,
        subcategory: card.subcategory,
        tags: card.tags,
        created_at: new Date().toISOString()
      };
      
      // Adicionar ao deck localmente
      setDeckFlashcards([...deckFlashcards, newFlashcard]);
      
      // Limpar formulário
      setCard({
        type: 'basic',
        front: '',
        back: '',
        question: '',
        options: ['', '', '', ''],
        correct: 0,
        explanation: '',
        statement: '',
        answer: 'true',
        text: '',
        extra: '',
        hint: '',
        image: '',
        occlusionAreas: [],
        difficulty: 'medium',
        category: '',
        subcategory: '',
        tags: '',
        header: '',
        source: '',
        comments: '',
        images: []
      });
      
      toast.success('🎯 FLASHCARD ADICIONADO AO ARSENAL!', {
        duration: 2000
      });
      
      // Mudar para aba de flashcards para mostrar o novo card
      setActiveTab('flashcards');
      return;
    }
    
    // Código original para quando não está em deck mode
    // Validação tática baseada no tipo de intel
    if (card.type === 'basic' || card.type === 'basic_reversed') {
      if (!card.front.trim() || !card.back.trim()) {
        toast.error('🚨 OPERAÇÃO FALHADA: Configure briefing e intel de resposta');
        return;
      }
    } else if (card.type === 'cloze') {
      if (!card.text || !card.text.trim()) {
        toast.error('🚨 OPERAÇÃO FALHADA: Configure texto com lacunas táticas');
        return;
      }
    } else if (card.type === 'multiple_choice') {
      if (!card.question.trim() || card.options.some(o => !o.trim())) {
        toast.error('🚨 OPERAÇÃO FALHADA: Configure pergunta e todas as alternativas');
        return;
      }
    } else if (card.type === 'true_false') {
      if (!card.statement.trim()) {
        toast.error('🚨 OPERAÇÃO FALHADA: Configure afirmação para avaliação');
        return;
      }
    } else if (card.type === 'type_answer') {
      if (!card.question.trim() || !card.answer.toString().trim()) {
        toast.error('🚨 OPERAÇÃO FALHADA: Configure pergunta e resposta tática');
        return;
      }
    } else if (card.type === 'image_occlusion') {
      if (!card.image || card.occlusionAreas.length === 0) {
        toast.error('🚨 OPERAÇÃO FALHADA: Configure imagem e áreas de oclusão');
        return;
      }
    }

    setIsLoading(true);
    toast.loading(isEditing ? '⚔️ ATUALIZANDO INTEL TÁTICO...' : '🎯 SALVANDO INTEL TÁTICO...', { id: 'save' });
    
    try {
      const categoryString = selectedCategories.length > 0 ? getSelectedCategoryNames().join(',') : 'GERAL';
      
      if (card.type === 'cloze' && !isEditing) {
        const textToProcess = card.text || '';
        const clozeCards = processClozeCard(textToProcess);
        
        if (clozeCards.length > 1) {
          let successCount = 0;
          for (const clozeCard of clozeCards) {
            const flashcardData: CreateFlashcardData = {
              type: 'cloze' as any,
              difficulty: card.difficulty as any,
              category: categoryString,
              subcategory: '',
              tags: card.tags ? card.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
              status: 'published',
              front: clozeCard.text,
              back: clozeCard.answer || card.back,
              text: clozeCard.text,
              extra: card.extra,
              explanation: card.explanation,
              hint: card.hint
            };
            
            const response = await flashcardService.createFlashcard(flashcardData);
            if (response.success) successCount++;
          }
          
          if (successCount > 0) {
            toast.success(`🎯 OPERAÇÃO CONCLUÍDA: ${successCount} cartões táticos criados!`, {
              id: 'save',
              duration: 3000
            });
            
            setTimeout(() => {
              navigate('/student/flashcards');
            }, 1000);
          } else {
            throw new Error('Falha ao salvar flashcards');
          }
        } else {
          const flashcardData: CreateFlashcardData = {
            type: card.type as any,
            difficulty: card.difficulty as any,
            category: categoryString,
            subcategory: '',
            tags: card.tags ? card.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
            status: 'published',
            front: card.front || card.text,
            back: card.back,
            text: card.text || card.front,
            extra: card.extra,
            explanation: card.explanation,
            hint: card.hint
          };
          
          const response = await flashcardService.createFlashcard(flashcardData);
          if (response.success) {
            toast.success('🎯 OPERAÇÃO CONCLUÍDA: Intel tático criado com sucesso!', {
              id: 'save',
              duration: 3000
            });
            
            setTimeout(() => {
              navigate('/student/flashcards');
            }, 1000);
          } else {
            throw new Error('Falha ao salvar flashcard');
          }
        }
      } else {
        const flashcardData: CreateFlashcardData = {
          type: card.type as any,
          difficulty: card.difficulty as any,
          category: categoryString,
          subcategory: '',
          tags: card.tags ? card.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
          status: 'published',
          front: card.front,
          back: card.back,
          extra: card.extra,
          text: card.text,
          question: card.question,
          options: card.options,
          correct: card.correct,
          explanation: card.explanation,
          statement: card.statement,
          answer: card.answer,
          hint: card.hint,
          image: card.image,
          occlusionAreas: card.occlusionAreas
        };
        
        let response;
        if (isEditing && cardId) {
          response = await flashcardService.updateFlashcard(cardId, flashcardData);
        } else {
          response = await flashcardService.createFlashcard(flashcardData);
        }
        
        if (response.success) {
          toast.success(`🎯 OPERAÇÃO CONCLUÍDA: Intel tático ${isEditing ? 'atualizado' : 'criado'} com sucesso!`, {
            id: 'save',
            duration: 3000
          });
          
          setTimeout(() => {
            navigate('/student/flashcards');
          }, 1000);
        } else {
          throw new Error('Falha ao salvar flashcard');
        }
      }
    } catch (error) {
      console.error('Error saving flashcard:', error);
      toast.error('🚨 OPERAÇÃO FALHADA: Erro ao salvar intel tático', { id: 'save' });
    } finally {
      setIsLoading(false);
    }
  };

  const renderPreview = () => {
    switch (card.type) {
      case 'basic':
      case 'basic_reversed':
        return (
          <div className="text-center">
            <h3 className="text-lg font-police-title font-bold text-gray-900 dark:text-white mb-4 uppercase tracking-wider">
              {showAnswer ? '🎯 INTEL DE RESPOSTA' : '❓ BRIEFING TÁTICO'}
            </h3>
            <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 mb-4">
              <p className="text-gray-900 dark:text-white font-police-body text-lg">
                {showAnswer ? card.back : card.front}
              </p>
            </div>
            {showAnswer && card.extra && (
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-yellow-800 dark:text-yellow-200 font-police-body text-sm">
                  <strong>🔍 INTEL ADICIONAL:</strong> {card.extra}
                </p>
              </div>
            )}
          </div>
        );

      case 'multiple_choice':
        return (
          <div className="text-center">
            <h3 className="text-lg font-police-title font-bold text-gray-900 dark:text-white mb-4 uppercase tracking-wider">
              🎯 OPERAÇÃO MÚLTIPLA ESCOLHA
            </h3>
            <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 mb-4">
              <p className="text-gray-900 dark:text-white font-police-body text-lg mb-4">
                {card.question}
              </p>
              <div className="space-y-2">
                {card.options.map((option: string, index: number) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border transition-colors ${
                      showAnswer && index === card.correct
                        ? 'bg-green-100 dark:bg-green-900/30 border-green-500 text-green-800 dark:text-green-200'
                        : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                    }`}
                  >
                    <span className="font-police-body">
                      {String.fromCharCode(65 + index)}) {option}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            {showAnswer && card.explanation && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-blue-800 dark:text-blue-200 font-police-body text-sm">
                  <strong>🎯 EXPLICAÇÃO TÁTICA:</strong> {card.explanation}
                </p>
              </div>
            )}
          </div>
        );

      case 'true_false':
        return (
          <div className="text-center">
            <h3 className="text-lg font-police-title font-bold text-gray-900 dark:text-white mb-4 uppercase tracking-wider">
              ⚔️ OPERAÇÃO V/F
            </h3>
            <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 mb-4">
              <p className="text-gray-900 dark:text-white font-police-body text-lg mb-4">
                {card.statement}
              </p>
              {showAnswer && (
                <div className={`p-3 rounded-lg ${
                  (card.answer === 'true' || card.answer === true)
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                    : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
                }`}>
                  <p className="font-police-title font-bold uppercase tracking-wider">
                    {(card.answer === 'true' || card.answer === true) ? '✅ VERDADEIRO' : '❌ FALSO'}
                  </p>
                </div>
              )}
            </div>
            {showAnswer && card.explanation && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-blue-800 dark:text-blue-200 font-police-body text-sm">
                  <strong>🎯 EXPLICAÇÃO TÁTICA:</strong> {card.explanation}
                </p>
              </div>
            )}
          </div>
        );

      case 'cloze':
        return (
          <div className="text-center">
            <h3 className="text-lg font-police-title font-bold text-gray-900 dark:text-white mb-4 uppercase tracking-wider">
              🎯 OPERAÇÃO LACUNAS
            </h3>
            <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 mb-4">
              <p className="text-gray-900 dark:text-white font-police-body text-lg whitespace-pre-line">
                {showAnswer 
                  ? card.text.replace(/{{c\d+::(.*?)}}/g, '$1')
                  : card.text.replace(/{{c\d+::(.*?)}}/g, '[...]')
                }
              </p>
            </div>
            {showAnswer && card.extra && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-blue-800 dark:text-blue-200 font-police-body text-sm">
                  <strong>🔍 INTEL ADICIONAL:</strong> {card.extra}
                </p>
              </div>
            )}
          </div>
        );

      case 'type_answer':
        return (
          <div className="text-center">
            <h3 className="text-lg font-police-title font-bold text-gray-900 dark:text-white mb-4 uppercase tracking-wider">
              ⌨️ OPERAÇÃO DIGITE
            </h3>
            <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 mb-4">
              <p className="text-gray-900 dark:text-white font-police-body text-lg mb-4">
                {card.question}
              </p>
              {showAnswer && (
                <div className="p-3 bg-green-100 dark:bg-green-900/30 border border-green-500 rounded-lg">
                  <p className="text-green-800 dark:text-green-200 font-police-body font-bold">
                    🎯 RESPOSTA TÁTICA: {card.answer}
                  </p>
                </div>
              )}
              {card.hint && !showAnswer && (
                <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-500 rounded-lg mt-2">
                  <p className="text-yellow-800 dark:text-yellow-200 font-police-body text-sm">
                    💡 DICA TÁTICA: {card.hint}
                  </p>
                </div>
              )}
            </div>
          </div>
        );

      case 'image_occlusion':
        return (
          <div className="text-center">
            <h3 className="text-lg font-police-title font-bold text-gray-900 dark:text-white mb-4 uppercase tracking-wider">
              🖼️ OPERAÇÃO OCLUSÃO
            </h3>
            {card.image ? (
              <div className="relative inline-block">
                <img 
                  src={card.image} 
                  alt="Flashcard image" 
                  className="max-w-full h-auto rounded-lg"
                />
                {card.occlusionAreas && card.occlusionAreas.map((area: any, index: number) => (
                  <div
                    key={index}
                    style={{
                      position: 'absolute',
                      left: `${(area.x / 800) * 100}%`,
                      top: `${(area.y / 600) * 100}%`,
                      width: `${(area.width / 800) * 100}%`,
                      height: `${(area.height / 600) * 100}%`
                    }}
                    className="ring-2 ring-accent-500"
                  >
                    {area.shape === 'rectangle' ? (
                      <div
                        className={`w-full h-full ${
                          showAnswer
                            ? 'bg-transparent border-2 border-accent-500'
                            : 'bg-gray-800 dark:bg-gray-900'
                        }`}
                      />
                    ) : (
                      <div
                        className={`w-full h-full rounded-full ${
                          showAnswer
                            ? 'bg-transparent border-2 border-accent-500'
                            : 'bg-gray-800 dark:bg-gray-900'
                        }`}
                      />
                    )}
                    
                    {showAnswer && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="bg-accent-500 text-black px-2 py-1 rounded font-police-body font-semibold text-sm uppercase">
                          {area.answer}
                        </span>
                      </div>
                    )}
                    
                    {!showAnswer && (
                      <div className="absolute top-1 left-1 bg-gray-900/80 text-white px-1.5 py-0.5 rounded text-xs font-police-numbers">
                        {index + 1}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 bg-gray-100 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
                <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 dark:text-gray-400 font-police-body uppercase tracking-wider">
                  CONFIGURE A IMAGEM DE OCLUSÃO
                </p>
              </div>
            )}
            {card.extra && (
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-blue-800 dark:text-blue-200 font-police-body text-sm">
                  <strong>🔍 INTEL ADICIONAL:</strong> {card.extra}
                </p>
              </div>
            )}
          </div>
        );

      default:
        return (
          <div className="text-center p-8">
            <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 font-police-body uppercase tracking-wider">
              Selecione um tipo de cartão tático para visualizar
            </p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-police-body">
      {/* Header Militar/Tático */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-gray-900 via-[#14242f] to-gray-900 border-b-4 border-accent-500 relative overflow-hidden"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,204,21,0.3) 1px, transparent 0)',
          backgroundSize: '20px 20px'
        }}
      >
        {/* Corner accents */}
        <div className="absolute top-0 right-0 w-20 h-20 border-t-4 border-r-4 border-accent-500/30" />
        <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-accent-500/20" />
        
        <div className="max-w-7xl mx-auto px-6 py-8 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Button
                variant="ghost"
                onClick={() => navigate('/student/flashcards')}
                className="gap-2 font-police-body uppercase tracking-wider hover:bg-white/10 text-white hover:text-accent-500 border border-transparent hover:border-accent-500/30 transition-all duration-300"
              >
                <ArrowLeft className="w-5 h-5" />
                RETORNAR À BASE
              </Button>
              
              <div className="flex items-center gap-4">
                <StudyProLogo className="h-8 w-auto" />
                <div className="h-6 w-px bg-white/20" />
                <div className="border-l-4 border-l-accent-500 pl-6">
                  <h1 className="text-4xl font-police-title font-bold uppercase tracking-wider text-white">
                    {isDeckMode ? '📦 ARSENAL TÁTICO' : (isEditing ? '⚔️ EDITAR INTEL TÁTICO' : '🎯 CRIAR INTEL TÁTICO')}
                  </h1>
                  <p className="text-gray-300 font-police-subtitle uppercase tracking-wider mt-1">
                    {isDeckMode ? 'GERENCIAMENTO DE ARSENAL TÁTICO' : (isEditing ? 'OPERAÇÃO DE ATUALIZAÇÃO DE FLASHCARD' : 'OPERAÇÃO DE CRIAÇÃO DE FLASHCARD')}
                  </p>
                </div>
              </div>
            </div>
          
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Shield className="w-6 h-6 text-accent-500" />
                <span className="text-white font-police-body font-bold uppercase tracking-wider">
                  OPERADOR: {user?.name || 'AGENTE'}
                </span>
              </div>
              
              <Button
                variant="ghost"
                onClick={() => setShowPreview(!showPreview)}
                className="gap-2 font-police-body uppercase tracking-wider hover:bg-white/10 text-white hover:text-accent-500 border border-transparent hover:border-accent-500/30 transition-all duration-300"
              >
                <Eye className="w-5 h-5" />
                {showPreview ? 'OCULTAR' : 'MOSTRAR'} PREVIEW
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Abas do Deck Mode */}
      {isDeckMode && (
        <div className="bg-gray-100 dark:bg-gray-800 border-b-2 border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center gap-4 py-4">
              <Button
                onClick={() => setActiveTab('overview')}
                className={`px-6 py-2 font-police-subtitle uppercase tracking-wider transition-all ${
                  activeTab === 'overview' 
                    ? 'bg-accent-500 text-black hover:bg-accent-600' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                <Package className="w-4 h-4 mr-2 inline-block" />
                VISÃO GERAL
              </Button>
              <Button
                onClick={() => setActiveTab('flashcards')}
                className={`px-6 py-2 font-police-subtitle uppercase tracking-wider transition-all ${
                  activeTab === 'flashcards' 
                    ? 'bg-accent-500 text-black hover:bg-accent-600' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                <Layers className="w-4 h-4 mr-2 inline-block" />
                FLASHCARDS ({deckFlashcards.length})
              </Button>
              <Button
                onClick={() => setActiveTab('create')}
                className={`px-6 py-2 font-police-subtitle uppercase tracking-wider transition-all ${
                  activeTab === 'create' 
                    ? 'bg-accent-500 text-black hover:bg-accent-600' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                <Plus className="w-4 h-4 mr-2 inline-block" />
                CRIAR NOVO
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Renderização condicional baseada no modo deck e aba ativa */}
        {isDeckMode && activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Card className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                <CardTitle className="font-police-title uppercase tracking-wider flex items-center gap-3">
                  <Package className="w-6 h-6 text-accent-500" />
                  INFORMAÇÕES DO ARSENAL
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-police-subtitle text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">
                      Nome do Arsenal
                    </label>
                    <p className="font-police-body text-lg text-gray-900 dark:text-white">
                      {currentDeck?.name || 'Arsenal Tático Principal'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-police-subtitle text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">
                      Total de Flashcards
                    </label>
                    <p className="font-police-numbers text-2xl text-accent-500">
                      {deckFlashcards.length}
                    </p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-police-subtitle text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">
                    Descrição
                  </label>
                  <p className="font-police-body text-gray-700 dark:text-gray-300">
                    {currentDeck?.description || 'Arsenal tático para treinamento e memorização de conceitos importantes'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {isDeckMode && activeTab === 'flashcards' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Card className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                <CardTitle className="font-police-title uppercase tracking-wider flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Layers className="w-6 h-6 text-accent-500" />
                    FLASHCARDS DO ARSENAL
                  </div>
                  <Button
                    onClick={() => setActiveTab('create')}
                    className="bg-accent-500 hover:bg-accent-600 text-black font-police-body uppercase tracking-wider"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    ADICIONAR
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {deckFlashcards.length === 0 ? (
                  <div className="text-center py-12">
                    <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 font-police-body uppercase tracking-wider">
                      ARSENAL VAZIO - ADICIONE FLASHCARDS
                    </p>
                    <Button
                      onClick={() => setActiveTab('create')}
                      className="mt-4 bg-accent-500 hover:bg-accent-600 text-black font-police-body uppercase tracking-wider"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      CRIAR PRIMEIRO FLASHCARD
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {deckFlashcards.map((card, index) => (
                      <div key={card.id || index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <Badge className="mb-2">{card.type}</Badge>
                            <p className="font-police-body text-gray-900 dark:text-white">
                              {card.front || card.question || card.text || 'Flashcard'}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Formulário de criação - mostrado quando activeTab === 'create' ou quando não está em deck mode */}
        {(!isDeckMode || activeTab === 'create') && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Formulário */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-800 relative overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300">
              {/* Tactical stripes */}
              <div className="absolute top-0 right-0 w-1 h-full bg-accent-500" />
              <div className="absolute top-0 right-0 w-20 h-20 border-t-4 border-r-4 border-accent-500/20" />
              
              <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border-b border-accent-500/30">
                <CardTitle className="font-police-title uppercase tracking-wider text-gray-900 dark:text-white flex items-center gap-3">
                  <Target className="w-6 h-6 text-accent-500" />
                  CONFIGURAÇÃO TÁTICA DO INTEL
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-6 p-6">
                {/* Tipo de Cartão */}
                <div className="relative">
                  <label className="block text-sm font-police-subtitle font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wider flex items-center gap-2">
                    <Brain className="w-4 h-4 text-accent-500" />
                    TIPO DE OPERAÇÃO INTEL
                  </label>
                  <select
                    value={card.type}
                    onChange={(e) => setCard({ ...card, type: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-accent-500/30 focus:border-accent-500 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-police-body uppercase tracking-wider focus:ring-2 focus:ring-accent-500/30 transition-all duration-300 hover:border-accent-500/50"
                  >
                    {cardTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-police-body">
                      {cardTypes.find(t => t.value === card.type)?.description}
                    </p>
                    <Button
                      type="button"
                      size="sm"
                      onClick={loadTemplate}
                      className="gap-1 bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black font-police-body font-semibold uppercase tracking-wider text-xs transition-all duration-300 shadow-md hover:shadow-lg"
                    >
                      <Target className="w-3 h-3" />
                      EXEMPLO TÁTICO
                    </Button>
                  </div>
                </div>

                {/* Campos específicos por tipo */}
                {(card.type === 'basic' || card.type === 'basic_reversed') && (
                  <>
                    <div>
                      <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                        🎯 FRENTE DO CARTÃO
                      </label>
                      <textarea
                        rows={3}
                        value={card.front}
                        onChange={(e) => setCard({ ...card, front: e.target.value })}
                        placeholder="DIGITE A PERGUNTA OU CONCEITO..."
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body placeholder:uppercase placeholder:tracking-wider focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                        🎯 VERSO DO CARTÃO
                      </label>
                      <textarea
                        rows={4}
                        value={card.back}
                        onChange={(e) => setCard({ ...card, back: e.target.value })}
                        placeholder="DIGITE A RESPOSTA OU DEFINIÇÃO..."
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body placeholder:uppercase placeholder:tracking-wider focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                      />
                    </div>

                    {card.type === 'basic_reversed' && (
                      <div>
                        <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                          📋 INFORMAÇÃO EXTRA
                        </label>
                        <textarea
                          rows={2}
                          value={card.extra}
                          onChange={(e) => setCard({ ...card, extra: e.target.value })}
                          placeholder="INFORMAÇÕES ADICIONAIS..."
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body placeholder:uppercase placeholder:tracking-wider focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                        />
                      </div>
                    )}
                  </>
                )}

                {/* Cloze Type Fields */}
                {card.type === 'cloze' && (
                  <>
                    <div>
                      <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                        🎯 TEXTO COM LACUNAS TÁTICAS
                      </label>
                      <ClozeEditor
                        value={card.text || ''}
                        onChange={(value, metadata) => {
                          setCard({ 
                            ...card, 
                            text: value  // Atualizar apenas o campo text para cloze
                          });
                        }}
                        placeholder="Digite o texto e selecione palavras para criar lacunas..."
                      />
                      <div className="mt-2 flex items-center justify-between">
                        <p className="text-xs text-gray-600 dark:text-gray-400 font-police-body">
                          Selecione texto e clique C1, C2, etc. para criar lacunas
                        </p>
                        {card.text && (
                          <Badge variant="outline" className="font-police-numbers">
                            {countClozeCards(card.text)} cartão(s) serão criados
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                        📋 INFORMAÇÃO EXTRA (OPCIONAL)
                      </label>
                      <textarea
                        rows={2}
                        value={card.extra}
                        onChange={(e) => setCard({ ...card, extra: e.target.value })}
                        placeholder="CONTEXTO OU EXPLICAÇÃO ADICIONAL..."
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body placeholder:uppercase placeholder:tracking-wider focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </>
                )}

                {/* Multiple Choice Type Fields */}
                {card.type === 'multiple_choice' && (
                  <>
                    <div>
                      <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                        ❓ PERGUNTA
                      </label>
                      <textarea
                        rows={2}
                        value={card.question}
                        onChange={(e) => setCard({ ...card, question: e.target.value })}
                        placeholder="DIGITE A PERGUNTA..."
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body placeholder:uppercase placeholder:tracking-wider focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                        🎯 ALTERNATIVAS TÁTICAS
                      </label>
                      {card.options.map((option, index) => (
                        <div key={index} className="flex items-center gap-2 mb-2">
                          <input
                            type="radio"
                            name="correct_option"
                            checked={card.correct === index}
                            onChange={() => setCard({ ...card, correct: index })}
                            className="text-accent-500 focus:ring-accent-500"
                          />
                          <span className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-sm font-bold font-police-title">
                            {String.fromCharCode(65 + index)}
                          </span>
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => {
                              const newOptions = [...card.options];
                              newOptions[index] = e.target.value;
                              setCard({ ...card, options: newOptions });
                            }}
                            placeholder={`ALTERNATIVA ${String.fromCharCode(65 + index)}`}
                            className="flex-1 px-3 py-1 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body placeholder:uppercase placeholder:tracking-wider focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                          />
                        </div>
                      ))}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                        💡 EXPLICAÇÃO TÁTICA
                      </label>
                      <textarea
                        rows={2}
                        value={card.explanation}
                        onChange={(e) => setCard({ ...card, explanation: e.target.value })}
                        placeholder="EXPLIQUE A RESPOSTA CORRETA..."
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body placeholder:uppercase placeholder:tracking-wider focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </>
                )}

                {/* True/False Type Fields */}
                {card.type === 'true_false' && (
                  <>
                    <div>
                      <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                        📝 AFIRMAÇÃO TÁTICA
                      </label>
                      <textarea
                        rows={2}
                        value={card.statement}
                        onChange={(e) => setCard({ ...card, statement: e.target.value })}
                        placeholder="DIGITE A AFIRMAÇÃO A SER AVALIADA..."
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body placeholder:uppercase placeholder:tracking-wider focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wider">
                        ✅ RESPOSTA CORRETA
                      </label>
                      <div className="flex gap-4">
                        <button
                          type="button"
                          onClick={() => setCard({ ...card, answer: 'true' })}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                            card.answer === 'true'
                              ? 'bg-green-100 border-green-500 text-green-700 dark:bg-green-900/20 dark:border-green-400 dark:text-green-300'
                              : 'bg-gray-100 border-gray-300 text-gray-700 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300'
                          }`}
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span className="font-police-body font-bold uppercase tracking-wider">VERDADEIRO</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setCard({ ...card, answer: 'false' })}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                            card.answer === 'false'
                              ? 'bg-red-100 border-red-500 text-red-700 dark:bg-red-900/20 dark:border-red-400 dark:text-red-300'
                              : 'bg-gray-100 border-gray-300 text-gray-700 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300'
                          }`}
                        >
                          <X className="w-4 h-4" />
                          <span className="font-police-body font-bold uppercase tracking-wider">FALSO</span>
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                        💡 EXPLICAÇÃO TÁTICA (OPCIONAL)
                      </label>
                      <textarea
                        rows={2}
                        value={card.explanation}
                        onChange={(e) => setCard({ ...card, explanation: e.target.value })}
                        placeholder="EXPLIQUE A RESPOSTA..."
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body placeholder:uppercase placeholder:tracking-wider focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </>
                )}

                {/* Type Answer Fields */}
                {card.type === 'type_answer' && (
                  <>
                    <div>
                      <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                        ❓ PERGUNTA TÁTICA
                      </label>
                      <textarea
                        rows={2}
                        value={card.question}
                        onChange={(e) => setCard({ ...card, question: e.target.value })}
                        placeholder="DIGITE A PERGUNTA..."
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body placeholder:uppercase placeholder:tracking-wider focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                          ✅ RESPOSTA
                        </label>
                        <input
                          type="text"
                          value={card.answer}
                          onChange={(e) => setCard({ ...card, answer: e.target.value })}
                          placeholder="RESPOSTA CORRETA"
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body placeholder:uppercase placeholder:tracking-wider focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                          💡 DICA (OPCIONAL)
                        </label>
                        <input
                          type="text"
                          value={card.hint}
                          onChange={(e) => setCard({ ...card, hint: e.target.value })}
                          placeholder="DICA PARA O USUÁRIO"
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body placeholder:uppercase placeholder:tracking-wider focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Image Occlusion Fields */}
                {card.type === 'image_occlusion' && (
                  <>
                    <div>
                      <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                        🖼️ CONFIGURAR OCLUSÃO DE IMAGEM
                      </label>
                      <Button
                        type="button"
                        onClick={() => setShowImageOcclusionEditor(true)}
                        className="w-full gap-2 bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black font-police-body font-semibold uppercase tracking-wider transition-colors"
                      >
                        <ImageIcon className="w-4 h-4" />
                        {card.image ? 'EDITAR' : 'CRIAR'} OCLUSÃO DE IMAGEM
                      </Button>
                      {card.image && card.occlusionAreas.length > 0 && (
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 font-police-body">
                          ✅ {card.occlusionAreas.length} ÁREAS DE OCLUSÃO CONFIGURADAS
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                        📋 INFORMAÇÃO EXTRA (OPCIONAL)
                      </label>
                      <textarea
                        rows={2}
                        value={card.extra}
                        onChange={(e) => setCard({ ...card, extra: e.target.value })}
                        placeholder="CONTEXTO OU EXPLICAÇÃO ADICIONAL..."
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body placeholder:uppercase placeholder:tracking-wider focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </>
                )}

                {/* Categorias (Sistema hierárquico igual ao admin) */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      📁 CATEGORIAS TÁTICAS
                    </label>
                    <div className="flex items-center gap-2">
                      {selectedCategories.length > 0 && (
                        <Badge className="bg-accent-500 text-black font-police-body font-semibold text-xs">
                          {selectedCategories.length} selecionada(s)
                        </Badge>
                      )}
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
                  </div>
                  
                  <div className="space-y-3 max-h-80 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800/50">
                    {loadingCategories ? (
                      <div className="text-center py-8">
                        <Loader2 className="w-6 h-6 mx-auto text-accent-500 animate-spin mb-2" />
                        <p className="font-police-body text-gray-500 dark:text-gray-400 uppercase tracking-wider text-sm">
                          CARREGANDO CATEGORIAS...
                        </p>
                      </div>
                    ) : categories.length > 0 ? (
                      <>
                        <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                          <p className="text-xs font-police-body text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                            💡 DICA TÁTICA: Você pode selecionar múltiplas categorias e níveis para este flashcard.
                          </p>
                        </div>
                        
                        {categories.map(category => renderCategoryTree(category))}
                        
                        {selectedCategories.length > 0 && (
                          <div className="mt-4 p-3 bg-accent-500/10 border border-accent-500/30 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <CheckCircle className="w-4 h-4 text-accent-500" />
                              <span className="font-police-subtitle font-semibold text-gray-900 dark:text-white uppercase tracking-wider text-sm">
                                CATEGORIAS SELECIONADAS ({selectedCategories.length})
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
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                      🎯 DIFICULDADE
                    </label>
                    <select
                      value={card.difficulty}
                      onChange={(e) => setCard({ ...card, difficulty: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body uppercase tracking-wider focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                    >
                      <option value="easy">FÁCIL</option>
                      <option value="medium">MÉDIO</option>
                      <option value="hard">DIFÍCIL</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                      🏷️ TAGS (SEPARADAS POR VÍRGULA)
                    </label>
                    <input
                      type="text"
                      value={card.tags}
                      onChange={(e) => setCard({ ...card, tags: e.target.value })}
                      placeholder="EX: CPM, ART. 9º"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body placeholder:uppercase placeholder:tracking-wider focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
                
                {/* Campos Extras Estilo Anki */}
                <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h5 className="font-police-subtitle uppercase tracking-wider text-gray-700 dark:text-gray-300 text-sm font-semibold flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-accent-500" />
                    CAMPOS EXTRAS TÁTICOS (OPCIONAL)
                  </h5>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-police-body font-medium text-gray-600 dark:text-gray-400 mb-1 uppercase tracking-wider">
                        📋 CABEÇALHO/CONTEXTO
                      </label>
                      <input
                        type="text"
                        value={card.header}
                        onChange={(e) => setCard({ ...card, header: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-police-body focus:ring-2 focus:ring-accent-500"
                        placeholder="Ex: Art. 5º CF"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-police-body font-medium text-gray-600 dark:text-gray-400 mb-1 uppercase tracking-wider">
                        📚 FONTE/REFERÊNCIA
                      </label>
                      <input
                        type="text"
                        value={card.source}
                        onChange={(e) => setCard({ ...card, source: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-police-body focus:ring-2 focus:ring-accent-500"
                        placeholder="Ex: Código Penal, página 45"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-police-body font-medium text-gray-600 dark:text-gray-400 mb-1 uppercase tracking-wider">
                      📝 NOTAS PRIVADAS
                    </label>
                    <textarea
                      value={card.comments}
                      onChange={(e) => setCard({ ...card, comments: e.target.value })}
                      rows={2}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-police-body focus:ring-2 focus:ring-accent-500"
                      placeholder="Notas para você (não aparecem no estudo)..."
                    />
                  </div>
                </div>
                
                {/* Botão de Salvar no Final */}
                <div className="mt-6">
                  <Button 
                    onClick={handleSave}
                    disabled={isLoading}
                    size="lg"
                    className="w-full gap-2 bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black font-police-title font-bold uppercase tracking-wider transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed px-8 py-4"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <CheckCircle className="w-5 h-5" />
                    )}
                    {isLoading 
                      ? (isDeckMode ? '📦 ADICIONANDO...' : (isEditing ? '⚔️ ATUALIZANDO...' : '🎯 SALVANDO...')) 
                      : (isDeckMode ? '📦 ADICIONAR AO ARSENAL' : (isEditing ? 'CONFIRMAR ATUALIZAÇÃO' : 'SALVAR CARTÃO TÁTICO'))}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Preview */}
          {showPreview && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-800 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1 h-full bg-accent-500" />
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="font-police-title uppercase tracking-wider text-gray-900 dark:text-white flex items-center gap-3">
                      <Eye className="w-6 h-6 text-accent-500" />
                      VISUALIZAÇÃO TÁTICA
                    </CardTitle>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowAnswer(!showAnswer)}
                      className="gap-1 font-police-body uppercase tracking-wider border-gray-300 dark:border-gray-600 hover:border-accent-500 dark:hover:border-accent-500 transition-colors"
                    >
                      {showAnswer ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      {showAnswer ? 'OCULTAR' : 'MOSTRAR'} RESPOSTA
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="min-h-[300px] flex items-center justify-center">
                    {renderPreview()}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
        )}
      </div>

      {/* Image Occlusion Editor Modal */}
      {showImageOcclusionEditor && (
        <ImageOcclusionEditor
          imageUrl={card.image}
          occlusionAreas={card.occlusionAreas}
          onSave={(imageUrl, areas) => {
            setCard({ ...card, image: imageUrl, occlusionAreas: areas });
            setShowImageOcclusionEditor(false);
            toast.success('🖼️ Oclusão de imagem configurada');
          }}
          onCancel={() => setShowImageOcclusionEditor(false)}
        />
      )}

      {/* Quick Category Modal */}
      <AnimatePresence>
        {showQuickCategoryModal && renderQuickCategoryModal()}
      </AnimatePresence>
    </div>
  );

  // Render modal function for category creation (igual ao admin)
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
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white font-police-title uppercase tracking-wider">
                🏗️ CONSTRUTOR DE CATEGORIAS TÁTICAS
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 font-police-body">
                Crie toda a estrutura de categorias antes de salvar na base de dados
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
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4 font-police-subtitle uppercase tracking-wider">
              ➕ Adicionar Categoria Tática
            </h4>
            {newCategoryForm.parentId && (
              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <span className="text-blue-700 dark:text-blue-300 font-police-body">Criando subcategoria de:</span>
                    <div className="font-semibold text-blue-900 dark:text-blue-100 font-police-title">
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-police-body uppercase tracking-wider">
                  Nome *
                </label>
                <input
                  type="text"
                  value={newCategoryForm.name}
                  onChange={(e) => setNewCategoryForm({ ...newCategoryForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-police-body"
                  placeholder="Ex: Direito Constitucional"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddToPendingTree()}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-police-body uppercase tracking-wider">
                  Descrição
                </label>
                <textarea
                  value={newCategoryForm.description}
                  onChange={(e) => setNewCategoryForm({ ...newCategoryForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-police-body"
                  placeholder="Ex: Estudos sobre a Constituição Federal"
                  rows={3}
                />
              </div>
              <Button
                onClick={handleAddToPendingTree}
                className="w-full gap-2 bg-green-600 hover:bg-green-700 font-police-body uppercase tracking-wider"
                disabled={!newCategoryForm.name.trim()}
              >
                <Plus className="w-4 h-4" />
                {newCategoryForm.parentId ? 'Adicionar Subcategoria' : 'Adicionar Categoria'}
              </Button>
            </div>
          </div>
          
          {/* Right column - Tree preview */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-900 dark:text-white font-police-subtitle uppercase tracking-wider">
                🌳 Estrutura ({countCategories(pendingTree)} categoria(s))
              </h4>
              {pendingTree.length > 0 && (
                <Button
                  onClick={handleSaveAllCategories}
                  disabled={savingCategories}
                  className="gap-2 bg-accent-500 hover:bg-accent-600 text-black font-police-body uppercase tracking-wider"
                >
                  {savingCategories ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  {savingCategories ? 'Salvando...' : 'Salvar Todas'}
                </Button>
              )}
            </div>
            
            {pendingTree.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="font-police-body">Nenhuma categoria criada ainda</p>
              </div>
            ) : (
              <div className="space-y-2">
                {pendingTree.map(category => renderPendingTree(category, 0))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );

  // Render function for pending category tree
  const renderPendingTree = (category: PendingCategory, level: number = 0): React.ReactNode => {
    return (
      <div key={category.id} className={`${level > 0 ? 'ml-6' : ''}`}>
        <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
          {category.children.length > 0 && (
            <button
              onClick={() => handleToggleExpand(category.id)}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
            >
              {category.isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          )}
          <div className="flex-1">
            <div className="font-semibold text-gray-900 dark:text-white font-police-title">
              {category.name}
            </div>
            {category.description && (
              <div className="text-sm text-gray-600 dark:text-gray-400 font-police-body">
                {category.description}
              </div>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setNewCategoryForm({ ...newCategoryForm, parentId: category.id })}
              className="p-1 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-800 rounded"
              title="Adicionar subcategoria"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleRemoveFromTree(category.id)}
              className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-800 rounded"
              title="Remover categoria"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {category.children.length > 0 && category.isExpanded && (
          <div className="mt-2 space-y-2">
            {category.children.map(child => renderPendingTree(child, level + 1))}
          </div>
        )}
      </div>
    );
  };
}