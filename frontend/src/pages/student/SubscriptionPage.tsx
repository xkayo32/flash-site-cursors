import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCard,
  Check,
  X,
  Star,
  Zap,
  Shield,
  Clock,
  Calendar,
  Download,
  AlertCircle,
  ChevronRight,
  Trophy,
  Sparkles,
  Lock,
  Unlock,
  RefreshCw,
  Receipt,
  ArrowRight,
  Info,
  Gift,
  TrendingUp,
  Users,
  Crown,
  Target,
  Crosshair,
  AlertTriangle,
  Award,
  Swords,
  ShieldCheck,
  Flag
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/utils/cn';
import { PageHeader } from '@/components/student';
import toast from 'react-hot-toast';
import paymentService, { Plan, Subscription, PaymentHistory, PaymentMethod } from '@/services/paymentService';

// Tipos locais adicionais
interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  description: string;
  downloadUrl?: string;
}


export default function SubscriptionPage() {
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  
  // Estados para dados da API
  const [plans, setPlans] = useState<Plan[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null);
  const [invoices, setInvoices] = useState<PaymentHistory[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carregar dados da API
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [plansData, subscriptionData, historyData, methodsData] = await Promise.allSettled([
          paymentService.getPlans(),
          paymentService.getSubscription(),
          paymentService.getPaymentHistory(1, 10),
          paymentService.getPaymentMethods()
        ]);

        if (plansData.status === 'fulfilled') {
          setPlans(plansData.value);
        } else {
          console.error('Erro ao carregar planos:', plansData.reason);
        }

        if (subscriptionData.status === 'fulfilled') {
          setCurrentSubscription(subscriptionData.value);
        } else {
          console.error('Erro ao carregar assinatura:', subscriptionData.reason);
        }

        if (historyData.status === 'fulfilled') {
          setInvoices(historyData.value.data || []);
        } else {
          console.error('Erro ao carregar histórico:', historyData.reason);
        }

        if (methodsData.status === 'fulfilled') {
          setPaymentMethods(methodsData.value);
        } else {
          console.error('Erro ao carregar métodos de pagamento:', methodsData.reason);
        }

      } catch (err) {
        console.error('Erro geral ao carregar dados:', err);
        setError('Erro ao carregar dados operacionais');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Função para assinar um plano
  const handleSubscribeToPlan = async (planId: string) => {
    try {
      if (paymentMethods.length === 0) {
        toast.error('ADICIONE UM MÉTODO DE PAGAMENTO PRIMEIRO!', { icon: '💳' });
        return;
      }

      const defaultPaymentMethod = paymentMethods.find(pm => pm.is_default) || paymentMethods[0];
      
      setLoading(true);
      await paymentService.subscribe({
        plan_id: planId,
        payment_method_id: defaultPaymentMethod.id,
        interval: billingInterval
      });

      toast.success('PLANO OPERACIONAL ATIVADO!', { icon: '🎯' });
      
      // Recarregar dados
      const [newSubscription, newHistory] = await Promise.all([
        paymentService.getSubscription(),
        paymentService.getPaymentHistory(1, 10)
      ]);
      
      setCurrentSubscription(newSubscription);
      setInvoices(newHistory.data || []);
      
    } catch (error: any) {
      console.error('Erro ao assinar plano:', error);
      toast.error(error.message || 'FALHA NA ATIVAÇÃO DO PLANO', { icon: '❌' });
    } finally {
      setLoading(false);
    }
  };

  // Função para cancelar assinatura
  const handleCancelSubscription = async () => {
    try {
      setLoading(true);
      await paymentService.cancelSubscription();
      
      toast.error('PLANO OPERACIONAL CANCELADO!', {
        description: 'Acesso será encerrado ao final do período',
        icon: '🚫'
      });
      
      // Recarregar assinatura
      const updatedSubscription = await paymentService.getSubscription();
      setCurrentSubscription(updatedSubscription);
      
    } catch (error: any) {
      console.error('Erro ao cancelar assinatura:', error);
      toast.error(error.message || 'FALHA NO CANCELAMENTO', { icon: '❌' });
    } finally {
      setLoading(false);
      setShowCancelModal(false);
    }
  };

  // Calcular economia anual
  const calculateYearlySavings = (plan: Plan) => {
    const monthlyTotal = plan.price * 12;
    const yearlyTotal = plan.priceYearly;
    return monthlyTotal - yearlyTotal;
  };

  // Componente de recurso
  const FeatureItem = ({ feature, included }: { feature: string; included: boolean }) => (
    <div className="flex items-start gap-3">
      {included ? (
        <div className="mt-0.5 p-1 rounded-full bg-green-500/20 dark:bg-green-500/10">
          <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
        </div>
      ) : (
        <div className="mt-0.5 p-1 rounded-full bg-red-500/20 dark:bg-red-500/10">
          <X className="w-3 h-3 text-red-600 dark:text-red-400" />
        </div>
      )}
      <span className={cn(
        "text-sm font-police-body",
        included ? "text-gray-700 dark:text-gray-300" : "text-gray-400 dark:text-gray-600 line-through"
      )}>
        {feature}
      </span>
    </div>
  );

  // Card de plano
  const PlanCard = ({ plan }: { plan: Plan }) => {
    const isCurrentPlan = currentSubscription?.plan_id?.includes(plan.id) || false;
    const price = billingInterval === 'yearly' ? plan.priceYearly : plan.price;
    const savings = billingInterval === 'yearly' ? calculateYearlySavings(plan) : 0;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -5 }}
        transition={{ duration: 0.3 }}
        className={cn(
          "relative",
          plan.recommended && "lg:-mt-4"
        )}
      >
        <Card className={cn(
          "h-full transition-all duration-300 bg-white dark:bg-gray-800 border",
          plan.recommended && "border-accent-500 shadow-xl ring-2 ring-accent-500/20",
          isCurrentPlan && "border-green-500 dark:border-green-400",
          !plan.recommended && !isCurrentPlan && "border-gray-200 dark:border-gray-700",
          "hover:shadow-lg dark:hover:shadow-gray-900/50"
        )}>
          {/* Badge */}
          {plan.badge && (
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-accent-500 text-black px-4 py-1 font-police-body uppercase tracking-wider">
                <Star className="w-3 h-3 mr-1 inline" />
                {plan.badge}
              </Badge>
            </div>
          )}

          {isCurrentPlan && (
            <div className="absolute -top-3 right-4">
              <Badge className="bg-green-500 dark:bg-green-400 text-white dark:text-black px-3 py-1 font-police-body">
                <Lock className="w-3 h-3 mr-1 inline" />
                ATIVO
              </Badge>
            </div>
          )}

          <CardContent className="p-6">
            {/* Header */}
            <div className="text-center mb-6">
              <div className={cn(
                "w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center",
                plan.color === 'gray' && "bg-gray-100 dark:bg-gray-800",
                plan.color === 'blue' && "bg-blue-100 dark:bg-blue-900/20",
                plan.color === 'purple' && "bg-purple-100 dark:bg-purple-900/20"
              )}>
                {plan.id === 'basic' && <Shield className="w-8 h-8 text-gray-600 dark:text-gray-400" />}
                {plan.id === 'pro' && <Target className="w-8 h-8 text-blue-600 dark:text-blue-400" />}
                {plan.id === 'premium' && <Swords className="w-8 h-8 text-purple-600 dark:text-purple-400" />}
              </div>

              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 font-police-title uppercase tracking-wider">{plan.name}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 font-police-body uppercase tracking-wider">{plan.description}</p>

              {/* Preço */}
              <div className="mb-4">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-lg text-gray-600 dark:text-gray-400">{plan.currency}</span>
                  <span className="text-4xl font-bold text-gray-900 dark:text-white font-police-numbers">{price.toFixed(2)}</span>
                  <span className="text-gray-600 dark:text-gray-400 font-police-body">
                    /{billingInterval === 'yearly' ? 'ANO' : 'MÊS'}
                  </span>
                </div>
                
                {billingInterval === 'yearly' && savings > 0 && (
                  <p className="text-sm text-green-600 dark:text-green-400 mt-1 font-police-body">
                    ECONOMIA DE R$ {savings.toFixed(2)}/ANO
                  </p>
                )}
              </div>
            </div>

            {/* Features */}
            <div className="space-y-3 mb-6">
              {plan.features.map((feature, idx) => (
                <FeatureItem key={idx} feature={feature} included={true} />
              ))}
              {plan.limitations.map((limitation, idx) => (
                <FeatureItem key={`lim-${idx}`} feature={limitation} included={false} />
              ))}
            </div>

            {/* Button */}
            {isCurrentPlan ? (
              <Button 
                variant="outline" 
                className="w-full font-police-body uppercase tracking-wider bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600" 
                disabled
              >
                <Lock className="w-4 h-4 mr-2" />
                PLANO ATIVO
              </Button>
            ) : (
              <Button 
                className={cn(
                  "w-full font-police-body uppercase tracking-wider",
                  plan.recommended 
                    ? "bg-accent-500 hover:bg-accent-600 dark:bg-gray-100 dark:hover:bg-accent-650 text-black dark:text-black dark:hover:text-white"
                    : "bg-gray-900 hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600"
                )}
                onClick={() => handleSubscribeToPlan(plan.id)}
                disabled={loading}
              >
                {currentSubscription?.plan_id && 
                 plans.findIndex(p => p.id === plan.id) > plans.findIndex(p => p.id === currentSubscription.plan_id.split('_')[0]) ? (
                  <>
                    <ArrowRight className="w-4 h-4 mr-2" />
                    AVANÇAR NÍVEL
                  </>
                ) : (
                  <>
                    <Unlock className="w-4 h-4 mr-2" />
                    ATIVAR PLANO
                  </>
                )}
              </Button>
            )}
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  // Loading state
  if (loading && plans.length === 0) {
    return (
      <div className="p-6">
        <PageHeader
          title="PLANO OPERACIONAL"
          subtitle="CARREGANDO ARSENAIS TÁTICOS..."
          icon={ShieldCheck}
          breadcrumbs={[
            { label: 'PAINEL DE COMANDO', href: '/student/dashboard' },
            { label: 'PLANO OPERACIONAL' }
          ]}
        />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-accent-500/30 border-t-accent-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400 font-police-body uppercase tracking-wider">
              CARREGANDO DADOS OPERACIONAIS...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6">
        <PageHeader
          title="PLANO OPERACIONAL"
          subtitle="ERRO NO SISTEMA DE ARSENAIS TÁTICOS"
          icon={ShieldCheck}
          breadcrumbs={[
            { label: 'PAINEL DE COMANDO', href: '/student/dashboard' },
            { label: 'PLANO OPERACIONAL' }
          ]}
        />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 dark:text-red-400 font-police-body uppercase tracking-wider mb-4">
              {error}
            </p>
            <Button 
              onClick={() => window.location.reload()} 
              className="bg-accent-500 hover:bg-accent-600 text-black font-police-body uppercase"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              TENTAR NOVAMENTE
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <PageHeader
        title="PLANO OPERACIONAL"
        subtitle="SELECIONE SEU NÍVEL DE AUTORIZAÇÃO PARA ACESSO AOS ARSENAIS TÁTICOS"
        icon={ShieldCheck}
        breadcrumbs={[
          { label: 'PAINEL DE COMANDO', href: '/student/dashboard' },
          { label: 'PLANO OPERACIONAL' }
        ]}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {/* Status da assinatura atual */}
        {currentSubscription && (
          <Card className="mb-6 bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-700 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-white font-police-title uppercase tracking-wider">
                      {currentSubscription.plan_name}
                    </h3>
                    <Badge className={cn(
                      currentSubscription.status === 'active' && "bg-green-500/20 text-green-400 border-green-500/50",
                      currentSubscription.status === 'trial' && "bg-blue-500/20 text-blue-400 border-blue-500/50",
                      currentSubscription.status === 'cancelled' && "bg-red-500/20 text-red-400 border-red-500/50"
                    )}>
                      {currentSubscription.status === 'active' && '● ATIVO'}
                      {currentSubscription.status === 'trial' && '● PERÍODO DE TESTE'}
                      {currentSubscription.status === 'cancelled' && '● DESATIVADO'}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-6 text-sm text-gray-400">
                    <span className="flex items-center gap-2 font-police-body uppercase tracking-wider">
                      <Clock className="w-4 h-4 text-accent-500" />
                      RENOVAÇÃO: {new Date(currentSubscription.current_period_end).toLocaleDateString('pt-BR')}
                    </span>
                    {currentSubscription.payment_method && (
                      <span className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-gray-500" />
                        {currentSubscription.payment_method.brand} ****{currentSubscription.payment_method.last4}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="font-police-body uppercase tracking-wider border-gray-600 text-gray-300 hover:bg-gray-700"
                    onClick={() => toast.success('ABRINDO CENTRAL DE PAGAMENTOS!', { icon: '💳' })}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    ALTERAR FORMA DE PAGAMENTO
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-red-400 border-red-500/50 hover:bg-red-500/10 font-police-body uppercase tracking-wider"
                    onClick={() => setShowCancelModal(true)}
                    disabled={loading}
                  >
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    CANCELAR PLANO
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </motion.div>

      {/* Toggle de período */}
      <div className="flex justify-center mb-8">
        <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-lg inline-flex border border-gray-200 dark:border-gray-700">
          <button
            className={cn(
              "px-6 py-2 rounded-md text-sm font-medium transition-all font-police-body uppercase tracking-wider",
              billingInterval === 'monthly' 
                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm" 
                : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            )}
            onClick={() => setBillingInterval('monthly')}
          >
            PAGAMENTO MENSAL
          </button>
          <button
            className={cn(
              "px-6 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 font-police-body uppercase tracking-wider",
              billingInterval === 'yearly' 
                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm" 
                : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            )}
            onClick={() => setBillingInterval('yearly')}
          >
            PAGAMENTO ANUAL
            <Badge className="text-xs bg-green-500/20 text-green-500 dark:text-green-400 border-green-500/50 font-police-body">
              -20% DESCONTO
            </Badge>
          </button>
        </div>
      </div>

      {/* Grid de planos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {plans.map((plan) => (
          <PlanCard key={plan.id} plan={plan} />
        ))}
      </div>

      {/* Comparação de recursos */}
      <Card className="mb-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white font-police-title uppercase tracking-wider flex items-center gap-3">
            <Crosshair className="w-6 h-6 text-accent-500" />
            COMPARATIVO DE ARSENAIS TÁTICOS
          </h2>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900">
                  <th className="text-left py-4 px-6 font-police-body uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    RECURSOS OPERACIONAIS
                  </th>
                  {plans.map(plan => (
                    <th key={plan.id} className="text-center py-4 px-4">
                      <div className="font-bold text-gray-900 dark:text-white font-police-title uppercase">{plan.name}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 font-normal font-police-body">
                        R$ {plan.price}/mês
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="py-4 px-6 font-police-body text-gray-700 dark:text-gray-300">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-accent-500" />
                      BANCO DE QUESTÕES
                    </div>
                  </td>
                  <td className="text-center py-4 px-4 text-gray-600 dark:text-gray-400">100/mês</td>
                  <td className="text-center py-4 px-4 text-gray-600 dark:text-gray-400">Ilimitado</td>
                  <td className="text-center py-4 px-4 text-gray-600 dark:text-gray-400">Ilimitado</td>
                </tr>
                <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                  <td className="py-4 px-6 font-police-body text-gray-700 dark:text-gray-300">
                    <div className="flex items-center gap-2">
                      <Flag className="w-4 h-4 text-accent-500" />
                      FLASHCARDS TÁTICOS
                    </div>
                  </td>
                  <td className="text-center py-4 px-4 text-gray-600 dark:text-gray-400">100/mês</td>
                  <td className="text-center py-4 px-4 text-gray-600 dark:text-gray-400">Ilimitados</td>
                  <td className="text-center py-4 px-4 text-gray-600 dark:text-gray-400">Ilimitados</td>
                </tr>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="py-4 px-6 font-police-body text-gray-700 dark:text-gray-300">
                    <div className="flex items-center gap-2">
                      <Crosshair className="w-4 h-4 text-accent-500" />
                      SIMULADOS DE COMBATE
                    </div>
                  </td>
                  <td className="text-center py-4 px-4 text-gray-600 dark:text-gray-400">3/mês</td>
                  <td className="text-center py-4 px-4 text-gray-600 dark:text-gray-400">Ilimitados</td>
                  <td className="text-center py-4 px-4 text-gray-600 dark:text-gray-400">Ilimitados</td>
                </tr>
                <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                  <td className="py-4 px-6 font-police-body text-gray-700 dark:text-gray-300">
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-accent-500" />
                      TREINAMENTO EM VÍDEO
                    </div>
                  </td>
                  <td className="text-center py-4 px-4">
                    <X className="w-5 h-5 text-red-500 mx-auto" />
                  </td>
                  <td className="text-center py-4 px-4">
                    <Check className="w-5 h-5 text-green-500 mx-auto" />
                  </td>
                  <td className="text-center py-4 px-4">
                    <Check className="w-5 h-5 text-green-500 mx-auto" />
                  </td>
                </tr>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="py-4 px-6 font-police-body text-gray-700 dark:text-gray-300">
                    <div className="flex items-center gap-2">
                      <Swords className="w-4 h-4 text-accent-500" />
                      MENTORIA INDIVIDUAL
                    </div>
                  </td>
                  <td className="text-center py-4 px-4">
                    <X className="w-5 h-5 text-red-500 mx-auto" />
                  </td>
                  <td className="text-center py-4 px-4">
                    <X className="w-5 h-5 text-red-500 mx-auto" />
                  </td>
                  <td className="text-center py-4 px-4">
                    <Check className="w-5 h-5 text-green-500 mx-auto" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Histórico de faturas */}
      <Card className="mb-8 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white font-police-title uppercase tracking-wider flex items-center gap-3">
              <Receipt className="w-6 h-6 text-accent-500" />
              REGISTRO DE OPERAÇÕES FINANCEIRAS
            </h2>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2 font-police-body uppercase tracking-wider border-gray-300 dark:border-gray-600"
              onClick={() => toast.success('COMPILANDO RELATÓRIOS!', { icon: '📊' })}
            >
              <Download className="w-4 h-4" />
              EXPORTAR TUDO
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-3">
            {invoices.map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <Receipt className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white font-police-body">{invoice.description}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(invoice.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-bold text-gray-900 dark:text-white font-police-numbers">R$ {invoice.amount.toFixed(2)}</p>
                    <Badge className={cn(
                      "text-xs font-police-body",
                      invoice.status === 'succeeded' && "bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/50",
                      invoice.status === 'pending' && "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-500/50",
                      invoice.status === 'failed' && "bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/50"
                    )}>
                      {invoice.status === 'succeeded' && '● QUITADO'}
                      {invoice.status === 'pending' && '● PROCESSANDO'}
                      {invoice.status === 'failed' && '● FALHA'}
                    </Badge>
                  </div>
                  
                  {invoice.invoice_id && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="border-gray-300 dark:border-gray-600"
                      onClick={() => toast.success('BAIXANDO COMPROVANTE!', { icon: '📄' })}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Benefícios adicionais */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 rounded-2xl p-8 text-white text-center overflow-hidden border border-gray-700"
      >
        {/* Padrão tático de fundo */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)`
          }} />
        </div>
        
        <div className="relative z-10">
          <div className="w-16 h-16 mx-auto mb-4 bg-accent-500/20 rounded-full flex items-center justify-center">
            <Users className="w-8 h-8 text-accent-500" />
          </div>
          <h2 className="text-2xl font-bold mb-2 font-police-title uppercase tracking-wider">
            PROGRAMA DE RECRUTAMENTO TÁTICO
          </h2>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto font-police-body uppercase">
            CONVOQUE NOVOS AGENTES PARA A MISSÃO. CADA RECRUTAMENTO BEM-SUCEDIDO RENDE 1 MÊS DE OPERAÇÃO GRATUITA
          </p>
          <div className="flex gap-3 justify-center">
            <Button 
              size="lg"
              className="font-police-body uppercase tracking-wider bg-accent-500 hover:bg-accent-600 text-black"
              onClick={() => toast.success('PROTOCOLO DE RECRUTAMENTO INICIADO!', { icon: '🎯' })}
            >
              <Target className="w-5 h-5 mr-2" />
              INICIAR RECRUTAMENTO
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="border-gray-600 text-gray-300 hover:bg-gray-700 font-police-body uppercase tracking-wider"
              onClick={() => toast.info('ACESSANDO BRIEFING DE RECRUTAMENTO', { icon: '📋' })}
            >
              <Info className="w-5 h-5 mr-2" />
              VER DETALHES
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Modal de cancelamento */}
      <AnimatePresence>
        {showCancelModal && currentSubscription && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setShowCancelModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full border border-gray-200 dark:border-gray-700"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 font-police-title uppercase tracking-wider">
                  ABORTAR MISSÃO OPERACIONAL?
                </h3>
                <p className="text-gray-600 dark:text-gray-400 font-police-body uppercase">
                  TODOS OS ARSENAIS TÁTICOS SERÃO BLOQUEADOS AO FINAL DO CICLO ATUAL
                </p>
              </div>
              
              <div className="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 font-police-body uppercase tracking-wider">
                  <Clock className="w-4 h-4 inline mr-1 text-accent-500" />
                  ACESSO GARANTIDO ATÉ:
                </p>
                <p className="font-bold text-gray-900 dark:text-white font-police-numbers text-lg">
                  {new Date(currentSubscription.current_period_end).toLocaleDateString('pt-BR')}
                </p>
              </div>
              
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 font-police-body uppercase tracking-wider border-gray-300 dark:border-gray-600"
                  onClick={() => setShowCancelModal(false)}
                >
                  <Shield className="w-4 h-4 mr-2" />
                  MANTER PLANO
                </Button>
                <Button
                  className="flex-1 bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 font-police-body uppercase tracking-wider"
                  onClick={handleCancelSubscription}
                  disabled={loading}
                >
                  <X className="w-4 h-4 mr-2" />
                  CONFIRMAR CANCELAMENTO
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}