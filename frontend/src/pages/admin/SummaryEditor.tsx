import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  Upload,
  Download,
  FileText,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Link2,
  Image,
  Code,
  Quote,
  Brain,
  Star,
  MoreVertical,
  X,
  Save,
  CheckCircle,
  AlertCircle,
  Folder,
  ChevronRight,
  Hash,
  Type,
  Palette,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo,
  Redo,
  Shield,
  Target,
  Award,
  Tag
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { summaryService, type Summary } from '@/services/summaryService';
import { categoryService, type Category } from '@/services/categoryService';
import { flashcardService } from '@/services/flashcardService';
import { questionService } from '@/services/questionService';
import toast from 'react-hot-toast';

// Mock data for available questions and flashcards (mantido para funcionalidades do editor)
const availableQuestions = [
  { id: 1, title: 'O que são os princípios fundamentais?', category: 'Direito Constitucional' },
  { id: 2, title: 'Quais são os objetivos da República?', category: 'Direito Constitucional' },
  { id: 3, title: 'Calcule os juros compostos de...', category: 'Matemática Financeira' },
  { id: 4, title: 'A concordância verbal em casos de...', category: 'Português' }
];

const availableFlashcards = [
  { id: 1, front: 'Princípio da Dignidade Humana', back: 'Fundamento da República...', category: 'Direito' },
  { id: 2, front: 'Fórmula de Juros Compostos', back: 'M = C(1+i)^n', category: 'Matemática' },
  { id: 3, front: 'Sujeito Composto', back: 'Quando há mais de um núcleo...', category: 'Português' }
];

const statuses = ['Todos', 'published', 'draft', 'review'];

// Editor toolbar configuration
const toolbarGroups = [
  {
    name: 'text',
    tools: [
      { icon: Bold, action: 'bold', title: 'Negrito' },
      { icon: Italic, action: 'italic', title: 'Itálico' },
      { icon: Underline, action: 'underline', title: 'Sublinhado' }
    ]
  },
  {
    name: 'format',
    tools: [
      { icon: Type, action: 'heading', title: 'Título' },
      { icon: List, action: 'list', title: 'Lista' },
      { icon: ListOrdered, action: 'orderedList', title: 'Lista Numerada' },
      { icon: Quote, action: 'quote', title: 'Citação' }
    ]
  },
  {
    name: 'align',
    tools: [
      { icon: AlignLeft, action: 'alignLeft', title: 'Alinhar à Esquerda' },
      { icon: AlignCenter, action: 'alignCenter', title: 'Centralizar' },
      { icon: AlignRight, action: 'alignRight', title: 'Alinhar à Direita' }
    ]
  },
  {
    name: 'insert',
    tools: [
      { icon: Link2, action: 'link', title: 'Link' },
      { icon: Image, action: 'image', title: 'Imagem' },
      { icon: Code, action: 'code', title: 'Código' }
    ]
  },
  {
    name: 'embed',
    tools: [
      { icon: Brain, action: 'embedQuestion', title: 'Incorporar Questão', special: true },
      { icon: Star, action: 'embedFlashcard', title: 'Incorporar Flashcard', special: true }
    ]
  }
];

// Estrutura hierárquica de matérias
const materias = {
  'DIREITO': {
    'Direito Constitucional': ['Princípios Fundamentais', 'Direitos e Garantias', 'Organização do Estado'],
    'Direito Penal': ['Teoria do Crime', 'Crimes em Espécie', 'Lei de Drogas'],
    'Direito Administrativo': ['Atos Administrativos', 'Licitações', 'Servidores Públicos'],
    'Direito Processual Penal': ['Inquérito Policial', 'Ação Penal', 'Prisões']
  },
  'SEGURANÇA PÚBLICA': {
    'Inteligência Policial': ['Análise Criminal', 'Operações de Inteligência', 'Contrainteligência'],
    'Táticas Operacionais': ['Abordagem', 'Uso da Força', 'Gerenciamento de Crise'],
    'Legislação Especial': ['Lei de Armas', 'Crime Organizado', 'Sistema Prisional'],
    'Criminologia': ['Teorias Criminológicas', 'Vitimologia', 'Políticas de Segurança']
  },
  'CONHECIMENTOS GERAIS': {
    'Português': ['Gramática', 'Interpretação de Texto', 'Redação Oficial'],
    'Matemática': ['Raciocínio Lógico', 'Matemática Financeira', 'Estatística'],
    'História': ['História do Brasil', 'História Geral', 'Atualidades'],
    'Geografia': ['Geografia do Brasil', 'Geografia Mundial', 'Geopolítica']
  }
};

export default function SummaryEditor() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [selectedStatus, setSelectedStatus] = useState('Todos');
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [selectedSummary, setSelectedSummary] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('editor');
  const [showEmbedModal, setShowEmbedModal] = useState(false);
  const [embedType, setEmbedType] = useState<'question' | 'flashcard'>('question');
  const [editorContent, setEditorContent] = useState('');
  
  // Filtros hierárquicos
  const [filterMateria, setFilterMateria] = useState('TODOS');
  const [filterSubmateria, setFilterSubmateria] = useState('TODOS');
  const [filterTopico, setFilterTopico] = useState('TODOS');
  
  // State para dados da API
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [categories, setCategories] = useState<string[]>(['Todos']);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State para flashcards e questões
  const [realFlashcards, setRealFlashcards] = useState<any[]>([]);
  const [realQuestions, setRealQuestions] = useState<any[]>([]);
  const [loadingEmbedData, setLoadingEmbedData] = useState(false);
  
  // Carregar dados da API
  useEffect(() => {
    loadSummaries();
    loadCategories();
  }, [selectedCategory, selectedStatus, searchTerm]);
  
  const loadSummaries = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const filters = {
        q: searchTerm || undefined,
        status: selectedStatus !== 'Todos' ? selectedStatus as any : undefined,
        subject: selectedCategory !== 'Todos' ? selectedCategory : undefined,
        page: 1,
        limit: 50
      };
      
      const response = await summaryService.getAll(filters);
      setSummaries(response.summaries || []);
      
    } catch (err) {
      console.error('Error loading summaries:', err);
      setError('Erro ao carregar resumos. Tente novamente.');
      toast.error('Erro ao carregar resumos');
    } finally {
      setIsLoading(false);
    }
  };
  
  const loadCategories = async () => {
    try {
      const response = await categoryService.listCategories();
      if (response.success && response.data) {
        const categoryNames = response.data
          .filter(cat => cat.type === 'subject')
          .map(cat => cat.name);
        setCategories(['Todos', ...categoryNames]);
      }
    } catch (err) {
      console.error('Error loading categories:', err);
      // Manter as categorias padrão em caso de erro
    }
  };

  const filteredSummaries = summaries.filter(summary => {
    const matchesSearch = summary.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (summary.created_by && summary.created_by.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'Todos' || summary.subject === selectedCategory;
    const matchesStatus = selectedStatus === 'Todos' || summary.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      published: { label: 'OPERACIONAL', color: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-2 border-gray-300 dark:border-gray-600' },
      draft: { label: 'EM PREPARAÇÃO', color: 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-2 border-dashed border-gray-400 dark:border-gray-700' },
      review: { label: 'EM REVISÃO', color: 'bg-accent-500/20 text-accent-700 dark:text-accent-300 border-2 border-accent-500/50' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const handleCreateSummary = () => {
    navigate('/admin/summaries/new');
    toast.success('Redirecionando para criação de novo briefing', {
      duration: 2000,
      icon: '📋'
    });
  };

  const handleEditSummary = (summary: Summary) => {
    navigate(`/admin/summaries/edit/${summary.id}`);
    toast.success(`Editando: ${summary.title}`, {
      duration: 2000,
      icon: '✏️'
    });
  };

  const handleViewSummary = (summary: Summary) => {
    setSelectedSummary(summary);
    setIsEditing(false);
    setShowSummaryModal(true);
    setActiveTab('preview');
    toast.success(`Visualizando: ${summary.title}`, {
      duration: 2000,
      icon: '👁️'
    });
  };

  const handleToolbarAction = (action: string) => {
    if (action === 'embedQuestion') {
      setEmbedType('question');
      setShowEmbedModal(true);
      loadQuestions();
    } else if (action === 'embedFlashcard') {
      setEmbedType('flashcard');
      setShowEmbedModal(true);
      loadFlashcards();
    } else {
      // Implementar formatação do texto
      applyFormat(action);
    }
  };

  const loadFlashcards = async () => {
    try {
      setLoadingEmbedData(true);
      const response = await flashcardService.getFlashcards({ limit: 50 });
      if (response.success) {
        setRealFlashcards(response.data || []);
      }
    } catch (error) {
      console.error('Error loading flashcards:', error);
      toast.error('Erro ao carregar flashcards');
    } finally {
      setLoadingEmbedData(false);
    }
  };

  const loadQuestions = async () => {
    try {
      setLoadingEmbedData(true);
      const response = await questionService.getQuestions({ limit: 50 });
      if (response.success) {
        setRealQuestions(response.data || []);
      }
    } catch (error) {
      console.error('Error loading questions:', error);
      toast.error('Erro ao carregar questões');
      // Usar questões mock como fallback
      setRealQuestions(availableQuestions);
    } finally {
      setLoadingEmbedData(false);
    }
  };

  const applyFormat = (command: string) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    // Focar no editor antes de aplicar formatação
    const editor = document.querySelector('[contentEditable="true"]') as HTMLElement;
    if (editor) {
      editor.focus();
    }

    switch (command) {
      case 'bold':
        document.execCommand('bold', false);
        break;
      case 'italic':
        document.execCommand('italic', false);
        break;
      case 'underline':
        document.execCommand('underline', false);
        break;
      case 'list':
        document.execCommand('insertUnorderedList', false);
        break;
      case 'orderedList':
        document.execCommand('insertOrderedList', false);
        break;
      case 'heading':
        // Transformar em H2
        document.execCommand('formatBlock', false, 'H2');
        break;
      case 'quote':
        document.execCommand('formatBlock', false, 'blockquote');
        break;
      case 'alignLeft':
        document.execCommand('justifyLeft', false);
        break;
      case 'alignCenter':
        document.execCommand('justifyCenter', false);
        break;
      case 'alignRight':
        document.execCommand('justifyRight', false);
        break;
      case 'link':
        const url = prompt('Digite a URL:');
        if (url) {
          document.execCommand('createLink', false, url);
        }
        break;
      case 'image':
        const imageUrl = prompt('Digite a URL da imagem:');
        if (imageUrl) {
          document.execCommand('insertImage', false, imageUrl);
        }
        break;
      case 'code':
        // Envolver seleção em tag code
        const range = selection.getRangeAt(0);
        const selectedText = range.toString();
        range.deleteContents();
        const codeElement = document.createElement('code');
        codeElement.textContent = selectedText;
        codeElement.className = 'bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm font-mono';
        range.insertNode(codeElement);
        break;
      default:
        console.log('Comando não implementado:', command);
    }

    // Atualizar o estado do editor
    setTimeout(() => {
      if (editor) {
        setEditorContent(editor.innerHTML);
      }
    }, 10);
  };

  const handleEmbedItem = (item: any) => {
    const embedHtml = embedType === 'question' 
      ? `<div class="embed-question" data-id="${item.id}">[Questão: ${item.title}]</div>`
      : `<div class="embed-flashcard" data-id="${item.id}">[Flashcard: ${item.front}]</div>`;
    
    setEditorContent(editorContent + embedHtml);
    setShowEmbedModal(false);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-police-title uppercase tracking-ultra-wide">
            CENTRO DE INTELIGÊNCIA TÁTICA
          </h1>
          <p className="text-gray-600 dark:text-gray-300 font-police-body tracking-wider">
            CRIAÇÃO DE RESUMOS OPERACIONAIS COM RECURSOS INTERATIVOS
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button onClick={handleCreateSummary} className="gap-2 bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black font-police-subtitle font-semibold uppercase tracking-wider shadow-lg">
            <Plus className="w-4 h-4" />
            CRIAR NOVO BRIEFING
          </Button>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-police-subtitle uppercase tracking-ultra-wide text-gray-600 dark:text-accent-500">
                  TOTAL DE BRIEFINGS
                </p>
                <p className="text-xl font-bold text-gray-900 dark:text-white font-police-numbers">
                  {isLoading ? '...' : summaries.length}
                </p>
              </div>
              <Shield className="w-6 h-6 text-accent-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-police-subtitle uppercase tracking-ultra-wide text-gray-600 dark:text-gray-400">
                  OPERACIONAIS
                </p>
                <p className="text-xl font-bold text-gray-900 dark:text-white font-police-numbers">
                  {isLoading ? '...' : summaries.filter(s => s.status === 'published').length}
                </p>
              </div>
              <Target className="w-6 h-6 text-gray-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-police-subtitle uppercase tracking-ultra-wide text-gray-600 dark:text-gray-400">
                  SEÇÕES TÁTICAS
                </p>
                <p className="text-xl font-bold text-gray-900 dark:text-white font-police-numbers">
                  {isLoading ? '...' : summaries.reduce((acc, s) => acc + (s.sections?.length || 0), 0)}
                </p>
              </div>
              <FileText className="w-6 h-6 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-police-subtitle uppercase tracking-ultra-wide text-gray-600 dark:text-gray-400">
                  VISUALIZAÇÕES
                </p>
                <p className="text-xl font-bold text-gray-900 dark:text-white font-police-numbers">
                  {isLoading ? '...' : summaries.reduce((acc, s) => acc + (s.statistics?.views || 0), 0)}
                </p>
              </div>
              <Eye className="w-6 h-6 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="space-y-4">
              {/* Primeira linha - Busca, Matéria e Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="relative lg:col-span-2">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="BUSCAR BRIEFINGS..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-police-body placeholder:text-gray-500 placeholder:uppercase placeholder:tracking-wider"
                  />
                </div>

                <select
                  value={filterMateria}
                  onChange={(e) => {
                    setFilterMateria(e.target.value);
                    setFilterSubmateria('TODOS');
                    setFilterTopico('TODOS');
                  }}
                  className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-police-body uppercase tracking-wider"
                >
                  <option value="TODOS">TODAS AS MATÉRIAS</option>
                  <option value="DIREITO">DIREITO</option>
                  <option value="SEGURANÇA PÚBLICA">SEGURANÇA PÚBLICA</option>
                  <option value="CONHECIMENTOS GERAIS">CONHECIMENTOS GERAIS</option>
                </select>

                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-police-body uppercase tracking-wider lg:col-span-2"
                >
                  <option value="Todos">TODOS OS STATUS</option>
                  <option value="published">OPERACIONAL</option>
                  <option value="draft">EM PREPARAÇÃO</option>
                  <option value="review">EM REVISÃO</option>
                </select>
              </div>
              
              {/* Segunda linha - Submatéria e Tópico (aparece quando matéria é selecionada) */}
              <AnimatePresence>
                {filterMateria !== 'TODOS' && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div className="h-0.5 bg-gradient-to-r from-transparent via-accent-500 to-transparent flex-1" />
                      <span className="text-xs font-police-subtitle uppercase tracking-wider text-gray-600 dark:text-gray-400">
                        FILTROS AVANÇADOS DA MATÉRIA
                      </span>
                      <div className="h-0.5 bg-gradient-to-r from-transparent via-accent-500 to-transparent flex-1" />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Submateria Filter */}
                      <div>
                        <label className="block text-xs font-police-subtitle uppercase tracking-wider mb-1 text-gray-600 dark:text-gray-400">
                          SUBMATÉRIA
                        </label>
                        <select
                          value={filterSubmateria}
                          onChange={(e) => {
                            setFilterSubmateria(e.target.value);
                            setFilterTopico('TODOS');
                          }}
                          className="w-full px-4 py-2 border-2 rounded-lg transition-all duration-300 font-police-body font-medium uppercase tracking-wider border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 outline-none"
                        >
                          <option value="TODOS">TODAS AS SUBMATÉRIAS</option>
                          {Object.keys(materias[filterMateria as keyof typeof materias] || {}).map(submateria => (
                            <option key={submateria} value={submateria}>{submateria.toUpperCase()}</option>
                          ))}
                        </select>
                      </div>
                      
                      {/* Topico Filter */}
                      {filterSubmateria !== 'TODOS' && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                        >
                          <label className="block text-xs font-police-subtitle uppercase tracking-wider mb-1 text-gray-600 dark:text-gray-400">
                            TÓPICO
                          </label>
                          <select
                            value={filterTopico}
                            onChange={(e) => setFilterTopico(e.target.value)}
                            className="w-full px-4 py-2 border-2 rounded-lg transition-all duration-300 font-police-body font-medium uppercase tracking-wider border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 outline-none"
                          >
                            <option value="TODOS">TODOS OS TÓPICOS</option>
                            {(materias[filterMateria as keyof typeof materias]?.[filterSubmateria as keyof typeof materias[keyof typeof materias]] || []).map(topico => (
                              <option key={topico} value={topico}>{topico.toUpperCase()}</option>
                            ))}
                          </select>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Summaries Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 border-2 border-accent-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="font-police-body font-medium uppercase tracking-wider text-gray-900 dark:text-white">
                      CARREGANDO BRIEFINGS...
                    </span>
                  </div>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                    <p className="font-police-body font-medium uppercase tracking-wider text-red-600 dark:text-red-400">
                      {error}
                    </p>
                    <Button 
                      onClick={loadSummaries}
                      variant="outline"
                      className="mt-3 font-police-body uppercase tracking-wider"
                    >
                      TENTAR NOVAMENTE
                    </Button>
                  </div>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-100 dark:bg-gray-800">
                    <tr>
                      <th className="text-left py-4 px-6 font-semibold text-gray-900 dark:text-white font-police-subtitle uppercase tracking-wider">
                        BRIEFING
                      </th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-900 dark:text-white font-police-subtitle uppercase tracking-wider">
                        MATÉRIA
                      </th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-900 dark:text-white font-police-subtitle uppercase tracking-wider">
                        CRIADO POR
                      </th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-900 dark:text-white font-police-subtitle uppercase tracking-wider">
                        STATUS
                      </th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-900 dark:text-white font-police-subtitle uppercase tracking-wider">
                        ELEMENTOS
                      </th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-900 dark:text-white font-police-subtitle uppercase tracking-wider">
                        MÉTRICAS
                      </th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-900 dark:text-white font-police-subtitle uppercase tracking-wider">
                        AÇÕES
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSummaries.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 px-6 text-center">
                          <p className="font-police-body font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                            NENHUM BRIEFING ENCONTRADO
                          </p>
                        </td>
                      </tr>
                    ) : (
                      filteredSummaries.map((summary) => (
                        <tr
                          key={summary.id}
                          className="border-b border-primary-100 dark:border-gray-700 hover:bg-primary-50 dark:hover:bg-gray-800"
                        >
                          <td className="py-4 px-6">
                            <div>
                              <p className="font-medium text-primary-900 dark:text-white">
                                {summary.title}
                              </p>
                              <p className="text-sm text-primary-600 dark:text-gray-400">
                                {summary.topic || summary.subject}
                              </p>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <span className="text-primary-600 dark:text-gray-400">
                              {summary.subject}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <span className="text-primary-600 dark:text-gray-400">
                              {summary.created_by || 'Sistema'}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            {getStatusBadge(summary.status)}
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1">
                                <FileText className="w-4 h-4 text-purple-600" />
                                <span className="text-sm text-primary-900 dark:text-white">
                                  {summary.sections?.length || 0}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Tag className="w-4 h-4 text-yellow-600" />
                                <span className="text-sm text-primary-900 dark:text-white">
                                  {summary.tags?.length || 0}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="space-y-1 text-sm">
                              <div className="flex items-center gap-2 text-primary-600 dark:text-gray-400">
                                <Eye className="w-3 h-3" />
                                {summary.statistics?.views || 0} views
                              </div>
                              <div className="text-primary-600 dark:text-gray-400">
                                {summary.estimated_reading_time || 0} min • {summary.difficulty}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                title="Visualizar"
                                onClick={() => handleViewSummary(summary)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                title="Editar"
                                onClick={() => handleEditSummary(summary)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm" title="Mais opções">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Summary Editor Modal */}
      <AnimatePresence>
        {showSummaryModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setShowSummaryModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-7xl max-h-[95vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-bold text-primary-900 dark:text-white">
                  {isEditing ? (selectedSummary ? 'Editar Resumo' : 'Criar Novo Resumo') : 'Visualizar Resumo'}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSummaryModal(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Modal Tabs */}
              <div className="flex border-b border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setActiveTab('editor')}
                  className={`px-6 py-3 font-medium transition-colors ${
                    activeTab === 'editor'
                      ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  Editor
                </button>
                <button
                  onClick={() => setActiveTab('preview')}
                  className={`px-6 py-3 font-medium transition-colors ${
                    activeTab === 'preview'
                      ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  Pré-visualização
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`px-6 py-3 font-medium transition-colors ${
                    activeTab === 'settings'
                      ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  Configurações
                </button>
              </div>

              {/* Modal Content */}
              <div className="flex flex-col h-[calc(95vh-140px)]">
                {activeTab === 'editor' && isEditing && (
                  <>
                    {/* Editor Toolbar */}
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                      <div className="flex flex-wrap items-center gap-4">
                        {toolbarGroups.map((group, groupIndex) => (
                          <div key={group.name} className="flex items-center gap-1">
                            {group.tools.map((tool, index) => (
                              <Button
                                key={index}
                                variant="ghost"
                                size="sm"
                                onClick={() => handleToolbarAction(tool.action)}
                                className={`p-2 ${tool.special ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300' : ''}`}
                                title={tool.title}
                              >
                                <tool.icon className="w-4 h-4" />
                              </Button>
                            ))}
                            {groupIndex < toolbarGroups.length - 1 && (
                              <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-2" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Editor Content Area */}
                    <div className="flex-1 p-6 overflow-y-auto">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2">
                          <input
                            type="text"
                            placeholder="Título do Resumo"
                            defaultValue={selectedSummary?.title}
                            className="w-full mb-4 px-4 py-2 text-2xl font-bold border-0 border-b-2 border-gray-200 dark:border-gray-700 bg-transparent text-primary-900 dark:text-white focus:outline-none focus:border-primary-500"
                          />
                          
                          <div
                            contentEditable={isEditing}
                            className="min-h-[500px] p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-primary-900 dark:text-white prose prose-lg dark:prose-invert max-w-none focus:outline-none focus:ring-2 focus:ring-primary-500 
                            [&>ul]:list-disc [&>ul]:ml-6 [&>ul]:my-4
                            [&>ol]:list-decimal [&>ol]:ml-6 [&>ol]:my-4
                            [&>li]:my-1
                            [&>h1]:text-3xl [&>h1]:font-bold [&>h1]:my-4
                            [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:my-3
                            [&>h3]:text-xl [&>h3]:font-bold [&>h3]:my-2
                            [&>blockquote]:border-l-4 [&>blockquote]:border-primary-500 [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:my-4
                            [&>code]:bg-gray-100 [&>code]:dark:bg-gray-800 [&>code]:px-2 [&>code]:py-1 [&>code]:rounded [&>code]:text-sm [&>code]:font-mono
                            [&>p]:my-2 [&>p]:leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: editorContent }}
                            onInput={(e) => setEditorContent(e.currentTarget.innerHTML)}
                          />
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-4">
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-sm">Informações</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              <div>
                                <label className="block text-sm font-medium text-primary-700 dark:text-gray-300 mb-1">
                                  Curso
                                </label>
                                <select className="w-full px-3 py-2 text-sm border border-primary-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">
                                  <option>Polícia Federal - Agente</option>
                                  <option>Receita Federal - Auditor</option>
                                  <option>TRT/TRF - Analista</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-primary-700 dark:text-gray-300 mb-1">
                                  Categoria
                                </label>
                                <select 
                                  value={selectedCategory}
                                  onChange={(e) => setSelectedCategory(e.target.value)}
                                  className="w-full px-3 py-2 text-sm border border-primary-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-primary-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                                >
                                  {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                  ))}
                                </select>
                              </div>
                            </CardContent>
                          </Card>

                          <Card>
                            <CardHeader>
                              <CardTitle className="text-sm">Elementos Incorporados</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                              <div className="flex items-center justify-between p-2 bg-purple-50 dark:bg-purple-900/20 rounded">
                                <div className="flex items-center gap-2">
                                  <Brain className="w-4 h-4 text-purple-600" />
                                  <span className="text-sm">Questões</span>
                                </div>
                                <span className="text-sm font-bold">0</span>
                              </div>
                              <div className="flex items-center justify-between p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                                <div className="flex items-center gap-2">
                                  <Star className="w-4 h-4 text-yellow-600" />
                                  <span className="text-sm">Flashcards</span>
                                </div>
                                <span className="text-sm font-bold">0</span>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {activeTab === 'preview' && (
                  <div className="flex-1 p-6 overflow-y-auto">
                    <div className="max-w-4xl mx-auto">
                      <h1 className="text-3xl font-bold text-primary-900 dark:text-white mb-6">
                        {selectedSummary?.title || 'Título do Resumo'}
                      </h1>
                      <div 
                        className="prose prose-lg dark:prose-invert max-w-none"
                        dangerouslySetInnerHTML={{ __html: editorContent || '<p>Pré-visualização do conteúdo aparecerá aqui...</p>' }}
                      />
                    </div>
                  </div>
                )}

                {activeTab === 'settings' && (
                  <div className="flex-1 p-6 overflow-y-auto">
                    <div className="max-w-2xl space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-primary-700 dark:text-gray-300 mb-2">
                          Status do Resumo
                        </label>
                        <select
                          defaultValue={selectedSummary?.status || 'draft'}
                          disabled={!isEditing}
                          className="w-full px-4 py-2 border border-primary-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-primary-900 dark:text-white disabled:opacity-50"
                        >
                          <option value="published">Publicado</option>
                          <option value="draft">Rascunho</option>
                          <option value="review">Em Revisão</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-primary-700 dark:text-gray-300 mb-2">
                          Tags
                        </label>
                        <input
                          type="text"
                          placeholder="Digite as tags separadas por vírgula"
                          disabled={!isEditing}
                          className="w-full px-4 py-2 border border-primary-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-primary-900 dark:text-white disabled:opacity-50"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
                <Button
                  variant="outline"
                  onClick={() => setShowSummaryModal(false)}
                >
                  Cancelar
                </Button>
                {isEditing ? (
                  <Button className="gap-2">
                    <Save className="w-4 h-4" />
                    Salvar Resumo
                  </Button>
                ) : (
                  <Button
                    onClick={() => setIsEditing(true)}
                    className="gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Editar Resumo
                  </Button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Embed Selection Modal */}
      <AnimatePresence>
        {showEmbedModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
            onClick={() => setShowEmbedModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-bold text-primary-900 dark:text-white">
                  {embedType === 'question' ? 'Selecionar Questão' : 'Selecionar Flashcard'}
                </h3>
              </div>

              <div className="p-6 overflow-y-auto max-h-[60vh]">
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder={`Buscar ${embedType === 'question' ? 'questões' : 'flashcards'}...`}
                      className="w-full pl-10 pr-4 py-2 border border-primary-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-primary-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  {loadingEmbedData ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                      <span className="ml-2 text-primary-600 dark:text-gray-400">
                        Carregando {embedType === 'question' ? 'questões' : 'flashcards'}...
                      </span>
                    </div>
                  ) : embedType === 'question' ? (
                    (realQuestions.length > 0 ? realQuestions : availableQuestions).map((question) => (
                      <div
                        key={question.id}
                        className="p-4 border border-primary-200 dark:border-gray-700 rounded-lg hover:bg-primary-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                        onClick={() => handleEmbedItem(question)}
                      >
                        <p className="font-medium text-primary-900 dark:text-white">
                          {question.question || question.title || question.statement}
                        </p>
                        <p className="text-sm text-primary-600 dark:text-gray-400 mt-1">
                          {question.category || 'Sem categoria'}
                        </p>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {question.type || 'multiple_choice'}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {question.difficulty || 'medium'}
                          </Badge>
                        </div>
                      </div>
                    ))
                  ) : (
                    (realFlashcards.length > 0 ? realFlashcards : availableFlashcards).map((flashcard) => (
                      <div
                        key={flashcard.id}
                        className="p-4 border border-primary-200 dark:border-gray-700 rounded-lg hover:bg-primary-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                        onClick={() => handleEmbedItem(flashcard)}
                      >
                        <p className="font-medium text-primary-900 dark:text-white">
                          {flashcard.front || flashcard.question}
                        </p>
                        <p className="text-sm text-primary-600 dark:text-gray-400 mt-1">
                          {flashcard.back || flashcard.answer}
                        </p>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {flashcard.type || 'basic'}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {flashcard.category || 'Sem categoria'}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {flashcard.difficulty || 'medium'}
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
                <Button
                  variant="outline"
                  onClick={() => setShowEmbedModal(false)}
                >
                  Cancelar
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}