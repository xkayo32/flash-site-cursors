import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Building
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

// Mock data for legislation
const legislations = [
  {
    id: 1,
    title: 'Constituição Federal de 1988',
    type: 'constituicao',
    number: 'CF/1988',
    category: 'Constitucional',
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
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [selectedType, setSelectedType] = useState('Todos');
  const [selectedStatus, setSelectedStatus] = useState('Todos');
  const [showLegislationModal, setShowLegislationModal] = useState(false);
  const [selectedLegislation, setSelectedLegislation] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [selectedLinkedCourses, setSelectedLinkedCourses] = useState<string[]>([]);

  const filteredLegislations = legislations.filter(legislation => {
    const matchesSearch = legislation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         legislation.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         legislation.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'Todos' || legislation.category === selectedCategory;
    const matchesType = selectedType === 'Todos' || legislation.type === selectedType;
    const matchesStatus = selectedStatus === 'Todos' || legislation.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesType && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      vigente: { label: 'Vigente', color: 'bg-green-100 text-green-800' },
      revogada: { label: 'Revogada', color: 'bg-red-100 text-red-800' },
      alterada: { label: 'Alterada', color: 'bg-yellow-100 text-yellow-800' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <Badge className={config.color}>
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
    setSelectedLegislation(null);
    setIsEditing(true);
    setShowLegislationModal(true);
    setActiveTab('details');
    setSelectedLinkedCourses([]);
  };

  const handleEditLegislation = (legislation: any) => {
    setSelectedLegislation(legislation);
    setIsEditing(true);
    setShowLegislationModal(true);
    setActiveTab('details');
    setSelectedLinkedCourses(legislation.linkedCourses || []);
  };

  const handleViewLegislation = (legislation: any) => {
    setSelectedLegislation(legislation);
    setIsEditing(false);
    setShowLegislationModal(true);
    setActiveTab('details');
    setSelectedLinkedCourses(legislation.linkedCourses || []);
  };

  const toggleCourseLink = (course: string) => {
    setSelectedLinkedCourses(prev =>
      prev.includes(course)
        ? prev.filter(c => c !== course)
        : [...prev, course]
    );
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
          <h1 className="text-3xl font-bold text-primary-900 dark:text-white">
            Gestão de Legislação
          </h1>
          <p className="text-primary-600 dark:text-gray-300">
            Gerencie textos de leis e documentos legais
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <Upload className="w-4 h-4" />
            Importar
          </Button>
          <Button onClick={handleCreateLegislation} className="gap-2">
            <Plus className="w-4 h-4" />
            Nova Legislação
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
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-primary-600 dark:text-gray-400">
                  Total de Leis
                </p>
                <p className="text-2xl font-bold text-primary-900 dark:text-white">
                  {legislations.length}
                </p>
              </div>
              <Scale className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-primary-600 dark:text-gray-400">
                  Vigentes
                </p>
                <p className="text-2xl font-bold text-primary-900 dark:text-white">
                  {legislations.filter(l => l.status === 'vigente').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-primary-600 dark:text-gray-400">
                  Total de Artigos
                </p>
                <p className="text-2xl font-bold text-primary-900 dark:text-white">
                  {legislations.reduce((acc, l) => acc + l.articles, 0)}
                </p>
              </div>
              <FileText className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-primary-600 dark:text-gray-400">
                  Visualizações
                </p>
                <p className="text-2xl font-bold text-primary-900 dark:text-white">
                  {legislations.reduce((acc, l) => acc + l.views, 0).toLocaleString()}
                </p>
              </div>
              <Eye className="w-8 h-8 text-orange-600" />
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
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="relative lg:col-span-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar legislação..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-primary-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-primary-900 dark:text-white"
                />
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-primary-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-primary-900 dark:text-white"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>

              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-4 py-2 border border-primary-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-primary-900 dark:text-white"
              >
                {types.map(type => (
                  <option key={type} value={type}>
                    {type === 'Todos' ? type : getTypeLabel(type)}
                  </option>
                ))}
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2 border border-primary-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-primary-900 dark:text-white"
              >
                {statuses.map(status => (
                  <option key={status} value={status}>
                    {status === 'Todos' ? status : status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
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
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-primary-50 dark:bg-gray-800">
                  <tr>
                    <th className="text-left py-4 px-6 font-semibold text-primary-900 dark:text-white">
                      Legislação
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-primary-900 dark:text-white">
                      Tipo/Número
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-primary-900 dark:text-white">
                      Categoria
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-primary-900 dark:text-white">
                      Status
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-primary-900 dark:text-white">
                      Métricas
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-primary-900 dark:text-white">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLegislations.map((legislation) => {
                    const TypeIcon = getTypeIcon(legislation.type);
                    return (
                      <tr
                        key={legislation.id}
                        className="border-b border-primary-100 dark:border-gray-700 hover:bg-primary-50 dark:hover:bg-gray-800"
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                              <TypeIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                            </div>
                            <div>
                              <p className="font-medium text-primary-900 dark:text-white">
                                {legislation.title}
                              </p>
                              <p className="text-sm text-primary-600 dark:text-gray-400 mt-1">
                                {legislation.description}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                {legislation.tags.slice(0, 3).map((tag, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                                {legislation.tags.length > 3 && (
                                  <span className="text-xs text-primary-500 dark:text-gray-500">
                                    +{legislation.tags.length - 3} mais
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div>
                            <p className="text-sm font-medium text-primary-900 dark:text-white">
                              {getTypeLabel(legislation.type)}
                            </p>
                            <p className="text-sm text-primary-600 dark:text-gray-400">
                              {legislation.number}
                            </p>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <Badge variant="outline">
                            {legislation.category}
                          </Badge>
                        </td>
                        <td className="py-4 px-6">
                          {getStatusBadge(legislation.status)}
                        </td>
                        <td className="py-4 px-6">
                          <div className="space-y-1 text-sm">
                            <div className="flex items-center gap-2 text-primary-600 dark:text-gray-400">
                              <Eye className="w-3 h-3" />
                              {legislation.views.toLocaleString()} views
                            </div>
                            <div className="flex items-center gap-2 text-primary-600 dark:text-gray-400">
                              <FileText className="w-3 h-3" />
                              {legislation.articles} artigos
                            </div>
                            <div className="flex items-center gap-2 text-primary-600 dark:text-gray-400">
                              <Building className="w-3 h-3" />
                              {legislation.linkedCourses.length} cursos
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
                <h3 className="text-xl font-bold text-primary-900 dark:text-white">
                  {isEditing ? (selectedLegislation ? 'Editar Legislação' : 'Nova Legislação') : 'Detalhes da Legislação'}
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
                    className={`px-6 py-3 font-medium transition-colors ${
                      activeTab === tab
                        ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
                  >
                    {tab === 'details' && 'Detalhes'}
                    {tab === 'content' && 'Conteúdo'}
                    {tab === 'courses' && 'Cursos Vinculados'}
                    {tab === 'history' && 'Histórico'}
                  </button>
                ))}
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                {activeTab === 'details' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-primary-700 dark:text-gray-300 mb-2">
                          Título da Legislação
                        </label>
                        <input
                          type="text"
                          defaultValue={selectedLegislation?.title}
                          disabled={!isEditing}
                          className="w-full px-4 py-2 border border-primary-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-primary-900 dark:text-white disabled:opacity-50"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-primary-700 dark:text-gray-300 mb-2">
                          Número/Identificação
                        </label>
                        <input
                          type="text"
                          defaultValue={selectedLegislation?.number}
                          disabled={!isEditing}
                          placeholder="Ex: Lei nº 12.345/2024"
                          className="w-full px-4 py-2 border border-primary-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-primary-900 dark:text-white disabled:opacity-50"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-primary-700 dark:text-gray-300 mb-2">
                          Tipo
                        </label>
                        <select
                          defaultValue={selectedLegislation?.type || 'lei'}
                          disabled={!isEditing}
                          className="w-full px-4 py-2 border border-primary-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-primary-900 dark:text-white disabled:opacity-50"
                        >
                          <option value="constituicao">Constituição</option>
                          <option value="lei">Lei</option>
                          <option value="decreto">Decreto</option>
                          <option value="medida_provisoria">Medida Provisória</option>
                          <option value="sumula">Súmula</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-primary-700 dark:text-gray-300 mb-2">
                          Categoria
                        </label>
                        <select
                          defaultValue={selectedLegislation?.category || 'Administrativo'}
                          disabled={!isEditing}
                          className="w-full px-4 py-2 border border-primary-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-primary-900 dark:text-white disabled:opacity-50"
                        >
                          {categories.filter(c => c !== 'Todos').map(category => (
                            <option key={category} value={category}>{category}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-primary-700 dark:text-gray-300 mb-2">
                          Data de Publicação
                        </label>
                        <input
                          type="date"
                          defaultValue={selectedLegislation?.publishDate}
                          disabled={!isEditing}
                          className="w-full px-4 py-2 border border-primary-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-primary-900 dark:text-white disabled:opacity-50"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-primary-700 dark:text-gray-300 mb-2">
                          Status
                        </label>
                        <select
                          defaultValue={selectedLegislation?.status || 'vigente'}
                          disabled={!isEditing}
                          className="w-full px-4 py-2 border border-primary-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-primary-900 dark:text-white disabled:opacity-50"
                        >
                          <option value="vigente">Vigente</option>
                          <option value="alterada">Alterada</option>
                          <option value="revogada">Revogada</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-primary-700 dark:text-gray-300 mb-2">
                        Descrição
                      </label>
                      <textarea
                        rows={3}
                        defaultValue={selectedLegislation?.description}
                        disabled={!isEditing}
                        className="w-full px-4 py-2 border border-primary-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-primary-900 dark:text-white disabled:opacity-50"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-primary-700 dark:text-gray-300 mb-2">
                        URL Oficial (Planalto)
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="url"
                          defaultValue={selectedLegislation?.url}
                          disabled={!isEditing}
                          placeholder="http://www.planalto.gov.br/..."
                          className="flex-1 px-4 py-2 border border-primary-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-primary-900 dark:text-white disabled:opacity-50"
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
                      <label className="block text-sm font-medium text-primary-700 dark:text-gray-300 mb-2">
                        Tags
                      </label>
                      <input
                        type="text"
                        defaultValue={selectedLegislation?.tags.join(', ')}
                        disabled={!isEditing}
                        placeholder="Digite as tags separadas por vírgula"
                        className="w-full px-4 py-2 border border-primary-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-primary-900 dark:text-white disabled:opacity-50"
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
                          <p className="text-sm text-yellow-800 dark:text-yellow-200">
                            O conteúdo completo da legislação pode ser importado de arquivos PDF ou DOC, 
                            ou copiado diretamente do site oficial do Planalto.
                          </p>
                        </div>
                      </div>
                    </div>

                    {isEditing && (
                      <div className="flex items-center gap-3">
                        <Button variant="outline" className="gap-2">
                          <Upload className="w-4 h-4" />
                          Importar PDF
                        </Button>
                        <Button variant="outline" className="gap-2">
                          <Link2 className="w-4 h-4" />
                          Importar da URL
                        </Button>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-primary-700 dark:text-gray-300 mb-2">
                        Conteúdo da Legislação
                      </label>
                      <textarea
                        rows={20}
                        disabled={!isEditing}
                        placeholder="Cole ou digite o conteúdo da legislação aqui..."
                        className="w-full px-4 py-2 border border-primary-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-primary-900 dark:text-white font-mono text-sm disabled:opacity-50"
                      />
                    </div>
                  </div>
                )}

                {activeTab === 'courses' && (
                  <div>
                    <p className="text-sm text-primary-600 dark:text-gray-400 mb-4">
                      Vincule esta legislação aos cursos relevantes para que os alunos possam acessá-la facilmente.
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
                          <span className="text-sm font-medium text-primary-900 dark:text-white">
                            {course}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'history' && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm text-primary-600 dark:text-gray-400">
                      <History className="w-4 h-4" />
                      <span>Histórico de alterações da legislação</span>
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
                          <div className="w-2 h-2 bg-primary-600 rounded-full mt-2" />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p className="font-medium text-primary-900 dark:text-white">
                                {item.action}
                              </p>
                              <span className="text-sm text-primary-600 dark:text-gray-400">
                                {item.date}
                              </span>
                            </div>
                            <p className="text-sm text-primary-600 dark:text-gray-400 mt-1">
                              {item.description}
                            </p>
                            <p className="text-xs text-primary-500 dark:text-gray-500 mt-1">
                              Por: {item.user}
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
                >
                  Cancelar
                </Button>
                {isEditing ? (
                  <Button className="gap-2">
                    <Save className="w-4 h-4" />
                    Salvar Alterações
                  </Button>
                ) : (
                  <Button
                    onClick={() => setIsEditing(true)}
                    className="gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Editar Legislação
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