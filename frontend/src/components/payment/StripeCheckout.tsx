import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CreditCard,
  Shield,
  Lock,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowRight,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import '../../styles/police-fonts.css';

interface CheckoutFormProps {
  plan: {
    id: string;
    name: string;
    subtitle?: string;
    price: number;
    interval: string;
    features: string[];
    color?: string;
  };
  onSuccess?: (paymentIntent: any) => void;
  onError?: (error: string) => void;
}

function CheckoutForm({ plan, onSuccess, onError }: CheckoutFormProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [paymentSucceeded, setPaymentSucceeded] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    email: '',
    name: '',
    address: {
      line1: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'BR'
    }
  });
  const [cardInfo, setCardInfo] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: ''
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

  const handleCardChange = (field: string, value: string) => {
    let formattedValue = value;
    
    if (field === 'number') {
      formattedValue = formatCardNumber(value);
    } else if (field === 'expiry') {
      formattedValue = formatExpiry(value);
    } else if (field === 'cvc') {
      formattedValue = value.replace(/[^0-9]/g, '').substring(0, 4);
    }
    
    setCardInfo(prev => ({
      ...prev,
      [field]: formattedValue
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!customerInfo.name || !customerInfo.email || !cardInfo.number) {
      setErrorMessage('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      // Mock payment processing - replace with real Stripe integration
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate success
      setPaymentSucceeded(true);
      onSuccess?.({ id: 'mock_payment_intent' });
    } catch (error: any) {
      setErrorMessage(error.message || 'Erro ao processar pagamento');
      onError?.(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  if (paymentSucceeded) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-8"
      >
        <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-white" />
        </div>
        <h3 className="text-2xl font-police-title text-white mb-2 tracking-widest">
          PAGAMENTO CONFIRMADO!
        </h3>
        <p className="text-gray-400 mb-8 font-police-body tracking-wider">
          BEM-VINDO À ELITE DO {plan.name.toUpperCase()}
        </p>
        <Button 
          onClick={() => window.location.href = '/dashboard'}
          className="bg-yellow-400 hover:bg-yellow-300 text-black font-police-title tracking-widest px-8 py-4"
        >
          ACESSAR TREINAMENTO
          <ArrowRight className="ml-2 w-5 h-5" />
        </Button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Customer Information */}
      <div className="space-y-6">
        <h3 className="text-xl font-police-title text-white tracking-widest">
          DADOS DO RECRUTA
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-police-subtitle text-gray-400 mb-2 tracking-wider">
              NOME COMPLETO *
            </label>
            <input
              type="text"
              required
              value={customerInfo.name}
              onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded text-white font-police-body focus:border-yellow-400 focus:outline-none transition"
              placeholder="Digite seu nome completo"
            />
          </div>
          
          <div>
            <label className="block text-sm font-police-subtitle text-gray-400 mb-2 tracking-wider">
              EMAIL *
            </label>
            <input
              type="email"
              required
              value={customerInfo.email}
              onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded text-white font-police-body focus:border-yellow-400 focus:outline-none transition"
              placeholder="seu@email.com"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-police-subtitle text-gray-400 mb-2 tracking-wider">
            ENDEREÇO *
          </label>
          <input
            type="text"
            required
            value={customerInfo.address.line1}
            onChange={(e) => setCustomerInfo(prev => ({ 
              ...prev, 
              address: { ...prev.address, line1: e.target.value }
            }))}
            className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded text-white font-police-body focus:border-yellow-400 focus:outline-none transition"
            placeholder="Rua, número e complemento"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-police-subtitle text-gray-400 mb-2 tracking-wider">
              CIDADE *
            </label>
            <input
              type="text"
              required
              value={customerInfo.address.city}
              onChange={(e) => setCustomerInfo(prev => ({ 
                ...prev, 
                address: { ...prev.address, city: e.target.value }
              }))}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded text-white font-police-body focus:border-yellow-400 focus:outline-none transition"
              placeholder="Sua cidade"
            />
          </div>
          
          <div>
            <label className="block text-sm font-police-subtitle text-gray-400 mb-2 tracking-wider">
              ESTADO *
            </label>
            <select
              required
              value={customerInfo.address.state}
              onChange={(e) => setCustomerInfo(prev => ({ 
                ...prev, 
                address: { ...prev.address, state: e.target.value }
              }))}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded text-white font-police-body focus:border-yellow-400 focus:outline-none transition"
            >
              <option value="">Selecione</option>
              <option value="AC">Acre</option>
              <option value="AL">Alagoas</option>
              <option value="AP">Amapá</option>
              <option value="AM">Amazonas</option>
              <option value="BA">Bahia</option>
              <option value="CE">Ceará</option>
              <option value="DF">Distrito Federal</option>
              <option value="ES">Espírito Santo</option>
              <option value="GO">Goiás</option>
              <option value="MA">Maranhão</option>
              <option value="MT">Mato Grosso</option>
              <option value="MS">Mato Grosso do Sul</option>
              <option value="MG">Minas Gerais</option>
              <option value="PA">Pará</option>
              <option value="PB">Paraíba</option>
              <option value="PR">Paraná</option>
              <option value="PE">Pernambuco</option>
              <option value="PI">Piauí</option>
              <option value="RJ">Rio de Janeiro</option>
              <option value="RN">Rio Grande do Norte</option>
              <option value="RS">Rio Grande do Sul</option>
              <option value="RO">Rondônia</option>
              <option value="RR">Roraima</option>
              <option value="SC">Santa Catarina</option>
              <option value="SP">São Paulo</option>
              <option value="SE">Sergipe</option>
              <option value="TO">Tocantins</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-police-subtitle text-gray-400 mb-2 tracking-wider">
              CEP *
            </label>
            <input
              type="text"
              required
              value={customerInfo.address.postal_code}
              onChange={(e) => setCustomerInfo(prev => ({ 
                ...prev, 
                address: { ...prev.address, postal_code: e.target.value }
              }))}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded text-white font-police-body focus:border-yellow-400 focus:outline-none transition"
              placeholder="00000-000"
            />
          </div>
        </div>
      </div>

      {/* Payment Information */}
      <div className="space-y-6">
        <h3 className="text-xl font-police-title text-white tracking-widest">
          DADOS DO PAGAMENTO
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-police-subtitle text-gray-400 mb-2 tracking-wider">
              NÚMERO DO CARTÃO *
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={cardInfo.number}
                onChange={(e) => handleCardChange('number', e.target.value)}
                placeholder="0000 0000 0000 0000"
                maxLength={19}
                className="w-full px-4 py-3 pl-12 bg-gray-900 border border-gray-700 rounded text-white font-police-body focus:border-yellow-400 focus:outline-none transition"
              />
              <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-police-subtitle text-gray-400 mb-2 tracking-wider">
                VALIDADE *
              </label>
              <input
                type="text"
                required
                value={cardInfo.expiry}
                onChange={(e) => handleCardChange('expiry', e.target.value)}
                placeholder="MM/AA"
                maxLength={5}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded text-white font-police-body focus:border-yellow-400 focus:outline-none transition"
              />
            </div>
            <div>
              <label className="block text-sm font-police-subtitle text-gray-400 mb-2 tracking-wider">
                CVC *
              </label>
              <input
                type="text"
                required
                value={cardInfo.cvc}
                onChange={(e) => handleCardChange('cvc', e.target.value)}
                placeholder="000"
                maxLength={4}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded text-white font-police-body focus:border-yellow-400 focus:outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-police-subtitle text-gray-400 mb-2 tracking-wider">
              NOME NO CARTÃO *
            </label>
            <input
              type="text"
              required
              value={cardInfo.name}
              onChange={(e) => handleCardChange('name', e.target.value)}
              placeholder="Como está no cartão"
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded text-white font-police-body focus:border-yellow-400 focus:outline-none transition"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 bg-green-900/20 border border-green-900 rounded">
          <ShieldCheck className="w-5 h-5 text-green-400" />
          <p className="text-sm text-green-400 font-police-body">
            PAGAMENTO 100% SEGURO • CRIPTOGRAFIA SSL 256-BIT
          </p>
        </div>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-4 bg-red-900/20 border border-red-900 rounded"
        >
          <AlertCircle className="w-5 h-5 text-red-400" />
          <p className="text-sm text-red-400 font-police-body">
            {errorMessage}
          </p>
        </motion.div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isProcessing}
        className="w-full gap-2 py-4 bg-yellow-400 hover:bg-yellow-300 text-black font-police-title tracking-widest text-lg"
        size="lg"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            PROCESSANDO PAGAMENTO...
          </>
        ) : (
          <>
            <Lock className="w-5 h-5" />
            CONFIRMAR PAGAMENTO R$ {plan.price.toLocaleString('pt-BR')}/{plan.interval === 'month' ? 'MÊS' : 'ANO'}
          </>
        )}
      </Button>

      <div className="flex items-center gap-3 p-4 bg-yellow-900/20 border border-yellow-900 rounded">
        <AlertTriangle className="w-5 h-5 text-yellow-400" />
        <p className="text-xs text-yellow-400 font-police-body">
          SIMULAÇÃO: Em produção, o pagamento seria processado de forma segura pelo Stripe.
        </p>
      </div>
    </form>
  );
}

interface StripeCheckoutProps {
  plan: CheckoutFormProps['plan'];
  onSuccess?: CheckoutFormProps['onSuccess'];
  onError?: CheckoutFormProps['onError'];
}

export default function StripeCheckout({ plan, onSuccess, onError }: StripeCheckoutProps) {
  return (
    <Card className="w-full max-w-2xl mx-auto bg-black border-gray-800">
      <CardHeader className="border-b border-gray-800">
        <CardTitle className="flex items-center gap-2 font-police-title text-white tracking-widest">
          <Shield className="w-6 h-6 text-yellow-400" />
          FINALIZAR ALISTAMENTO - {plan.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="bg-gray-900/50">
        {/* Plan Summary */}
        <div className="mb-8 p-6 bg-gray-800 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-police-title text-white text-xl tracking-widest">
                {plan.name}
              </h4>
              {plan.subtitle && (
                <p className="text-sm font-police-subtitle text-gray-400 tracking-wider">
                  {plan.subtitle}
                </p>
              )}
            </div>
            <div className="text-right">
              <span className="text-3xl font-police-numbers text-yellow-400 font-bold">
                R$ {plan.price.toLocaleString('pt-BR')}
              </span>
              <span className="text-sm font-police-body text-gray-400 block">
                /{plan.interval === 'month' ? 'MÊS' : 'ANO'}
              </span>
            </div>
          </div>
          <ul className="space-y-2 text-sm font-police-body">
            {plan.features.slice(0, 5).map((feature, index) => (
              <li key={index} className="flex items-center gap-2 text-gray-300">
                <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                <span className="tracking-wider">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <CheckoutForm plan={plan} onSuccess={onSuccess} onError={onError} />
      </CardContent>
    </Card>
  );
}