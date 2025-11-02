import { apiClient } from "@/lib/api-client";
import { BackendApiResponse } from "@/types";

export interface InitiatePaymentRequest {
  plan_id: string;
  payment_method: "momo" | "cc" | "spenn";
  currency: "RWF" | "USD"; // User-selected currency
  msisdn?: string;
  promo_code?: string; // Optional promo code
}

export interface InitiatePaymentResponse {
  transaction: {
    id: string;
    refid: string;
    amount: number;
    original_amount?: number;
    discount_amount?: number;
    discount_percentage?: number;
    promo_code?: string;
    currency: string;
    status: string;
    checkout_url?: string;
    payment_method: string;
  };
}

export interface Transaction {
  id: string;
  refid: string;
  kpay_tid?: string;
  amount: number;
  original_amount?: number;
  discount_amount?: number;
  discount_percentage?: number;
  promo_code?: string;
  currency: string;
  status: string;
  status_description?: string;
  payment_method: string;
  subscription_id?: string;
  plan: {
    id: string;
    name: string;
    type: string;
    duration_days: number;
    price: number;
  };
  user?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
  };
  created_at: string;
}

export interface TransactionsResponse {
  transactions: Transaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface PromoCodeValidationResponse {
  valid: boolean;
  message: string;
  discount_percentage?: number;
  promo_code?: {
    code: string;
    description?: string;
    discount_percentage: number;
  };
}

class PaymentService {
  async initiatePayment(
    data: InitiatePaymentRequest
  ): Promise<InitiatePaymentResponse> {
    const response = await apiClient.post<BackendApiResponse<InitiatePaymentResponse>>(
      "/payments/initiate",
      data
    );
    return response.data!;
  }

  async validatePromoCode(
    code: string,
    planId: string
  ): Promise<PromoCodeValidationResponse> {
    const response = await apiClient.post<BackendApiResponse<PromoCodeValidationResponse>>(
      "/promo-codes/validate",
      { code, plan_id: planId }
    );
    return response.data!;
  }

  async checkTransactionStatus(transactionId: string): Promise<Transaction> {
    const response = await apiClient.get<BackendApiResponse<{ transaction: Transaction }>>(
      `/payments/transactions/${transactionId}`
    );
    return response.data!.transaction;
  }

  async getMyTransactions(
    page: number = 1,
    limit: number = 10
  ): Promise<TransactionsResponse> {
    const response = await apiClient.get<BackendApiResponse<TransactionsResponse>>(
      "/payments/transactions",
      {
        params: { page, limit },
      }
    );
    return response.data!;
  }

  async getAllTransactions(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }): Promise<TransactionsResponse> {
    const response = await apiClient.get<BackendApiResponse<TransactionsResponse>>(
      "/payments/transactions/all/admin",
      { params }
    );
    return response.data!;
  }
}

export const paymentService = new PaymentService();
