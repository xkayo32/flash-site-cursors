import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import React from 'react';
import {
  BookOpen,
  Brain,
  Trophy,
  Shield,
  Award,
  Users,
  Star,
  CheckCircle,
  ArrowRight,
  Play,
  BarChart3,
  LogIn,
  ChevronRight,
  Target,
  Facebook,
  Instagram,
  Youtube,
  Linkedin,
  Mail,
  Phone,
  MapPin,
  FileQuestion,
  FileText,
  LineChart,
  ChevronDown,
  Monitor,
  Smartphone,
  MessageSquare,
  Menu,
  X,
  Sun,
  Moon
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { StudyProLogo } from '@/components/ui/StudyProLogo';
import { useTheme } from '@/contexts/ThemeContext';
import '../../styles/police-fonts.css';

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
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [expandedFaq, setExpandedFaq] = React.useState<number | null>(null);
  const { setTheme, resolvedTheme } = useTheme();
  const features = [
    {
      icon: BookOpen,
      title: 'BANCO DE QUESTÕES',
      number: '50K+'
    },
    {
      icon: Brain,
      title: 'FLASHCARDS IA',
      number: '100%'
    },
    {
      icon: Trophy,
      title: 'SIMULADOS REAIS',
      number: '24/7'
    },
    {
      icon: BarChart3,
      title: 'ANALYTICS PRO',
      number: 'LIVE'
    }
  ];

  const courses = [
    {
      category: 'SEGURANÇA PÚBLICA',
      courses: [
        {
          name: 'Polícia Federal',
          positions: ['Agente', 'Escrivão', 'Papiloscopista'],
          salary: 'R$ 23.692',
          next_exam: 'MAR/25',
          difficulty: 'ALTO',
          students: 2847
        },
        {
          name: 'Polícia Civil',
          positions: ['Delegado', 'Investigador', 'Escrivão'],
          salary: 'R$ 18.326',
          next_exam: 'ABR/25',
          difficulty: 'ALTO',
          students: 3912
        },
        {
          name: 'Polícia Rodoviária',
          positions: ['Policial Rodoviário Federal'],
          salary: 'R$ 10.357',
          next_exam: 'JUN/25',
          difficulty: 'MÉDIO',
          students: 1543
        },
        {
          name: 'Polícia Militar',
          positions: ['Oficial', 'Soldado'],
          salary: 'R$ 12.458',
          next_exam: 'AGO/25',
          difficulty: 'MÉDIO',
          students: 4276
        }
      ]
    },
    {
      category: 'RECEITA E FISCAL',
      courses: [
        {
          name: 'Receita Federal',
          positions: ['Auditor Fiscal', 'Analista Tributário'],
          salary: 'R$ 21.029',
          next_exam: 'JUN/25',
          difficulty: 'EXTREMO',
          students: 3234
        },
        {
          name: 'ICMS Estadual',
          positions: ['Auditor Fiscal ICMS'],
          salary: 'R$ 18.500',
          next_exam: 'SET/25',
          difficulty: 'ALTO',
          students: 2156
        },
        {
          name: 'ISS Municipal',
          positions: ['Auditor Fiscal ISS'],
          salary: 'R$ 15.200',
          next_exam: 'NOV/25',
          difficulty: 'MÉDIO',
          students: 1892
        }
      ]
    },
    {
      category: 'TRIBUNAIS',
      courses: [
        {
          name: 'TCU',
          positions: ['Auditor', 'Analista', 'Técnico'],
          salary: 'R$ 18.826',
          next_exam: 'SET/25',
          difficulty: 'EXTREMO',
          students: 1567
        },
        {
          name: 'TRF',
          positions: ['Analista Judiciário', 'Técnico'],
          salary: 'R$ 16.292',
          next_exam: 'OUT/25',
          difficulty: 'ALTO',
          students: 2834
        },
        {
          name: 'TRT',
          positions: ['Analista', 'Técnico Judiciário'],
          salary: 'R$ 16.292',
          next_exam: 'DEZ/25',
          difficulty: 'ALTO',
          students: 2156
        }
      ]
    },
    {
      category: 'CARREIRAS ESPECIAIS',
      courses: [
        {
          name: 'Magistratura',
          positions: ['Juiz Federal', 'Juiz Estadual'],
          salary: 'R$ 35.462',
          next_exam: 'NOV/25',
          difficulty: 'EXTREMO',
          students: 892
        },
        {
          name: 'Ministério Público',
          positions: ['Promotor', 'Procurador'],
          salary: 'R$ 30.404',
          next_exam: 'DEZ/25',
          difficulty: 'EXTREMO',
          students: 654
        },
        {
          name: 'Diplomacia',
          positions: ['Diplomata'],
          salary: 'R$ 19.199',
          next_exam: 'FEV/26',
          difficulty: 'EXTREMO',
          students: 423
        }
      ]
    }
  ];

  const testimonials = [
    {
      name: 'CARLOS RIBEIRO',
      role: 'AGENTE PF',
      position: '1º LUGAR',
      text: 'METODOLOGIA BRUTAL. APROVAÇÃO GARANTIDA.',
      exam: 'PF 2024'
    },
    {
      name: 'MARINA SANTOS',
      role: 'AUDITORA RFB',
      position: '3º LUGAR',
      text: 'SISTEMA PERFEITO. RESULTADO IMEDIATO.',
      exam: 'RFB 2024'
    },
    {
      name: 'JOÃO SILVA',
      role: 'ANALISTA TCU',
      position: '2º LUGAR',
      text: 'PREPARAÇÃO COMPLETA. SUCESSO TOTAL.',
      exam: 'TCU 2024'
    }
  ];

  const stats = [
    { number: '89%', label: 'APROVAÇÃO' },
    { number: '15.847', label: 'APROVADOS 2024' },
    { number: '24/7', label: 'SUPORTE' },
    { number: '100%', label: 'GARANTIA' }
  ];

  const plans = [
    {
      name: 'ESSENCIAL',
      price: 'R$ 39,90',
      features: [
        '15K QUESTÕES',
        'FLASHCARDS',
        '10 SIMULADOS/MÊS',
        'RELATÓRIOS'
      ],
      popular: false,
      cta: 'COMEÇAR'
    },
    {
      name: 'PROFISSIONAL',
      price: 'R$ 69,90',
      features: [
        'QUESTÕES ILIMITADAS',
        'IA AVANÇADA',
        'SIMULADOS INFINITOS',
        'CRONOGRAMA PRO',
        'ANALYTICS COMPLETO',
        'SUPORTE PRIORITÁRIO'
      ],
      popular: true,
      cta: 'GARANTIR VAGA'
    },
    {
      name: 'ELITE',
      price: 'R$ 129,90',
      features: [
        'TUDO DO PRO',
        'MENTORIA 1:1',
        'REVISÕES VIP',
        'AULAS EXCLUSIVAS',
        'MATERIAL PREMIUM',
        'GARANTIA 100%'
      ],
      popular: false,
      cta: 'SER ELITE'
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'EXTREMO': return 'bg-gray-900 dark:bg-gray-100 text-white dark:text-black';
      case 'ALTO': return 'bg-gray-800 dark:bg-gray-200 text-white dark:text-black';
      case 'MÉDIO': return 'bg-gray-700 dark:bg-gray-300 text-white dark:text-black';
      default: return 'bg-gray-600 dark:bg-gray-400 text-white dark:text-black';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white font-police-primary" style={{ scrollBehavior: 'smooth' }}>
      {/* Header */}
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
        className="bg-white/95 dark:bg-gray-900 backdrop-blur-md sticky top-0 z-50 border-b border-gray-200 dark:border-gray-700 shadow-sm"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="cursor-pointer"
            >
              <StudyProLogo variant="full" size="sm" className="text-military-base dark:text-gray-300" />
            </motion.div>
            
            <nav className="hidden lg:flex items-center gap-8">
              {[
                { href: "#courses", label: "CONCURSOS" },
                { href: "#testimonials", label: "APROVADOS" },
                { href: "#pricing", label: "PLANOS" }
              ].map((item, index) => (
                <motion.a
                  key={item.href}
                  href={item.href}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="text-gray-700 dark:text-gray-300 hover:text-military-base dark:hover:text-white transition-all duration-300 font-police-subtitle text-xs md:text-sm tracking-widest-plus"
                >
                  {item.label}
                </motion.a>
              ))}
            </nav>

            <div className="flex items-center gap-4">
              <motion.button
                onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-full text-gray-700 dark:text-gray-300 hover:text-military-base dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300"
                aria-label="Toggle theme"
              >
                {resolvedTheme === 'dark' ? (
                  <Moon className="w-5 h-5" />
                ) : (
                  <Sun className="w-5 h-5" />
                )}
              </motion.button>
              <Link to="/login">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="hidden sm:flex items-center gap-2 px-3 md:px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-military-base dark:hover:text-white font-police-body transition-all duration-300 text-xs md:text-sm tracking-wider"
                >
                  <LogIn className="w-4 h-4" />
                  ENTRAR
                </motion.button>
              </Link>
              <Link to="/checkout?plan=price_monthly_premium">
                <motion.button
                  className="hidden md:flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 bg-accent-500 dark:bg-gray-100 hover:bg-accent-600 dark:hover:bg-accent-650 text-black dark:text-black hover:text-black dark:hover:text-white font-police-subtitle rounded transition-all duration-300 text-xs md:text-sm tracking-widest-plus shadow-lg"
                >
                  <Trophy className="w-4 h-4" />
                  GARANTIR APROVAÇÃO
                </motion.button>
              </Link>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden text-gray-700 dark:text-gray-300 hover:text-military-base dark:hover:text-white"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:hidden absolute top-full left-0 right-0 bg-white/95 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 backdrop-blur-md"
          >
            <nav className="flex flex-col p-4 space-y-2">
              {[
                { href: "#courses", label: "CONCURSOS" },
                { href: "#testimonials", label: "APROVADOS" },
                { href: "#pricing", label: "PLANOS" }
              ].map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-gray-700 dark:text-gray-300 hover:text-military-base dark:hover:text-white transition-all duration-300 font-police-subtitle text-sm tracking-widest py-2"
                >
                  {item.label}
                </a>
              ))}
              <div className="flex flex-col gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-center mb-2">
                  <button
                    onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
                    className="p-2 rounded-full text-gray-700 dark:text-gray-300 hover:text-military-base dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300"
                    aria-label="Toggle theme"
                  >
                    {resolvedTheme === 'dark' ? (
                      <Moon className="w-5 h-5" />
                    ) : (
                      <Sun className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <button className="w-full flex items-center justify-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-military-base dark:hover:text-white font-police-body transition-all duration-300 text-sm tracking-wider border border-gray-300 dark:border-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
                    <LogIn className="w-4 h-4" />
                    ENTRAR
                  </button>
                </Link>
                <Link to="/checkout?plan=price_monthly_premium" onClick={() => setMobileMenuOpen(false)}>
                  <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-accent-500 dark:bg-gray-100 hover:bg-accent-600 dark:hover:bg-accent-650 text-black dark:text-black hover:text-black dark:hover:text-white font-police-subtitle rounded transition-all duration-300 text-sm tracking-widest-plus shadow-lg">
                    <Trophy className="w-4 h-4" />
                    GARANTIR APROVAÇÃO
                  </button>
                </Link>
              </div>
            </nav>
          </motion.div>
        )}
      </motion.header>

      {/* Hero Section */}
      <section className="relative bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white py-12 md:py-24 overflow-hidden min-h-[90vh] md:min-h-screen flex items-center">
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1633265486064-086b219458ec?q=80&w=2070')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-white/60 dark:bg-black/70"></div>
          
          {/* Gradient overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-white dark:from-black via-white/50 dark:via-black/50 to-transparent"></div>
          
          {/* Scan lines effect */}
          <div 
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `repeating-linear-gradient(
                0deg,
                rgba(255, 255, 255, 0) 0px,
                rgba(255, 255, 255, 0.03) 1px,
                rgba(255, 255, 255, 0) 2px,
                rgba(255, 255, 255, 0) 3px
              )`
            }}
          ></div>
        </div>
        
        <div className="relative container mx-auto px-4 z-10">
          <motion.div
            initial="initial"
            animate="animate"
            variants={staggerContainer}
            className="max-w-5xl mx-auto text-center"
          >
            <motion.div
              variants={fadeInUp}
              className="inline-flex items-center gap-2 bg-white/10 dark:bg-white/5 border border-gray-300/30 dark:border-gray-700/50 rounded-md px-4 py-2 mb-8"
            >
              <Trophy className="w-4 h-4 text-military-base dark:text-gray-300" />
              <span className="text-military-base dark:text-gray-300 font-police-body text-sm tracking-widest">
                PLATAFORMA OFICIAL DOS APROVADOS
              </span>
            </motion.div>
            
            <motion.h1
              variants={fadeInUp}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-police-title mb-6 md:mb-8 leading-tight tracking-widest md:tracking-ultra-wide"
            >
              SUA APROVAÇÃO
              <span className="block text-military-base dark:text-white">
                É INEVITÁVEL
              </span>
            </motion.h1>
            
            <motion.p
              variants={fadeInUp}
              className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 dark:text-gray-300 mb-8 md:mb-12 max-w-4xl mx-auto font-police-body px-4 leading-relaxed"
            >
              <span className="block sm:inline">METODOLOGIA COMPROVADA</span>
              <span className="hidden sm:inline"> • </span>
              <span className="block sm:inline">89% APROVAÇÃO</span>
              <span className="hidden sm:inline"> • </span>
              <span className="block sm:inline">15.847 APROVADOS EM 2024</span>
            </motion.p>

            <motion.div
              variants={fadeInUp}
              className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center mb-8 md:mb-16 px-4"
            >
              <Link to="/checkout?plan=price_monthly_premium">
                <motion.button
                  className="group flex items-center gap-2 md:gap-3 bg-accent-500 dark:bg-gray-100 hover:bg-accent-600 dark:hover:bg-accent-650 text-black dark:text-black hover:text-black dark:hover:text-white text-lg md:text-xl font-police-title px-8 md:px-10 py-4 md:py-5 rounded-md shadow-2xl transition-all duration-300 tracking-widest md:tracking-widest-plus justify-center min-h-[56px] touch-manipulation"
                >
                  <Shield className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                  GARANTIR APROVAÇÃO
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                </motion.button>
              </Link>
              <motion.button
                whileHover={{ backgroundColor: "rgba(255,255,255,0.1)" }}
                whileTap={{ scale: 0.95 }}
                className="group flex items-center gap-2 md:gap-3 border-2 border-gray-300 dark:border-gray-600 hover:border-military-base dark:hover:border-gray-400 text-gray-700 dark:text-gray-300 hover:text-military-base dark:hover:text-white text-lg md:text-xl font-police-title px-8 md:px-10 py-4 md:py-5 rounded-md transition-all duration-300 tracking-widest md:tracking-widest-plus justify-center min-h-[56px] touch-manipulation hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <div className="w-12 h-12 rounded-full border-2 border-gray-300 dark:border-gray-600 group-hover:border-military-base dark:group-hover:border-gray-400 flex items-center justify-center group-hover:bg-military-base/10 dark:group-hover:bg-gray-400/10 transition-all">
                  <Play className="w-6 h-6 ml-1" />
                </div>
                VER METODOLOGIA
              </motion.button>
            </motion.div>

            {/* Features */}
            <motion.div
              variants={fadeInUp}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-16 px-4"
            >
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div key={index} className="text-center bg-gray-900/20 dark:bg-white/10 backdrop-blur-sm rounded-lg p-4 md:p-6 border border-gray-700/30 dark:border-white/20">
                    <Icon className="w-6 md:w-8 h-6 md:h-8 text-military-base dark:text-white mx-auto mb-2 md:mb-3" />
                    <div className="text-xl md:text-2xl font-police-numbers text-military-base dark:text-white mb-1 md:mb-2">
                      {feature.number}
                    </div>
                    <div className="text-gray-600 dark:text-gray-400 font-police-subtitle text-xs md:text-sm tracking-wider md:tracking-widest">
                      {feature.title}
                    </div>
                  </div>
                );
              })}
            </motion.div>

            {/* Stats */}
            <motion.div
              variants={fadeInUp}
              className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 bg-gray-900/20 dark:bg-white/10 backdrop-blur-sm rounded-lg p-6 md:p-8 border border-gray-700/30 dark:border-white/20 mx-4"
            >
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl md:text-4xl lg:text-5xl font-police-numbers text-military-base dark:text-white mb-2 md:mb-3">
                    {stat.number}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400 font-police-subtitle text-xs md:text-sm tracking-wider md:tracking-widest">
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Courses - Main Section */}
      <section id="courses" className="relative py-12 md:py-20 bg-gray-100 dark:bg-gray-900">
        {/* Background Pattern */}
        <div 
          className="absolute inset-0 opacity-30 dark:opacity-20 pointer-events-none"
          style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              transparent,
              transparent 35px,
              rgba(20, 36, 47, 0.05) 35px,
              rgba(20, 36, 47, 0.05) 70px
            )`
          }}
        />
        
        <div className="relative container mx-auto px-4 z-10">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2
              variants={fadeInUp}
              className="text-3xl md:text-4xl lg:text-6xl font-police-title text-military-base dark:text-white mb-4 tracking-widest md:tracking-ultra-wide px-4"
            >
              CONCURSOS DE ELITE
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-base md:text-xl text-gray-600 dark:text-gray-400 font-police-body tracking-wider px-4"
            >
              CARREIRAS MAIS CONCORRIDAS DO BRASIL
            </motion.p>
          </motion.div>

          {courses.map((category, categoryIndex) => (
            <motion.div
              key={categoryIndex}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="mb-16"
            >
              <motion.h3
                variants={fadeInUp}
                className="text-2xl font-police-subtitle text-military-base dark:text-white mb-8 text-center tracking-widest-plus"
              >
                {category.category}
              </motion.h3>
              
              <motion.div
                variants={staggerContainer}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8"
              >
                {category.courses.map((course, index) => (
                  <motion.div key={index} variants={fadeInUp}>
                    <Card className="h-full hover:shadow-2xl transition-all duration-300 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200 dark:border-gray-700 group hover:-translate-y-1 md:hover:-translate-y-2 rounded-lg overflow-hidden">
                      <div className="h-36 md:h-40 bg-gradient-to-br from-gray-200 dark:from-gray-700 to-white dark:to-gray-800 flex flex-col items-center justify-center text-military-base dark:text-white p-4 md:p-6">
                        <Award className="w-8 md:w-12 h-8 md:h-12 text-military-base dark:text-white mb-2 md:mb-3" />
                        <div className="text-center">
                          <div className="text-lg md:text-xl font-police-title tracking-wider">{course.name}</div>
                        </div>
                        <div className={`inline-block text-xs md:text-sm font-police-numbers px-3 py-1 rounded mt-2 md:mt-3 ${getDifficultyColor(course.difficulty)}`}>
                          {course.difficulty}
                        </div>
                      </div>
                      <CardContent className="p-5 md:p-6">
                        <div className="space-y-2 mb-4">
                          {course.positions.map((position, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 rounded px-3 md:px-4 py-2 md:py-3"
                            >
                              <span className="font-police-body text-gray-700 dark:text-gray-300 text-sm md:text-base">{position}</span>
                              <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                            </div>
                          ))}
                        </div>
                        
                        <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 md:p-5 mb-4 md:mb-5">
                          <div className="text-center">
                            <div className="text-xs md:text-sm text-gray-600 dark:text-gray-500 font-police-body tracking-wider mb-2">SALÁRIO ATÉ</div>
                            <div className="text-xl md:text-2xl font-police-numbers text-military-base dark:text-white">{course.salary}</div>
                            <div className="text-xs md:text-sm text-gray-600 dark:text-gray-500 font-police-body">PRÓXIMA: {course.next_exam}</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm md:text-base text-gray-600 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-4 md:pt-5">
                          <span className="flex items-center gap-2 font-police-body text-sm md:text-base">
                            <Users className="w-4 md:w-5 h-4 md:h-5" />
                            {course.students.toLocaleString()}
                          </span>
                          <span className="flex items-center gap-2 font-police-body text-sm md:text-base">
                            <Target className="w-4 md:w-5 h-4 md:h-5" />
                            ATIVO
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features Section - NEW */}
      <section id="features" className="relative py-12 md:py-20 bg-gray-50 dark:bg-gray-900 overflow-hidden">
        {/* Background Image with Pattern */}
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1518186233392-c232efbf2373?q=80&w=2074'), repeating-linear-gradient(
              45deg,
              transparent,
              transparent 35px,
              rgba(20, 36, 47, 0.05) 35px,
              rgba(20, 36, 47, 0.05) 70px
            )`,
            backgroundSize: 'cover, auto',
            backgroundPosition: 'center, center',
            backgroundRepeat: 'no-repeat, repeat'
          }}
        >
          <div className="absolute inset-0 bg-white/60 dark:bg-black/70"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-white dark:from-black via-white/50 dark:via-black/50 to-transparent"></div>
        </div>
        
        <div className="relative container mx-auto px-4 z-10">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2
              variants={fadeInUp}
              className="text-3xl md:text-4xl lg:text-6xl font-police-title text-military-base dark:text-white mb-4 tracking-widest md:tracking-ultra-wide px-4"
            >
              ARSENAL COMPLETO
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-base md:text-xl text-gray-600 dark:text-gray-400 font-police-body tracking-wider px-4"
            >
              FERRAMENTAS DE ELITE PARA SUA APROVAÇÃO
            </motion.p>
          </motion.div>

          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8"
          >
            {[
              {
                icon: FileQuestion,
                title: 'BANCO DE QUESTÕES',
                description: 'Mais de 50.000 questões de concursos anteriores com resolução detalhada',
                stats: '50.000+ questões'
              },
              {
                icon: Brain,
                title: 'FLASHCARDS IA',
                description: 'Sistema de repetição espaçada com inteligência artificial adaptativa',
                stats: 'Algoritmo adaptativo'
              },
              {
                icon: FileText,
                title: 'SIMULADOS REAIS',
                description: 'Provas completas no formato dos concursos com tempo cronometrado',
                stats: 'Tempo real'
              },
              {
                icon: LineChart,
                title: 'ANALYTICS AVANÇADO',
                description: 'Relatórios detalhados de desempenho e evolução do aprendizado',
                stats: 'Dados em tempo real'
              }
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div key={index} variants={fadeInUp}>
                  <Card className="h-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 rounded-lg">
                    <CardContent className="p-6 md:p-8 text-center">
                      <div className="w-16 md:w-20 h-16 md:h-20 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
                        <Icon className="w-8 md:w-10 h-8 md:h-10 text-gray-700 dark:text-gray-300" />
                      </div>
                      <h3 className="text-lg md:text-xl font-police-title text-military-base dark:text-white mb-3 md:mb-4 tracking-widest">
                        {feature.title}
                      </h3>
                      <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 font-police-body mb-3 md:mb-4 leading-relaxed">
                        {feature.description}
                      </p>
                      <div className="text-gray-700 dark:text-gray-300 font-police-numbers text-base md:text-lg font-bold">
                        {feature.stats}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-12 md:py-20 bg-gray-50 dark:bg-gray-900">
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
              className="text-3xl md:text-4xl lg:text-6xl font-police-title mb-4 tracking-widest md:tracking-ultra-wide px-4"
            >
              APROVADOS REAIS
            </motion.h2>
          </motion.div>

          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8"
          >
            {testimonials.map((testimonial, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="h-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-lg">
                  <CardContent className="p-8 text-center">
                    <div className="flex items-center justify-center gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-gray-700 dark:fill-gray-300 text-gray-700 dark:text-gray-300" />
                      ))}
                    </div>
                    
                    <p className="text-gray-700 dark:text-gray-300 font-police-body text-lg mb-6 tracking-wider">
                      "{testimonial.text}"
                    </p>
                    
                    <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
                      <div className="font-police-title text-military-base dark:text-white text-lg tracking-widest">
                        {testimonial.name}
                      </div>
                      <div className="text-military-base dark:text-white font-police-subtitle text-sm tracking-wider">
                        {testimonial.role}
                      </div>
                      <div className="text-gray-600 dark:text-gray-400 font-police-body text-sm">
                        {testimonial.position}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-500 font-police-numbers mt-2">
                        {testimonial.exam}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Platform Screenshots - NEW */}
      <section className="py-12 md:py-20 bg-gray-50 dark:bg-gray-900">
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
              className="text-3xl md:text-4xl lg:text-6xl font-police-title text-military-base dark:text-white mb-4 tracking-widest md:tracking-ultra-wide px-4"
            >
              INTERFACE TÁTICA
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-base md:text-xl text-gray-600 dark:text-gray-400 font-police-body tracking-wider px-4"
            >
              SISTEMA OTIMIZADO PARA MÁXIMA EFICIÊNCIA
            </motion.p>
          </motion.div>

          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 max-w-6xl mx-auto"
          >
            {[
              {
                title: 'PAINEL DE COMANDO',
                description: 'Dashboard completo com métricas em tempo real',
                image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070',
                features: ['Analytics em tempo real', 'Progresso detalhado', 'Metas personalizadas']
              },
              {
                title: 'MODO BATALHA',
                description: 'Interface de simulados com cronômetro e estatísticas',
                image: 'https://images.unsplash.com/photo-1551703599-6b3e8379aa8c?q=80&w=2071',
                features: ['Simulados cronometrados', 'Feedback instantâneo', 'Ranking em tempo real']
              }
            ].map((screenshot, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="overflow-hidden bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
                  <div className="relative h-64 md:h-80 overflow-hidden">
                    <img 
                      src={screenshot.image} 
                      alt={screenshot.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <div className="flex items-center gap-2 mb-2">
                        <Monitor className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                        <Smartphone className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                      </div>
                      <h3 className="text-xl font-police-title text-white tracking-widest">
                        {screenshot.title}
                      </h3>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <p className="text-gray-600 dark:text-gray-400 font-police-body mb-4">
                      {screenshot.description}
                    </p>
                    <ul className="space-y-2">
                      {screenshot.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 font-police-body">
                          <CheckCircle className="w-4 h-4 text-gray-700 dark:text-gray-300 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-12 md:py-20 bg-gray-100 dark:bg-gray-900">
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
              className="text-3xl md:text-4xl lg:text-6xl font-police-title text-military-base dark:text-white mb-4 tracking-widest md:tracking-ultra-wide px-4"
            >
              INVISTA NA APROVAÇÃO
            </motion.h2>
          </motion.div>

          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 max-w-6xl mx-auto"
          >
            {plans.map((plan, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className={`relative h-full ${plan.popular ? 'ring-2 ring-accent-500 shadow-2xl scale-105 bg-white dark:bg-gray-800 text-military-base dark:text-white' : 'bg-white dark:bg-gray-800 backdrop-blur-sm border border-gray-200 dark:border-gray-700 text-military-base dark:text-white'}`}>
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-accent-500 text-black px-6 py-2 rounded-md text-sm font-police-title tracking-widest">
                        MAIS ESCOLHIDO
                      </span>
                    </div>
                  )}
                  <CardContent className="p-8 text-center">
                    <h3 className="text-3xl font-police-title mb-6 tracking-widest-plus">
                      {plan.name}
                    </h3>
                    <div className="mb-8">
                      <span className="text-5xl font-police-numbers">
                        {plan.price}
                      </span>
                      <span className="text-lg font-police-body">/MÊS</span>
                    </div>
                    <ul className="space-y-3 mb-8 text-left">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                          <span className="font-police-body text-sm tracking-wider">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      className={`w-full py-4 text-lg font-police-title tracking-widest-plus shadow-lg ${
                        plan.popular 
                          ? 'bg-accent-500 dark:bg-gray-100 hover:bg-accent-600 dark:hover:bg-accent-650 text-black dark:text-black hover:text-black dark:hover:text-white' 
                          : 'bg-accent-500 dark:bg-gray-100 hover:bg-accent-600 dark:hover:bg-accent-650 text-black dark:text-black hover:text-black dark:hover:text-white'
                      }`}
                    >
                      {plan.cta}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Social Media Testimonials - NEW */}
      <section className="py-12 md:py-20 bg-gray-50 dark:bg-gray-900">
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
              className="text-3xl md:text-4xl lg:text-6xl font-police-title text-military-base dark:text-white mb-4 tracking-widest md:tracking-ultra-wide px-4"
            >
              TROPA EM AÇÃO
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-base md:text-xl text-gray-600 dark:text-gray-400 font-police-body tracking-wider px-4"
            >
              DEPOIMENTOS REAIS DAS REDES SOCIAIS
            </motion.p>
          </motion.div>

          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8 max-w-6xl mx-auto"
          >
            {[
              {
                platform: 'Instagram',
                username: '@pedro_concurseiro',
                avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
                content: 'Depois de 3 meses usando o StudyPro, fui aprovado na PF! O sistema de questões é INSANO! 🚀',
                likes: 342,
                date: '2 dias atrás'
              },
              {
                platform: 'Twitter',
                username: '@ana_rfb2024',
                avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
                content: 'Gente, o StudyPro mudou minha vida! Aprovada na Receita Federal com 85% de acertos. Sistema top demais!',
                likes: 891,
                date: '1 semana atrás'
              },
              {
                platform: 'Facebook',
                username: 'Carlos Eduardo',
                avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
                content: 'Aprovado no TCU! O diferencial foram os simulados cronometrados. Parecia que estava fazendo a prova real!',
                likes: 567,
                date: '3 dias atrás'
              }
            ].map((testimonial, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="h-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={testimonial.avatar} 
                          alt={testimonial.username}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div>
                          <div className="font-police-subtitle text-military-base dark:text-white">
                            {testimonial.username}
                          </div>
                          <div className="text-sm text-gray-500 font-police-body">
                            {testimonial.platform}
                          </div>
                        </div>
                      </div>
                      <MessageSquare className="w-5 h-5 text-gray-400" />
                    </div>
                    
                    <p className="text-gray-700 dark:text-gray-300 font-police-body mb-4">
                      {testimonial.content}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span className="flex items-center gap-2">
                        <Star className="w-4 h-4 fill-accent-500 text-accent-500" />
                        {testimonial.likes} curtidas
                      </span>
                      <span className="font-police-body">{testimonial.date}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FAQ Section - NEW */}
      <section className="py-8 md:py-12 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 max-w-3xl">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-8"
          >
            <motion.h2
              variants={fadeInUp}
              className="text-2xl md:text-3xl lg:text-4xl font-police-title text-military-base dark:text-white mb-3 tracking-widest px-4"
            >
              PERGUNTAS FREQUENTES
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-sm md:text-base text-gray-600 dark:text-gray-400 font-police-body tracking-wider px-4"
            >
              TIRE SUAS DÚVIDAS SOBRE A PLATAFORMA
            </motion.p>
          </motion.div>

          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="space-y-4"
          >
            {[
              {
                question: 'Como funciona a garantia de aprovação?',
                answer: 'Nossa metodologia tem 89% de taxa de aprovação. Se você seguir nosso plano de estudos e não for aprovado em 12 meses, devolvemos 100% do valor investido.'
              },
              {
                question: 'Posso acessar de qualquer dispositivo?',
                answer: 'Sim! A plataforma é 100% responsiva e funciona perfeitamente em computadores, tablets e smartphones. Você pode estudar de onde estiver.'
              },
              {
                question: 'As questões são atualizadas?',
                answer: 'Diariamente! Nossa equipe atualiza o banco com questões dos concursos mais recentes, garantindo que você estude com material sempre atualizado.'
              },
              {
                question: 'Quanto tempo tenho acesso ao conteúdo?',
                answer: 'O acesso é válido enquanto sua assinatura estiver ativa. Não há limite de visualizações ou downloads durante o período contratado.'
              },
              {
                question: 'Posso cancelar a qualquer momento?',
                answer: 'Sim! Você pode cancelar sua assinatura a qualquer momento, sem multas ou taxas adicionais. O acesso permanece ativo até o fim do período pago.'
              }
            ].map((faq, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <div 
                  className="border-b border-gray-200 dark:border-gray-700 py-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300"
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-police-subtitle text-military-base dark:text-white tracking-wider flex-1">
                      {faq.question}
                    </h3>
                    <ChevronDown className={`w-3 h-3 text-gray-500 dark:text-gray-400 transition-transform duration-300 ${expandedFaq === index ? 'rotate-180' : ''}`} />
                  </div>
                  {expandedFaq === index && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-2"
                    >
                      <p className="text-sm text-gray-600 dark:text-gray-400 font-police-body pb-2">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-20 bg-military-base dark:bg-gray-950 text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.h2
              variants={fadeInUp}
              className="text-3xl md:text-4xl lg:text-6xl font-police-title mb-6 tracking-widest md:tracking-ultra-wide px-4"
            >
              APROVAÇÃO COMEÇA AGORA
            </motion.h2>
            <motion.div variants={fadeInUp}>
              <Link to="/checkout?plan=price_monthly_premium">
                <Button className="bg-accent-500 dark:bg-gray-100 hover:bg-accent-600 dark:hover:bg-accent-650 text-black dark:text-black hover:text-black dark:hover:text-white text-lg md:text-xl font-police-title px-10 md:px-12 py-5 md:py-6 rounded-md tracking-widest md:tracking-widest-plus min-h-[60px] touch-manipulation shadow-lg">
                  GARANTIR APROVAÇÃO
                  <ArrowRight className="ml-2 md:ml-3 w-5 md:w-6 h-5 md:h-6" />
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-military-dark dark:bg-gray-950 text-white py-8 md:py-16 border-t border-gray-800">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 md:gap-8 mb-8 md:mb-12">
            {/* Company Info */}
            <div className="lg:col-span-2">
              <div className="mb-6">
                <StudyProLogo variant="full" size="lg" className="text-white" />
              </div>
              <p className="text-gray-400 font-police-body mb-6 leading-relaxed">
                PLATAFORMA OFICIAL DOS APROVADOS EM CONCURSOS PÚBLICOS. METODOLOGIA COMPROVADA COM MAIS DE 15.000 APROVAÇÕES.
              </p>
              
              {/* Contact Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-gray-300">
                  <Phone className="w-4 h-4" />
                  <span className="font-police-body">(11) 4002-8922</span>
                </div>
                <div className="flex items-center gap-3 text-gray-300">
                  <Mail className="w-4 h-4" />
                  <span className="font-police-body">contato@studypro.com.br</span>
                </div>
                <div className="flex items-center gap-3 text-gray-300">
                  <MapPin className="w-4 h-4" />
                  <span className="font-police-body">São Paulo - SP</span>
                </div>
              </div>
            </div>
            
            {/* Quick Links */}
            <div>
              <h4 className="font-police-subtitle mb-4 md:mb-6 text-base md:text-lg tracking-widest">RECURSOS</h4>
              <ul className="space-y-3 text-gray-400 font-police-body">
                <li><a href="#" className="hover:text-white transition-all duration-300 flex items-center gap-2 text-sm md:text-base">
                  <ChevronRight className="w-3 md:w-4 h-3 md:h-4" />QUESTÕES
                </a></li>
                <li><a href="#" className="hover:text-white transition-all duration-300 flex items-center gap-2 text-sm md:text-base">
                  <ChevronRight className="w-3 md:w-4 h-3 md:h-4" />FLASHCARDS IA
                </a></li>
                <li><a href="#" className="hover:text-white transition-all duration-300 flex items-center gap-2 text-sm md:text-base">
                  <ChevronRight className="w-3 md:w-4 h-3 md:h-4" />SIMULADOS
                </a></li>
                <li><a href="#" className="hover:text-white transition-all duration-300 flex items-center gap-2 text-sm md:text-base">
                  <ChevronRight className="w-3 md:w-4 h-3 md:h-4" />ANALYTICS
                </a></li>
              </ul>
            </div>
            
            {/* Top Courses */}
            <div>
              <h4 className="font-police-subtitle mb-4 md:mb-6 text-base md:text-lg tracking-widest">CONCURSOS</h4>
              <ul className="space-y-3 text-gray-400 font-police-body">
                <li><a href="#" className="hover:text-white transition-all duration-300 flex items-center gap-2 text-sm md:text-base">
                  <ChevronRight className="w-3 md:w-4 h-3 md:h-4" />POLÍCIA FEDERAL
                </a></li>
                <li><a href="#" className="hover:text-white transition-all duration-300 flex items-center gap-2 text-sm md:text-base">
                  <ChevronRight className="w-3 md:w-4 h-3 md:h-4" />RECEITA FEDERAL
                </a></li>
                <li><a href="#" className="hover:text-white transition-all duration-300 flex items-center gap-2 text-sm md:text-base">
                  <ChevronRight className="w-3 md:w-4 h-3 md:h-4" />MAGISTRATURA
                </a></li>
                <li><a href="#" className="hover:text-white transition-all duration-300 flex items-center gap-2 text-sm md:text-base">
                  <ChevronRight className="w-3 md:w-4 h-3 md:h-4" />TCU
                </a></li>
              </ul>
            </div>
            
            {/* Support */}
            <div>
              <h4 className="font-police-subtitle mb-4 md:mb-6 text-base md:text-lg tracking-widest">SUPORTE</h4>
              <ul className="space-y-3 text-gray-400 font-police-body">
                <li><a href="#" className="hover:text-white transition-all duration-300 flex items-center gap-2 text-sm md:text-base">
                  <ChevronRight className="w-3 md:w-4 h-3 md:h-4" />CENTRAL DE AJUDA
                </a></li>
                <li><a href="#" className="hover:text-white transition-all duration-300 flex items-center gap-2 text-sm md:text-base">
                  <ChevronRight className="w-3 md:w-4 h-3 md:h-4" />FAQ
                </a></li>
                <li><a href="#" className="hover:text-white transition-all duration-300 flex items-center gap-2 text-sm md:text-base">
                  <ChevronRight className="w-3 md:w-4 h-3 md:h-4" />TERMOS DE USO
                </a></li>
                <li><a href="#" className="hover:text-white transition-all duration-300 flex items-center gap-2 text-sm md:text-base">
                  <ChevronRight className="w-3 md:w-4 h-3 md:h-4" />PRIVACIDADE
                </a></li>
              </ul>
            </div>
          </div>
          
          {/* Social Media Section */}
          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <span className="font-police-subtitle text-sm tracking-widest text-gray-400">SIGA-NOS:</span>
                <div className="flex items-center gap-4">
                  <a 
                    href="https://facebook.com/studypro" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-military-base p-2 rounded hover:bg-military-light transition-all duration-300"
                    aria-label="Visite nosso Facebook"
                  >
                    <Facebook className="w-5 h-5" />
                  </a>
                  <a 
                    href="https://instagram.com/studypro" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-military-base p-2 rounded hover:bg-military-light transition-all duration-300"
                    aria-label="Visite nosso Instagram"
                  >
                    <Instagram className="w-5 h-5" />
                  </a>
                  <a 
                    href="https://youtube.com/studypro" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-military-base p-2 rounded hover:bg-military-light transition-all duration-300"
                    aria-label="Visite nosso canal no YouTube"
                  >
                    <Youtube className="w-5 h-5" />
                  </a>
                  <a 
                    href="https://linkedin.com/company/studypro" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-military-base p-2 rounded hover:bg-military-light transition-all duration-300"
                    aria-label="Visite nosso LinkedIn"
                  >
                    <Linkedin className="w-5 h-5" />
                  </a>
                </div>
              </div>
              
              <div className="text-center md:text-right">
                <p className="font-police-body tracking-wider text-gray-400 text-sm">
                  &copy; 2024 STUDYPRO EDUCAÇÃO LTDA. CNPJ: 12.345.678/0001-90
                </p>
                <p className="font-police-body text-gray-500 text-xs mt-1">
                  TODOS OS DIREITOS RESERVADOS.
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* WhatsApp Floating Button */}
      <motion.a
        href="https://wa.me/5511999999999?text=Olá! Preciso de ajuda com os cursos do StudyPro"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-4 md:bottom-6 right-4 md:right-6 z-50 bg-accent-500 dark:bg-gray-100 hover:bg-accent-600 dark:hover:bg-accent-650 text-black dark:text-black hover:text-black dark:hover:text-white p-4 md:p-5 rounded-full shadow-2xl transition-all duration-300 touch-manipulation"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: "spring", stiffness: 200 }}
        whileHover={{ rotate: 15 }}
        whileTap={{ scale: 0.9 }}
      >
        <svg
          className="w-6 md:w-7 h-6 md:h-7"
          fill="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <title>WhatsApp</title>
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
        </svg>
      </motion.a>
    </div>
  );
}