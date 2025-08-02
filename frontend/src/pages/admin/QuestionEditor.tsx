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
  BarChart3,
  Target,
  Crosshair
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

// Matérias e submatérias organizadas hierarquicamente
const materias: { [key: string]: string[] } = {
  'DIREITO': ['Todas', 'Constitucional', 'Administrativo', 'Penal', 'Civil', 'Trabalhista', 'Tributário'],
  'SEGURANÇA PÚBLICA': ['Todas', 'Legislação Policial', 'Direitos Humanos', 'Criminologia', 'Investigação Criminal', 'Uso da Força'],
  'CONHECIMENTOS GERAIS': ['Todas', 'História do Brasil', 'Geografia', 'Atualidades', 'Informática', 'Raciocínio Lógico']
};

const subjects = ['Todos', ...Object.keys(materias)];
const difficulties = ['Todos', 'easy', 'medium', 'hard'];
const statuses = ['Todos', 'published', 'draft', 'review', 'archived'];
const examBoards = ['Todos', 'CESPE', 'ENEM', 'FCC', 'VUNESP', 'FGV'];

export default function QuestionEditor() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMateria, setSelectedMateria] = useState('Todos');
  const [selectedSubmateria, setSelectedSubmateria] = useState('Todas');
  const [selectedDifficulty, setSelectedDifficulty] = useState('Todos');
  const [selectedStatus, setSelectedStatus] = useState('Todos');
  const [selectedExamBoard, setSelectedExamBoard] = useState('Todos');
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [selectedQuestions, setSelectedQuestions] = useState<number[]>([]);

  // Função para lidar com mudança de matéria
  const handleMateriaChange = (materia: string) => {
    setSelectedMateria(materia);
    setSelectedSubmateria('Todas'); // Reset submatéria
  };

  const filteredQuestions = questions.filter(question => {
    const matchesSearch = question.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         question.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         question.topic.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMateria = selectedMateria === 'Todos' || question.subject === selectedMateria;
    const matchesDifficulty = selectedDifficulty === 'Todos' || question.difficulty === selectedDifficulty;
    const matchesStatus = selectedStatus === 'Todos' || question.status === selectedStatus;
    const matchesExamBoard = selectedExamBoard === 'Todos' || question.examBoard === selectedExamBoard;
    
    return matchesSearch && matchesMateria && matchesDifficulty && matchesStatus && matchesExamBoard;
  });

  const getDifficultyLabel = (difficulty: string) => {
    const labels = {
      easy: 'FÁCIL',
      medium: 'MÉDIO',
      hard: 'DIFÍCIL'
    };
    return labels[difficulty as keyof typeof labels] || difficulty.toUpperCase();
  };

  const getDifficultyBadge = (difficulty: string) => {
    const difficultyConfig = {
      easy: { label: 'FÁCIL', color: 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300' },
      medium: { label: 'MÉDIO', color: 'bg-gray-300 text-gray-900 dark:bg-gray-600 dark:text-gray-200' },
      hard: { label: 'DIFÍCIL', color: 'bg-gray-500 text-white dark:bg-gray-400 dark:text-gray-900' }
    };
    
    const config = difficultyConfig[difficulty as keyof typeof difficultyConfig];
    return (
      <Badge className={`${config.color} font-police-body font-semibold uppercase tracking-wider`}>
        {config.label}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      published: { label: 'PUBLICADA', color: 'bg-accent-500 text-black dark:bg-accent-600 dark:text-black', icon: CheckCircle },
      draft: { label: 'RASCUNHO', color: 'bg-gray-300 text-gray-800 dark:bg-gray-600 dark:text-gray-300', icon: Edit },
      review: { label: 'EM REVISÃO', color: 'bg-gray-400 text-white dark:bg-gray-500 dark:text-gray-200', icon: Clock },
      archived: { label: 'ARQUIVADA', color: 'bg-gray-600 text-white dark:bg-gray-700 dark:text-gray-300', icon: XCircle }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config.icon;
    
    return (
      <Badge className={`${config.color} flex items-center gap-1 font-police-body font-semibold uppercase tracking-wider`}>
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
    navigate('/admin/questions/new');
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
            CENTRAL DE OPERAÇÕES - BANCO DE QUESTÕES
          </h1>
          <p className="text-gray-600 dark:text-gray-400 font-police-subtitle uppercase tracking-wider">
            SISTEMA INTEGRADO DE GESTÃO TÁTICA DE QUESTÕES
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            className="gap-2 font-police-body uppercase tracking-wider border-gray-300 dark:border-gray-600 hover:border-accent-500 dark:hover:border-accent-500 transition-colors"
          >
            <Upload className="w-4 h-4" />
            IMPORTAR
          </Button>
          <Button 
            variant="outline" 
            className="gap-2 font-police-body uppercase tracking-wider border-gray-300 dark:border-gray-600 hover:border-accent-500 dark:hover:border-accent-500 transition-colors"
          >
            <Download className="w-4 h-4" />
            EXPORTAR
          </Button>
          <Button 
            onClick={handleCreateQuestion} 
            className="gap-2 bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black font-police-body font-semibold uppercase tracking-wider transition-colors"
          >
            <Target className="w-4 h-4" />
            NOVA QUESTÃO
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
        <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-police-body font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  TOTAL DE QUESTÕES
                </p>
                <p className="text-2xl font-police-numbers font-bold text-gray-900 dark:text-white">
                  {questions.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-police-body font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  OPERACIONAIS
                </p>
                <p className="text-2xl font-police-numbers font-bold text-gray-900 dark:text-white">
                  {questions.filter(q => q.status === 'published').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-accent-500 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-black" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-police-body font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  EFETIVIDADE MÉDIA
                </p>
                <p className="text-2xl font-police-numbers font-bold text-gray-900 dark:text-white">
                  {(questions.reduce((acc, q) => acc + q.correctRate, 0) / questions.length).toFixed(1)}%
                </p>
              </div>
              <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-police-body font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  ENGAJAMENTO TOTAL
                </p>
                <p className="text-2xl font-police-numbers font-bold text-gray-900 dark:text-white">
                  {questions.reduce((acc, q) => acc + q.timesAnswered, 0).toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-gray-600 rounded-lg flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
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
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* First Row - Search and Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative md:col-span-2">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="BUSCAR QUESTÕES TÁTICAS..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body placeholder:font-police-body placeholder:uppercase placeholder:tracking-wider focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                  />
                </div>
                
                <Button
                  variant="outline"
                  onClick={() => setShowBulkActions(!showBulkActions)}
                  className="gap-2 font-police-body uppercase tracking-wider border-gray-300 dark:border-gray-600 hover:border-accent-500 dark:hover:border-accent-500 transition-colors"
                >
                  <Filter className="w-4 h-4" />
                  AÇÕES EM LOTE
                </Button>
              </div>

              {/* Second Row - Filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Matéria Filter */}
                <select
                  value={selectedMateria}
                  onChange={(e) => handleMateriaChange(e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body uppercase tracking-wider focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                >
                  {subjects.map(subject => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>

                {/* Submatéria Filter */}
                <select
                  value={selectedSubmateria}
                  onChange={(e) => setSelectedSubmateria(e.target.value)}
                  disabled={selectedMateria === 'Todos'}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body uppercase tracking-wider focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {selectedMateria === 'Todos' ? (
                    <option>SELECIONE MATÉRIA</option>
                  ) : (
                    materias[selectedMateria]?.map(submateria => (
                      <option key={submateria} value={submateria}>{submateria.toUpperCase()}</option>
                    ))
                  )}
                </select>

                {/* Difficulty Filter */}
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body uppercase tracking-wider focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                >
                  {difficulties.map(difficulty => (
                    <option key={difficulty} value={difficulty}>
                      {difficulty === 'Todos' ? 'TODOS' : getDifficultyLabel(difficulty) || difficulty.toUpperCase()}
                    </option>
                  ))}
                </select>

                {/* Status Filter */}
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body uppercase tracking-wider focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                >
                  {statuses.map(status => (
                    <option key={status} value={status}>
                      {status === 'Todos' ? 'TODOS' : status.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Bulk Actions Bar */}
            <AnimatePresence>
              {showBulkActions && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mt-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedQuestions.length === filteredQuestions.length}
                          onChange={handleSelectAll}
                          className="rounded border-gray-300 text-accent-500 focus:ring-accent-500"
                        />
                        <span className="text-sm text-gray-900 dark:text-white font-police-body font-medium uppercase tracking-wider">
                          SELECIONAR TODAS ({selectedQuestions.length})
                        </span>
                      </label>
                    </div>
                    
                    {selectedQuestions.length > 0 && (
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="gap-1 font-police-body uppercase tracking-wider border-gray-300 dark:border-gray-600 hover:border-accent-500 dark:hover:border-accent-500 transition-colors"
                        >
                          <CheckCircle className="w-3 h-3" />
                          PUBLICAR
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="gap-1 font-police-body uppercase tracking-wider border-gray-300 dark:border-gray-600 hover:border-accent-500 dark:hover:border-accent-500 transition-colors"
                        >
                          <Copy className="w-3 h-3" />
                          DUPLICAR
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="gap-1 font-police-body uppercase tracking-wider border-gray-300 dark:border-gray-600 hover:border-gray-600 dark:hover:border-gray-500 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                          ARQUIVAR
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
        <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 dark:bg-gray-800/80">
                  <tr>
                    {showBulkActions && (
                      <th className="text-left py-4 px-6">
                        <input
                          type="checkbox"
                          checked={selectedQuestions.length === filteredQuestions.length}
                          onChange={handleSelectAll}
                          className="rounded border-gray-300 text-accent-500 focus:ring-accent-500"
                        />
                      </th>
                    )}
                    <th className="text-left py-4 px-6 text-xs font-police-subtitle font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                      QUESTÃO
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-police-subtitle font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                      MATÉRIA
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-police-subtitle font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                      DIFICULDADE
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-police-subtitle font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                      STATUS
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-police-subtitle font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                      MÉTRICAS
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-police-subtitle font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                      AÇÕES
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredQuestions.map((question) => (
                    <tr
                      key={question.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors border-b border-gray-200 dark:border-gray-700"
                    >
                      {showBulkActions && (
                        <td className="py-4 px-6">
                          <input
                            type="checkbox"
                            checked={selectedQuestions.includes(question.id)}
                            onChange={() => handleSelectQuestion(question.id)}
                            className="rounded border-gray-300 text-accent-500 focus:ring-accent-500"
                          />
                        </td>
                      )}
                      <td className="py-4 px-6">
                        <div className="max-w-md">
                          <p className="font-police-subtitle font-medium text-gray-900 dark:text-white line-clamp-2">
                            {question.title}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 font-police-body">
                            {question.topic}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="secondary" className="text-xs font-police-body font-semibold uppercase tracking-wider bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                              {question.examBoard} {question.examYear}
                            </Badge>
                            <span className="text-xs text-gray-500 dark:text-gray-500 font-police-body">
                              {question.author}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-gray-600 dark:text-gray-400 font-police-body font-medium uppercase tracking-wider">
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
                            <span className="text-gray-600 dark:text-gray-400 font-police-body font-medium uppercase tracking-wider">
                              {question.timesAnswered} RESPOSTAS
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div 
                                className="bg-accent-500 h-2 rounded-full" 
                                style={{ width: `${question.correctRate}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-600 dark:text-gray-400 font-police-numbers font-semibold">
                              {question.correctRate}% ACERTOS
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewQuestion(question)}
                            className="text-gray-600 hover:text-accent-500 dark:text-gray-400 dark:hover:text-accent-500 transition-colors"
                            title="Visualizar"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditQuestion(question)}
                            className="text-gray-600 hover:text-accent-500 dark:text-gray-400 dark:hover:text-accent-500 transition-colors"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            className="text-gray-600 hover:text-accent-500 dark:text-gray-400 dark:hover:text-accent-500 transition-colors"
                            title="Duplicar"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                            title="Mais opções"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
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