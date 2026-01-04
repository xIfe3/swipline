// lib/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface CreateParcelRequest {
  sender_name: string;
  sender_email: string;
  sender_phone: string;
  sender_address?: string;
  recipient_name: string;
  recipient_email: string;
  recipient_phone: string;
  recipient_address: string;
  destination_country: string;
  weight: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
    unit: "cm" | "in";
  };
  contents?: Array<{
    description: string;
    quantity: number;
    value: number;
  }>;
}

export interface ParcelResponse {
  id: string;
  tracking_id: string;
  sender_name: string;
  sender_email: string;
  sender_phone: string;
  recipient_name: string;
  recipient_email: string;
  recipient_phone: string;
  recipient_address: string;
  destination_country: string;
  weight: number;
  dimensions: Record<string, any>;
  contents?: Record<string, any>[];
  status: string;
  current_location: string;
  coordinates?: Record<string, number>;
  shipping_cost: number;
  border_fee: number;
  border_fee_paid: boolean;
  estimated_delivery?: string;
  actual_delivery?: string;
  created_at: string;
  updated_at?: string;
}

export interface CreatePaymentRequest {
  tracking_id: string;
  email?: string;
}

export interface PaymentResponse {
  client_secret: string;
  payment_id: string;
  amount: number;
  currency: string;
  tracking_id: string;
}

export interface TrackingResponse {
  tracking_id: string;
  status: string;
  current_location: string;
  coordinates?: Record<string, number>;
  border_fee: number;
  border_fee_paid: boolean;
  estimated_delivery?: string;
  history: Array<{
    status: string;
    location: string;
    description?: string;
    created_at: string;
  }>;
}

// Auth interfaces
export interface RegisterRequest {
  email: string;
  full_name: string;
  password: string;
  phone?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: {
    id: string;
    email: string;
    full_name: string;
    role: string;
  };
}

class ApiService {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("access_token");
    }
  }

  private getHeaders() {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    return headers;
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== "undefined") {
      localStorage.setItem("access_token", token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token");
    }
  }

  // Auth endpoints
  async register(data: RegisterRequest) {
    const response = await fetch(`${this.baseUrl}/auth/register`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Registration failed: ${response.statusText}`);
    }

    return response.json();
  }

  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await fetch(`${this.baseUrl}/auth/login`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Login failed: ${response.statusText}`);
    }

    const result = await response.json();
    this.setToken(result.access_token);
    return result;
  }

  async logout() {
    this.clearToken();
  }

  // Parcel endpoints
  async createParcel(data: CreateParcelRequest): Promise<ParcelResponse> {
    const response = await fetch(`${this.baseUrl}/parcels/`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to create parcel");
    }

    return response.json();
  }

  async getParcel(trackingId: string): Promise<ParcelResponse> {
    const response = await fetch(`${this.baseUrl}/parcels/${trackingId}`, {
      method: "GET",
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to fetch parcel");
    }

    return response.json();
  }

  async trackParcel(trackingId: string): Promise<TrackingResponse> {
    const response = await fetch(`${this.baseUrl}/tracking/${trackingId}`, {
      method: "GET",
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to track parcel");
    }

    return response.json();
  }

  async getTrackingHistory(trackingId: string): Promise<TrackingResponse> {
    const response = await fetch(
      `${this.baseUrl}/parcels/${trackingId}/tracking`,
      {
        method: "GET",
        headers: this.getHeaders(),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to fetch tracking history");
    }

    return response.json();
  }

  // Payment endpoints
  async createPayment(data: CreatePaymentRequest): Promise<PaymentResponse> {
    const response = await fetch(`${this.baseUrl}/payments/border`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to create payment");
    }

    return response.json();
  }

  async getPaymentStatus(paymentId: string) {
    const response = await fetch(`${this.baseUrl}/payments/${paymentId}`, {
      method: "GET",
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to fetch payment status");
    }

    return response.json();
  }

  // User parcels
  async getUserParcels(skip = 0, limit = 100) {
    const response = await fetch(
      `${this.baseUrl}/parcels/user?skip=${skip}&limit=${limit}`,
      {
        method: "GET",
        headers: this.getHeaders(),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to fetch user parcels");
    }

    return response.json();
  }
}

export const apiService = new ApiService(API_BASE_URL);
