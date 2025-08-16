import { useState, useEffect } from 'react';
import { analyticsService, AnalyticsResponse } from '@/services/analyticsService';
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

// State management for analytics data
export default function TacticalPanelPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('30days');
  const [isUpdating, setIsUpdating] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>(['performance', 'subjects']);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  // Load analytics data
  const loadAnalytics = async (period: string = selectedPeriod) => {
    try {
      setLoading(true);
      setError(null);
      const data = await analyticsService.getAnalytics(period);
      setAnalyticsData(data);
    } catch (err: any) {
      console.error('Error loading analytics:', err);
      setError(err.message || 'Erro ao carregar dados táticos');
    } finally {
      setLoading(false);
    }
  };

  // Refresh analytics
  const handleRefresh = async () => {
    try {
      setIsUpdating(true);
      await analyticsService.refreshAnalytics();
      await loadAnalytics();
      toast.success('DADOS TÁTICOS ATUALIZADOS!', { 
        icon: '🎯',
        style: {
          background: '#14242f',
          color: '#facc15',
          border: '2px solid #facc15'
        }
      });
    } catch (err: any) {
      toast.error('Erro ao atualizar dados', {
        style: {
          background: '#330000',
          color: '#ff6666',
          border: '2px solid #ff6666'
        }
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Export data
  const handleExport = async () => {
    try {
      const blob = await analyticsService.exportData('pdf');
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `relatorio-tatico-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('RELATÓRIO TÁTICO EXPORTADO!', { 
        icon: '📥',
        style: {
          background: '#14242f',
          color: '#facc15',
          border: '2px solid #facc15'
        }
      });
    } catch (err: any) {
      toast.error('Erro ao exportar relatório', {
        style: {
          background: '#330000',
          color: '#ff6666',
          border: '2px solid #ff6666'
        }
      });
    }
  };

  // Handle period change
  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
    loadAnalytics(period);
  };

  // Load data on mount
  useEffect(() => {
    loadAnalytics();
  }, []);

  // Calculate derived data
  const performanceHistory = analyticsData?.performance || [];
  const subjectPerformance = analyticsData?.subjectPerformance || [];
  const competitors = analyticsData?.competitors || [];
  const weakPoints = analyticsData?.weakPoints || [];
  const studyPatterns = analyticsData?.studyPatterns || [];
  const stats = analyticsData?.stats;

// Dados para radar chart baseados em performance real
const radarData = subjectPerformance.length > 0 ? subjectPerformance.map(s => ({
  subject: s.subject.length > 12 ? s.subject.substring(0, 12) + '...' : s.subject,
  A: s.accuracy || 0,
  fullMark: 100
})) : [
  { subject: 'Sem dados', A: 0, fullMark: 100 }
];

// Dados para treemap baseados em performance real
const treemapData = [
  {
    name: 'Alvos por Área Operacional',
    children: subjectPerformance.length > 0 ? subjectPerformance.map((s, idx) => ({
      name: s.subject,
      size: s.totalQuestions || 1,
      fill: COLORS[idx % COLORS.length]
    })) : [{ name: 'Sem dados', size: 1, fill: '#6B7280' }]
  }
];

const COLORS = ['#facc15', '#22c55e', '#ef4444', '#3b82f6', '#8b5cf6', '#f59e0b', '#06b6d4'];

  // Toggle seção expandida
  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  // Loading and error states
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-accent-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400 font-police-body uppercase tracking-wider">
              CARREGANDO DADOS TÁTICOS...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 dark:text-red-400 font-police-body uppercase tracking-wider mb-4">
              {error}
            </p>
            <Button onClick={() => loadAnalytics()} variant="outline">
              TENTAR NOVAMENTE
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Calcular métricas usando dados reais da API
  const totalQuestions = performanceHistory.reduce((acc, d) => acc + (d.totalQuestions || 0), 0);
  const totalCorrect = performanceHistory.reduce((acc, d) => acc + (d.correctAnswers || 0), 0);
  const avgAccuracy = totalQuestions > 0 ? (totalCorrect / totalQuestions * 100).toFixed(1) : '0.0';
  const totalStudyTime = performanceHistory.reduce((acc, d) => acc + (d.studyTime || 0), 0);
  const avgStudyTime = performanceHistory.length > 0 ? (totalStudyTime / performanceHistory.length).toFixed(1) : '0.0';

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
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-accent-500/10 to-transparent rounded-bl-full" />
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className={cn("p-3 rounded-lg shadow-lg", color)}>
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
          <h3 className="text-2xl font-bold text-primary-900 dark:text-white font-police-numbers">{value}</h3>
          <p className="text-sm text-primary-600 dark:text-gray-400 mt-1 font-police-body uppercase tracking-wider">{title}</p>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-black dark:via-gray-900 dark:to-black min-h-screen">
      <PageHeader
        title="CENTRAL DE INTELIGÊNCIA OPERACIONAL"
        subtitle="ANÁLISE TÁTICA AVANÇADA E MONITORAMENTO DE PERFORMANCE"
        icon={Target}
        breadcrumbs={[
          { label: 'COMANDO', href: '/student/dashboard' },
          { label: 'INTELIGÊNCIA TÁTICA' }
        ]}
        actions={
          <div className="flex items-center gap-3">
            <select
              value={selectedPeriod}
              onChange={(e) => handlePeriodChange(e.target.value)}
              className="px-4 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 font-police-body"
            >
              <option value="7days">🎯 7 DIAS</option>
              <option value="30days">🚀 30 DIAS</option>
              <option value="90days">⚔️ 90 DIAS</option>
              <option value="all">🏆 COMPLETO</option>
            </select>
            <Button 
              variant="outline" 
              className="gap-2 font-police-body uppercase tracking-wider"
              onClick={handleRefresh}
              disabled={isUpdating}
            >
              <RefreshCw className={`w-4 h-4 ${isUpdating ? 'animate-spin' : ''}`} />
              {isUpdating ? 'ATUALIZANDO...' : 'ATUALIZAR'}
            </Button>
            <Button 
              variant="outline" 
              className="gap-2 font-police-body uppercase tracking-wider"
              onClick={handleExport}
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
        className="relative"
      >
        {/* Tactical stripes decoration */}
        <div className="absolute -top-2 left-0 w-32 h-1 bg-gradient-to-r from-accent-500 to-transparent" />
        <div className="absolute -top-2 right-0 w-32 h-1 bg-gradient-to-l from-accent-500 to-transparent" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <MetricCard
            title="PRECISÃO TÁTICA"
            value={`${stats?.averageScore || 0}%`}
            change={stats?.improvement || 0}
            icon={Target}
            color="bg-gradient-to-br from-accent-500 to-accent-600"
          />
          <MetricCard
            title="ALVOS ABATIDOS"
            value={stats?.questionsAnswered?.toLocaleString() || '0'}
            change={12.3}
            icon={FileText}
            color="bg-gradient-to-br from-green-500 to-green-600"
          />
          <MetricCard
            title="TEMPO DE OPERAÇÃO"
            value={`${stats?.totalStudyTime || 0}h`}
            change={-3.1}
            icon={Clock}
            color="bg-gradient-to-br from-purple-500 to-purple-600"
          />
          <MetricCard
            title="RANKING OPERACIONAL"
            value={`#${stats?.rank || 0}`}
            change={0}
            icon={Trophy}
            color="bg-gradient-to-br from-orange-500 to-orange-600"
          />
        </div>
      </motion.div>

      {/* Seção: Evolução de Performance */}
      <Card className="mb-6 border-l-4 border-l-accent-500 shadow-xl hover:shadow-2xl transition-all duration-300">
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
                    <Line 
                      yAxisId="left" 
                      type="monotone" 
                      dataKey="accuracy" 
                      stroke="#facc15" 
                      strokeWidth={3} 
                      name="PRECISÃO TÁTICA (%)" 
                      dot={{ fill: '#facc15', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line 
                      yAxisId="right" 
                      type="monotone" 
                      dataKey="totalQuestions" 
                      stroke="#22c55e" 
                      strokeWidth={2} 
                      name="ALVOS ABATIDOS" 
                      dot={{ fill: '#22c55e', strokeWidth: 1, r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* Seção: Desempenho por Disciplina */}
      <Card className="mb-6 border-l-4 border-l-green-500 shadow-xl hover:shadow-2xl transition-all duration-300">
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
        <Card className="border-t-4 border-t-red-500 shadow-xl hover:shadow-2xl transition-all duration-300">
          <CardHeader>
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <h2 className="text-xl font-bold text-primary-900 font-police-title uppercase tracking-wider">PONTOS CRÍTICOS DE ATENÇÃO</h2>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {weakPoints.map((point) => (
                <motion.div 
                  key={point.id} 
                  className="p-4 border-2 border-red-500/30 rounded-lg bg-gradient-to-br from-red-500/5 to-transparent hover:border-red-500/50 transition-all duration-300"
                  whileHover={{ scale: 1.02 }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * weakPoints.indexOf(point) }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-medium text-primary-900 dark:text-white">{point.topic}</h4>
                      <p className="text-sm text-primary-600 dark:text-gray-400">{point.subject}</p>
                    </div>
                    <Badge
                      className={cn(
                        point.priority === 'high' && "bg-red-500 text-white border-0",
                        point.priority === 'medium' && "bg-yellow-500 text-black border-0",
                        point.priority === 'low' && "bg-green-500 text-white border-0"
                      )}
                    >
                      {point.priority === 'high' ? '🔴 CRÍTICA' : point.priority === 'medium' ? '🟡 MÉDIA' : '🟢 BAIXA'}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 mb-3">
                    <div className="text-sm">
                      <span className="text-primary-600 dark:text-gray-400 font-police-body">PRECISÃO: </span>
                      <span className="font-medium text-red-500 font-police-numbers">{point.accuracy}%</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-primary-600 dark:text-gray-400 font-police-body">ALVOS: </span>
                      <span className="font-medium font-police-numbers text-primary-900 dark:text-white">{point.totalQuestions}</span>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/30 rounded p-3">
                    <div className="flex items-start gap-2">
                      <Info className="w-4 h-4 text-blue-500 mt-0.5" />
                      <p className="text-sm text-blue-700 dark:text-blue-400">{point.recommendation}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Padrões de Estudo */}
        <Card className="border-t-4 border-t-purple-500 shadow-xl hover:shadow-2xl transition-all duration-300">
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
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="period" stroke="#9CA3AF" style={{ fontFamily: 'Exo 2', fontSize: 11 }} />
                  <YAxis stroke="#9CA3AF" style={{ fontFamily: 'Exo 2', fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#14242f', 
                      border: '1px solid #facc15',
                      borderRadius: '8px'
                    }}
                    labelStyle={{ color: '#facc15' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="averageTime" 
                    stroke="#facc15" 
                    fill="#facc15" 
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-gradient-to-br from-accent-500/10 to-accent-500/5 border border-accent-500/30 rounded-lg">
                <Zap className="w-8 h-8 text-accent-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-primary-900 dark:text-white font-police-numbers">{avgStudyTime}h</p>
                <p className="text-sm text-primary-600 dark:text-gray-400 font-police-body uppercase tracking-wider">TEMPO MÉDIO</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/30 rounded-lg">
                <Trophy className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-primary-900 dark:text-white font-police-title">NOITE</p>
                <p className="text-sm text-primary-600 dark:text-gray-400 font-police-body uppercase tracking-wider">PERÍODO MAIS EFICIENTE</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ranking Comparativo */}
      <Card className="mb-6 border-l-4 border-l-orange-500 shadow-xl hover:shadow-2xl transition-all duration-300">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-primary-600" />
              <h2 className="text-xl font-bold text-primary-900 font-police-title uppercase tracking-wider">RANKING OPERACIONAL</h2>
            </div>
            <Badge className="font-police-body bg-gradient-to-r from-accent-500 to-accent-600 text-black border-0">TOP 10% ELITE OPERACIONAL</Badge>
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
                        <Badge className="ml-2 font-police-body bg-accent-500 text-black border-0">VOCÊ</Badge>
                      )}
                    </td>
                    <td className="py-3">{(competitor.score || 0).toLocaleString()}</td>
                    <td className="py-3">{competitor.accuracy || 0}%</td>
                    <td className="py-3">{(competitor.questionsAnswered || 0).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Distribuição de Questões */}
      <Card className="border-t-4 border-t-blue-500 shadow-xl hover:shadow-2xl transition-all duration-300">
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