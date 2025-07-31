import { useState, useRef } from 'react';
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

// Estrutura de matérias para concursos policiais
const materias = {
  'DIREITO': {
    'Direito Constitucional': ['Princípios Fundamentais', 'Direitos e Garantias', 'Organização do Estado', 'Poderes da República'],
    'Direito Administrativo': ['Princípios', 'Atos Administrativos', 'Licitações', 'Contratos', 'Servidores Públicos'],
    'Direito Penal': ['Teoria do Crime', 'Crimes em Espécie', 'Penas', 'Extinção da Punibilidade'],
    'Direito Processual Penal': ['Inquérito Policial', 'Ação Penal', 'Provas', 'Prisões']
  },
  'SEGURANÇA PÚBLICA': {
    'Legislação Policial': ['Estatutos', 'Códigos de Conduta', 'Regulamentos'],
    'Táticas Operacionais': ['Abordagem', 'Uso da Força', 'Negociação'],
    'Investigação Criminal': ['Técnicas de Investigação', 'Perícia', 'Inteligência']
  },
  'CONHECIMENTOS GERAIS': {
    'Português': ['Gramática', 'Interpretação de Texto', 'Redação'],
    'Matemática': ['Raciocínio Lógico', 'Estatística', 'Matemática Básica'],
    'Informática': ['Hardware', 'Software', 'Segurança da Informação'],
    'História': ['História do Brasil', 'História Geral', 'Atualidades']
  }
};

// Mock data
const contentItems: ContentItem[] = [
  {
    id: 1,
    title: 'Direito Constitucional - Princípios Fundamentais',
    type: 'course',
    category: 'Direito',
    materia: 'DIREITO',
    submateria: 'Direito Constitucional',
    topico: 'Princípios Fundamentais',
    author: 'Prof. Dr. Carlos Lima',
    status: 'published',
    visibility: 'public',
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15',
    views: 1234,
    enrollments: 89,
    rating: 4.8,
    lessons: 24,
    duration: '12h 30m'
  },
  {
    id: 2,
    title: 'Matemática Básica - Álgebra Linear',
    type: 'course',
    category: 'Matemática',
    materia: 'CONHECIMENTOS GERAIS',
    submateria: 'Matemática',
    topico: 'Matemática Básica',
    author: 'Prof. Ana Santos',
    status: 'draft',
    visibility: 'private',
    createdAt: '2024-01-14',
    updatedAt: '2024-01-14',
    views: 0,
    enrollments: 0,
    rating: 0,
    lessons: 18,
    duration: '8h 45m'
  },
  {
    id: 3,
    title: 'Português - Gramática Avançada',
    type: 'course',
    category: 'Português',
    materia: 'CONHECIMENTOS GERAIS',
    submateria: 'Português',
    topico: 'Gramática',
    author: 'Prof. Maria Oliveira',
    status: 'published',
    visibility: 'public',
    createdAt: '2024-01-13',
    updatedAt: '2024-01-13',
    views: 856,
    enrollments: 67,
    rating: 4.6,
    lessons: 32,
    duration: '15h 20m'
  },
  {
    id: 4,
    title: 'Flashcards - Vocabulário Jurídico',
    type: 'flashcards',
    category: 'Direito',
    materia: 'DIREITO',
    submateria: 'Direito Penal',
    topico: 'Teoria do Crime',
    author: 'Sistema',
    status: 'published',
    visibility: 'public',
    createdAt: '2024-01-12',
    updatedAt: '2024-01-12',
    views: 543,
    enrollments: 145,
    rating: 4.9,
    cards: 250,
    decks: 5
  },
  {
    id: 5,
    title: 'Questões ENEM 2023 - Matemática',
    type: 'questions',
    category: 'Matemática',
    materia: 'CONHECIMENTOS GERAIS',
    submateria: 'Matemática',
    topico: 'Raciocínio Lógico',
    author: 'Prof. João Costa',
    status: 'published',
    visibility: 'public',
    createdAt: '2024-01-11',
    updatedAt: '2024-01-11',
    views: 923,
    enrollments: 78,
    rating: 4.7,
    questions: 180,
    difficulty: 'medium'
  },
  {
    id: 6,
    title: 'Resumo Interativo - História do Brasil',
    type: 'summary',
    category: 'História',
    materia: 'CONHECIMENTOS GERAIS',
    submateria: 'História',
    topico: 'História do Brasil',
    author: 'Prof. Patricia Lima',
    status: 'review',
    visibility: 'private',
    createdAt: '2024-01-10',
    updatedAt: '2024-01-10',
    views: 234,
    enrollments: 23,
    rating: 4.5,
    pages: 45,
    interactions: 78
  },
  {
    id: 7,
    title: 'Técnicas de Abordagem - Táticas Operacionais',
    type: 'course',
    category: 'Segurança',
    materia: 'SEGURANÇA PÚBLICA',
    submateria: 'Táticas Operacionais',
    topico: 'Abordagem',
    author: 'Instrutor Silva',
    status: 'published',
    visibility: 'public',
    createdAt: '2024-01-09',
    updatedAt: '2024-01-09',
    views: 1567,
    enrollments: 234,
    rating: 4.9,
    lessons: 18,
    duration: '10h 15m'
  },
  {
    id: 8,
    title: 'Direito Administrativo - Licitações e Contratos',
    type: 'course',
    category: 'Direito',
    materia: 'DIREITO',
    submateria: 'Direito Administrativo',
    topico: 'Licitações',
    author: 'Prof. Dr. Carlos Lima',
    status: 'published',
    visibility: 'public',
    createdAt: '2024-01-08',
    updatedAt: '2024-01-08',
    views: 892,
    enrollments: 156,
    rating: 4.7,
    lessons: 28,
    duration: '14h 45m'
  }
];

const categories = ['TODOS', 'DIREITO', 'SEGURANÇA PÚBLICA', 'CONHECIMENTOS GERAIS', 'TÁTICO', 'OPERACIONAL'];
const types = ['Todos', 'course', 'flashcards', 'questions', 'summary'];
const statuses = ['Todos', 'published', 'draft', 'review', 'archived'];

import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/utils/cn';

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
  
  // Import/Export functionality
  const handleImport = () => {
    importInputRef.current?.click();
  };
  
  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // TODO: Implement actual import logic
      console.log('Importando arquivo:', file.name);
      alert(`Importando: ${file.name}\nFuncionalidade em desenvolvimento.`);
    }
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
  
  // Bulk actions
  const handleBulkPublish = () => {
    if (selectedItems.length === 0) return;
    alert(`📢 PUBLICANDO ${selectedItems.length} ITEM(S)\n\n✅ Operação executada com sucesso!\n\n🚧 Funcionalidade em desenvolvimento.`);
  };
  
  const handleBulkArchive = () => {
    if (selectedItems.length === 0) return;
    if (confirm(`📦 ARQUIVAR ${selectedItems.length} ITEM(S)?\n\nEsta ação pode ser desfeita posteriormente.`)) {
      alert(`📦 ${selectedItems.length} item(s) arquivado(s) com sucesso!\n\n🚧 Funcionalidade em desenvolvimento.`);
      setSelectedItems([]);
    }
  };
  
  const handleBulkDelete = () => {
    if (selectedItems.length === 0) return;
    if (confirm(`🗑️ EXCLUIR ${selectedItems.length} ITEM(S)?\n\n⚠️ ATENÇÃO: Esta ação é IRREVERSÍVEL!`)) {
      alert(`🗑️ ${selectedItems.length} item(s) excluído(s) permanentemente!\n\n🚧 Funcionalidade em desenvolvimento.`);
      setSelectedItems([]);
    }
  };
  
  // Individual item actions
  const handleViewItem = (item: ContentItem) => {
    alert(`👁️ VISUALIZANDO: ${item.title}\n\n📋 Tipo: ${item.type}\n📚 Matéria: ${item.materia}\n👤 Autor: ${item.author}\n📊 Status: ${item.status}\n\n🚧 Funcionalidade em desenvolvimento.`);
  };
  
  const handleEditItem = (item: ContentItem) => {
    alert(`✏️ EDITANDO: ${item.title}\n\n🔧 Abrindo editor para tipo: ${item.type}\n\n🚧 Funcionalidade em desenvolvimento.`);
  };
  
  const handleItemOptions = (item: ContentItem) => {
    const options = [
      '📋 Duplicar conteúdo',
      '📊 Ver estatísticas',
      '🔄 Alterar status',
      '👥 Gerenciar permissões',
      '📤 Exportar individual',
      '🗑️ Mover para lixeira'
    ];
    
    alert(`⚙️ OPÇÕES PARA: ${item.title}\n\n${options.map((opt, i) => `${i + 1}. ${opt}`).join('\n')}\n\n🚧 Funcionalidade em desenvolvimento.`);
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-full">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-police-title uppercase tracking-ultra-wide">
            CENTRAL DE CONTEÚDO TÁTICO
          </h1>
          <p className="text-gray-600 dark:text-gray-300 font-police-body mt-2 tracking-wider">
            GERENCIAMENTO DE MATERIAL DIDÁTICO OPERACIONAL
          </p>
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
            className="gap-2 font-police-body font-medium uppercase tracking-wider transition-all duration-300 border-2 border-gray-300 dark:border-gray-700 hover:border-accent-500 hover:text-accent-500 dark:hover:border-accent-500"
          >
            <Upload className="w-4 h-4" />
            IMPORTAR
          </Button>
          <Button 
            variant="outline" 
            onClick={handleExport}
            className="gap-2 font-police-body font-medium uppercase tracking-wider transition-all duration-300 border-2 border-gray-300 dark:border-gray-700 hover:border-accent-500 hover:text-accent-500 dark:hover:border-accent-500"
          >
            <Download className="w-4 h-4" />
            EXPORTAR
          </Button>
          <Button 
            onClick={() => setShowCreateModal(true)} 
            className={cn(
              "gap-2 font-police-body font-semibold transition-all duration-300 uppercase tracking-wider shadow-lg",
              resolvedTheme === 'dark' 
                ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-gray-900 shadow-yellow-500/20' 
                : 'bg-gradient-to-r from-military-base to-military-base/90 hover:from-military-base/90 hover:to-military-base text-white shadow-military-base/30'
            )}
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
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Primeira linha de filtros */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="BUSCAR CONTEÚDO..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border-2 rounded-lg transition-all duration-300 font-police-body uppercase tracking-wider border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 outline-none"
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
                className="px-4 py-2 border-2 rounded-lg transition-all duration-300 font-police-body font-medium uppercase tracking-wider border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 outline-none"
              >
                <option value="TODOS">TODAS AS MATÉRIAS</option>
                {Object.keys(materias).map(materia => (
                  <option key={materia} value={materia}>{materia}</option>
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
                            <option key={submateria} value={submateria}>{submateria}</option>
                          ))}
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
                            {(materias[filterMateria as keyof typeof materias]?.[filterSubmateria as keyof typeof materias[keyof typeof materias]] || []).map((topico: string) => (
                              <option key={topico} value={topico}>{topico}</option>
                            ))}
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
                      <th className="text-left py-4 px-6">
                        <input
                          type="checkbox"
                          checked={selectedItems.length === filteredContent.length}
                          onChange={handleSelectAll}
                          className="rounded border-primary-300"
                        />
                      </th>
                    )}
                    <th className="text-left py-4 px-6 font-police-subtitle font-bold uppercase tracking-wider text-gray-700 dark:text-accent-500">
                      CONTEÚDO
                    </th>
                    <th className="text-left py-4 px-6 font-police-subtitle font-bold uppercase tracking-wider text-gray-700 dark:text-accent-500">
                      TIPO
                    </th>
                    <th className="text-left py-4 px-6 font-police-subtitle font-bold uppercase tracking-wider text-gray-700 dark:text-accent-500">
                      AUTOR
                    </th>
                    <th className="text-left py-4 px-6 font-police-subtitle font-bold uppercase tracking-wider text-gray-700 dark:text-accent-500">
                      STATUS
                    </th>
                    <th className="text-left py-4 px-6 font-police-subtitle font-bold uppercase tracking-wider text-gray-700 dark:text-accent-500">
                      MÉTRICAS
                    </th>
                    <th className="text-left py-4 px-6 font-police-subtitle font-bold uppercase tracking-wider text-gray-700 dark:text-accent-500">
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
                          <td className="py-4 px-6">
                            <input
                              type="checkbox"
                              checked={selectedItems.includes(item.id)}
                              onChange={() => handleSelectItem(item.id)}
                              className="rounded border-primary-300"
                            />
                          </td>
                        )}
                        <td className="py-4 px-6">
                          <div className="flex items-start gap-3">
                            <div className={cn(
                              "w-10 h-10 rounded-lg flex items-center justify-center border-2 transition-all duration-300",
                              resolvedTheme === 'dark' 
                                ? 'bg-gray-700 border-gray-600' 
                                : 'bg-military-base/10 border-military-base/30'
                            )}>
                              <TypeIcon className={cn(
                                "w-5 h-5",
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
                        <td className="py-4 px-6">
                          <span className={cn(
                            "font-police-body font-medium uppercase tracking-wide",
                            resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                          )}>
                            {item.type}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className={cn(
                            "font-police-body",
                            resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                          )}>
                            {item.author}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          {getStatusBadge(item.status)}
                        </td>
                        <td className="py-4 px-6">
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
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <Button 
                              onClick={() => handleViewItem(item)}
                              variant="ghost" 
                              size="sm" 
                              title="Visualizar"
                              className="hover:bg-accent-500/20 hover:text-accent-500 transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button 
                              onClick={() => handleEditItem(item)}
                              variant="ghost" 
                              size="sm" 
                              title="Editar"
                              className="hover:bg-accent-500/20 hover:text-accent-500 transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              onClick={() => handleItemOptions(item)}
                              variant="ghost" 
                              size="sm" 
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
                    {Object.keys(materias).map(materia => (
                      <option key={materia} value={materia}>{materia}</option>
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
                      {Object.keys(materias[selectedMateria as keyof typeof materias]).map(submateria => (
                        <option key={submateria} value={submateria}>{submateria}</option>
                      ))}
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
                      {materias[selectedMateria as keyof typeof materias][selectedSubmateria as keyof typeof materias[keyof typeof materias]].map((topico: string) => (
                        <option key={topico} value={topico}>{topico}</option>
                      ))}
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
    </div>
  );
}