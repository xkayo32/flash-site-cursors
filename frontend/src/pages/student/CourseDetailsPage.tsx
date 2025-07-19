import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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
import { Logo } from '@/components/ui/Logo';
import { cn } from '@/utils/cn';
import toast from 'react-hot-toast';

// Mock de dados do curso
const mockCourseDetails = {
  id: '1',
  title: 'Polícia Federal 2024 - Agente',
  subtitle: 'Preparação completa e atualizada para o concurso da PF',
  description: `
    Este é o curso mais completo para quem deseja se preparar para o concurso de Agente da Polícia Federal. 
    Com uma abordagem prática e objetiva, nosso curso cobre todo o conteúdo programático do edital, 
    com professores especialistas em cada disciplina.
    
    Nosso diferencial está na metodologia focada em questões, com mais de 8.500 exercícios comentados 
    e simulados no padrão CESPE/CEBRASPE. Além disso, oferecemos suporte direto com os professores 
    e acompanhamento personalizado do seu progresso.
  `,
  instructor: {
    name: 'Prof. Carlos Mendez',
    avatar: 'https://ui-avatars.com/api/?name=Carlos+Mendez&background=14242f&color=fff',
    bio: 'Delegado aposentado da PF com 25 anos de experiência. Autor de 5 livros sobre segurança pública.',
    students: 15420,
    rating: 4.9,
    courses: 12
  },
  category: 'Polícia',
  subcategory: 'Federal',
  level: 'Intermediário',
  language: 'Português',
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
  image: 'https://images.unsplash.com/photo-1589994965851-a8f479c573a9?w=800&h=450&fit=crop',
  videoPreview: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  
  // Conteúdo do curso
  modules: [
    {
      id: '1',
      title: 'Língua Portuguesa',
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
      title: 'Direito Constitucional',
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
      title: 'Direito Administrativo',
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
      title: 'Direito Penal',
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
      title: 'Informática',
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
    'Ensino médio completo',
    'Conhecimentos básicos de informática',
    'Dedicação mínima de 2 horas por dia',
    'Acesso à internet para assistir as aulas'
  ],
  
  // Para quem é este curso
  targetAudience: [
    'Candidatos ao concurso de Agente da Polícia Federal',
    'Profissionais que desejam migrar para a área policial',
    'Estudantes que buscam estabilidade no serviço público',
    'Pessoas interessadas em segurança pública'
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

  const course = mockCourseDetails; // Em produção, buscar do backend usando o id

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev =>
      prev.includes(moduleId)
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const handleEnroll = () => {
    // Aqui seria a lógica de matrícula/pagamento
    toast.success('Redirecionando para o pagamento...');
    // navigate('/checkout');
  };

  const displayedModules = showAllModules ? course.modules : course.modules.slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header com navegação */}
      <header className="bg-primary-900 text-white sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo e navegação */}
            <div className="flex items-center gap-8">
              <Link to="/dashboard">
                <Logo variant="full" size="sm" className="text-white" />
              </Link>
              
              <nav className="hidden md:flex items-center gap-6">
                <Link
                  to="/courses"
                  className="flex items-center gap-2 hover:text-primary-200 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Voltar aos cursos
                </Link>
              </nav>
            </div>

            {/* Busca e ações */}
            <div className="flex items-center gap-4">
              <div className="hidden lg:block">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary-400" />
                  <input
                    type="text"
                    placeholder="Buscar cursos..."
                    className="w-64 pl-10 pr-4 py-2 bg-primary-800 border border-primary-700 rounded-lg text-white placeholder-primary-400 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <Link to="/cart" className="relative p-2 hover:bg-primary-800 rounded-lg transition-colors">
                <ShoppingCart className="w-6 h-6" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent-500 text-xs rounded-full flex items-center justify-center">
                  2
                </span>
              </Link>
              
              <Link to="/dashboard">
                <Button variant="secondary" size="sm">
                  Meu Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile breadcrumb */}
      <div className="md:hidden bg-white border-b px-4 py-2">
        <Link
          to="/courses"
          className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar aos cursos
        </Link>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-700 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-6 py-8 md:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Informações principais */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <Badge variant="secondary" className="bg-white/20 text-white border-0">
                  {course.category}
                </Badge>
                <Badge variant="secondary" className="bg-white/20 text-white border-0">
                  {course.level}
                </Badge>
              </div>
              
              <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
              <p className="text-xl text-primary-100 mb-6">{course.subtitle}</p>
              
              <div className="flex items-center gap-6 mb-6">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <span className="font-bold">{course.rating}</span>
                  <span className="text-primary-200">({course.reviews} avaliações)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  <span>{course.students.toLocaleString()} alunos</span>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <img
                  src={course.instructor.avatar}
                  alt={course.instructor.name}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <p className="font-medium">Criado por</p>
                  <p className="text-primary-100">{course.instructor.name}</p>
                </div>
              </div>
            </div>

            {/* Card de compra fixo no desktop */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardContent className="p-6">
                  {/* Preview do vídeo */}
                  <div className="relative mb-6 rounded-lg overflow-hidden">
                    <img
                      src={course.image}
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
                        R$ {course.price}
                      </span>
                      <span className="text-primary-600">à vista</span>
                    </div>
                    <p className="text-sm text-primary-600 mt-1">
                      ou {course.installments.number}x de R$ {course.installments.value.toFixed(2)}
                    </p>
                  </div>

                  {/* Botões de ação */}
                  <div className="space-y-3">
                    <Button
                      size="lg"
                      className="w-full"
                      onClick={handleEnroll}
                    >
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      Comprar agora
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full"
                    >
                      Adicionar ao carrinho
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
                    <h4 className="font-medium text-primary-900">Este curso inclui:</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-primary-400" />
                        <span>{course.duration} de conteúdo</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Video className="w-4 h-4 text-primary-400" />
                        <span>Acesso vitalício</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Smartphone className="w-4 h-4 text-primary-400" />
                        <span>Acesso mobile e TV</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Award className="w-4 h-4 text-primary-400" />
                        <span>Certificado de conclusão</span>
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
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Tabs de navegação */}
            <div className="border-b mb-8">
              <nav className="flex gap-8">
                {[
                  { id: 'overview', label: 'Visão geral' },
                  { id: 'curriculum', label: 'Conteúdo' },
                  { id: 'instructor', label: 'Instrutor' },
                  { id: 'reviews', label: 'Avaliações' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={cn(
                      'pb-4 px-1 font-medium transition-colors relative',
                      activeTab === tab.id
                        ? 'text-primary-900'
                        : 'text-primary-500 hover:text-primary-700'
                    )}
                  >
                    {tab.label}
                    {activeTab === tab.id && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-900"
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
                <Card>
                  <CardHeader>
                    <h2 className="text-2xl font-bold">O que você aprenderá</h2>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        'Dominar todas as disciplinas do edital',
                        'Técnicas de resolução de questões CESPE',
                        'Gestão eficiente do tempo de estudo',
                        'Estratégias para o dia da prova',
                        'Interpretação de textos complexos',
                        'Raciocínio lógico aplicado'
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-primary-700">{item}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Para quem é este curso */}
                <Card>
                  <CardHeader>
                    <h2 className="text-2xl font-bold">Para quem é este curso</h2>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {course.targetAudience.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <Target className="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" />
                          <span className="text-primary-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Requisitos */}
                <Card>
                  <CardHeader>
                    <h2 className="text-2xl font-bold">Requisitos</h2>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {course.requirements.map((req, idx) => (
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
                      <h2 className="text-2xl font-bold">Conteúdo do curso</h2>
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
                                {module.topics.map((topic, idx) => (
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
                    <h2 className="text-2xl font-bold">Sobre o instrutor</h2>
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
                            <span className="text-primary-500">Avaliação</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-primary-400" />
                            <span className="font-medium">{course.instructor.students.toLocaleString()}</span>
                            <span className="text-primary-500">Alunos</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-primary-400" />
                            <span className="font-medium">{course.instructor.courses}</span>
                            <span className="text-primary-500">Cursos</span>
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
                    <h2 className="text-2xl font-bold">Avaliações dos alunos</h2>
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
                {course.topReviews.map(review => (
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
                <h3 className="text-lg font-bold">Sobre o curso</h3>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-primary-700 space-y-3">
                  {course.description.split('\n').map((paragraph, idx) => (
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
                  Perguntas frequentes
                </h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {course.faq.slice(0, 3).map((item, idx) => (
                    <div key={idx}>
                      <h4 className="font-medium text-primary-900 mb-1">
                        {item.question}
                      </h4>
                      <p className="text-sm text-primary-600">
                        {item.answer}
                      </p>
                    </div>
                  ))}
                  <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                    Ver todas as perguntas →
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Estatísticas do curso */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-bold">Estatísticas</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-primary-600">Última atualização</span>
                    <span className="font-medium">
                      {new Date(course.lastUpdated).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-primary-600">Idioma</span>
                    <span className="font-medium">{course.language}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-primary-600">Nível</span>
                    <span className="font-medium">{course.level}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-primary-600">Certificado</span>
                    <span className="font-medium">Sim</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Destaques do curso */}
            <Card className="bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200">
              <CardHeader>
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500 fill-current" />
                  Por que escolher este curso?
                </h3>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-primary-700">
                      <strong>Taxa de aprovação de 89%</strong> entre nossos alunos
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <TrendingUp className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-primary-700">
                      <strong>Material sempre atualizado</strong> conforme mudanças no edital
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Users className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-primary-700">
                      <strong>Grupo exclusivo</strong> para networking e dúvidas
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Award className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-primary-700">
                      <strong>Professor especialista</strong> com experiência na área
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
              <Button size="lg" className="w-full" onClick={handleEnroll}>
                Comprar agora
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}