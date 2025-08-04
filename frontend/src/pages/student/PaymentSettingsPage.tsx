import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCard,
  Plus,
  Trash2,
  Star,
  Shield,
  AlertCircle,
  CheckCircle,
  Calendar,
  DollarSign,
  Settings,
  Bell,
  Receipt,
  Download,
  Eye,
  MoreVertical,
  Edit,
  X,
  Save
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { PageHeader } from '@/components/student';
import toast from 'react-hot-toast';

// Mock data for payment methods
const mockPaymentMethods = [
  {
    id: '1',
    type: 'card',
    brand: 'visa',
    last4: '4242',
    expiryMonth: 12,
    expiryYear: 2025,
    isDefault: true,
    nickname: 'CARTÃO DE COMANDO PRINCIPAL'
  },
  {
    id: '2',
    type: 'card',
    brand: 'mastercard',
    last4: '5555',
    expiryMonth: 8,
    expiryYear: 2026,
    isDefault: false,
    nickname: 'CARTÃO DE RESERVA TÁTICA'
  }
];

// Mock data for payment history
const mockPaymentHistory = [
  {
    id: 'pay_1',
    amount: 49.90,
    currency: 'BRL',
    status: 'succeeded',
    date: '2024-01-15',
    description: 'OPERAÇÃO MENSAL - NÍVEL COMANDANTE VIP',
    method: 'Visa ****4242',
    invoice: 'inv_1234567'
  },
  {
    id: 'pay_2',
    amount: 49.90,
    currency: 'BRL',
    status: 'succeeded',
    date: '2023-12-15',
    description: 'OPERAÇÃO MENSAL - NÍVEL COMANDANTE VIP',
    method: 'Visa ****4242',
    invoice: 'inv_1234566'
  },
  {
    id: 'pay_3',
    amount: 49.90,
    currency: 'BRL',
    status: 'failed',
    date: '2023-11-15',
    description: 'OPERAÇÃO MENSAL - NÍVEL COMANDANTE VIP',
    method: 'Visa ****4242',
    invoice: null,
    failureReason: 'AUTENTICAÇÃO DE PAGAMENTO RECUSADA'
  }
];

export default function PaymentSettingsPage() {
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [showBillingModal, setShowBillingModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [cardForm, setCardForm] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: '',
    nickname: ''
  });
  const [billingAddress, setBillingAddress] = useState({
    name: 'João Silva',
    email: 'joao@email.com',
    line1: 'Rua das Flores, 123',
    line2: 'Apt 45',
    city: 'São Paulo',
    state: 'SP',
    postal_code: '01234-567',
    country: 'BR'
  });

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const getCardBrandIcon = (brand: string) => {
    const brandColors = {
      visa: 'bg-blue-600',
      mastercard: 'bg-red-600',
      amex: 'bg-green-600'
    };
    
    return (
      <div className={`w-8 h-5 rounded ${brandColors[brand as keyof typeof brandColors] || 'bg-gray-600'} flex items-center justify-center`}>
        <span className="text-white text-xs font-bold">
          {brand.toUpperCase().substring(0, 2)}
        </span>
      </div>
    );
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      succeeded: { label: 'CONFIRMADO', color: 'bg-green-100 text-green-800' },
      pending: { label: 'EM PROCESSO', color: 'bg-yellow-100 text-yellow-800' },
      failed: { label: 'NEGADO', color: 'bg-red-100 text-red-800' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const handleCardFormChange = (field: string, value: string) => {
    let formattedValue = value;
    
    if (field === 'number') {
      formattedValue = formatCardNumber(value);
    } else if (field === 'expiry') {
      formattedValue = formatExpiry(value);
    } else if (field === 'cvc') {
      formattedValue = value.replace(/[^0-9]/g, '').substring(0, 4);
    }
    
    setCardForm(prev => ({
      ...prev,
      [field]: formattedValue
    }));
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <PageHeader
        title="COMANDO FINANCEIRO"
        subtitle="GERENCIAMENTO DE RECURSOS E OPERAÇÕES FINANCEIRAS"
        icon={CreditCard}
        breadcrumbs={[
          { label: 'DASHBOARD', href: '/student/dashboard' },
          { label: 'PAGAMENTOS' }
        ]}
        actions={
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              className="gap-2 font-police-body uppercase tracking-wider"
              onClick={() => toast.success('ACESSANDO RELATÓRIOS FINANCEIROS!', { icon: '📄' })}
            >
              <Receipt className="w-4 h-4" />
              RELATÓRIOS
            </Button>
            <Button 
              onClick={() => setShowAddCardModal(true)} 
              className="gap-2 bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black font-police-body font-semibold uppercase tracking-wider"
            >
              <Plus className="w-4 h-4" />
              ADICIONAR CARTÃO
            </Button>
          </div>
        }
      />

      {/* Current Subscription */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-primary-200 dark:border-primary-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 font-police-title uppercase tracking-wider">
                <Star className="w-5 h-5 text-yellow-500" />
                OPERAÇÃO ATIVA
              </CardTitle>
              <Badge className="bg-green-100 text-green-800 font-police-body">
                OPERACIONAL
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium text-primary-600 dark:text-gray-400 font-police-body uppercase tracking-wider">
                  NÍVEL
                </p>
                <p className="text-lg font-bold text-primary-900 dark:text-white font-police-title">
                  COMANDANTE VIP MENSAL
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-primary-600 dark:text-gray-400 font-police-body uppercase tracking-wider">
                  VALOR OPERACIONAL
                </p>
                <p className="text-lg font-bold text-primary-900 dark:text-white">
                  R$ 49,90/mês
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-primary-600 dark:text-gray-400 font-police-body uppercase tracking-wider">
                  PRÓXIMA OPERAÇÃO
                </p>
                <p className="text-lg font-bold text-primary-900 dark:text-white">
                  15/02/2024
                </p>
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-4 border-t border-primary-100 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-green-600" />
                <span className="text-sm text-primary-700 dark:text-gray-300 font-police-body uppercase tracking-wider">
                  RENOVAÇÃO AUTOMÁTICA ATIVA
                </span>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                className="font-police-body uppercase tracking-wider"
                onClick={() => toast.success('ACESSANDO COMANDO DE ASSINATURAS!', { icon: '⚙️' })}
              >
                GERENCIAR OPERAÇÃO
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Payment Methods */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-police-title uppercase tracking-wider">
                <CreditCard className="w-5 h-5" />
                ARSENAL FINANCEIRO
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockPaymentMethods.map((method) => (
                <div
                  key={method.id}
                  className="flex items-center justify-between p-4 border border-primary-200 dark:border-gray-700 rounded-lg hover:bg-primary-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {getCardBrandIcon(method.brand)}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-primary-900 dark:text-white">
                          •••• •••• •••• {method.last4}
                        </span>
                        {method.isDefault && (
                          <Badge variant="secondary" className="text-xs font-police-body">
                            PRINCIPAL
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-primary-600 dark:text-gray-400">
                        {method.nickname} • Expira {method.expiryMonth}/{method.expiryYear}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
              
              <Button
                variant="outline"
                onClick={() => setShowAddCardModal(true)}
                className="w-full gap-2 border-dashed font-police-body uppercase tracking-wider"
              >
                <Plus className="w-4 h-4" />
                ADICIONAR NOVO ARMAMENTO
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Billing Address */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-police-title uppercase tracking-wider">
                <Settings className="w-5 h-5" />
                BASE DE OPERAÇÕES
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <p className="font-medium text-primary-900 dark:text-white">
                    {billingAddress.name}
                  </p>
                  <p className="text-sm text-primary-600 dark:text-gray-400">
                    {billingAddress.email}
                  </p>
                </div>
                
                <div className="text-sm text-primary-700 dark:text-gray-300">
                  <p>{billingAddress.line1}</p>
                  {billingAddress.line2 && <p>{billingAddress.line2}</p>}
                  <p>
                    {billingAddress.city}, {billingAddress.state} {billingAddress.postal_code}
                  </p>
                </div>
              </div>
              
              <Button
                variant="outline"
                onClick={() => {
                  toast.success('ACESSANDO CONFIGURAÇÕES DA BASE!', { icon: '🏠' });
                  setShowBillingModal(true);
                }}
                className="w-full gap-2 font-police-body uppercase tracking-wider"
              >
                <Edit className="w-4 h-4" />
                CONFIGURAR BASE
              </Button>
            </CardContent>
          </Card>
          
          {/* Notifications */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-police-title uppercase tracking-wider">
                <Bell className="w-5 h-5" />
                ALERTAS DE COMANDO
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-4 h-4 text-primary-600 border-primary-300 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm text-primary-700 dark:text-gray-300 font-police-body">
                    ALERTAS DE PRÓXIMAS OPERAÇÕES FINANCEIRAS
                  </span>
                </label>
                
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-4 h-4 text-primary-600 border-primary-300 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm text-primary-700 dark:text-gray-300 font-police-body">
                    ALERTAS DE FALHA EM OPERAÇÕES FINANCEIRAS
                  </span>
                </label>
                
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-primary-600 border-primary-300 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm text-primary-700 dark:text-gray-300 font-police-body">
                    INTELIGÊNCIA DE PROMOÇÕES E OFERTAS TÁTICAS
                  </span>
                </label>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Payment History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-police-title uppercase tracking-wider">
              <Receipt className="w-5 h-5" />
              RELATÓRIO DE OPERAÇÕES FINANCEIRAS
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-primary-50 dark:bg-gray-800">
                  <tr>
                    <th className="text-left py-4 px-6 font-semibold text-primary-900 dark:text-white font-police-body uppercase tracking-wider">
                      DATA
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-primary-900 dark:text-white font-police-body uppercase tracking-wider">
                      OPERAÇÃO
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-primary-900 dark:text-white font-police-body uppercase tracking-wider">
                      ARSENAL
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-primary-900 dark:text-white font-police-body uppercase tracking-wider">
                      VALOR
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-primary-900 dark:text-white font-police-body uppercase tracking-wider">
                      STATUS
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-primary-900 dark:text-white font-police-body uppercase tracking-wider">
                      AÇÕES
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {mockPaymentHistory.map((payment) => (
                    <tr
                      key={payment.id}
                      className="border-b border-primary-100 dark:border-gray-700 hover:bg-primary-50 dark:hover:bg-gray-800"
                    >
                      <td className="py-4 px-6">
                        <span className="text-primary-900 dark:text-white">
                          {new Date(payment.date).toLocaleDateString('pt-BR')}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-medium text-primary-900 dark:text-white">
                            {payment.description}
                          </p>
                          {payment.failureReason && (
                            <p className="text-sm text-red-600 dark:text-red-400">
                              {payment.failureReason}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-primary-600 dark:text-gray-400">
                          {payment.method}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-medium text-primary-900 dark:text-white">
                          R$ {payment.amount.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        {getStatusBadge(payment.status)}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          {payment.invoice && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              title="Baixar Fatura"
                              onClick={() => toast.success('DOWNLOAD DO RELATÓRIO INICIADO!', { icon: '📥' })}
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Visualizar Detalhes"
                            onClick={() => {
                              toast.info('ACESSANDO DETALHES DA OPERAÇÃO', { icon: '🔍' });
                              setSelectedPayment(payment);
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Add Card Modal */}
      <AnimatePresence>
        {showAddCardModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setShowAddCardModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-bold text-primary-900 dark:text-white font-police-title uppercase tracking-wider">
                  ADICIONAR ARSENAL FINANCEIRO
                </h3>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-primary-700 dark:text-gray-300 mb-1 font-police-body uppercase tracking-wider">
                    CÓDIGO DO ARMAMENTO
                  </label>
                  <input
                    type="text"
                    value={cardForm.number}
                    onChange={(e) => handleCardFormChange('number', e.target.value)}
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                    className="w-full px-4 py-2 border border-primary-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-primary-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-primary-700 dark:text-gray-300 mb-1 font-police-body uppercase tracking-wider">
                      EXPIRAÇÃO
                    </label>
                    <input
                      type="text"
                      value={cardForm.expiry}
                      onChange={(e) => handleCardFormChange('expiry', e.target.value)}
                      placeholder="MM/AA"
                      maxLength={5}
                      className="w-full px-4 py-2 border border-primary-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-primary-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary-700 dark:text-gray-300 mb-1 font-police-body uppercase tracking-wider">
                      CÓDIGO DE SEGURANÇA
                    </label>
                    <input
                      type="text"
                      value={cardForm.cvc}
                      onChange={(e) => handleCardFormChange('cvc', e.target.value)}
                      placeholder="123"
                      maxLength={4}
                      className="w-full px-4 py-2 border border-primary-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-primary-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-700 dark:text-gray-300 mb-1 font-police-body uppercase tracking-wider">
                    NOME DO OPERADOR
                  </label>
                  <input
                    type="text"
                    value={cardForm.name}
                    onChange={(e) => handleCardFormChange('name', e.target.value)}
                    placeholder="João Silva"
                    className="w-full px-4 py-2 border border-primary-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-primary-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-700 dark:text-gray-300 mb-1 font-police-body uppercase tracking-wider">
                    DESIGNAÇÃO TÁTICA (OPCIONAL)
                  </label>
                  <input
                    type="text"
                    value={cardForm.nickname}
                    onChange={(e) => handleCardFormChange('nickname', e.target.value)}
                    placeholder="ARMAMENTO PRINCIPAL"
                    className="w-full px-4 py-2 border border-primary-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-primary-900 dark:text-white"
                  />
                </div>

                <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <Shield className="w-5 h-5 text-blue-600" />
                  <p className="text-sm text-blue-700 dark:text-blue-300 font-police-body">
                    DADOS PROTEGIDOS COM CRIPTOGRAFIA MILITAR SSL 256-BIT
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
                <Button
                  variant="outline"
                  onClick={() => setShowAddCardModal(false)}
                  className="font-police-body uppercase tracking-wider"
                >
                  CANCELAR OPERAÇÃO
                </Button>
                <Button 
                  className="gap-2 bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black font-police-body font-semibold uppercase tracking-wider"
                  onClick={() => {
                    toast.success('ARMAMENTO ADICIONADO AO ARSENAL!', { icon: '⚔️' });
                    setShowAddCardModal(false);
                  }}
                >
                  <Save className="w-4 h-4" />
                  ADICIONAR ARMAMENTO
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Billing Address Modal */}
      <AnimatePresence>
        {showBillingModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setShowBillingModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-bold text-primary-900 dark:text-white font-police-title uppercase tracking-wider">
                  CONFIGURAR BASE DE OPERAÇÕES
                </h3>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-primary-700 dark:text-gray-300 mb-1 font-police-body uppercase tracking-wider">
                      NOME COMPLETO DO OPERADOR
                    </label>
                    <input
                      type="text"
                      defaultValue={billingAddress.name}
                      className="w-full px-4 py-2 border border-primary-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-primary-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary-700 dark:text-gray-300 mb-1 font-police-body uppercase tracking-wider">
                      COMUNICAÇÃO DIGITAL
                    </label>
                    <input
                      type="email"
                      defaultValue={billingAddress.email}
                      className="w-full px-4 py-2 border border-primary-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-primary-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-700 dark:text-gray-300 mb-1 font-police-body uppercase tracking-wider">
                    LOCALIZAÇÃO DA BASE
                  </label>
                  <input
                    type="text"
                    defaultValue={billingAddress.line1}
                    className="w-full px-4 py-2 border border-primary-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-primary-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-700 dark:text-gray-300 mb-1 font-police-body uppercase tracking-wider">
                    COMPLEMENTO TÁTICO (OPCIONAL)
                  </label>
                  <input
                    type="text"
                    defaultValue={billingAddress.line2}
                    className="w-full px-4 py-2 border border-primary-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-primary-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-primary-700 dark:text-gray-300 mb-1 font-police-body uppercase tracking-wider">
                      MUNICÍPIO
                    </label>
                    <input
                      type="text"
                      defaultValue={billingAddress.city}
                      className="w-full px-4 py-2 border border-primary-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-primary-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary-700 dark:text-gray-300 mb-1 font-police-body uppercase tracking-wider">
                      ESTADO OPERACIONAL
                    </label>
                    <select
                      defaultValue={billingAddress.state}
                      className="w-full px-4 py-2 border border-primary-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-primary-900 dark:text-white"
                    >
                      <option value="SP">São Paulo</option>
                      <option value="RJ">Rio de Janeiro</option>
                      <option value="MG">Minas Gerais</option>
                      {/* Add more states */}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-700 dark:text-gray-300 mb-1 font-police-body uppercase tracking-wider">
                    CÓDIGO POSTAL
                  </label>
                  <input
                    type="text"
                    defaultValue={billingAddress.postal_code}
                    className="w-full px-4 py-2 border border-primary-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-primary-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
                <Button
                  variant="outline"
                  onClick={() => setShowBillingModal(false)}
                  className="font-police-body uppercase tracking-wider"
                >
                  CANCELAR MISSÃO
                </Button>
                <Button 
                  className="gap-2 bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black font-police-body font-semibold uppercase tracking-wider"
                  onClick={() => {
                    toast.success('BASE DE OPERAÇÕES CONFIGURADA!', { icon: '🏠' });
                    setShowBillingModal(false);
                  }}
                >
                  <Save className="w-4 h-4" />
                  CONFIRMAR BASE
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}