import { useState, useEffect } from 'react';
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
import paymentService, {
  PaymentMethod,
  PaymentHistory,
  BillingAddress,
  Subscription,
  NotificationSettings
} from '@/services/paymentService';


export default function PaymentSettingsPage() {
  // State
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [showBillingModal, setShowBillingModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingAction, setLoadingAction] = useState('');
  
  // Data state
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [billingAddress, setBillingAddress] = useState<BillingAddress | null>(null);
  const [notifications, setNotifications] = useState<NotificationSettings>({
    payment_reminders: true,
    payment_failures: true,
    promotional_offers: false
  });
  
  // Form state
  const [cardForm, setCardForm] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: '',
    nickname: ''
  });
  const [billingForm, setBillingForm] = useState<BillingAddress>({
    name: '',
    email: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'BR'
  });

  // Load data on mount
  useEffect(() => {
    loadAllData();
  }, []);

  // Load all payment data
  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.allSettled([
        loadPaymentMethods(),
        loadPaymentHistory(),
        loadSubscription(),
        loadBillingAddress(),
        loadNotificationSettings()
      ]);
    } catch (error) {
      console.error('Error loading payment data:', error);
      toast.error('ERRO AO CARREGAR DADOS FINANCEIROS');
    } finally {
      setLoading(false);
    }
  };

  // Load payment methods
  const loadPaymentMethods = async () => {
    try {
      const methods = await paymentService.getPaymentMethods();
      setPaymentMethods(methods);
    } catch (error: any) {
      console.error('Error loading payment methods:', error);
      toast.error(error.message || 'ERRO AO CARREGAR ARSENAL FINANCEIRO');
    }
  };

  // Load payment history
  const loadPaymentHistory = async () => {
    try {
      const response = await paymentService.getPaymentHistory(1, 20);
      setPaymentHistory(response.data);
    } catch (error: any) {
      console.error('Error loading payment history:', error);
      toast.error(error.message || 'ERRO AO CARREGAR RELATÓRIO DE OPERAÇÕES');
    }
  };

  // Load subscription
  const loadSubscription = async () => {
    try {
      const sub = await paymentService.getSubscription();
      setSubscription(sub);
    } catch (error: any) {
      console.error('Error loading subscription:', error);
      // Don't show error for missing subscription
    }
  };

  // Load billing address
  const loadBillingAddress = async () => {
    try {
      const address = await paymentService.getBillingAddress();
      setBillingAddress(address);
      if (address) {
        setBillingForm(address);
      }
    } catch (error: any) {
      console.error('Error loading billing address:', error);
      toast.error(error.message || 'ERRO AO CARREGAR BASE DE OPERAÇÕES');
    }
  };

  // Load notification settings
  const loadNotificationSettings = async () => {
    try {
      const settings = await paymentService.getNotificationSettings();
      setNotifications(settings);
    } catch (error: any) {
      console.error('Error loading notification settings:', error);
    }
  };

  // Add payment method
  const handleAddPaymentMethod = async () => {
    if (!cardForm.number || !cardForm.expiry || !cardForm.cvc || !cardForm.name) {
      toast.error('PREENCHA TODOS OS CAMPOS OBRIGATÓRIOS');
      return;
    }

    setLoadingAction('adding-card');
    try {
      const [month, year] = cardForm.expiry.split('/');
      const brand = paymentService.getCardBrand(cardForm.number);
      const last4 = cardForm.number.replace(/\D/g, '').slice(-4);

      await paymentService.addPaymentMethod({
        brand,
        last4,
        expiry_month: parseInt(month),
        expiry_year: parseInt('20' + year),
        holder_name: cardForm.name,
        nickname: cardForm.nickname || `CARTÃO ${brand.toUpperCase()} ****${last4}`,
        is_default: paymentMethods.length === 0
      });

      toast.success('ARMAMENTO ADICIONADO AO ARSENAL!', { icon: '⚔️' });
      setShowAddCardModal(false);
      setCardForm({ number: '', expiry: '', cvc: '', name: '', nickname: '' });
      await loadPaymentMethods();
    } catch (error: any) {
      toast.error(error.message || 'ERRO AO ADICIONAR ARMAMENTO');
    } finally {
      setLoadingAction('');
    }
  };

  // Remove payment method
  const handleRemovePaymentMethod = async (id: string) => {
    setLoadingAction('removing-card');
    try {
      await paymentService.removePaymentMethod(id);
      toast.success('ARMAMENTO REMOVIDO DO ARSENAL!');
      await loadPaymentMethods();
    } catch (error: any) {
      toast.error(error.message || 'ERRO AO REMOVER ARMAMENTO');
    } finally {
      setLoadingAction('');
    }
  };

  // Set default payment method
  const handleSetDefault = async (id: string) => {
    setLoadingAction('setting-default');
    try {
      await paymentService.setDefaultPaymentMethod(id);
      toast.success('ARMAMENTO PRINCIPAL ATUALIZADO!');
      await loadPaymentMethods();
    } catch (error: any) {
      toast.error(error.message || 'ERRO AO DEFINIR ARMAMENTO PRINCIPAL');
    } finally {
      setLoadingAction('');
    }
  };

  // Update billing address
  const handleUpdateBillingAddress = async () => {
    if (!billingForm.name || !billingForm.email || !billingForm.line1 || 
        !billingForm.city || !billingForm.state || !billingForm.postal_code) {
      toast.error('PREENCHA TODOS OS CAMPOS OBRIGATÓRIOS');
      return;
    }

    setLoadingAction('updating-billing');
    try {
      await paymentService.updateBillingAddress(billingForm);
      toast.success('BASE DE OPERAÇÕES CONFIGURADA!', { icon: '🏠' });
      setShowBillingModal(false);
      await loadBillingAddress();
    } catch (error: any) {
      toast.error(error.message || 'ERRO AO CONFIGURAR BASE');
    } finally {
      setLoadingAction('');
    }
  };

  // Download invoice
  const handleDownloadInvoice = async (invoiceId: string) => {
    setLoadingAction('downloading-invoice');
    try {
      const result = await paymentService.downloadInvoice(invoiceId);
      toast.success('DOWNLOAD DO RELATÓRIO INICIADO!', { icon: '📥' });
      // In a real implementation, this would trigger an actual download
      window.open(result.download_url, '_blank');
    } catch (error: any) {
      toast.error(error.message || 'ERRO NO DOWNLOAD DO RELATÓRIO');
    } finally {
      setLoadingAction('');
    }
  };

  // Manage subscription
  const handleManageSubscription = () => {
    toast.success('ACESSANDO COMANDO DE ASSINATURAS!', { icon: '⚙️' });
    // In a real implementation, this would open subscription management
  };

  // Update notification setting
  const handleNotificationChange = async (setting: keyof NotificationSettings, value: boolean) => {
    try {
      const updatedSettings = { ...notifications, [setting]: value };
      await paymentService.updateNotificationSettings(updatedSettings);
      setNotifications(updatedSettings);
      toast.success('ALERTAS ATUALIZADOS!');
    } catch (error: any) {
      toast.error(error.message || 'ERRO AO ATUALIZAR ALERTAS');
    }
  };

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
    const brandClass = paymentService.getCardBrandClass(brand);
    
    return (
      <div className={`w-8 h-5 rounded ${brandClass} flex items-center justify-center`}>
        <span className="text-white text-xs font-bold">
          {brand.toUpperCase().substring(0, 2)}
        </span>
      </div>
    );
  };

  const getStatusBadge = (status: string) => {
    const config = paymentService.getStatusConfig(status);
    return (
      <Badge className={config.className}>
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

  // Show loading state
  if (loading) {
    return (
      <div className="p-6 max-w-6xl mx-auto space-y-8">
        <PageHeader
          title="COMANDO FINANCEIRO"
          subtitle="CARREGANDO DADOS FINANCEIROS..."
          icon={CreditCard}
        />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-500"></div>
        </div>
      </div>
    );
  }

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
              disabled={loadingAction === 'adding-card'}
              className="gap-2 bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black font-police-body font-semibold uppercase tracking-wider disabled:opacity-50"
            >
              {loadingAction === 'adding-card' ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
              ) : (
                <Plus className="w-4 h-4" />
              )}
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
                  {subscription?.plan_name || 'NENHUMA OPERAÇÃO ATIVA'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-primary-600 dark:text-gray-400 font-police-body uppercase tracking-wider">
                  VALOR OPERACIONAL
                </p>
                <p className="text-lg font-bold text-primary-900 dark:text-white">
                  {subscription ? paymentService.formatCurrency(subscription.amount) + '/' + subscription.interval : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-primary-600 dark:text-gray-400 font-police-body uppercase tracking-wider">
                  PRÓXIMA OPERAÇÃO
                </p>
                <p className="text-lg font-bold text-primary-900 dark:text-white">
                  {subscription ? paymentService.formatDate(subscription.current_period_end) : 'N/A'}
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
                onClick={handleManageSubscription}
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
              {paymentMethods.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="font-police-body uppercase tracking-wider">NENHUM ARMAMENTO NO ARSENAL</p>
                </div>
              ) : (
                paymentMethods.map((method) => (
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
                        {method.is_default && (
                          <Badge variant="secondary" className="text-xs font-police-body">
                            PRINCIPAL
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-primary-600 dark:text-gray-400">
                        {method.nickname} • Expira {paymentService.formatExpiryDate(method.expiry_month, method.expiry_year)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {!method.is_default && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleSetDefault(method.id)}
                        disabled={loadingAction === 'setting-default'}
                        title="Definir como principal"
                      >
                        <Star className="w-4 h-4" />
                      </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleRemovePaymentMethod(method.id)}
                      disabled={loadingAction === 'removing-card'}
                      className="text-red-600 hover:text-red-700"
                    >
                      {loadingAction === 'removing-card' ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              ))
              )}
              
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
                {billingAddress ? (
                  <>
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
                  </>
                ) : (
                  <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                    <p className="font-police-body uppercase tracking-wider">BASE NÃO CONFIGURADA</p>
                  </div>
                )}
              </div>
              
              <Button
                variant="outline"
                onClick={() => setShowBillingModal(true)}
                disabled={loadingAction === 'updating-billing'}
                className="w-full gap-2 font-police-body uppercase tracking-wider disabled:opacity-50"
              >
                {loadingAction === 'updating-billing' ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                ) : (
                  <Edit className="w-4 h-4" />
                )}
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
                    checked={notifications.payment_reminders}
                    onChange={(e) => handleNotificationChange('payment_reminders', e.target.checked)}
                    className="w-4 h-4 text-primary-600 border-primary-300 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm text-primary-700 dark:text-gray-300 font-police-body">
                    ALERTAS DE PRÓXIMAS OPERAÇÕES FINANCEIRAS
                  </span>
                </label>
                
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={notifications.payment_failures}
                    onChange={(e) => handleNotificationChange('payment_failures', e.target.checked)}
                    className="w-4 h-4 text-primary-600 border-primary-300 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm text-primary-700 dark:text-gray-300 font-police-body">
                    ALERTAS DE FALHA EM OPERAÇÕES FINANCEIRAS
                  </span>
                </label>
                
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={notifications.promotional_offers}
                    onChange={(e) => handleNotificationChange('promotional_offers', e.target.checked)}
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
                  {paymentHistory.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-500 dark:text-gray-400">
                        <div className="flex flex-col items-center">
                          <Receipt className="w-12 h-12 mb-4 opacity-50" />
                          <p className="font-police-body uppercase tracking-wider">NENHUMA OPERAÇÃO REGISTRADA</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paymentHistory.map((payment) => (
                    <tr
                      key={payment.id}
                      className="border-b border-primary-100 dark:border-gray-700 hover:bg-primary-50 dark:hover:bg-gray-800"
                    >
                      <td className="py-4 px-6">
                        <span className="text-primary-900 dark:text-white">
                          {paymentService.formatDate(payment.created_at)}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-medium text-primary-900 dark:text-white">
                            {payment.description}
                          </p>
                          {payment.failure_reason && (
                            <p className="text-sm text-red-600 dark:text-red-400">
                              {payment.failure_reason}
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
                          {paymentService.formatCurrency(payment.amount, payment.currency)}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        {getStatusBadge(payment.status)}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          {payment.invoice_id && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              title="Baixar Fatura"
                              onClick={() => handleDownloadInvoice(payment.invoice_id!)}
                              disabled={loadingAction === 'downloading-invoice'}
                            >
                              {loadingAction === 'downloading-invoice' ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                              ) : (
                                <Download className="w-4 h-4" />
                              )}
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
                  ))
                  )}
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
                  className="gap-2 bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black font-police-body font-semibold uppercase tracking-wider disabled:opacity-50"
                  onClick={handleAddPaymentMethod}
                  disabled={loadingAction === 'adding-card'}
                >
                  {loadingAction === 'adding-card' ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
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
                      value={billingForm.name}
                      onChange={(e) => setBillingForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-2 border border-primary-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-primary-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary-700 dark:text-gray-300 mb-1 font-police-body uppercase tracking-wider">
                      COMUNICAÇÃO DIGITAL
                    </label>
                    <input
                      type="email"
                      value={billingForm.email}
                      onChange={(e) => setBillingForm(prev => ({ ...prev, email: e.target.value }))}
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
                    value={billingForm.line1}
                    onChange={(e) => setBillingForm(prev => ({ ...prev, line1: e.target.value }))}
                    className="w-full px-4 py-2 border border-primary-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-primary-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-700 dark:text-gray-300 mb-1 font-police-body uppercase tracking-wider">
                    COMPLEMENTO TÁTICO (OPCIONAL)
                  </label>
                  <input
                    type="text"
                    value={billingForm.line2 || ''}
                    onChange={(e) => setBillingForm(prev => ({ ...prev, line2: e.target.value }))}
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
                      value={billingForm.city}
                      onChange={(e) => setBillingForm(prev => ({ ...prev, city: e.target.value }))}
                      className="w-full px-4 py-2 border border-primary-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-primary-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary-700 dark:text-gray-300 mb-1 font-police-body uppercase tracking-wider">
                      ESTADO OPERACIONAL
                    </label>
                    <select
                      value={billingForm.state}
                      onChange={(e) => setBillingForm(prev => ({ ...prev, state: e.target.value }))}
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
                    value={billingForm.postal_code}
                    onChange={(e) => setBillingForm(prev => ({ ...prev, postal_code: e.target.value }))}
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
                  className="gap-2 bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black font-police-body font-semibold uppercase tracking-wider disabled:opacity-50"
                  onClick={handleUpdateBillingAddress}
                  disabled={loadingAction === 'updating-billing'}
                >
                  {loadingAction === 'updating-billing' ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
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