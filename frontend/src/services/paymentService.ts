import api from './api';

export interface PaymentMethod {
  id: string;
  user_id: string;
  type: string;
  brand: string;
  last4: string;
  expiry_month: number;
  expiry_year: number;
  holder_name: string;
  nickname: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface PaymentHistory {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  status: 'succeeded' | 'pending' | 'failed';
  payment_method_id: string;
  description: string;
  invoice_id: string | null;
  failure_reason?: string;
  method?: string; // Enriched field from API
  created_at: string;
  updated_at: string;
}

export interface BillingAddress {
  id?: string;
  user_id?: string;
  name: string;
  email: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  plan_name: string;
  status: string;
  amount: number;
  currency: string;
  interval: string;
  current_period_start: string;
  current_period_end: string;
  auto_renewal: boolean;
  payment_method_id: string;
  payment_method?: {
    brand: string;
    last4: string;
    nickname: string;
  };
  created_at: string;
  updated_at: string;
}

export interface NotificationSettings {
  id?: string;
  user_id?: string;
  payment_reminders: boolean;
  payment_failures: boolean;
  promotional_offers: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Plan {
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
  created_at?: string;
  updated_at?: string;
}

export interface SubscribeRequest {
  plan_id: string;
  payment_method_id: string;
  interval: 'monthly' | 'yearly';
}

export interface CreatePaymentMethodData {
  type?: string;
  brand: string;
  last4: string;
  expiry_month: number;
  expiry_year: number;
  holder_name: string;
  nickname?: string;
  is_default?: boolean;
}

export interface UpdatePaymentMethodData {
  nickname?: string;
  is_default?: boolean;
}

export interface PaginationInfo {
  current_page: number;
  total_pages: number;
  total_items: number;
  items_per_page: number;
}

export interface PaymentHistoryResponse {
  success: boolean;
  data: PaymentHistory[];
  pagination: PaginationInfo;
}

class PaymentService {
  /**
   * Get all payment methods for the authenticated user
   */
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    try {
      const response = await api.get('/payment/methods');
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      throw new Error('Erro ao carregar arsenal financeiro');
    }
  }

  /**
   * Add a new payment method
   */
  async addPaymentMethod(data: CreatePaymentMethodData): Promise<PaymentMethod> {
    try {
      const response = await api.post('/payment/methods', data);
      return response.data.data;
    } catch (error: any) {
      console.error('Error adding payment method:', error);
      const message = error.response?.data?.message || 'Erro ao adicionar armamento';
      throw new Error(message);
    }
  }

  /**
   * Update a payment method
   */
  async updatePaymentMethod(id: string, data: UpdatePaymentMethodData): Promise<PaymentMethod> {
    try {
      const response = await api.put(`/payment/methods/${id}`, data);
      return response.data.data;
    } catch (error: any) {
      console.error('Error updating payment method:', error);
      const message = error.response?.data?.message || 'Erro ao atualizar armamento';
      throw new Error(message);
    }
  }

  /**
   * Remove a payment method
   */
  async removePaymentMethod(id: string): Promise<void> {
    try {
      await api.delete(`/payment/methods/${id}`);
    } catch (error: any) {
      console.error('Error removing payment method:', error);
      const message = error.response?.data?.message || 'Erro ao remover armamento';
      throw new Error(message);
    }
  }

  /**
   * Get payment history with pagination and filters
   */
  async getPaymentHistory(
    page: number = 1,
    limit: number = 10,
    status?: string
  ): Promise<PaymentHistoryResponse> {
    try {
      const params: any = { page, limit };
      if (status) {
        params.status = status;
      }

      const response = await api.get('/payment/history', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching payment history:', error);
      throw new Error('Erro ao carregar relatório de operações');
    }
  }

  /**
   * Get billing address
   */
  async getBillingAddress(): Promise<BillingAddress | null> {
    try {
      const response = await api.get('/payment/billing');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching billing address:', error);
      throw new Error('Erro ao carregar base de operações');
    }
  }

  /**
   * Update billing address
   */
  async updateBillingAddress(data: BillingAddress): Promise<BillingAddress> {
    try {
      const response = await api.put('/payment/billing', data);
      return response.data.data;
    } catch (error: any) {
      console.error('Error updating billing address:', error);
      const message = error.response?.data?.message || 'Erro ao configurar base de operações';
      throw new Error(message);
    }
  }

  /**
   * Download invoice
   */
  async downloadInvoice(invoiceId: string): Promise<{ download_url: string; invoice: any }> {
    try {
      const response = await api.get(`/payment/invoices/${invoiceId}/download`);
      return response.data.data;
    } catch (error: any) {
      console.error('Error downloading invoice:', error);
      const message = error.response?.data?.message || 'Erro no download do relatório';
      throw new Error(message);
    }
  }

  /**
   * Get subscription information
   */
  async getSubscription(): Promise<Subscription | null> {
    try {
      const response = await api.get('/payment/subscription/manage');
      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching subscription:', error);
      if (error.response?.status === 404) {
        return null; // No active subscription
      }
      throw new Error('Erro ao carregar informações da operação');
    }
  }

  /**
   * Update subscription settings
   */
  async updateSubscription(data: {
    auto_renewal?: boolean;
    payment_method_id?: string;
  }): Promise<Subscription> {
    try {
      const response = await api.put('/payment/subscription/manage', data);
      return response.data.data;
    } catch (error: any) {
      console.error('Error updating subscription:', error);
      const message = error.response?.data?.message || 'Erro ao atualizar operação';
      throw new Error(message);
    }
  }

  /**
   * Get notification settings
   */
  async getNotificationSettings(): Promise<NotificationSettings> {
    try {
      const response = await api.get('/payment/notifications');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching notification settings:', error);
      // Return default settings on error
      return {
        payment_reminders: true,
        payment_failures: true,
        promotional_offers: false
      };
    }
  }

  /**
   * Update notification settings
   */
  async updateNotificationSettings(data: NotificationSettings): Promise<NotificationSettings> {
    try {
      const response = await api.put('/payment/notifications', data);
      return response.data.data;
    } catch (error: any) {
      console.error('Error updating notification settings:', error);
      const message = error.response?.data?.message || 'Erro ao atualizar alertas';
      throw new Error(message);
    }
  }

  /**
   * Set default payment method
   */
  async setDefaultPaymentMethod(id: string): Promise<PaymentMethod> {
    return this.updatePaymentMethod(id, { is_default: true });
  }

  /**
   * Helper method to format card number for display
   */
  formatCardNumber(number: string): string {
    return number.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ');
  }

  /**
   * Helper method to format expiry date
   */
  formatExpiryDate(month: number, year: number): string {
    const monthStr = month.toString().padStart(2, '0');
    const yearStr = year.toString().slice(-2);
    return `${monthStr}/${yearStr}`;
  }

  /**
   * Helper method to get card brand icon class
   */
  getCardBrandClass(brand: string): string {
    const brandClasses: { [key: string]: string } = {
      visa: 'bg-blue-600',
      mastercard: 'bg-red-600',
      amex: 'bg-green-600',
      elo: 'bg-purple-600',
      hipercard: 'bg-orange-600'
    };
    return brandClasses[brand.toLowerCase()] || 'bg-gray-600';
  }

  /**
   * Helper method to format currency
   */
  formatCurrency(amount: number, currency: string = 'BRL'): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  /**
   * Helper method to format date
   */
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('pt-BR');
  }

  /**
   * Helper method to get status badge configuration
   */
  getStatusConfig(status: string): { label: string; className: string } {
    const statusConfig: { [key: string]: { label: string; className: string } } = {
      succeeded: { label: 'CONFIRMADO', className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
      pending: { label: 'EM PROCESSO', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
      failed: { label: 'NEGADO', className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
      active: { label: 'OPERACIONAL', className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
      inactive: { label: 'INATIVA', className: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' },
      cancelled: { label: 'CANCELADA', className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' }
    };
    
    return statusConfig[status] || statusConfig.pending;
  }

  /**
   * Helper method to validate credit card number (basic Luhn algorithm)
   */
  validateCardNumber(number: string): boolean {
    const cleanNumber = number.replace(/\D/g, '');
    
    if (cleanNumber.length < 13 || cleanNumber.length > 19) {
      return false;
    }

    let sum = 0;
    let isEven = false;
    
    for (let i = cleanNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cleanNumber.charAt(i));
      
      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      
      sum += digit;
      isEven = !isEven;
    }
    
    return sum % 10 === 0;
  }

  /**
   * Helper method to get card brand from number
   */
  getCardBrand(number: string): string {
    const cleanNumber = number.replace(/\D/g, '');
    
    if (/^4/.test(cleanNumber)) {
      return 'visa';
    } else if (/^5[1-5]/.test(cleanNumber) || /^2[2-7]/.test(cleanNumber)) {
      return 'mastercard';
    } else if (/^3[47]/.test(cleanNumber)) {
      return 'amex';
    } else if (/^6/.test(cleanNumber)) {
      return 'discover';
    } else if (/^50|^63|^67/.test(cleanNumber)) {
      return 'elo';
    } else if (/^606282/.test(cleanNumber)) {
      return 'hipercard';
    }
    
    return 'unknown';
  }

  /**
   * Get available subscription plans
   */
  async getPlans(): Promise<Plan[]> {
    try {
      const response = await api.get('/payment/plans');
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching plans:', error);
      throw new Error('Erro ao carregar planos operacionais');
    }
  }

  /**
   * Subscribe to a plan
   */
  async subscribe(data: SubscribeRequest): Promise<Subscription> {
    try {
      const response = await api.post('/payment/subscribe', data);
      return response.data.data;
    } catch (error: any) {
      console.error('Error subscribing to plan:', error);
      const message = error.response?.data?.message || 'Erro ao ativar plano operacional';
      throw new Error(message);
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(): Promise<void> {
    try {
      await this.updateSubscription({ auto_renewal: false });
    } catch (error: any) {
      console.error('Error cancelling subscription:', error);
      const message = error.response?.data?.message || 'Erro ao cancelar operação';
      throw new Error(message);
    }
  }
}

export default new PaymentService();