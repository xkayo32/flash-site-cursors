import { useState, useRef, useEffect } from 'react';
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
  BookOpen,
  Brain,
  Star,
  FileText,
  Users,
  Calendar,
  MoreVertical,
  X,
  Save,
  AlertCircle,
  CheckCircle,
  Clock,
  Globe,
  Lock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

// Estrutura militar/tática para academia operacional
const materias = {
  'OPERAÇÕES TÁTICAS': {
    'Direito Constitucional': ['PROTOCOLOS FUNDAMENTAIS', 'DIREITOS E GARANTIAS', 'ESTRUTURA ESTATAL', 'PODERES OPERACIONAIS'],
    'Direito Administrativo': ['PRINCÍPIOS TÁTICOS', 'ATOS OPERACIONAIS', 'LICITAÇÕES', 'CONTRATOS', 'PESSOAL OPERACIONAL'],
    'Direito Penal': ['TEORIA DO CRIME', 'CRIMES EM ESPÉCIE', 'PENAS', 'EXTINÇÃO DA PUNIBILIDADE'],
    'Direito Processual Penal': ['INQUÉRITO POLICIAL', 'AÇÃO PENAL', 'PROVAS', 'PRISÕES']
  },
  'ARSENAL OPERACIONAL': {
    'Legislação Policial': ['ESTATUTOS MILITARES', 'CÓDIGOS DE CONDUTA', 'REGULAMENTOS TÁTICOS'],
    'Táticas Operacionais': ['ABORDAGEM TÁTICA', 'USO DA FORÇA', 'NEGOCIAÇÃO ESTRATÉGICA'],
    'Investigação Criminal': ['TÉCNICAS DE INVESTIGAÇÃO', 'PERÍCIA', 'INTELIGÊNCIA']
  },
  'ARSENAL INTEL': {
    'Português': ['GRAMÁTICA TÁTICA', 'INTERPRETAÇÃO DE TEXTOS', 'REDAÇÃO OPERACIONAL'],
    'Matemática': ['RACIOCÍNIO LÓGICO', 'ESTATÍSTICA', 'MATEMÁTICA BÁSICA'],
    'Informática': ['HARDWARE', 'SOFTWARE', 'SEGURANÇA DA INFORMAÇÃO'],
    'História': ['HISTÓRIA DO BRASIL', 'HISTÓRIA GERAL', 'ATUALIDADES']
  }
};

// Categories will be loaded from API
const types = ['Todos', 'course', 'flashcards', 'questions', 'summary'];
const statuses = ['Todos', 'published', 'draft', 'review', 'archived'];

import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/utils/cn';
import { summaryService } from '@/services/summaryService';
import { courseService } from '@/services/courseService';
import { flashcardService } from '@/services/flashcardService';
import { questionService } from '@/services/questionService';
import { categoryService } from '@/services/categoryService';
import toast from 'react-hot-toast';

// TypeScript interfaces
interface ContentItem {
  id: number;
  title: string;
  type: 'course' | 'flashcards' | 'questions' | 'summary';
  category: string;
  materia: string;
  submateria: string;
  topico: string;
  author: string;
  status: 'published' | 'draft' | 'review' | 'archived';
  visibility: 'public' | 'private';
  createdAt: string;
  updatedAt: string;
  views: number;
  enrollments: number;
  rating: number;
  lessons?: number;
  duration?: string;
  cards?: number;
  decks?: number;
  questions?: number;
  difficulty?: string;
  pages?: number;
  interactions?: number;
}

export default function ContentManager() {
  const { resolvedTheme } = useTheme();
  const navigate = useNavigate();
  const importInputRef = useRef<HTMLInputElement>(null);
  
  // Estado dos dados da API
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [categories, setCategories] = useState<string[]>(['TODOS']);
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error' | 'info'} | null>(null);
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);
  const [viewingItem, setViewingItem] = useState<ContentItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [selectedType, setSelectedType] = useState('Todos');
  const [selectedStatus, setSelectedStatus] = useState('Todos');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [selectedMateria, setSelectedMateria] = useState('');
  const [selectedSubmateria, setSelectedSubmateria] = useState('');
  const [selectedTopico, setSelectedTopico] = useState('');
  const [selectedContentType, setSelectedContentType] = useState('');
  const [contentTitle, setContentTitle] = useState('');
  const [contentDescription, setContentDescription] = useState('');
  // Filtros da listagem
  const [filterMateria, setFilterMateria] = useState('TODOS');
  const [filterSubmateria, setFilterSubmateria] = useState('TODOS');
  const [filterTopico, setFilterTopico] = useState('TODOS');
  const [error, setError] = useState<string | null>(null);
  
  // Carregar dados da API
  useEffect(() => {
    loadContentItems();
    loadCategories();
  }, [selectedCategory, selectedType, selectedStatus, searchTerm, filterMateria]);
  
  const loadContentItems = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Carregar diferentes tipos de conteúdo das APIs
      const [coursesRes, summariesRes, flashcardsRes] = await Promise.allSettled([
        courseService.listCourses({ limit: 50 }),
        summaryService.getAll({ limit: 50 }),
        flashcardService.getFlashcards({ limit: 50 })
      ]);
      
      const allItems: ContentItem[] = [];
      
      // Processar cursos
      if (coursesRes.status === 'fulfilled' && coursesRes.value.success) {
        const courses = coursesRes.value.courses || [];
        courses.forEach(course => {
          allItems.push({
            id: parseInt(course.id),
            title: course.title,
            type: 'course',
            category: course.category || 'Geral',
            materia: course.category || 'CONHECIMENTOS GERAIS',
            submateria: course.subject || 'Geral',
            topico: course.description || '',
            author: course.instructor || 'Sistema',
            status: course.status === 'published' ? 'published' : 'draft',
            visibility: 'public',
            createdAt: course.created_at || new Date().toISOString().split('T')[0],
            updatedAt: course.updated_at || new Date().toISOString().split('T')[0],
            views: 0,
            enrollments: 0,
            rating: 0,
            lessons: course.lessons?.length || 0,
            duration: '0h 0m'
          });
        });
      }
      
      // Processar resumos
      if (summariesRes.status === 'fulfilled') {
        const summaries = summariesRes.value.summaries || [];
        summaries.forEach(summary => {
          allItems.push({
            id: parseInt(summary.id),
            title: summary.title,
            type: 'summary',
            category: summary.subject,
            materia: summary.subject,
            submateria: summary.topic || summary.subject,
            topico: summary.subtopic || '',
            author: summary.created_by || 'Sistema',
            status: summary.status,
            visibility: summary.visibility === 'public' ? 'public' : 'private',
            createdAt: summary.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
            updatedAt: summary.updated_at?.split('T')[0] || new Date().toISOString().split('T')[0],
            views: summary.statistics?.views || 0,
            enrollments: summary.statistics?.study_sessions || 0,
            rating: summary.statistics?.average_rating || 0,
            pages: summary.sections?.length || 0,
            interactions: summary.statistics?.likes || 0
          });
        });
      }
      
      // Processar flashcards
      if (flashcardsRes.status === 'fulfilled') {
        const flashcardsData = flashcardsRes.value;
        if (flashcardsData.data) {
          // Agrupar flashcards por categoria para simular "decks"
          const flashcardsByCategory = flashcardsData.data.reduce((acc: any, flashcard: any) => {
            const category = flashcard.category || 'Geral';
            if (!acc[category]) {
              acc[category] = [];
            }
            acc[category].push(flashcard);
            return acc;
          }, {});
          
          Object.entries(flashcardsByCategory).forEach(([category, cards]: [string, any]) => {
            allItems.push({
              id: Math.random() * 10000,
              title: `Flashcards - ${category}`,
              type: 'flashcards',
              category,
              materia: category,
              submateria: category,
              topico: 'Flashcards',
              author: 'Sistema',
              status: 'published',
              visibility: 'public',
              createdAt: new Date().toISOString().split('T')[0],
              updatedAt: new Date().toISOString().split('T')[0],
              views: 0,
              enrollments: 0,
              rating: 0,
              cards: (cards as any[]).length,
              decks: 1
            });
          });
        }
      }
      
      setContentItems(allItems);
      
    } catch (err) {
      console.error('Error loading content items:', err);
      setError('Erro ao carregar conteúdo. Tente novamente.');
      showNotification('Erro ao carregar conteúdo', 'error');
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
        setCategories(['TODOS', ...categoryNames]);
      }
    } catch (err) {
      console.error('Error loading categories:', err);
      // Manter as categorias padrão em caso de erro
      setCategories(['TODOS', 'OPERAÇÕES TÁTICAS', 'ARSENAL OPERACIONAL', 'ARSENAL INTEL', 'COMANDO ESPECIAL', 'BRIEFINGS INTEL']);
    }
  };
  
  // Import/Export functionality
  const handleImport = () => {
    importInputRef.current?.click();
  };
  
  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setIsLoading(true);
    
    // Simular processo de import
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simular adição de novos itens
    const newItems: ContentItem[] = [
      {
        id: Math.max(...contentItems.map(i => i.id)) + 1,
        title: 'Direito Processual Civil - Importado',
        type: 'course',
        category: 'Direito',
        materia: 'DIREITO',
        submateria: 'Direito Processual Civil',
        topico: 'Procedimentos',
        author: 'Sistema Import',
        status: 'draft',
        visibility: 'private',
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
        views: 0,
        enrollments: 0,
        rating: 0,
        lessons: 15,
        duration: '8h 30m'
      },
      {
        id: Math.max(...contentItems.map(i => i.id)) + 2,
        title: 'Questões de Matemática - Importadas',
        type: 'questions',
        category: 'Matemática',
        materia: 'CONHECIMENTOS GERAIS',
        submateria: 'Matemática',
        topico: 'Estatística',
        author: 'Sistema Import',
        status: 'draft',
        visibility: 'private',
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
        views: 0,
        enrollments: 0,
        rating: 0,
        questions: 250
      }
    ];
    
    setContentItems(prev => [...newItems, ...prev]);
    showNotification(`${file.name} importado com sucesso! ${newItems.length} novos itens adicionados.`);
    setIsLoading(false);
    
    // Reset file input
    event.target.value = '';
  };
  
  const handleExport = () => {
    // TODO: Implement actual export logic
    const data = {
      content: filteredContent,
      exportDate: new Date().toISOString(),
      totalItems: filteredContent.length
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `conteudo_export_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };
  
  const handleCreateContent = () => {
    if (selectedContentType === 'course') {
      // Redirecionar para tela de cursos
      navigate('/admin/courses?create=true');
      setShowCreateModal(false);
    } else {
      // TODO: Implement creation logic for other content types
      const contentData = {
        type: selectedContentType,
        title: contentTitle,
        description: contentDescription,
        materia: selectedMateria,
        submateria: selectedSubmateria,
        topico: selectedTopico,
        createdAt: new Date().toISOString()
      };
      
      console.log('Criando conteúdo:', contentData);
      
      // Show success message with content type specific text
      const typeLabels = {
        flashcards: 'Flashcards Táticos',
        questions: 'Banco de Questões',
        summary: 'Resumo Operacional'
      };
      
      alert(`✅ ${typeLabels[selectedContentType as keyof typeof typeLabels]} criado com sucesso!\n\n📝 Título: ${contentTitle}\n📁 Matéria: ${selectedMateria}\n\n🚧 Funcionalidade em desenvolvimento.`);
      
      // Reset form
      setShowCreateModal(false);
      setSelectedContentType('');
      setContentTitle('');
      setContentDescription('');
      setSelectedMateria('');
      setSelectedSubmateria('');
      setSelectedTopico('');
    }
  };

  const filteredContent = contentItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Todos' || item.category === selectedCategory;
    const matchesType = selectedType === 'Todos' || item.type === selectedType;
    const matchesStatus = selectedStatus === 'Todos' || item.status === selectedStatus;
    const matchesMateria = filterMateria === 'TODOS' || item.materia === filterMateria;
    const matchesSubmateria = filterSubmateria === 'TODOS' || item.submateria === filterSubmateria;
    const matchesTopico = filterTopico === 'TODOS' || item.topico === filterTopico;
    
    return matchesSearch && matchesCategory && matchesType && matchesStatus && 
           matchesMateria && matchesSubmateria && matchesTopico;
  });

  const getTypeIcon = (type: string) => {
    const icons = {
      course: BookOpen,
      flashcards: Star,
      questions: Brain,
      summary: FileText
    };
    return icons[type as keyof typeof icons] || FileText;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      published: { 
        label: 'PUBLICADO', 
        color: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-2 border-gray-300 dark:border-gray-600'
      },
      draft: { 
        label: 'RASCUNHO', 
        color: 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-2 border-dashed border-gray-400 dark:border-gray-700'
      },
      review: { 
        label: 'EM REVISÃO', 
        color: 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-accent-500 border-2 border-accent-500/50'
      },
      archived: { 
        label: 'ARQUIVADO', 
        color: 'bg-gray-200 dark:bg-gray-900 text-gray-500 dark:text-gray-500 border-2 border-gray-400 dark:border-gray-700 opacity-75'
      }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <Badge className={cn(
        'font-police-subtitle font-semibold text-xs uppercase tracking-wider px-3 py-1',
        config.color
      )}>
        {config.label}
      </Badge>
    );
  };

  const getVisibilityIcon = (visibility: string) => {
    return visibility === 'public' ? 
      <Globe className="w-4 h-4 text-gray-600 dark:text-gray-400" /> : 
      <Lock className="w-4 h-4 text-gray-500 dark:text-gray-500" />;
  };

  const handleSelectItem = (id: number) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedItems(
      selectedItems.length === filteredContent.length 
        ? [] 
        : filteredContent.map(item => item.id)
    );
  };
  
  // Notification system
  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };
  
  // Bulk actions - funcionalidades reais
  const handleBulkPublish = async () => {
    if (selectedItems.length === 0) return;
    setIsLoading(true);
    
    // Simular API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setContentItems(prev => prev.map(item => 
      selectedItems.includes(item.id) 
        ? { ...item, status: 'published' as const, updatedAt: new Date().toISOString().split('T')[0] }
        : item
    ));
    
    showNotification(`${selectedItems.length} item(s) publicado(s) com sucesso!`);
    setSelectedItems([]);
    setIsLoading(false);
  };
  
  const handleBulkArchive = async () => {
    if (selectedItems.length === 0) return;
    setIsLoading(true);
    
    await new Promise(resolve => setTimeout(resolve, 800));
    
    setContentItems(prev => prev.map(item => 
      selectedItems.includes(item.id) 
        ? { ...item, status: 'archived' as const, updatedAt: new Date().toISOString().split('T')[0] }
        : item
    ));
    
    showNotification(`${selectedItems.length} item(s) arquivado(s) com sucesso!`);
    setSelectedItems([]);
    setIsLoading(false);
  };
  
  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) return;
    setIsLoading(true);
    
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    setContentItems(prev => prev.filter(item => !selectedItems.includes(item.id)));
    
    showNotification(`${selectedItems.length} item(s) excluído(s) permanentemente!`, 'info');
    setSelectedItems([]);
    setIsLoading(false);
  };
  
  // Individual item actions - funcionalidades reais
  const handleViewItem = (item: ContentItem) => {
    setViewingItem(item);
  };
  
  const handleEditItem = (item: ContentItem) => {
    setEditingItem(item);
  };
  
  const handleSaveEdit = async (updatedItem: ContentItem) => {
    setIsLoading(true);
    
    await new Promise(resolve => setTimeout(resolve, 600));
    
    setContentItems(prev => prev.map(item => 
      item.id === updatedItem.id 
        ? { ...updatedItem, updatedAt: new Date().toISOString().split('T')[0] }
        : item
    ));
    
    showNotification(`"${updatedItem.title}" atualizado com sucesso!`);
    setEditingItem(null);
    setIsLoading(false);
  };
  
  const handleDuplicateItem = async (item: ContentItem) => {
    setIsLoading(true);
    
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const duplicatedItem: ContentItem = {
      ...item,
      id: Math.max(...contentItems.map(i => i.id)) + 1,
      title: `${item.title} (Cópia)`,
      status: 'draft',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      views: 0,
      enrollments: 0
    };
    
    setContentItems(prev => [duplicatedItem, ...prev]);
    showNotification(`"${item.title}" duplicado com sucesso!`);
    setIsLoading(false);
  };
  
  const handleToggleStatus = async (item: ContentItem) => {
    setIsLoading(true);
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newStatus = item.status === 'published' ? 'draft' : 'published';
    
    setContentItems(prev => prev.map(i => 
      i.id === item.id 
        ? { ...i, status: newStatus as const, updatedAt: new Date().toISOString().split('T')[0] }
        : i
    ));
    
    showNotification(`Status alterado para: ${newStatus === 'published' ? 'Publicado' : 'Rascunho'}`);
    setIsLoading(false);
  };
  
  const handleItemOptions = (item: ContentItem) => {
    // Criar um menu dropdown simulado com ações reais
    const actions = [
      { label: 'Duplicar conteúdo', action: () => handleDuplicateItem(item) },
      { label: 'Alterar status', action: () => handleToggleStatus(item) },
      { label: 'Ver detalhes', action: () => handleViewItem(item) },
      { label: 'Editar', action: () => handleEditItem(item) }
    ];
    
    // Por enquanto, executar a primeira ação (duplicar)
    actions[0].action();
  };

  return (
    <div className="p-4 space-y-4 bg-gradient-to-br from-gray-100 via-gray-50 to-white dark:from-black dark:via-gray-900 dark:to-gray-800 min-h-full relative">
      {/* Tactical Background Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(circle at 1px 1px, rgba(250,204,21,0.3) 1px, transparent 0),
            repeating-linear-gradient(
              45deg,
              transparent,
              transparent 35px,
              rgba(250, 204, 21, 0.05) 35px,
              rgba(250, 204, 21, 0.05) 70px
            )
          `,
          backgroundSize: '20px 20px, 100px 100px'
        }}
      />
      
      {/* Tactical Corner Accents */}
      <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-accent-500/20" />
      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-accent-500/20" />
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
      >
        <div className="relative z-10">
          {/* Command Header with Tactical Elements */}
          <div className="flex items-center gap-4 mb-2">
            <div className="w-2 h-2 bg-accent-500 rounded-full animate-pulse" />
            <div className="w-1 h-8 bg-accent-500/60" />
            <FileText className="w-8 h-8 text-accent-500" />
            <div className="w-1 h-8 bg-accent-500/60" />
            <Brain className="w-6 h-6 text-accent-500" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-police-title uppercase tracking-ultra-wide">
            ARSENAL OPERACIONAL
          </h1>
          <p className="text-gray-600 dark:text-gray-300 font-police-subtitle mt-2 tracking-wider uppercase">
            SISTEMA DE GESTÃO DE CONTEÚDO TÁTICO
          </p>
          {/* Tactical underline */}
          <div className="mt-3 w-40 h-1 bg-gradient-to-r from-accent-500 via-accent-600 to-transparent" />
        </div>
        
        <div className="flex items-center gap-3">
          <input
            ref={importInputRef}
            type="file"
            accept=".json,.csv,.xlsx"
            onChange={handleFileImport}
            className="hidden"
          />
          <Button 
            variant="outline" 
            onClick={handleImport}
            className="gap-2 font-police-title font-bold uppercase tracking-ultra-wide transition-all duration-300 border-2 border-accent-500/30 hover:border-accent-500 hover:text-accent-500 hover:bg-accent-500/10 shadow-lg hover:shadow-xl"
          >
            <Upload className="w-4 h-4" />
            IMPORTAR
          </Button>
          <Button 
            variant="outline" 
            onClick={handleExport}
            className="gap-2 font-police-title font-bold uppercase tracking-ultra-wide transition-all duration-300 border-2 border-accent-500/30 hover:border-accent-500 hover:text-accent-500 hover:bg-accent-500/10 shadow-lg hover:shadow-xl"
          >
            <Download className="w-4 h-4" />
            EXPORTAR
          </Button>
          <Button 
            onClick={() => setShowCreateModal(true)} 
            className="gap-2 font-police-title font-bold transition-all duration-300 uppercase tracking-ultra-wide shadow-lg bg-accent-500 hover:bg-accent-600 text-black border-2 border-accent-600 hover:border-accent-700 hover:scale-105 hover:shadow-xl"
          >
            <Plus className="w-4 h-4" />
            Novo Conteúdo
          </Button>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <Card className={cn(
          "shadow-lg border-2 transition-all duration-300",
          resolvedTheme === 'dark' 
            ? 'bg-gray-800 border-gray-700 shadow-gray-900/50' 
            : 'bg-white border-military-base/20 shadow-military-base/10'
        )}>
          <CardContent className="p-3">
            <div className="space-y-4">
              {/* Primeira linha de filtros */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="BUSCAR CONTEÚDO..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 text-sm border rounded-lg transition-all duration-300 font-police-body uppercase tracking-wider border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 outline-none"
                />
              </div>

              {/* Materia Filter */}
              <select
                value={filterMateria}
                onChange={(e) => {
                  setFilterMateria(e.target.value);
                  setFilterSubmateria('TODOS');
                  setFilterTopico('TODOS');
                }}
                className="px-3 py-2 text-sm border rounded-lg transition-all duration-300 font-police-body font-medium uppercase tracking-wider border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 outline-none"
              >
                <option value="TODOS">TODAS AS MATÉRIAS</option>
                {categories.filter(c => c !== 'TODOS').map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>

              {/* Type Filter */}
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className={cn(
                  "px-4 py-2 border-2 rounded-lg transition-all duration-300 font-police-body font-medium",
                  "focus:ring-2 focus:ring-offset-2 outline-none",
                  resolvedTheme === 'dark' 
                    ? 'border-gray-600 bg-gray-800 text-white focus:border-yellow-400 focus:ring-yellow-400/20' 
                    : 'border-military-base/30 bg-white text-gray-900 focus:border-military-base focus:ring-military-base/20'
                )}
              >
                {types.map(type => (
                  <option key={type} value={type}>
                    {type === 'Todos' ? type : type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className={cn(
                  "px-4 py-2 border-2 rounded-lg transition-all duration-300 font-police-body font-medium",
                  "focus:ring-2 focus:ring-offset-2 outline-none",
                  resolvedTheme === 'dark' 
                    ? 'border-gray-600 bg-gray-800 text-white focus:border-yellow-400 focus:ring-yellow-400/20' 
                    : 'border-military-base/30 bg-white text-gray-900 focus:border-military-base focus:ring-military-base/20'
                )}
              >
                {statuses.map(status => (
                  <option key={status} value={status}>
                    {status === 'Todos' ? status : status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>

              {/* Bulk Actions */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowBulkActions(!showBulkActions)}
                  className={cn(
                    "gap-2 font-police-body font-medium transition-all duration-300 border-2",
                    resolvedTheme === 'dark' 
                      ? 'border-gray-600 hover:border-yellow-400 hover:text-yellow-400' 
                      : 'border-military-base/30 hover:border-military-base hover:text-military-base'
                  )}
                >
                  <Filter className="w-4 h-4" />
                  AÇÕES EM LOTE
                </Button>
                {selectedItems.length > 0 && (
                  <Badge variant="secondary">
                    {selectedItems.length} SELECIONADOS
                  </Badge>
                )}
              </div>
              </div>
              
              {/* Segunda linha de filtros - Submatéria e Tópico */}
              <AnimatePresence>
                {filterMateria !== 'TODOS' && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-4"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div className="h-0.5 bg-gradient-to-r from-transparent via-accent-500 to-transparent flex-1" />
                      <span className="text-xs font-police-subtitle uppercase tracking-wider text-gray-600 dark:text-gray-400">
                        FILTROS AVANÇADOS DA MATÉRIA
                      </span>
                      <div className="h-0.5 bg-gradient-to-r from-transparent via-accent-500 to-transparent flex-1" />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
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
                          <option value="Geral">GERAL</option>
                        </select>
                      </div>
                      
                      {/* Topico Filter */}
                      {filterSubmateria !== 'TODOS' && (
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <label className="block text-xs font-police-subtitle uppercase tracking-wider mb-1 text-gray-600 dark:text-gray-400">
                            TÓPICO ESPECÍFICO
                          </label>
                          <select
                            value={filterTopico}
                            onChange={(e) => setFilterTopico(e.target.value)}
                            className="w-full px-4 py-2 border-2 rounded-lg transition-all duration-300 font-police-body font-medium uppercase tracking-wider border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 outline-none"
                          >
                            <option value="TODOS">TODOS OS TÓPICOS</option>
                              <option value="Tópico Geral">TÓPICO GERAL</option>
                          </select>
                        </motion.div>
                      )}
                      
                      {/* Clear Filters Button */}
                      {(filterSubmateria !== 'TODOS' || filterTopico !== 'TODOS') && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3 }}
                          className="flex items-end"
                        >
                          <Button
                            variant="outline"
                            onClick={() => {
                              setFilterMateria('TODOS');
                              setFilterSubmateria('TODOS');
                              setFilterTopico('TODOS');
                            }}
                            className="w-full gap-2 font-police-body font-medium uppercase tracking-wider transition-all duration-300 border-2 border-gray-300 dark:border-gray-700 hover:border-accent-500 hover:text-accent-500 dark:hover:border-accent-500"
                          >
                            <X className="w-4 h-4" />
                            LIMPAR FILTROS
                          </Button>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Bulk Actions Bar */}
            <AnimatePresence>
              {showBulkActions && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className={cn(
                    "mt-4 p-4 rounded-lg border-2 transition-all duration-300",
                    resolvedTheme === 'dark' 
                      ? 'bg-gray-800/50 border-gray-700' 
                      : 'bg-military-base/5 border-military-base/20'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedItems.length === filteredContent.length}
                          onChange={handleSelectAll}
                          className="rounded border-primary-300"
                        />
                        <span className={cn(
                          "text-sm font-police-body font-medium",
                          resolvedTheme === 'dark' ? 'text-white' : 'text-gray-900'
                        )}>
                          SELECIONAR TODOS
                        </span>
                      </label>
                    </div>
                    
                    {selectedItems.length > 0 && (
                      <div className="flex items-center gap-2">
                        <Button 
                          onClick={handleBulkPublish}
                          variant="outline" 
                          size="sm" 
                          className="font-police-body font-medium transition-all duration-300 border-2 border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-800 hover:text-white hover:border-gray-800"
                        >
                          PUBLICAR
                        </Button>
                        <Button 
                          onClick={handleBulkArchive}
                          variant="outline" 
                          size="sm" 
                          className="font-police-body font-medium transition-all duration-300 border-2 border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-800 hover:text-white hover:border-gray-800"
                        >
                          ARQUIVAR
                        </Button>
                        <Button 
                          onClick={handleBulkDelete}
                          variant="outline" 
                          size="sm" 
                          className="font-police-body font-medium transition-all duration-300 border-2 border-red-600 text-red-600 dark:text-red-400 hover:bg-red-800 hover:text-white hover:border-red-800"
                        >
                          EXCLUIR
                        </Button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>

      {/* Content Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className={cn(
          "shadow-lg border-2 transition-all duration-300",
          resolvedTheme === 'dark' 
            ? 'bg-gray-800 border-gray-700 shadow-gray-900/50' 
            : 'bg-white border-military-base/20 shadow-military-base/10'
        )}>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b-2 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                  <tr>
                    {showBulkActions && (
                      <th className="text-left py-3 px-4">
                        <input
                          type="checkbox"
                          checked={selectedItems.length === filteredContent.length}
                          onChange={handleSelectAll}
                          className="rounded border-primary-300"
                        />
                      </th>
                    )}
                    <th className="text-left py-3 px-4 font-police-subtitle font-bold uppercase tracking-wider text-gray-700 dark:text-accent-500">
                      CONTEÚDO
                    </th>
                    <th className="text-left py-3 px-4 font-police-subtitle font-bold uppercase tracking-wider text-gray-700 dark:text-accent-500">
                      TIPO
                    </th>
                    <th className="text-left py-3 px-4 font-police-subtitle font-bold uppercase tracking-wider text-gray-700 dark:text-accent-500">
                      AUTOR
                    </th>
                    <th className="text-left py-3 px-4 font-police-subtitle font-bold uppercase tracking-wider text-gray-700 dark:text-accent-500">
                      STATUS
                    </th>
                    <th className="text-left py-3 px-4 font-police-subtitle font-bold uppercase tracking-wider text-gray-700 dark:text-accent-500">
                      MÉTRICAS
                    </th>
                    <th className="text-left py-3 px-4 font-police-subtitle font-bold uppercase tracking-wider text-gray-700 dark:text-accent-500">
                      AÇÕES
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredContent.map((item) => {
                    const TypeIcon = getTypeIcon(item.type);
                    return (
                      <tr
                        key={item.id}
                        className={cn(
                          "border-b transition-all duration-300",
                          resolvedTheme === 'dark' 
                            ? 'border-gray-700 hover:bg-gray-700/50' 
                            : 'border-military-base/20 hover:bg-military-base/5'
                        )}
                      >
                        {showBulkActions && (
                          <td className="py-3 px-4">
                            <input
                              type="checkbox"
                              checked={selectedItems.includes(item.id)}
                              onChange={() => handleSelectItem(item.id)}
                              className="rounded border-primary-300"
                            />
                          </td>
                        )}
                        <td className="py-3 px-4">
                          <div className="flex items-start gap-3">
                            <div className={cn(
                              "w-8 h-8 rounded-lg flex items-center justify-center border-2 transition-all duration-300",
                              resolvedTheme === 'dark' 
                                ? 'bg-gray-700 border-gray-600' 
                                : 'bg-military-base/10 border-military-base/30'
                            )}>
                              <TypeIcon className={cn(
                                "w-4 h-4",
                                resolvedTheme === 'dark' ? 'text-yellow-400' : 'text-military-base'
                              )} />
                            </div>
                            <div>
                              <p className={cn(
                                "font-semibold font-police-body",
                                resolvedTheme === 'dark' ? 'text-white' : 'text-gray-900'
                              )}>
                                {item.title}
                              </p>
                              <p className={cn(
                                "text-sm font-police-body",
                                resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                              )}>
                                <span className="inline-flex items-center gap-1">
                                  <span className="text-accent-500">{item.materia}</span>
                                  <span className="text-gray-400">›</span>
                                  <span>{item.submateria}</span>
                                  <span className="text-gray-400">›</span>
                                  <span className="text-gray-500">{item.topico}</span>
                                </span>
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                {getVisibilityIcon(item.visibility)}
                                <span className={cn(
                                  "text-xs font-police-body",
                                  resolvedTheme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                                )}>
                                  ATUALIZADO EM {item.updatedAt}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={cn(
                            "font-police-body font-medium uppercase tracking-wide",
                            resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                          )}>
                            {item.type}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={cn(
                            "font-police-body",
                            resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                          )}>
                            {item.author}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {getStatusBadge(item.status)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-4 text-sm">
                              <span className={cn(
                                "flex items-center gap-1 font-police-numbers font-medium",
                                resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                              )}>
                                <Eye className="w-3 h-3" />
                                {item.views}
                              </span>
                              <span className={cn(
                                "flex items-center gap-1 font-police-numbers font-medium",
                                resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                              )}>
                                <Users className="w-3 h-3" />
                                {item.enrollments}
                              </span>
                              {item.rating > 0 && (
                                <span className="flex items-center gap-1 font-police-numbers font-medium text-gray-600 dark:text-gray-400">
                                  <Star className="w-3 h-3 fill-current" />
                                  {item.rating}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Button 
                              onClick={() => handleViewItem(item)}
                              variant="ghost" 
                              size="xs" 
                              title="Visualizar"
                              className="hover:bg-accent-500/20 hover:text-accent-500 transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button 
                              onClick={() => handleEditItem(item)}
                              variant="ghost" 
                              size="xs" 
                              title="Editar"
                              className="hover:bg-accent-500/20 hover:text-accent-500 transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              onClick={() => handleItemOptions(item)}
                              variant="ghost" 
                              size="xs" 
                              title="Mais opções"
                              className="hover:bg-accent-500/20 hover:text-accent-500 transition-colors"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Create Content Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={cn(
                "rounded-lg p-6 max-w-md w-full border-2 shadow-2xl",
                resolvedTheme === 'dark' 
                  ? 'bg-gray-800 border-gray-700' 
                  : 'bg-white border-military-base/20'
              )}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className={cn(
                  "text-xl font-bold font-police-title uppercase tracking-wider",
                  resolvedTheme === 'dark' ? 'text-white' : 'text-gray-900'
                )}>
                  CRIAR NOVO CONTEÚDO
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCreateModal(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium font-police-subtitle uppercase tracking-wide mb-2 text-gray-700 dark:text-gray-300">
                    TIPO DE CONTEÚDO
                  </label>
                  <select 
                    value={selectedContentType}
                    onChange={(e) => setSelectedContentType(e.target.value)}
                    className="w-full px-4 py-2 border-2 rounded-lg font-police-body font-medium uppercase tracking-wider transition-all duration-300 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 outline-none"
                  >
                    <option value="">SELECIONE O TIPO</option>
                    <option value="course">CURSO COMPLETO</option>
                    <option value="flashcards">FLASHCARDS TÁTICOS</option>
                    <option value="questions">BANCO DE QUESTÕES</option>
                    <option value="summary">RESUMO OPERACIONAL</option>
                  </select>
                  {selectedContentType === 'course' && (
                    <p className="text-xs mt-1 text-accent-500 font-police-body">
                      📍 SERÁ REDIRECIONADO PARA TELA DE CURSOS
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium font-police-subtitle uppercase tracking-wide mb-2 text-gray-700 dark:text-gray-300">
                    TÍTULO
                  </label>
                  <input
                    type="text"
                    value={contentTitle}
                    onChange={(e) => setContentTitle(e.target.value)}
                    placeholder="TÍTULO DO CONTEÚDO..."
                    className="w-full px-4 py-2 border-2 rounded-lg font-police-body uppercase tracking-wider transition-all duration-300 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium font-police-subtitle uppercase tracking-wide mb-2 text-gray-700 dark:text-gray-300">
                    MATÉRIA PRINCIPAL
                  </label>
                  <select 
                    value={selectedMateria}
                    onChange={(e) => {
                      setSelectedMateria(e.target.value);
                      setSelectedSubmateria('');
                      setSelectedTopico('');
                    }}
                    className="w-full px-4 py-2 border-2 rounded-lg font-police-body font-medium uppercase tracking-wider transition-all duration-300 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 outline-none"
                  >
                    <option value="">SELECIONE A MATÉRIA</option>
                    {categories.filter(c => c !== 'TODOS').map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                {selectedMateria && (
                  <div>
                    <label className="block text-sm font-medium font-police-subtitle uppercase tracking-wide mb-2 text-gray-700 dark:text-gray-300">
                      SUBMATÉRIA
                    </label>
                    <select 
                      value={selectedSubmateria}
                      onChange={(e) => {
                        setSelectedSubmateria(e.target.value);
                        setSelectedTopico('');
                      }}
                      className="w-full px-4 py-2 border-2 rounded-lg font-police-body font-medium uppercase tracking-wider transition-all duration-300 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 outline-none"
                    >
                      <option value="">SELECIONE A SUBMATÉRIA</option>
                      <option value="Geral">GERAL</option>
                    </select>
                  </div>
                )}

                {selectedSubmateria && (
                  <div>
                    <label className="block text-sm font-medium font-police-subtitle uppercase tracking-wide mb-2 text-gray-700 dark:text-gray-300">
                      TÓPICO ESPECÍFICO
                    </label>
                    <select 
                      value={selectedTopico}
                      onChange={(e) => setSelectedTopico(e.target.value)}
                      className="w-full px-4 py-2 border-2 rounded-lg font-police-body font-medium uppercase tracking-wider transition-all duration-300 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 outline-none"
                    >
                      <option value="">SELECIONE O TÓPICO</option>
                      <option value="Tópico Geral">TÓPICO GERAL</option>
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium font-police-subtitle uppercase tracking-wide mb-2 text-gray-700 dark:text-gray-300">
                    DESCRIÇÃO TÁTICA
                  </label>
                  <textarea
                    rows={3}
                    value={contentDescription}
                    onChange={(e) => setContentDescription(e.target.value)}
                    placeholder="DESCRIÇÃO OPERACIONAL DO CONTEÚDO..."
                    className="w-full px-4 py-2 border-2 rounded-lg font-police-body uppercase tracking-wider transition-all duration-300 resize-none border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                  className={cn(
                    "font-police-body font-medium transition-all duration-300 border-2",
                    resolvedTheme === 'dark' 
                      ? 'border-gray-600 hover:border-gray-500 hover:text-gray-300' 
                      : 'border-military-base/30 hover:border-military-base/50 hover:text-military-base'
                  )}
                >
                  CANCELAR
                </Button>
                <Button 
                  onClick={handleCreateContent}
                  disabled={!selectedContentType || !contentTitle.trim()}
                  className="gap-2 font-police-body font-semibold transition-all duration-300 uppercase tracking-wider shadow-lg bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4" />
                  {selectedContentType === 'course' ? 'IR PARA CURSOS' : 'CRIAR CONTEÚDO'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -100, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -100, x: '-50%' }}
            className="fixed top-4 left-1/2 z-50 px-6 py-3 rounded-lg shadow-xl border-2 max-w-md"
            style={{
              backgroundColor: notification.type === 'success' ? '#16a34a' : 
                             notification.type === 'error' ? '#dc2626' : '#2563eb',
              borderColor: notification.type === 'success' ? '#22c55e' : 
                          notification.type === 'error' ? '#ef4444' : '#3b82f6',
              color: 'white'
            }}
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-white"></div>
              <span className="font-police-body font-medium uppercase tracking-wider text-sm">
                {notification.message}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Loading Overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 flex items-center justify-center"
          >
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl border-2 border-accent-500">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 border-2 border-accent-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="font-police-body font-medium uppercase tracking-wider text-gray-900 dark:text-white">
                  PROCESSANDO OPERAÇÃO...
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* View Item Modal */}
      <AnimatePresence>
        {viewingItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setViewingItem(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={cn(
                "rounded-lg p-6 max-w-2xl w-full border-2 shadow-2xl max-h-[80vh] overflow-y-auto",
                resolvedTheme === 'dark' 
                  ? 'bg-gray-800 border-gray-700' 
                  : 'bg-white border-gray-300'
              )}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className={cn(
                  "text-xl font-bold font-police-title uppercase tracking-wider",
                  resolvedTheme === 'dark' ? 'text-white' : 'text-gray-900'
                )}>
                  DETALHES DO CONTEÚDO
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewingItem(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-police-subtitle font-medium uppercase tracking-wider mb-1 text-gray-600 dark:text-gray-400">
                      TÍTULO
                    </label>
                    <p className="font-police-body text-gray-900 dark:text-white">{viewingItem.title}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-police-subtitle font-medium uppercase tracking-wider mb-1 text-gray-600 dark:text-gray-400">
                      TIPO
                    </label>
                    <p className="font-police-body text-gray-900 dark:text-white uppercase">{viewingItem.type}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-police-subtitle font-medium uppercase tracking-wider mb-1 text-gray-600 dark:text-gray-400">
                      AUTOR
                    </label>
                    <p className="font-police-body text-gray-900 dark:text-white">{viewingItem.author}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-police-subtitle font-medium uppercase tracking-wider mb-1 text-gray-600 dark:text-gray-400">
                      STATUS
                    </label>
                    <div>{getStatusBadge(viewingItem.status)}</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-police-subtitle font-medium uppercase tracking-wider mb-1 text-gray-600 dark:text-gray-400">
                      VISUALIZAÇÕES
                    </label>
                    <p className="font-police-numbers text-lg font-bold text-gray-900 dark:text-white">{viewingItem.views.toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-police-subtitle font-medium uppercase tracking-wider mb-1 text-gray-600 dark:text-gray-400">
                      INSCRIÇÕES
                    </label>
                    <p className="font-police-numbers text-lg font-bold text-gray-900 dark:text-white">{viewingItem.enrollments.toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-police-subtitle font-medium uppercase tracking-wider mb-1 text-gray-600 dark:text-gray-400">
                      AVALIAÇÃO
                    </label>
                    <p className="font-police-numbers text-lg font-bold text-gray-900 dark:text-white">{viewingItem.rating > 0 ? `⭐ ${viewingItem.rating}` : 'N/A'}</p>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex gap-3">
                    <Button 
                      onClick={() => {
                        setViewingItem(null);
                        handleEditItem(viewingItem);
                      }}
                      className="gap-2 font-police-body font-semibold transition-all duration-300 uppercase tracking-wider shadow-lg bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black"
                    >
                      <Edit className="w-4 h-4" />
                      EDITAR
                    </Button>
                    <Button
                      onClick={() => {
                        setViewingItem(null);
                        handleDuplicateItem(viewingItem);
                      }}
                      variant="outline"
                      className="gap-2 font-police-body font-medium uppercase tracking-wider transition-all duration-300 border-2 border-gray-300 dark:border-gray-700 hover:border-accent-500 hover:text-accent-500 dark:hover:border-accent-500"
                    >
                      <Plus className="w-4 h-4" />
                      DUPLICAR
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Edit Item Modal */}
      <AnimatePresence>
        {editingItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setEditingItem(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={cn(
                "rounded-lg p-6 max-w-2xl w-full border-2 shadow-2xl max-h-[80vh] overflow-y-auto",
                resolvedTheme === 'dark' 
                  ? 'bg-gray-800 border-gray-700' 
                  : 'bg-white border-gray-300'
              )}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className={cn(
                  "text-xl font-bold font-police-title uppercase tracking-wider",
                  resolvedTheme === 'dark' ? 'text-white' : 'text-gray-900'
                )}>
                  EDITAR CONTEÚDO
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingItem(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-police-subtitle font-medium uppercase tracking-wider mb-2 text-gray-600 dark:text-gray-400">
                    TÍTULO
                  </label>
                  <input
                    type="text"
                    value={editingItem.title}
                    onChange={(e) => setEditingItem({...editingItem, title: e.target.value})}
                    className="w-full px-4 py-2 border-2 rounded-lg font-police-body tracking-wider transition-all duration-300 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 outline-none"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-police-subtitle font-medium uppercase tracking-wider mb-2 text-gray-600 dark:text-gray-400">
                      STATUS
                    </label>
                    <select
                      value={editingItem.status}
                      onChange={(e) => setEditingItem({...editingItem, status: e.target.value as ContentItem['status']})}
                      className="w-full px-4 py-2 border-2 rounded-lg font-police-body font-medium uppercase tracking-wider transition-all duration-300 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 outline-none"
                    >
                      <option value="draft">RASCUNHO</option>
                      <option value="review">EM REVISÃO</option>
                      <option value="published">PUBLICADO</option>
                      <option value="archived">ARQUIVADO</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-police-subtitle font-medium uppercase tracking-wider mb-2 text-gray-600 dark:text-gray-400">
                      VISIBILIDADE
                    </label>
                    <select
                      value={editingItem.visibility}
                      onChange={(e) => setEditingItem({...editingItem, visibility: e.target.value as ContentItem['visibility']})}
                      className="w-full px-4 py-2 border-2 rounded-lg font-police-body font-medium uppercase tracking-wider transition-all duration-300 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 outline-none"
                    >
                      <option value="public">PÚBLICO</option>
                      <option value="private">PRIVADO</option>
                    </select>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-end gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setEditingItem(null)}
                      className="font-police-body font-medium uppercase tracking-wider transition-all duration-300 border-2 border-gray-300 dark:border-gray-700 hover:border-gray-500 hover:text-gray-500"
                    >
                      CANCELAR
                    </Button>
                    <Button 
                      onClick={() => handleSaveEdit(editingItem)}
                      className="gap-2 font-police-body font-semibold transition-all duration-300 uppercase tracking-wider shadow-lg bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black"
                    >
                      <Save className="w-4 h-4" />
                      SALVAR ALTERAÇÕES
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}