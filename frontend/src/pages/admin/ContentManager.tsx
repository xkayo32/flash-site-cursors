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

// Mock data
const contentItems = [
  {
    id: 1,
    title: 'Direito Constitucional - Princípios Fundamentais',
    type: 'course',
    category: 'Direito',
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
  }
];

const categories = ['Todos', 'Direito', 'Matemática', 'Português', 'História', 'Geografia'];
const types = ['Todos', 'course', 'flashcards', 'questions', 'summary'];
const statuses = ['Todos', 'published', 'draft', 'review', 'archived'];

export default function ContentManager() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [selectedType, setSelectedType] = useState('Todos');
  const [selectedStatus, setSelectedStatus] = useState('Todos');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  const filteredContent = contentItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Todos' || item.category === selectedCategory;
    const matchesType = selectedType === 'Todos' || item.type === selectedType;
    const matchesStatus = selectedStatus === 'Todos' || item.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesType && matchesStatus;
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
      published: { label: 'Publicado', variant: 'default' as const, color: 'bg-green-100 text-green-800' },
      draft: { label: 'Rascunho', variant: 'secondary' as const, color: 'bg-gray-100 text-gray-800' },
      review: { label: 'Em Revisão', variant: 'secondary' as const, color: 'bg-yellow-100 text-yellow-800' },
      archived: { label: 'Arquivado', variant: 'secondary' as const, color: 'bg-red-100 text-red-800' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <Badge variant={config.variant} className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const getVisibilityIcon = (visibility: string) => {
    return visibility === 'public' ? 
      <Globe className="w-4 h-4 text-green-600" /> : 
      <Lock className="w-4 h-4 text-gray-600" />;
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
            Gestão de Conteúdo
          </h1>
          <p className="text-primary-600 dark:text-gray-300">
            Gerencie cursos, questões, flashcards e resumos
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <Upload className="w-4 h-4" />
            Importar
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Exportar
          </Button>
          <Button onClick={() => setShowCreateModal(true)} className="gap-2">
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
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar conteúdo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-primary-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-primary-900 dark:text-white"
                />
              </div>

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-primary-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-primary-900 dark:text-white"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>

              {/* Type Filter */}
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-4 py-2 border border-primary-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-primary-900 dark:text-white"
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
                className="px-4 py-2 border border-primary-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-primary-900 dark:text-white"
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
                  className="gap-2"
                >
                  <Filter className="w-4 h-4" />
                  Ações em Lote
                </Button>
                {selectedItems.length > 0 && (
                  <Badge variant="secondary">
                    {selectedItems.length} selecionados
                  </Badge>
                )}
              </div>
            </div>

            {/* Bulk Actions Bar */}
            <AnimatePresence>
              {showBulkActions && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mt-4 p-4 bg-primary-50 dark:bg-gray-800 rounded-lg border border-primary-200 dark:border-gray-700"
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
                        <span className="text-sm text-primary-900 dark:text-white">
                          Selecionar todos
                        </span>
                      </label>
                    </div>
                    
                    {selectedItems.length > 0 && (
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          Publicar
                        </Button>
                        <Button variant="outline" size="sm">
                          Arquivar
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600">
                          Excluir
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
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-primary-50 dark:bg-gray-800">
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
                    <th className="text-left py-4 px-6 font-semibold text-primary-900 dark:text-white">
                      Conteúdo
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-primary-900 dark:text-white">
                      Tipo
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-primary-900 dark:text-white">
                      Autor
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
                  {filteredContent.map((item) => {
                    const TypeIcon = getTypeIcon(item.type);
                    return (
                      <tr
                        key={item.id}
                        className="border-b border-primary-100 dark:border-gray-700 hover:bg-primary-50 dark:hover:bg-gray-800"
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
                            <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                              <TypeIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                            </div>
                            <div>
                              <p className="font-medium text-primary-900 dark:text-white">
                                {item.title}
                              </p>
                              <p className="text-sm text-primary-600 dark:text-gray-400">
                                {item.category}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                {getVisibilityIcon(item.visibility)}
                                <span className="text-xs text-primary-500 dark:text-gray-500">
                                  Atualizado em {item.updatedAt}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-primary-600 dark:text-gray-400 capitalize">
                            {item.type}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-primary-600 dark:text-gray-400">
                            {item.author}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          {getStatusBadge(item.status)}
                        </td>
                        <td className="py-4 px-6">
                          <div className="space-y-1">
                            <div className="flex items-center gap-4 text-sm">
                              <span className="flex items-center gap-1 text-primary-600 dark:text-gray-400">
                                <Eye className="w-3 h-3" />
                                {item.views}
                              </span>
                              <span className="flex items-center gap-1 text-primary-600 dark:text-gray-400">
                                <Users className="w-3 h-3" />
                                {item.enrollments}
                              </span>
                              {item.rating > 0 && (
                                <span className="flex items-center gap-1 text-primary-600 dark:text-gray-400">
                                  <Star className="w-3 h-3" />
                                  {item.rating}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" title="Visualizar">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" title="Editar">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" title="Mais opções">
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
              className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-primary-900 dark:text-white">
                  Criar Novo Conteúdo
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
                  <label className="block text-sm font-medium text-primary-700 dark:text-gray-300 mb-2">
                    Tipo de Conteúdo
                  </label>
                  <select className="w-full px-4 py-2 border border-primary-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-primary-900 dark:text-white">
                    <option value="course">Curso</option>
                    <option value="flashcards">Flashcards</option>
                    <option value="questions">Questões</option>
                    <option value="summary">Resumo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-700 dark:text-gray-300 mb-2">
                    Título
                  </label>
                  <input
                    type="text"
                    placeholder="Digite o título..."
                    className="w-full px-4 py-2 border border-primary-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-primary-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-700 dark:text-gray-300 mb-2">
                    Categoria
                  </label>
                  <select className="w-full px-4 py-2 border border-primary-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-primary-900 dark:text-white">
                    <option value="direito">Direito</option>
                    <option value="matematica">Matemática</option>
                    <option value="portugues">Português</option>
                    <option value="historia">História</option>
                    <option value="geografia">Geografia</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-700 dark:text-gray-300 mb-2">
                    Descrição
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Descrição do conteúdo..."
                    className="w-full px-4 py-2 border border-primary-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-primary-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancelar
                </Button>
                <Button className="gap-2">
                  <Save className="w-4 h-4" />
                  Criar Conteúdo
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}