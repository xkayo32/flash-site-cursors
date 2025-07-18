import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Brain,
  Trophy,
  Target,
  Users,
  Star,
  CheckCircle,
  ArrowRight,
  Play,
  BarChart3,
  Calendar,
  Zap,
  Shield,
  Award,
  Clock,
  TrendingUp,
  MessageCircle
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function HomePage() {
  const features = [
    {
      icon: BookOpen,
      title: 'Banco de Questões',
      description: 'Mais de 50.000 questões organizadas por disciplina, banca e ano'
    },
    {
      icon: Brain,
      title: 'Flashcards Inteligentes',
      description: 'Sistema de repetição espaçada que otimiza sua memorização'
    },
    {
      icon: Trophy,
      title: 'Simulados Realistas',
      description: 'Pratique com simulados que reproduzem as condições reais das provas'
    },
    {
      icon: BarChart3,
      title: 'Analytics Avançado',
      description: 'Acompanhe seu progresso com relatórios detalhados e insights'
    },
    {
      icon: Calendar,
      title: 'Cronograma Personalizado',
      description: 'IA que cria um plano de estudos adaptado ao seu perfil'
    },
    {
      icon: Zap,
      title: 'Estudo Offline',
      description: 'Continue estudando mesmo sem internet com nossa PWA'
    }
  ];

  const testimonials = [
    {
      name: 'Ana Carolina',
      role: 'Aprovada PF - Agente',
      avatar: 'https://ui-avatars.com/api/?name=Ana+Carolina&background=14242f&color=fff',
      text: 'A plataforma foi fundamental para minha aprovação. O sistema de flashcards me ajudou a memorizar legislação de forma eficiente.',
      rating: 5,
      course: 'Polícia Federal'
    },
    {
      name: 'Roberto Silva',
      role: 'Aprovado RFB - Auditor',
      avatar: 'https://ui-avatars.com/api/?name=Roberto+Silva&background=14242f&color=fff',
      text: 'Os simulados são idênticos às provas reais. Cheguei no dia da prova super preparado e confiante.',
      rating: 5,
      course: 'Receita Federal'
    },
    {
      name: 'Mariana Costa',
      role: 'Aprovada TCU - Analista',
      avatar: 'https://ui-avatars.com/api/?name=Mariana+Costa&background=14242f&color=fff',
      text: 'O cronograma personalizado me organizou perfeitamente. Consegui cobrir todo o edital em tempo hábil.',
      rating: 5,
      course: 'TCU'
    }
  ];

  const courses = [
    {
      name: 'Polícia Federal',
      positions: ['Agente', 'Escrivão', 'Papiloscopista'],
      students: 1247,
      questions: 8500,
      image: '/api/placeholder/300/200'
    },
    {
      name: 'Receita Federal',
      positions: ['Auditor Fiscal', 'Analista Tributário'],
      students: 2134,
      questions: 12300,
      image: '/api/placeholder/300/200'
    },
    {
      name: 'Tribunal de Contas',
      positions: ['Auditor', 'Analista', 'Técnico'],
      students: 987,
      questions: 6700,
      image: '/api/placeholder/300/200'
    },
    {
      name: 'Magistratura',
      positions: ['Juiz Federal', 'Juiz Estadual'],
      students: 543,
      questions: 15200,
      image: '/api/placeholder/300/200'
    }
  ];

  const stats = [
    { number: '50.000+', label: 'Questões Disponíveis' },
    { number: '15.000+', label: 'Alunos Aprovados' },
    { number: '200+', label: 'Concursos Cobertos' },
    { number: '98%', label: 'Taxa de Satisfação' }
  ];

  const plans = [
    {
      name: 'Básico',
      price: 'R$ 29,90',
      period: '/mês',
      features: [
        'Acesso a 10.000 questões',
        'Flashcards básicos',
        '5 simulados por mês',
        'Relatórios simples'
      ],
      popular: false
    },
    {
      name: 'Premium',
      price: 'R$ 49,90',
      period: '/mês',
      features: [
        'Acesso completo às questões',
        'Flashcards com IA',
        'Simulados ilimitados',
        'Cronograma personalizado',
        'Analytics avançado',
        'Suporte prioritário'
      ],
      popular: true
    },
    {
      name: 'VIP',
      price: 'R$ 89,90',
      period: '/mês',
      features: [
        'Tudo do Premium',
        'Mentoria individual',
        'Correção de redações',
        'Aulas ao vivo',
        'Material exclusivo'
      ],
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-primary-900">StudyPro</span>
            </div>
            
            <nav className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-primary-700 hover:text-primary-600 transition">
                Funcionalidades
              </a>
              <a href="#courses" className="text-primary-700 hover:text-primary-600 transition">
                Cursos
              </a>
              <a href="#testimonials" className="text-primary-700 hover:text-primary-600 transition">
                Depoimentos
              </a>
              <a href="#pricing" className="text-primary-700 hover:text-primary-600 transition">
                Preços
              </a>
            </nav>

            <div className="flex items-center gap-4">
              <Link to="/login" className="text-primary-700 hover:text-primary-600 transition">
                Entrar
              </Link>
              <Link to="/register">
                <Button>Começar Agora</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial="initial"
            animate="animate"
            variants={staggerContainer}
            className="max-w-4xl mx-auto text-center"
          >
            <motion.h1
              variants={fadeInUp}
              className="text-5xl md:text-7xl font-bold mb-6"
            >
              Sua aprovação começa <span className="text-accent-400">aqui</span>
            </motion.h1>
            
            <motion.p
              variants={fadeInUp}
              className="text-xl md:text-2xl text-primary-100 mb-8 max-w-3xl mx-auto"
            >
              A plataforma mais completa para concursos públicos. 
              Questões, flashcards inteligentes, simulados e muito mais.
            </motion.p>

            <motion.div
              variants={fadeInUp}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
            >
              <Link to="/register">
                <Button size="lg" className="bg-accent-500 hover:bg-accent-600 text-lg px-8 py-4">
                  Começar Gratuitamente
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Button
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white hover:text-primary-600 text-lg px-8 py-4"
              >
                <Play className="mr-2 w-5 h-5" />
                Ver Demo
              </Button>
            </motion.div>

            {/* Stats */}
            <motion.div
              variants={fadeInUp}
              className="grid grid-cols-2 md:grid-cols-4 gap-8"
            >
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-accent-400 mb-2">
                    {stat.number}
                  </div>
                  <div className="text-primary-200">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2
              variants={fadeInUp}
              className="text-4xl md:text-5xl font-bold text-primary-900 mb-4"
            >
              Funcionalidades que fazem a diferença
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-xl text-primary-600 max-w-3xl mx-auto"
            >
              Tecnologia de ponta para maximizar seus resultados nos estudos
            </motion.p>
          </motion.div>

          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div key={index} variants={fadeInUp}>
                  <Card className="h-full hover:shadow-lg transition-shadow">
                    <CardContent className="p-8 text-center">
                      <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Icon className="w-8 h-8 text-primary-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-primary-900 mb-4">
                        {feature.title}
                      </h3>
                      <p className="text-primary-600">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Courses */}
      <section id="courses" className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2
              variants={fadeInUp}
              className="text-4xl md:text-5xl font-bold text-primary-900 mb-4"
            >
              Cursos mais procurados
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-xl text-primary-600"
            >
              Preparação completa para os concursos de maior prestígio
            </motion.p>
          </motion.div>

          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {courses.map((course, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="h-48 bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                    <Award className="w-16 h-16 text-white" />
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold text-primary-900 mb-2">
                      {course.name}
                    </h3>
                    <div className="space-y-2 mb-4">
                      {course.positions.map((position, idx) => (
                        <span
                          key={idx}
                          className="inline-block bg-primary-100 text-primary-700 text-sm px-2 py-1 rounded mr-2"
                        >
                          {position}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-sm text-primary-600">
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {course.students.toLocaleString()} alunos
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        {course.questions.toLocaleString()} questões
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2
              variants={fadeInUp}
              className="text-4xl md:text-5xl font-bold text-primary-900 mb-4"
            >
              O que nossos alunos dizem
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-xl text-primary-600"
            >
              Histórias reais de aprovação e sucesso
            </motion.p>
          </motion.div>

          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {testimonials.map((testimonial, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="h-full">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-primary-700 mb-6 italic">
                      "{testimonial.text}"
                    </p>
                    <div className="flex items-center gap-4">
                      <img
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        className="w-12 h-12 rounded-full"
                      />
                      <div>
                        <div className="font-semibold text-primary-900">
                          {testimonial.name}
                        </div>
                        <div className="text-sm text-primary-600">
                          {testimonial.role}
                        </div>
                        <div className="text-xs text-accent-600 font-medium">
                          {testimonial.course}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2
              variants={fadeInUp}
              className="text-4xl md:text-5xl font-bold text-primary-900 mb-4"
            >
              Planos para todos os perfis
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-xl text-primary-600"
            >
              Escolha o plano ideal para sua jornada de aprovação
            </motion.p>
          </motion.div>

          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto"
          >
            {plans.map((plan, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className={`relative ${plan.popular ? 'ring-2 ring-accent-500 shadow-xl scale-105' : ''}`}>
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-accent-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                        Mais Popular
                      </span>
                    </div>
                  )}
                  <CardContent className="p-8 text-center">
                    <h3 className="text-2xl font-bold text-primary-900 mb-4">
                      {plan.name}
                    </h3>
                    <div className="mb-6">
                      <span className="text-4xl font-bold text-primary-900">
                        {plan.price}
                      </span>
                      <span className="text-primary-600">{plan.period}</span>
                    </div>
                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-green-500" />
                          <span className="text-primary-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      className="w-full"
                      variant={plan.popular ? 'default' : 'outline'}
                    >
                      Escolher Plano
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.h2
              variants={fadeInUp}
              className="text-4xl md:text-5xl font-bold mb-6"
            >
              Pronto para começar sua jornada?
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto"
            >
              Junte-se a milhares de candidatos que já escolheram a StudyPro para realizar seus sonhos
            </motion.p>
            <motion.div variants={fadeInUp}>
              <Link to="/register">
                <Button size="lg" className="bg-accent-500 hover:bg-accent-600 text-lg px-8 py-4">
                  Começar Agora - Grátis
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-accent-500 rounded-lg flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold">StudyPro</span>
              </div>
              <p className="text-primary-200">
                A plataforma mais completa para sua aprovação em concursos públicos.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Produto</h4>
              <ul className="space-y-2 text-primary-200">
                <li><a href="#" className="hover:text-white transition">Funcionalidades</a></li>
                <li><a href="#" className="hover:text-white transition">Preços</a></li>
                <li><a href="#" className="hover:text-white transition">Cursos</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Suporte</h4>
              <ul className="space-y-2 text-primary-200">
                <li><a href="#" className="hover:text-white transition">Central de Ajuda</a></li>
                <li><a href="#" className="hover:text-white transition">Contato</a></li>
                <li><a href="#" className="hover:text-white transition">WhatsApp</a></li>
                <li><a href="#" className="hover:text-white transition">Status</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-primary-200">
                <li><a href="#" className="hover:text-white transition">Privacidade</a></li>
                <li><a href="#" className="hover:text-white transition">Termos</a></li>
                <li><a href="#" className="hover:text-white transition">Cookies</a></li>
                <li><a href="#" className="hover:text-white transition">Licenças</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-primary-700 mt-8 pt-8 text-center text-primary-200">
            <p>&copy; 2024 StudyPro. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}