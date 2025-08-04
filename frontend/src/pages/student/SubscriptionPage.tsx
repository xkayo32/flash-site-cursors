import { useState } from 'react';
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
  Crown
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/utils/cn';
import { PageHeader } from '@/components/student';
import toast from 'react-hot-toast';

// Tipos
interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  priceYearly: number;
  currency: string;
  interval: 'monthly' | 'yearly';
  features: string[];
  limitations: string[];
  recommended?: boolean;
  badge?: string;
  color: string;
}

interface Subscription {
  id: string;
  planId: string;
  planName: string;
  status: 'active' | 'cancelled' | 'expired' | 'trial';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  trialEndsAt?: string;
  paymentMethod?: {
    type: 'card' | 'pix' | 'boleto';
    last4?: string;
    brand?: string;
  };
}

interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  description: string;
  downloadUrl?: string;
}

// Dados mockados
const plans: Plan[] = [
  {
    id: 'basic',
    name: 'OPERADOR BÁSICO',
    description: 'TREINAMENTO INICIAL PARA NOVOS RECRUTAS',
    price: 29.90,
    priceYearly: 299.00,
    currency: 'R$',
    interval: 'monthly',
    color: 'gray',
    features: [
      'ACESSO A ARSENAL BÁSICO DE QUESTÕES',
      '100 FLASHCARDS TÁTICOS/MÊS',
      '3 SIMULAÇÕES/MÊS',
      'RELATÓRIOS BÁSICOS DE DESEMPENHO',
      'SUPORTE POR COMUNICAÇÃO DIGITAL'
    ],
    limitations: [
      'SEM VIDEOAULAS TÁTICAS',
      'SEM RESUMOS INTERATIVOS',
      'SEM CRONOGRAMA PERSONALIZADO DE MISSÃO'
    ]
  },
  {
    id: 'pro',
    name: 'OPERADOR ELITE',
    description: 'PARA AGENTES ESPECIALIZADOS EM MISSÕES CRÍTICAS',
    price: 59.90,
    priceYearly: 599.00,
    currency: 'R$',
    interval: 'monthly',
    color: 'blue',
    recommended: true,
    badge: 'MAIS REQUISITADO',
    features: [
      'ACESSO TOTAL AO ARSENAL DE QUESTÕES',
      'FLASHCARDS TÁTICOS ILIMITADOS',
      'SIMULAÇÕES DE OPERAÇÃO ILIMITADAS',
      'VIDEOAULAS TÁTICAS EM HD',
      'RESUMOS INTERATIVOS DE INTELIGÊNCIA',
      'CRONOGRAMA COM IA MILITAR',
      'RELATÓRIOS AVANÇADOS DE DESEMPENHO',
      'SUPORTE PRIORITÁRIO DE COMANDO'
    ],
    limitations: [
      'SEM MENTORIA INDIVIDUAL DE COMANDANTE',
      'SEM CORREÇÃO DE REDAÇÃO TÁTICA'
    ]
  },
  {
    id: 'premium',
    name: 'COMANDANTE VIP',
    description: 'OPERAÇÃO COMPLETA COM MENTORIA DE COMANDANTE',
    price: 99.90,
    priceYearly: 999.00,
    currency: 'R$',
    interval: 'monthly',
    color: 'purple',
    badge: 'COMANDO VIP',
    features: [
      'TODOS OS RECURSOS DO OPERADOR ELITE',
      'MENTORIA INDIVIDUAL MENSAL COM COMANDANTE',
      '5 CORREÇÕES DE REDAÇÃO TÁTICA/MÊS',
      'ACESSO ANTECIPADO A NOVOS ARMAMENTOS',
      'GRUPO VIP DE COMANDO NO WHATSAPP',
      'BRIEFINGS EXCLUSIVOS AO VIVO',
      'MATERIAL TÁTICO EM PDF',
      'CERTIFICADO DE CONCLUSÃO DE MISSÃO',
      'SUPORTE VIP DE COMANDO 24/7'
    ],
    limitations: []
  }
];

const currentSubscription: Subscription = {
  id: '1',
  planId: 'pro',
  planName: 'OPERADOR ELITE',
  status: 'active',
  currentPeriodStart: '2024-01-01',
  currentPeriodEnd: '2024-02-01',
  cancelAtPeriodEnd: false,
  paymentMethod: {
    type: 'card',
    last4: '4242',
    brand: 'Visa'
  }
};

const invoices: Invoice[] = [
  {
    id: '1',
    date: '2024-01-01',
    amount: 59.90,
    status: 'paid',
    description: 'OPERADOR ELITE - Janeiro 2024',
    downloadUrl: '#'
  },
  {
    id: '2',
    date: '2023-12-01',
    amount: 59.90,
    status: 'paid',
    description: 'OPERADOR ELITE - Dezembro 2023',
    downloadUrl: '#'
  },
  {
    id: '3',
    date: '2023-11-01',
    amount: 59.90,
    status: 'paid',
    description: 'OPERADOR ELITE - Novembro 2023',
    downloadUrl: '#'
  }
];

export default function SubscriptionPage() {
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);

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
        <div className="mt-0.5 p-1 rounded-full bg-green-100">
          <Check className="w-3 h-3 text-green-600" />
        </div>
      ) : (
        <div className="mt-0.5 p-1 rounded-full bg-red-100">
          <X className="w-3 h-3 text-red-600" />
        </div>
      )}
      <span className={cn(
        "text-sm",
        included ? "text-primary-700" : "text-primary-400 line-through"
      )}>
        {feature}
      </span>
    </div>
  );

  // Card de plano
  const PlanCard = ({ plan }: { plan: Plan }) => {
    const isCurrentPlan = currentSubscription.planId === plan.id;
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
          "h-full transition-all duration-300",
          plan.recommended && "border-primary-500 shadow-xl",
          isCurrentPlan && "border-green-500",
          "hover:shadow-lg"
        )}>
          {/* Badge */}
          {plan.badge && (
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-primary-600 text-white px-4 py-1">
                {plan.badge}
              </Badge>
            </div>
          )}

          {isCurrentPlan && (
            <div className="absolute -top-3 right-4">
              <Badge className="bg-green-500 text-white px-3 py-1">
                Plano Atual
              </Badge>
            </div>
          )}

          <CardContent className="p-6">
            {/* Header */}
            <div className="text-center mb-6">
              <div className={cn(
                "w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center",
                plan.color === 'gray' && "bg-gray-100",
                plan.color === 'blue' && "bg-blue-100",
                plan.color === 'purple' && "bg-purple-100"
              )}>
                {plan.name === 'Básico' && <Zap className="w-8 h-8 text-gray-600" />}
                {plan.name === 'Pro' && <Star className="w-8 h-8 text-blue-600" />}
                {plan.name === 'Premium' && <Crown className="w-8 h-8 text-purple-600" />}
              </div>

              <h3 className="text-2xl font-bold text-primary-900 mb-2 font-police-title uppercase tracking-wider">{plan.name}</h3>
              <p className="text-primary-600 text-sm mb-4 font-police-body uppercase tracking-wider">{plan.description}</p>

              {/* Preço */}
              <div className="mb-4">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-lg text-primary-600">{plan.currency}</span>
                  <span className="text-4xl font-bold text-primary-900">{price.toFixed(2)}</span>
                  <span className="text-primary-600">
                    /{billingInterval === 'yearly' ? 'ano' : 'mês'}
                  </span>
                </div>
                
                {billingInterval === 'yearly' && savings > 0 && (
                  <p className="text-sm text-green-600 mt-1">
                    Economize R$ {savings.toFixed(2)} por ano
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
              <Button variant="outline" className="w-full font-police-body uppercase tracking-wider" disabled>
                NÍVEL ATUAL
              </Button>
            ) : (
              <Button 
                className={cn(
                  "w-full",
                  plan.recommended && "bg-primary-600 hover:bg-primary-700"
                )}
                onClick={() => {
                  toast.success('SELECIONANDO NÍVEL OPERACIONAL!', { icon: '✨' });
                  setSelectedPlan(plan.id);
                }}
              >
                {currentSubscription.planId && 
                 plans.findIndex(p => p.id === plan.id) > plans.findIndex(p => p.id === currentSubscription.planId)
                  ? 'FAZER UPGRADE' : 'SELECIONAR NÍVEL'}
              </Button>
            )}
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="p-6">
      <PageHeader
        title="COMANDO DE ASSINATURAS"
        subtitle="SELECIONE SEU NÍVEL OPERACIONAL PARA MISSÕES DE ELITE"
        icon={Crown}
        breadcrumbs={[
          { label: 'DASHBOARD', href: '/student/dashboard' },
          { label: 'ASSINATURA' }
        ]}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {/* Status da assinatura atual */}
        {currentSubscription && (
          <Card className="mb-6 bg-gradient-to-r from-primary-50 to-primary-100 border-primary-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-primary-900 font-police-title uppercase tracking-wider">
                      NÍVEL {currentSubscription.planName}
                    </h3>
                    <Badge className={cn(
                      currentSubscription.status === 'active' && "bg-green-100 text-green-700",
                      currentSubscription.status === 'trial' && "bg-blue-100 text-blue-700",
                      currentSubscription.status === 'cancelled' && "bg-red-100 text-red-700"
                    )}>
                      {currentSubscription.status === 'active' && 'OPERACIONAL'}
                      {currentSubscription.status === 'trial' && 'TESTE DE CAMPO'}
                      {currentSubscription.status === 'cancelled' && 'DESATIVADO'}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-6 text-sm text-primary-600">
                    <span className="flex items-center gap-1 font-police-body uppercase tracking-wider">
                      <Calendar className="w-4 h-4" />
                      PRÓXIMA MISSÃO: {new Date(currentSubscription.currentPeriodEnd).toLocaleDateString('pt-BR')}
                    </span>
                    {currentSubscription.paymentMethod && (
                      <span className="flex items-center gap-1">
                        <CreditCard className="w-4 h-4" />
                        {currentSubscription.paymentMethod.brand} ****{currentSubscription.paymentMethod.last4}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="font-police-body uppercase tracking-wider"
                    onClick={() => toast.success('ACESSANDO CONFIGURAÇÕES DE PAGAMENTO!', { icon: '💳' })}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    ALTERAR PAGAMENTO
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-red-600 hover:bg-red-50 font-police-body uppercase tracking-wider"
                    onClick={() => setShowCancelModal(true)}
                  >
                    CANCELAR OPERAÇÃO
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </motion.div>

      {/* Toggle de período */}
      <div className="flex justify-center mb-8">
        <div className="bg-gray-100 p-1 rounded-lg inline-flex">
          <button
            className={cn(
              "px-6 py-2 rounded-md text-sm font-medium transition-all",
              billingInterval === 'monthly' 
                ? "bg-white text-primary-900 shadow-sm" 
                : "text-primary-600"
            )}
            onClick={() => setBillingInterval('monthly')}
          >
            MENSAL
          </button>
          <button
            className={cn(
              "px-6 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2",
              billingInterval === 'yearly' 
                ? "bg-white text-primary-900 shadow-sm" 
                : "text-primary-600"
            )}
            onClick={() => setBillingInterval('yearly')}
          >
            ANUAL
            <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 font-police-body">
              ECONOMIZE 20%
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
      <Card className="mb-12">
        <CardHeader>
          <h2 className="text-2xl font-bold text-primary-900 font-police-title uppercase tracking-wider">COMPARAÇÃO COMPLETA DE NÍVEIS</h2>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-police-body uppercase tracking-wider">RECURSOS TÁTICOS</th>
                  {plans.map(plan => (
                    <th key={plan.id} className="text-center py-3 px-4">
                      <div className="font-bold text-primary-900 font-police-title">{plan.name}</div>
                      <div className="text-sm text-primary-600 font-normal">
                        R$ {plan.price}/mês
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-4 px-4 font-police-body">ARSENAL DE QUESTÕES</td>
                  <td className="text-center py-4 px-4">100/mês</td>
                  <td className="text-center py-4 px-4">Ilimitadas</td>
                  <td className="text-center py-4 px-4">Ilimitadas</td>
                </tr>
                <tr className="border-b bg-gray-50">
                  <td className="py-4 px-4 font-police-body">FLASHCARDS TÁTICOS</td>
                  <td className="text-center py-4 px-4">100/mês</td>
                  <td className="text-center py-4 px-4">Ilimitados</td>
                  <td className="text-center py-4 px-4">Ilimitados</td>
                </tr>
                <tr className="border-b">
                  <td className="py-4 px-4 font-police-body">SIMULAÇÕES</td>
                  <td className="text-center py-4 px-4">3/mês</td>
                  <td className="text-center py-4 px-4">Ilimitados</td>
                  <td className="text-center py-4 px-4">Ilimitados</td>
                </tr>
                <tr className="border-b bg-gray-50">
                  <td className="py-4 px-4 font-police-body">VIDEOAULAS TÁTICAS</td>
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
                <tr className="border-b">
                  <td className="py-4 px-4 font-police-body">MENTORIA DE COMANDANTE</td>
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
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-primary-900 font-police-title uppercase tracking-wider">HISTÓRICO DE OPERAÇÕES FINANCEIRAS</h2>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2 font-police-body uppercase tracking-wider"
              onClick={() => toast.success('BAIXANDO RELATÓRIOS!', { icon: '📎' })}
            >
              <Download className="w-4 h-4" />
              BAIXAR TODAS
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {invoices.map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <Receipt className="w-5 h-5 text-primary-600" />
                  <div>
                    <p className="font-medium text-primary-900">{invoice.description}</p>
                    <p className="text-sm text-primary-600">
                      {new Date(invoice.date).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-medium text-primary-900">R$ {invoice.amount.toFixed(2)}</p>
                    <Badge className={cn(
                      "text-xs",
                      invoice.status === 'paid' && "bg-green-100 text-green-700",
                      invoice.status === 'pending' && "bg-yellow-100 text-yellow-700",
                      invoice.status === 'failed' && "bg-red-100 text-red-700"
                    )}>
                      {invoice.status === 'paid' && 'PAGO'}
                      {invoice.status === 'pending' && 'PENDENTE'}
                      {invoice.status === 'failed' && 'FALHOU'}
                    </Badge>
                  </div>
                  
                  {invoice.downloadUrl && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => toast.success('DOWNLOAD INICIADO!', { icon: '📥' })}
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
        className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-8 text-white text-center"
      >
        <Gift className="w-12 h-12 mx-auto mb-4 text-accent-400" />
        <h2 className="text-2xl font-bold mb-2 font-police-title uppercase tracking-wider">
          RECRUTE AGENTES E GANHE BENEFÍCIOS!
        </h2>
        <p className="text-primary-100 mb-6 max-w-2xl mx-auto font-police-body">
          A CADA AGENTE RECRUTADO COM SEU CÓDIGO, VOCÊ GANHA 1 MÊS GRÁTIS E ELE GANHA 20% DE DESCONTO
        </p>
        <div className="flex gap-3 justify-center">
          <Button 
            variant="secondary" 
            size="lg"
            className="font-police-body uppercase tracking-wider"
            onClick={() => toast.success('SISTEMA DE RECRUTAMENTO ATIVADO!', { icon: '👥' })}
          >
            <Users className="w-5 h-5 mr-2" />
            RECRUTAR AGENTES
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            className="border-white text-white hover:bg-white hover:text-primary-700 font-police-body uppercase tracking-wider"
            onClick={() => toast.info('DETALHES DO PROGRAMA DE RECRUTAMENTO', { icon: 'ℹ️' })}
          >
            <Info className="w-5 h-5 mr-2" />
            INTELÊNCIA
          </Button>
        </div>
      </motion.div>

      {/* Modal de cancelamento */}
      <AnimatePresence>
        {showCancelModal && (
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
              className="bg-white rounded-lg p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-primary-900 mb-2 font-police-title uppercase tracking-wider">
                  CONFIRMAR CANCELAMENTO DE OPERAÇÃO?
                </h3>
                <p className="text-primary-600 font-police-body">
                  VOCÊ PERDERÁ ACESSO A TODOS OS RECURSOS TÁTICOS AO FINAL DO PERÍODO ATUAL
                </p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-primary-700 mb-2 font-police-body uppercase tracking-wider">ACESSO MANTIDO ATÉ:</p>
                <p className="font-bold text-primary-900">
                  {new Date(currentSubscription.currentPeriodEnd).toLocaleDateString('pt-BR')}
                </p>
              </div>
              
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 font-police-body uppercase tracking-wider"
                  onClick={() => setShowCancelModal(false)}
                >
                  MANTER OPERAÇÃO
                </Button>
                <Button
                  className="flex-1 bg-red-600 hover:bg-red-700 font-police-body uppercase tracking-wider"
                  onClick={() => {
                    toast.success('OPERAÇÃO CANCELADA!', {
                      description: 'Sua assinatura será cancelada ao final do período',
                      icon: '⚠️'
                    });
                    setShowCancelModal(false);
                  }}
                >
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