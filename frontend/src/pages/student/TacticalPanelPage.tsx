import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Target,
  Brain,
  TrendingUp,
  TrendingDown,
  Award,
  Activity,
  BarChart3,
  PieChart,
  Calendar,
  Clock,
  Filter,
  Download,
  ChevronRight,
  ChevronDown,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  Zap,
  Trophy,
  Users,
  BookOpen,
  FileText,
  RefreshCw,
  Settings,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/utils/cn';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RePieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Treemap
} from 'recharts';

// Tipos
interface PerformanceData {
  date: string;
  questions: number;
  correct: number;
  accuracy: number;
  studyTime: number;
}

interface SubjectPerformance {
  subject: string;
  accuracy: number;
  questions: number;
  improvement: number;
  weakPoints: string[];
}

interface CompetitorData {
  rank: number;
  user: string;
  score: number;
  accuracy: number;
  questionsAnswered: number;
  isCurrentUser?: boolean;
}

interface WeakPoint {
  id: string;
  subject: string;
  topic: string;
  accuracy: number;
  totalQuestions: number;
  priority: 'high' | 'medium' | 'low';
  recommendation: string;
}

interface StudyPattern {
  dayOfWeek: string;
  avgHours: number;
  productivity: number;
}

// Dados mockados
const performanceHistory: PerformanceData[] = [
  { date: '2024-01-15', questions: 45, correct: 38, accuracy: 84.4, studyTime: 2.5 },
  { date: '2024-01-16', questions: 52, correct: 41, accuracy: 78.8, studyTime: 3.0 },
  { date: '2024-01-17', questions: 38, correct: 32, accuracy: 84.2, studyTime: 2.0 },
  { date: '2024-01-18', questions: 60, correct: 51, accuracy: 85.0, studyTime: 3.5 },
  { date: '2024-01-19', questions: 48, correct: 42, accuracy: 87.5, studyTime: 2.8 },
  { date: '2024-01-20', questions: 55, correct: 49, accuracy: 89.1, studyTime: 3.2 },
  { date: '2024-01-21', questions: 42, correct: 38, accuracy: 90.5, studyTime: 2.5 }
];

const subjectPerformance: SubjectPerformance[] = [
  {
    subject: 'Direito Constitucional',
    accuracy: 87.5,
    questions: 234,
    improvement: 12.3,
    weakPoints: ['Controle de Constitucionalidade', 'Processo Legislativo']
  },
  {
    subject: 'Direito Administrativo',
    accuracy: 82.1,
    questions: 189,
    improvement: 8.7,
    weakPoints: ['Licitações', 'Improbidade Administrativa']
  },
  {
    subject: 'Direito Penal',
    accuracy: 79.3,
    questions: 156,
    improvement: -2.1,
    weakPoints: ['Crimes contra a Administração', 'Teoria do Crime']
  },
  {
    subject: 'Português',
    accuracy: 91.2,
    questions: 178,
    improvement: 5.4,
    weakPoints: ['Concordância Verbal']
  },
  {
    subject: 'Informática',
    accuracy: 76.8,
    questions: 142,
    improvement: 15.2,
    weakPoints: ['Segurança da Informação', 'Redes']
  }
];

const competitors: CompetitorData[] = [
  { rank: 1, user: 'João Silva', score: 9234, accuracy: 92.3, questionsAnswered: 1234 },
  { rank: 2, user: 'Maria Santos', score: 9156, accuracy: 91.8, questionsAnswered: 1189 },
  { rank: 3, user: 'Pedro Oliveira', score: 8987, accuracy: 90.5, questionsAnswered: 1156 },
  { rank: 4, user: 'Você', score: 8876, accuracy: 89.1, questionsAnswered: 1098, isCurrentUser: true },
  { rank: 5, user: 'Ana Costa', score: 8654, accuracy: 88.7, questionsAnswered: 1076 },
  { rank: 6, user: 'Carlos Mendes', score: 8543, accuracy: 87.9, questionsAnswered: 1045 }
];

const weakPoints: WeakPoint[] = [
  {
    id: '1',
    subject: 'Direito Penal',
    topic: 'Crimes contra a Administração Pública',
    accuracy: 65.2,
    totalQuestions: 23,
    priority: 'high',
    recommendation: 'Revisar arts. 312-337 do Código Penal com foco em peculato e corrupção'
  },
  {
    id: '2',
    subject: 'Direito Administrativo',
    topic: 'Lei de Licitações',
    accuracy: 68.9,
    totalQuestions: 45,
    priority: 'high',
    recommendation: 'Estudar modalidades de licitação e casos de dispensa/inexigibilidade'
  },
  {
    id: '3',
    subject: 'Informática',
    topic: 'Protocolos de Rede',
    accuracy: 71.4,
    totalQuestions: 28,
    priority: 'medium',
    recommendation: 'Focar em TCP/IP, HTTP/HTTPS e protocolos de email'
  },
  {
    id: '4',
    subject: 'Direito Constitucional',
    topic: 'Controle de Constitucionalidade',
    accuracy: 74.3,
    totalQuestions: 35,
    priority: 'medium',
    recommendation: 'Revisar ADI, ADC, ADPF e controle difuso'
  }
];

const studyPatterns: StudyPattern[] = [
  { dayOfWeek: 'Segunda', avgHours: 3.2, productivity: 85 },
  { dayOfWeek: 'Terça', avgHours: 2.8, productivity: 88 },
  { dayOfWeek: 'Quarta', avgHours: 3.5, productivity: 82 },
  { dayOfWeek: 'Quinta', avgHours: 2.5, productivity: 90 },
  { dayOfWeek: 'Sexta', avgHours: 2.0, productivity: 78 },
  { dayOfWeek: 'Sábado', avgHours: 4.2, productivity: 92 },
  { dayOfWeek: 'Domingo', avgHours: 3.8, productivity: 87 }
];

// Dados para radar chart
const radarData = [
  { subject: 'Constitucional', A: 87.5, fullMark: 100 },
  { subject: 'Administrativo', A: 82.1, fullMark: 100 },
  { subject: 'Penal', A: 79.3, fullMark: 100 },
  { subject: 'Português', A: 91.2, fullMark: 100 },
  { subject: 'Informática', A: 76.8, fullMark: 100 },
  { subject: 'Raciocínio', A: 85.4, fullMark: 100 }
];

// Dados para treemap
const treemapData = [
  {
    name: 'Questões por Disciplina',
    children: [
      { name: 'Constitucional', size: 234, fill: '#3B82F6' },
      { name: 'Administrativo', size: 189, fill: '#10B981' },
      { name: 'Penal', size: 156, fill: '#F59E0B' },
      { name: 'Português', size: 178, fill: '#8B5CF6' },
      { name: 'Informática', size: 142, fill: '#EF4444' },
      { name: 'Raciocínio', size: 98, fill: '#6B7280' }
    ]
  }
];

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444'];

export default function TacticalPanelPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('7days');
  const [expandedSections, setExpandedSections] = useState<string[]>(['performance', 'subjects']);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  // Toggle seção expandida
  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  // Calcular métricas
  const totalQuestions = performanceHistory.reduce((acc, d) => acc + d.questions, 0);
  const totalCorrect = performanceHistory.reduce((acc, d) => acc + d.correct, 0);
  const avgAccuracy = (totalCorrect / totalQuestions * 100).toFixed(1);
  const totalStudyTime = performanceHistory.reduce((acc, d) => acc + d.studyTime, 0);
  const avgStudyTime = (totalStudyTime / performanceHistory.length).toFixed(1);

  // Componente de métrica
  const MetricCard = ({ 
    title, 
    value, 
    change, 
    icon: Icon, 
    color 
  }: { 
    title: string; 
    value: string; 
    change?: number; 
    icon: any; 
    color: string; 
  }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={cn("p-3 rounded-lg", color)}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          {change !== undefined && (
            <div className={cn(
              "flex items-center gap-1 text-sm font-medium",
              change > 0 ? "text-green-600" : change < 0 ? "text-red-600" : "text-gray-600"
            )}>
              {change > 0 ? <ArrowUp className="w-4 h-4" /> : 
               change < 0 ? <ArrowDown className="w-4 h-4" /> : 
               <Minus className="w-4 h-4" />}
              {Math.abs(change)}%
            </div>
          )}
        </div>
        <h3 className="text-2xl font-bold text-primary-900">{value}</h3>
        <p className="text-sm text-primary-600 mt-1">{title}</p>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-primary-900 mb-2">Painel Tático</h1>
            <p className="text-primary-600">
              Análise avançada de desempenho e insights personalizados
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="7days">Últimos 7 dias</option>
              <option value="30days">Últimos 30 dias</option>
              <option value="90days">Últimos 90 dias</option>
              <option value="all">Todo período</option>
            </select>
            <Button variant="outline" className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Atualizar
            </Button>
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Exportar
            </Button>
          </div>
        </div>

        {/* Métricas principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <MetricCard
            title="Taxa de Acerto"
            value={`${avgAccuracy}%`}
            change={5.2}
            icon={Target}
            color="bg-blue-500"
          />
          <MetricCard
            title="Questões Respondidas"
            value={totalQuestions.toString()}
            change={12.3}
            icon={FileText}
            color="bg-green-500"
          />
          <MetricCard
            title="Tempo de Estudo"
            value={`${totalStudyTime.toFixed(1)}h`}
            change={-3.1}
            icon={Clock}
            color="bg-purple-500"
          />
          <MetricCard
            title="Ranking Geral"
            value="#4"
            change={0}
            icon={Trophy}
            color="bg-yellow-500"
          />
        </div>
      </motion.div>

      {/* Seção: Evolução de Performance */}
      <Card className="mb-6">
        <CardHeader
          className="cursor-pointer"
          onClick={() => toggleSection('performance')}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Activity className="w-5 h-5 text-primary-600" />
              <h2 className="text-xl font-bold text-primary-900">Evolução de Performance</h2>
            </div>
            {expandedSections.includes('performance') ? (
              <ChevronUp className="w-5 h-5 text-primary-600" />
            ) : (
              <ChevronDown className="w-5 h-5 text-primary-600" />
            )}
          </div>
        </CardHeader>
        
        <AnimatePresence>
          {expandedSections.includes('performance') && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <CardContent>
                <div className="mb-4">
                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full" />
                      <span>Taxa de Acerto</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full" />
                      <span>Questões Respondidas</span>
                    </div>
                  </div>
                </div>
                
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceHistory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={(date) => new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Line yAxisId="left" type="monotone" dataKey="accuracy" stroke="#3B82F6" strokeWidth={2} name="Taxa de Acerto (%)" />
                    <Line yAxisId="right" type="monotone" dataKey="questions" stroke="#10B981" strokeWidth={2} name="Questões" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* Seção: Desempenho por Disciplina */}
      <Card className="mb-6">
        <CardHeader
          className="cursor-pointer"
          onClick={() => toggleSection('subjects')}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-5 h-5 text-primary-600" />
              <h2 className="text-xl font-bold text-primary-900">Desempenho por Disciplina</h2>
            </div>
            {expandedSections.includes('subjects') ? (
              <ChevronUp className="w-5 h-5 text-primary-600" />
            ) : (
              <ChevronDown className="w-5 h-5 text-primary-600" />
            )}
          </div>
        </CardHeader>
        
        <AnimatePresence>
          {expandedSections.includes('subjects') && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Gráfico de barras */}
                  <div>
                    <h3 className="text-sm font-medium text-primary-700 mb-4">Taxa de Acerto por Disciplina</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={subjectPerformance}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="subject" angle={-45} textAnchor="end" height={80} />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="accuracy" fill="#3B82F6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  
                  {/* Radar chart */}
                  <div>
                    <h3 className="text-sm font-medium text-primary-700 mb-4">Visão Geral de Competências</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <RadarChart data={radarData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="subject" />
                        <PolarRadiusAxis angle={90} domain={[0, 100]} />
                        <Radar name="Desempenho" dataKey="A" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.6} />
                        <Tooltip />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                {/* Lista de disciplinas */}
                <div className="mt-6 space-y-3">
                  {subjectPerformance.map((subject) => (
                    <div
                      key={subject.subject}
                      className={cn(
                        "p-4 border rounded-lg cursor-pointer transition-all",
                        selectedSubject === subject.subject ? "border-primary-500 bg-primary-50" : "border-primary-200 hover:border-primary-300"
                      )}
                      onClick={() => setSelectedSubject(subject.subject === selectedSubject ? null : subject.subject)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-primary-900">{subject.subject}</h4>
                            <div className="flex items-center gap-3">
                              <Badge variant="secondary">
                                {subject.questions} questões
                              </Badge>
                              <div className={cn(
                                "flex items-center gap-1 text-sm font-medium",
                                subject.improvement > 0 ? "text-green-600" : "text-red-600"
                              )}>
                                {subject.improvement > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                {Math.abs(subject.improvement)}%
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <div className="flex-1">
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-primary-600">Taxa de acerto</span>
                                <span className="font-medium">{subject.accuracy}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className={cn(
                                    "h-full rounded-full transition-all",
                                    subject.accuracy >= 85 ? "bg-green-500" :
                                    subject.accuracy >= 70 ? "bg-yellow-500" :
                                    "bg-red-500"
                                  )}
                                  style={{ width: `${subject.accuracy}%` }}
                                />
                              </div>
                            </div>
                          </div>
                          
                          {selectedSubject === subject.subject && subject.weakPoints.length > 0 && (
                            <div className="mt-3 pt-3 border-t">
                              <p className="text-sm text-primary-600 mb-2">Pontos de atenção:</p>
                              <div className="flex flex-wrap gap-2">
                                {subject.weakPoints.map((point) => (
                                  <Badge key={point} variant="outline" className="text-xs">
                                    {point}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* Grid de análises */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Pontos Fracos */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <h2 className="text-xl font-bold text-primary-900">Pontos de Atenção</h2>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {weakPoints.map((point) => (
                <div key={point.id} className="p-4 border border-primary-200 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-medium text-primary-900">{point.topic}</h4>
                      <p className="text-sm text-primary-600">{point.subject}</p>
                    </div>
                    <Badge
                      className={cn(
                        point.priority === 'high' && "bg-red-100 text-red-700",
                        point.priority === 'medium' && "bg-yellow-100 text-yellow-700",
                        point.priority === 'low' && "bg-green-100 text-green-700"
                      )}
                    >
                      {point.priority === 'high' ? 'Alta' : point.priority === 'medium' ? 'Média' : 'Baixa'}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 mb-3">
                    <div className="text-sm">
                      <span className="text-primary-600">Taxa de acerto: </span>
                      <span className="font-medium text-red-600">{point.accuracy}%</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-primary-600">Questões: </span>
                      <span className="font-medium">{point.totalQuestions}</span>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 rounded p-3">
                    <div className="flex items-start gap-2">
                      <Info className="w-4 h-4 text-blue-600 mt-0.5" />
                      <p className="text-sm text-blue-800">{point.recommendation}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Padrões de Estudo */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Brain className="w-5 h-5 text-purple-600" />
              <h2 className="text-xl font-bold text-primary-900">Padrões de Estudo</h2>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <h3 className="text-sm font-medium text-primary-700 mb-3">Horas de Estudo por Dia</h3>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={studyPatterns}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="dayOfWeek" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="avgHours" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <Zap className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-primary-900">{avgStudyTime}h</p>
                <p className="text-sm text-primary-600">Média diária</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <Trophy className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-primary-900">Quinta</p>
                <p className="text-sm text-primary-600">Dia mais produtivo</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ranking Comparativo */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-primary-600" />
              <h2 className="text-xl font-bold text-primary-900">Ranking Comparativo</h2>
            </div>
            <Badge variant="secondary">Top 10%</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b">
                  <th className="pb-3 text-sm font-medium text-primary-600">Posição</th>
                  <th className="pb-3 text-sm font-medium text-primary-600">Usuário</th>
                  <th className="pb-3 text-sm font-medium text-primary-600">Pontuação</th>
                  <th className="pb-3 text-sm font-medium text-primary-600">Taxa de Acerto</th>
                  <th className="pb-3 text-sm font-medium text-primary-600">Questões</th>
                </tr>
              </thead>
              <tbody>
                {competitors.map((competitor) => (
                  <tr
                    key={competitor.rank}
                    className={cn(
                      "border-b",
                      competitor.isCurrentUser && "bg-primary-50"
                    )}
                  >
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        {competitor.rank <= 3 && (
                          <Trophy className={cn(
                            "w-5 h-5",
                            competitor.rank === 1 && "text-yellow-500",
                            competitor.rank === 2 && "text-gray-400",
                            competitor.rank === 3 && "text-orange-600"
                          )} />
                        )}
                        <span className="font-medium">#{competitor.rank}</span>
                      </div>
                    </td>
                    <td className="py-3 font-medium">
                      {competitor.user}
                      {competitor.isCurrentUser && (
                        <Badge className="ml-2" variant="secondary">Você</Badge>
                      )}
                    </td>
                    <td className="py-3">{competitor.score.toLocaleString()}</td>
                    <td className="py-3">{competitor.accuracy}%</td>
                    <td className="py-3">{competitor.questionsAnswered.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Distribuição de Questões */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <PieChart className="w-5 h-5 text-primary-600" />
            <h2 className="text-xl font-bold text-primary-900">Distribuição de Questões</h2>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <Treemap
              data={treemapData}
              dataKey="size"
              ratio={4 / 3}
              stroke="#fff"
              fill="#3B82F6"
            >
              <Tooltip />
            </Treemap>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}