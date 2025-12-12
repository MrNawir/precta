/**
 * T056: Paystack Client
 * Paystack API integration for payments (M-Pesa and Card)
 */

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || '';
const PAYSTACK_PUBLIC_KEY = process.env.PAYSTACK_PUBLIC_KEY || '';
const PAYSTACK_BASE_URL = 'https://api.paystack.co';

export interface PaystackInitializeParams {
  email: string;
  amount: number; // in kobo/cents (multiply KES by 100)
  currency?: string;
  reference?: string;
  callback_url?: string;
  channels?: ('card' | 'bank' | 'ussd' | 'qr' | 'mobile_money' | 'bank_transfer')[];
  metadata?: Record<string, unknown>;
}

export interface PaystackInitializeResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data: {
    id: number;
    domain: string;
    status: 'success' | 'failed' | 'pending' | 'abandoned';
    reference: string;
    amount: number;
    currency: string;
    channel: string;
    ip_address: string;
    paid_at: string;
    created_at: string;
    metadata: Record<string, unknown>;
    customer: {
      id: number;
      email: string;
      customer_code: string;
    };
    authorization?: {
      authorization_code: string;
      bin: string;
      last4: string;
      exp_month: string;
      exp_year: string;
      channel: string;
      card_type: string;
      bank: string;
      country_code: string;
      brand: string;
      reusable: boolean;
    };
  };
}

export interface PaystackRefundParams {
  transaction: string; // reference
  amount?: number;
  currency?: string;
  customer_note?: string;
  merchant_note?: string;
}

export interface PaystackRefundResponse {
  status: boolean;
  message: string;
  data: {
    transaction: {
      id: number;
      reference: string;
    };
    integration: number;
    status: string;
    refund_amount: number;
    currency: string;
    channel: string;
    customer_note: string;
    merchant_note: string;
    deducted_amount: number;
    fully_deducted: boolean;
  };
}

class PaystackClient {
  private async request<T>(
    endpoint: string,
    method: 'GET' | 'POST' = 'GET',
    body?: Record<string, unknown>
  ): Promise<T> {
    const url = `${PAYSTACK_BASE_URL}${endpoint}`;

    const response = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json() as T;

    if (!response.ok) {
      const error = data as { message?: string };
      throw new Error(`Paystack error: ${error.message || response.statusText}`);
    }

    return data;
  }

  /**
   * Initialize a transaction
   * @param params Transaction parameters
   * @returns Authorization URL and reference
   */
  async initializeTransaction(params: PaystackInitializeParams): Promise<PaystackInitializeResponse> {
    return this.request<PaystackInitializeResponse>('/transaction/initialize', 'POST', {
      email: params.email,
      amount: params.amount, // Already in kobo
      currency: params.currency || 'KES',
      reference: params.reference,
      callback_url: params.callback_url,
      channels: params.channels,
      metadata: params.metadata,
    });
  }

  /**
   * Verify a transaction
   * @param reference Transaction reference
   * @returns Transaction details
   */
  async verifyTransaction(reference: string): Promise<PaystackVerifyResponse> {
    return this.request<PaystackVerifyResponse>(`/transaction/verify/${reference}`);
  }

  /**
   * Get transaction by ID
   * @param id Transaction ID
   * @returns Transaction details
   */
  async getTransaction(id: number): Promise<PaystackVerifyResponse> {
    return this.request<PaystackVerifyResponse>(`/transaction/${id}`);
  }

  /**
   * List transactions
   * @param params Query parameters
   * @returns List of transactions
   */
  async listTransactions(params?: {
    perPage?: number;
    page?: number;
    customer?: number;
    status?: string;
    from?: string;
    to?: string;
  }): Promise<{ status: boolean; message: string; data: PaystackVerifyResponse['data'][] }> {
    const queryParams = new URLSearchParams();
    if (params?.perPage) queryParams.append('perPage', params.perPage.toString());
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.customer) queryParams.append('customer', params.customer.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.from) queryParams.append('from', params.from);
    if (params?.to) queryParams.append('to', params.to);

    const query = queryParams.toString();
    return this.request(`/transaction${query ? `?${query}` : ''}`);
  }

  /**
   * Create a refund
   * @param params Refund parameters
   * @returns Refund details
   */
  async createRefund(params: PaystackRefundParams): Promise<PaystackRefundResponse> {
    return this.request<PaystackRefundResponse>('/refund', 'POST', {
      transaction: params.transaction,
      amount: params.amount,
      currency: params.currency || 'KES',
      customer_note: params.customer_note,
      merchant_note: params.merchant_note,
    });
  }

  /**
   * Validate Paystack webhook signature
   * @param payload Request body as string
   * @param signature X-Paystack-Signature header
   * @returns Whether signature is valid
   */
  validateWebhook(payload: string, signature: string): boolean {
    const crypto = require('crypto');
    const hash = crypto
      .createHmac('sha512', PAYSTACK_SECRET_KEY)
      .update(payload)
      .digest('hex');

    return hash === signature;
  }

  /**
   * Get public key (for frontend initialization)
   */
  getPublicKey(): string {
    return PAYSTACK_PUBLIC_KEY;
  }

  /**
   * Convert KES to kobo (Paystack uses smallest currency unit)
   * @param kes Amount in KES
   * @returns Amount in kobo (KES * 100)
   */
  static toKobo(kes: number): number {
    return Math.round(kes * 100);
  }

  /**
   * Convert kobo to KES
   * @param kobo Amount in kobo
   * @returns Amount in KES
   */
  static fromKobo(kobo: number): number {
    return kobo / 100;
  }
}

export const paystackClient = new PaystackClient();
export default paystackClient;
