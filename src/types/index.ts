export interface User {
  id: string;
  name: string;
  email: string;
  role: 'farmer' | 'buyer' | 'seller';
  location: string;
  phone?: string;
  avatar?: string;
  verified: boolean;
  rating: number;
  joinDate: string;
  totalOrders: number;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface Crop {
  id: string;
  name: string;
  farmer: string;
  farmerId: string;
  quantity: number;
  price: number;
  location: string;
  images: string[];
  description: string;
  harvestDate?: string;
  category?: string;
  isOrganic: boolean;
  certifications: string[];
  storageType: 'fresh' | 'cold_storage' | 'dried';
  shelfLife: number; // days
  minOrderQuantity: number;
  availableFrom: string;
  availableTo: string;
  cropVariety: string;
  farmingMethod: 'organic' | 'conventional' | 'sustainable';
  qualityGrade: 'A' | 'B' | 'C';
  moistureContent?: number;
  coordinates?: {
    lat: number;
    lng: number;
  };
  reviews: Review[];
  averageRating: number;
  totalSold: number;
  featured: boolean;
}

export interface Product {
  id: string;
  name: string;
  seller: string;
  sellerId: string;
  category: 'seeds' | 'fertilizers' | 'pesticides' | 'tools' | 'equipment';
  price: number;
  stock: number;
  description: string;
  images: string[];
  specifications?: Record<string, string>;
  brand: string;
  manufacturingDate: string;
  expiryDate?: string;
  isOrganic: boolean;
  certifications: string[];
  minOrderQuantity: number;
  weight: number;
  unit: 'kg' | 'gm' | 'liter' | 'piece';
  reviews: Review[];
  averageRating: number;
  featured: boolean;
  discount?: {
    percentage: number;
    validTill: string;
  };
}

export interface Order {
  id: string;
  buyer: string;
  buyerId: string;
  seller: string;
  sellerId: string;
  item: string;
  itemId: string;
  quantity: number;
  price: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'in_transit' | 'delivered' | 'cancelled' | 'returned';
  type: 'crop' | 'product';
  orderDate: string;
  expectedDelivery?: string;
  actualDelivery?: string;
  paymentMethod: 'cod' | 'online' | 'bank_transfer';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  shippingAddress: {
    address: string;
    city: string;
    state: string;
    pincode: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  trackingId?: string;
  notes?: string;
  cancellationReason?: string;
}

export interface PredictionResult {
  crop: string;
  confidence: number;
  reasoning: string;
  soilData: {
    pH: number;
    clay: number;
    sand: number;
    silt: number;
    organicMatter: number;
    nitrogen: number;
    phosphorus: number;
    potassium: number;
  };
  weatherData: {
    temperature: number;
    humidity: number;
    rainfall: number;
    windSpeed: number;
    sunlightHours: number;
  };
  marketData?: {
    currentPrice: number;
    demandLevel: 'low' | 'medium' | 'high';
    competitionLevel: 'low' | 'medium' | 'high';
    seasonalTrend: 'increasing' | 'stable' | 'decreasing';
  };
  alternativeCrops?: {
    crop: string;
    confidence: number;
    reason: string;
  }[];
  bestPlantingTime: {
    start: string;
    end: string;
  };
  expectedYield: {
    min: number;
    max: number;
    unit: string;
  };
  risks: string[];
  recommendations: string[];
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  date: string;
  verified: boolean;
  helpful: number;
  images?: string[];
}

export interface Notification {
  id: string;
  userId: string;
  type: 'order' | 'crop_listed' | 'price_alert' | 'system' | 'review';
  title: string;
  message: string;
  data?: any;
  read: boolean;
  createdAt: string;
}

export interface PriceAlert {
  id: string;
  userId: string;
  cropName: string;
  targetPrice: number;
  condition: 'above' | 'below';
  isActive: boolean;
  createdAt: string;
}

export interface MarketAnalytics {
  cropName: string;
  currentPrice: number;
  priceHistory: {
    date: string;
    price: number;
    volume: number;
  }[];
  priceChange: {
    percentage: number;
    trend: 'up' | 'down' | 'stable';
  };
  demandSupplyRatio: number;
  seasonalPattern: {
    month: string;
    averagePrice: number;
    volume: number;
  }[];
  topProducingRegions: {
    region: string;
    production: number;
    marketShare: number;
  }[];
  qualityDistribution: {
    grade: string;
    percentage: number;
  }[];
}

export interface CropCalendar {
  cropName: string;
  variety?: string;
  region: string;
  plantingWindow: {
    start: string;
    end: string;
  };
  harvestWindow: {
    start: string;
    end: string;
  };
  stages: {
    name: string;
    duration: number;
    description: string;
    activities: string[];
  }[];
  requirements: {
    soilType: string[];
    temperature: {
      min: number;
      max: number;
    };
    rainfall: number;
    irrigation: string;
  };
  yieldExpectation: {
    min: number;
    max: number;
    unit: string;
  };
}