import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Check,
  Star,
  Users,
  BookOpen,
  Brain,
  FileText,
  Shield,
  Clock,
  Zap,
  Crown
} from 'lucide-react';
import StripeCheckout from '@/components/payment/StripeCheckout';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

// Plans data
const plans = [
  {
    id: 'price_monthly_basic',
    name: 'Básico Mensal',
    price: 29.90,
    interval: 'month',
    popular: false,
    features: [
      'Acesso a 1.000+ questões',
      'Sistema básico de flashcards',
      'Resumos de matérias essenciais',
      'Simulados básicos',
      'Suporte por email'
    ]
  },
  {
    id: 'price_monthly_premium',
    name: 'Premium Mensal',
    price: 49.90,
    interval: 'month',
    popular: true,
    features: [
      'Acesso ilimitado a questões',
      'Sistema avançado de flashcards com SRS',
      'Todos os resumos interativos',
      'Simulados completos e personalizados',
      'Painel tático de desempenho',
      'Cronograma de estudos com IA',
      'Acesso a toda legislação',
      'Suporte prioritário',
      'Atualizações em tempo real'
    ]
  },
  {
    id: 'price_yearly_premium',
    name: 'Premium Anual',
    price: 399.90,
    interval: 'year',
    popular: false,
    originalPrice: 598.80,
    discount: 33,
    features: [
      'Todos os recursos do Premium Mensal',
      'Desconto de 33% (economize R$ 198,90)',
      'Acesso vitalício às atualizações do ano',
      'Sessões de mentoria exclusivas',
      'Materiais extras e bônus',
      'Garantia de 30 dias'
    ]
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
    // Update URL
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('plan', plan.id);
    navigate({ search: newSearchParams.toString() }, { replace: true });
  };

  const handlePaymentSuccess = (paymentIntent: any) => {
    // In a real app, you would redirect to a success page or dashboard
    navigate('/dashboard');
  };

  const handlePaymentError = (error: string) => {
    console.error('Payment failed:', error);
    // Handle error (show notification, etc.)
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={handleBackToPlanSelection}
            className="mb-6 gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar aos Planos
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-bold text-primary-900 dark:text-white mb-4"
            >
              Escolha seu Plano
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-primary-600 dark:text-gray-300 max-w-2xl mx-auto"
            >
              Comece sua jornada rumo à aprovação com acesso completo à nossa plataforma
            </motion.p>
          </div>
        </div>
      </div>

      {/* Plans */}
      <div className="max-w-6xl mx-auto px-4 py-12">
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
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-primary-600 to-blue-600 text-white px-4 py-1">
                    <Star className="w-4 h-4 mr-1" />
                    Mais Popular
                  </Badge>
                </div>
              )}

              <Card className={`h-full ${plan.popular ? 'border-primary-500 shadow-lg scale-105' : ''}`}>
                <CardHeader className="text-center pb-8">
                  <div className="mb-4">
                    {plan.name.includes('Básico') && (
                      <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto">
                        <BookOpen className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                      </div>
                    )}
                    {plan.name.includes('Premium') && (
                      <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-blue-600 rounded-full flex items-center justify-center mx-auto">
                        <Crown className="w-6 h-6 text-white" />
                      </div>
                    )}
                  </div>

                  <CardTitle className="text-2xl font-bold text-primary-900 dark:text-white">
                    {plan.name}
                  </CardTitle>

                  <div className="mt-4">
                    {plan.originalPrice && (
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <span className="text-lg text-gray-500 dark:text-gray-400 line-through">
                          R$ {plan.originalPrice.toFixed(2)}
                        </span>
                        <Badge className="bg-green-100 text-green-800">
                          -{plan.discount}%
                        </Badge>
                      </div>
                    )}
                    <div className="flex items-baseline justify-center">
                      <span className="text-4xl font-bold text-primary-900 dark:text-white">
                        R$ {plan.price.toFixed(2)}
                      </span>
                      <span className="text-lg text-primary-600 dark:text-gray-400 ml-1">
                        /{plan.interval === 'month' ? 'mês' : 'ano'}
                      </span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-primary-700 dark:text-gray-300">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div className="pt-6">
                    <Button
                      onClick={() => handlePlanSelect(plan)}
                      className={`w-full py-3 ${
                        plan.popular
                          ? 'bg-gradient-to-r from-primary-600 to-blue-600 hover:from-primary-700 hover:to-blue-700'
                          : ''
                      }`}
                      variant={plan.popular ? 'default' : 'outline'}
                      size="lg"
                    >
                      {plan.popular ? 'Começar Agora' : 'Selecionar Plano'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Features Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-16"
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-center text-2xl font-bold text-primary-900 dark:text-white">
                Compare os Recursos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Brain className="w-6 h-6 text-blue-600" />
                  </div>
                  <h4 className="font-semibold text-primary-900 dark:text-white mb-2">
                    Banco de Questões
                  </h4>
                  <p className="text-sm text-primary-600 dark:text-gray-400">
                    Milhares de questões atualizadas de concursos anteriores
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Zap className="w-6 h-6 text-purple-600" />
                  </div>
                  <h4 className="font-semibold text-primary-900 dark:text-white mb-2">
                    Flashcards Inteligentes
                  </h4>
                  <p className="text-sm text-primary-600 dark:text-gray-400">
                    Sistema de repetição espaçada para memorização eficiente
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                    <FileText className="w-6 h-6 text-green-600" />
                  </div>
                  <h4 className="font-semibold text-primary-900 dark:text-white mb-2">
                    Resumos Interativos
                  </h4>
                  <p className="text-sm text-primary-600 dark:text-gray-400">
                    Conteúdo resumido com questões incorporadas
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Clock className="w-6 h-6 text-orange-600" />
                  </div>
                  <h4 className="font-semibold text-primary-900 dark:text-white mb-2">
                    Cronograma com IA
                  </h4>
                  <p className="text-sm text-primary-600 dark:text-gray-400">
                    Plano de estudos personalizado até a data da prova
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Security */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center"
        >
          <div className="flex items-center justify-center gap-6 text-sm text-primary-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-600" />
              <span>Pagamento 100% Seguro</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              <span>+10.000 Alunos Aprovados</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-600" />
              <span>Cancele Quando Quiser</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}