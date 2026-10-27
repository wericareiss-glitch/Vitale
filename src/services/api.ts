import { 
  MercadoPagoConfig, 
  OrderRecord, 
  OrderNotification, 
  OrderStatus, 
  CartItem, 
  PatientData 
} from '../types';

export const api = {
  // Mercado Pago Config
  async getConfig(): Promise<MercadoPagoConfig> {
    try {
      const res = await fetch('/api/mercadopago/config');
      return await res.json();
    } catch (e) {
      return { configured: false, mode: 'simulator', hasKey: false };
    }
  },

  async saveToken(accessToken: string, publicKey?: string) {
    const res = await fetch('/api/mercadopago/save-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accessToken, publicKey }),
    });
    return await res.json();
  },

  // Mercado Pago PIX
  async createPix(payload: {
    amount: number;
    description: string;
    payer: {
      email: string;
      name?: string;
      cpf?: string;
      firstName?: string;
      lastName?: string;
    };
    externalReference?: string;
  }) {
    const res = await fetch('/api/mercadopago/pix', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Falha ao gerar PIX no Mercado Pago');
    }
    return await res.json();
  },

  // Mercado Pago Card
  async processCard(payload: {
    amount: number;
    description: string;
    installments: number;
    cardNumber: string;
    cardholderName: string;
    expiry: string;
    cvv: string;
    payer: {
      email: string;
      cpf?: string;
    };
    externalReference?: string;
  }) {
    const res = await fetch('/api/mercadopago/card', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Falha ao processar pagamento com cartão.');
    }
    return await res.json();
  },

  // Check Payment Status (Polling)
  async checkPaymentStatus(paymentId: string) {
    const res = await fetch(`/api/mercadopago/payment-status/${paymentId}`);
    return await res.json();
  },

  // Simulate Status for Testing
  async simulateStatus(paymentId: string, status: OrderStatus) {
    const res = await fetch(`/api/mercadopago/simulate-status/${paymentId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    return await res.json();
  },

  // Orders API
  async getOrders(): Promise<OrderRecord[]> {
    try {
      const res = await fetch('/api/orders');
      if (!res.ok) return [];
      return await res.json();
    } catch (e) {
      return [];
    }
  },

  async getOrder(id: string): Promise<OrderRecord | null> {
    try {
      const res = await fetch(`/api/orders/${id}`);
      if (!res.ok) return null;
      return await res.json();
    } catch (e) {
      return null;
    }
  },

  async createOrder(payload: {
    id?: string;
    items: CartItem[];
    subtotal: number;
    discount: number;
    total: number;
    paymentMethod: 'pix' | 'cartao';
    paymentStatus: OrderStatus;
    paymentId?: string;
    paymentDetail?: string;
    patient: PatientData;
    schedule: {
      date: string;
      isoDate: string;
      time: string;
      notes?: string;
    };
    pixData?: {
      qrCode: string;
      qrCodeBase64?: string;
      ticketUrl?: string;
      expiration?: string;
    };
  }): Promise<OrderRecord> {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      throw new Error('Erro ao salvar pedido.');
    }
    return await res.json();
  },

  async updateOrderStatus(orderId: string, status: OrderStatus, note?: string): Promise<OrderRecord> {
    const res = await fetch(`/api/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, note }),
    });
    if (!res.ok) {
      throw new Error('Erro ao atualizar status do pedido.');
    }
    return await res.json();
  },

  // Notifications API
  async getNotifications(): Promise<OrderNotification[]> {
    try {
      const res = await fetch('/api/notifications');
      if (!res.ok) return [];
      return await res.json();
    } catch (e) {
      return [];
    }
  },

  async markNotificationRead(id: string) {
    await fetch(`/api/notifications/${id}/read`, { method: 'POST' });
  },

  async markAllNotificationsRead() {
    await fetch('/api/notifications/read-all', { method: 'POST' });
  },
};
