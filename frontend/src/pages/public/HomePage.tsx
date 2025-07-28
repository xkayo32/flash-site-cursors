import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
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
  Calendar,
  GraduationCap,
  LogIn,
  ChevronRight,
  Quote,
  Target,
  Clock,
  TrendingUp,
  Facebook,
  Instagram,
  Youtube,
  Linkedin,
  MessageCircle,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { StudyProLogo } from '@/components/ui/StudyProLogo';
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
      case 'EXTREMO': return 'bg-red-600 text-white';
      case 'ALTO': return 'bg-orange-600 text-white';
      case 'MÉDIO': return 'bg-yellow-600 text-black';
      default: return 'bg-green-600 text-white';
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-police-primary">
      {/* Header */}
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
        className="bg-black/98 backdrop-blur-md sticky top-0 z-50 border-b border-gray-800"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="cursor-pointer"
            >
              <StudyProLogo variant="full" size="md" className="text-white" />
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
                  className="text-gray-300 hover:text-white transition-all duration-300 font-police-subtitle text-sm tracking-widest-plus"
                >
                  {item.label}
                </motion.a>
              ))}
            </nav>

            <div className="flex items-center gap-4">
              <Link to="/login">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="hidden sm:flex items-center gap-2 px-4 py-2 text-gray-300 hover:text-white font-police-body transition-all duration-300 text-sm tracking-wider"
                >
                  <LogIn className="w-4 h-4" />
                  ENTRAR
                </motion.button>
              </Link>
              <Link to="/checkout?plan=price_monthly_premium">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-gray-200 text-black font-police-subtitle rounded transition-all duration-300 text-sm tracking-widest-plus"
                >
                  <Trophy className="w-4 h-4" />
                  GARANTIR APROVAÇÃO
                </motion.button>
              </Link>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="relative bg-black text-white py-24 overflow-hidden min-h-screen flex items-center">
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=2074')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm"></div>
          
          {/* Gradient overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/70 to-black"></div>
          
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
              className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-md px-4 py-2 mb-8"
            >
              <Trophy className="w-4 h-4 text-white" />
              <span className="text-white font-police-body text-sm tracking-widest">
                PLATAFORMA OFICIAL DOS APROVADOS
              </span>
            </motion.div>
            
            <motion.h1
              variants={fadeInUp}
              className="text-6xl md:text-8xl font-police-title mb-8 leading-tight tracking-ultra-wide"
            >
              SUA APROVAÇÃO
              <span className="block text-white">
                É INEVITÁVEL
              </span>
            </motion.h1>
            
            <motion.p
              variants={fadeInUp}
              className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto font-police-body"
            >
              METODOLOGIA COMPROVADA • 89% APROVAÇÃO • 15.847 APROVADOS EM 2024
            </motion.p>

            <motion.div
              variants={fadeInUp}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
            >
              <Link to="/checkout?plan=price_monthly_premium">
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 20px 50px rgba(255, 255, 255, 0.3)" }}
                  whileTap={{ scale: 0.95 }}
                  className="group flex items-center gap-3 bg-white hover:bg-gray-200 text-black text-xl font-police-title px-10 py-5 rounded-md shadow-2xl transition-all duration-300 tracking-widest-plus"
                >
                  <Shield className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                  GARANTIR APROVAÇÃO
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                </motion.button>
              </Link>
              <motion.button
                whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.1)" }}
                whileTap={{ scale: 0.95 }}
                className="group flex items-center gap-3 border-2 border-gray-600 hover:border-gray-400 text-gray-300 hover:text-white text-xl font-police-title px-10 py-5 rounded-md transition-all duration-300 tracking-widest-plus"
              >
                <div className="w-12 h-12 rounded-full border-2 border-gray-600 group-hover:border-gray-400 flex items-center justify-center group-hover:bg-white/10 transition-all">
                  <Play className="w-6 h-6 ml-1" />
                </div>
                VER METODOLOGIA
              </motion.button>
            </motion.div>

            {/* Features */}
            <motion.div
              variants={fadeInUp}
              className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
            >
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div key={index} className="text-center bg-gray-900/50 backdrop-blur-sm rounded-md p-6 border border-gray-800">
                    <Icon className="w-8 h-8 text-white mx-auto mb-3" />
                    <div className="text-2xl font-police-numbers text-white mb-2">
                      {feature.number}
                    </div>
                    <div className="text-gray-400 font-police-subtitle text-xs tracking-widest">
                      {feature.title}
                    </div>
                  </div>
                );
              })}
            </motion.div>

            {/* Stats */}
            <motion.div
              variants={fadeInUp}
              className="grid grid-cols-2 md:grid-cols-4 gap-8 bg-gray-900/30 backdrop-blur-sm rounded-lg p-8 border border-gray-800"
            >
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl md:text-4xl font-police-numbers text-white mb-2">
                    {stat.number}
                  </div>
                  <div className="text-gray-400 font-police-subtitle text-xs tracking-widest">
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Courses - Main Section */}
      <section id="courses" className="relative py-20 bg-gray-900">
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundAttachment: 'fixed'
          }}
        >
          <div className="absolute inset-0 bg-gray-900/95"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-gray-900/90 to-gray-900"></div>
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
              className="text-4xl md:text-6xl font-police-title text-white mb-4 tracking-ultra-wide"
            >
              CONCURSOS DE ELITE
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-xl text-gray-400 font-police-body tracking-wider"
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
                className="text-2xl font-police-subtitle text-white mb-8 text-center tracking-widest-plus"
              >
                {category.category}
              </motion.h3>
              
              <motion.div
                variants={staggerContainer}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              >
                {category.courses.map((course, index) => (
                  <motion.div key={index} variants={fadeInUp}>
                    <Card className="h-full hover:shadow-2xl transition-all duration-300 bg-gray-800 border-gray-700 group hover:-translate-y-2">
                      <div className="h-40 bg-gradient-to-br from-gray-800 to-black flex flex-col items-center justify-center text-white p-4">
                        <Award className="w-12 h-12 text-white mb-3" />
                        <div className="text-center">
                          <div className="text-lg font-police-title tracking-wider">{course.name}</div>
                        </div>
                        <div className={`inline-block text-xs font-police-numbers px-2 py-1 rounded mt-2 ${getDifficultyColor(course.difficulty)}`}>
                          {course.difficulty}
                        </div>
                      </div>
                      <CardContent className="p-6">
                        <div className="space-y-2 mb-4">
                          {course.positions.map((position, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between bg-gray-900 rounded px-3 py-2"
                            >
                              <span className="font-police-body text-gray-300 text-sm">{position}</span>
                              <ChevronRight className="w-4 h-4 text-gray-500" />
                            </div>
                          ))}
                        </div>
                        
                        <div className="bg-gray-900 rounded p-4 mb-4">
                          <div className="text-center">
                            <div className="text-xs text-gray-500 font-police-body tracking-wider mb-1">SALÁRIO ATÉ</div>
                            <div className="text-xl font-police-numbers text-white">{course.salary}</div>
                            <div className="text-xs text-gray-500 font-police-body">PRÓXIMA: {course.next_exam}</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm text-gray-400 border-t border-gray-700 pt-4">
                          <span className="flex items-center gap-1 font-police-body">
                            <Users className="w-4 h-4" />
                            {course.students.toLocaleString()}
                          </span>
                          <span className="flex items-center gap-1 font-police-body">
                            <Target className="w-4 h-4" />
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

      {/* Testimonials */}
      <section id="testimonials" className="py-20 bg-black">
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
              className="text-4xl md:text-6xl font-police-title mb-4 tracking-ultra-wide"
            >
              APROVADOS REAIS
            </motion.h2>
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
                <Card className="h-full bg-gray-900 border-gray-800 transition-all duration-300">
                  <CardContent className="p-8 text-center">
                    <div className="flex items-center justify-center gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-white text-white" />
                      ))}
                    </div>
                    
                    <p className="text-gray-300 font-police-body text-lg mb-6 tracking-wider">
                      "{testimonial.text}"
                    </p>
                    
                    <div className="border-t border-gray-800 pt-6">
                      <div className="font-police-title text-white text-lg tracking-widest">
                        {testimonial.name}
                      </div>
                      <div className="text-white font-police-subtitle text-sm tracking-wider">
                        {testimonial.role}
                      </div>
                      <div className="text-gray-400 font-police-body text-sm">
                        {testimonial.position}
                      </div>
                      <div className="text-xs text-gray-500 font-police-numbers mt-2">
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

      {/* Pricing */}
      <section id="pricing" className="py-20 bg-gray-900">
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
              className="text-4xl md:text-6xl font-police-title text-white mb-4 tracking-ultra-wide"
            >
              INVISTA NA APROVAÇÃO
            </motion.h2>
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
                <Card className={`relative h-full ${plan.popular ? 'ring-2 ring-white shadow-2xl scale-105 bg-white text-black' : 'bg-gray-800 border-gray-700 text-white'}`}>
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-black text-white px-6 py-2 rounded-md text-sm font-police-title tracking-widest">
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
                      className={`w-full py-4 text-lg font-police-title tracking-widest-plus ${
                        plan.popular 
                          ? 'bg-black hover:bg-gray-800 text-white' 
                          : 'bg-white hover:bg-gray-200 text-black'
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

      {/* CTA Section */}
      <section className="py-20 bg-black text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.h2
              variants={fadeInUp}
              className="text-4xl md:text-6xl font-police-title mb-6 tracking-ultra-wide"
            >
              APROVAÇÃO COMEÇA AGORA
            </motion.h2>
            <motion.div variants={fadeInUp}>
              <Link to="/checkout">
                <Button className="bg-white hover:bg-gray-200 text-black text-xl font-police-title px-12 py-6 rounded-md tracking-widest-plus">
                  GARANTIR APROVAÇÃO
                  <ArrowRight className="ml-3 w-6 h-6" />
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-16 border-t border-gray-800">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
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
              <h4 className="font-police-subtitle mb-6 text-lg tracking-widest">RECURSOS</h4>
              <ul className="space-y-3 text-gray-400 font-police-body">
                <li><a href="#" className="hover:text-white transition-all duration-300 flex items-center gap-2">
                  <ChevronRight className="w-4 h-4" />QUESTÕES
                </a></li>
                <li><a href="#" className="hover:text-white transition-all duration-300 flex items-center gap-2">
                  <ChevronRight className="w-4 h-4" />FLASHCARDS IA
                </a></li>
                <li><a href="#" className="hover:text-white transition-all duration-300 flex items-center gap-2">
                  <ChevronRight className="w-4 h-4" />SIMULADOS
                </a></li>
                <li><a href="#" className="hover:text-white transition-all duration-300 flex items-center gap-2">
                  <ChevronRight className="w-4 h-4" />ANALYTICS
                </a></li>
              </ul>
            </div>
            
            {/* Top Courses */}
            <div>
              <h4 className="font-police-subtitle mb-6 text-lg tracking-widest">CONCURSOS</h4>
              <ul className="space-y-3 text-gray-400 font-police-body">
                <li><a href="#" className="hover:text-white transition-all duration-300 flex items-center gap-2">
                  <ChevronRight className="w-4 h-4" />POLÍCIA FEDERAL
                </a></li>
                <li><a href="#" className="hover:text-white transition-all duration-300 flex items-center gap-2">
                  <ChevronRight className="w-4 h-4" />RECEITA FEDERAL
                </a></li>
                <li><a href="#" className="hover:text-white transition-all duration-300 flex items-center gap-2">
                  <ChevronRight className="w-4 h-4" />MAGISTRATURA
                </a></li>
                <li><a href="#" className="hover:text-white transition-all duration-300 flex items-center gap-2">
                  <ChevronRight className="w-4 h-4" />TCU
                </a></li>
              </ul>
            </div>
            
            {/* Support */}
            <div>
              <h4 className="font-police-subtitle mb-6 text-lg tracking-widest">SUPORTE</h4>
              <ul className="space-y-3 text-gray-400 font-police-body">
                <li><a href="#" className="hover:text-white transition-all duration-300 flex items-center gap-2">
                  <ChevronRight className="w-4 h-4" />CENTRAL DE AJUDA
                </a></li>
                <li><a href="#" className="hover:text-white transition-all duration-300 flex items-center gap-2">
                  <ChevronRight className="w-4 h-4" />FAQ
                </a></li>
                <li><a href="#" className="hover:text-white transition-all duration-300 flex items-center gap-2">
                  <ChevronRight className="w-4 h-4" />TERMOS DE USO
                </a></li>
                <li><a href="#" className="hover:text-white transition-all duration-300 flex items-center gap-2">
                  <ChevronRight className="w-4 h-4" />PRIVACIDADE
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
                    className="bg-gray-800 p-2 rounded hover:bg-gray-700 transition-all duration-300"
                  >
                    <Facebook className="w-5 h-5" />
                  </a>
                  <a 
                    href="https://instagram.com/studypro" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gray-800 p-2 rounded hover:bg-gray-700 transition-all duration-300"
                  >
                    <Instagram className="w-5 h-5" />
                  </a>
                  <a 
                    href="https://youtube.com/studypro" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gray-800 p-2 rounded hover:bg-gray-700 transition-all duration-300"
                  >
                    <Youtube className="w-5 h-5" />
                  </a>
                  <a 
                    href="https://linkedin.com/company/studypro" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gray-800 p-2 rounded hover:bg-gray-700 transition-all duration-300"
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
        className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: "spring", stiffness: 200 }}
        whileHover={{ rotate: 15 }}
        whileTap={{ scale: 0.9 }}
      >
        <svg
          className="w-6 h-6"
          fill="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
        </svg>
      </motion.a>
    </div>
  );
}