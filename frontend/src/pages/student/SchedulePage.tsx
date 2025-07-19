import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  Clock,
  Target,
  BookOpen,
  Brain,
  Trophy,
  ChevronLeft,
  ChevronRight,
  Plus,
  Settings,
  Download,
  Share2,
  CheckCircle,
  AlertCircle,
  Zap,
  BarChart3,
  TrendingUp,
  User,
  FileText,
  Video,
  Layers,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/utils/cn';

// Tipos
interface StudyBlock {
  id: string;
  startTime: string;
  endTime: string;
  subject: string;
  topic: string;
  type: 'video' | 'reading' | 'practice' | 'review' | 'exam';
  duration: number; // em minutos
  priority: 'high' | 'medium' | 'low';
  completed?: boolean;
  progress?: number;
}

interface DailySchedule {
  date: string;
  blocks: StudyBlock[];
  totalHours: number;
  completedHours: number;
}

interface ExamInfo {
  name: string;
  date: string;
  daysLeft: number;
  totalTopics: number;
  completedTopics: number;
  subjects: {
    name: string;
    weight: number;
    progress: number;
    hoursNeeded: number;
  }[];
}

// Dados mockados
const examInfo: ExamInfo = {
  name: 'Polícia Federal - Agente',
  date: '2024-05-15',
  daysLeft: 117,
  totalTopics: 156,
  completedTopics: 42,
  subjects: [
    { name: 'Direito Constitucional', weight: 20, progress: 35, hoursNeeded: 120 },
    { name: 'Direito Penal', weight: 15, progress: 28, hoursNeeded: 90 },
    { name: 'Direito Administrativo', weight: 15, progress: 22, hoursNeeded: 90 },
    { name: 'Informática', weight: 10, progress: 45, hoursNeeded: 60 },
    { name: 'Português', weight: 10, progress: 55, hoursNeeded: 60 },
    { name: 'Raciocínio Lógico', weight: 10, progress: 18, hoursNeeded: 60 },
    { name: 'Contabilidade', weight: 10, progress: 15, hoursNeeded: 60 },
    { name: 'Economia', weight: 10, progress: 12, hoursNeeded: 60 }
  ]
};

const weeklySchedule: DailySchedule[] = [
  {
    date: '2024-01-22',
    blocks: [
      { 
        id: '1', 
        startTime: '06:00', 
        endTime: '08:00', 
        subject: 'Direito Constitucional', 
        topic: 'Direitos Fundamentais', 
        type: 'video', 
        duration: 120, 
        priority: 'high',
        completed: true
      },
      { 
        id: '2', 
        startTime: '08:30', 
        endTime: '10:00', 
        subject: 'Direito Penal', 
        topic: 'Crimes contra a Administração', 
        type: 'reading', 
        duration: 90, 
        priority: 'high',
        completed: true
      },
      { 
        id: '3', 
        startTime: '14:00', 
        endTime: '15:30', 
        subject: 'Informática', 
        topic: 'Segurança da Informação', 
        type: 'practice', 
        duration: 90, 
        priority: 'medium',
        progress: 60
      },
      { 
        id: '4', 
        startTime: '16:00', 
        endTime: '17:00', 
        subject: 'Português', 
        topic: 'Concordância Verbal', 
        type: 'review', 
        duration: 60, 
        priority: 'medium'
      },
      { 
        id: '5', 
        startTime: '19:00', 
        endTime: '20:30', 
        subject: 'Raciocínio Lógico', 
        topic: 'Proposições e Conectivos', 
        type: 'video', 
        duration: 90, 
        priority: 'high'
      }
    ],
    totalHours: 7.5,
    completedHours: 3.5
  },
  {
    date: '2024-01-23',
    blocks: [
      { 
        id: '6', 
        startTime: '06:00', 
        endTime: '07:30', 
        subject: 'Direito Administrativo', 
        topic: 'Princípios da Administração', 
        type: 'video', 
        duration: 90, 
        priority: 'high'
      },
      { 
        id: '7', 
        startTime: '08:00', 
        endTime: '10:00', 
        subject: 'Simulado', 
        topic: 'Simulado Semanal - Múltiplas Matérias', 
        type: 'exam', 
        duration: 120, 
        priority: 'high'
      },
      { 
        id: '8', 
        startTime: '14:00', 
        endTime: '15:30', 
        subject: 'Contabilidade', 
        topic: 'Balanço Patrimonial', 
        type: 'reading', 
        duration: 90, 
        priority: 'medium'
      },
      { 
        id: '9', 
        startTime: '16:00', 
        endTime: '17:30', 
        subject: 'Economia', 
        topic: 'Macroeconomia Básica', 
        type: 'video', 
        duration: 90, 
        priority: 'low'
      }
    ],
    totalHours: 6,
    completedHours: 0
  }
];

const studyStats = {
  totalHoursPlanned: 450,
  totalHoursCompleted: 126,
  averageDaily: 3.5,
  streak: 12,
  efficiency: 78
};

export default function SchedulePage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [showSettings, setShowSettings] = useState(false);

  const getBlockIcon = (type: StudyBlock['type']) => {
    switch (type) {
      case 'video': return Video;
      case 'reading': return FileText;
      case 'practice': return Brain;
      case 'review': return BookOpen;
      case 'exam': return Trophy;
    }
  };

  const getBlockColor = (type: StudyBlock['type']) => {
    switch (type) {
      case 'video': return 'bg-blue-100 border-blue-300 text-blue-700';
      case 'reading': return 'bg-green-100 border-green-300 text-green-700';
      case 'practice': return 'bg-purple-100 border-purple-300 text-purple-700';
      case 'review': return 'bg-orange-100 border-orange-300 text-orange-700';
      case 'exam': return 'bg-red-100 border-red-300 text-red-700';
    }
  };

  const StudyBlockCard = ({ block }: { block: StudyBlock }) => {
    const Icon = getBlockIcon(block.type);
    
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className={cn(
          "relative p-4 rounded-lg border-2 transition-all",
          getBlockColor(block.type),
          block.completed && "opacity-75"
        )}
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <Icon className="w-5 h-5" />
            <span className="font-medium">{block.startTime} - {block.endTime}</span>
          </div>
          {block.completed && (
            <CheckCircle className="w-5 h-5 text-green-600" />
          )}
        </div>
        
        <h4 className="font-semibold mb-1">{block.subject}</h4>
        <p className="text-sm opacity-80">{block.topic}</p>
        
        {block.progress && !block.completed && (
          <div className="mt-3">
            <div className="flex justify-between text-xs mb-1">
              <span>Progresso</span>
              <span>{block.progress}%</span>
            </div>
            <div className="w-full bg-white/50 rounded-full h-2">
              <div
                className="bg-current h-full rounded-full transition-all"
                style={{ width: `${block.progress}%` }}
              />
            </div>
          </div>
        )}
        
        <div className="mt-3 flex items-center justify-between">
          <Badge 
            variant="secondary" 
            className={cn(
              "text-xs",
              block.priority === 'high' && "bg-red-50 text-red-700",
              block.priority === 'medium' && "bg-yellow-50 text-yellow-700",
              block.priority === 'low' && "bg-green-50 text-green-700"
            )}
          >
            {block.priority === 'high' ? 'Alta' : block.priority === 'medium' ? 'Média' : 'Baixa'} prioridade
          </Badge>
          <span className="text-xs">{block.duration} min</span>
        </div>
      </motion.div>
    );
  };

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
            <h1 className="text-3xl font-bold text-primary-900 mb-2">Cronograma Personalizado</h1>
            <p className="text-primary-600">
              Plano de estudos otimizado por IA para {examInfo.name}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="w-4 h-4" />
              Exportar
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Share2 className="w-4 h-4" />
              Compartilhar
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="w-4 h-4" />
              Configurar
            </Button>
          </div>
        </div>

        {/* Informações do Concurso */}
        <Card className="mb-6 bg-gradient-to-r from-primary-50 to-primary-100 border-primary-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Target className="w-6 h-6 text-primary-600" />
                  <h3 className="text-xl font-bold text-primary-900">{examInfo.name}</h3>
                </div>
                <p className="text-primary-700">
                  Data da prova: {new Date(examInfo.date).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-primary-900">{examInfo.daysLeft}</div>
                <div className="text-sm text-primary-600">dias restantes</div>
              </div>
            </div>
            
            <div className="mt-4 grid grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-900">
                  {Math.round((examInfo.completedTopics / examInfo.totalTopics) * 100)}%
                </div>
                <div className="text-sm text-primary-600">Progresso geral</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-900">
                  {examInfo.completedTopics}/{examInfo.totalTopics}
                </div>
                <div className="text-sm text-primary-600">Tópicos estudados</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-900">
                  {studyStats.averageDaily}h
                </div>
                <div className="text-sm text-primary-600">Média diária</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {studyStats.streak} 🔥
                </div>
                <div className="text-sm text-primary-600">Dias seguidos</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navegação de Data */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <h3 className="text-lg font-semibold text-primary-900">
              Semana de {new Date(weeklySchedule[0].date).toLocaleDateString('pt-BR')}
            </h3>
            <Button variant="outline" size="sm">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'week' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('week')}
            >
              Semana
            </Button>
            <Button
              variant={viewMode === 'month' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('month')}
            >
              Mês
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Cronograma */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna Principal - Cronograma */}
        <div className="lg:col-span-2 space-y-6">
          {weeklySchedule.map((day) => (
            <motion.div
              key={day.date}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-primary-900">
                        {new Date(day.date).toLocaleDateString('pt-BR', { 
                          weekday: 'long', 
                          day: 'numeric', 
                          month: 'long' 
                        })}
                      </h3>
                      <p className="text-sm text-primary-600">
                        {day.completedHours}/{day.totalHours}h concluídas
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-sm text-primary-600">
                        {Math.round((day.completedHours / day.totalHours) * 100)}%
                      </div>
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary-500 h-full rounded-full transition-all"
                          style={{ width: `${(day.completedHours / day.totalHours) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {day.blocks.map((block, index) => (
                    <StudyBlockCard key={block.id} block={block} />
                  ))}
                  
                  <Button variant="outline" className="w-full gap-2">
                    <Plus className="w-4 h-4" />
                    Adicionar bloco de estudo
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Coluna Lateral - Estatísticas e Progresso */}
        <div className="space-y-6">
          {/* Estatísticas de Estudo */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-bold text-primary-900">Estatísticas</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-primary-600">Horas planejadas</span>
                  <span className="font-medium">{studyStats.totalHoursPlanned}h</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-primary-600">Horas concluídas</span>
                  <span className="font-medium text-green-600">{studyStats.totalHoursCompleted}h</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-primary-600">Eficiência</span>
                  <span className="font-medium">{studyStats.efficiency}%</span>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Distribuição por tipo</span>
                </div>
                <div className="space-y-2">
                  {[
                    { type: 'Videoaulas', percent: 35, color: 'bg-blue-500' },
                    { type: 'Leitura', percent: 25, color: 'bg-green-500' },
                    { type: 'Exercícios', percent: 30, color: 'bg-purple-500' },
                    { type: 'Revisão', percent: 10, color: 'bg-orange-500' }
                  ].map((item) => (
                    <div key={item.type} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>{item.type}</span>
                        <span>{item.percent}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={cn("h-full rounded-full", item.color)}
                          style={{ width: `${item.percent}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Progresso por Matéria */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-bold text-primary-900">Progresso por Matéria</h3>
            </CardHeader>
            <CardContent className="space-y-3">
              {examInfo.subjects.slice(0, 5).map((subject) => (
                <div key={subject.name} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-primary-900">{subject.name}</p>
                      <p className="text-xs text-primary-600">
                        {subject.hoursNeeded}h necessárias • Peso: {subject.weight}%
                      </p>
                    </div>
                    <Badge 
                      variant="secondary"
                      className={cn(
                        subject.progress >= 50 ? "bg-green-100 text-green-700" :
                        subject.progress >= 30 ? "bg-yellow-100 text-yellow-700" :
                        "bg-red-100 text-red-700"
                      )}
                    >
                      {subject.progress}%
                    </Badge>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all",
                        subject.progress >= 50 ? "bg-green-500" :
                        subject.progress >= 30 ? "bg-yellow-500" :
                        "bg-red-500"
                      )}
                      style={{ width: `${subject.progress}%` }}
                    />
                  </div>
                </div>
              ))}
              
              <Button variant="outline" size="sm" className="w-full mt-4">
                Ver todas as matérias
              </Button>
            </CardContent>
          </Card>

          {/* Sugestões da IA */}
          <Card className="border-primary-200 bg-primary-50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary-600" />
                <h3 className="text-lg font-bold text-primary-900">Sugestões da IA</h3>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 bg-white rounded-lg border border-primary-200">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-orange-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-primary-900">
                      Aumentar foco em Raciocínio Lógico
                    </p>
                    <p className="text-xs text-primary-600">
                      Seu progresso está abaixo da média. Recomendo +30min/dia.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-3 bg-white rounded-lg border border-primary-200">
                <div className="flex items-start gap-2">
                  <TrendingUp className="w-4 h-4 text-green-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-primary-900">
                      Excelente progresso em Português!
                    </p>
                    <p className="text-xs text-primary-600">
                      Continue assim e foque mais em questões avançadas.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-3 bg-white rounded-lg border border-primary-200">
                <div className="flex items-start gap-2">
                  <Star className="w-4 h-4 text-purple-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-primary-900">
                      Hora de um simulado!
                    </p>
                    <p className="text-xs text-primary-600">
                      Você estudou bastante esta semana. Teste seus conhecimentos.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Call to Action */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-12 bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-8 text-white text-center"
      >
        <Calendar className="w-12 h-12 mx-auto mb-4 text-accent-400" />
        <h2 className="text-2xl font-bold mb-2">
          Mantenha o foco e a disciplina!
        </h2>
        <p className="text-primary-100 mb-6 max-w-2xl mx-auto">
          Seu cronograma é atualizado diariamente pela IA para maximizar suas chances de aprovação
        </p>
        <div className="flex gap-3 justify-center">
          <Button variant="secondary" size="lg">
            <Trophy className="w-5 h-5 mr-2" />
            Ver Metas da Semana
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            className="border-white text-white hover:bg-white hover:text-primary-700"
          >
            <BarChart3 className="w-5 h-5 mr-2" />
            Relatório Detalhado
          </Button>
        </div>
      </motion.div>
    </div>
  );
}