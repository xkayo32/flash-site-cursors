import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Search,
  Filter,
  Calendar,
  Download,
  Eye,
  Clock,
  Award,
  Building,
  Users,
  TrendingUp,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Target,
  AlertCircle,
  Shield,
  Star,
  CheckCircle,
  XCircle,
  BarChart3,
  PieChart,
  Hash,
  Layers,
  Timer,
  GraduationCap
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/utils/cn';

// Tipos
interface PreviousExam {
  id: string;
  title: string;
  examBoard: string; // Banca
  year: number;
  position: string; // Cargo
  level: string; // Nível (Superior, Médio, etc)
  totalQuestions: number;
  duration: string;
  passingScore: number;
  candidates: number;
  approvalRate: number;
  difficulty: 'Fácil' | 'Médio' | 'Difícil' | 'Muito Difícil';
  subjects: Subject[];
  tags: string[];
  downloadCount: number;
  averageScore?: number;
  solvedBy?: number;
  isFavorite?: boolean;
  pdfUrl?: string;
  gabarito?: string;
}

interface Subject {
  name: string;
  questions: number;
  percentage: number;
}

// Dados mockados
const mockExams: PreviousExam[] = [
  {
    id: '1',
    title: 'Polícia Federal - Agente',
    examBoard: 'CEBRASPE',
    year: 2023,
    position: 'Agente de Polícia Federal',
    level: 'Superior',
    totalQuestions: 120,
    duration: '4h30min',
    passingScore: 60,
    candidates: 45320,
    approvalRate: 2.8,
    difficulty: 'Muito Difícil',
    subjects: [
      { name: 'Direito Constitucional', questions: 15, percentage: 12.5 },
      { name: 'Direito Penal', questions: 20, percentage: 16.7 },
      { name: 'Direito Administrativo', questions: 15, percentage: 12.5 },
      { name: 'Informática', questions: 10, percentage: 8.3 },
      { name: 'Português', questions: 20, percentage: 16.7 },
      { name: 'Raciocínio Lógico', questions: 15, percentage: 12.5 },
      { name: 'Atualidades', questions: 10, percentage: 8.3 },
      { name: 'Legislação Especial', questions: 15, percentage: 12.5 }
    ],
    tags: ['PF', 'Federal', 'Polícia', 'Agente'],
    downloadCount: 15234,
    averageScore: 68.5,
    solvedBy: 3456,
    isFavorite: true
  },
  {
    id: '2',
    title: 'Polícia Rodoviária Federal - Policial',
    examBoard: 'CEBRASPE',
    year: 2024,
    position: 'Policial Rodoviário Federal',
    level: 'Superior',
    totalQuestions: 100,
    duration: '4h',
    passingScore: 50,
    candidates: 38500,
    approvalRate: 3.2,
    difficulty: 'Difícil',
    subjects: [
      { name: 'Português', questions: 15, percentage: 15 },
      { name: 'Matemática', questions: 10, percentage: 10 },
      { name: 'Direito Constitucional', questions: 15, percentage: 15 },
      { name: 'Direito Penal', questions: 15, percentage: 15 },
      { name: 'Direito Processual Penal', questions: 10, percentage: 10 },
      { name: 'Legislação de Trânsito', questions: 20, percentage: 20 },
      { name: 'Direitos Humanos', questions: 10, percentage: 10 },
      { name: 'Física Aplicada', questions: 5, percentage: 5 }
    ],
    tags: ['PRF', 'Federal', 'Polícia', 'Trânsito'],
    downloadCount: 12890,
    averageScore: 72.3,
    solvedBy: 2890,
    isFavorite: true
  },
  {
    id: '3',
    title: 'Receita Federal - Auditor Fiscal',
    examBoard: 'FGV',
    year: 2023,
    position: 'Auditor Fiscal da Receita Federal',
    level: 'Superior',
    totalQuestions: 150,
    duration: '5h',
    passingScore: 75,
    candidates: 52000,
    approvalRate: 1.5,
    difficulty: 'Muito Difícil',
    subjects: [
      { name: 'Direito Tributário', questions: 30, percentage: 20 },
      { name: 'Contabilidade', questions: 25, percentage: 16.7 },
      { name: 'Direito Constitucional', questions: 15, percentage: 10 },
      { name: 'Direito Administrativo', questions: 20, percentage: 13.3 },
      { name: 'Comércio Internacional', questions: 15, percentage: 10 },
      { name: 'Legislação Aduaneira', questions: 20, percentage: 13.3 },
      { name: 'Português', questions: 15, percentage: 10 },
      { name: 'Raciocínio Lógico', questions: 10, percentage: 6.7 }
    ],
    tags: ['Receita', 'Federal', 'Fiscal', 'Auditor'],
    downloadCount: 23456,
    averageScore: 65.8,
    solvedBy: 5678
  },
  {
    id: '4',
    title: 'Polícia Civil SP - Delegado',
    examBoard: 'VUNESP',
    year: 2023,
    position: 'Delegado de Polícia',
    level: 'Superior',
    totalQuestions: 100,
    duration: '4h',
    passingScore: 60,
    candidates: 28000,
    approvalRate: 2.1,
    difficulty: 'Difícil',
    subjects: [
      { name: 'Direito Penal', questions: 20, percentage: 20 },
      { name: 'Direito Processual Penal', questions: 20, percentage: 20 },
      { name: 'Direito Constitucional', questions: 15, percentage: 15 },
      { name: 'Direito Administrativo', questions: 15, percentage: 15 },
      { name: 'Medicina Legal', questions: 10, percentage: 10 },
      { name: 'Criminologia', questions: 10, percentage: 10 },
      { name: 'Lógica', questions: 5, percentage: 5 },
      { name: 'Informática', questions: 5, percentage: 5 }
    ],
    tags: ['PC-SP', 'Estadual', 'Polícia', 'Delegado'],
    downloadCount: 18934,
    averageScore: 71.2,
    solvedBy: 4321
  },
  {
    id: '5',
    title: 'Tribunal de Justiça - Analista Judiciário',
    examBoard: 'FCC',
    year: 2024,
    position: 'Analista Judiciário',
    level: 'Superior',
    totalQuestions: 80,
    duration: '3h30min',
    passingScore: 50,
    candidates: 15000,
    approvalRate: 5.5,
    difficulty: 'Médio',
    subjects: [
      { name: 'Português', questions: 20, percentage: 25 },
      { name: 'Direito Constitucional', questions: 15, percentage: 18.75 },
      { name: 'Direito Administrativo', questions: 15, percentage: 18.75 },
      { name: 'Direito Processual Civil', questions: 15, percentage: 18.75 },
      { name: 'Informática', questions: 10, percentage: 12.5 },
      { name: 'Raciocínio Lógico', questions: 5, percentage: 6.25 }
    ],
    tags: ['TJ', 'Tribunal', 'Judiciário', 'Analista'],
    downloadCount: 9876,
    averageScore: 78.9,
    solvedBy: 2345
  }
];

const examBoards = ['Todas', 'CEBRASPE', 'FGV', 'VUNESP', 'FCC', 'CESPE', 'IDECAN'];
const years = ['Todos', '2024', '2023', '2022', '2021', '2020'];
const levels = ['Todos', 'Superior', 'Médio', 'Fundamental'];
const difficulties = ['Todas', 'Fácil', 'Médio', 'Difícil', 'Muito Difícil'];

export default function PreviousExamsPage() {
  const [selectedExam, setSelectedExam] = useState<PreviousExam | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'details'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBoard, setSelectedBoard] = useState('Todas');
  const [selectedYear, setSelectedYear] = useState('Todos');
  const [selectedLevel, setSelectedLevel] = useState('Todos');
  const [selectedDifficulty, setSelectedDifficulty] = useState('Todas');
  const [showFilters, setShowFilters] = useState(false);
  const [expandedSubjects, setExpandedSubjects] = useState(false);

  // Filtrar provas
  const filteredExams = mockExams.filter(exam => {
    const matchesSearch = exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exam.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exam.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesBoard = selectedBoard === 'Todas' || exam.examBoard === selectedBoard;
    const matchesYear = selectedYear === 'Todos' || exam.year.toString() === selectedYear;
    const matchesLevel = selectedLevel === 'Todos' || exam.level === selectedLevel;
    const matchesDifficulty = selectedDifficulty === 'Todas' || exam.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesBoard && matchesYear && matchesLevel && matchesDifficulty;
  });

  // Cor da dificuldade
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Fácil': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'Médio': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'Difícil': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
      case 'Muito Difícil': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  // Card de prova
  const ExamCard = ({ exam }: { exam: PreviousExam }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="h-full hover:shadow-xl transition-all duration-300 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className="font-police-subtitle">
                  {exam.examBoard}
                </Badge>
                <Badge variant="secondary" className="font-police-subtitle">
                  {exam.year}
                </Badge>
                <Badge className={cn("font-police-subtitle", getDifficultyColor(exam.difficulty))}>
                  {exam.difficulty}
                </Badge>
              </div>
              
              <h3 className="font-police-title font-bold text-lg text-gray-900 dark:text-white mb-1">
                {exam.title}
              </h3>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 font-police-body mb-2">
                {exam.position} • {exam.level}
              </p>
            </div>
            
            <button
              onClick={() => {
                // Toggle favorite
              }}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            >
              <Star 
                className={cn(
                  "w-5 h-5",
                  exam.isFavorite ? "fill-accent-500 text-accent-500" : "text-gray-400"
                )}
              />
            </button>
          </div>

          {/* Estatísticas */}
          <div className="grid grid-cols-2 gap-3 mb-4 text-sm font-police-body">
            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
              <FileText className="w-4 h-4" />
              <span className="font-police-numbers">{exam.totalQuestions}</span> questões
            </div>
            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
              <Clock className="w-4 h-4" />
              <span className="font-police-numbers">{exam.duration}</span>
            </div>
            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
              <Users className="w-4 h-4" />
              <span className="font-police-numbers">{exam.candidates.toLocaleString()}</span> candidatos
            </div>
            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
              <TrendingUp className="w-4 h-4" />
              <span className="font-police-numbers">{exam.approvalRate}%</span> aprovação
            </div>
          </div>

          {/* Nota de corte e estatísticas */}
          <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg mb-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400 font-police-body">Nota de corte:</span>
              <span className="font-bold text-gray-900 dark:text-white font-police-numbers">{exam.passingScore}</span>
            </div>
            {exam.averageScore && (
              <div className="flex items-center justify-between text-sm mt-1">
                <span className="text-gray-600 dark:text-gray-400 font-police-body">Média geral:</span>
                <span className="font-bold text-gray-900 dark:text-white font-police-numbers">{exam.averageScore}</span>
              </div>
            )}
          </div>

          {/* Principais matérias */}
          <div className="mb-4">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 font-police-subtitle">PRINCIPAIS MATÉRIAS:</p>
            <div className="flex flex-wrap gap-1">
              {exam.subjects.slice(0, 3).map((subject, idx) => (
                <Badge key={idx} variant="outline" className="text-xs font-police-body">
                  {subject.name} ({subject.questions}q)
                </Badge>
              ))}
              {exam.subjects.length > 3 && (
                <span className="text-xs text-gray-500 dark:text-gray-400 font-police-body">
                  +{exam.subjects.length - 3} matérias
                </span>
              )}
            </div>
          </div>

          {/* Ações */}
          <div className="flex gap-2">
            <Button 
              className="flex-1 gap-2 bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black font-police-subtitle"
              onClick={() => {
                setSelectedExam(exam);
                setViewMode('details');
              }}
            >
              <Eye className="w-4 h-4" />
              VER DETALHES
            </Button>
            <Button variant="outline" size="sm" className="p-2">
              <Download className="w-4 h-4" />
            </Button>
          </div>

          {/* Downloads e resoluções */}
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 font-police-body">
            <span className="flex items-center gap-1">
              <Download className="w-3 h-3" />
              <span className="font-police-numbers">{exam.downloadCount.toLocaleString()}</span> downloads
            </span>
            {exam.solvedBy && (
              <span className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                <span className="font-police-numbers">{exam.solvedBy.toLocaleString()}</span> resolveram
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  // Visualização de detalhes
  const DetailsView = ({ exam }: { exam: PreviousExam }) => (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <Card className="mb-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
        <CardContent className="p-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode('list')}
            className="mb-4 gap-2"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
            Voltar
          </Button>
          
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="secondary" className="font-police-subtitle">{exam.examBoard}</Badge>
                <Badge variant="secondary" className="font-police-subtitle">{exam.year}</Badge>
                <Badge className={cn("font-police-subtitle", getDifficultyColor(exam.difficulty))}>
                  {exam.difficulty}
                </Badge>
                <Badge className="bg-gray-900 text-white dark:bg-white dark:text-gray-900 font-police-subtitle">
                  {exam.level}
                </Badge>
              </div>
              
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 font-police-title">
                {exam.title}
              </h1>
              
              <p className="text-gray-600 dark:text-gray-400 mb-4 font-police-body">
                Cargo: {exam.position}
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm font-police-body">
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Total de questões</p>
                  <p className="font-bold text-gray-900 dark:text-white font-police-numbers">{exam.totalQuestions}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Duração</p>
                  <p className="font-bold text-gray-900 dark:text-white font-police-numbers">{exam.duration}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Nota de corte</p>
                  <p className="font-bold text-gray-900 dark:text-white font-police-numbers">{exam.passingScore}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Taxa de aprovação</p>
                  <p className="font-bold text-gray-900 dark:text-white font-police-numbers">{exam.approvalRate}%</p>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Star className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas da prova */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8 text-blue-500" />
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 font-police-body">Total de candidatos</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white font-police-numbers">
              {exam.candidates.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 font-police-body">
              Aprovados: <span className="font-bold font-police-numbers">{Math.floor(exam.candidates * exam.approvalRate / 100).toLocaleString()}</span>
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Target className="w-8 h-8 text-purple-500" />
              <Award className="w-5 h-5 text-yellow-500" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 font-police-body">Média de acertos</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white font-police-numbers">
              {exam.averageScore || 'N/A'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 font-police-body">
              Nota de corte: <span className="font-bold font-police-numbers">{exam.passingScore}</span>
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Download className="w-8 h-8 text-green-500" />
              <BarChart3 className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 font-police-body">Downloads</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white font-police-numbers">
              {exam.downloadCount.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 font-police-body">
              Resolvida por: <span className="font-bold font-police-numbers">{exam.solvedBy?.toLocaleString() || 'N/A'}</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Distribuição de matérias */}
      <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
        <CardHeader 
          className="cursor-pointer"
          onClick={() => setExpandedSubjects(!expandedSubjects)}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white font-police-title">
              DISTRIBUIÇÃO DE MATÉRIAS
            </h2>
            {expandedSubjects ? (
              <ChevronUp className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            )}
          </div>
        </CardHeader>
        
        <AnimatePresence>
          {expandedSubjects && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <CardContent className="pt-0">
                <div className="space-y-4">
                  {exam.subjects.map((subject, index) => (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                          <span className="font-medium text-gray-900 dark:text-white font-police-subtitle">
                            {subject.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-gray-600 dark:text-gray-400 font-police-numbers">
                            {subject.questions} questões
                          </span>
                          <span className="font-bold text-gray-900 dark:text-white font-police-numbers">
                            {subject.percentage}%
                          </span>
                        </div>
                      </div>
                      <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-accent-500 to-accent-600 h-2 rounded-full transition-all"
                          style={{ width: `${subject.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Resumo */}
                <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-3 font-police-subtitle">
                    ANÁLISE DA PROVA
                  </h3>
                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 font-police-body">
                    <p>• Prova com foco em {exam.subjects[0].name} ({exam.subjects[0].percentage}%)</p>
                    <p>• Total de {exam.subjects.length} disciplinas avaliadas</p>
                    <p>• Tempo médio por questão: {Math.floor((parseInt(exam.duration) * 60) / exam.totalQuestions)} segundos</p>
                    <p>• Nível de dificuldade: {exam.difficulty}</p>
                  </div>
                </div>

                {/* Ações */}
                <div className="mt-6 flex gap-3">
                  <Button className="flex-1 gap-2 bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black font-police-subtitle">
                    <Download className="w-4 h-4" />
                    BAIXAR PROVA (PDF)
                  </Button>
                  <Button variant="outline" className="flex-1 gap-2 font-police-subtitle">
                    <FileText className="w-4 h-4" />
                    VER GABARITO
                  </Button>
                  <Button variant="outline" className="flex-1 gap-2 font-police-subtitle">
                    <PlayCircle className="w-4 h-4" />
                    RESOLVER ONLINE
                  </Button>
                </div>
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* Dicas de estudo */}
      <Card className="mt-6 bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-900 text-white">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-accent-500 rounded-full flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-black" />
            </div>
            <h3 className="text-lg font-bold font-police-title">DICAS PARA ESTA PROVA</h3>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-100 font-police-body">
                Foque nas matérias com maior peso: {exam.subjects[0].name} e {exam.subjects[1].name} representam {(exam.subjects[0].percentage + exam.subjects[1].percentage).toFixed(1)}% da prova
              </p>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-100 font-police-body">
                Com {exam.approvalRate}% de aprovação, é essencial estar entre os melhores preparados
              </p>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-100 font-police-body">
                Resolva provas anteriores da banca {exam.examBoard} para se familiarizar com o estilo das questões
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="p-6">
      {viewMode === 'list' ? (
        <>
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 font-police-title">
                  PROVAS ANTERIORES
                </h1>
                <p className="text-gray-600 dark:text-gray-400 font-police-body">
                  Acesse provas anteriores dos principais concursos públicos
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-lg px-4 py-2 font-police-subtitle">
                  <FileText className="w-5 h-5 mr-2" />
                  {mockExams.length} PROVAS
                </Badge>
              </div>
            </div>

            {/* Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 font-police-body">Provas baixadas</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white font-police-numbers">156</p>
                    </div>
                    <Download className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 font-police-body">Resolvidas</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white font-police-numbers">42</p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 font-police-body">Média geral</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white font-police-numbers">73.5</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 font-police-body">Favoritas</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white font-police-numbers">8</p>
                    </div>
                    <Star className="w-8 h-8 text-yellow-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Barra de busca e filtros */}
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar por cargo, concurso ou palavra-chave..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-police-body"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <select
                  value={selectedBoard}
                  onChange={(e) => setSelectedBoard(e.target.value)}
                  className="px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-police-body"
                >
                  {examBoards.map(board => (
                    <option key={board} value={board}>{board}</option>
                  ))}
                </select>
                
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-police-body"
                >
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
                
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-police-body"
                >
                  {levels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
                
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="gap-2 font-police-subtitle"
                >
                  <Filter className="w-4 h-4" />
                  FILTROS
                </Button>
              </div>
            </div>

            {/* Filtros expandidos */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <select
                      value={selectedDifficulty}
                      onChange={(e) => setSelectedDifficulty(e.target.value)}
                      className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm font-police-body"
                    >
                      {difficulties.map(difficulty => (
                        <option key={difficulty} value={difficulty}>Dificuldade: {difficulty}</option>
                      ))}
                    </select>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSearchTerm('');
                        setSelectedBoard('Todas');
                        setSelectedYear('Todos');
                        setSelectedLevel('Todos');
                        setSelectedDifficulty('Todas');
                      }}
                      className="font-police-subtitle"
                    >
                      LIMPAR FILTROS
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Grid de provas */}
          {filteredExams.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredExams.map((exam) => (
                <ExamCard key={exam.id} exam={exam} />
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
              <FileText className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 font-police-title">
                Nenhuma prova encontrada
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 font-police-body">
                Tente ajustar os filtros ou fazer uma nova busca
              </p>
              <Button variant="outline" onClick={() => {
                setSearchTerm('');
                setSelectedBoard('Todas');
                setSelectedYear('Todos');
                setSelectedLevel('Todos');
                setSelectedDifficulty('Todas');
              }} className="font-police-subtitle">
                LIMPAR FILTROS
              </Button>
            </Card>
          )}
        </>
      ) : (
        selectedExam && <DetailsView exam={selectedExam} />
      )}

      {/* Call to Action */}
      {viewMode === 'list' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-8 text-white text-center"
        >
          <Shield className="w-12 h-12 mx-auto mb-4 text-accent-500" />
          <h2 className="text-2xl font-bold mb-2 font-police-title">
            PREPARE-SE COM AS MELHORES PROVAS
          </h2>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto font-police-body">
            Resolva provas anteriores dos principais concursos e aumente suas chances de aprovação
          </p>
          <div className="flex gap-3 justify-center">
            <Button size="lg" className="bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black font-police-subtitle">
              <Trophy className="w-5 h-5 mr-2" />
              RANKING DE PROVAS
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="border-white text-white hover:bg-white hover:text-gray-900 font-police-subtitle"
            >
              <BarChart3 className="w-5 h-5 mr-2" />
              ESTATÍSTICAS DETALHADAS
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}