export interface Vehicle {
  _id: string;
  id: string;
  brand: string;
  model: string;
  year: number;
  slug: string;
  category: 'economique' | 'berline' | 'suv' | '4x4' | 'minibus' | 'luxe';
  registration: string;
  specifications: {
    transmission: 'manuelle' | 'automatique';
    fuel: 'essence' | 'diesel' | 'hybride' | 'electrique';
    seats: number;
    doors: number;
    color: string;
    mileage: number;
    features: {
      airConditioning: boolean;
      gps: boolean;
      bluetooth: boolean;
      camera: boolean;
      sunroof: boolean;
      leatherSeats: boolean;
      cruiseControl: boolean;
    };
  };
  images: {
    url: string;
    publicId: string;
    isPrimary: boolean;
  }[];
  pricing: {
    daily: number;
    weekly?: number;
    monthly?: number;
    chauffeurSupplement: number;
  };
  availability: {
    status: 'disponible' | 'loue' | 'maintenance' | 'hors-service';
    cities: string[];
  };
  chauffeurAvailable: boolean;
  stats: {
    totalRentals: number;
    totalRevenue: number;
    averageRating: number;
    totalReviews: number;
  };
  description?: string;
  isFeatured: boolean;
  isActive: boolean;
}

export interface VehicleFilter {
  category?: string;
  priceMin?: number;
  priceMax?: number;
  transmission?: string;
  seats?: string;
  city?: string;
  chauffeurAvailable?: boolean;
  search?: string;
}
