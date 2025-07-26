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
  MessageCircle,
  GraduationCap,
  CreditCard,
  LogIn,
  Rocket,
  Menu,
  Sun,
  Moon,
  Monitor
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Logo } from '@/components/ui/Logo';
import { useTheme } from '@/contexts/ThemeContext';
import { getDefaultCourseThumbnail } from '@/utils/defaultImages';

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
  const { theme, setTheme } = useTheme();
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
      image: getDefaultCourseThumbnail('Polícia Federal')
    },
    {
      name: 'Receita Federal',
      positions: ['Auditor Fiscal', 'Analista Tributário'],
      students: 2134,
      questions: 12300,
      image: getDefaultCourseThumbnail('Receita Federal')
    },
    {
      name: 'Tribunal de Contas',
      positions: ['Auditor', 'Analista', 'Técnico'],
      students: 987,
      questions: 6700,
      image: getDefaultCourseThumbnail('Tribunal de Contas')
    },
    {
      name: 'Magistratura',
      positions: ['Juiz Federal', 'Juiz Estadual'],
      students: 543,
      questions: 15200,
      image: getDefaultCourseThumbnail('Magistratura')
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
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
        className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg sticky top-0 z-50 border-b border-primary-100 dark:border-gray-700"
      >
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="cursor-pointer"
            >
              <Logo variant="full" size="sm" animated={true} />
            </motion.div>
            
            <nav className="hidden lg:flex items-center gap-10">
              {[
                { href: "#features", label: "Funcionalidades", icon: BookOpen },
                { href: "#courses", label: "Cursos", icon: GraduationCap },
                { href: "#testimonials", label: "Depoimentos", icon: Users },
                { href: "/checkout", label: "Preços", icon: CreditCard }
              ].map((item, index) => (
                <motion.a
                  key={item.href}
                  href={item.href}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group flex items-center gap-2 text-primary-700 dark:text-gray-300 hover:text-primary-900 dark:hover:text-white transition-all duration-300 font-medium relative"
                >
                  <item.icon className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  {item.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-600 dark:bg-primary-400 group-hover:w-full transition-all duration-300"></span>
                </motion.a>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              {/* Theme Selector */}
              <div className="hidden sm:flex items-center gap-2 p-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg mr-4">
                <button
                  onClick={() => setTheme('light')}
                  className={`p-2 rounded-md transition-colors ${
                    theme === 'light' 
                      ? 'bg-primary-100 dark:bg-primary-800 text-primary-600 dark:text-primary-400' 
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                  }`}
                  title="Tema Claro"
                >
                  <Sun className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className={`p-2 rounded-md transition-colors ${
                    theme === 'dark' 
                      ? 'bg-primary-100 dark:bg-primary-800 text-primary-600 dark:text-primary-400' 
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                  }`}
                  title="Tema Escuro"
                >
                  <Moon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setTheme('system')}
                  className={`p-2 rounded-md transition-colors ${
                    theme === 'system' 
                      ? 'bg-primary-100 dark:bg-primary-800 text-primary-600 dark:text-primary-400' 
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                  }`}
                  title="Seguir Sistema"
                >
                  <Monitor className="w-4 h-4" />
                </button>
              </div>
              
              <Link to="/login">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="hidden sm:flex items-center gap-2 px-5 py-2.5 text-primary-700 dark:text-gray-300 hover:text-primary-900 dark:hover:text-white font-medium transition-all duration-300 border-2 border-transparent hover:border-primary-200 dark:hover:border-gray-600 rounded-xl"
                >
                  <LogIn className="w-4 h-4" />
                  Entrar
                </motion.button>
              </Link>
              <Link to="/checkout?plan=price_monthly_premium">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl"
                >
                  <Rocket className="w-5 h-5" />
                  <span className="hidden sm:inline">Assinar Agora</span>
                  <span className="sm:hidden">Assinar</span>
                </motion.button>
              </Link>
              
              {/* Mobile Menu Button */}
              <button className="lg:hidden p-2 rounded-lg hover:bg-primary-100 dark:hover:bg-gray-800 transition-colors">
                <Menu className="w-6 h-6 text-primary-700 dark:text-gray-300" />
              </button>
            </div>
          </div>
        </div>
      </motion.header>

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
              <Link to="/checkout?plan=price_monthly_premium">
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(0,0,0,0.3)" }}
                  whileTap={{ scale: 0.95 }}
                  className="group flex items-center gap-3 bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-white text-lg font-bold px-8 py-4 rounded-2xl shadow-xl transition-all duration-300"
                >
                  <Rocket className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                  Assinar Agora
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </Link>
              <motion.button
                whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.2)" }}
                whileTap={{ scale: 0.95 }}
                className="group flex items-center gap-2 border-2 border-white/50 backdrop-blur-sm text-white hover:border-white text-lg font-semibold px-8 py-4 rounded-2xl transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                  <Play className="w-6 h-6 ml-1" />
                </div>
                Ver Demonstração
              </motion.button>
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
      <section id="features" className="py-20 bg-gray-50 dark:bg-gray-800">
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
              className="text-4xl md:text-5xl font-bold text-primary-900 dark:text-white mb-4"
            >
              Funcionalidades que fazem a diferença
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-xl text-primary-600 dark:text-gray-300 max-w-3xl mx-auto"
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
                  <Card className="h-full hover:shadow-lg transition-shadow dark:bg-gray-900 dark:border-gray-700">
                    <CardContent className="p-8 text-center">
                      <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Icon className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-primary-900 dark:text-white mb-4">
                        {feature.title}
                      </h3>
                      <p className="text-primary-600 dark:text-gray-300">
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
      <section id="courses" className="py-20 bg-white dark:bg-gray-900">
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
              className="text-4xl md:text-5xl font-bold text-primary-900 dark:text-white mb-4"
            >
              Cursos mais procurados
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-xl text-primary-600 dark:text-gray-300"
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
                <Card className="overflow-hidden hover:shadow-lg transition-shadow dark:bg-gray-800 dark:border-gray-700">
                  <div className="h-48 bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                    <Award className="w-16 h-16 text-white" />
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold text-primary-900 dark:text-white mb-2">
                      {course.name}
                    </h3>
                    <div className="space-y-2 mb-4">
                      {course.positions.map((position, idx) => (
                        <span
                          key={idx}
                          className="inline-block bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm px-2 py-1 rounded mr-2"
                        >
                          {position}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-sm text-primary-600 dark:text-gray-300">
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
      <section id="testimonials" className="py-20 bg-gray-50 dark:bg-gray-800">
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
              className="text-4xl md:text-5xl font-bold text-primary-900 dark:text-white mb-4"
            >
              O que nossos alunos dizem
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-xl text-primary-600 dark:text-gray-300"
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
                <Card className="h-full dark:bg-gray-900 dark:border-gray-700">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-primary-700 dark:text-gray-300 mb-6 italic">
                      "{testimonial.text}"
                    </p>
                    <div className="flex items-center gap-4">
                      <img
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        className="w-12 h-12 rounded-full"
                      />
                      <div>
                        <div className="font-semibold text-primary-900 dark:text-white">
                          {testimonial.name}
                        </div>
                        <div className="text-sm text-primary-600 dark:text-gray-300">
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
      <section id="pricing" className="py-20 bg-white dark:bg-gray-900">
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
              className="text-4xl md:text-5xl font-bold text-primary-900 dark:text-white mb-4"
            >
              Planos para todos os perfis
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-xl text-primary-600 dark:text-gray-300"
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
                <Card className={`relative dark:bg-gray-800 dark:border-gray-700 ${plan.popular ? 'ring-2 ring-accent-500 shadow-xl scale-105' : ''}`}>
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-accent-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                        Mais Popular
                      </span>
                    </div>
                  )}
                  <CardContent className="p-8 text-center">
                    <h3 className="text-2xl font-bold text-primary-900 dark:text-white mb-4">
                      {plan.name}
                    </h3>
                    <div className="mb-6">
                      <span className="text-4xl font-bold text-primary-900 dark:text-white">
                        {plan.price}
                      </span>
                      <span className="text-primary-600 dark:text-gray-300">{plan.period}</span>
                    </div>
                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-green-500" />
                          <span className="text-primary-700 dark:text-gray-300">{feature}</span>
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
      <section className="py-20 bg-primary-600 dark:bg-primary-800 text-white">
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
              <Link to="/checkout">
                <Button size="lg" className="bg-accent-500 hover:bg-accent-600 text-lg px-8 py-4">
                  Escolher Plano
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary-900 dark:bg-gray-950 text-white py-12">
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
              <ul className="space-y-2 text-primary-200 dark:text-gray-400">
                <li><a href="#" className="hover:text-white dark:hover:text-gray-200 transition">Funcionalidades</a></li>
                <li><a href="#" className="hover:text-white dark:hover:text-gray-200 transition">Preços</a></li>
                <li><a href="#" className="hover:text-white dark:hover:text-gray-200 transition">Cursos</a></li>
                <li><a href="#" className="hover:text-white dark:hover:text-gray-200 transition">Blog</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Suporte</h4>
              <ul className="space-y-2 text-primary-200 dark:text-gray-400">
                <li><a href="#" className="hover:text-white dark:hover:text-gray-200 transition">Central de Ajuda</a></li>
                <li><a href="#" className="hover:text-white dark:hover:text-gray-200 transition">Contato</a></li>
                <li><a href="#" className="hover:text-white dark:hover:text-gray-200 transition">WhatsApp</a></li>
                <li><a href="#" className="hover:text-white dark:hover:text-gray-200 transition">Status</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-primary-200 dark:text-gray-400">
                <li><a href="#" className="hover:text-white dark:hover:text-gray-200 transition">Privacidade</a></li>
                <li><a href="#" className="hover:text-white dark:hover:text-gray-200 transition">Termos</a></li>
                <li><a href="#" className="hover:text-white dark:hover:text-gray-200 transition">Cookies</a></li>
                <li><a href="#" className="hover:text-white dark:hover:text-gray-200 transition">Licenças</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-primary-700 dark:border-gray-800 mt-8 pt-8 text-center text-primary-200 dark:text-gray-400">
            <p>&copy; 2024 StudyPro. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}