import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Eye,
  Plus,
  Brain,
  CheckCircle,
  AlertCircle,
  Image as ImageIcon,
  BookOpen,
  Lock,
  Globe,
  Package,
  Layers,
  ChevronDown,
  Info,
  Lightbulb,
  FileText,
  Link2,
  Tag,
  Hash,
  X,
  Shield,
  Target,
  Crosshair,
  Type,
  List,
  ToggleLeft,
  Edit3,
  Image,
  HelpCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAuthStore } from '@/store/authStore';
import { flashcardService, CreateFlashcardData, FlashcardType } from '@/services/flashcardService';
import { flashcardDeckService, FlashcardDeck } from '@/services/flashcardDeckService';
import { categoryService, Category } from '@/services/categoryService';
import ClozeEditor from '@/components/ClozeEditor';
import ImageUploader from '@/components/ImageUploader';
import ImageOcclusionEditor from '@/components/ImageOcclusionEditor';
import FlashcardPreviewModal from '@/components/FlashcardPreviewModal';
import toast from 'react-hot-toast';

// Tipos de flashcard com ícones e descrições
const flashcardTypes = [
  {
    value: 'basic' as FlashcardType,
    label: 'BÁSICO',
    icon: <Brain className="w-5 h-5" />,
    description: 'Pergunta e resposta simples',
    color: 'bg-blue-500'
  },
  {
    value: 'basic_reversed' as FlashcardType,
    label: 'BÁSICO INVERTIDO',
    icon: <Target className="w-5 h-5" />,
    description: 'Com cartão reverso automático',
    color: 'bg-green-500'
  },
  {
    value: 'cloze' as FlashcardType,
    label: 'LACUNAS (CLOZE)',
    icon: <Type className="w-5 h-5" />,
    description: 'Preencher espaços em branco',
    color: 'bg-yellow-500'
  },
  {
    value: 'multiple_choice' as FlashcardType,
    label: 'MÚLTIPLA ESCOLHA',
    icon: <List className="w-5 h-5" />,
    description: '4 alternativas com uma correta',
    color: 'bg-purple-500'
  },
  {
    value: 'true_false' as FlashcardType,
    label: 'VERDADEIRO/FALSO',
    icon: <ToggleLeft className="w-5 h-5" />,
    description: 'Avaliar afirmações',
    color: 'bg-red-500'
  },
  {
    value: 'type_answer' as FlashcardType,
    label: 'DIGITE A RESPOSTA',
    icon: <Edit3 className="w-5 h-5" />,
    description: 'Campo de texto para resposta',
    color: 'bg-indigo-500'
  },
  {
    value: 'image_occlusion' as FlashcardType,
    label: 'OCLUSÃO DE IMAGEM',
    icon: <Image className="w-5 h-5" />,
    description: 'Ocultar partes de imagens',
    color: 'bg-orange-500'
  }
];

// Níveis de dificuldade
const difficultyLevels = [
  { value: 'easy', label: 'FÁCIL', color: 'bg-green-500' },
  { value: 'medium', label: 'MÉDIO', color: 'bg-yellow-500' },
  { value: 'hard', label: 'DIFÍCIL', color: 'bg-red-500' }
];

export default function NewStudentFlashcard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3; // Tipo & Deck, Conteúdo, Campos Extras
  
  // Estados para decks e categorias
  const [userDecks, setUserDecks] = useState<FlashcardDeck[]>([]);
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');
  
  // Estados para tags
  const [newTag, setNewTag] = useState('');
  
  // Estados para múltipla escolha
  const [mcOptions, setMcOptions] = useState(['', '', '', '']);
  const [correctOption, setCorrectOption] = useState(0);
  
  // Estado do formulário
  const [formData, setFormData] = useState<CreateFlashcardData>({
    type: 'basic',
    difficulty: 'medium',
    category: '',
    subcategory: '',
    tags: [],
    status: 'draft',
    deck_id: null,
    // Campos principais
    front: '',
    back: '',
    // Campos extras
    hint: '',
    extra: '',
    source: '', // Embasamento
    learn_more: '', // Saiba mais
    // Campos específicos por tipo
    question: '',
    answer: '',
    statement: '',
    is_true: false,
    options: [],
    correct_option: '',
    explanation: '',
    // Outros
    header: '',
    comments: '',
    images: []
  });
  
  // Carregar decks do usuário e categorias
  useEffect(() => {
    loadUserDecks();
    loadCategories();
    
    // Se veio de um deck específico
    const deckParam = searchParams.get('deck');
    if (deckParam === 'current') {
      // TODO: pegar o ID do deck atual
    }
  }, []);
  
  const loadUserDecks = async () => {
    try {
      const response = await flashcardDeckService.getDecks({
        author_id: user?.id,
        limit: 100
      });
      setUserDecks(response.data);
    } catch (error) {
      console.error('Erro ao carregar decks:', error);
    }
  };
  
  const loadCategories = async () => {
    try {
      const data = await categoryService.getAll();
      setCategories(data);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    }
  };
  
  // Funções de categoria
  const findCategoryById = (id: string, cats: Category[] = categories): Category | null => {
    for (const cat of cats) {
      if (cat.id === id) return cat;
      if (cat.children) {
        const found = findCategoryById(id, cat.children);
        if (found) return found;
      }
    }
    return null;
  };
  
  const toggleCategoryExpansion = (categoryId: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };
  
  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev => {
      const isSelected = prev.includes(categoryId);
      return isSelected 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId];
    });
  };
  
  // Gerenciamento de tags
  const addTag = () => {
    if (!newTag.trim()) return;
    if (formData.tags.includes(newTag)) {
      toast.error('Tag já adicionada');
      return;
    }
    setFormData(prev => ({
      ...prev,
      tags: [...prev.tags, newTag.trim()]
    }));
    setNewTag('');
  };
  
  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };
  
  // Validar formulário
  const validateForm = (): string[] => {
    const errors: string[] = [];
    
    if (selectedCategories.length === 0) {
      errors.push('Selecione uma categoria');
    }
    
    // Validação específica por tipo
    switch (formData.type) {
      case 'basic':
      case 'basic_reversed':
        if (!formData.front) errors.push('Frente do card é obrigatória');
        if (!formData.back) errors.push('Verso do card é obrigatório');
        break;
      case 'cloze':
        if (!formData.front || !formData.front.includes('{{c')) {
          errors.push('Texto com lacunas é obrigatório');
        }
        break;
      case 'multiple_choice':
        if (!formData.question) errors.push('Pergunta é obrigatória');
        const validOptions = mcOptions.filter(opt => opt.trim());
        if (validOptions.length < 2) errors.push('Adicione pelo menos 2 opções');
        break;
      case 'true_false':
        if (!formData.statement) errors.push('Afirmação é obrigatória');
        break;
      case 'type_answer':
        if (!formData.question) errors.push('Pergunta é obrigatória');
        if (!formData.answer) errors.push('Resposta é obrigatória');
        break;
      case 'image_occlusion':
        if (!formData.images || formData.images.length === 0) {
          errors.push('Adicione uma imagem');
        }
        break;
    }
    
    return errors;
  };
  
  // Salvar flashcard
  const handleSave = async () => {
    const errors = validateForm();
    if (errors.length > 0) {
      errors.forEach(err => toast.error(err));
      return;
    }
    
    setIsLoading(true);
    try {
      // Preparar dados do flashcard
      const flashcardData: CreateFlashcardData = {
        ...formData,
        author_id: user?.id,
        author_name: user?.name,
        deck_id: selectedDeckId,
        category: selectedCategories[0] ? findCategoryById(selectedCategories[0])?.name || '' : '',
        subcategory: selectedCategories[1] ? findCategoryById(selectedCategories[1])?.name : undefined,
        // Para múltipla escolha
        options: formData.type === 'multiple_choice' ? mcOptions.filter(opt => opt.trim()) : undefined,
        correct_option: formData.type === 'multiple_choice' ? mcOptions[correctOption] : undefined,
        // Metadados
        metadata: {
          owner_type: 'student',
          embasamento: formData.source,
          saiba_mais: formData.learn_more,
          dica: formData.hint
        }
      };
      
      await flashcardService.createFlashcard(flashcardData);
      toast.success('Flashcard criado com sucesso!');
      
      // Redirecionar
      if (selectedDeckId) {
        navigate(`/student/decks/${selectedDeckId}/edit`);
      } else {
        navigate('/student/my-flashcards');
      }
    } catch (error) {
      console.error('Erro ao criar flashcard:', error);
      toast.error('Erro ao criar flashcard');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Carregar exemplo baseado no tipo
  const loadExample = () => {
    const examples: Record<FlashcardType, Partial<CreateFlashcardData>> = {
      basic: {
        front: 'Qual é o prazo para interpor recurso ordinário?',
        back: '15 dias úteis',
        hint: 'Pense no prazo geral dos recursos trabalhistas',
        source: 'Art. 895 da CLT',
        learn_more: 'O recurso ordinário é cabível das decisões definitivas ou terminativas das Varas e Juízos',
        tags: ['direito', 'recursos', 'prazos']
      },
      basic_reversed: {
        front: '15 dias úteis',
        back: 'Prazo para interpor recurso ordinário',
        extra: 'Este prazo é contado em dias úteis conforme legislação trabalhista',
        source: 'Art. 895 da CLT',
        tags: ['direito', 'recursos', 'prazos']
      },
      cloze: {
        front: 'O prazo para interpor recurso ordinário é de {{c1::15}} dias {{c2::úteis}}',
        back: 'Conforme art. 895 da CLT',
        source: 'Consolidação das Leis do Trabalho',
        tags: ['direito', 'recursos']
      },
      multiple_choice: {
        question: 'Qual é o prazo para interpor recurso ordinário?',
        explanation: 'Conforme art. 895 da CLT, o prazo é de 15 dias úteis',
        source: 'CLT - Consolidação das Leis do Trabalho',
        tags: ['direito', 'recursos']
      },
      true_false: {
        statement: 'O prazo para recurso ordinário é de 15 dias corridos',
        is_true: false,
        explanation: 'FALSO. O prazo é de 15 dias ÚTEIS, não corridos',
        source: 'Art. 895 da CLT',
        tags: ['direito', 'recursos']
      },
      type_answer: {
        question: 'Digite o prazo em dias úteis para interpor recurso ordinário',
        answer: '15',
        hint: 'Número de dias úteis apenas',
        source: 'Art. 895 da CLT',
        tags: ['direito', 'recursos']
      },
      image_occlusion: {
        source: 'Material de estudo',
        tags: ['visual', 'mapas']
      }
    };
    
    const example = examples[formData.type];
    if (example) {
      setFormData(prev => ({
        ...prev,
        ...example
      }));
      
      // Para múltipla escolha, definir as opções
      if (formData.type === 'multiple_choice') {
        setMcOptions(['10 dias úteis', '15 dias úteis', '20 dias úteis', '30 dias corridos']);
        setCorrectOption(1); // Segunda opção é a correta
      }
      
      toast.success('Exemplo carregado!');
    }
  };
  
  // Filtered categories for search
  const filteredCategories = categorySearch
    ? categories.filter(cat => 
        cat.name.toLowerCase().includes(categorySearch.toLowerCase()) ||
        (cat.children && cat.children.some(child => 
          child.name.toLowerCase().includes(categorySearch.toLowerCase())
        ))
      )
    : categories;
  
  // Renderizar árvore de categorias
  const renderCategoryTree = (cats: Category[], level = 0): JSX.Element[] => {
    return cats.map(category => {
      const hasChildren = category.children && category.children.length > 0;
      const isExpanded = expandedCategories.includes(category.id);
      const isSelected = selectedCategories.includes(category.id);
      
      return (
        <div key={category.id}>
          <div
            className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all
              ${isSelected ? 'bg-accent-500/20 text-accent-600 dark:text-accent-500 font-semibold' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}
            `}
            style={{ paddingLeft: `${level * 20 + 12}px` }}
            onClick={() => handleCategoryToggle(category.id)}
          >
            {hasChildren && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleCategoryExpansion(category.id);
                }}
                className="p-0.5"
              >
                {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            )}
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => {}}
              className="w-4 h-4 text-accent-500 rounded"
            />
            <span className="font-police-body uppercase tracking-wider text-sm">
              {category.name}
            </span>
          </div>
          {hasChildren && isExpanded && renderCategoryTree(category.children!, level + 1)}
        </div>
      );
    });
  };
  
  // Renderizar conteúdo por etapa
  const renderStepContent = () => {
    switch (currentStep) {
      case 1: // Tipo e Deck
        return (
          <div className="space-y-6">
            <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="font-police-title uppercase tracking-wider flex items-center gap-3">
                  <Brain className="w-6 h-6 text-accent-500" />
                  ESCOLHER TIPO DE FLASHCARD
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {flashcardTypes.map(type => (
                    <button
                      key={type.value}
                      onClick={() => setFormData(prev => ({ ...prev, type: type.value }))}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        formData.type === type.value
                          ? 'border-accent-500 bg-accent-500/10'
                          : 'border-gray-200 dark:border-gray-700 hover:border-accent-500/50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`${type.color} text-white p-2 rounded-lg`}>
                          {type.icon}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-police-subtitle font-semibold uppercase tracking-wider">
                            {type.label}
                          </h4>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            {type.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="font-police-title uppercase tracking-wider flex items-center gap-3">
                  <Package className="w-6 h-6 text-accent-500" />
                  ADICIONAR A UM DECK (OPCIONAL)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 font-police-body">
                  Você pode adicionar este flashcard a um dos seus decks existentes ou criar ele avulso.
                </p>
                
                {userDecks.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <Package className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400 font-police-body">
                      Você ainda não tem decks criados
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => navigate('/student/decks/new')}
                      className="mt-4"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      CRIAR PRIMEIRO DECK
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <button
                      onClick={() => setSelectedDeckId(null)}
                      className={`w-full p-3 rounded-lg border text-left transition-all ${
                        selectedDeckId === null
                          ? 'border-accent-500 bg-accent-500/10'
                          : 'border-gray-200 dark:border-gray-700 hover:border-accent-500/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          checked={selectedDeckId === null}
                          onChange={() => {}}
                          className="w-4 h-4 text-accent-500"
                        />
                        <div>
                          <p className="font-medium">SEM DECK (AVULSO)</p>
                          <p className="text-xs text-gray-500">Flashcard independente</p>
                        </div>
                      </div>
                    </button>
                    
                    {userDecks.map(deck => (
                      <button
                        key={deck.id}
                        onClick={() => setSelectedDeckId(deck.id)}
                        className={`w-full p-3 rounded-lg border text-left transition-all ${
                          selectedDeckId === deck.id
                            ? 'border-accent-500 bg-accent-500/10'
                            : 'border-gray-200 dark:border-gray-700 hover:border-accent-500/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            checked={selectedDeckId === deck.id}
                            onChange={() => {}}
                            className="w-4 h-4 text-accent-500"
                          />
                          <div className="flex-1">
                            <p className="font-medium">{deck.name}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-gray-500">{deck.category}</span>
                              <span className="text-xs text-gray-400">•</span>
                              <span className="text-xs text-gray-500">{deck.flashcard_count || 0} cards</span>
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );
        
      case 2: // Conteúdo Principal
        return (
          <div className="space-y-6">
            <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="font-police-title uppercase tracking-wider flex items-center gap-3">
                  <FileText className="w-6 h-6 text-accent-500" />
                  CONTEÚDO DO FLASHCARD
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Categoria */}
                <div>
                  <label className="block text-sm font-police-subtitle uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">
                    Categoria *
                  </label>
                  <button
                    type="button"
                    onClick={() => setCategoryModalOpen(true)}
                    className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-800 text-left font-police-body transition-all flex items-center justify-between ${
                      selectedCategories.length > 0
                        ? 'border-accent-500 text-accent-600 dark:text-accent-500'
                        : 'border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Layers className="w-4 h-4" />
                      {selectedCategories.length === 0
                        ? 'Selecione uma categoria'
                        : selectedCategories.map(id => findCategoryById(id)?.name).join(' > ')
                      }
                    </span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
                
                {/* Campos específicos por tipo */}
                {(formData.type === 'basic' || formData.type === 'basic_reversed') && (
                  <>
                    <div>
                      <label className="block text-sm font-police-subtitle uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">
                        Frente do Card *
                      </label>
                      <textarea
                        value={formData.front}
                        onChange={(e) => setFormData(prev => ({ ...prev, front: e.target.value }))}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-police-body focus:ring-2 focus:ring-accent-500"
                        placeholder="Digite a pergunta ou conceito..."
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-police-subtitle uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">
                        Verso do Card *
                      </label>
                      <textarea
                        value={formData.back}
                        onChange={(e) => setFormData(prev => ({ ...prev, back: e.target.value }))}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-police-body focus:ring-2 focus:ring-accent-500"
                        placeholder="Digite a resposta..."
                      />
                    </div>
                    
                    {formData.type === 'basic_reversed' && (
                      <div>
                        <label className="block text-sm font-police-subtitle uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">
                          Informação Extra (para cartão reverso)
                        </label>
                        <textarea
                          value={formData.extra}
                          onChange={(e) => setFormData(prev => ({ ...prev, extra: e.target.value }))}
                          rows={2}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-police-body focus:ring-2 focus:ring-accent-500"
                          placeholder="Informação adicional..."
                        />
                      </div>
                    )}
                  </>
                )}
                
                {formData.type === 'cloze' && (
                  <div>
                    <label className="block text-sm font-police-subtitle uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">
                      Texto com Lacunas *
                    </label>
                    <ClozeEditor
                      value={formData.front}
                      onChange={(value) => setFormData(prev => ({ ...prev, front: value }))}
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Use {{c1::texto}} para criar lacunas
                    </p>
                  </div>
                )}
                
                {formData.type === 'multiple_choice' && (
                  <>
                    <div>
                      <label className="block text-sm font-police-subtitle uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">
                        Pergunta *
                      </label>
                      <textarea
                        value={formData.question}
                        onChange={(e) => setFormData(prev => ({ ...prev, question: e.target.value }))}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-police-body focus:ring-2 focus:ring-accent-500"
                        placeholder="Digite a pergunta..."
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-police-subtitle uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">
                        Opções *
                      </label>
                      <div className="space-y-2">
                        {mcOptions.map((option, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <input
                              type="radio"
                              checked={correctOption === index}
                              onChange={() => setCorrectOption(index)}
                              className="w-4 h-4 text-accent-500"
                            />
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => {
                                const newOptions = [...mcOptions];
                                newOptions[index] = e.target.value;
                                setMcOptions(newOptions);
                              }}
                              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-police-body"
                              placeholder={`Opção ${index + 1}`}
                            />
                            {correctOption === index && (
                              <Badge className="bg-green-500 text-white">CORRETA</Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-police-subtitle uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">
                        Explicação
                      </label>
                      <textarea
                        value={formData.explanation}
                        onChange={(e) => setFormData(prev => ({ ...prev, explanation: e.target.value }))}
                        rows={2}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-police-body focus:ring-2 focus:ring-accent-500"
                        placeholder="Explique por que esta é a resposta correta..."
                      />
                    </div>
                  </>
                )}
                
                {formData.type === 'true_false' && (
                  <>
                    <div>
                      <label className="block text-sm font-police-subtitle uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">
                        Afirmação *
                      </label>
                      <textarea
                        value={formData.statement}
                        onChange={(e) => setFormData(prev => ({ ...prev, statement: e.target.value }))}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-police-body focus:ring-2 focus:ring-accent-500"
                        placeholder="Digite a afirmação..."
                      />
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          checked={formData.is_true === true}
                          onChange={() => setFormData(prev => ({ ...prev, is_true: true }))}
                          className="w-4 h-4 text-accent-500"
                        />
                        <span className="font-police-body uppercase tracking-wider">VERDADEIRO</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          checked={formData.is_true === false}
                          onChange={() => setFormData(prev => ({ ...prev, is_true: false }))}
                          className="w-4 h-4 text-accent-500"
                        />
                        <span className="font-police-body uppercase tracking-wider">FALSO</span>
                      </label>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-police-subtitle uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">
                        Explicação
                      </label>
                      <textarea
                        value={formData.explanation}
                        onChange={(e) => setFormData(prev => ({ ...prev, explanation: e.target.value }))}
                        rows={2}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-police-body focus:ring-2 focus:ring-accent-500"
                        placeholder="Explique por que é verdadeiro ou falso..."
                      />
                    </div>
                  </>
                )}
                
                {formData.type === 'type_answer' && (
                  <>
                    <div>
                      <label className="block text-sm font-police-subtitle uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">
                        Pergunta *
                      </label>
                      <textarea
                        value={formData.question}
                        onChange={(e) => setFormData(prev => ({ ...prev, question: e.target.value }))}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-police-body focus:ring-2 focus:ring-accent-500"
                        placeholder="Digite a pergunta..."
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-police-subtitle uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">
                        Resposta Correta *
                      </label>
                      <input
                        type="text"
                        value={formData.answer}
                        onChange={(e) => setFormData(prev => ({ ...prev, answer: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-police-body focus:ring-2 focus:ring-accent-500"
                        placeholder="Digite a resposta exata..."
                      />
                    </div>
                  </>
                )}
                
                {formData.type === 'image_occlusion' && (
                  <div>
                    <label className="block text-sm font-police-subtitle uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">
                      Imagem *
                    </label>
                    <ImageOcclusionEditor
                      imageUrl={formData.images?.[0] || ''}
                      areas={[]}
                      onAreasChange={() => {}}
                      onImageUpload={(url) => setFormData(prev => ({ ...prev, images: [url] }))}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );
        
      case 3: // Campos Extras
        return (
          <div className="space-y-6">
            <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="font-police-title uppercase tracking-wider flex items-center gap-3">
                  <Info className="w-6 h-6 text-accent-500" />
                  INFORMAÇÕES COMPLEMENTARES
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Dica */}
                <div>
                  <label className="block text-sm font-police-subtitle uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-yellow-500" />
                    DICA
                  </label>
                  <textarea
                    value={formData.hint}
                    onChange={(e) => setFormData(prev => ({ ...prev, hint: e.target.value }))}
                    rows={2}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-police-body focus:ring-2 focus:ring-accent-500"
                    placeholder="Adicione uma dica para ajudar na memorização..."
                  />
                </div>
                
                {/* Embasamento */}
                <div>
                  <label className="block text-sm font-police-subtitle uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-blue-500" />
                    EMBASAMENTO
                  </label>
                  <textarea
                    value={formData.source}
                    onChange={(e) => setFormData(prev => ({ ...prev, source: e.target.value }))}
                    rows={2}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-police-body focus:ring-2 focus:ring-accent-500"
                    placeholder="Fonte ou referência do conteúdo (ex: Art. 5º da CF, página 123 do livro X)..."
                  />
                </div>
                
                {/* Saiba Mais */}
                <div>
                  <label className="block text-sm font-police-subtitle uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <Link2 className="w-4 h-4 text-purple-500" />
                    SAIBA MAIS
                  </label>
                  <textarea
                    value={formData.learn_more}
                    onChange={(e) => setFormData(prev => ({ ...prev, learn_more: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-police-body focus:ring-2 focus:ring-accent-500"
                    placeholder="Informações adicionais, curiosidades ou links para aprofundamento..."
                  />
                </div>
                
                {/* Dificuldade */}
                <div>
                  <label className="block text-sm font-police-subtitle uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <Target className="w-4 h-4 text-orange-500" />
                    DIFICULDADE
                  </label>
                  <div className="flex gap-2">
                    {difficultyLevels.map(level => (
                      <button
                        key={level.value}
                        onClick={() => setFormData(prev => ({ ...prev, difficulty: level.value as any }))}
                        className={`flex-1 px-4 py-3 rounded-lg font-police-body uppercase tracking-wider transition-all ${
                          formData.difficulty === level.value
                            ? `${level.color} text-white`
                            : 'border border-gray-300 dark:border-gray-600 hover:border-accent-500'
                        }`}
                      >
                        {level.label}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Tags */}
                <div>
                  <label className="block text-sm font-police-subtitle uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <Tag className="w-4 h-4 text-indigo-500" />
                    TAGS
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-police-body"
                      placeholder="Digite uma tag e pressione Enter..."
                    />
                    <Button
                      onClick={addTag}
                      className="bg-accent-500 hover:bg-accent-600 text-black"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <Badge
                        key={index}
                        className="bg-accent-500/20 text-accent-700 dark:text-accent-300 border border-accent-500/30"
                      >
                        <Hash className="w-3 h-3 mr-1" />
                        {tag}
                        <button
                          onClick={() => removeTag(tag)}
                          className="ml-2 text-accent-600 hover:text-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
                
                {/* Privacidade */}
                <div>
                  <label className="block text-sm font-police-subtitle uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">
                    PRIVACIDADE
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setFormData(prev => ({ ...prev, status: 'draft' }))}
                      className={`flex-1 px-4 py-3 rounded-lg font-police-body uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                        formData.status === 'draft'
                          ? 'bg-gray-600 text-white'
                          : 'border border-gray-300 dark:border-gray-600 hover:border-accent-500'
                      }`}
                    >
                      <Lock className="w-4 h-4" />
                      PRIVADO
                    </button>
                    <button
                      onClick={() => setFormData(prev => ({ ...prev, status: 'published' }))}
                      className={`flex-1 px-4 py-3 rounded-lg font-police-body uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                        formData.status === 'published'
                          ? 'bg-green-600 text-white'
                          : 'border border-gray-300 dark:border-gray-600 hover:border-accent-500'
                      }`}
                    >
                      <Globe className="w-4 h-4" />
                      PÚBLICO
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-2">
                    <Info className="w-3 h-3" />
                    {formData.status === 'draft' 
                      ? 'Este flashcard será visível apenas para você'
                      : 'Este flashcard será compartilhado com a comunidade'
                    }
                  </p>
                </div>
              </CardContent>
            </Card>
            
            {/* Campos Personalizados (futuro) */}
            <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm opacity-50">
              <CardHeader>
                <CardTitle className="font-police-title uppercase tracking-wider flex items-center gap-3">
                  <Plus className="w-6 h-6 text-accent-500" />
                  CAMPOS EXTRAS PERSONALIZADOS
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <HelpCircle className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                  <p className="font-police-body uppercase tracking-wider">
                    Em breve: adicione campos personalizados
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        );
    }
  };
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/student/my-flashcards')}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              VOLTAR
            </Button>
            <div>
              <h1 className="text-3xl font-police-title uppercase tracking-wider text-gray-900 dark:text-white">
                CRIAR FLASHCARD
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1 font-police-body">
                Crie seu próprio material de estudo
              </p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button
              onClick={loadExample}
              variant="outline"
              className="gap-2 font-police-body uppercase tracking-wider"
            >
              <Brain className="w-4 h-4" />
              CARREGAR EXEMPLO
            </Button>
            <Button
              onClick={() => setShowPreview(true)}
              variant="outline"
              className="gap-2 font-police-body uppercase tracking-wider"
            >
              <Eye className="w-4 h-4" />
              PREVIEW
            </Button>
          </div>
        </div>
      </motion.div>
      
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex-1 flex items-center">
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center font-bold
                ${currentStep >= step 
                  ? 'bg-accent-500 text-black' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
                }
              `}>
                {currentStep > step ? <CheckCircle className="w-5 h-5" /> : step}
              </div>
              {step < 3 && (
                <div className={`flex-1 h-1 mx-2 ${
                  currentStep > step ? 'bg-accent-500' : 'bg-gray-200 dark:bg-gray-700'
                }`} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-xs font-police-body uppercase">Tipo & Deck</span>
          <span className="text-xs font-police-body uppercase">Conteúdo</span>
          <span className="text-xs font-police-body uppercase">Complementos</span>
        </div>
      </div>
      
      {/* Step Content */}
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
      >
        {renderStepContent()}
      </motion.div>
      
      {/* Navigation */}
      <div className="mt-8 flex justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
          disabled={currentStep === 1}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          ANTERIOR
        </Button>
        
        <div className="flex gap-4">
          {currentStep < totalSteps ? (
            <Button
              onClick={() => setCurrentStep(prev => Math.min(totalSteps, prev + 1))}
              className="bg-accent-500 hover:bg-accent-600 text-black gap-2"
            >
              PRÓXIMO
              <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSave}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700 text-white gap-2"
            >
              {isLoading ? (
                <>
                  <Brain className="w-4 h-4 animate-pulse" />
                  SALVANDO...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  CRIAR FLASHCARD
                </>
              )}
            </Button>
          )}
        </div>
      </div>
      
      {/* Preview Modal */}
      {showPreview && (
        <FlashcardPreviewModal
          flashcard={{
            ...formData,
            id: 'preview',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            author_id: user?.id || '',
            author_name: user?.name || '',
            correct_count: 0,
            incorrect_count: 0,
            ease_factor: 2.5,
            interval: 0,
            repetitions: 0,
            next_review_date: new Date().toISOString()
          }}
          onClose={() => setShowPreview(false)}
          onEdit={() => setShowPreview(false)}
        />
      )}
      
      {/* Category Modal */}
      {categoryModalOpen && (
        <motion.div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={(e) => e.target === e.currentTarget && setCategoryModalOpen(false)}
        >
          <motion.div 
            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
          >
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-police-title uppercase tracking-wider">
                SELECIONAR CATEGORIA
              </h2>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Buscar categorias..."
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
                />
              </div>
              
              <div className="max-h-96 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                {renderCategoryTree(filteredCategories)}
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setCategoryModalOpen(false)}
              >
                CANCELAR
              </Button>
              <Button
                onClick={() => setCategoryModalOpen(false)}
                className="bg-accent-500 hover:bg-accent-600 text-black"
              >
                CONFIRMAR
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}