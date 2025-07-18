import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  BookOpen, 
  Brain, 
  Trophy, 
  Target,
  TrendingUp,
  Calendar,
  Clock,
  Zap
} from 'lucide-react';
import { mockStatistics, mockCourses } from '@/lib/mockData';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1
  }
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const stats = mockStatistics;

  const statsCards = [
    {
      title: 'Questões Resolvidas',
      value: stats.questionsAnswered.toLocaleString(),
      icon: BookOpen,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      progress: Math.round((stats.correctAnswers / stats.questionsAnswered) * 100),
    },
    {
      title: 'Flashcards Revisados',
      value: stats.flashcardsReviewed.toLocaleString(),
      icon: Brain,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      progress: 85,
    },
    {
      title: 'Taxa de Acerto',
      value: `${Math.round((stats.correctAnswers / stats.questionsAnswered) * 100)}%`,
      icon: Target,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      progress: Math.round((stats.correctAnswers / stats.questionsAnswered) * 100),
    },
    {
      title: 'Sequência de Estudos',
      value: `${stats.studyStreak} dias`,
      icon: Zap,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      progress: (stats.studyStreak / 30) * 100,
    },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-bold text-primary-900">Dashboard</h1>
        <p className="text-primary-600 mt-1">
          Acompanhe seu progresso e continue evoluindo!
        </p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div 
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <span className={`text-sm font-medium ${stat.color}`}>
                    +12%
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-primary-900">
                  {stat.value}
                </h3>
                <p className="text-sm text-primary-600 mt-1">{stat.title}</p>
                
                {/* Progress Bar */}
                <div className="mt-4 bg-gray-200 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${stat.progress}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className={`h-2 rounded-full ${stat.bgColor}`}
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle>Início Rápido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  variant="outline"
                  className="w-full h-auto flex-col py-6 space-y-2"
                  onClick={() => navigate('/questions')}
                >
                  <BookOpen className="w-8 h-8 text-primary-600" />
                  <span className="font-semibold">Resolver Questões</span>
                  <span className="text-sm text-primary-500">
                    Continue praticando
                  </span>
                </Button>
              </motion.div>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  variant="outline"
                  className="w-full h-auto flex-col py-6 space-y-2"
                  onClick={() => navigate('/flashcards')}
                >
                  <Brain className="w-8 h-8 text-primary-600" />
                  <span className="font-semibold">Revisar Flashcards</span>
                  <span className="text-sm text-primary-500">
                    15 cards para hoje
                  </span>
                </Button>
              </motion.div>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  variant="outline"
                  className="w-full h-auto flex-col py-6 space-y-2"
                  onClick={() => navigate('/simulations')}
                >
                  <Trophy className="w-8 h-8 text-primary-600" />
                  <span className="font-semibold">Fazer Simulado</span>
                  <span className="text-sm text-primary-500">
                    Teste seus conhecimentos
                  </span>
                </Button>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Courses Progress */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Cursos em Andamento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockCourses.map((course) => (
              <div
                key={course.id}
                className="p-4 border border-primary-200 rounded-lg hover:border-primary-300 transition-colors cursor-pointer"
                onClick={() => navigate(`/courses/${course.id}`)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-primary-900">{course.name}</h4>
                  <span className="text-sm text-primary-600">{course.progress}%</span>
                </div>
                <div className="bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-primary-500 to-accent-500 h-2 rounded-full"
                    style={{ width: `${course.progress}%` }}
                  />
                </div>
                <div className="flex items-center gap-4 mt-2 text-sm text-primary-600">
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-4 h-4" />
                    {course.totalQuestions} questões
                  </span>
                  <span className="flex items-center gap-1">
                    <Brain className="w-4 h-4" />
                    {course.totalFlashcards} cards
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { icon: BookOpen, text: 'Resolveu 25 questões de Direito Constitucional', time: '2 horas atrás' },
                { icon: Brain, text: 'Revisou 30 flashcards de Português', time: '4 horas atrás' },
                { icon: Trophy, text: 'Completou simulado com 78% de acerto', time: 'Ontem' },
                { icon: TrendingUp, text: 'Atingiu nova sequência de 15 dias', time: 'Ontem' },
              ].map((activity, index) => {
                const Icon = activity.icon;
                return (
                  <div key={index} className="flex items-start gap-3">
                    <div className="p-2 bg-primary-100 rounded-lg">
                      <Icon className="w-4 h-4 text-primary-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-primary-900">{activity.text}</p>
                      <p className="text-xs text-primary-500 mt-0.5">{activity.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}