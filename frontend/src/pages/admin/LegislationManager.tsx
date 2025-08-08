import { useState } from 'react';
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
  Scale,
  Calendar,
  Tag,
  Folder,
  MoreVertical,
  X,
  Save,
  CheckCircle,
  AlertCircle,
  Link2,
  ExternalLink,
  Book,
  Gavel,
  FileCheck,
  History,
  Users,
  Building,
  Shield,
  Target,
  Crosshair,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import toast from 'react-hot-toast';

// Mock data for legislation
const legislations = [
  {
    id: 1,
    title: 'Constituição Federal de 1988',
    type: 'constituicao',
    number: 'CF/1988',
    category: 'Constitucional',
    subMateria: 'Direitos Fundamentais',
    status: 'vigente',
    publishDate: '1988-10-05',
    lastUpdate: '2024-01-15',
    articles: 250,
    views: 15678,
    linkedCourses: ['Polícia Federal', 'Receita Federal', 'TRT/TRF'],
    tags: ['constituição', 'direitos fundamentais', 'organização do estado'],
    description: 'A Constituição da República Federativa do Brasil de 1988',
    url: 'http://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm'
  },
  {
    id: 2,
    title: 'Código Penal',
    type: 'lei',
    number: 'Decreto-Lei nº 2.848/1940',
    category: 'Penal',
    subMateria: 'Crimes Contra a Pessoa',
    status: 'vigente',
    publishDate: '1940-12-07',
    lastUpdate: '2023-12-20',
    articles: 361,
    views: 8923,
    linkedCourses: ['Polícia Federal', 'Polícia Civil'],
    tags: ['código penal', 'crimes', 'penas'],
    description: 'Código Penal Brasileiro',
    url: 'http://www.planalto.gov.br/ccivil_03/decreto-lei/del2848compilado.htm'
  },
  {
    id: 3,
    title: 'Lei de Licitações e Contratos',
    type: 'lei',
    number: 'Lei nº 14.133/2021',
    category: 'Administrativo',
    subMateria: 'Licitações e Contratos',
    status: 'vigente',
    publishDate: '2021-04-01',
    lastUpdate: '2023-11-10',
    articles: 194,
    views: 6754,
    linkedCourses: ['TCU', 'CGU', 'Tribunais'],
    tags: ['licitações', 'contratos', 'administração pública'],
    description: 'Nova Lei de Licitações e Contratos Administrativos',
    url: 'http://www.planalto.gov.br/ccivil_03/_ato2019-2022/2021/lei/L14133.htm'
  },
  {
    id: 4,
    title: 'Código Tributário Nacional',
    type: 'lei',
    number: 'Lei nº 5.172/1966',
    category: 'Tributário',
    subMateria: 'Impostos Federais',
    status: 'vigente',
    publishDate: '1966-10-25',
    lastUpdate: '2023-09-15',
    articles: 218,
    views: 4532,
    linkedCourses: ['Receita Federal', 'SEFAZ'],
    tags: ['tributos', 'impostos', 'obrigação tributária'],
    description: 'Dispõe sobre o Sistema Tributário Nacional',
    url: 'http://www.planalto.gov.br/ccivil_03/leis/l5172compilado.htm'
  },
  {
    id: 5,
    title: 'Lei Maria da Penha',
    type: 'lei',
    number: 'Lei nº 11.340/2006',
    category: 'Penal',
    subMateria: 'Violência Doméstica',
    status: 'vigente',
    publishDate: '2006-08-07',
    lastUpdate: '2023-06-22',
    articles: 46,
    views: 3421,
    linkedCourses: ['Polícia Civil', 'Defensoria Pública'],
    tags: ['violência doméstica', 'mulher', 'proteção'],
    description: 'Lei de combate à violência doméstica e familiar contra a mulher',
    url: 'http://www.planalto.gov.br/ccivil_03/_ato2004-2006/2006/lei/l11340.htm'
  }
];

const categories = ['Todos', 'Constitucional', 'Administrativo', 'Penal', 'Tributário', 'Civil', 'Trabalhista'];
const types = ['Todos', 'constituicao', 'lei', 'decreto', 'medida_provisoria', 'sumula'];
const statuses = ['Todos', 'vigente', 'revogada', 'alterada'];

// Submatérias por categoria
const subMaterias: { [key: string]: string[] } = {
  'Constitucional': ['Todas', 'Direitos Fundamentais', 'Organização do Estado', 'Organização dos Poderes', 'Defesa do Estado', 'Tributação', 'Ordem Econômica', 'Ordem Social'],
  'Administrativo': ['Todas', 'Licitações e Contratos', 'Servidores Públicos', 'Processo Administrativo', 'Responsabilidade Civil', 'Improbidade', 'Controle Interno', 'Transparência'],
  'Penal': ['Todas', 'Crimes Contra a Pessoa', 'Crimes Contra o Patrimônio', 'Crimes Contra a Administração', 'Violência Doméstica', 'Drogas', 'Lavagem de Dinheiro', 'Crimes Digitais'],
  'Tributário': ['Todas', 'Impostos Federais', 'Impostos Estaduais', 'Impostos Municipais', 'Contribuições', 'Processo Tributário', 'Execução Fiscal', 'Planejamento Tributário'],
  'Civil': ['Todas', 'Direito das Obrigações', 'Direito dos Contratos', 'Direito de Família', 'Direito das Sucessões', 'Direito Imobiliário', 'Responsabilidade Civil', 'Direito do Consumidor'],
  'Trabalhista': ['Todas', 'Direito Individual', 'Direito Coletivo', 'Processo Trabalhista', 'Segurança do Trabalho', 'Previdência Social', 'Terceirização', 'Sindical']
};

// Mock data for courses to link
const availableCourses = [
  'Polícia Federal - Agente',
  'Receita Federal - Auditor',
  'TRT/TRF - Analista',
  'TCU - Auditor',
  'CGU - Analista',
  'SEFAZ - Auditor',
  'Polícia Civil',
  'Defensoria Pública'
];

export default function LegislationManager() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [selectedSubMateria, setSelectedSubMateria] = useState('Todas');
  const [selectedType, setSelectedType] = useState('Todos');
  const [selectedStatus, setSelectedStatus] = useState('Todos');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [dateFilter, setDateFilter] = useState('');
  const [sortBy, setSortBy] = useState('title');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showLegislationModal, setShowLegislationModal] = useState(false);
  const [selectedLegislation, setSelectedLegislation] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [selectedLinkedCourses, setSelectedLinkedCourses] = useState<string[]>([]);

  const filteredLegislations = legislations
    .filter(legislation => {
      const matchesSearch = legislation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           legislation.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           legislation.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = selectedCategory === 'Todos' || legislation.category === selectedCategory;
      const matchesSubMateria = selectedSubMateria === 'Todas' || 
                               (legislation.subMateria && legislation.subMateria === selectedSubMateria);
      const matchesType = selectedType === 'Todos' || legislation.type === selectedType;
      const matchesStatus = selectedStatus === 'Todos' || legislation.status === selectedStatus;
      
      let matchesDate = true;
      if (dateFilter) {
        const legislationYear = new Date(legislation.publishDate).getFullYear();
        const currentYear = new Date().getFullYear();
        
        switch (dateFilter) {
          case 'thisYear':
            matchesDate = legislationYear === currentYear;
            break;
          case 'lastYear':
            matchesDate = legislationYear === currentYear - 1;
            break;
          case 'last5Years':
            matchesDate = legislationYear >= currentYear - 5;
            break;
          case 'older':
            matchesDate = legislationYear < currentYear - 5;
            break;
        }
      }
      
      return matchesSearch && matchesCategory && matchesSubMateria && matchesType && matchesStatus && matchesDate;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'date':
          comparison = new Date(a.publishDate).getTime() - new Date(b.publishDate).getTime();
          break;
        case 'views':
          comparison = a.views - b.views;
          break;
        case 'articles':
          comparison = a.articles - b.articles;
          break;
        default:
          comparison = 0;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      vigente: { label: 'VIGENTE', color: 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300' },
      revogada: { label: 'REVOGADA', color: 'bg-gray-400 text-white dark:bg-gray-600 dark:text-gray-200' },
      alterada: { label: 'ALTERADA', color: 'bg-gray-300 text-gray-700 dark:bg-gray-600 dark:text-gray-300' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <Badge className={`${config.color} font-police-body font-semibold uppercase tracking-wider`}>
        {config.label}
      </Badge>
    );
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      constituicao: Scale,
      lei: Gavel,
      decreto: FileCheck,
      medida_provisoria: FileText,
      sumula: Book
    };
    return icons[type as keyof typeof icons] || FileText;
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      constituicao: 'Constituição',
      lei: 'Lei',
      decreto: 'Decreto',
      medida_provisoria: 'Medida Provisória',
      sumula: 'Súmula'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const handleCreateLegislation = () => {
    navigate('/admin/legislation/new');
    toast.success('Redirecionando para nova legislação', {
      duration: 2000,
      icon: '📋'
    });
  };

  const handleEditLegislation = (legislation: any) => {
    setSelectedLegislation(legislation);
    setIsEditing(true);
    setShowLegislationModal(true);
    setActiveTab('details');
    setSelectedLinkedCourses(legislation.linkedCourses || []);
    toast.success(`Editando: ${legislation.title}`, {
      duration: 2000,
      icon: '✏️'
    });
  };

  const handleViewLegislation = (legislation: any) => {
    setSelectedLegislation(legislation);
    setIsEditing(false);
    setShowLegislationModal(true);
    setActiveTab('details');
    setSelectedLinkedCourses(legislation.linkedCourses || []);
    toast.success(`Visualizando: ${legislation.title}`, {
      duration: 2000,
      icon: '👁️'
    });
  };

  const toggleCourseLink = (course: string) => {
    setSelectedLinkedCourses(prev => {
      const isRemoving = prev.includes(course);
      const newList = isRemoving
        ? prev.filter(c => c !== course)
        : [...prev, course];
      
      toast.success(
        isRemoving ? `Curso ${course} desvinculado` : `Curso ${course} vinculado`,
        {
          duration: 2000,
          icon: isRemoving ? '🔗❌' : '🔗✅'
        }
      );
      
      return newList;
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header Militar/Tático */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-gray-800 via-[#14242f] to-gray-900 dark:from-gray-900 dark:via-[#14242f] dark:to-black p-8 rounded-lg relative overflow-hidden mb-6"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,204,21,0.3) 1px, transparent 0)',
          backgroundSize: '20px 20px'
        }}
      >
        {/* Corner accents */}
        <div className="absolute top-0 right-0 w-20 h-20 border-t-4 border-r-4 border-accent-500/30" />
        <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-accent-500/20" />
        
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
          <div className="border-l-4 border-l-accent-500 pl-6">
            <h1 className="text-4xl font-police-title font-bold uppercase tracking-wider text-white">
              CÓDIGOS OPERACIONAIS
            </h1>
            <p className="text-gray-300 font-police-subtitle uppercase tracking-wider mt-1">
              SISTEMA INTEGRADO DE GESTÃO JURÍDICA TÁTICA
            </p>
          </div>
        
          <div className="flex flex-wrap items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={() => {
                toast.success('IMPORTAÇÃO TÁTICA DE CÓDIGOS ATIVADA', {
                  duration: 3000,
                  icon: '🎯'
                });
              }}
              className="gap-2 font-police-body uppercase tracking-wider hover:bg-white/10 text-white hover:text-accent-500 border border-transparent hover:border-accent-500/30 transition-all duration-300"
            >
              <Upload className="w-5 h-5" />
              IMPORTAR CÓDIGOS
            </Button>
            <Button 
              onClick={handleCreateLegislation} 
              className="gap-2 bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black font-police-body font-bold uppercase tracking-wider transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <Plus className="w-5 h-5" />
              NOVO CÓDIGO
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-accent-500/30 shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-accent-500" />
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-police-subtitle font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  TOTAL DE CÓDIGOS
                </p>
                <p className="text-2xl font-police-numbers font-bold text-gray-900 dark:text-white">
                  {legislations.length}
                </p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-gray-700 to-gray-900 rounded-lg flex items-center justify-center shadow-lg">
                <Shield className="w-7 h-7 text-accent-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-accent-500/30 shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-green-500" />
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-police-subtitle font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  OPERACIONAIS
                </p>
                <p className="text-2xl font-police-numbers font-bold text-gray-900 dark:text-white">
                  {legislations.filter(l => l.status === 'vigente').length}
                </p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-lg">
                <Target className="w-7 h-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-accent-500/30 shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-blue-500" />
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-police-subtitle font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  ARTIGOS TÁTICOS
                </p>
                <p className="text-2xl font-police-numbers font-bold text-gray-900 dark:text-white">
                  {legislations.reduce((acc, l) => acc + l.articles, 0)}
                </p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                <Crosshair className="w-7 h-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-police-body font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  VISUALIZAÇÕES
                </p>
                <p className="text-2xl font-police-numbers font-bold text-gray-900 dark:text-white">
                  {legislations.reduce((acc, l) => acc + l.views, 0).toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-gray-600 rounded-lg flex items-center justify-center">
                <Eye className="w-6 h-6 text-white" />
              </div>
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
        <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700">
          <CardContent className="p-4">
            <div className="space-y-4">
              {/* Filtros Principais */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              <div className="relative lg:col-span-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="BUSCAR LEGISLAÇÃO..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body placeholder:font-police-body placeholder:uppercase placeholder:tracking-wider focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                />
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setSelectedSubMateria('Todas'); // Reset submatéria when category changes
                }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body uppercase tracking-wider focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category.toUpperCase()}</option>
                ))}
              </select>

              <select
                value={selectedSubMateria}
                onChange={(e) => setSelectedSubMateria(e.target.value)}
                disabled={selectedCategory === 'Todos'}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body uppercase tracking-wider focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {(selectedCategory !== 'Todos' ? subMaterias[selectedCategory] || ['Todas'] : ['Todas']).map(subMateria => (
                  <option key={subMateria} value={subMateria}>{subMateria.toUpperCase()}</option>
                ))}
              </select>

              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body uppercase tracking-wider focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
              >
                {types.map(type => (
                  <option key={type} value={type}>
                    {type === 'Todos' ? type.toUpperCase() : getTypeLabel(type).toUpperCase()}
                  </option>
                ))}
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body uppercase tracking-wider focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
              >
                {statuses.map(status => (
                  <option key={status} value={status}>
                    {status === 'Todos' ? status.toUpperCase() : status.toUpperCase()}
                  </option>
                ))}
              </select>
              </div>
              
              {/* Botão Filtros Avançados */}
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className="gap-2 font-police-body uppercase tracking-wider border-gray-300 dark:border-gray-600 hover:border-accent-500 dark:hover:border-accent-500 transition-colors"
                >
                  <Filter className="w-4 h-4" />
                  {showAdvancedFilters ? 'OCULTAR FILTROS' : 'FILTROS AVANÇADOS'}
                </Button>
                
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 font-police-body">
                  <span className="uppercase tracking-wider">RESULTADOS:</span>
                  <span className="font-police-numbers font-bold text-accent-500">
                    {filteredLegislations.length}
                  </span>
                  <span className="uppercase tracking-wider">DE</span>
                  <span className="font-police-numbers font-bold">
                    {legislations.length}
                  </span>
                </div>
              </div>
              
              {/* Filtros Avançados */}
              {showAdvancedFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                        FILTRO POR DATA
                      </label>
                      <select
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-police-body uppercase tracking-wider focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                      >
                        <option value="">TODAS AS DATAS</option>
                        <option value="thisYear">ESTE ANO</option>
                        <option value="lastYear">ANO PASSADO</option>
                        <option value="last5Years">ÚLTIMOS 5 ANOS</option>
                        <option value="older">MAIS DE 5 ANOS</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                        ORDENAR POR
                      </label>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-police-body uppercase tracking-wider focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                      >
                        <option value="title">TÍTULO</option>
                        <option value="date">DATA DE PUBLICAÇÃO</option>
                        <option value="views">VISUALIZAÇÕES</option>
                        <option value="articles">NÚMERO DE ARTIGOS</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                        ORDEM
                      </label>
                      <select
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-police-body uppercase tracking-wider focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                      >
                        <option value="asc">CRESCENTE</option>
                        <option value="desc">DECRESCENTE</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex justify-end mt-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchTerm('');
                        setSelectedCategory('Todos');
                        setSelectedSubMateria('Todas');
                        setSelectedType('Todos');
                        setSelectedStatus('Todos');
                        setDateFilter('');
                        setSortBy('title');
                        setSortOrder('asc');
                        toast.success('Filtros limpos', {
                          duration: 2000,
                          icon: '🧹'
                        });
                      }}
                      className="gap-2 font-police-body uppercase tracking-wider border-gray-300 dark:border-gray-600 hover:border-accent-500 dark:hover:border-accent-500 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      LIMPAR FILTROS
                    </Button>
                  </div>
                </motion.div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Legislation Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 dark:bg-gray-800/80">
                  <tr>
                    <th className="text-left py-4 px-6 font-police-subtitle font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                      LEGISLAÇÃO
                    </th>
                    <th className="text-left py-4 px-6 font-police-subtitle font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                      TIPO/NÚMERO
                    </th>
                    <th className="text-left py-4 px-6 font-police-subtitle font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                      CATEGORIA
                    </th>
                    <th className="text-left py-4 px-6 font-police-subtitle font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                      STATUS
                    </th>
                    <th className="text-left py-4 px-6 font-police-subtitle font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                      MÉTRICAS
                    </th>
                    <th className="text-left py-4 px-6 font-police-subtitle font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                      AÇÕES
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLegislations.map((legislation) => {
                    const TypeIcon = getTypeIcon(legislation.type);
                    return (
                      <tr
                        key={legislation.id}
                        className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0 border-2 border-gray-300 dark:border-gray-700">
                              <TypeIcon className="w-5 h-5 text-gray-700 dark:text-accent-500" />
                            </div>
                            <div>
                              <p className="font-police-subtitle font-medium text-gray-900 dark:text-white">
                                {legislation.title}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 font-police-body">
                                {legislation.description}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                {legislation.tags.slice(0, 3).map((tag, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs font-police-body uppercase tracking-wider">
                                    {tag.toUpperCase()}
                                  </Badge>
                                ))}
                                {legislation.tags.length > 3 && (
                                  <span className="text-xs text-gray-500 dark:text-gray-500 font-police-numbers">
                                    +{legislation.tags.length - 3} MAIS
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div>
                            <p className="text-sm font-police-body font-medium text-gray-900 dark:text-white uppercase tracking-wider">
                              {getTypeLabel(legislation.type)}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 font-police-numbers">
                              {legislation.number}
                            </p>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <Badge variant="outline" className="border-gray-300 dark:border-gray-600 font-police-body font-semibold uppercase tracking-wider">
                            {legislation.category.toUpperCase()}
                          </Badge>
                        </td>
                        <td className="py-4 px-6">
                          {getStatusBadge(legislation.status)}
                        </td>
                        <td className="py-4 px-6">
                          <div className="space-y-1 text-sm">
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                              <Eye className="w-3 h-3" />
                              <span className="font-police-numbers">{legislation.views.toLocaleString()}</span>
                              <span className="font-police-body uppercase tracking-wider">VIEWS</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                              <FileText className="w-3 h-3" />
                              <span className="font-police-numbers">{legislation.articles}</span>
                              <span className="font-police-body uppercase tracking-wider">ARTIGOS</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                              <Building className="w-3 h-3" />
                              <span className="font-police-numbers">{legislation.linkedCourses.length}</span>
                              <span className="font-police-body uppercase tracking-wider">CURSOS</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              title="Visualizar"
                              onClick={() => handleViewLegislation(legislation)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              title="Editar"
                              onClick={() => handleEditLegislation(legislation)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <a
                              href={legislation.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex"
                            >
                              <Button variant="ghost" size="sm" title="Abrir no Planalto">
                                <ExternalLink className="w-4 h-4" />
                              </Button>
                            </a>
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

      {/* Legislation Modal */}
      <AnimatePresence>
        {showLegislationModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setShowLegislationModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-police-title font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                  {isEditing ? (selectedLegislation ? 'EDITAR LEGISLAÇÃO' : 'NOVA LEGISLAÇÃO') : 'DETALHES DA LEGISLAÇÃO'}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowLegislationModal(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Modal Tabs */}
              <div className="flex border-b border-gray-200 dark:border-gray-700">
                {['details', 'content', 'courses', 'history'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-3 font-police-body font-medium uppercase tracking-wider transition-colors ${
                      activeTab === tab
                        ? 'text-accent-500 border-b-2 border-accent-500'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
                  >
                    {tab === 'details' && 'DETALHES'}
                    {tab === 'content' && 'CONTEÚDO'}
                    {tab === 'courses' && 'CURSOS VINCULADOS'}
                    {tab === 'history' && 'HISTÓRICO'}
                  </button>
                ))}
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                {activeTab === 'details' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                          TÍTULO DA LEGISLAÇÃO
                        </label>
                        <input
                          type="text"
                          defaultValue={selectedLegislation?.title}
                          disabled={!isEditing}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all disabled:opacity-50"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                          NÚMERO/IDENTIFICAÇÃO
                        </label>
                        <input
                          type="text"
                          defaultValue={selectedLegislation?.number}
                          disabled={!isEditing}
                          placeholder="EX: LEI Nº 12.345/2024"
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-numbers focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all disabled:opacity-50"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                          TIPO
                        </label>
                        <select
                          defaultValue={selectedLegislation?.type || 'lei'}
                          disabled={!isEditing}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all disabled:opacity-50"
                        >
                          <option value="constituicao">CONSTITUIÇÃO</option>
                          <option value="lei">LEI</option>
                          <option value="decreto">DECRETO</option>
                          <option value="medida_provisoria">MEDIDA PROVISÓRIA</option>
                          <option value="sumula">SÚMULA</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                          CATEGORIA
                        </label>
                        <select
                          defaultValue={selectedLegislation?.category || 'Administrativo'}
                          disabled={!isEditing}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all disabled:opacity-50"
                        >
                          {categories.filter(c => c !== 'Todos').map(category => (
                            <option key={category} value={category}>{category.toUpperCase()}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                          DATA DE PUBLICAÇÃO
                        </label>
                        <input
                          type="date"
                          defaultValue={selectedLegislation?.publishDate}
                          disabled={!isEditing}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-numbers focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all disabled:opacity-50"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                          STATUS
                        </label>
                        <select
                          defaultValue={selectedLegislation?.status || 'vigente'}
                          disabled={!isEditing}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all disabled:opacity-50"
                        >
                          <option value="vigente">VIGENTE</option>
                          <option value="alterada">ALTERADA</option>
                          <option value="revogada">REVOGADA</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                        DESCRIÇÃO
                      </label>
                      <textarea
                        rows={3}
                        defaultValue={selectedLegislation?.description}
                        disabled={!isEditing}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all disabled:opacity-50"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                        URL OFICIAL (PLANALTO)
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="url"
                          defaultValue={selectedLegislation?.url}
                          disabled={!isEditing}
                          placeholder="HTTP://WWW.PLANALTO.GOV.BR/..."
                          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all disabled:opacity-50"
                        />
                        {selectedLegislation?.url && (
                          <a
                            href={selectedLegislation.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button variant="outline" size="sm" className="gap-1">
                              <ExternalLink className="w-3 h-3" />
                              Abrir
                            </Button>
                          </a>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                        TAGS
                      </label>
                      <input
                        type="text"
                        defaultValue={selectedLegislation?.tags.join(', ')}
                        disabled={!isEditing}
                        placeholder="DIGITE AS TAGS SEPARADAS POR VÍRGULA"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all disabled:opacity-50"
                      />
                    </div>
                  </div>
                )}

                {activeTab === 'content' && (
                  <div className="space-y-4">
                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                        <div>
                          <p className="text-sm text-yellow-800 dark:text-yellow-200 font-police-body">
                            O CONTEÚDO COMPLETO DA LEGISLAÇÃO PODE SER IMPORTADO DE ARQUIVOS PDF OU DOC, 
                            OU COPIADO DIRETAMENTE DO SITE OFICIAL DO PLANALTO.
                          </p>
                        </div>
                      </div>
                    </div>

                    {isEditing && (
                      <div className="flex items-center gap-3">
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            toast.success('Seletor de arquivos PDF ativado', {
                              duration: 3000,
                              icon: '📝'
                            });
                          }}
                          className="gap-2 font-police-body uppercase tracking-wider border-gray-300 dark:border-gray-600 hover:border-accent-500 dark:hover:border-accent-500 transition-colors"
                        >
                          <Upload className="w-4 h-4" />
                          IMPORTAR PDF
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            toast.success('Importação por URL ativada', {
                              duration: 3000,
                              icon: '🔗'
                            });
                          }}
                          className="gap-2 font-police-body uppercase tracking-wider border-gray-300 dark:border-gray-600 hover:border-accent-500 dark:hover:border-accent-500 transition-colors"
                        >
                          <Link2 className="w-4 h-4" />
                          IMPORTAR DA URL
                        </Button>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                        CONTEÚDO DA LEGISLAÇÃO
                      </label>
                      <textarea
                        rows={20}
                        disabled={!isEditing}
                        placeholder="COLE OU DIGITE O CONTEÚDO DA LEGISLAÇÃO AQUI..."
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all disabled:opacity-50"
                      />
                    </div>
                  </div>
                )}

                {activeTab === 'courses' && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 font-police-body">
                      VINCULE ESTA LEGISLAÇÃO AOS CURSOS RELEVANTES PARA QUE OS ALUNOS POSSAM ACESSÁ-LA FACILMENTE.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {availableCourses.map((course) => (
                        <label
                          key={course}
                          className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                            selectedLinkedCourses.includes(course)
                              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                              : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                          } ${!isEditing ? 'cursor-not-allowed opacity-60' : ''}`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedLinkedCourses.includes(course)}
                            onChange={() => toggleCourseLink(course)}
                            disabled={!isEditing}
                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          />
                          <span className="text-sm font-police-body font-medium text-gray-900 dark:text-white uppercase tracking-wider">
                            {course.toUpperCase()}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'history' && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <History className="w-4 h-4" />
                      <span className="font-police-body uppercase tracking-wider">HISTÓRICO DE ALTERAÇÕES DA LEGISLAÇÃO</span>
                    </div>

                    <div className="space-y-3">
                      {[
                        { date: '2024-01-15', action: 'Atualização', description: 'Inclusão de novos artigos', user: 'Admin' },
                        { date: '2023-12-20', action: 'Alteração', description: 'Modificação do Art. 5º', user: 'Admin' },
                        { date: '2023-11-10', action: 'Criação', description: 'Importação inicial da lei', user: 'Sistema' }
                      ].map((item, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
                        >
                          <div className="w-2 h-2 bg-accent-500 rounded-full mt-2" />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p className="font-police-subtitle font-medium text-gray-900 dark:text-white uppercase tracking-wider">
                                {item.action.toUpperCase()}
                              </p>
                              <span className="text-sm text-gray-600 dark:text-gray-400 font-police-numbers">
                                {item.date}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 font-police-body">
                              {item.description}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 font-police-body uppercase tracking-wider">
                              POR: {item.user.toUpperCase()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
                <Button
                  variant="outline"
                  onClick={() => setShowLegislationModal(false)}
                  className="font-police-body uppercase tracking-wider border-gray-300 dark:border-gray-600 hover:border-accent-500 dark:hover:border-accent-500 transition-colors"
                >
                  CANCELAR
                </Button>
                {isEditing ? (
                  <Button 
                    onClick={() => {
                      setIsEditing(false);
                      toast.success('Alterações salvas com sucesso!', {
                        duration: 3000,
                        icon: '✅'
                      });
                    }}
                    className="gap-2 bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black font-police-body font-semibold uppercase tracking-wider transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    SALVAR ALTERAÇÕES
                  </Button>
                ) : (
                  <Button
                    onClick={() => {
                      setIsEditing(true);
                      toast.success('Modo de edição ativado', {
                        duration: 2000,
                        icon: '✏️'
                      });
                    }}
                    className="gap-2 bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black font-police-body font-semibold uppercase tracking-wider transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    EDITAR LEGISLAÇÃO
                  </Button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}