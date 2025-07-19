import { useState } from 'react';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { motion } from 'framer-motion';
import {
  CreditCard,
  Shield,
  Lock,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

// Initialize Stripe (use your publishable key)
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_...');

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '16px',
      color: '#424770',
      '::placeholder': {
        color: '#aab7c4',
      },
    },
    invalid: {
      color: '#9e2146',
    },
  },
  hidePostalCode: true,
};

interface CheckoutFormProps {
  plan: {
    id: string;
    name: string;
    price: number;
    interval: string;
    features: string[];
  };
  onSuccess?: (paymentIntent: any) => void;
  onError?: (error: string) => void;
}

function CheckoutForm({ plan, onSuccess, onError }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      setErrorMessage('Erro ao carregar o formulário de pagamento');
      setIsProcessing(false);
      return;
    }

    try {
      // Create payment method
      const { error: paymentMethodError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          name: customerInfo.name,
          email: customerInfo.email,
          address: customerInfo.address,
        },
      });

      if (paymentMethodError) {
        throw new Error(paymentMethodError.message);
      }

      // In a real application, you would send the payment method to your backend
      // to create a payment intent or subscription
      
      // Mock success for demo purposes
      setTimeout(() => {
        setPaymentSucceeded(true);
        setIsProcessing(false);
        onSuccess?.(paymentMethod);
      }, 2000);

      // Example of what you would do in a real application:
      /*
      const response = await fetch('/api/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payment_method: paymentMethod.id,
          price_id: plan.id,
          customer_info: customerInfo,
        }),
      });

      const { client_secret } = await response.json();

      const { error: confirmError } = await stripe.confirmCardPayment(client_secret);

      if (confirmError) {
        throw new Error(confirmError.message);
      }

      setPaymentSucceeded(true);
      onSuccess?.(paymentMethod);
      */

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
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-xl font-bold text-primary-900 dark:text-white mb-2">
          Pagamento Realizado com Sucesso!
        </h3>
        <p className="text-primary-600 dark:text-gray-300 mb-6">
          Sua assinatura do plano {plan.name} foi ativada.
        </p>
        <Button onClick={() => window.location.href = '/dashboard'}>
          Ir para Dashboard
        </Button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Customer Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-primary-900 dark:text-white">
          Informações Pessoais
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-primary-700 dark:text-gray-300 mb-1">
              Nome Completo *
            </label>
            <input
              type="text"
              required
              value={customerInfo.name}
              onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-2 border border-primary-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-primary-900 dark:text-white"
              placeholder="João Silva"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-primary-700 dark:text-gray-300 mb-1">
              Email *
            </label>
            <input
              type="email"
              required
              value={customerInfo.email}
              onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-4 py-2 border border-primary-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-primary-900 dark:text-white"
              placeholder="joao@email.com"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-primary-700 dark:text-gray-300 mb-1">
            Endereço *
          </label>
          <input
            type="text"
            required
            value={customerInfo.address.line1}
            onChange={(e) => setCustomerInfo(prev => ({ 
              ...prev, 
              address: { ...prev.address, line1: e.target.value }
            }))}
            className="w-full px-4 py-2 border border-primary-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-primary-900 dark:text-white"
            placeholder="Rua das Flores, 123"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-primary-700 dark:text-gray-300 mb-1">
              Cidade *
            </label>
            <input
              type="text"
              required
              value={customerInfo.address.city}
              onChange={(e) => setCustomerInfo(prev => ({ 
                ...prev, 
                address: { ...prev.address, city: e.target.value }
              }))}
              className="w-full px-4 py-2 border border-primary-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-primary-900 dark:text-white"
              placeholder="São Paulo"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-primary-700 dark:text-gray-300 mb-1">
              Estado *
            </label>
            <select
              required
              value={customerInfo.address.state}
              onChange={(e) => setCustomerInfo(prev => ({ 
                ...prev, 
                address: { ...prev.address, state: e.target.value }
              }))}
              className="w-full px-4 py-2 border border-primary-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-primary-900 dark:text-white"
            >
              <option value="">Selecione</option>
              <option value="SP">São Paulo</option>
              <option value="RJ">Rio de Janeiro</option>
              <option value="MG">Minas Gerais</option>
              <option value="RS">Rio Grande do Sul</option>
              {/* Add more states */}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-primary-700 dark:text-gray-300 mb-1">
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
              className="w-full px-4 py-2 border border-primary-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-primary-900 dark:text-white"
              placeholder="01234-567"
            />
          </div>
        </div>
      </div>

      {/* Payment Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-primary-900 dark:text-white">
          Informações de Pagamento
        </h3>
        
        <div className="p-4 border border-primary-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900">
          <label className="block text-sm font-medium text-primary-700 dark:text-gray-300 mb-2">
            Cartão de Crédito *
          </label>
          <CardElement options={CARD_ELEMENT_OPTIONS} />
        </div>

        <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <Shield className="w-5 h-5 text-blue-600" />
          <p className="text-sm text-blue-700 dark:text-blue-300">
            Pagamento seguro processado pelo Stripe. Seus dados são protegidos com criptografia SSL.
          </p>
        </div>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg"
        >
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-sm text-red-700 dark:text-red-300">
            {errorMessage}
          </p>
        </motion.div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full gap-2 py-3"
        size="lg"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Processando...
          </>
        ) : (
          <>
            <Lock className="w-5 h-5" />
            Assinar por R$ {plan.price.toFixed(2)}/{plan.interval === 'month' ? 'mês' : 'ano'}
          </>
        )}
      </Button>

      <p className="text-xs text-center text-primary-600 dark:text-gray-400">
        Ao continuar, você concorda com nossos Termos de Serviço e Política de Privacidade.
      </p>
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
    <Elements stripe={stripePromise}>
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Finalizar Assinatura - {plan.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Plan Summary */}
          <div className="mb-6 p-4 bg-primary-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-primary-900 dark:text-white">
                {plan.name}
              </h4>
              <span className="text-2xl font-bold text-primary-900 dark:text-white">
                R$ {plan.price.toFixed(2)}
                <span className="text-sm font-normal text-primary-600 dark:text-gray-400">
                  /{plan.interval === 'month' ? 'mês' : 'ano'}
                </span>
              </span>
            </div>
            <ul className="space-y-1 text-sm text-primary-700 dark:text-gray-300">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          <CheckoutForm plan={plan} onSuccess={onSuccess} onError={onError} />
        </CardContent>
      </Card>
    </Elements>
  );
}