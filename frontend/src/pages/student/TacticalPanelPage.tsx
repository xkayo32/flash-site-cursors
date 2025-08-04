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
  ChevronUp,
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
import { PageHeader } from '@/components/student';
import toast from 'react-hot-toast';
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
    subject: 'DIREITO CONSTITUCIONAL',
    accuracy: 87.5,
    questions: 234,
    improvement: 12.3,
    weakPoints: ['CONTROLE DE CONSTITUCIONALIDADE', 'PROCESSO LEGISLATIVO']
  },
  {
    subject: 'DIREITO ADMINISTRATIVO',
    accuracy: 82.1,
    questions: 189,
    improvement: 8.7,
    weakPoints: ['LICITAÇÕES', 'IMPROBIDADE ADMINISTRATIVA']
  },
  {
    subject: 'DIREITO PENAL',
    accuracy: 79.3,
    questions: 156,
    improvement: -2.1,
    weakPoints: ['CRIMES CONTRA A ADMINISTRAÇÃO', 'TEORIA DO CRIME']
  },
  {
    subject: 'PORTUGUÊS TÁTICO',
    accuracy: 91.2,
    questions: 178,
    improvement: 5.4,
    weakPoints: ['CONCORDÂNCIA VERBAL']
  },
  {
    subject: 'INFORMÁTICA MILITAR',
    accuracy: 76.8,
    questions: 142,
    improvement: 15.2,
    weakPoints: ['SEGURANÇA DA INFORMAÇÃO', 'REDES TÁTICAS']
  }
];

const competitors: CompetitorData[] = [
  { rank: 1, user: 'COMANDANTE SILVA', score: 9234, accuracy: 92.3, questionsAnswered: 1234 },
  { rank: 2, user: 'CAPITÃ SANTOS', score: 9156, accuracy: 91.8, questionsAnswered: 1189 },
  { rank: 3, user: 'SARGENTO OLIVEIRA', score: 8987, accuracy: 90.5, questionsAnswered: 1156 },
  { rank: 4, user: 'OPERADOR', score: 8876, accuracy: 89.1, questionsAnswered: 1098, isCurrentUser: true },
  { rank: 5, user: 'AGENTE COSTA', score: 8654, accuracy: 88.7, questionsAnswered: 1076 },
  { rank: 6, user: 'TENENTE MENDES', score: 8543, accuracy: 87.9, questionsAnswered: 1045 }
];

const weakPoints: WeakPoint[] = [
  {
    id: '1',
    subject: 'DIREITO PENAL',
    topic: 'CRIMES CONTRA A ADMINISTRAÇÃO PÚBLICA',
    accuracy: 65.2,
    totalQuestions: 23,
    priority: 'high',
    recommendation: 'REVISAR ARTS. 312-337 DO CÓDIGO PENAL COM FOCO EM PECULATO E CORRUPÇÃO'
  },
  {
    id: '2',
    subject: 'DIREITO ADMINISTRATIVO',
    topic: 'LEI DE LICITAÇÕES',
    accuracy: 68.9,
    totalQuestions: 45,
    priority: 'high',
    recommendation: 'ESTUDAR MODALIDADES DE LICITAÇÃO E CASOS DE DISPENSA/INEXIGIBILIDADE'
  },
  {
    id: '3',
    subject: 'INFORMÁTICA MILITAR',
    topic: 'PROTOCOLOS DE REDE TÁTICA',
    accuracy: 71.4,
    totalQuestions: 28,
    priority: 'medium',
    recommendation: 'FOCAR EM TCP/IP, HTTP/HTTPS E PROTOCOLOS DE COMUNICAÇÃO DIGITAL'
  },
  {
    id: '4',
    subject: 'DIREITO CONSTITUCIONAL',
    topic: 'CONTROLE DE CONSTITUCIONALIDADE',
    accuracy: 74.3,
    totalQuestions: 35,
    priority: 'medium',
    recommendation: 'REVISAR ADI, ADC, ADPF E CONTROLE DIFUSO'
  }
];

const studyPatterns: StudyPattern[] = [
  { dayOfWeek: 'SEG', avgHours: 3.2, productivity: 85 },
  { dayOfWeek: 'TER', avgHours: 2.8, productivity: 88 },
  { dayOfWeek: 'QUA', avgHours: 3.5, productivity: 82 },
  { dayOfWeek: 'QUI', avgHours: 2.5, productivity: 90 },
  { dayOfWeek: 'SEX', avgHours: 2.0, productivity: 78 },
  { dayOfWeek: 'SAB', avgHours: 4.2, productivity: 92 },
  { dayOfWeek: 'DOM', avgHours: 3.8, productivity: 87 }
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
        <h3 className="text-2xl font-bold text-primary-900 font-police-numbers">{value}</h3>
        <p className="text-sm text-primary-600 mt-1 font-police-body uppercase tracking-wider">{title}</p>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6">
      <PageHeader
        title="COMANDO TÁTICO DE INTELIGÊNCIA"
        subtitle="ANÁLISE AVANÇADA DE DESEMPENHO E INSIGHTS ESTRATÉGICOS"
        icon={Target}
        breadcrumbs={[
          { label: 'DASHBOARD', href: '/student/dashboard' },
          { label: 'PAINEL TÁTICO' }
        ]}
        actions={
          <div className="flex items-center gap-3">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 font-police-body"
            >
              <option value="7days">ÚLTIMOS 7 DIAS</option>
              <option value="30days">ÚLTIMOS 30 DIAS</option>
              <option value="90days">ÚLTIMOS 90 DIAS</option>
              <option value="all">TODO PERÍODO</option>
            </select>
            <Button 
              variant="outline" 
              className="gap-2 font-police-body uppercase tracking-wider"
              onClick={() => toast.success('INTELIGÊNCIA ATUALIZADA!', { icon: '🔄' })}
            >
              <RefreshCw className="w-4 h-4" />
              ATUALIZAR
            </Button>
            <Button 
              variant="outline" 
              className="gap-2 font-police-body uppercase tracking-wider"
              onClick={() => toast.success('RELATÓRIO EXPORTADO!', { icon: '📥' })}
            >
              <Download className="w-4 h-4" />
              EXPORTAR
            </Button>
          </div>
        }
      />

      {/* Métricas principais */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <MetricCard
            title="PRECISÃO TÁTICA"
            value={`${avgAccuracy}%`}
            change={5.2}
            icon={Target}
            color="bg-blue-500"
          />
          <MetricCard
            title="ALVOS ABATIDOS"
            value={totalQuestions.toString()}
            change={12.3}
            icon={FileText}
            color="bg-green-500"
          />
          <MetricCard
            title="TEMPO DE OPERAÇÃO"
            value={`${totalStudyTime.toFixed(1)}h`}
            change={-3.1}
            icon={Clock}
            color="bg-purple-500"
          />
          <MetricCard
            title="RANKING OPERACIONAL"
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
              <h2 className="text-xl font-bold text-primary-900 font-police-title uppercase tracking-wider">EVOLUÇÃO DE DESEMPENHO TÁTICO</h2>
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
                      <span className="font-police-body">PRECISÃO TÁTICA</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full" />
                      <span className="font-police-body">ALVOS ELIMINADOS</span>
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
                    <Line yAxisId="left" type="monotone" dataKey="accuracy" stroke="#3B82F6" strokeWidth={2} name="PRECISÃO TÁTICA (%)" />
                    <Line yAxisId="right" type="monotone" dataKey="questions" stroke="#10B981" strokeWidth={2} name="ALVOS" />
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
              <h2 className="text-xl font-bold text-primary-900 font-police-title uppercase tracking-wider">DESEMPENHO POR ÁREA OPERACIONAL</h2>
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
                    <h3 className="text-sm font-medium text-primary-700 mb-4 font-police-body uppercase tracking-wider">PRECISÃO POR ÁREA TÁTICA</h3>
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
                    <h3 className="text-sm font-medium text-primary-700 mb-4 font-police-body uppercase tracking-wider">MAPA DE COMPETÊNCIAS TÁTICAS</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <RadarChart data={radarData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="subject" />
                        <PolarRadiusAxis angle={90} domain={[0, 100]} />
                        <Radar name="DESEMPENHO TÁTICO" dataKey="A" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.6} />
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
                              <Badge variant="secondary" className="font-police-body">
                                {subject.questions} ALVOS
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
                                <span className="text-primary-600 font-police-body">PRECISÃO</span>
                                <span className="font-medium font-police-numbers">{subject.accuracy}%</span>
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
                              <p className="text-sm text-primary-600 mb-2 font-police-body uppercase tracking-wider">PONTOS CRÍTICOS:</p>
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
              <h2 className="text-xl font-bold text-primary-900 font-police-title uppercase tracking-wider">PONTOS CRÍTICOS DE ATENÇÃO</h2>
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
                      {point.priority === 'high' ? 'CRÍTICA' : point.priority === 'medium' ? 'MÉDIA' : 'BAIXA'}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 mb-3">
                    <div className="text-sm">
                      <span className="text-primary-600 font-police-body">PRECISÃO: </span>
                      <span className="font-medium text-red-600 font-police-numbers">{point.accuracy}%</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-primary-600 font-police-body">ALVOS: </span>
                      <span className="font-medium font-police-numbers">{point.totalQuestions}</span>
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
              <h2 className="text-xl font-bold text-primary-900 font-police-title uppercase tracking-wider">PADRÕES DE TREINAMENTO</h2>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <h3 className="text-sm font-medium text-primary-700 mb-3 font-police-body uppercase tracking-wider">HORAS DE TREINAMENTO POR DIA</h3>
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
                <p className="text-2xl font-bold text-primary-900 font-police-numbers">{avgStudyTime}h</p>
                <p className="text-sm text-primary-600 font-police-body uppercase tracking-wider">MÉDIA DIÁRIA</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <Trophy className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-primary-900 font-police-title">QUINTA</p>
                <p className="text-sm text-primary-600 font-police-body uppercase tracking-wider">DIA MAIS EFICIENTE</p>
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
              <h2 className="text-xl font-bold text-primary-900 font-police-title uppercase tracking-wider">RANKING OPERACIONAL</h2>
            </div>
            <Badge variant="secondary" className="font-police-body">TOP 10% ELITE</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b">
                  <th className="pb-3 text-sm font-medium text-primary-600 font-police-body uppercase tracking-wider">POSIÇÃO</th>
                  <th className="pb-3 text-sm font-medium text-primary-600 font-police-body uppercase tracking-wider">OPERADOR</th>
                  <th className="pb-3 text-sm font-medium text-primary-600 font-police-body uppercase tracking-wider">PONTUAÇÃO</th>
                  <th className="pb-3 text-sm font-medium text-primary-600 font-police-body uppercase tracking-wider">PRECISÃO</th>
                  <th className="pb-3 text-sm font-medium text-primary-600 font-police-body uppercase tracking-wider">ALVOS</th>
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
                        <Badge className="ml-2 font-police-body" variant="secondary">VOCÊ</Badge>
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
            <h2 className="text-xl font-bold text-primary-900 font-police-title uppercase tracking-wider">DISTRIBUIÇÃO DE ALVOS POR ÁREA</h2>
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