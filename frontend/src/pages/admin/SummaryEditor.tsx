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
  Redo
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

// Mock data for summaries
const summaries = [
  {
    id: 1,
    title: 'Direito Constitucional - Princípios Fundamentais',
    course: 'Polícia Federal - Agente',
    category: 'Direito',
    author: 'Prof. Dr. Carlos Lima',
    status: 'published',
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15',
    views: 1234,
    embeds: {
      questions: 15,
      flashcards: 23
    },
    wordCount: 3500,
    readingTime: '15 min'
  },
  {
    id: 2,
    title: 'Matemática Financeira - Juros Compostos',
    course: 'Receita Federal - Auditor',
    category: 'Matemática',
    author: 'Prof. Ana Santos',
    status: 'draft',
    createdAt: '2024-01-14',
    updatedAt: '2024-01-14',
    views: 0,
    embeds: {
      questions: 8,
      flashcards: 12
    },
    wordCount: 2100,
    readingTime: '9 min'
  },
  {
    id: 3,
    title: 'Português - Concordância Verbal e Nominal',
    course: 'TRT/TRF - Analista',
    category: 'Português',
    author: 'Prof. Maria Oliveira',
    status: 'published',
    createdAt: '2024-01-13',
    updatedAt: '2024-01-13',
    views: 856,
    embeds: {
      questions: 20,
      flashcards: 30
    },
    wordCount: 4200,
    readingTime: '18 min'
  }
];

// Mock data for available questions and flashcards
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

const categories = ['Todos', 'Direito', 'Matemática', 'Português', 'História', 'Geografia'];
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

export default function SummaryEditor() {
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

  const filteredSummaries = summaries.filter(summary => {
    const matchesSearch = summary.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         summary.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Todos' || summary.category === selectedCategory;
    const matchesStatus = selectedStatus === 'Todos' || summary.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      published: { label: 'Publicado', color: 'bg-green-100 text-green-800' },
      draft: { label: 'Rascunho', color: 'bg-gray-100 text-gray-800' },
      review: { label: 'Em Revisão', color: 'bg-yellow-100 text-yellow-800' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const handleCreateSummary = () => {
    setSelectedSummary(null);
    setIsEditing(true);
    setShowSummaryModal(true);
    setActiveTab('editor');
    setEditorContent('');
  };

  const handleEditSummary = (summary: any) => {
    setSelectedSummary(summary);
    setIsEditing(true);
    setShowSummaryModal(true);
    setActiveTab('editor');
    // In real app, load the summary content
    setEditorContent('<h1>Título do Resumo</h1><p>Conteúdo do resumo aqui...</p>');
  };

  const handleViewSummary = (summary: any) => {
    setSelectedSummary(summary);
    setIsEditing(false);
    setShowSummaryModal(true);
    setActiveTab('preview');
  };

  const handleToolbarAction = (action: string) => {
    if (action === 'embedQuestion') {
      setEmbedType('question');
      setShowEmbedModal(true);
    } else if (action === 'embedFlashcard') {
      setEmbedType('flashcard');
      setShowEmbedModal(true);
    } else {
      // Handle other toolbar actions
    }
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
          <h1 className="text-3xl font-bold text-primary-900 dark:text-white">
            Editor de Resumos Interativos
          </h1>
          <p className="text-primary-600 dark:text-gray-300">
            Crie resumos com questões e flashcards incorporados
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <Upload className="w-4 h-4" />
            Importar
          </Button>
          <Button onClick={handleCreateSummary} className="gap-2">
            <Plus className="w-4 h-4" />
            Novo Resumo
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
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-primary-600 dark:text-gray-400">
                  Total de Resumos
                </p>
                <p className="text-2xl font-bold text-primary-900 dark:text-white">
                  {summaries.length}
                </p>
              </div>
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-primary-600 dark:text-gray-400">
                  Publicados
                </p>
                <p className="text-2xl font-bold text-primary-900 dark:text-white">
                  {summaries.filter(s => s.status === 'published').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-primary-600 dark:text-gray-400">
                  Questões Incorporadas
                </p>
                <p className="text-2xl font-bold text-primary-900 dark:text-white">
                  {summaries.reduce((acc, s) => acc + s.embeds.questions, 0)}
                </p>
              </div>
              <Brain className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-primary-600 dark:text-gray-400">
                  Flashcards Incorporados
                </p>
                <p className="text-2xl font-bold text-primary-900 dark:text-white">
                  {summaries.reduce((acc, s) => acc + s.embeds.flashcards, 0)}
                </p>
              </div>
              <Star className="w-8 h-8 text-yellow-600" />
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
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative lg:col-span-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar resumos..."
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

      {/* Summaries Table */}
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
                      Título
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-primary-900 dark:text-white">
                      Curso
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-primary-900 dark:text-white">
                      Autor
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-primary-900 dark:text-white">
                      Status
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-primary-900 dark:text-white">
                      Incorporações
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
                  {filteredSummaries.map((summary) => (
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
                            {summary.category}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-primary-600 dark:text-gray-400">
                          {summary.course}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-primary-600 dark:text-gray-400">
                          {summary.author}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        {getStatusBadge(summary.status)}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <Brain className="w-4 h-4 text-purple-600" />
                            <span className="text-sm text-primary-900 dark:text-white">
                              {summary.embeds.questions}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-600" />
                            <span className="text-sm text-primary-900 dark:text-white">
                              {summary.embeds.flashcards}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center gap-2 text-primary-600 dark:text-gray-400">
                            <Eye className="w-3 h-3" />
                            {summary.views} views
                          </div>
                          <div className="text-primary-600 dark:text-gray-400">
                            {summary.readingTime} • {summary.wordCount} palavras
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
                  ))}
                </tbody>
              </table>
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
                            className="min-h-[500px] p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-primary-900 dark:text-white prose prose-lg dark:prose-invert max-w-none focus:outline-none focus:ring-2 focus:ring-primary-500"
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
                                <select className="w-full px-3 py-2 text-sm border border-primary-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">
                                  <option>Direito</option>
                                  <option>Matemática</option>
                                  <option>Português</option>
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
                  {embedType === 'question' ? (
                    availableQuestions.map((question) => (
                      <div
                        key={question.id}
                        className="p-4 border border-primary-200 dark:border-gray-700 rounded-lg hover:bg-primary-50 dark:hover:bg-gray-800 cursor-pointer"
                        onClick={() => handleEmbedItem(question)}
                      >
                        <p className="font-medium text-primary-900 dark:text-white">
                          {question.title}
                        </p>
                        <p className="text-sm text-primary-600 dark:text-gray-400">
                          {question.category}
                        </p>
                      </div>
                    ))
                  ) : (
                    availableFlashcards.map((flashcard) => (
                      <div
                        key={flashcard.id}
                        className="p-4 border border-primary-200 dark:border-gray-700 rounded-lg hover:bg-primary-50 dark:hover:bg-gray-800 cursor-pointer"
                        onClick={() => handleEmbedItem(flashcard)}
                      >
                        <p className="font-medium text-primary-900 dark:text-white">
                          {flashcard.front}
                        </p>
                        <p className="text-sm text-primary-600 dark:text-gray-400">
                          {flashcard.back}
                        </p>
                        <Badge variant="secondary" className="mt-1">
                          {flashcard.category}
                        </Badge>
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