import api from './api';
import { RentalPriceCalculation } from '../utils/priceCalculator';

export interface CalculatePriceRequest {
  vehicleId: string;
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  withChauffeur: boolean;
  options?: Array<{ name: string; price: number }>;
}

export interface CalculatePriceResponse {
  success: boolean;
  data: RentalPriceCalculation & {
    vehicle: {
      id: string;
      brand: string;
      model: string;
      year: number;
    };
    period: {
      startDate: string;
      endDate: string;
      numberOfDays: number;
    };
  };
}

export interface Vehicle {
  _id: string;
  brand: string;
  model: string;
  year: number;
  category: string;
  seats: number;
  transmission: 'manual' | 'automatic';
  fuelType: 'petrol' | 'diesel' | 'electric' | 'hybrid';
  pricing: {
    daily: number;
    weekly: number;
    monthly: number;
    chauffeurSupplement: number;
  };
  features?: string[];
  images?: Array<{
    url: string;
    publicId: string;
    isPrimary: boolean;
  }>;
  description?: string;
  isActive: boolean;
  isFeatured: boolean;
  startingPrice?: number; // Prix "À partir de" avec réduction maximale
}

export interface GetVehiclesResponse {
  success: boolean;
  count: number;
  total: number;
  page: number;
  pages: number;
  data: Vehicle[];
}

export interface GetVehicleResponse {
  success: boolean;
  data: Vehicle;
}

class VehicleService {
  /**
   * Récupère la liste des véhicules avec filtres
   */
  async getVehicles(params?: {
    category?: string;
    minSeats?: number;
    transmission?: 'manual' | 'automatic';
    fuelType?: string;
    minPrice?: number;
    maxPrice?: number;
    sort?: string;
    page?: number;
    limit?: number;
  }): Promise<GetVehiclesResponse> {
    const response = await api.get<GetVehiclesResponse>('/vehicles', { params });
    return response.data;
  }

  /**
   * Récupère les véhicules populaires
   */
  async getPopularVehicles(): Promise<GetVehiclesResponse> {
    const response = await api.get<GetVehiclesResponse>('/vehicles/featured/popular');
    return response.data;
  }

  /**
   * Récupère un véhicule par ID
   */
  async getVehicle(id: string): Promise<GetVehicleResponse> {
    const response = await api.get<GetVehicleResponse>(`/vehicles/${id}`);
    return response.data;
  }

  /**
   * Calcule le prix d'une location avec réductions dégressives
   */
  async calculatePrice(request: CalculatePriceRequest): Promise<CalculatePriceResponse> {
    const response = await api.post<CalculatePriceResponse>('/vehicles/calculate-price', request);
    return response.data;
  }

  /**
   * Vérifie la disponibilité d'un véhicule
   */
  async checkAvailability(
    vehicleId: string,
    startDate: string,
    endDate: string
  ): Promise<{ success: boolean; available: boolean; message?: string }> {
    const response = await api.get(`/vehicles/${vehicleId}/availability`, {
      params: { startDate, endDate },
    });
    return response.data;
  }

  /**
   * Crée un nouveau véhicule (Admin only)
   */
  async createVehicle(formData: FormData): Promise<GetVehicleResponse> {
    const response = await api.post<GetVehicleResponse>('/vehicles', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  /**
   * Met à jour un véhicule (Admin only)
   */
  async updateVehicle(id: string, formData: FormData): Promise<GetVehicleResponse> {
    const response = await api.put<GetVehicleResponse>(`/vehicles/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  /**
   * Supprime un véhicule (Admin only)
   */
  async deleteVehicle(id: string): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/vehicles/${id}`);
    return response.data;
  }

  /**
   * Supprime une image d'un véhicule (Admin only)
   */
  async deleteVehicleImage(
    vehicleId: string,
    imageId: string
  ): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/vehicles/${vehicleId}/images/${imageId}`);
    return response.data;
  }

  /**
   * Définit une image comme primaire (Admin only)
   */
  async setPrimaryImage(
    vehicleId: string,
    imageId: string
  ): Promise<{ success: boolean; message: string }> {
    const response = await api.put(`/vehicles/${vehicleId}/images/${imageId}/primary`);
    return response.data;
  }
}

export default new VehicleService();
