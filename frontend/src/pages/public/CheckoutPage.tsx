import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Check,
  Star,
  Shield,
  Clock,
  Trophy,
  Target,
  AlertTriangle,
  Users,
  BookOpen,
  Brain,
  FileText,
  Zap,
  Lock,
  CreditCard,
  Briefcase,
  Award
} from 'lucide-react';
import StripeCheckout from '@/components/payment/StripeCheckout';
import { Button } from '@/components/ui/Button';
import { StudyProLogo } from '@/components/ui/StudyProLogo';
import toast from 'react-hot-toast';
import '../../styles/police-fonts.css';

// Plans data
const plans = [
  {
    id: 'price_monthly_basic',
    name: 'RECRUTA',
    subtitle: 'TREINAMENTO BÁSICO',
    price: 97,
    interval: 'month',
    popular: false,
    color: 'gray',
    features: [
      '10.000+ QUESTÕES COMENTADAS',
      'FLASHCARDS TÁTICOS',
      'SIMULADOS BÁSICOS',
      'RESUMOS ESSENCIAIS',
      'SUPORTE PADRÃO'
    ],
    limitations: [
      'SEM PAINEL TÁTICO',
      'SEM MENTORIA',
      'SEM CRONOGRAMA IA'
    ]
  },
  {
    id: 'price_monthly_premium',
    name: 'ELITE',
    subtitle: 'FORÇA ESPECIAL',
    price: 197,
    interval: 'month',
    popular: true,
    color: 'yellow',
    features: [
      'QUESTÕES ILIMITADAS',
      'FLASHCARDS COM I.A.',
      'SIMULADOS COMPLETOS',
      'PAINEL TÁTICO AVANÇADO',
      'CRONOGRAMA INTELIGENTE',
      'MENTORIA EXCLUSIVA',
      'LEGISLAÇÃO COMPLETA',
      'SUPORTE PRIORITÁRIO 24/7',
      'ATUALIZAÇÕES EM TEMPO REAL'
    ],
    limitations: []
  },
  {
    id: 'price_yearly_premium',
    name: 'COMANDO',
    subtitle: 'OPERAÇÕES ESPECIAIS',
    price: 1.497,
    interval: 'year',
    popular: false,
    color: 'white',
    originalPrice: 2.364,
    discount: 37,
    features: [
      'TODOS OS RECURSOS ELITE',
      'ECONOMIA DE R$ 867',
      'ACESSO VITALÍCIO 2025',
      'MENTORIA VIP INDIVIDUAL',
      'MATERIAIS EXCLUSIVOS',
      'GARANTIA TOTAL 30 DIAS',
      'BÔNUS: CURSOS EXTRAS',
      'CERTIFICADO DE CONCLUSÃO'
    ],
    limitations: []
  }
];

const testimonials = [
  {
    name: "Carlos Silva",
    role: "Aprovado - Polícia Federal",
    content: "A metodologia é excepcional. Em 6 meses consegui minha aprovação.",
    rating: 5
  },
  {
    name: "Ana Santos",
    role: "Aprovada - PRF",
    content: "O painel tático fez toda diferença na minha preparação. Recomendo!",
    rating: 5
  },
  {
    name: "João Oliveira",
    role: "Aprovado - Polícia Civil",
    content: "Questões idênticas às da prova. Acertei 89% graças ao StudyPro.",
    rating: 5
  }
];

export default function CheckoutPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [step, setStep] = useState<'plan-selection' | 'checkout'>('plan-selection');

  const planId = searchParams.get('plan');

  useEffect(() => {
    if (planId) {
      const plan = plans.find(p => p.id === planId);
      if (plan) {
        setSelectedPlan(plan);
        setStep('checkout');
      }
    }
  }, [planId]);

  const handlePlanSelect = (plan: any) => {
    setSelectedPlan(plan);
    setStep('checkout');
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('plan', plan.id);
    navigate({ search: newSearchParams.toString() }, { replace: true });
  };

  const handlePaymentSuccess = (paymentIntent: any) => {
    toast.success('Pagamento realizado com sucesso! Bem-vindo à elite!');
    navigate('/dashboard');
  };

  const handlePaymentError = (error: string) => {
    console.error('Payment failed:', error);
    toast.error('Erro no pagamento. Tente novamente.');
  };

  const handleBackToPlanSelection = () => {
    setStep('plan-selection');
    setSelectedPlan(null);
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.delete('plan');
    navigate({ search: newSearchParams.toString() }, { replace: true });
  };

  if (step === 'checkout' && selectedPlan) {
    return (
      <div className="min-h-screen bg-black py-8 font-police-primary">
        <div className="max-w-4xl mx-auto px-4">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={handleBackToPlanSelection}
            className="mb-6 gap-2 text-gray-400 hover:text-white font-police-body"
          >
            <ArrowLeft className="w-4 h-4" />
            VOLTAR AOS PLANOS
          </Button>

          <StripeCheckout
            plan={selectedPlan}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black font-police-primary">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-900/50 to-black opacity-90"></div>
        
        {/* Background Pattern */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              transparent,
              transparent 35px,
              rgba(255,255,255,.05) 35px,
              rgba(255,255,255,.05) 70px
            )`
          }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 py-12">
          {/* Back to Home Button */}
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-all duration-300 font-police-body group mb-8"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="tracking-wider">VOLTAR AO INÍCIO</span>
          </Link>

          {/* Logo */}
          <div className="flex justify-center mb-8">
            <StudyProLogo variant="full" size="lg" className="text-white" />
          </div>

          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 bg-yellow-400/20 text-yellow-400 px-4 py-2 rounded-full mb-6 font-police-body"
            >
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm tracking-wider">VAGAS LIMITADAS - TURMA FECHANDO</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-6xl font-police-title text-white mb-4 tracking-ultra-wide"
            >
              GARANTA SUA VAGA
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-gray-400 max-w-3xl mx-auto font-police-body tracking-wider"
            >
              ESCOLHA SEU NÍVEL DE TREINAMENTO E INICIE SUA JORNADA RUMO À APROVAÇÃO
            </motion.p>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 max-w-4xl mx-auto"
            >
              {[
                { icon: Trophy, value: '15.847', label: 'APROVADOS' },
                { icon: Target, value: '89%', label: 'TAXA DE APROVAÇÃO' },
                { icon: Users, value: '50K+', label: 'ALUNOS ATIVOS' },
                { icon: Award, value: '#1', label: 'MELHOR CURSO' }
              ].map((stat, index) => (
                <div key={index} className="bg-gray-900/50 backdrop-blur-sm rounded p-4 border border-gray-800">
                  <stat.icon className="w-6 h-6 text-accent-500 mx-auto mb-2" />
                  <div className="text-2xl font-police-numbers text-white">{stat.value}</div>
                  <div className="text-xs font-police-subtitle text-gray-500 tracking-widest">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Plans */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <div className="bg-accent-500 text-black px-6 py-2 rounded-full flex items-center gap-2 font-police-subtitle tracking-wider">
                    <Star className="w-4 h-4" />
                    <span className="text-sm font-bold">MAIS ESCOLHIDO</span>
                  </div>
                </div>
              )}

              <div className={`
                h-full border-2 rounded-lg p-8 relative overflow-hidden transition-all duration-300
                ${plan.popular 
                  ? 'border-yellow-400 bg-gray-900 transform scale-105 shadow-2xl shadow-yellow-400/20' 
                  : 'border-gray-800 bg-gray-900/50 hover:border-gray-700'
                }
              `}>
                {/* Background Pattern */}
                <div 
                  className="absolute inset-0 opacity-5"
                  style={{
                    backgroundImage: `repeating-linear-gradient(
                      -45deg,
                      transparent,
                      transparent 20px,
                      rgba(255,255,255,.02) 20px,
                      rgba(255,255,255,.02) 40px
                    )`
                  }}
                />

                <div className="relative z-10">
                  {/* Plan Header */}
                  <div className="text-center mb-8">
                    <div className={`
                      w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center
                      ${plan.color === 'yellow' ? 'bg-accent-500' : plan.color === 'white' ? 'bg-white' : 'bg-gray-700'}
                    `}>
                      {plan.name === 'RECRUTA' && <Briefcase className={`w-8 h-8 ${plan.color === 'gray' ? 'text-gray-400' : 'text-black'}`} />}
                      {plan.name === 'ELITE' && <Shield className="w-8 h-8 text-black" />}
                      {plan.name === 'COMANDO' && <Target className="w-8 h-8 text-black" />}
                    </div>

                    <h3 className="text-3xl font-police-title text-white mb-2 tracking-widest">
                      {plan.name}
                    </h3>
                    <p className="text-sm font-police-subtitle text-gray-500 tracking-wider">
                      {plan.subtitle}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="text-center mb-8">
                    {plan.originalPrice && (
                      <div className="flex items-center justify-center gap-3 mb-2">
                        <span className="text-lg text-gray-500 line-through font-police-numbers">
                          R$ {plan.originalPrice.toLocaleString('pt-BR')}
                        </span>
                        <span className="bg-green-500 text-black px-3 py-1 rounded-full text-sm font-police-subtitle font-bold">
                          -{plan.discount}%
                        </span>
                      </div>
                    )}
                    <div className="flex items-baseline justify-center">
                      <span className="text-5xl font-police-numbers text-white font-bold">
                        R$ {plan.price.toLocaleString('pt-BR')}
                      </span>
                      <span className="text-lg text-gray-400 ml-2 font-police-body">
                        /{plan.interval === 'month' ? 'MÊS' : 'ANO'}
                      </span>
                    </div>
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-300 font-police-body text-sm tracking-wider">
                          {feature}
                        </span>
                      </li>
                    ))}
                    {plan.limitations.map((limitation, limitationIndex) => (
                      <li key={`limitation-${limitationIndex}`} className="flex items-start gap-3 opacity-50">
                        <div className="w-5 h-5 mt-0.5 flex-shrink-0 flex items-center justify-center">
                          <div className="w-3 h-0.5 bg-gray-600"></div>
                        </div>
                        <span className="text-gray-500 font-police-body text-sm tracking-wider line-through">
                          {limitation}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <Button
                    onClick={() => handlePlanSelect(plan)}
                    className={`
                      w-full py-4 text-lg font-police-title tracking-widest transition-all duration-300
                      ${plan.popular
                        ? 'bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black shadow-lg shadow-accent-500/30'
                        : plan.color === 'white'
                        ? 'bg-white hover:bg-gray-200 dark:hover:bg-gray-700 text-black dark:text-white'
                        : 'bg-gray-800 hover:bg-gray-700 text-white border border-gray-700'
                      }
                    `}
                  >
                    {plan.popular ? 'INICIAR AGORA' : 'SELECIONAR PLANO'}
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Testimonials */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-20"
        >
          <h2 className="text-3xl font-police-title text-white text-center mb-12 tracking-ultra-wide">
            DEPOIMENTOS DA TROPA
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="bg-gray-900 border border-gray-800 rounded-lg p-6"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-accent-500 fill-current" />
                  ))}
                </div>
                <p className="text-gray-300 font-police-body mb-4 italic">
                  "{testimonial.content}"
                </p>
                <div>
                  <div className="font-police-subtitle text-white tracking-wider">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-gray-500 font-police-body">
                    {testimonial.role}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Guarantees */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-20 bg-gray-900 border border-gray-800 rounded-lg p-12"
        >
          <h2 className="text-3xl font-police-title text-white text-center mb-12 tracking-ultra-wide">
            GARANTIAS DE SEGURANÇA
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { icon: Lock, title: 'PAGAMENTO SEGURO', desc: 'Criptografia SSL 256-bit' },
              { icon: Shield, title: 'GARANTIA 30 DIAS', desc: 'Satisfação ou dinheiro de volta' },
              { icon: CreditCard, title: 'PARCELAMENTO', desc: 'Em até 12x sem juros' },
              { icon: Clock, title: 'CANCELE QUANDO QUISER', desc: 'Sem multas ou taxas' }
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-6 h-6 text-accent-500" />
                </div>
                <h4 className="font-police-subtitle text-white mb-2 tracking-wider">
                  {item.title}
                </h4>
                <p className="text-sm text-gray-500 font-police-body">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Urgency */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-12 text-center"
        >
          <div className="inline-flex items-center gap-3 bg-red-900/20 border border-red-900 text-red-400 px-6 py-3 rounded-full font-police-body">
            <AlertTriangle className="w-5 h-5 animate-pulse" />
            <span className="tracking-wider">
              ATENÇÃO: PREÇOS PROMOCIONAIS POR TEMPO LIMITADO
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}