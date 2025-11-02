import { apiClient } from "@/lib/api-client";
import { BackendApiResponse } from "@/types";
import {
  PromoCode,
  CreatePromoCodeRequest,
  UpdatePromoCodeRequest,
} from "@/types/promo-code";

export interface PromoCodesResponse {
  promo_codes: PromoCode[];
  total: number;
}

export interface PromoCodeResponse {
  promo_code: PromoCode;
}

class PromoCodeService {
  /**
   * Get all promo codes (Admin only)
   */
  async getAllPromoCodes(params?: {
    status?: string;
    active_only?: boolean;
  }): Promise<PromoCodesResponse> {
    const response = await apiClient.get<BackendApiResponse<PromoCodesResponse>>(
      "/promo-codes",
      { params }
    );
    return response.data!;
  }

  /**
   * Get a single promo code by ID (Admin only)
   */
  async getPromoCodeById(id: string): Promise<PromoCode> {
    const response = await apiClient.get<BackendApiResponse<PromoCodeResponse>>(
      `/promo-codes/${id}`
    );
    return response.data!.promo_code;
  }

  /**
   * Create a new promo code (Admin only)
   */
  async createPromoCode(data: CreatePromoCodeRequest): Promise<PromoCode> {
    const response = await apiClient.post<BackendApiResponse<PromoCodeResponse>>(
      "/promo-codes",
      data
    );
    return response.data!.promo_code;
  }

  /**
   * Update a promo code (Admin only)
   */
  async updatePromoCode(
    id: string,
    data: UpdatePromoCodeRequest
  ): Promise<PromoCode> {
    const response = await apiClient.put<BackendApiResponse<PromoCodeResponse>>(
      `/promo-codes/${id}`,
      data
    );
    return response.data!.promo_code;
  }

  /**
   * Delete a promo code (Admin only)
   */
  async deletePromoCode(id: string): Promise<void> {
    await apiClient.delete(`/promo-codes/${id}`);
  }
}

export const promoCodeService = new PromoCodeService();
