import { useState, useEffect } from 'react';
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
  ChevronDown,
  Upload,
  Download,
  Package,
  Layers,
  Hash,
  Info,
  Search
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { categoryService, Category } from '@/services/categoryService';
import { flashcardDeckService, CreateDeckData } from '@/services/flashcardDeckService';
import { flashcardService, Flashcard } from '@/services/flashcardService';
import { useAuthStore } from '@/store/authStore';
import AnkiImportExport from '@/components/AnkiImportExport';
import toast from 'react-hot-toast';

// Interface para tópicos e subtópicos
interface Topic {
  id: string;
  name: string;
  description?: string;
  subtopics: Topic[];
  isExpanded?: boolean;
  isEditing?: boolean;
}

export default function NewStudentDeck() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4; // Informações Básicas, Estrutura, Flashcards, Revisão
  const [isLoading, setIsLoading] = useState(false);
  
  // Categories state
  const [categories, setCategories] = useState<Category[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');
  
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
    privacy: 'private' as 'private' | 'public',
    tags: [] as string[],
    topics: [] as Topic[],
    flashcardIds: [] as string[]
  });
  
  // Topics management
  const [newTopicName, setNewTopicName] = useState('');
  const [newTopicDescription, setNewTopicDescription] = useState('');
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  
  // Flashcards state
  const [availableFlashcards, setAvailableFlashcards] = useState<Flashcard[]>([]);
  const [selectedFlashcards, setSelectedFlashcards] = useState<string[]>([]);
  const [flashcardSearch, setFlashcardSearch] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);
  const [importSource, setImportSource] = useState<'system' | 'anki' | null>(null);
  
  // Tags
  const [newTag, setNewTag] = useState('');
  
  // Load categories on mount
  useEffect(() => {
    loadCategories();
    loadAvailableFlashcards();
  }, []);
  
  const loadCategories = async () => {
    try {
      const data = await categoryService.getAll();
      setCategories(data);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
      toast.error('Erro ao carregar categorias');
    }
  };
  
  const loadAvailableFlashcards = async () => {
    try {
      // Carregar flashcards do sistema e do próprio usuário
      const response = await flashcardService.getFlashcards({
        author_id: user?.id,
        limit: 100
      });
      setAvailableFlashcards(response.data);
    } catch (error) {
      console.error('Erro ao carregar flashcards:', error);
    }
  };
  
  // Category selection functions
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
  
  // Topics management
  const addTopic = () => {
    if (!newTopicName.trim()) {
      toast.error('Digite o nome do tópico');
      return;
    }
    
    const newTopic: Topic = {
      id: Date.now().toString(),
      name: newTopicName,
      description: newTopicDescription,
      subtopics: [],
      isExpanded: false
    };
    
    if (selectedTopicId) {
      // Add as subtopic
      setFormData(prev => ({
        ...prev,
        topics: addSubtopic(prev.topics, selectedTopicId, newTopic)
      }));
    } else {
      // Add as main topic
      setFormData(prev => ({
        ...prev,
        topics: [...prev.topics, newTopic]
      }));
    }
    
    setNewTopicName('');
    setNewTopicDescription('');
    setSelectedTopicId(null);
  };
  
  const addSubtopic = (topics: Topic[], parentId: string, newTopic: Topic): Topic[] => {
    return topics.map(topic => {
      if (topic.id === parentId) {
        return { ...topic, subtopics: [...topic.subtopics, newTopic] };
      }
      if (topic.subtopics.length > 0) {
        return { ...topic, subtopics: addSubtopic(topic.subtopics, parentId, newTopic) };
      }
      return topic;
    });
  };
  
  const removeTopic = (topicId: string) => {
    setFormData(prev => ({
      ...prev,
      topics: removeTopicFromTree(prev.topics, topicId)
    }));
  };
  
  const removeTopicFromTree = (topics: Topic[], topicId: string): Topic[] => {
    return topics
      .filter(topic => topic.id !== topicId)
      .map(topic => ({
        ...topic,
        subtopics: removeTopicFromTree(topic.subtopics, topicId)
      }));
  };
  
  const renderTopicsTree = (topics: Topic[], level = 0): JSX.Element[] => {
    return topics.map(topic => (
      <div key={topic.id} style={{ marginLeft: `${level * 20}px` }}>
        <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
          <button
            type="button"
            onClick={() => setFormData(prev => ({
              ...prev,
              topics: toggleTopicExpansion(prev.topics, topic.id)
            }))}
            className="p-0.5"
          >
            {topic.subtopics.length > 0 && (
              topic.isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
            )}
          </button>
          <Folder className="w-4 h-4 text-accent-500" />
          <span className="flex-1 font-police-body">{topic.name}</span>
          <button
            type="button"
            onClick={() => setSelectedTopicId(topic.id)}
            className="p-1 hover:bg-accent-500/20 rounded"
            title="Adicionar subtópico"
          >
            <Plus className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={() => removeTopic(topic.id)}
            className="p-1 hover:bg-red-500/20 rounded text-red-600"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
        {topic.isExpanded && renderTopicsTree(topic.subtopics, level + 1)}
      </div>
    ));
  };
  
  const toggleTopicExpansion = (topics: Topic[], topicId: string): Topic[] => {
    return topics.map(topic => {
      if (topic.id === topicId) {
        return { ...topic, isExpanded: !topic.isExpanded };
      }
      if (topic.subtopics.length > 0) {
        return { ...topic, subtopics: toggleTopicExpansion(topic.subtopics, topicId) };
      }
      return topic;
    });
  };
  
  // Tags management
  const addTag = () => {
    if (!newTag.trim()) return;
    if (formData.tags.includes(newTag)) {
      toast.error('Tag já adicionada');
      return;
    }
    setFormData(prev => ({
      ...prev,
      tags: [...prev.tags, newTag]
    }));
    setNewTag('');
  };
  
  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };
  
  // Flashcard selection
  const toggleFlashcardSelection = (flashcardId: string) => {
    setSelectedFlashcards(prev => {
      const isSelected = prev.includes(flashcardId);
      return isSelected
        ? prev.filter(id => id !== flashcardId)
        : [...prev, flashcardId];
    });
  };
  
  // Save deck
  const handleSave = async () => {
    // Validações
    if (!formData.name.trim()) {
      toast.error('Nome do deck é obrigatório');
      return;
    }
    
    if (selectedCategories.length === 0) {
      toast.error('Selecione pelo menos uma matéria');
      return;
    }
    
    setIsLoading(true);
    try {
      const deckData: CreateDeckData = {
        name: formData.name,
        description: formData.description,
        category: findCategoryById(selectedCategories[0])?.name || '',
        subcategory: selectedCategories[1] ? findCategoryById(selectedCategories[1])?.name : undefined,
        difficulty: formData.difficulty,
        tags: formData.tags,
        is_public: formData.privacy === 'public',
        flashcard_ids: selectedFlashcards,
        author_id: user?.id,
        author_name: user?.name,
        // Adicionar estrutura de tópicos como metadata
        metadata: {
          topics: formData.topics,
          owner_type: 'student' // Indicar que é deck criado por aluno
        }
      };
      
      await flashcardDeckService.createDeck(deckData);
      toast.success('Deck criado com sucesso!');
      navigate('/student/my-flashcards?tab=decks');
    } catch (error) {
      console.error('Erro ao criar deck:', error);
      toast.error('Erro ao criar deck');
    } finally {
      setIsLoading(false);
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
  
  // Render category tree for modal
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
  
  const renderStepContent = () => {
    switch (currentStep) {
      case 1: // Informações Básicas
        return (
          <div className="space-y-6">
            <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="font-police-title uppercase tracking-wider flex items-center gap-3">
                  <BookOpen className="w-6 h-6 text-accent-500" />
                  INFORMAÇÕES DO DECK
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-police-subtitle uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">
                    Nome do Deck *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-police-body focus:ring-2 focus:ring-accent-500"
                    placeholder="Ex: Direito Constitucional - Art. 5º"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-police-subtitle uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">
                    Matéria *
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
                        ? 'Selecione uma matéria'
                        : selectedCategories.map(id => findCategoryById(id)?.name).join(' > ')
                      }
                    </span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
                
                <div>
                  <label className="block text-sm font-police-subtitle uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">
                    Descrição
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-police-body focus:ring-2 focus:ring-accent-500"
                    placeholder="Descreva o conteúdo e objetivo do deck..."
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-police-subtitle uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">
                      Nível
                    </label>
                    <select
                      value={formData.difficulty}
                      onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value as any }))}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-police-body focus:ring-2 focus:ring-accent-500"
                    >
                      <option value="easy">BÁSICO</option>
                      <option value="medium">INTERMEDIÁRIO</option>
                      <option value="hard">AVANÇADO</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-police-subtitle uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">
                      Privacidade
                    </label>
                    <select
                      value={formData.privacy}
                      onChange={(e) => setFormData(prev => ({ ...prev, privacy: e.target.value as any }))}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-police-body focus:ring-2 focus:ring-accent-500"
                    >
                      <option value="private">PRIVADO (só você pode ver)</option>
                      <option value="public">PÚBLICO (compartilhar com a comunidade)</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm text-blue-700 dark:text-blue-300 font-police-body">
                    {formData.privacy === 'private' ? (
                      <Lock className="inline w-4 h-4 mr-1" />
                    ) : (
                      <Globe className="inline w-4 h-4 mr-1" />
                    )}
                    {formData.privacy === 'private' 
                      ? 'Este deck será visível apenas para você'
                      : 'Este deck será compartilhado com outros estudantes'
                    }
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        );
        
      case 2: // Estrutura (Tópicos e Subtópicos)
        return (
          <div className="space-y-6">
            <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="font-police-title uppercase tracking-wider flex items-center gap-3">
                  <FolderPlus className="w-6 h-6 text-accent-500" />
                  ESTRUTURA DO DECK
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTopicName}
                    onChange={(e) => setNewTopicName(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-police-body"
                    placeholder={selectedTopicId ? "Nome do subtópico..." : "Nome do tópico..."}
                  />
                  <Button
                    onClick={addTopic}
                    className="bg-accent-500 hover:bg-accent-600 text-black font-police-body"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {selectedTopicId ? 'ADICIONAR SUBTÓPICO' : 'ADICIONAR TÓPICO'}
                  </Button>
                  {selectedTopicId && (
                    <Button
                      variant="outline"
                      onClick={() => setSelectedTopicId(null)}
                      className="font-police-body"
                    >
                      CANCELAR
                    </Button>
                  )}
                </div>
                
                {selectedTopicId && (
                  <div className="p-3 bg-accent-500/10 rounded-lg">
                    <span className="text-sm font-police-body text-accent-600 dark:text-accent-400">
                      Adicionando subtópico em: {formData.topics.find(t => t.id === selectedTopicId)?.name}
                    </span>
                  </div>
                )}
                
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 min-h-[200px]">
                  {formData.topics.length === 0 ? (
                    <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                      <Folder className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                      <p className="font-police-body uppercase tracking-wider">
                        Nenhum tópico adicionado
                      </p>
                      <p className="text-sm mt-1">
                        Adicione tópicos para organizar seu deck
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {renderTopicsTree(formData.topics)}
                    </div>
                  )}
                </div>
                
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 font-police-body">
                    <AlertCircle className="inline w-4 h-4 mr-1" />
                    Os tópicos ajudam a organizar o conteúdo do deck. Você pode adicionar quantos níveis de subtópicos precisar.
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="font-police-title uppercase tracking-wider flex items-center gap-3">
                  <Tag className="w-6 h-6 text-accent-500" />
                  TAGS
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-police-body"
                    placeholder="Digite uma tag e pressione Enter..."
                  />
                  <Button
                    onClick={addTag}
                    className="bg-accent-500 hover:bg-accent-600 text-black font-police-body"
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
                  {formData.tags.length === 0 && (
                    <span className="text-gray-400 dark:text-gray-500 text-sm font-police-body">
                      Nenhuma tag adicionada
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        );
        
      case 3: // Flashcards
        return (
          <div className="space-y-6">
            <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="font-police-title uppercase tracking-wider flex items-center gap-3">
                  <Brain className="w-6 h-6 text-accent-500" />
                  ADICIONAR FLASHCARDS
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button
                    onClick={() => navigate('/student/flashcards/new?deck=current')}
                    className="bg-accent-500 hover:bg-accent-600 text-black font-police-body h-24 flex-col gap-2"
                  >
                    <Plus className="w-6 h-6" />
                    <span>CRIAR NOVO</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowImportModal(true);
                      setImportSource('system');
                    }}
                    className="font-police-body h-24 flex-col gap-2"
                  >
                    <Download className="w-6 h-6" />
                    <span>IMPORTAR DO SISTEMA</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowImportModal(true);
                      setImportSource('anki');
                    }}
                    className="font-police-body h-24 flex-col gap-2"
                  >
                    <Upload className="w-6 h-6" />
                    <span>IMPORTAR DO ANKI</span>
                  </Button>
                </div>
                
                {/* Seleção de flashcards existentes */}
                {importSource === 'system' && showImportModal && (
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="mb-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="text"
                          value={flashcardSearch}
                          onChange={(e) => setFlashcardSearch(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                          placeholder="Buscar flashcards..."
                        />
                      </div>
                    </div>
                    
                    <div className="max-h-96 overflow-y-auto space-y-2">
                      {availableFlashcards
                        .filter(card => 
                          card.front.toLowerCase().includes(flashcardSearch.toLowerCase()) ||
                          card.back?.toLowerCase().includes(flashcardSearch.toLowerCase())
                        )
                        .map(card => (
                          <div
                            key={card.id}
                            onClick={() => toggleFlashcardSelection(card.id)}
                            className={`p-3 rounded-lg border cursor-pointer transition-all ${
                              selectedFlashcards.includes(card.id)
                                ? 'border-accent-500 bg-accent-500/10'
                                : 'border-gray-200 dark:border-gray-700 hover:border-accent-500/50'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <input
                                type="checkbox"
                                checked={selectedFlashcards.includes(card.id)}
                                onChange={() => {}}
                                className="mt-1 w-4 h-4 text-accent-500 rounded"
                              />
                              <div className="flex-1">
                                <p className="font-medium text-sm">{card.front}</p>
                                <p className="text-xs text-gray-500 mt-1">{card.back}</p>
                                <div className="flex gap-2 mt-2">
                                  <Badge variant="secondary" className="text-xs">
                                    {card.type}
                                  </Badge>
                                  <Badge variant="secondary" className="text-xs">
                                    {card.difficulty}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      }
                    </div>
                    
                    <div className="mt-4 flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {selectedFlashcards.length} flashcards selecionados
                      </span>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowImportModal(false);
                          setImportSource(null);
                        }}
                      >
                        FECHAR
                      </Button>
                    </div>
                  </div>
                )}
                
                {/* Import do Anki */}
                {importSource === 'anki' && showImportModal && (
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <AnkiImportExport
                      onImportComplete={(cards) => {
                        // Processar cards importados
                        toast.success(`${cards.length} cards importados do Anki`);
                        setShowImportModal(false);
                        setImportSource(null);
                      }}
                    />
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowImportModal(false);
                        setImportSource(null);
                      }}
                      className="mt-4 w-full"
                    >
                      CANCELAR
                    </Button>
                  </div>
                )}
                
                {/* Resumo dos flashcards adicionados */}
                {selectedFlashcards.length > 0 && (
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <p className="text-sm text-green-700 dark:text-green-300 font-police-body">
                      <CheckCircle className="inline w-4 h-4 mr-1" />
                      {selectedFlashcards.length} flashcards adicionados ao deck
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );
        
      case 4: // Revisão
        return (
          <div className="space-y-6">
            <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="font-police-title uppercase tracking-wider flex items-center gap-3">
                  <Eye className="w-6 h-6 text-accent-500" />
                  REVISÃO DO DECK
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-police-subtitle uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-3">
                      INFORMAÇÕES
                    </h4>
                    <dl className="space-y-2">
                      <div>
                        <dt className="text-xs text-gray-500 uppercase">Nome</dt>
                        <dd className="font-medium">{formData.name || 'Não informado'}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-gray-500 uppercase">Matéria</dt>
                        <dd className="font-medium">
                          {selectedCategories.map(id => findCategoryById(id)?.name).join(' > ') || 'Não selecionada'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-gray-500 uppercase">Nível</dt>
                        <dd className="font-medium">
                          {formData.difficulty === 'easy' ? 'BÁSICO' : 
                           formData.difficulty === 'medium' ? 'INTERMEDIÁRIO' : 'AVANÇADO'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-gray-500 uppercase">Privacidade</dt>
                        <dd className="font-medium flex items-center gap-1">
                          {formData.privacy === 'private' ? (
                            <>
                              <Lock className="w-4 h-4" />
                              Privado
                            </>
                          ) : (
                            <>
                              <Globe className="w-4 h-4" />
                              Público
                            </>
                          )}
                        </dd>
                      </div>
                    </dl>
                  </div>
                  
                  <div>
                    <h4 className="font-police-subtitle uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-3">
                      ESTATÍSTICAS
                    </h4>
                    <dl className="space-y-2">
                      <div>
                        <dt className="text-xs text-gray-500 uppercase">Tópicos</dt>
                        <dd className="font-medium">{formData.topics.length}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-gray-500 uppercase">Flashcards</dt>
                        <dd className="font-medium">{selectedFlashcards.length}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-gray-500 uppercase">Tags</dt>
                        <dd className="font-medium">{formData.tags.length}</dd>
                      </div>
                    </dl>
                  </div>
                </div>
                
                {formData.description && (
                  <div>
                    <h4 className="font-police-subtitle uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">
                      DESCRIÇÃO
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400">{formData.description}</p>
                  </div>
                )}
                
                {formData.topics.length > 0 && (
                  <div>
                    <h4 className="font-police-subtitle uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">
                      ESTRUTURA
                    </h4>
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                      {renderTopicsTree(formData.topics)}
                    </div>
                  </div>
                )}
                
                {formData.tags.length > 0 && (
                  <div>
                    <h4 className="font-police-subtitle uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">
                      TAGS
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary">
                          <Hash className="w-3 h-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );
        
      default:
        return null;
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
                CRIAR NOVO DECK
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1 font-police-body">
                Organize seus flashcards em um deck personalizado
              </p>
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[1, 2, 3, 4].map((step) => (
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
              {step < 4 && (
                <div className={`flex-1 h-1 mx-2 ${
                  currentStep > step ? 'bg-accent-500' : 'bg-gray-200 dark:bg-gray-700'
                }`} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-xs font-police-body uppercase">Informações</span>
          <span className="text-xs font-police-body uppercase">Estrutura</span>
          <span className="text-xs font-police-body uppercase">Flashcards</span>
          <span className="text-xs font-police-body uppercase">Revisão</span>
        </div>
      </div>
      
      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {renderStepContent()}
        </motion.div>
      </AnimatePresence>
      
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
                  <Loader2 className="w-4 h-4 animate-spin" />
                  SALVANDO...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  CRIAR DECK
                </>
              )}
            </Button>
          )}
        </div>
      </div>
      
      {/* Category Selection Modal */}
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
                SELECIONAR MATÉRIA
              </h2>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Buscar matérias..."
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