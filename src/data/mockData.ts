import { Crop, PredictionResult, Product, User } from '@/types';

// Import images
import fertilizerImg from '@/assets/fertilizer.jpg';
import maizeImg from '@/assets/maize.jpg';
import onionImg from '@/assets/onion.jpg';
import riceImg from '@/assets/rice.jpg';
import seedsImg from '@/assets/seeds.jpg';
import wheatImg from '@/assets/wheat.jpg';

import { CropCalendar, MarketAnalytics, Notification, Order, Review } from '@/types';

// Import images

export const mockUsers: User[] = [
  { 
    id: '1', 
    name: 'Ramesh Kumar', 
    email: 'ramesh@farm.com', 
    role: 'farmer', 
    location: 'Ludhiana, Punjab',
    phone: '+91 98765 43210',
    verified: true,
    rating: 4.8,
    joinDate: '2023-01-15',
    totalOrders: 156,
    coordinates: { lat: 30.9010, lng: 75.8573 }
  },
  { 
    id: '2', 
    name: 'Kavita Patel', 
    email: 'kavita@farm.com', 
    role: 'farmer', 
    location: 'Anand, Gujarat',
    phone: '+91 99876 54321',
    verified: true,
    rating: 4.9,
    joinDate: '2023-03-22',
    totalOrders: 203,
    coordinates: { lat: 22.5645, lng: 72.9289 }
  },
  { 
    id: '3', 
    name: 'Arjun Singh', 
    email: 'arjun@buyer.com', 
    role: 'buyer', 
    location: 'New Delhi',
    phone: '+91 98888 77777',
    verified: true,
    rating: 4.6,
    joinDate: '2023-05-10',
    totalOrders: 89,
    coordinates: { lat: 28.6139, lng: 77.2090 }
  },
  { 
    id: '4', 
    name: 'AgroMart Pvt Ltd', 
    email: 'contact@agromart.com', 
    role: 'seller', 
    location: 'Mumbai, Maharashtra',
    phone: '+91 91234 56789',
    verified: true,
    rating: 4.7,
    joinDate: '2022-08-05',
    totalOrders: 2340,
    coordinates: { lat: 19.0760, lng: 72.8777 }
  },
  { 
    id: '5', 
    name: 'GreenFarms Supplies', 
    email: 'info@greenfarms.com', 
    role: 'seller', 
    location: 'Bangalore, Karnataka',
    phone: '+91 90987 65432',
    verified: true,
    rating: 4.5,
    joinDate: '2022-11-12',
    totalOrders: 1567,
    coordinates: { lat: 12.9716, lng: 77.5946 }
  },
  { 
    id: '6', 
    name: 'Suresh Reddy', 
    email: 'suresh@farm.com', 
    role: 'farmer', 
    location: 'Warangal, Telangana',
    phone: '+91 98765 11111',
    verified: true,
    rating: 4.6,
    joinDate: '2023-02-28',
    totalOrders: 134,
    coordinates: { lat: 17.9689, lng: 79.5941 }
  },
  { 
    id: '7', 
    name: 'Priya Sharma', 
    email: 'priya@buyer.com', 
    role: 'buyer', 
    location: 'Jaipur, Rajasthan',
    phone: '+91 99999 88888',
    verified: false,
    rating: 4.3,
    joinDate: '2023-06-15',
    totalOrders: 23,
    coordinates: { lat: 26.9124, lng: 75.7873 }
  },
  { 
    id: '8', 
    name: 'Manoj Gupta', 
    email: 'manoj@farm.com', 
    role: 'farmer', 
    location: 'Bareilly, Uttar Pradesh',
    phone: '+91 97777 66666',
    verified: true,
    rating: 4.4,
    joinDate: '2023-04-08',
    totalOrders: 78,
    coordinates: { lat: 28.3670, lng: 79.4304 }
  }
];

const sampleReviews: Review[] = [
  {
    id: 'r1',
    userId: '3',
    userName: 'Arjun Singh',
    rating: 5,
    comment: 'Excellent quality maize! Fresh and well-packaged. Will definitely order again.',
    date: '2024-01-20',
    verified: true,
    helpful: 12
  },
  {
    id: 'r2',
    userId: '7',
    userName: 'Priya Sharma',
    rating: 4,
    comment: 'Good quality, but delivery took longer than expected.',
    date: '2024-01-18',
    verified: true,
    helpful: 6
  },
  {
    id: 'r3',
    userId: '3',
    userName: 'Arjun Singh',
    rating: 5,
    comment: 'Premium quality onions. Very fresh and properly graded.',
    date: '2024-01-15',
    verified: true,
    helpful: 8
  }
];

export const mockCrops: Crop[] = [
  {
    id: '1',
    name: 'Yellow Maize',
    farmer: 'Ramesh Kumar',
    farmerId: '1',
    quantity: 2500,
    price: 28,
    location: 'Ludhiana, Punjab',
    images: [maizeImg, wheatImg, riceImg],
    description: 'Premium quality yellow maize, freshly harvested from organic farms. High protein content and perfect for feed and food processing.',
    harvestDate: '2024-01-15',
    category: 'cereals',
    isOrganic: true,
    certifications: ['Organic India', 'FSSAI'],
    storageType: 'dried',
    shelfLife: 365,
    minOrderQuantity: 100,
    availableFrom: '2024-01-15',
    availableTo: '2024-06-15',
    cropVariety: 'Pioneer 30Y87',
    farmingMethod: 'organic',
    qualityGrade: 'A',
    moistureContent: 12.5,
    coordinates: { lat: 30.9010, lng: 75.8573 },
    reviews: [sampleReviews[0]],
    averageRating: 5.0,
    totalSold: 18500,
    featured: true
  },
  {
    id: '2',
    name: 'Red Onion',
    farmer: 'Kavita Patel',
    farmerId: '2',
    quantity: 1800,
    price: 35,
    location: 'Anand, Gujarat',
    images: [onionImg, maizeImg, wheatImg],
    description: 'Fresh red onions, grade A quality. Grown using sustainable farming practices. Perfect for cooking and export.',
    harvestDate: '2024-01-20',
    category: 'vegetables',
    isOrganic: false,
    certifications: ['APEDA', 'FSSAI'],
    storageType: 'cold_storage',
    shelfLife: 90,
    minOrderQuantity: 50,
    availableFrom: '2024-01-20',
    availableTo: '2024-04-20',
    cropVariety: 'Nashik Red',
    farmingMethod: 'sustainable',
    qualityGrade: 'A',
    coordinates: { lat: 22.5645, lng: 72.9289 },
    reviews: [sampleReviews[2]],
    averageRating: 4.8,
    totalSold: 12300,
    featured: true
  },
  {
    id: '3',
    name: 'Durum Wheat',
    farmer: 'Ramesh Kumar',
    farmerId: '1',
    quantity: 3200,
    price: 26,
    location: 'Ludhiana, Punjab',
    images: [wheatImg, riceImg, maizeImg],
    description: 'High-quality durum wheat, perfect for pasta and semolina production. Grown in optimal soil conditions.',
    harvestDate: '2024-01-10',
    category: 'cereals',
    isOrganic: false,
    certifications: ['FSSAI', 'BIS'],
    storageType: 'dried',
    shelfLife: 450,
    minOrderQuantity: 200,
    availableFrom: '2024-01-10',
    availableTo: '2024-07-10',
    cropVariety: 'HD 2967',
    farmingMethod: 'conventional',
    qualityGrade: 'A',
    moistureContent: 11.8,
    coordinates: { lat: 30.9010, lng: 75.8573 },
    reviews: [],
    averageRating: 4.6,
    totalSold: 24600,
    featured: false
  },
  {
    id: '4',
    name: 'Basmati Rice',
    farmer: 'Suresh Reddy',
    farmerId: '6',
    quantity: 1500,
    price: 45,
    location: 'Warangal, Telangana',
    images: [riceImg, wheatImg, onionImg],
    description: 'Premium Basmati rice with long grains and aromatic fragrance. Perfect for biryanis and premium cooking.',
    harvestDate: '2024-01-25',
    category: 'cereals',
    isOrganic: true,
    certifications: ['Organic India', 'GI Tag', 'FSSAI'],
    storageType: 'dried',
    shelfLife: 720,
    minOrderQuantity: 25,
    availableFrom: '2024-01-25',
    availableTo: '2024-08-25',
    cropVariety: 'Pusa Basmati 1121',
    farmingMethod: 'organic',
    qualityGrade: 'A',
    moistureContent: 13.2,
    coordinates: { lat: 17.9689, lng: 79.5941 },
    reviews: [],
    averageRating: 4.9,
    totalSold: 8900,
    featured: true
  },
  {
    id: '5',
    name: 'Green Peas',
    farmer: 'Manoj Gupta',
    farmerId: '8',
    quantity: 800,
    price: 55,
    location: 'Bareilly, Uttar Pradesh',
    images: [onionImg, maizeImg, riceImg],
    description: 'Fresh green peas, sweet and tender. Harvested at perfect maturity for maximum taste and nutrition.',
    harvestDate: '2024-01-28',
    category: 'vegetables',
    isOrganic: false,
    certifications: ['FSSAI'],
    storageType: 'fresh',
    shelfLife: 7,
    minOrderQuantity: 10,
    availableFrom: '2024-01-28',
    availableTo: '2024-02-15',
    cropVariety: 'Arkel',
    farmingMethod: 'conventional',
    qualityGrade: 'A',
    coordinates: { lat: 28.3670, lng: 79.4304 },
    reviews: [],
    averageRating: 4.4,
    totalSold: 3200,
    featured: false
  },
  {
    id: '6',
    name: 'Cotton',
    farmer: 'Kavita Patel',
    farmerId: '2',
    quantity: 1200,
    price: 65,
    location: 'Anand, Gujarat',
    images: [wheatImg, maizeImg, riceImg],
    description: 'High-quality cotton with excellent fiber length and strength. Perfect for textile manufacturing.',
    harvestDate: '2024-01-12',
    category: 'cash_crops',
    isOrganic: false,
    certifications: ['CCI', 'FSSAI'],
    storageType: 'dried',
    shelfLife: 1095,
    minOrderQuantity: 100,
    availableFrom: '2024-01-12',
    availableTo: '2024-12-12',
    cropVariety: 'Bt Cotton',
    farmingMethod: 'conventional',
    qualityGrade: 'B',
    coordinates: { lat: 22.5645, lng: 72.9289 },
    reviews: [],
    averageRating: 4.3,
    totalSold: 7800,
    featured: false
  }
];

export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Premium Hybrid Rice Seeds',
    seller: 'AgroMart Pvt Ltd',
    sellerId: '4',
    category: 'seeds',
    price: 185,
    stock: 500,
    description: 'High-yield hybrid rice seeds with disease resistance and excellent grain quality. Suitable for kharif season.',
    images: [seedsImg, fertilizerImg, riceImg],
    specifications: {
      'Variety': 'IR64 Hybrid',
      'Yield Potential': '8-10 tons/hectare',
      'Maturity': '120-130 days',
      'Plant Height': '90-100 cm',
      'Resistance': 'Blast, BLB, Brown spot',
      'Grain Type': 'Long slender',
      'Cooking Quality': 'Excellent'
    },
    brand: 'AgroMart Premium',
    manufacturingDate: '2023-12-15',
    expiryDate: '2025-12-15',
    isOrganic: false,
    certifications: ['NSAI', 'ISTA', 'OECD'],
    minOrderQuantity: 5,
    weight: 10,
    unit: 'kg',
    reviews: [],
    averageRating: 4.7,
    featured: true,
    discount: {
      percentage: 15,
      validTill: '2024-03-31'
    }
  },
  {
    id: '2',
    name: 'Organic Vermicompost Fertilizer',
    seller: 'GreenFarms Supplies',
    sellerId: '5',
    category: 'fertilizers',
    price: 95,
    stock: 800,
    description: 'Premium organic vermicompost enriched with beneficial microorganisms. Improves soil health and crop productivity naturally.',
    images: [fertilizerImg, seedsImg, wheatImg],
    specifications: {
      'Type': 'Organic Vermicompost',
      'NPK Content': '1.5-0.8-1.2',
      'Organic Carbon': '12-18%',
      'Moisture': 'Max 25%',
      'pH': '6.5-7.5',
      'Application Rate': '2-4 tons/hectare',
      'Microbial Count': '10^6 CFU/gm'
    },
    brand: 'GreenFarms Organic',
    manufacturingDate: '2024-01-10',
    isOrganic: true,
    certifications: ['NPOP', 'OMRI Listed', 'FiBL'],
    minOrderQuantity: 10,
    weight: 25,
    unit: 'kg',
    reviews: [],
    averageRating: 4.8,
    featured: true
  },
  {
    id: '3',
    name: 'Hybrid Corn Seeds F1',
    seller: 'AgroMart Pvt Ltd',
    sellerId: '4',
    category: 'seeds',
    price: 145,
    stock: 200,
    description: 'High-performance F1 hybrid corn seeds with excellent yield potential and stress tolerance.',
    images: [seedsImg, maizeImg, fertilizerImg],
    specifications: {
      'Variety': 'Pioneer 30Y87',
      'Yield Potential': '12-15 tons/hectare',
      'Maturity': '110-115 days',
      'Plant Height': '220-250 cm',
      'Kernel Type': 'Dent corn',
      'Stress Tolerance': 'Drought, Heat',
      'Special Features': 'High oil content'
    },
    brand: 'Pioneer Seeds',
    manufacturingDate: '2024-01-05',
    expiryDate: '2025-01-05',
    isOrganic: false,
    certifications: ['NSAI', 'ISTA'],
    minOrderQuantity: 2,
    weight: 5,
    unit: 'kg',
    reviews: [],
    averageRating: 4.6,
    featured: false
  },
  {
    id: '4',
    name: 'NPK Complex Fertilizer 20:20:20',
    seller: 'GreenFarms Supplies',
    sellerId: '5',
    category: 'fertilizers',
    price: 1250,
    stock: 300,
    description: 'Balanced NPK fertilizer with micronutrients for all crops. Water-soluble and quick-acting formula.',
    images: [fertilizerImg, seedsImg, riceImg],
    specifications: {
      'NPK Ratio': '20:20:20',
      'Total Nitrogen': '20% (10% Nitrate, 10% Ammonical)',
      'Available Phosphorus': '20%',
      'Water Soluble Potash': '20%',
      'Secondary Nutrients': 'S, Ca, Mg',
      'Micronutrients': 'Zn, Fe, Mn, Cu, B, Mo',
      'Application Rate': '100-150 kg/hectare'
    },
    brand: 'NutriGrow',
    manufacturingDate: '2024-01-20',
    expiryDate: '2027-01-20',
    isOrganic: false,
    certifications: ['FCO', 'ISO 9001'],
    minOrderQuantity: 5,
    weight: 50,
    unit: 'kg',
    reviews: [],
    averageRating: 4.5,
    featured: true
  },
  {
    id: '5',
    name: 'Bio-Pesticide Neem Oil',
    seller: 'GreenFarms Supplies',
    sellerId: '5',
    category: 'pesticides',
    price: 280,
    stock: 150,
    description: 'Organic neem-based bio-pesticide for eco-friendly pest control. Safe for beneficial insects and pollinators.',
    images: [fertilizerImg, seedsImg, maizeImg],
    specifications: {
      'Active Ingredient': 'Neem Oil 5%',
      'Target Pests': 'Aphids, Thrips, Whitefly, Mites',
      'Application Rate': '2-3 ml/liter water',
      'PHI (Pre-harvest Interval)': '3 days',
      'Mode of Action': 'Contact & Systemic',
      'Compatibility': 'Tank mixable',
      'Shelf Life': '3 years'
    },
    brand: 'EcoShield',
    manufacturingDate: '2023-11-15',
    expiryDate: '2026-11-15',
    isOrganic: true,
    certifications: ['CIB Registration', 'NPOP', 'OMRI'],
    minOrderQuantity: 1,
    weight: 1,
    unit: 'liter',
    reviews: [],
    averageRating: 4.4,
    featured: false
  },
  {
    id: '6',
    name: 'Smart Drip Irrigation Kit',
    seller: 'AgroMart Pvt Ltd',
    sellerId: '4',
    category: 'equipment',
    price: 8500,
    stock: 25,
    description: 'Complete drip irrigation system with timer and pressure regulators. Covers 1 acre farmland efficiently.',
    images: [fertilizerImg, seedsImg, wheatImg],
    specifications: {
      'Coverage Area': '1 acre (4000 sq.m)',
      'Drip Lines': '200 meters',
      'Emitters': '400 pieces (4 LPH)',
      'Main Line': '63mm HDPE pipe',
      'Sub Main': '32mm HDPE pipe',
      'Accessories': 'Timer, Filter, Pressure gauge',
      'Water Saving': 'Up to 50%'
    },
    brand: 'AquaTech Pro',
    manufacturingDate: '2024-01-12',
    isOrganic: false,
    certifications: ['ISI Mark', 'BIS'],
    minOrderQuantity: 1,
    weight: 45,
    unit: 'piece',
    reviews: [],
    averageRating: 4.3,
    featured: true,
    discount: {
      percentage: 20,
      validTill: '2024-04-30'
    }
  },
  {
    id: '7',
    name: 'Power Tiller 8HP',
    seller: 'AgroMart Pvt Ltd',
    sellerId: '4',
    category: 'tools',
    price: 85000,
    stock: 8,
    description: 'Compact power tiller perfect for small to medium farms. Fuel-efficient and easy to operate.',
    images: [seedsImg, fertilizerImg, maizeImg],
    specifications: {
      'Engine Power': '8 HP Diesel',
      'Engine Type': '4-stroke, Air cooled',
      'Transmission': '3 forward + 1 reverse',
      'Fuel Tank': '3.5 liters',
      'Working Width': '850mm',
      'Weight': '185 kg',
      'Warranty': '2 years'
    },
    brand: 'FarmKing',
    manufacturingDate: '2024-01-08',
    isOrganic: false,
    certifications: ['CE Mark', 'ISI'],
    minOrderQuantity: 1,
    weight: 185,
    unit: 'piece',
    reviews: [],
    averageRating: 4.6,
    featured: false
  }
];

export const mockOrders: Order[] = [
  {
    id: 'ORD001',
    buyer: 'Arjun Singh',
    buyerId: '3',
    seller: 'Ramesh Kumar',
    sellerId: '1',
    item: 'Yellow Maize',
    itemId: '1',
    quantity: 500,
    price: 28,
    totalAmount: 14000,
    status: 'delivered',
    type: 'crop',
    orderDate: '2024-01-15',
    expectedDelivery: '2024-01-18',
    actualDelivery: '2024-01-17',
    paymentMethod: 'online',
    paymentStatus: 'paid',
    shippingAddress: {
      address: '123 Market Street',
      city: 'New Delhi',
      state: 'Delhi',
      pincode: '110001',
      coordinates: { lat: 28.6139, lng: 77.2090 }
    },
    trackingId: 'TRK123456789',
    notes: 'Deliver between 9 AM to 6 PM'
  },
  {
    id: 'ORD002',
    buyer: 'Priya Sharma',
    buyerId: '7',
    seller: 'Kavita Patel',
    sellerId: '2',
    item: 'Red Onion',
    itemId: '2',
    quantity: 200,
    price: 35,
    totalAmount: 7000,
    status: 'in_transit',
    type: 'crop',
    orderDate: '2024-01-20',
    expectedDelivery: '2024-01-25',
    paymentMethod: 'cod',
    paymentStatus: 'pending',
    shippingAddress: {
      address: '456 Agriculture Lane',
      city: 'Jaipur',
      state: 'Rajasthan',
      pincode: '302001',
      coordinates: { lat: 26.9124, lng: 75.7873 }
    },
    trackingId: 'TRK987654321'
  },
  {
    id: 'ORD003',
    buyer: 'Arjun Singh',
    buyerId: '3',
    seller: 'AgroMart Pvt Ltd',
    sellerId: '4',
    item: 'Premium Hybrid Rice Seeds',
    itemId: '1',
    quantity: 10,
    price: 185,
    totalAmount: 1850,
    status: 'confirmed',
    type: 'product',
    orderDate: '2024-01-22',
    expectedDelivery: '2024-01-26',
    paymentMethod: 'bank_transfer',
    paymentStatus: 'paid',
    shippingAddress: {
      address: '123 Market Street',
      city: 'New Delhi',
      state: 'Delhi',
      pincode: '110001',
      coordinates: { lat: 28.6139, lng: 77.2090 }
    }
  },
  // Additional orders for better chart visualization
  {
    id: 'ORD004',
    buyer: 'Arjun Singh',
    buyerId: '3',
    seller: 'Ramesh Kumar',
    sellerId: '1',
    item: 'Durum Wheat',
    itemId: '3',
    quantity: 300,
    price: 26,
    totalAmount: 7800,
    status: 'delivered',
    type: 'crop',
    orderDate: '2024-01-10',
    expectedDelivery: '2024-01-13',
    actualDelivery: '2024-01-12',
    paymentMethod: 'online',
    paymentStatus: 'paid',
    shippingAddress: {
      address: '123 Market Street',
      city: 'New Delhi',
      state: 'Delhi',
      pincode: '110001',
      coordinates: { lat: 28.6139, lng: 77.2090 }
    },
    trackingId: 'TRK111222333'
  },
  {
    id: 'ORD005',
    buyer: 'Priya Sharma',
    buyerId: '7',
    seller: 'Ramesh Kumar',
    sellerId: '1',
    item: 'Yellow Maize',
    itemId: '1',
    quantity: 150,
    price: 28,
    totalAmount: 4200,
    status: 'pending',
    type: 'crop',
    orderDate: '2024-01-25',
    expectedDelivery: '2024-01-28',
    paymentMethod: 'cod',
    paymentStatus: 'pending',
    shippingAddress: {
      address: '456 Agriculture Lane',
      city: 'Jaipur',
      state: 'Rajasthan',
      pincode: '302001',
      coordinates: { lat: 26.9124, lng: 75.7873 }
    }
  },
  {
    id: 'ORD006',
    buyer: 'Arjun Singh',
    buyerId: '3',
    seller: 'Kavita Patel',
    sellerId: '2',
    item: 'Cotton',
    itemId: '6',
    quantity: 100,
    price: 65,
    totalAmount: 6500,
    status: 'confirmed',
    type: 'crop',
    orderDate: '2024-01-23',
    expectedDelivery: '2024-01-27',
    paymentMethod: 'bank_transfer',
    paymentStatus: 'paid',
    shippingAddress: {
      address: '123 Market Street',
      city: 'New Delhi',
      state: 'Delhi',
      pincode: '110001',
      coordinates: { lat: 28.6139, lng: 77.2090 }
    }
  },
  {
    id: 'ORD007',
    buyer: 'Priya Sharma',
    buyerId: '7',
    seller: 'Kavita Patel',
    sellerId: '2',
    item: 'Red Onion',
    itemId: '2',
    quantity: 75,
    price: 35,
    totalAmount: 2625,
    status: 'cancelled',
    type: 'crop',
    orderDate: '2024-01-18',
    paymentMethod: 'online',
    paymentStatus: 'refunded',
    shippingAddress: {
      address: '456 Agriculture Lane',
      city: 'Jaipur',
      state: 'Rajasthan',
      pincode: '302001',
      coordinates: { lat: 26.9124, lng: 75.7873 }
    }
  }
];

export const mockNotifications: Notification[] = [
  {
    id: 'NOT001',
    userId: '3',
    type: 'order',
    title: 'Order Delivered',
    message: 'Your order of Yellow Maize has been delivered successfully.',
    data: { orderId: 'ORD001' },
    read: false,
    createdAt: '2024-01-17T10:30:00Z'
  },
  {
    id: 'NOT002',
    userId: '1',
    type: 'crop_listed',
    title: 'New Crop Interest',
    message: 'A buyer has shown interest in your Yellow Maize listing.',
    data: { cropId: '1' },
    read: true,
    createdAt: '2024-01-16T14:15:00Z'
  },
  {
    id: 'NOT003',
    userId: '7',
    type: 'price_alert',
    title: 'Price Alert',
    message: 'Red Onion prices have dropped to ₹35/kg in your area.',
    data: { cropName: 'Red Onion', currentPrice: 35 },
    read: false,
    createdAt: '2024-01-20T09:00:00Z'
  }
];

export const mockMarketAnalytics: MarketAnalytics[] = [
  {
    cropName: 'Yellow Maize',
    currentPrice: 28,
    priceHistory: [
      { date: '2024-01-01', price: 26, volume: 1200 },
      { date: '2024-01-08', price: 27, volume: 1450 },
      { date: '2024-01-15', price: 28, volume: 1680 },
      { date: '2024-01-22', price: 28, volume: 1590 }
    ],
    priceChange: {
      percentage: 7.7,
      trend: 'up'
    },
    demandSupplyRatio: 1.2,
    seasonalPattern: [
      { month: 'Jan', averagePrice: 28, volume: 5000 },
      { month: 'Feb', averagePrice: 30, volume: 4500 },
      { month: 'Mar', averagePrice: 32, volume: 4000 },
      { month: 'Apr', averagePrice: 35, volume: 3500 }
    ],
    topProducingRegions: [
      { region: 'Punjab', production: 15000, marketShare: 35 },
      { region: 'Uttar Pradesh', production: 12000, marketShare: 28 },
      { region: 'Rajasthan', production: 8000, marketShare: 18 }
    ],
    qualityDistribution: [
      { grade: 'A', percentage: 60 },
      { grade: 'B', percentage: 30 },
      { grade: 'C', percentage: 10 }
    ]
  }
];

export const mockCropCalendar: CropCalendar[] = [
  {
    cropName: 'Rice',
    variety: 'Basmati',
    region: 'North India',
    plantingWindow: {
      start: '2024-06-15',
      end: '2024-07-15'
    },
    harvestWindow: {
      start: '2024-10-15',
      end: '2024-11-15'
    },
    stages: [
      {
        name: 'Land Preparation',
        duration: 15,
        description: 'Prepare field with proper plowing and leveling',
        activities: ['Plowing', 'Leveling', 'Puddling', 'Field layout']
      },
      {
        name: 'Sowing/Transplanting',
        duration: 10,
        description: 'Plant rice seedlings or direct seeding',
        activities: ['Seed treatment', 'Nursery preparation', 'Transplanting']
      },
      {
        name: 'Vegetative Growth',
        duration: 60,
        description: 'Active growth phase with tillering',
        activities: ['Irrigation', 'Fertilization', 'Weed control']
      },
      {
        name: 'Reproductive Phase',
        duration: 35,
        description: 'Flowering and grain formation',
        activities: ['Water management', 'Pest control', 'Nutrient management']
      },
      {
        name: 'Maturation',
        duration: 30,
        description: 'Grain filling and maturation',
        activities: ['Water stress', 'Disease monitoring', 'Harvest preparation']
      }
    ],
    requirements: {
      soilType: ['Clay loam', 'Silty clay loam'],
      temperature: {
        min: 22,
        max: 32
      },
      rainfall: 1200,
      irrigation: 'Flood irrigation preferred'
    },
    yieldExpectation: {
      min: 4000,
      max: 6000,
      unit: 'kg/hectare'
    }
  }
];
export const locationData: Record<string, PredictionResult> = {
  '28.6139,77.2090': { // Delhi coordinates
    crop: 'Wheat',
    confidence: 85,
    reasoning: 'Optimal winter crop conditions: pH 6.8, Temperature 24°C, Good soil nutrients',
    soilData: { 
      pH: 6.8, 
      clay: 25, 
      sand: 45, 
      silt: 30,
      organicMatter: 2.1,
      nitrogen: 245,
      phosphorus: 18,
      potassium: 180
    },
    weatherData: { 
      temperature: 24, 
      humidity: 65, 
      rainfall: 650,
      windSpeed: 12,
      sunlightHours: 7.5
    },
    marketData: {
      currentPrice: 26,
      demandLevel: 'high',
      competitionLevel: 'medium',
      seasonalTrend: 'increasing'
    },
    alternativeCrops: [
      { crop: 'Barley', confidence: 78, reason: 'Similar climatic requirements' },
      { crop: 'Mustard', confidence: 72, reason: 'Good for rabi season' }
    ],
    bestPlantingTime: {
      start: '2024-11-15',
      end: '2024-12-15'
    },
    expectedYield: {
      min: 3500,
      max: 4500,
      unit: 'kg/hectare'
    },
    risks: ['Late blight if humidity increases', 'Aphid attack in February'],
    recommendations: [
      'Use certified seeds for better yield',
      'Apply balanced fertilization',
      'Ensure proper drainage'
    ]
  },
  '23.0225,72.5714': { // Gujarat coordinates  
    crop: 'Cotton',
    confidence: 92,
    reasoning: 'Perfect cotton growing conditions: pH 7.2, Temperature 28°C, High humidity',
    soilData: { 
      pH: 7.2, 
      clay: 35, 
      sand: 40, 
      silt: 25,
      organicMatter: 1.8,
      nitrogen: 220,
      phosphorus: 22,
      potassium: 195
    },
    weatherData: { 
      temperature: 28, 
      humidity: 78, 
      rainfall: 800,
      windSpeed: 8,
      sunlightHours: 8.2
    },
    marketData: {
      currentPrice: 65,
      demandLevel: 'high',
      competitionLevel: 'low',
      seasonalTrend: 'stable'
    },
    alternativeCrops: [
      { crop: 'Sugarcane', confidence: 84, reason: 'High water availability' },
      { crop: 'Groundnut', confidence: 76, reason: 'Suitable soil conditions' }
    ],
    bestPlantingTime: {
      start: '2024-05-15',
      end: '2024-06-30'
    },
    expectedYield: {
      min: 1800,
      max: 2200,
      unit: 'kg/hectare'
    },
    risks: ['Bollworm attack', 'Waterlogging during monsoon'],
    recommendations: [
      'Use Bt cotton varieties',
      'Install drip irrigation',
      'Regular pest monitoring'
    ]
  },
  '30.7333,76.7794': { // Punjab coordinates
    crop: 'Rice',
    confidence: 88,
    reasoning: 'Excellent paddy conditions: pH 6.5, Temperature 26°C, High water availability',
    soilData: { 
      pH: 6.5, 
      clay: 30, 
      sand: 50, 
      silt: 20,
      organicMatter: 2.4,
      nitrogen: 280,
      phosphorus: 25,
      potassium: 210
    },
    weatherData: { 
      temperature: 26, 
      humidity: 70, 
      rainfall: 720,
      windSpeed: 10,
      sunlightHours: 7.8
    },
    marketData: {
      currentPrice: 45,
      demandLevel: 'medium',
      competitionLevel: 'high',
      seasonalTrend: 'increasing'
    },
    alternativeCrops: [
      { crop: 'Maize', confidence: 82, reason: 'Similar water requirements' },
      { crop: 'Sugarcane', confidence: 75, reason: 'High water table' }
    ],
    bestPlantingTime: {
      start: '2024-06-15',
      end: '2024-07-15'
    },
    expectedYield: {
      min: 5000,
      max: 6500,
      unit: 'kg/hectare'
    },
    risks: ['Blast disease', 'Brown plant hopper'],
    recommendations: [
      'Use resistant varieties',
      'Maintain proper water level',
      'Integrated pest management'
    ]
  },
  'default': {
    crop: 'Mixed Vegetables',
    confidence: 79,
    reasoning: 'Good conditions for vegetable cultivation: pH 6.0, moderate climate',
    soilData: { 
      pH: 6.0, 
      clay: 28, 
      sand: 42, 
      silt: 30,
      organicMatter: 3.2,
      nitrogen: 200,
      phosphorus: 15,
      potassium: 160
    },
    weatherData: { 
      temperature: 23, 
      humidity: 91, 
      rainfall: 850,
      windSpeed: 6,
      sunlightHours: 6.5
    },
    marketData: {
      currentPrice: 35,
      demandLevel: 'high',
      competitionLevel: 'medium',
      seasonalTrend: 'stable'
    },
    alternativeCrops: [
      { crop: 'Leafy Greens', confidence: 85, reason: 'High organic matter' },
      { crop: 'Herbs', confidence: 70, reason: 'Good for specialty crops' }
    ],
    bestPlantingTime: {
      start: '2024-03-15',
      end: '2024-10-15'
    },
    expectedYield: {
      min: 15000,
      max: 25000,
      unit: 'kg/hectare'
    },
    risks: ['Fungal diseases in high humidity', 'Pest attacks'],
    recommendations: [
      'Use organic fertilizers',
      'Implement crop rotation',
      'Proper spacing for air circulation'
    ]
  }
};