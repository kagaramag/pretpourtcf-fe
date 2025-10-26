import { apiClient } from "@/lib/api-client";
import { BackendApiResponse } from "@/types";

export interface InitiatePaymentRequest {
  plan_id: string;
  payment_method: "momo" | "cc" | "spenn";
  msisdn?: string;
}

export interface InitiatePaymentResponse {
  transaction: {
    id: string;
    refid: string;
    amount: number;
    currency: string;
    status: string;
    checkout_url?: string;
    payment_method: string;
  };
}

export interface Transaction {
  id: string;
  refid: string;
  amount: number;
  currency: string;
  status: string;
  status_description?: string;
  payment_method: string;
  plan: {
    id: string;
    name: string;
    type: string;
    duration_days: number;
    price: number;
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
}

export const paymentService = new PaymentService();
