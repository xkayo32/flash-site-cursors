import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import fs from 'fs';
import path from 'path';

const router = Router();

// Path to payment data file
const PAYMENT_DATA_PATH = path.join(__dirname, '../../payment_data.json');

// Helper function to read payment data
const readPaymentData = () => {
  try {
    if (!fs.existsSync(PAYMENT_DATA_PATH)) {
      // Create initial data structure if file doesn't exist
      const initialData = {
        payment_methods: [],
        payment_history: [],
        billing_addresses: [],
        subscriptions: [],
        invoices: [],
        notification_settings: []
      };
      fs.writeFileSync(PAYMENT_DATA_PATH, JSON.stringify(initialData, null, 2));
      return initialData;
    }
    const data = fs.readFileSync(PAYMENT_DATA_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading payment data:', error);
    return {
      payment_methods: [],
      payment_history: [],
      billing_addresses: [],
      subscriptions: [],
      invoices: [],
      notification_settings: []
    };
  }
};

// Helper function to write payment data
const writePaymentData = (data: any) => {
  try {
    fs.writeFileSync(PAYMENT_DATA_PATH, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing payment data:', error);
    return false;
  }
};

// Helper function to generate ID
const generateId = (prefix: string) => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// GET /api/v1/payment/methods - List payment methods
router.get('/methods', authMiddleware, (req: Request, res: Response) => {
  try {
    const data = readPaymentData();
    const userId = req.user?.id;
    
    const userPaymentMethods = data.payment_methods.filter(
      (method: any) => method.user_id == userId
    );
    
    res.json({
      success: true,
      data: userPaymentMethods
    });
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    res.status(500).json({
      success: false,
      message: 'ERRO NO SISTEMA DE ARSENAL FINANCEIRO'
    });
  }
});

// POST /api/v1/payment/methods - Add payment method
router.post('/methods', authMiddleware, (req: Request, res: Response) => {
  try {
    const data = readPaymentData();
    const userId = req.user?.id;
    const {
      type = 'card',
      brand,
      last4,
      expiry_month,
      expiry_year,
      holder_name,
      nickname,
      is_default = false
    } = req.body;

    // Validate required fields
    if (!brand || !last4 || !expiry_month || !expiry_year || !holder_name) {
      return res.status(400).json({
        success: false,
        message: 'DADOS INSUFICIENTES PARA CADASTRO DO ARMAMENTO'
      });
    }

    // If this is set as default, unset all other defaults for this user
    if (is_default) {
      data.payment_methods = data.payment_methods.map((method: any) => {
        if (method.user_id == userId) {
          method.is_default = false;
        }
        return method;
      });
    }

    const newPaymentMethod = {
      id: generateId('pm'),
      user_id: userId,
      type,
      brand: brand.toLowerCase(),
      last4,
      expiry_month: parseInt(expiry_month),
      expiry_year: parseInt(expiry_year),
      holder_name,
      nickname: nickname || `CARTÃO ${brand.toUpperCase()} ****${last4}`,
      is_default,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    data.payment_methods.push(newPaymentMethod);
    
    if (writePaymentData(data)) {
      res.status(201).json({
        success: true,
        message: 'ARMAMENTO ADICIONADO AO ARSENAL!',
        data: newPaymentMethod
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'FALHA NA OPERAÇÃO DE ARSENAL'
      });
    }
  } catch (error) {
    console.error('Error adding payment method:', error);
    res.status(500).json({
      success: false,
      message: 'ERRO CRÍTICO NO SISTEMA DE ARSENAL'
    });
  }
});

// PUT /api/v1/payment/methods/:id - Update payment method
router.put('/methods/:id', authMiddleware, (req: Request, res: Response) => {
  try {
    const data = readPaymentData();
    const userId = req.user?.id;
    const methodId = req.params.id;
    const updateData = req.body;

    const methodIndex = data.payment_methods.findIndex(
      (method: any) => method.id === methodId && method.user_id == userId
    );

    if (methodIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'ARMAMENTO NÃO ENCONTRADO NO ARSENAL'
      });
    }

    // If setting as default, unset all other defaults for this user
    if (updateData.is_default) {
      data.payment_methods = data.payment_methods.map((method: any) => {
        if (method.user_id == userId && method.id !== methodId) {
          method.is_default = false;
        }
        return method;
      });
    }

    // Update the payment method
    data.payment_methods[methodIndex] = {
      ...data.payment_methods[methodIndex],
      ...updateData,
      updated_at: new Date().toISOString()
    };

    if (writePaymentData(data)) {
      res.json({
        success: true,
        message: 'ARMAMENTO ATUALIZADO COM SUCESSO!',
        data: data.payment_methods[methodIndex]
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'FALHA NA ATUALIZAÇÃO DO ARSENAL'
      });
    }
  } catch (error) {
    console.error('Error updating payment method:', error);
    res.status(500).json({
      success: false,
      message: 'ERRO CRÍTICO NO SISTEMA DE ARSENAL'
    });
  }
});

// DELETE /api/v1/payment/methods/:id - Remove payment method
router.delete('/methods/:id', authMiddleware, (req: Request, res: Response) => {
  try {
    const data = readPaymentData();
    const userId = req.user?.id;
    const methodId = req.params.id;

    const methodIndex = data.payment_methods.findIndex(
      (method: any) => method.id === methodId && method.user_id == userId
    );

    if (methodIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'ARMAMENTO NÃO ENCONTRADO NO ARSENAL'
      });
    }

    // Remove the payment method
    data.payment_methods.splice(methodIndex, 1);

    if (writePaymentData(data)) {
      res.json({
        success: true,
        message: 'ARMAMENTO REMOVIDO DO ARSENAL!'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'FALHA NA REMOÇÃO DO ARSENAL'
      });
    }
  } catch (error) {
    console.error('Error removing payment method:', error);
    res.status(500).json({
      success: false,
      message: 'ERRO CRÍTICO NO SISTEMA DE ARSENAL'
    });
  }
});

// GET /api/v1/payment/history - Get payment history
router.get('/history', authMiddleware, (req: Request, res: Response) => {
  try {
    const data = readPaymentData();
    const userId = req.user?.id;
    const { page = 1, limit = 10, status } = req.query;
    
    let userPayments = data.payment_history.filter(
      (payment: any) => payment.user_id == userId
    );

    // Filter by status if provided
    if (status) {
      userPayments = userPayments.filter((payment: any) => payment.status === status);
    }

    // Sort by date (newest first)
    userPayments.sort((a: any, b: any) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    // Pagination
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedPayments = userPayments.slice(startIndex, endIndex);

    // Enrich with payment method info
    const enrichedPayments = paginatedPayments.map((payment: any) => {
      const paymentMethod = data.payment_methods.find(
        (method: any) => method.id === payment.payment_method_id
      );
      
      return {
        ...payment,
        method: paymentMethod ? 
          `${paymentMethod.brand.charAt(0).toUpperCase() + paymentMethod.brand.slice(1)} ****${paymentMethod.last4}` :
          'Método removido'
      };
    });

    res.json({
      success: true,
      data: enrichedPayments,
      pagination: {
        current_page: pageNum,
        total_pages: Math.ceil(userPayments.length / limitNum),
        total_items: userPayments.length,
        items_per_page: limitNum
      }
    });
  } catch (error) {
    console.error('Error fetching payment history:', error);
    res.status(500).json({
      success: false,
      message: 'ERRO NO RELATÓRIO DE OPERAÇÕES FINANCEIRAS'
    });
  }
});

// GET /api/v1/payment/billing - Get billing address
router.get('/billing', authMiddleware, (req: Request, res: Response) => {
  try {
    const data = readPaymentData();
    const userId = req.user?.id;
    
    const billingAddress = data.billing_addresses.find(
      (address: any) => address.user_id == userId && address.is_default
    );
    
    res.json({
      success: true,
      data: billingAddress || null
    });
  } catch (error) {
    console.error('Error fetching billing address:', error);
    res.status(500).json({
      success: false,
      message: 'ERRO NO SISTEMA DE BASE DE OPERAÇÕES'
    });
  }
});

// PUT /api/v1/payment/billing - Update billing address
router.put('/billing', authMiddleware, (req: Request, res: Response) => {
  try {
    const data = readPaymentData();
    const userId = req.user?.id;
    const {
      name,
      email,
      line1,
      line2,
      city,
      state,
      postal_code,
      country = 'BR'
    } = req.body;

    // Validate required fields
    if (!name || !email || !line1 || !city || !state || !postal_code) {
      return res.status(400).json({
        success: false,
        message: 'DADOS INSUFICIENTES PARA CONFIGURAR BASE'
      });
    }

    const existingAddressIndex = data.billing_addresses.findIndex(
      (address: any) => address.user_id == userId && address.is_default
    );

    const billingData = {
      name,
      email,
      line1,
      line2: line2 || '',
      city,
      state,
      postal_code,
      country,
      is_default: true,
      updated_at: new Date().toISOString()
    };

    if (existingAddressIndex !== -1) {
      // Update existing address
      data.billing_addresses[existingAddressIndex] = {
        ...data.billing_addresses[existingAddressIndex],
        ...billingData
      };
    } else {
      // Create new address
      const newAddress = {
        id: generateId('ba'),
        user_id: userId,
        ...billingData,
        created_at: new Date().toISOString()
      };
      data.billing_addresses.push(newAddress);
    }

    if (writePaymentData(data)) {
      res.json({
        success: true,
        message: 'BASE DE OPERAÇÕES CONFIGURADA!',
        data: billingData
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'FALHA NA CONFIGURAÇÃO DA BASE'
      });
    }
  } catch (error) {
    console.error('Error updating billing address:', error);
    res.status(500).json({
      success: false,
      message: 'ERRO CRÍTICO NO SISTEMA DE BASE'
    });
  }
});

// GET /api/v1/payment/invoices/:id/download - Download invoice
router.get('/invoices/:id/download', authMiddleware, (req: Request, res: Response) => {
  try {
    const data = readPaymentData();
    const userId = req.user?.id;
    const invoiceId = req.params.id;

    const invoice = data.invoices.find(
      (inv: any) => inv.id === invoiceId && inv.user_id == userId
    );

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'RELATÓRIO NÃO ENCONTRADO'
      });
    }

    // In a real implementation, this would generate and return a PDF
    // For now, we'll return invoice data that can be used to generate a PDF on frontend
    res.json({
      success: true,
      message: 'DOWNLOAD DO RELATÓRIO INICIADO!',
      data: {
        ...invoice,
        download_url: `${req.protocol}://${req.get('host')}/invoices/${invoiceId}.pdf`
      }
    });
  } catch (error) {
    console.error('Error downloading invoice:', error);
    res.status(500).json({
      success: false,
      message: 'ERRO NO DOWNLOAD DO RELATÓRIO'
    });
  }
});

// GET /api/v1/subscription/manage - Get subscription info (aliased)
router.get('/manage', authMiddleware, (req: Request, res: Response) => {
  try {
    const data = readPaymentData();
    const userId = req.user?.id;
    
    const subscription = data.subscriptions.find(
      (sub: any) => sub.user_id == userId && sub.status === 'active'
    );
    
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'NENHUMA OPERAÇÃO ATIVA ENCONTRADA'
      });
    }

    // Get payment method info
    const paymentMethod = data.payment_methods.find(
      (method: any) => method.id === subscription.payment_method_id
    );

    res.json({
      success: true,
      data: {
        ...subscription,
        payment_method: paymentMethod ? {
          brand: paymentMethod.brand,
          last4: paymentMethod.last4,
          nickname: paymentMethod.nickname
        } : null
      }
    });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    res.status(500).json({
      success: false,
      message: 'ERRO NO COMANDO DE ASSINATURAS'
    });
  }
});

// GET /api/v1/subscription/manage - Get subscription info (legacy route)
router.get('/subscription/manage', authMiddleware, (req: Request, res: Response) => {
  try {
    const data = readPaymentData();
    const userId = req.user?.id;
    
    const subscription = data.subscriptions.find(
      (sub: any) => sub.user_id == userId && sub.status === 'active'
    );
    
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'NENHUMA OPERAÇÃO ATIVA ENCONTRADA'
      });
    }

    // Get payment method info
    const paymentMethod = data.payment_methods.find(
      (method: any) => method.id === subscription.payment_method_id
    );

    res.json({
      success: true,
      data: {
        ...subscription,
        payment_method: paymentMethod ? {
          brand: paymentMethod.brand,
          last4: paymentMethod.last4,
          nickname: paymentMethod.nickname
        } : null
      }
    });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    res.status(500).json({
      success: false,
      message: 'ERRO NO COMANDO DE ASSINATURAS'
    });
  }
});

// PUT /api/v1/subscription/manage - Update subscription
router.put('/subscription/manage', authMiddleware, (req: Request, res: Response) => {
  try {
    const data = readPaymentData();
    const userId = req.user?.id;
    const { auto_renewal, payment_method_id } = req.body;
    
    const subscriptionIndex = data.subscriptions.findIndex(
      (sub: any) => sub.user_id == userId && sub.status === 'active'
    );
    
    if (subscriptionIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'NENHUMA OPERAÇÃO ATIVA ENCONTRADA'
      });
    }

    // Update subscription
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (typeof auto_renewal === 'boolean') {
      updateData.auto_renewal = auto_renewal;
    }

    if (payment_method_id) {
      // Verify payment method belongs to user
      const paymentMethod = data.payment_methods.find(
        (method: any) => method.id === payment_method_id && method.user_id == userId
      );
      
      if (!paymentMethod) {
        return res.status(400).json({
          success: false,
          message: 'ARMAMENTO INVÁLIDO PARA OPERAÇÃO'
        });
      }
      
      updateData.payment_method_id = payment_method_id;
    }

    data.subscriptions[subscriptionIndex] = {
      ...data.subscriptions[subscriptionIndex],
      ...updateData
    };

    if (writePaymentData(data)) {
      res.json({
        success: true,
        message: 'OPERAÇÃO ATUALIZADA COM SUCESSO!',
        data: data.subscriptions[subscriptionIndex]
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'FALHA NA ATUALIZAÇÃO DA OPERAÇÃO'
      });
    }
  } catch (error) {
    console.error('Error updating subscription:', error);
    res.status(500).json({
      success: false,
      message: 'ERRO CRÍTICO NO COMANDO DE ASSINATURAS'
    });
  }
});

// GET /api/v1/payment/notifications - Get notification settings
router.get('/notifications', authMiddleware, (req: Request, res: Response) => {
  try {
    const data = readPaymentData();
    const userId = req.user?.id;
    
    const notifications = data.notification_settings.find(
      (setting: any) => setting.user_id == userId
    );
    
    res.json({
      success: true,
      data: notifications || {
        payment_reminders: true,
        payment_failures: true,
        promotional_offers: false
      }
    });
  } catch (error) {
    console.error('Error fetching notification settings:', error);
    res.status(500).json({
      success: false,
      message: 'ERRO NO SISTEMA DE ALERTAS'
    });
  }
});

// PUT /api/v1/payment/notifications - Update notification settings
router.put('/notifications', authMiddleware, (req: Request, res: Response) => {
  try {
    const data = readPaymentData();
    const userId = req.user?.id;
    const { payment_reminders, payment_failures, promotional_offers } = req.body;
    
    const existingIndex = data.notification_settings.findIndex(
      (setting: any) => setting.user_id == userId
    );

    const notificationData = {
      payment_reminders: typeof payment_reminders === 'boolean' ? payment_reminders : true,
      payment_failures: typeof payment_failures === 'boolean' ? payment_failures : true,
      promotional_offers: typeof promotional_offers === 'boolean' ? promotional_offers : false,
      updated_at: new Date().toISOString()
    };

    if (existingIndex !== -1) {
      // Update existing settings
      data.notification_settings[existingIndex] = {
        ...data.notification_settings[existingIndex],
        ...notificationData
      };
    } else {
      // Create new settings
      const newSettings = {
        id: generateId('ns'),
        user_id: userId,
        ...notificationData,
        created_at: new Date().toISOString()
      };
      data.notification_settings.push(newSettings);
    }

    if (writePaymentData(data)) {
      res.json({
        success: true,
        message: 'ALERTAS DE COMANDO ATUALIZADOS!',
        data: notificationData
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'FALHA NA ATUALIZAÇÃO DOS ALERTAS'
      });
    }
  } catch (error) {
    console.error('Error updating notification settings:', error);
    res.status(500).json({
      success: false,
      message: 'ERRO CRÍTICO NO SISTEMA DE ALERTAS'
    });
  }
});

export default router;