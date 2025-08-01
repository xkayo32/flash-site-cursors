import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  Save,
  X,
  Upload,
  Download,
  Brain,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  MoreVertical,
  Copy,
  BookOpen,
  Tag,
  Calendar,
  User,
  BarChart3
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

// Mock data
const questions = [
  {
    id: 1,
    title: 'Qual é o princípio constitucional que garante a igualdade perante a lei?',
    subject: 'Direito Constitucional',
    topic: 'Princípios Fundamentais',
    difficulty: 'medium',
    type: 'multiple_choice',
    options: [
      'Princípio da Legalidade',
      'Princípio da Isonomia',
      'Princípio da Moralidade',
      'Princípio da Publicidade'
    ],
    correctAnswer: 1,
    explanation: 'O Princípio da Isonomia estabelece que todos são iguais perante a lei, conforme previsto no art. 5º da Constituição Federal.',
    status: 'published',
    author: 'Prof. Carlos Lima',
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15',
    examBoard: 'CESPE',
    examYear: '2023',
    timesAnswered: 1234,
    correctRate: 78.5,
    tags: ['constitucional', 'principios', 'isonomia']
  },
  {
    id: 2,
    title: 'Calcule o valor de x na equação: 2x + 5 = 13',
    subject: 'Matemática',
    topic: 'Equações do 1º Grau',
    difficulty: 'easy',
    type: 'multiple_choice',
    options: [
      '3',
      '4',
      '5',
      '6'
    ],
    correctAnswer: 1,
    explanation: '2x + 5 = 13 → 2x = 13 - 5 → 2x = 8 → x = 4',
    status: 'published',
    author: 'Prof. Ana Santos',
    createdAt: '2024-01-14',
    updatedAt: '2024-01-14',
    examBoard: 'ENEM',
    examYear: '2023',
    timesAnswered: 856,
    correctRate: 92.1,
    tags: ['algebra', 'equacoes', 'basico']
  },
  {
    id: 3,
    title: 'Identifique a figura de linguagem presente na frase: "O vento sussurrava entre as árvores"',
    subject: 'Português',
    topic: 'Figuras de Linguagem',
    difficulty: 'medium',
    type: 'multiple_choice',
    options: [
      'Metáfora',
      'Personificação',
      'Hipérbole',
      'Metonímia'
    ],
    correctAnswer: 1,
    explanation: 'A personificação atribui características humanas a seres inanimados. No exemplo, o vento "sussurra".',
    status: 'draft',
    author: 'Prof. Maria Oliveira',
    createdAt: '2024-01-13',
    updatedAt: '2024-01-13',
    examBoard: 'FCC',
    examYear: '2023',
    timesAnswered: 0,
    correctRate: 0,
    tags: ['figuras-linguagem', 'personificacao', 'literatura']
  },
  {
    id: 4,
    title: 'Em que ano foi proclamada a Independência do Brasil?',
    subject: 'História',
    topic: 'Brasil Império',
    difficulty: 'easy',
    type: 'multiple_choice',
    options: [
      '1820',
      '1821',
      '1822',
      '1823'
    ],
    correctAnswer: 2,
    explanation: 'A Independência do Brasil foi proclamada em 7 de setembro de 1822 por D. Pedro I.',
    status: 'review',
    author: 'Prof. João Costa',
    createdAt: '2024-01-12',
    updatedAt: '2024-01-12',
    examBoard: 'VUNESP',
    examYear: '2023',
    timesAnswered: 543,
    correctRate: 89.3,
    tags: ['independencia', 'imperio', 'historia-brasil']
  }
];

const subjects = ['Todos', 'Direito Constitucional', 'Matemática', 'Português', 'História', 'Geografia'];
const difficulties = ['Todos', 'easy', 'medium', 'hard'];
const statuses = ['Todos', 'published', 'draft', 'review', 'archived'];
const examBoards = ['Todos', 'CESPE', 'ENEM', 'FCC', 'VUNESP', 'FGV'];

export default function QuestionEditor() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('Todos');
  const [selectedDifficulty, setSelectedDifficulty] = useState('Todos');
  const [selectedStatus, setSelectedStatus] = useState('Todos');
  const [selectedExamBoard, setSelectedExamBoard] = useState('Todos');
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [selectedQuestions, setSelectedQuestions] = useState<number[]>([]);

  const filteredQuestions = questions.filter(question => {
    const matchesSearch = question.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         question.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         question.topic.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = selectedSubject === 'Todos' || question.subject === selectedSubject;
    const matchesDifficulty = selectedDifficulty === 'Todos' || question.difficulty === selectedDifficulty;
    const matchesStatus = selectedStatus === 'Todos' || question.status === selectedStatus;
    const matchesExamBoard = selectedExamBoard === 'Todos' || question.examBoard === selectedExamBoard;
    
    return matchesSearch && matchesSubject && matchesDifficulty && matchesStatus && matchesExamBoard;
  });

  const getDifficultyBadge = (difficulty: string) => {
    const difficultyConfig = {
      easy: { label: 'Fácil', color: 'bg-green-100 text-green-800' },
      medium: { label: 'Médio', color: 'bg-yellow-100 text-yellow-800' },
      hard: { label: 'Difícil', color: 'bg-red-100 text-red-800' }
    };
    
    const config = difficultyConfig[difficulty as keyof typeof difficultyConfig];
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      published: { label: 'Publicada', color: 'bg-green-100 text-green-800', icon: CheckCircle },
      draft: { label: 'Rascunho', color: 'bg-gray-100 text-gray-800', icon: Edit },
      review: { label: 'Em Revisão', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      archived: { label: 'Arquivada', color: 'bg-red-100 text-red-800', icon: XCircle }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config.icon;
    
    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const handleSelectQuestion = (id: number) => {
    setSelectedQuestions(prev => 
      prev.includes(id) 
        ? prev.filter(q => q !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedQuestions(
      selectedQuestions.length === filteredQuestions.length 
        ? [] 
        : filteredQuestions.map(q => q.id)
    );
  };

  const handleViewQuestion = (question: any) => {
    setSelectedQuestion(question);
    setIsEditing(false);
    setShowQuestionModal(true);
  };

  const handleEditQuestion = (question: any) => {
    setSelectedQuestion(question);
    setIsEditing(true);
    setShowQuestionModal(true);
  };

  const handleCreateQuestion = () => {
    setSelectedQuestion(null);
    setIsEditing(true);
    setShowQuestionModal(true);
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
            Editor de Questões
          </h1>
          <p className="text-primary-600 dark:text-gray-300">
            Gerencie o banco de questões da plataforma
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
          <Button onClick={handleCreateQuestion} className="gap-2">
            <Plus className="w-4 h-4" />
            Nova Questão
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
                  Total de Questões
                </p>
                <p className="text-2xl font-bold text-primary-900 dark:text-white">
                  {questions.length}
                </p>
              </div>
              <Brain className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-primary-600 dark:text-gray-400">
                  Publicadas
                </p>
                <p className="text-2xl font-bold text-primary-900 dark:text-white">
                  {questions.filter(q => q.status === 'published').length}
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
                  Taxa de Acerto Média
                </p>
                <p className="text-2xl font-bold text-primary-900 dark:text-white">
                  {(questions.reduce((acc, q) => acc + q.correctRate, 0) / questions.length).toFixed(1)}%
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-emerald-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-primary-600 dark:text-gray-400">
                  Respostas Totais
                </p>
                <p className="text-2xl font-bold text-primary-900 dark:text-white">
                  {questions.reduce((acc, q) => acc + q.timesAnswered, 0).toLocaleString()}
                </p>
              </div>
              <User className="w-8 h-8 text-purple-600" />
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
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {/* Search */}
              <div className="relative md:col-span-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar questões..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-primary-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-primary-900 dark:text-white"
                />
              </div>

              {/* Subject Filter */}
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="px-4 py-2 border border-primary-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-primary-900 dark:text-white"
              >
                {subjects.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>

              {/* Difficulty Filter */}
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="px-4 py-2 border border-primary-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-primary-900 dark:text-white"
              >
                {difficulties.map(difficulty => (
                  <option key={difficulty} value={difficulty}>
                    {difficulty === 'Todos' ? difficulty : difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
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
              <Button
                variant="outline"
                onClick={() => setShowBulkActions(!showBulkActions)}
                className="gap-2"
              >
                <Filter className="w-4 h-4" />
                Ações em Lote
              </Button>
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
                          checked={selectedQuestions.length === filteredQuestions.length}
                          onChange={handleSelectAll}
                          className="rounded border-primary-300"
                        />
                        <span className="text-sm text-primary-900 dark:text-white">
                          Selecionar todas ({selectedQuestions.length})
                        </span>
                      </label>
                    </div>
                    
                    {selectedQuestions.length > 0 && (
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Publicar
                        </Button>
                        <Button variant="outline" size="sm" className="gap-1">
                          <Copy className="w-3 h-3" />
                          Duplicar
                        </Button>
                        <Button variant="outline" size="sm" className="gap-1 text-red-600">
                          <Trash2 className="w-3 h-3" />
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

      {/* Questions Table */}
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
                    {showBulkActions && (
                      <th className="text-left py-4 px-6">
                        <input
                          type="checkbox"
                          checked={selectedQuestions.length === filteredQuestions.length}
                          onChange={handleSelectAll}
                          className="rounded border-primary-300"
                        />
                      </th>
                    )}
                    <th className="text-left py-4 px-6 font-semibold text-primary-900 dark:text-white">
                      Questão
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-primary-900 dark:text-white">
                      Matéria
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-primary-900 dark:text-white">
                      Dificuldade
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
                  {filteredQuestions.map((question) => (
                    <tr
                      key={question.id}
                      className="border-b border-primary-100 dark:border-gray-700 hover:bg-primary-50 dark:hover:bg-gray-800"
                    >
                      {showBulkActions && (
                        <td className="py-4 px-6">
                          <input
                            type="checkbox"
                            checked={selectedQuestions.includes(question.id)}
                            onChange={() => handleSelectQuestion(question.id)}
                            className="rounded border-primary-300"
                          />
                        </td>
                      )}
                      <td className="py-4 px-6">
                        <div className="max-w-md">
                          <p className="font-medium text-primary-900 dark:text-white line-clamp-2">
                            {question.title}
                          </p>
                          <p className="text-sm text-primary-600 dark:text-gray-400 mt-1">
                            {question.topic}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="secondary" className="text-xs">
                              {question.examBoard} {question.examYear}
                            </Badge>
                            <span className="text-xs text-primary-500 dark:text-gray-500">
                              {question.author}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-primary-600 dark:text-gray-400">
                          {question.subject}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        {getDifficultyBadge(question.difficulty)}
                      </td>
                      <td className="py-4 px-6">
                        {getStatusBadge(question.status)}
                      </td>
                      <td className="py-4 px-6">
                        <div className="space-y-1">
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-primary-600 dark:text-gray-400">
                              {question.timesAnswered} respostas
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div 
                                className="bg-green-500 h-2 rounded-full" 
                                style={{ width: `${question.correctRate}%` }}
                              />
                            </div>
                            <span className="text-xs text-primary-600 dark:text-gray-400">
                              {question.correctRate}% acertos
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            title="Visualizar"
                            onClick={() => handleViewQuestion(question)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            title="Editar"
                            onClick={() => handleEditQuestion(question)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" title="Duplicar">
                            <Copy className="w-4 h-4" />
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

      {/* Question Modal */}
      <AnimatePresence>
        {showQuestionModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setShowQuestionModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-primary-900 dark:text-white">
                  {isEditing ? (selectedQuestion ? 'Editar Questão' : 'Nova Questão') : 'Visualizar Questão'}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowQuestionModal(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-6">
                {isEditing ? (
                  /* Edit Form */
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-primary-700 dark:text-gray-300 mb-2">
                          Matéria
                        </label>
                        <select className="w-full px-4 py-2 border border-primary-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-primary-900 dark:text-white">
                          <option>Direito Constitucional</option>
                          <option>Matemática</option>
                          <option>Português</option>
                          <option>História</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-primary-700 dark:text-gray-300 mb-2">
                          Tópico
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: Princípios Fundamentais"
                          defaultValue={selectedQuestion?.topic}
                          className="w-full px-4 py-2 border border-primary-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-primary-900 dark:text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-primary-700 dark:text-gray-300 mb-2">
                        Enunciado da Questão
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Digite o enunciado da questão..."
                        defaultValue={selectedQuestion?.title}
                        className="w-full px-4 py-2 border border-primary-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-primary-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-primary-700 dark:text-gray-300 mb-2">
                        Alternativas
                      </label>
                      <div className="space-y-2">
                        {[0, 1, 2, 3].map((index) => (
                          <div key={index} className="flex items-center gap-3">
                            <input
                              type="radio"
                              name="correct"
                              value={index}
                              defaultChecked={selectedQuestion?.correctAnswer === index}
                              className="text-primary-600"
                            />
                            <input
                              type="text"
                              placeholder={`Alternativa ${String.fromCharCode(65 + index)}`}
                              defaultValue={selectedQuestion?.options[index]}
                              className="flex-1 px-4 py-2 border border-primary-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-primary-900 dark:text-white"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-primary-700 dark:text-gray-300 mb-2">
                        Explicação
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Explicação da resposta correta..."
                        defaultValue={selectedQuestion?.explanation}
                        className="w-full px-4 py-2 border border-primary-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-primary-900 dark:text-white"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-primary-700 dark:text-gray-300 mb-2">
                          Dificuldade
                        </label>
                        <select 
                          defaultValue={selectedQuestion?.difficulty}
                          className="w-full px-4 py-2 border border-primary-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-primary-900 dark:text-white"
                        >
                          <option value="easy">Fácil</option>
                          <option value="medium">Médio</option>
                          <option value="hard">Difícil</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-primary-700 dark:text-gray-300 mb-2">
                          Banca
                        </label>
                        <select 
                          defaultValue={selectedQuestion?.examBoard}
                          className="w-full px-4 py-2 border border-primary-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-primary-900 dark:text-white"
                        >
                          <option>CESPE</option>
                          <option>ENEM</option>
                          <option>FCC</option>
                          <option>VUNESP</option>
                          <option>FGV</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-primary-700 dark:text-gray-300 mb-2">
                          Ano
                        </label>
                        <input
                          type="number"
                          placeholder="2024"
                          defaultValue={selectedQuestion?.examYear}
                          className="w-full px-4 py-2 border border-primary-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-primary-900 dark:text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-primary-700 dark:text-gray-300 mb-2">
                        Tags (separadas por vírgula)
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: constitucional, principios, isonomia"
                        defaultValue={selectedQuestion?.tags?.join(', ')}
                        className="w-full px-4 py-2 border border-primary-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-primary-900 dark:text-white"
                      />
                    </div>
                  </div>
                ) : selectedQuestion && (
                  /* View Mode */
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-primary-600 dark:text-gray-400">Matéria</p>
                        <p className="font-medium text-primary-900 dark:text-white">
                          {selectedQuestion.subject}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-primary-600 dark:text-gray-400">Tópico</p>
                        <p className="font-medium text-primary-900 dark:text-white">
                          {selectedQuestion.topic}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-primary-600 dark:text-gray-400">Dificuldade</p>
                        {getDifficultyBadge(selectedQuestion.difficulty)}
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-primary-600 dark:text-gray-400 mb-2">Enunciado</p>
                      <p className="text-primary-900 dark:text-white">
                        {selectedQuestion.title}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-primary-600 dark:text-gray-400 mb-3">Alternativas</p>
                      <div className="space-y-2">
                        {selectedQuestion.options.map((option: string, index: number) => (
                          <div 
                            key={index} 
                            className={`p-3 rounded-lg border ${
                              index === selectedQuestion.correctAnswer
                                ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                : 'border-primary-200 dark:border-gray-700'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="font-medium text-primary-900 dark:text-white">
                                {String.fromCharCode(65 + index)})
                              </span>
                              <span className="text-primary-900 dark:text-white">
                                {option}
                              </span>
                              {index === selectedQuestion.correctAnswer && (
                                <Badge className="ml-auto bg-green-100 text-green-800">
                                  Correta
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-primary-600 dark:text-gray-400 mb-2">Explicação</p>
                      <p className="text-primary-900 dark:text-white">
                        {selectedQuestion.explanation}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <p className="text-sm text-primary-600 dark:text-gray-400 mb-2">Informações Adicionais</p>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-primary-700 dark:text-gray-300">Banca:</span>
                            <span className="text-primary-900 dark:text-white">{selectedQuestion.examBoard}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-primary-700 dark:text-gray-300">Ano:</span>
                            <span className="text-primary-900 dark:text-white">{selectedQuestion.examYear}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-primary-700 dark:text-gray-300">Autor:</span>
                            <span className="text-primary-900 dark:text-white">{selectedQuestion.author}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm text-primary-600 dark:text-gray-400 mb-2">Estatísticas</p>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-primary-700 dark:text-gray-300">Respondida:</span>
                            <span className="text-primary-900 dark:text-white">{selectedQuestion.timesAnswered} vezes</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-primary-700 dark:text-gray-300">Taxa de acerto:</span>
                            <span className="text-primary-900 dark:text-white">{selectedQuestion.correctRate}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-primary-700 dark:text-gray-300">Status:</span>
                            {getStatusBadge(selectedQuestion.status)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {selectedQuestion.tags && selectedQuestion.tags.length > 0 && (
                      <div>
                        <p className="text-sm text-primary-600 dark:text-gray-400 mb-2">Tags</p>
                        <div className="flex flex-wrap gap-2">
                          {selectedQuestion.tags.map((tag: string, index: number) => (
                            <Badge key={index} variant="secondary" className="gap-1">
                              <Tag className="w-3 h-3" />
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-primary-200 dark:border-gray-700">
                  {isEditing ? (
                    <>
                      <Button variant="outline" onClick={() => setShowQuestionModal(false)}>
                        Cancelar
                      </Button>
                      <Button className="gap-2">
                        <Save className="w-4 h-4" />
                        Salvar Questão
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="outline" onClick={() => setShowQuestionModal(false)}>
                        Fechar
                      </Button>
                      <Button 
                        onClick={() => setIsEditing(true)}
                        className="gap-2"
                      >
                        <Edit className="w-4 h-4" />
                        Editar Questão
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}