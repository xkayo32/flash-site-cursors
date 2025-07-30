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
const contentItems: ContentItem[] = [
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

import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/utils/cn';

// TypeScript interfaces
interface ContentItem {
  id: number;
  title: string;
  type: 'course' | 'flashcards' | 'questions' | 'summary';
  category: string;
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
      published: { 
        label: 'PUBLICADO', 
        color: resolvedTheme === 'dark' 
          ? 'bg-green-900/50 text-green-400 border border-green-400/30' 
          : 'bg-green-100 text-green-800 border border-green-200'
      },
      draft: { 
        label: 'RASCUNHO', 
        color: resolvedTheme === 'dark' 
          ? 'bg-gray-800/50 text-gray-400 border border-gray-600' 
          : 'bg-gray-100 text-gray-800 border border-gray-200'
      },
      review: { 
        label: 'EM REVISÃO', 
        color: resolvedTheme === 'dark' 
          ? 'bg-yellow-900/50 text-yellow-400 border border-yellow-400/30' 
          : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
      },
      archived: { 
        label: 'ARQUIVADO', 
        color: resolvedTheme === 'dark' 
          ? 'bg-red-900/50 text-red-400 border border-red-400/30' 
          : 'bg-red-100 text-red-800 border border-red-200'
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
    <div className="p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-full">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-police-title uppercase tracking-wider">
            GESTÃO DE CONTEÚDO
          </h1>
          <p className="text-gray-600 dark:text-gray-300 font-police-body mt-2">
            Gerencie cursos, questões, flashcards e resumos da plataforma
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" className={cn(
            "gap-2 font-police-body font-medium transition-all duration-300 border-2",
            resolvedTheme === 'dark' 
              ? 'border-gray-600 hover:border-yellow-400 hover:text-yellow-400' 
              : 'border-military-base/30 hover:border-military-base hover:text-military-base'
          )}>
            <Upload className="w-4 h-4" />
            IMPORTAR
          </Button>
          <Button variant="outline" className={cn(
            "gap-2 font-police-body font-medium transition-all duration-300 border-2",
            resolvedTheme === 'dark' 
              ? 'border-gray-600 hover:border-yellow-400 hover:text-yellow-400' 
              : 'border-military-base/30 hover:border-military-base hover:text-military-base'
          )}>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar conteúdo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={cn(
                    "w-full pl-10 pr-4 py-2 border-2 rounded-lg transition-all duration-300 font-police-body",
                    "focus:ring-2 focus:ring-offset-2 outline-none",
                    resolvedTheme === 'dark' 
                      ? 'border-gray-600 bg-gray-800 text-white placeholder-gray-400 focus:border-yellow-400 focus:ring-yellow-400/20' 
                      : 'border-military-base/30 bg-white text-gray-900 placeholder-gray-500 focus:border-military-base focus:ring-military-base/20'
                  )}
                />
              </div>

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className={cn(
                  "px-4 py-2 border-2 rounded-lg transition-all duration-300 font-police-body font-medium",
                  "focus:ring-2 focus:ring-offset-2 outline-none",
                  resolvedTheme === 'dark' 
                    ? 'border-gray-600 bg-gray-800 text-white focus:border-yellow-400 focus:ring-yellow-400/20' 
                    : 'border-military-base/30 bg-white text-gray-900 focus:border-military-base focus:ring-military-base/20'
                )}
              >
                {categories.map(category => (
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
                        <Button variant="outline" size="sm" className={cn(
                          "font-police-body font-medium transition-all duration-300",
                          resolvedTheme === 'dark' 
                            ? 'border-green-600 text-green-400 hover:bg-green-600 hover:text-white' 
                            : 'border-green-600 text-green-600 hover:bg-green-600 hover:text-white'
                        )}>
                          PUBLICAR
                        </Button>
                        <Button variant="outline" size="sm" className={cn(
                          "font-police-body font-medium transition-all duration-300",
                          resolvedTheme === 'dark' 
                            ? 'border-gray-600 text-gray-400 hover:bg-gray-600 hover:text-white' 
                            : 'border-gray-600 text-gray-600 hover:bg-gray-600 hover:text-white'
                        )}>
                          ARQUIVAR
                        </Button>
                        <Button variant="outline" size="sm" className={cn(
                          "font-police-body font-medium transition-all duration-300 border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
                        )}>
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
                <thead className={cn(
                  "border-b-2",
                  resolvedTheme === 'dark' 
                    ? 'bg-gradient-to-r from-gray-800 to-gray-750 border-gray-700' 
                    : 'bg-gradient-to-r from-military-base/10 to-military-base/5 border-military-base/30'
                )}>
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
                    <th className={cn(
                      "text-left py-4 px-6 font-police-subtitle font-bold uppercase tracking-wider",
                      resolvedTheme === 'dark' ? 'text-yellow-400' : 'text-military-base'
                    )}>
                      CONTEÚDO
                    </th>
                    <th className={cn(
                      "text-left py-4 px-6 font-police-subtitle font-bold uppercase tracking-wider",
                      resolvedTheme === 'dark' ? 'text-yellow-400' : 'text-military-base'
                    )}>
                      TIPO
                    </th>
                    <th className={cn(
                      "text-left py-4 px-6 font-police-subtitle font-bold uppercase tracking-wider",
                      resolvedTheme === 'dark' ? 'text-yellow-400' : 'text-military-base'
                    )}>
                      AUTOR
                    </th>
                    <th className={cn(
                      "text-left py-4 px-6 font-police-subtitle font-bold uppercase tracking-wider",
                      resolvedTheme === 'dark' ? 'text-yellow-400' : 'text-military-base'
                    )}>
                      STATUS
                    </th>
                    <th className={cn(
                      "text-left py-4 px-6 font-police-subtitle font-bold uppercase tracking-wider",
                      resolvedTheme === 'dark' ? 'text-yellow-400' : 'text-military-base'
                    )}>
                      MÉTRICAS
                    </th>
                    <th className={cn(
                      "text-left py-4 px-6 font-police-subtitle font-bold uppercase tracking-wider",
                      resolvedTheme === 'dark' ? 'text-yellow-400' : 'text-military-base'
                    )}>
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
                                {item.category}
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
                                <span className={cn(
                                  "flex items-center gap-1 font-police-numbers font-medium",
                                  resolvedTheme === 'dark' ? 'text-yellow-400' : 'text-military-base'
                                )}>
                                  <Star className="w-3 h-3 fill-current" />
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
                  <label className={cn(
                    "block text-sm font-medium font-police-subtitle uppercase tracking-wide mb-2",
                    resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  )}>
                    TIPO DE CONTEÚDO
                  </label>
                  <select className={cn(
                    "w-full px-4 py-2 border-2 rounded-lg font-police-body font-medium transition-all duration-300",
                    "focus:ring-2 focus:ring-offset-2 outline-none",
                    resolvedTheme === 'dark' 
                      ? 'border-gray-600 bg-gray-800 text-white focus:border-yellow-400 focus:ring-yellow-400/20' 
                      : 'border-military-base/30 bg-white text-gray-900 focus:border-military-base focus:ring-military-base/20'
                  )}>
                    <option value="course">Curso</option>
                    <option value="flashcards">Flashcards</option>
                    <option value="questions">Questões</option>
                    <option value="summary">Resumo</option>
                  </select>
                </div>

                <div>
                  <label className={cn(
                    "block text-sm font-medium font-police-subtitle uppercase tracking-wide mb-2",
                    resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  )}>
                    TÍTULO
                  </label>
                  <input
                    type="text"
                    placeholder="Digite o título..."
                    className={cn(
                      "w-full px-4 py-2 border-2 rounded-lg font-police-body transition-all duration-300",
                      "focus:ring-2 focus:ring-offset-2 outline-none",
                      resolvedTheme === 'dark' 
                        ? 'border-gray-600 bg-gray-800 text-white placeholder-gray-400 focus:border-yellow-400 focus:ring-yellow-400/20' 
                        : 'border-military-base/30 bg-white text-gray-900 placeholder-gray-500 focus:border-military-base focus:ring-military-base/20'
                    )}
                  />
                </div>

                <div>
                  <label className={cn(
                    "block text-sm font-medium font-police-subtitle uppercase tracking-wide mb-2",
                    resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  )}>
                    CATEGORIA
                  </label>
                  <select className={cn(
                    "w-full px-4 py-2 border-2 rounded-lg font-police-body font-medium transition-all duration-300",
                    "focus:ring-2 focus:ring-offset-2 outline-none",
                    resolvedTheme === 'dark' 
                      ? 'border-gray-600 bg-gray-800 text-white focus:border-yellow-400 focus:ring-yellow-400/20' 
                      : 'border-military-base/30 bg-white text-gray-900 focus:border-military-base focus:ring-military-base/20'
                  )}>
                    <option value="direito">Direito</option>
                    <option value="matematica">Matemática</option>
                    <option value="portugues">Português</option>
                    <option value="historia">História</option>
                    <option value="geografia">Geografia</option>
                  </select>
                </div>

                <div>
                  <label className={cn(
                    "block text-sm font-medium font-police-subtitle uppercase tracking-wide mb-2",
                    resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  )}>
                    DESCRIÇÃO
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Descrição do conteúdo..."
                    className={cn(
                      "w-full px-4 py-2 border-2 rounded-lg font-police-body transition-all duration-300 resize-none",
                      "focus:ring-2 focus:ring-offset-2 outline-none",
                      resolvedTheme === 'dark' 
                        ? 'border-gray-600 bg-gray-800 text-white placeholder-gray-400 focus:border-yellow-400 focus:ring-yellow-400/20' 
                        : 'border-military-base/30 bg-white text-gray-900 placeholder-gray-500 focus:border-military-base focus:ring-military-base/20'
                    )}
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
                <Button className={cn(
                  "gap-2 font-police-body font-semibold transition-all duration-300 uppercase tracking-wider shadow-lg",
                  resolvedTheme === 'dark' 
                    ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-gray-900 shadow-yellow-500/20' 
                    : 'bg-gradient-to-r from-military-base to-military-base/90 hover:from-military-base/90 hover:to-military-base text-white shadow-military-base/30'
                )}>
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