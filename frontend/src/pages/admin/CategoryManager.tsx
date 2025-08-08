import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  Tag,
  Calendar,
  Building2,
  BookOpen,
  Filter,
  MoreVertical,
  X,
  Save,
  AlertCircle,
  CheckCircle,
  Users,
  FileText,
  Brain,
  Star,
  Hash,
  ArrowUpDown
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

// Tipos de categoria
type CategoryType = 'subject' | 'topic' | 'exam_board' | 'year';

interface Category {
  id: string;
  name: string;
  type: CategoryType;
  parent?: string;
  description?: string;
  contentCount: {
    questions: number;
    flashcards: number;
    summaries: number;
    courses: number;
  };
  children?: Category[];
  isExpanded?: boolean;
}

// Mock data
const mockCategories: Category[] = [
  {
    id: '1',
    name: 'Direito',
    type: 'subject',
    description: 'Disciplinas jurídicas para concursos',
    contentCount: { questions: 1200, flashcards: 800, summaries: 45, courses: 12 },
    children: [
      {
        id: '1.1',
        name: 'Direito Constitucional',
        type: 'topic',
        parent: '1',
        contentCount: { questions: 400, flashcards: 300, summaries: 15, courses: 4 },
        children: [
          {
            id: '1.1.1',
            name: 'Princípios Fundamentais',
            type: 'topic',
            parent: '1.1',
            contentCount: { questions: 50, flashcards: 40, summaries: 3, courses: 1 }
          },
          {
            id: '1.1.2',
            name: 'Direitos e Garantias',
            type: 'topic',
            parent: '1.1',
            contentCount: { questions: 80, flashcards: 60, summaries: 4, courses: 1 }
          }
        ]
      },
      {
        id: '1.2',
        name: 'Direito Administrativo',
        type: 'topic',
        parent: '1',
        contentCount: { questions: 300, flashcards: 200, summaries: 10, courses: 3 }
      },
      {
        id: '1.3',
        name: 'Direito Penal',
        type: 'topic',
        parent: '1',
        contentCount: { questions: 500, flashcards: 300, summaries: 20, courses: 5 }
      }
    ]
  },
  {
    id: '2',
    name: 'Matemática',
    type: 'subject',
    description: 'Matemática e Raciocínio Lógico',
    contentCount: { questions: 800, flashcards: 600, summaries: 30, courses: 8 },
    children: [
      {
        id: '2.1',
        name: 'Matemática Financeira',
        type: 'topic',
        parent: '2',
        contentCount: { questions: 200, flashcards: 150, summaries: 8, courses: 2 }
      },
      {
        id: '2.2',
        name: 'Raciocínio Lógico',
        type: 'topic',
        parent: '2',
        contentCount: { questions: 300, flashcards: 250, summaries: 12, courses: 3 }
      }
    ]
  },
  {
    id: '3',
    name: 'Português',
    type: 'subject',
    description: 'Língua Portuguesa e Interpretação',
    contentCount: { questions: 900, flashcards: 700, summaries: 35, courses: 10 }
  }
];

const examBoards: Category[] = [
  {
    id: 'eb1',
    name: 'CESPE/CEBRASPE',
    type: 'exam_board',
    description: 'Centro de Seleção e de Promoção de Eventos',
    contentCount: { questions: 2500, flashcards: 1800, summaries: 80, courses: 15 }
  },
  {
    id: 'eb2',
    name: 'FCC',
    type: 'exam_board',
    description: 'Fundação Carlos Chagas',
    contentCount: { questions: 2000, flashcards: 1500, summaries: 70, courses: 12 }
  },
  {
    id: 'eb3',
    name: 'FGV',
    type: 'exam_board',
    description: 'Fundação Getúlio Vargas',
    contentCount: { questions: 1800, flashcards: 1300, summaries: 60, courses: 10 }
  },
  {
    id: 'eb4',
    name: 'VUNESP',
    type: 'exam_board',
    description: 'Fundação Vunesp',
    contentCount: { questions: 1500, flashcards: 1100, summaries: 50, courses: 8 }
  }
];

const years: Category[] = [
  {
    id: 'y2024',
    name: '2024',
    type: 'year',
    contentCount: { questions: 800, flashcards: 600, summaries: 30, courses: 5 }
  },
  {
    id: 'y2023',
    name: '2023',
    type: 'year',
    contentCount: { questions: 1200, flashcards: 900, summaries: 45, courses: 8 }
  },
  {
    id: 'y2022',
    name: '2022',
    type: 'year',
    contentCount: { questions: 1100, flashcards: 850, summaries: 40, courses: 7 }
  },
  {
    id: 'y2021',
    name: '2021',
    type: 'year',
    contentCount: { questions: 1000, flashcards: 750, summaries: 35, courses: 6 }
  }
];

export default function CategoryManager() {
  const [activeTab, setActiveTab] = useState<CategoryType>('subject');
  const [categories, setCategories] = useState(mockCategories);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Filtrar categorias baseado no termo de busca
  const filterCategories = (cats: Category[], term: string): Category[] => {
    return cats.filter(cat => {
      const matchesSearch = cat.name.toLowerCase().includes(term.toLowerCase()) ||
                           cat.description?.toLowerCase().includes(term.toLowerCase());
      
      if (cat.children) {
        const filteredChildren = filterCategories(cat.children, term);
        return matchesSearch || filteredChildren.length > 0;
      }
      
      return matchesSearch;
    });
  };

  const getFilteredCategories = () => {
    switch (activeTab) {
      case 'subject':
      case 'topic':
        return filterCategories(categories, searchTerm);
      case 'exam_board':
        return filterCategories(examBoards, searchTerm);
      case 'year':
        return filterCategories(years, searchTerm);
      default:
        return [];
    }
  };

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const handleCreateCategory = () => {
    setSelectedCategory(null);
    setIsEditing(true);
    setShowCategoryModal(true);
  };

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
    setIsEditing(true);
    setShowCategoryModal(true);
  };

  const getIcon = (type: CategoryType) => {
    switch (type) {
      case 'subject':
        return BookOpen;
      case 'topic':
        return Tag;
      case 'exam_board':
        return Building2;
      case 'year':
        return Calendar;
    }
  };

  const getCategoryTypeName = (type: CategoryType) => {
    switch (type) {
      case 'subject':
        return 'ÁREAS TÁTICAS';
      case 'topic':
        return 'ESPECIALIZAÇÕES';
      case 'exam_board':
        return 'INSTITUIÇÕES';
      case 'year':
        return 'PERÍODOS';
    }
  };

  const renderCategoryTree = (category: Category, level: number = 0) => {
    const isExpanded = expandedCategories.has(category.id);
    const hasChildren = category.children && category.children.length > 0;
    const Icon = getIcon(category.type);

    return (
      <div key={category.id}>
        <motion.div
          initial={false}
          animate={{ opacity: 1 }}
          className={`group hover:bg-accent-500/10 dark:hover:bg-gray-800 rounded-lg transition-colors ${
            level > 0 ? 'ml-8' : ''
          }`}
        >
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3 flex-1">
              {hasChildren && (
                <button
                  onClick={() => toggleCategory(category.id)}
                  className="p-1 hover:bg-accent-500/20 dark:hover:bg-gray-700 rounded"
                >
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-accent-500" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-accent-500" />
                  )}
                </button>
              )}
              {!hasChildren && <div className="w-6" />}
              
              <div className="flex items-center gap-3 flex-1">
                <div className={`p-2 rounded-lg ${
                  level === 0 
                    ? 'bg-accent-500/20 dark:bg-accent-500/10' 
                    : 'bg-gray-100 dark:bg-gray-800'
                }`}>
                  <Icon className={`w-5 h-5 ${
                    level === 0 
                      ? 'text-accent-500 dark:text-accent-400' 
                      : 'text-gray-600 dark:text-gray-400'
                  }`} />
                </div>
                
                <div className="flex-1">
                  <h4 className="font-police-subtitle font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                    {category.name}
                  </h4>
                  {category.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-police-body">
                      {category.description}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 text-sm">
                <div className="flex items-center gap-1">
                  <Brain className="w-4 h-4 text-purple-600" />
                  <span className="text-primary-700 dark:text-gray-300">
                    {category.contentCount.questions}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-600" />
                  <span className="text-primary-700 dark:text-gray-300">
                    {category.contentCount.flashcards}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span className="text-primary-700 dark:text-gray-300">
                    {category.contentCount.summaries}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <BookOpen className="w-4 h-4 text-green-600" />
                  <span className="text-primary-700 dark:text-gray-300">
                    {category.contentCount.courses}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEditCategory(category)}
                  className="text-gray-600 hover:text-accent-500 dark:text-gray-400 dark:hover:text-accent-500 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {hasChildren && isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            {category.children!.map(child => renderCategoryTree(child, level + 1))}
          </motion.div>
        )}
      </div>
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
          <h1 className="text-3xl font-police-title font-bold uppercase tracking-wider text-gray-900 dark:text-white">
            CATEGORIAS TÁTICAS
          </h1>
          <p className="text-gray-600 dark:text-gray-400 font-police-subtitle uppercase tracking-wider">
            COMANDO DE ORGANIZAÇÃO - ESTRUTURAÇÃO ESTRATÉGICA DE CONTEÚDO
          </p>
        </div>
        
        <Button 
          onClick={handleCreateCategory} 
          className="gap-2 bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black font-police-body font-semibold uppercase tracking-wider transition-colors"
        >
          <Plus className="w-4 h-4" />
          NOVA CATEGORIA TÁTICA
        </Button>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-l-4 border-l-accent-500 hover:shadow-xl transition-all duration-300 relative">
          {/* Corner accents */}
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-accent-500/20" />
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-police-body font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  ÁREAS DE ATUAÇÃO
                </p>
                <p className="text-2xl font-police-numbers font-bold text-gray-900 dark:text-white">
                  {categories.length}
                </p>
              </div>
              <BookOpen className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-l-4 border-l-accent-500 hover:shadow-xl transition-all duration-300 relative">
          {/* Corner accents */}
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-accent-500/20" />
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-police-body font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  ESPECIALIZAÇÕES
                </p>
                <p className="text-2xl font-police-numbers font-bold text-gray-900 dark:text-white">
                  {categories.reduce((acc, cat) => 
                    acc + (cat.children?.length || 0) + 
                    (cat.children?.reduce((sum, child) => sum + (child.children?.length || 0), 0) || 0), 0
                  )}
                </p>
              </div>
              <Tag className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-l-4 border-l-accent-500 hover:shadow-xl transition-all duration-300 relative">
          {/* Corner accents */}
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-accent-500/20" />
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-police-body font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  INSTITUIÇÕES
                </p>
                <p className="text-2xl font-police-numbers font-bold text-gray-900 dark:text-white">
                  {examBoards.length}
                </p>
              </div>
              <Building2 className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-l-4 border-l-accent-500 hover:shadow-xl transition-all duration-300 relative">
          {/* Corner accents */}
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-accent-500/20" />
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-police-body font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  PERÍODOS
                </p>
                <p className="text-2xl font-police-numbers font-bold text-gray-900 dark:text-white">
                  {years.length}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-l-4 border-l-accent-500 hover:shadow-xl transition-all duration-300 relative">
          {/* Corner accents */}
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-accent-500/20" />
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-2 overflow-x-auto">
                {(['subject', 'topic', 'exam_board', 'year'] as CategoryType[]).map((type) => {
                  const Icon = getIcon(type);
                  return (
                    <Button
                      key={type}
                      variant={activeTab === type ? 'default' : 'outline'}
                      onClick={() => setActiveTab(type)}
                      className={`gap-2 whitespace-nowrap font-police-body font-semibold uppercase tracking-wider transition-colors ${
                        activeTab === type 
                          ? 'bg-accent-500 hover:bg-accent-600 text-black' 
                          : 'border-gray-300 dark:border-gray-600 hover:border-accent-500 dark:hover:border-accent-500'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {getCategoryTypeName(type)}
                    </Button>
                  );
                })}
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="BUSCAR CATEGORIAS TÁTICAS..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body placeholder:font-police-body placeholder:uppercase placeholder:tracking-wider focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {activeTab === 'subject' || activeTab === 'topic' ? (
                getFilteredCategories().map(category => renderCategoryTree(category))
              ) : (
                getFilteredCategories().map(category => (
                  <div key={category.id} className="group hover:bg-accent-500/10 dark:hover:bg-gray-800 transition-colors">
                    <div className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-accent-500/20 dark:bg-accent-500/10">
                          {React.createElement(getIcon(category.type), {
                            className: "w-5 h-5 text-accent-500 dark:text-accent-400"
                          })}
                        </div>
                        
                        <div>
                          <h4 className="font-police-subtitle font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                            {category.name}
                          </h4>
                          {category.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 font-police-body">
                              {category.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3 text-sm">
                          <div className="flex items-center gap-1">
                            <Brain className="w-4 h-4 text-purple-600" />
                            <span className="text-gray-900 dark:text-white font-police-numbers font-bold">
                              {category.contentCount.questions}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-600" />
                            <span className="text-gray-900 dark:text-white font-police-numbers font-bold">
                              {category.contentCount.flashcards}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <FileText className="w-4 h-4 text-blue-600" />
                            <span className="text-gray-900 dark:text-white font-police-numbers font-bold">
                              {category.contentCount.summaries}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <BookOpen className="w-4 h-4 text-green-600" />
                            <span className="text-gray-900 dark:text-white font-police-numbers font-bold">
                              {category.contentCount.courses}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditCategory(category)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Category Modal */}
      <AnimatePresence>
        {showCategoryModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setShowCategoryModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-bold text-primary-900 dark:text-white">
                  {selectedCategory ? 'Editar Categoria' : 'Nova Categoria'}
                </h3>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-primary-700 dark:text-gray-300 mb-1">
                    Nome da Categoria
                  </label>
                  <input
                    type="text"
                    defaultValue={selectedCategory?.name}
                    className="w-full px-4 py-2 border border-primary-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-primary-900 dark:text-white"
                    placeholder="Ex: Direito Constitucional"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-700 dark:text-gray-300 mb-1">
                    Tipo
                  </label>
                  <select
                    defaultValue={selectedCategory?.type || activeTab}
                    className="w-full px-4 py-2 border border-primary-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-primary-900 dark:text-white"
                  >
                    <option value="subject">Matéria</option>
                    <option value="topic">Assunto</option>
                    <option value="exam_board">Banca</option>
                    <option value="year">Ano</option>
                  </select>
                </div>

                {(activeTab === 'topic' || selectedCategory?.type === 'topic') && (
                  <div>
                    <label className="block text-sm font-medium text-primary-700 dark:text-gray-300 mb-1">
                      Categoria Pai
                    </label>
                    <select
                      defaultValue={selectedCategory?.parent}
                      className="w-full px-4 py-2 border border-primary-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-primary-900 dark:text-white"
                    >
                      <option value="">Nenhuma (categoria principal)</option>
                      {categories.map(cat => (
                        <optgroup key={cat.id} label={cat.name}>
                          <option value={cat.id}>{cat.name}</option>
                          {cat.children?.map(child => (
                            <option key={child.id} value={child.id}>
                              &nbsp;&nbsp;{child.name}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-primary-700 dark:text-gray-300 mb-1">
                    Descrição (opcional)
                  </label>
                  <textarea
                    defaultValue={selectedCategory?.description}
                    rows={3}
                    className="w-full px-4 py-2 border border-primary-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-primary-900 dark:text-white"
                    placeholder="Breve descrição da categoria..."
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
                <Button
                  variant="outline"
                  onClick={() => setShowCategoryModal(false)}
                >
                  Cancelar
                </Button>
                <Button className="gap-2">
                  <Save className="w-4 h-4" />
                  Salvar
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}