import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { courseService } from '@/services/courseService';
import { useAuthStore } from '@/store/authStore';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Star,
  Clock,
  Users,
  BookOpen,
  FileText,
  Video,
  Award,
  Calendar,
  Download,
  Shield,
  CheckCircle,
  Play,
  Lock,
  ChevronDown,
  ChevronUp,
  Globe,
  Zap,
  Target,
  TrendingUp,
  MessageSquare,
  ThumbsUp,
  AlertCircle,
  ShoppingCart,
  CreditCard,
  Smartphone,
  Monitor,
  RefreshCw,
  HelpCircle,
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { StudyProLogo } from '@/components/ui/StudyProLogo';
import { cn } from '@/utils/cn';
import toast from 'react-hot-toast';

// Mock de dados do curso
const mockCourseDetails = {
  id: '1',
  title: 'OPERAÇÃO PF 2024 - AGENTE TÁTICO',
  subtitle: 'PREPARAÇÃO MILITAR COMPLETA PARA CONCURSO DA POLÍCIA FEDERAL',
  description: `
    Este é o curso mais completo para quem deseja se preparar para o concurso de Agente da Polícia Federal. 
    Com uma abordagem prática e objetiva, nosso curso cobre todo o conteúdo programático do edital, 
    com professores especialistas em cada disciplina.
    
    Nosso diferencial está na metodologia focada em questões, com mais de 8.500 exercícios comentados 
    e simulados no padrão CESPE/CEBRASPE. Além disso, oferecemos suporte direto com os professores 
    e acompanhamento personalizado do seu progresso.
  `,
  instructor: {
    name: 'COMANDANTE CARLOS MENDEZ',
    avatar: 'https://ui-avatars.com/api/?name=Carlos+Mendez&background=14242f&color=fff',
    bio: 'DELEGADO APOSENTADO DA PF COM 25 ANOS DE OPERAÇÕES. AUTOR DE 5 LIVROS SOBRE SEGURANÇA PÚBLICA.',
    students: 15420,
    rating: 4.9,
    courses: 12
  },
  category: 'SEGURANÇA',
  subcategory: 'FEDERAL',
  level: 'INTERMEDIÁRIO',
  language: 'PORTUGUÊS TÁTICO',
  lastUpdated: '2024-01-15',
  duration: '180 horas',
  students: 2341,
  rating: 4.9,
  reviews: 487,
  price: 197,
  originalPrice: 397,
  installments: {
    number: 12,
    value: 19.70
  },
  questions: 8500,
  image: 'https://images.unsplash.com/photo-1589994965851-a8f479c573a9?w=800&h=450&fit=crop',
  videoPreview: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  
  // Conteúdo do curso
  modules: [
    {
      id: '1',
      title: 'COMUNICAÇÃO TÁTICA - PORTUGUÊS',
      duration: '25h',
      lessons: 45,
      completed: false,
      topics: [
        'Compreensão e interpretação de textos',
        'Ortografia oficial',
        'Acentuação gráfica',
        'Emprego das classes de palavras',
        'Concordância nominal e verbal',
        'Regência nominal e verbal',
        'Sintaxe da oração e do período'
      ]
    },
    {
      id: '2',
      title: 'DIREITO CONSTITUCIONAL OPERACIONAL',
      duration: '30h',
      lessons: 52,
      completed: false,
      topics: [
        'Constituição: conceito e classificação',
        'Princípios fundamentais',
        'Direitos e garantias fundamentais',
        'Organização do Estado',
        'Administração Pública',
        'Poder Executivo, Legislativo e Judiciário'
      ]
    },
    {
      id: '3',
      title: 'DIREITO ADMINISTRATIVO TÁTICO',
      duration: '28h',
      lessons: 48,
      completed: false,
      topics: [
        'Regime jurídico administrativo',
        'Atos administrativos',
        'Poderes administrativos',
        'Licitações e contratos',
        'Servidores públicos',
        'Improbidade administrativa'
      ]
    },
    {
      id: '4',
      title: 'DIREITO PENAL APLICADO',
      duration: '35h',
      lessons: 60,
      completed: false,
      topics: [
        'Aplicação da lei penal',
        'Crime: conceito e classificação',
        'Teoria geral do crime',
        'Crimes contra a pessoa',
        'Crimes contra o patrimônio',
        'Crimes contra a Administração Pública'
      ]
    },
    {
      id: '5',
      title: 'INTELIGÊNCIA DIGITAL',
      duration: '20h',
      lessons: 35,
      completed: false,
      topics: [
        'Conceitos de Internet e intranet',
        'Segurança da informação',
        'Sistema operacional Windows',
        'Editor de textos Word',
        'Planilhas Excel',
        'Conceitos de redes'
      ]
    }
  ],
  
  // O que está incluído
  features: [
    {
      icon: Video,
      title: 'Videoaulas em HD',
      description: '+ de 180 horas de conteúdo gravado'
    },
    {
      icon: FileText,
      title: 'Material em PDF',
      description: 'Apostilas atualizadas e resumos'
    },
    {
      icon: MessageSquare,
      title: 'Fórum de dúvidas',
      description: 'Respostas diretas dos professores'
    },
    {
      icon: Target,
      title: 'Simulados semanais',
      description: 'No padrão CESPE com correção'
    },
    {
      icon: Smartphone,
      title: 'Acesso mobile',
      description: 'Estude pelo app iOS/Android'
    },
    {
      icon: RefreshCw,
      title: 'Atualizações gratuitas',
      description: 'Conteúdo sempre atualizado'
    }
  ],
  
  // Requisitos
  requirements: [
    'FORMAÇÃO MÉDIA COMPLETA',
    'CONHECIMENTOS BÁSICOS DE INFORMÁTICA',
    'DEDICAÇÃO MÍNIMA DE 2 HORAS DIÁRIAS',
    'ACESSO À INTERNET PARA BRIEFINGS'
  ],
  
  // Para quem é este curso
  targetAudience: [
    'CANDIDATOS À OPERAÇÃO PF - AGENTE TÁTICO',
    'PROFISSIONAIS EM TRANSIÇÃO PARA SEGURANÇA',
    'OPERADORES EM BUSCA DE ESTABILIDADE',
    'INTERESSADOS EM SEGURANÇA PÚBLICA'
  ],
  
  // Avaliações
  reviewsSummary: {
    total: 487,
    average: 4.9,
    distribution: {
      5: 412,
      4: 58,
      3: 12,
      2: 3,
      1: 2
    }
  },
  
  // Algumas avaliações
  topReviews: [
    {
      id: '1',
      user: 'Maria Silva',
      avatar: 'https://ui-avatars.com/api/?name=Maria+Silva&background=14242f&color=fff',
      rating: 5,
      date: '2024-01-10',
      comment: 'Excelente curso! Os professores são muito didáticos e o material é completo. Consegui minha aprovação graças a este curso.',
      helpful: 45
    },
    {
      id: '2',
      user: 'João Santos',
      avatar: 'https://ui-avatars.com/api/?name=João+Santos&background=14242f&color=fff',
      rating: 5,
      date: '2024-01-05',
      comment: 'Material sempre atualizado e simulados idênticos à prova real. Vale cada centavo investido!',
      helpful: 32
    },
    {
      id: '3',
      user: 'Ana Costa',
      avatar: 'https://ui-avatars.com/api/?name=Ana+Costa&background=14242f&color=fff',
      rating: 4,
      date: '2023-12-28',
      comment: 'Muito bom! Só senti falta de mais questões de informática, mas no geral é excelente.',
      helpful: 18
    }
  ],
  
  // FAQ
  faq: [
    {
      question: 'Por quanto tempo terei acesso ao curso?',
      answer: 'Você terá acesso ao curso por 12 meses a partir da data de compra, com direito a todas as atualizações neste período.'
    },
    {
      question: 'O curso inclui material em PDF?',
      answer: 'Sim! Todos os módulos possuem apostilas em PDF que podem ser baixadas e impressas.'
    },
    {
      question: 'Posso assistir as aulas pelo celular?',
      answer: 'Sim! Temos aplicativo para iOS e Android, além do acesso pelo navegador mobile.'
    },
    {
      question: 'Como funciona a garantia?',
      answer: 'Oferecemos 7 dias de garantia incondicional. Se não gostar, devolvemos 100% do valor.'
    }
  ]
};

export default function CourseDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [expandedModules, setExpandedModules] = useState<string[]>([]);
  const [showAllModules, setShowAllModules] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'curriculum' | 'instructor' | 'reviews'>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [courseData, setCourseData] = useState<any>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrollmentLoading, setEnrollmentLoading] = useState(false);
  const user = useAuthStore(state => state.user);

  // Carregar dados do curso e verificar matrícula
  useEffect(() => {
    if (id) {
      loadCourseData();
      checkEnrollment();
    }
  }, [id]);

  const loadCourseData = async () => {
    try {
      setIsLoading(true);
      const response = await courseService.getCourse(id!);
      if (response.success && response.data) {
        setCourseData(response.data);
      } else {
        // Usar dados mock se API falhar
        setCourseData(mockCourseDetails);
      }
    } catch (error) {
      console.error('Erro ao carregar curso:', error);
      setCourseData(mockCourseDetails);
    } finally {
      setIsLoading(false);
    }
  };

  const checkEnrollment = async () => {
    try {
      const response = await courseService.checkEnrollmentStatus(id!);
      
      if (response.success && response.data) {
        setIsEnrolled(response.data.enrolled || false);
      } else {
        setIsEnrolled(false);
      }
    } catch (error) {
      console.error('Erro ao verificar matrícula:', error);
      setIsEnrolled(false);
    }
  };

  const course = courseData || mockCourseDetails;
  
  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-accent-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 font-police-body uppercase tracking-wider">CARREGANDO OPERAÇÃO...</p>
        </div>
      </div>
    );
  } // Em produção, buscar do backend usando o id

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev =>
      prev.includes(moduleId)
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const handleEnroll = async () => {
    if (isEnrolled) {
      // Se já matriculado, continuar estudando
      navigate(`/course/${id}/learn`);
      return;
    }
    
    try {
      setEnrollmentLoading(true);
      const response = await courseService.enrollInCourse(id!);
      
      if (response.success) {
        setIsEnrolled(true);
        toast.success('MATRÍCULA OPERACIONAL CONFIRMADA!', {
          icon: '🎯',
          duration: 5000
        });
        // Redirecionar para a página de aprendizado
        setTimeout(() => {
          navigate(`/my-courses`);
        }, 2000);
      } else {
        toast.error(response.message || 'Erro ao realizar matrícula');
      }
    } catch (error) {
      console.error('Erro ao matricular:', error);
      toast.error('Erro ao processar matrícula');
    } finally {
      setEnrollmentLoading(false);
    }
  };

  const displayedModules = showAllModules 
    ? (course.modules || []) 
    : (course.modules || []).slice(0, 3);

  return (
    <div className="min-h-screen">
      {/* Hero Section - Full width without padding */}
      <div className="bg-gradient-to-r from-gray-900 via-[#14242f] to-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-6 py-8 md:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Informações principais */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <Badge variant="secondary" className="bg-white/20 text-white border-0">
                  {course.category || 'GERAL'}
                </Badge>
                <Badge variant="secondary" className="bg-white/20 text-white border-0">
                  {course.level || 'INTERMEDIÁRIO'}
                </Badge>
              </div>
              
              <h1 className="text-4xl font-bold mb-4 font-police-title uppercase tracking-wider">{course.title || 'OPERAÇÃO SEM NOME'}</h1>
              <p className="text-xl text-primary-100 mb-6 font-police-subtitle uppercase tracking-wider">{course.subtitle || ''}</p>
              
              <div className="flex items-center gap-6 mb-6">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <span className="font-bold">{course.rating}</span>
                  <span className="text-primary-200">({course.reviews || 0} avaliações)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  <span>{(course.students || 0).toLocaleString()} alunos</span>
                </div>
              </div>
              
              <div className="flex items-center gap-4 mb-8">
                <img
                  src={course.instructor?.avatar || 'https://ui-avatars.com/api/?name=Instrutor&background=14242f&color=fff'}
                  alt={course.instructor?.name || 'Instrutor'}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <p className="font-medium font-police-body uppercase tracking-wider">COMANDANTE</p>
                  <p className="text-primary-100 font-police-subtitle">{course.instructor?.name || 'COMANDANTE'}</p>
                </div>
              </div>

              {/* Informações adicionais do curso */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6 bg-white/10 backdrop-blur-sm rounded-xl">
                <div className="text-center">
                  <Clock className="w-8 h-8 mx-auto mb-2 text-accent-400" />
                  <div className="text-2xl font-bold">{course.duration || '0h'}</div>
                  <p className="text-sm text-primary-200 font-police-body uppercase tracking-wider">HORAS TÁTICAS</p>
                </div>
                <div className="text-center">
                  <Video className="w-8 h-8 mx-auto mb-2 text-accent-400" />
                  <div className="text-2xl font-bold">
                    {(course.modules || []).reduce((acc, mod) => acc + (mod.lessons || 0), 0)}
                  </div>
                  <p className="text-sm text-primary-200 font-police-body uppercase tracking-wider">BRIEFINGS</p>
                </div>
                <div className="text-center">
                  <FileText className="w-8 h-8 mx-auto mb-2 text-accent-400" />
                  <div className="text-2xl font-bold">{(course.questions || 0).toLocaleString()}</div>
                  <p className="text-sm text-primary-200 font-police-body uppercase tracking-wider">ALVOS</p>
                </div>
                <div className="text-center">
                  <Calendar className="w-8 h-8 mx-auto mb-2 text-accent-400" />
                  <div className="text-2xl font-bold">12</div>
                  <p className="text-sm text-primary-200 font-police-body uppercase tracking-wider">MESES OPERACIONAIS</p>
                </div>
              </div>

              {/* Diferenciais em lista */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  'Material atualizado conforme edital 2024',
                  'Simulados semanais no padrão CESPE',
                  'PDFs para download e impressão',
                  'Certificado de conclusão'
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-accent-400 flex-shrink-0" />
                    <span className="text-primary-100">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Card de compra fixo no desktop */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardContent className="p-6">
                  {/* Preview do vídeo */}
                  <div className="relative mb-6 rounded-lg overflow-hidden">
                    <img
                      src={course.image || course.thumbnail || 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=800&h=400&fit=crop'}
                      alt={course.title}
                      className="w-full h-48 object-cover"
                    />
                    <button className="absolute inset-0 flex items-center justify-center bg-black/50 hover:bg-black/60 transition-colors">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                        <Play className="w-8 h-8 text-primary-900 ml-1" />
                      </div>
                    </button>
                  </div>

                  {/* Preço */}
                  <div className="mb-6">
                    {course.originalPrice && (
                      <p className="text-primary-400 line-through text-lg">
                        R$ {course.originalPrice}
                      </p>
                    )}
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold text-primary-900">
                        R$ {course.price || 0}
                      </span>
                      <span className="text-primary-600">à vista</span>
                    </div>
                    <p className="text-sm text-primary-600 mt-1">
                      ou {course.installments?.number || 12}x de R$ {(course.installments?.value || ((course.price || 0) / 12)).toFixed(2)}
                    </p>
                  </div>

                  {/* Botões de ação */}
                  <div className="space-y-3">
                    <Button
                      size="lg"
                      className="w-full bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black dark:text-black font-police-body font-semibold uppercase tracking-wider"
                      onClick={handleEnroll}
                      disabled={enrollmentLoading}
                    >
                      {enrollmentLoading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin mr-2" />
                          PROCESSANDO...
                        </>
                      ) : isEnrolled ? (
                        <>
                          <Play className="w-5 h-5 mr-2" />
                          CONTINUAR OPERAÇÃO
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-5 h-5 mr-2" />
                          INICIAR MISSÃO
                        </>
                      )}
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full"
                    >
ADICIONAR AO ARSENAL
                    </Button>
                  </div>

                  {/* Garantia */}
                  <div className="mt-6 pt-6 border-t">
                    <div className="flex items-center gap-2 text-sm text-primary-600">
                      <Shield className="w-4 h-4" />
                      <span>7 dias de garantia</span>
                    </div>
                  </div>

                  {/* O que está incluído */}
                  <div className="mt-6 space-y-3">
                    <h4 className="font-medium text-primary-900 font-police-body uppercase tracking-wider">ARSENAL INCLUÍDO:</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-primary-400" />
                        <span>{course.duration || '0h'} de conteúdo</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Video className="w-4 h-4 text-primary-400" />
                        <span>ACESSO PERMANENTE</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Smartphone className="w-4 h-4 text-primary-400" />
                        <span>ACESSO MÓVEL E TV</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Award className="w-4 h-4 text-primary-400" />
                        <span>CONDECORAÇÃO FINAL</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
            {/* Tabs de navegação */}
            <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
              <nav className="flex gap-8">
                {[
                  { id: 'overview', label: 'VISÃO TÁTICA' },
                  { id: 'curriculum', label: 'ARSENAL' },
                  { id: 'instructor', label: 'COMANDANTE' },
                  { id: 'reviews', label: 'RELATÓRIOS' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={cn(
                      'pb-4 px-1 font-police-subtitle uppercase tracking-wider font-medium transition-colors relative',
                      activeTab === tab.id
                        ? 'text-accent-500 dark:text-accent-400'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    )}
                  >
                    {tab.label}
                    {activeTab === tab.id && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-500"
                      />
                    )}
                  </button>
                ))}
              </nav>
            </div>

            {/* Conteúdo das tabs */}
            {activeTab === 'overview' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >

                {/* O que você aprenderá */}
                <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <CardHeader>
                    <h2 className="text-2xl font-bold font-police-title uppercase tracking-wider text-gray-900 dark:text-white">HABILIDADES TÁTICAS</h2>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        'DOMINAR TODAS AS DISCIPLINAS TÁTICAS',
                        'TÉCNICAS DE RESOLUÇÃO CESPE AVANÇADAS',
                        'GESTÃO MILITAR DO TEMPO DE ESTUDO',
                        'ESTRATÉGIAS PARA O DIA DA OPERAÇÃO',
                        'INTERPRETAÇÃO DE TEXTOS COMPLEXOS',
                        'RACIOCÍNIO LÓGICO OPERACIONAL'
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-accent-500 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700 dark:text-gray-300 font-police-body">{item}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Para quem é este curso */}
                <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <CardHeader>
                    <h2 className="text-2xl font-bold font-police-title uppercase tracking-wider text-gray-900 dark:text-white">PERFIL OPERACIONAL</h2>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {(course.targetAudience || []).map((item, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <Target className="w-5 h-5 text-accent-500 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700 dark:text-gray-300 font-police-body">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Requisitos */}
                <Card>
                  <CardHeader>
                    <h2 className="text-2xl font-bold font-police-title uppercase tracking-wider">PRÉ-REQUISITOS</h2>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {(course.requirements || []).map((req, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                          <span className="text-primary-700">{req}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeTab === 'curriculum' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-bold font-police-title uppercase tracking-wider">ARSENAL DE TREINAMENTO</h2>
                      <Badge variant="secondary">
                        {course.modules.length} módulos
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {displayedModules.map((module) => (
                        <div
                          key={module.id}
                          className="border rounded-lg overflow-hidden"
                        >
                          <button
                            onClick={() => toggleModule(module.id)}
                            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-center gap-4">
                              <BookOpen className="w-5 h-5 text-primary-600" />
                              <div className="text-left">
                                <h3 className="font-medium text-primary-900">
                                  {module.title}
                                </h3>
                                <p className="text-sm text-primary-600">
                                  {module.lessons} aulas • {module.duration}
                                </p>
                              </div>
                            </div>
                            {expandedModules.includes(module.id) ? (
                              <ChevronUp className="w-5 h-5 text-primary-400" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-primary-400" />
                            )}
                          </button>
                          
                          {expandedModules.includes(module.id) && (
                            <div className="px-6 pb-4 border-t bg-gray-50">
                              <ul className="space-y-2 mt-4">
                                {(module.topics || []).map((topic, idx) => (
                                  <li key={idx} className="flex items-center gap-3 text-sm text-primary-700">
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                    {topic}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    {!showAllModules && course.modules.length > 3 && (
                      <div className="mt-6 text-center">
                        <Button
                          variant="outline"
                          onClick={() => setShowAllModules(true)}
                        >
                          Mostrar todos os módulos ({course.modules.length})
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeTab === 'instructor' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card>
                  <CardHeader>
                    <h2 className="text-2xl font-bold font-police-title uppercase tracking-wider">PERFIL DO COMANDANTE</h2>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-start gap-6">
                      <img
                        src={course.instructor.avatar}
                        alt={course.instructor.name}
                        className="w-24 h-24 rounded-full"
                      />
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-primary-900 mb-2">
                          {course.instructor.name}
                        </h3>
                        <p className="text-primary-700 mb-4">
                          {course.instructor.bio}
                        </p>
                        <div className="flex items-center gap-6 text-sm">
                          <div className="flex items-center gap-2">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <span className="font-medium">{course.instructor.rating}</span>
                            <span className="text-primary-500 font-police-body uppercase tracking-wider">AVALIAÇÃO</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-primary-400" />
                            <span className="font-medium">{(course.instructor?.students || 0).toLocaleString()}</span>
                            <span className="text-primary-500 font-police-body uppercase tracking-wider">RECRUTAS</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-primary-400" />
                            <span className="font-medium">{course.instructor.courses}</span>
                            <span className="text-primary-500 font-police-body uppercase tracking-wider">OPERAÇÕES</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeTab === 'reviews' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Resumo das avaliações */}
                <Card>
                  <CardHeader>
                    <h2 className="text-2xl font-bold font-police-title uppercase tracking-wider">RELATÓRIOS OPERACIONAIS</h2>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="text-center">
                        <div className="text-5xl font-bold text-primary-900 mb-2">
                          {course.reviewsSummary.average}
                        </div>
                        <div className="flex items-center justify-center gap-1 mb-2">
                          {[1, 2, 3, 4, 5].map(star => (
                            <Star
                              key={star}
                              className={cn(
                                "w-5 h-5",
                                star <= Math.round(course.reviewsSummary.average)
                                  ? "text-yellow-500 fill-current"
                                  : "text-gray-300"
                              )}
                            />
                          ))}
                        </div>
                        <p className="text-primary-600">
                          {course.reviewsSummary.total} avaliações
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        {[5, 4, 3, 2, 1].map(rating => {
                          const count = course.reviewsSummary.distribution[rating as keyof typeof course.reviewsSummary.distribution];
                          const percentage = (count / course.reviewsSummary.total) * 100;
                          
                          return (
                            <div key={rating} className="flex items-center gap-3">
                              <span className="text-sm w-3">{rating}</span>
                              <Star className="w-4 h-4 text-yellow-500 fill-current" />
                              <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-yellow-500 h-full rounded-full"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              <span className="text-sm text-primary-600 w-10 text-right">
                                {count}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Lista de avaliações */}
                {(course.topReviews || []).map(review => (
                  <Card key={review.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <img
                          src={review.avatar}
                          alt={review.user}
                          className="w-12 h-12 rounded-full"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h4 className="font-medium text-primary-900">
                                {review.user}
                              </h4>
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1">
                                  {[1, 2, 3, 4, 5].map(star => (
                                    <Star
                                      key={star}
                                      className={cn(
                                        "w-4 h-4",
                                        star <= review.rating
                                          ? "text-yellow-500 fill-current"
                                          : "text-gray-300"
                                      )}
                                    />
                                  ))}
                                </div>
                                <span className="text-sm text-primary-500">
                                  {new Date(review.date).toLocaleDateString('pt-BR')}
                                </span>
                              </div>
                            </div>
                          </div>
                          <p className="text-primary-700 mb-3">{review.comment}</p>
                          <button className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700">
                            <ThumbsUp className="w-4 h-4" />
                            <span>Útil ({review.helpful})</span>
                          </button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </motion.div>
            )}
          </div>

          {/* Sidebar com informações extras */}
          <div className="lg:col-span-1 space-y-6">
            {/* Sobre o curso - movido para cá para melhor aproveitamento do espaço */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-bold font-police-subtitle uppercase tracking-wider">BRIEFING DA OPERAÇÃO</h3>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-primary-700 space-y-3">
                  {(course.description || '').split('\n').map((paragraph, idx) => (
                    <p key={idx}>{paragraph.trim()}</p>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* FAQ */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <HelpCircle className="w-5 h-5" />
DÚVIDAS OPERACIONAIS
                </h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(course.faq || []).slice(0, 3).map((item, idx) => (
                    <div key={idx}>
                      <h4 className="font-medium text-primary-900 mb-1">
                        {item.question}
                      </h4>
                      <p className="text-sm text-primary-600">
                        {item.answer}
                      </p>
                    </div>
                  ))}
                  <button className="text-sm text-primary-600 hover:text-primary-700 font-medium font-police-body uppercase tracking-wider">
                    VER TODAS AS DÚVIDAS →
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Estatísticas do curso */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-bold font-police-subtitle uppercase tracking-wider">DADOS OPERACIONAIS</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-primary-600 font-police-body uppercase tracking-wider">ÚLTIMA ATUALIZAÇÃO</span>
                    <span className="font-medium">
                      {new Date(course.lastUpdated || Date.now()).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-primary-600 font-police-body uppercase tracking-wider">IDIOMA</span>
                    <span className="font-medium">{course.language || 'PORTUGUÊS'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-primary-600 font-police-body uppercase tracking-wider">NÍVEL</span>
                    <span className="font-medium">{course.level || 'INTERMEDIÁRIO'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-primary-600 font-police-body uppercase tracking-wider">CONDECORAÇÃO</span>
                    <span className="font-medium font-police-body uppercase tracking-wider">DISPONÍVEL</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Destaques do curso */}
            <Card className="bg-gray-800/90 dark:bg-gray-900/90 backdrop-blur-sm border-gray-700 dark:border-gray-600">
              <CardHeader>
                <h3 className="text-lg font-police-title font-bold flex items-center gap-2 text-white uppercase tracking-wider">
                  <Star className="w-5 h-5 text-accent-500 fill-current" />
                  POR QUE ESTA OPERAÇÃO?
                </h3>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-300 font-police-body">
                      <strong className="text-white uppercase">TAXA DE SUCESSO OPERACIONAL: 89%</strong> DOS RECRUTAS
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <TrendingUp className="w-5 h-5 text-accent-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-300 font-police-body">
                      <strong className="text-white uppercase">ARSENAL SEMPRE ATUALIZADO</strong> CONFORME INTELIGÊNCIA
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Users className="w-5 h-5 text-accent-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-300 font-police-body">
                      <strong className="text-white uppercase">ESQUADRÃO EXCLUSIVO</strong> PARA NETWORKING E APOIO
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Award className="w-5 h-5 text-accent-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-300 font-police-body">
                      <strong className="text-white uppercase">COMANDANTE ESPECIALISTA</strong> COM EXPERIÊNCIA DE CAMPO
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Call to action móvel */}
            <div className="lg:hidden sticky bottom-0 bg-white border-t p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="text-2xl font-bold text-primary-900">
                    R$ {course.price}
                  </span>
                  {course.originalPrice && (
                    <span className="text-sm text-primary-400 line-through ml-2">
                      R$ {course.originalPrice}
                    </span>
                  )}
                </div>
              </div>
              <Button 
                size="lg" 
                className="w-full bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black dark:text-black font-police-body font-semibold uppercase tracking-wider" 
                onClick={handleEnroll}
                disabled={enrollmentLoading}
              >
                {enrollmentLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin mr-2 inline-block" />
                    PROCESSANDO...
                  </>
                ) : isEnrolled ? (
                  <>
                    <Play className="w-4 h-4 mr-2 inline-block" />
                    CONTINUAR OPERAÇÃO
                  </>
                ) : (
                  'INICIAR MISSÃO'
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}