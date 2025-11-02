export interface PromoCode {
  id: string;
  code: string;
  description?: string;
  discount_percentage: number;
  status: "active" | "inactive" | "expired";
  start_date: string;
  end_date: string;
  max_uses?: number;
  current_uses: number;
  applicable_plans?: {
    id: string;
    name: string;
    type: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface CreatePromoCodeRequest {
  code: string;
  description?: string;
  discount_percentage: number;
  status?: "active" | "inactive" | "expired";
  start_date: string;
  end_date: string;
  max_uses?: number;
  applicable_plans?: string[];
}

export interface UpdatePromoCodeRequest {
  code?: string;
  description?: string;
  discount_percentage?: number;
  status?: "active" | "inactive" | "expired";
  start_date?: string;
  end_date?: string;
  max_uses?: number;
  applicable_plans?: string[];
}
