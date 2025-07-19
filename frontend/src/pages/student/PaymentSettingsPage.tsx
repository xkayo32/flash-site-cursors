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
    nickname: 'Cartão Principal'
  },
  {
    id: '2',
    type: 'card',
    brand: 'mastercard',
    last4: '5555',
    expiryMonth: 8,
    expiryYear: 2026,
    isDefault: false,
    nickname: 'Cartão Reserva'
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
    description: 'Assinatura Mensal - Plano Premium',
    method: 'Visa ****4242',
    invoice: 'inv_1234567'
  },
  {
    id: 'pay_2',
    amount: 49.90,
    currency: 'BRL',
    status: 'succeeded',
    date: '2023-12-15',
    description: 'Assinatura Mensal - Plano Premium',
    method: 'Visa ****4242',
    invoice: 'inv_1234566'
  },
  {
    id: 'pay_3',
    amount: 49.90,
    currency: 'BRL',
    status: 'failed',
    date: '2023-11-15',
    description: 'Assinatura Mensal - Plano Premium',
    method: 'Visa ****4242',
    invoice: null,
    failureReason: 'Cartão recusado'
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
      succeeded: { label: 'Pago', color: 'bg-green-100 text-green-800' },
      pending: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800' },
      failed: { label: 'Falhou', color: 'bg-red-100 text-red-800' }
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
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-primary-900 dark:text-white">
            Configurações de Pagamento
          </h1>
          <p className="text-primary-600 dark:text-gray-300">
            Gerencie seus métodos de pagamento e histórico de faturas
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <Receipt className="w-4 h-4" />
            Ver Faturas
          </Button>
          <Button onClick={() => setShowAddCardModal(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Adicionar Cartão
          </Button>
        </div>
      </motion.div>

      {/* Current Subscription */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-primary-200 dark:border-primary-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                Assinatura Atual
              </CardTitle>
              <Badge className="bg-green-100 text-green-800">
                Ativa
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium text-primary-600 dark:text-gray-400">
                  Plano
                </p>
                <p className="text-lg font-bold text-primary-900 dark:text-white">
                  Premium Mensal
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-primary-600 dark:text-gray-400">
                  Valor
                </p>
                <p className="text-lg font-bold text-primary-900 dark:text-white">
                  R$ 49,90/mês
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-primary-600 dark:text-gray-400">
                  Próxima Cobrança
                </p>
                <p className="text-lg font-bold text-primary-900 dark:text-white">
                  15/02/2024
                </p>
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-4 border-t border-primary-100 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-green-600" />
                <span className="text-sm text-primary-700 dark:text-gray-300">
                  Renovação automática ativa
                </span>
              </div>
              <Button variant="outline" size="sm">
                Gerenciar Assinatura
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
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Métodos de Pagamento
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
                          <Badge variant="secondary" className="text-xs">
                            Padrão
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
                className="w-full gap-2 border-dashed"
              >
                <Plus className="w-4 h-4" />
                Adicionar Novo Cartão
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
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Endereço de Cobrança
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
                onClick={() => setShowBillingModal(true)}
                className="w-full gap-2"
              >
                <Edit className="w-4 h-4" />
                Editar Endereço
              </Button>
            </CardContent>
          </Card>
          
          {/* Notifications */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notificações
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
                  <span className="text-sm text-primary-700 dark:text-gray-300">
                    Notificar sobre próximas cobranças
                  </span>
                </label>
                
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-4 h-4 text-primary-600 border-primary-300 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm text-primary-700 dark:text-gray-300">
                    Alertas de falha no pagamento
                  </span>
                </label>
                
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-primary-600 border-primary-300 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm text-primary-700 dark:text-gray-300">
                    Promoções e ofertas especiais
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
            <CardTitle className="flex items-center gap-2">
              <Receipt className="w-5 h-5" />
              Histórico de Pagamentos
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-primary-50 dark:bg-gray-800">
                  <tr>
                    <th className="text-left py-4 px-6 font-semibold text-primary-900 dark:text-white">
                      Data
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-primary-900 dark:text-white">
                      Descrição
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-primary-900 dark:text-white">
                      Método
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-primary-900 dark:text-white">
                      Valor
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-primary-900 dark:text-white">
                      Status
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-primary-900 dark:text-white">
                      Ações
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
                            <Button variant="ghost" size="sm" title="Baixar Fatura">
                              <Download className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Visualizar Detalhes"
                            onClick={() => setSelectedPayment(payment)}
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
                <h3 className="text-xl font-bold text-primary-900 dark:text-white">
                  Adicionar Cartão de Crédito
                </h3>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-primary-700 dark:text-gray-300 mb-1">
                    Número do Cartão
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
                    <label className="block text-sm font-medium text-primary-700 dark:text-gray-300 mb-1">
                      Validade
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
                    <label className="block text-sm font-medium text-primary-700 dark:text-gray-300 mb-1">
                      CVC
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
                  <label className="block text-sm font-medium text-primary-700 dark:text-gray-300 mb-1">
                    Nome no Cartão
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
                  <label className="block text-sm font-medium text-primary-700 dark:text-gray-300 mb-1">
                    Apelido (opcional)
                  </label>
                  <input
                    type="text"
                    value={cardForm.nickname}
                    onChange={(e) => handleCardFormChange('nickname', e.target.value)}
                    placeholder="Cartão Principal"
                    className="w-full px-4 py-2 border border-primary-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-primary-900 dark:text-white"
                  />
                </div>

                <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <Shield className="w-5 h-5 text-blue-600" />
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Seus dados são protegidos com criptografia SSL 256-bit
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
                <Button
                  variant="outline"
                  onClick={() => setShowAddCardModal(false)}
                >
                  Cancelar
                </Button>
                <Button className="gap-2">
                  <Save className="w-4 h-4" />
                  Adicionar Cartão
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
                <h3 className="text-xl font-bold text-primary-900 dark:text-white">
                  Editar Endereço de Cobrança
                </h3>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-primary-700 dark:text-gray-300 mb-1">
                      Nome Completo
                    </label>
                    <input
                      type="text"
                      defaultValue={billingAddress.name}
                      className="w-full px-4 py-2 border border-primary-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-primary-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary-700 dark:text-gray-300 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      defaultValue={billingAddress.email}
                      className="w-full px-4 py-2 border border-primary-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-primary-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-700 dark:text-gray-300 mb-1">
                    Endereço
                  </label>
                  <input
                    type="text"
                    defaultValue={billingAddress.line1}
                    className="w-full px-4 py-2 border border-primary-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-primary-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-700 dark:text-gray-300 mb-1">
                    Complemento (opcional)
                  </label>
                  <input
                    type="text"
                    defaultValue={billingAddress.line2}
                    className="w-full px-4 py-2 border border-primary-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-primary-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-primary-700 dark:text-gray-300 mb-1">
                      Cidade
                    </label>
                    <input
                      type="text"
                      defaultValue={billingAddress.city}
                      className="w-full px-4 py-2 border border-primary-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-primary-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary-700 dark:text-gray-300 mb-1">
                      Estado
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
                  <label className="block text-sm font-medium text-primary-700 dark:text-gray-300 mb-1">
                    CEP
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
                >
                  Cancelar
                </Button>
                <Button className="gap-2">
                  <Save className="w-4 h-4" />
                  Salvar Endereço
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}