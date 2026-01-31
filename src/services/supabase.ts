// Supabase service layer using the official Supabase client
import { supabase } from '@/lib/supabase';
import { Crop, User, Order, Product } from '@/types';

// Helper function to convert database row to Crop interface
const mapDbRowToCrop = (row: any): Crop => {
  return {
    id: row.id,
    name: row.name,
    farmer: row.farmer_name || 'Unknown Farmer',
    farmerId: row.farmer_id,
    quantity: row.quantity,
    price: parseFloat(row.price),
    location: row.location,
    images: row.images || [],
    description: row.description,
    harvestDate: row.harvest_date,
    category: row.category,
    isOrganic: row.is_organic,
    certifications: row.certifications || [],
    storageType: row.storage_type as 'fresh' | 'cold_storage' | 'dried',
    shelfLife: row.shelf_life,
    minOrderQuantity: row.min_order_quantity,
    availableFrom: row.available_from,
    availableTo: row.available_to,
    cropVariety: row.crop_variety,
    farmingMethod: row.farming_method as 'organic' | 'conventional' | 'sustainable',
    qualityGrade: row.quality_grade as 'A' | 'B' | 'C',
    moistureContent: row.moisture_content,
    coordinates: row.coordinates,
    reviews: [], // Will be populated separately if needed
    averageRating: parseFloat(row.average_rating) || 0,
    totalRatings: row.total_ratings || 0,
    totalSold: row.total_sold || 0,
    featured: row.featured || false
  };
};

// Helper function to convert database row to User interface
const mapDbRowToUser = (row: any): User => {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role as 'farmer' | 'buyer' | 'seller',
    location: row.location,
    phone: row.phone,
    avatar: row.avatar,
    verified: row.verified,
    rating: parseFloat(row.rating) || 0,
    joinDate: row.join_date,
    totalOrders: row.total_orders || 0,
    coordinates: row.coordinates
  };
};

// Helper function to convert database row to Product interface
const mapDbRowToProduct = (row: any): Product => {
  return {
    id: row.id,
    name: row.name,
    seller: row.seller_name || 'Unknown Seller',
    sellerId: row.seller_id,
    category: row.category as 'seeds' | 'fertilizers' | 'pesticides' | 'tools' | 'equipment',
    price: parseFloat(row.price),
    stock: row.stock,
    description: row.description,
    images: row.images || [],
    specifications: row.specifications,
    brand: row.brand,
    manufacturingDate: row.manufacturing_date,
    expiryDate: row.expiry_date,
    isOrganic: row.is_organic,
    certifications: row.certifications || [],
    minOrderQuantity: row.min_order_quantity,
    weight: parseFloat(row.weight),
    unit: row.unit as 'kg' | 'gm' | 'liter' | 'piece',
    reviews: [], // Will be populated separately if needed
    averageRating: parseFloat(row.average_rating) || 0,
    featured: row.featured || false,
    discount: row.discount_percentage > 0 ? {
      percentage: row.discount_percentage,
      validTill: row.discount_valid_till
    } : undefined
  };
};

// Helper function to convert database row to Order interface
const mapDbRowToOrder = (row: any): Order => {
  return {
    id: row.id,
    buyer: row.buyer_name || 'Unknown Buyer',
    buyerId: row.buyer_id,
    buyerEmail: row.buyer_email,
    buyerRating: row.buyer_rating,
    buyerTotalRatings: row.buyer_total_ratings,
    seller: row.seller_name || 'Unknown Seller',
    sellerId: row.seller_id,
    sellerEmail: row.seller_email,
    item: row.item_name || 'Unknown Item',
    itemId: row.item_id,
    quantity: row.quantity,
    price: parseFloat(row.price),
    totalAmount: parseFloat(row.total_amount),
    status: row.status as 'pending' | 'confirmed' | 'in_transit' | 'delivered' | 'cancelled' | 'returned',
    type: row.item_type as 'crop' | 'product',
    orderDate: row.order_date,
    expectedDelivery: row.expected_delivery,
    actualDelivery: row.actual_delivery,
    paymentMethod: row.payment_method as 'cod' | 'online' | 'bank_transfer',
    paymentStatus: row.payment_status as 'pending' | 'paid' | 'failed' | 'refunded',
    shippingAddress: row.shipping_address,
    trackingId: row.tracking_id,
    notes: row.notes,
    cancellationReason: row.cancellation_reason
  };
};

export class SupabaseService {
  // Crop-related methods
  static async getAllCrops(): Promise<Crop[]> {
    try {
      const { data, error } = await supabase
        .from('crops')
        .select(`
          *,
          users!crops_farmer_id_fkey(name)
        `)
        .gt('quantity', 0)
        .order('featured', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      // Get ratings for all crops
      const cropIds = data.map(crop => crop.id);
      const { data: ratingsData } = await supabase
        .from('ratings')
        .select('rated_entity_id, rating')
        .eq('rated_entity_type', 'crop')
        .in('rated_entity_id', cropIds);

      // Calculate average ratings for each crop
      const ratingsMap = new Map<string, { average: number; count: number }>();
      
      if (ratingsData) {
        const ratingsByEntity = ratingsData.reduce((acc, rating) => {
          if (!acc[rating.rated_entity_id]) {
            acc[rating.rated_entity_id] = [];
          }
          acc[rating.rated_entity_id].push(rating.rating);
          return acc;
        }, {} as Record<string, number[]>);

        Object.entries(ratingsByEntity).forEach(([entityId, ratings]) => {
          const average = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
          ratingsMap.set(entityId, { 
            average: Math.round(average * 10) / 10, 
            count: ratings.length 
          });
        });
      }

      return data.map(row => {
        const ratingInfo = ratingsMap.get(row.id) || { average: 0, count: 0 };
        return mapDbRowToCrop({
          ...row,
          farmer_name: row.users?.name,
          average_rating: ratingInfo.average,
          total_ratings: ratingInfo.count
        });
      });
    } catch (error) {
      console.error('Error fetching crops:', error);
      return [];
    }
  }

  static async getCropsByFarmerId(farmerId: string): Promise<Crop[]> {
    try {
      const { data, error } = await supabase
        .from('crops')
        .select(`
          *,
          users!crops_farmer_id_fkey(name)
        `)
        .eq('farmer_id', farmerId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      // Get ratings for all crops
      const cropIds = data.map(crop => crop.id);
      const { data: ratingsData } = await supabase
        .from('ratings')
        .select('rated_entity_id, rating')
        .eq('rated_entity_type', 'crop')
        .in('rated_entity_id', cropIds);

      // Calculate average ratings for each crop
      const ratingsMap = new Map<string, { average: number; count: number }>();
      
      if (ratingsData) {
        const ratingsByEntity = ratingsData.reduce((acc, rating) => {
          if (!acc[rating.rated_entity_id]) {
            acc[rating.rated_entity_id] = [];
          }
          acc[rating.rated_entity_id].push(rating.rating);
          return acc;
        }, {} as Record<string, number[]>);

        Object.entries(ratingsByEntity).forEach(([entityId, ratings]) => {
          const average = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
          ratingsMap.set(entityId, { 
            average: Math.round(average * 10) / 10, 
            count: ratings.length 
          });
        });
      }

      return data.map(row => {
        const ratingInfo = ratingsMap.get(row.id) || { average: 0, count: 0 };
        return mapDbRowToCrop({
          ...row,
          farmer_name: row.users?.name,
          average_rating: ratingInfo.average,
          total_ratings: ratingInfo.count
        });
      });
    } catch (error) {
      console.error('Error fetching farmer crops:', error);
      return [];
    }
  }

  static async createCrop(crop: Omit<Crop, 'id' | 'reviews' | 'averageRating' | 'totalSold'>): Promise<Crop | null> {
    try {
      const { data, error } = await supabase
        .from('crops')
        .insert({
          name: crop.name,
          farmer_id: crop.farmerId,
          quantity: crop.quantity,
          price: crop.price,
          location: crop.location,
          images: crop.images,
          description: crop.description,
          harvest_date: crop.harvestDate,
          category: crop.category,
          is_organic: crop.isOrganic,
          certifications: crop.certifications,
          storage_type: crop.storageType,
          shelf_life: crop.shelfLife,
          min_order_quantity: crop.minOrderQuantity,
          available_from: crop.availableFrom,
          available_to: crop.availableTo,
          crop_variety: crop.cropVariety,
          farming_method: crop.farmingMethod,
          quality_grade: crop.qualityGrade,
          moisture_content: crop.moistureContent,
          coordinates: crop.coordinates,
          featured: crop.featured
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return mapDbRowToCrop({ ...data, farmer_name: crop.farmer });
    } catch (error) {
      console.error('Error creating crop:', error);
      return null;
    }
  }

  static async updateCrop(cropId: string, updates: Partial<Crop>): Promise<boolean> {
    try {
      const updateData: any = {};
      
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.quantity !== undefined) updateData.quantity = updates.quantity;
      if (updates.price !== undefined) updateData.price = updates.price;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.images !== undefined) updateData.images = updates.images;

      const { error } = await supabase
        .from('crops')
        .update(updateData)
        .eq('id', cropId);

      return !error;
    } catch (error) {
      console.error('Error updating crop:', error);
      return false;
    }
  }

  static async deleteCrop(cropId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('crops')
        .delete()
        .eq('id', cropId);

      return !error;
    } catch (error) {
      console.error('Error deleting crop:', error);
      return false;
    }
  }

  // User-related methods
  static async getUserByEmail(email: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (error || !data) {
        return null;
      }

      return mapDbRowToUser(data);
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  }

  static async getUserById(userId: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !data) {
        return null;
      }

      return mapDbRowToUser(data);
    } catch (error) {
      console.error('Error fetching user by ID:', error);
      return null;
    }
  }

  static async authenticateUser(email: string, passwordHash: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('password_hash', passwordHash)
        .single();

      if (error || !data) {
        return null;
      }

      return mapDbRowToUser(data);
    } catch (error) {
      console.error('Error authenticating user:', error);
      return null;
    }
  }

  static async createUser(user: Omit<User, 'id' | 'joinDate' | 'totalOrders'> & { passwordHash: string }): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert({
          name: user.name,
          email: user.email,
          role: user.role,
          location: user.location,
          phone: user.phone,
          avatar: user.avatar,
          verified: user.verified,
          rating: user.rating,
          coordinates: user.coordinates,
          password_hash: user.passwordHash
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return mapDbRowToUser(data);
    } catch (error) {
      console.error('Error creating user:', error);
      return null;
    }
  }

  // Order-related methods
  static async createOrder(order: Omit<Order, 'id' | 'orderDate'>): Promise<Order | null> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .insert({
          buyer_id: order.buyerId,
          seller_id: order.sellerId,
          item_id: order.itemId,
          item_type: order.type,
          quantity: order.quantity,
          price: order.price,
          total_amount: order.totalAmount,
          status: order.status,
          payment_method: order.paymentMethod,
          payment_status: order.paymentStatus,
          shipping_address: order.shippingAddress,
          notes: order.notes
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return mapDbRowToOrder({
        ...data,
        buyer_name: order.buyer,
        seller_name: order.seller,
        item_name: order.item
      });
    } catch (error) {
      console.error('Error creating order:', error);
      return null;
    }
  }

  static async getOrdersByUserId(userId: string, userRole: 'buyer' | 'seller'): Promise<Order[]> {
    try {
      const userField = userRole === 'buyer' ? 'buyer_id' : 'seller_id';
      
      console.log('SupabaseService.getOrdersByUserId:', { userId, userRole, userField });
      
      // Get orders first
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq(userField, userId)
        .order('created_at', { ascending: false });

      console.log('Orders query result:', { ordersData, ordersError });

      if (ordersError) {
        throw ordersError;
      }

      if (!ordersData || ordersData.length === 0) {
        return [];
      }

      // Get user names and emails for buyers and sellers
      const userIds = new Set<string>();
      ordersData.forEach(order => {
        userIds.add(order.buyer_id);
        userIds.add(order.seller_id);
      });

      const { data: usersData } = await supabase
        .from('users')
        .select('id, name, email')
        .in('id', Array.from(userIds));

      const userMap = new Map<string, { name: string; email: string }>();
      usersData?.forEach(user => {
        userMap.set(user.id, { name: user.name, email: user.email });
      });

      // Get buyer ratings
      const buyerIds = [...new Set(ordersData.map(order => order.buyer_id))];
      const { data: buyerRatingsData } = await supabase
        .from('ratings')
        .select('rated_entity_id, rating')
        .eq('rated_entity_type', 'user')
        .in('rated_entity_id', buyerIds);

      // Calculate average ratings for buyers
      const buyerRatingsMap = new Map<string, { average: number; count: number }>();
      
      if (buyerRatingsData) {
        const ratingsByBuyer = buyerRatingsData.reduce((acc, rating) => {
          if (!acc[rating.rated_entity_id]) {
            acc[rating.rated_entity_id] = [];
          }
          acc[rating.rated_entity_id].push(rating.rating);
          return acc;
        }, {} as Record<string, number[]>);

        Object.entries(ratingsByBuyer).forEach(([buyerId, ratings]) => {
          const average = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
          buyerRatingsMap.set(buyerId, { 
            average: Math.round(average * 10) / 10, 
            count: ratings.length 
          });
        });
      }

      // Get crop/product names
      const cropIds = ordersData.filter(o => o.item_type === 'crop').map(o => o.item_id);
      const productIds = ordersData.filter(o => o.item_type === 'product').map(o => o.item_id);

      let cropMap = new Map<string, string>();
      let productMap = new Map<string, string>();

      if (cropIds.length > 0) {
        const { data: cropsData } = await supabase
          .from('crops')
          .select('id, name')
          .in('id', cropIds);
        
        cropsData?.forEach(crop => {
          cropMap.set(crop.id, crop.name);
        });
      }

      if (productIds.length > 0) {
        const { data: productsData } = await supabase
          .from('products')
          .select('id, name')
          .in('id', productIds);
        
        productsData?.forEach(product => {
          productMap.set(product.id, product.name);
        });
      }

      // Map the data to Order objects with names, emails, and buyer ratings
      const mappedOrders = ordersData.map(row => {
        const buyerRatingInfo = buyerRatingsMap.get(row.buyer_id) || { average: 0, count: 0 };
        return mapDbRowToOrder({
          ...row,
          buyer_name: userMap.get(row.buyer_id)?.name,
          buyer_email: userMap.get(row.buyer_id)?.email,
          buyer_rating: buyerRatingInfo.average,
          buyer_total_ratings: buyerRatingInfo.count,
          seller_name: userMap.get(row.seller_id)?.name,
          seller_email: userMap.get(row.seller_id)?.email,
          item_name: row.item_type === 'crop' ? cropMap.get(row.item_id) : productMap.get(row.item_id)
        });
      });

      console.log('Mapped orders:', mappedOrders);
      return mappedOrders;
    } catch (error) {
      console.error('Error fetching orders:', error);
      return [];
    }
  }

  static async updateOrderStatus(orderId: string, status: Order['status'], updates?: Partial<Order>): Promise<boolean> {
    try {
      const updateData: any = { status };
      
      // Add additional updates if provided
      if (updates) {
        if (updates.trackingId !== undefined) updateData.tracking_id = updates.trackingId;
        if (updates.notes !== undefined) updateData.notes = updates.notes;
        if (updates.expectedDelivery !== undefined) updateData.expected_delivery = updates.expectedDelivery;
        if (updates.actualDelivery !== undefined) updateData.actual_delivery = updates.actualDelivery;
      }

      const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId);

      return !error;
    } catch (error) {
      console.error('Error updating order status:', error);
      return false;
    }
  }

  // Update the ratings table to support products
  static async updateRatingsForProduct(productId: string): Promise<void> {
    try {
      // Get all ratings for this product
      const { data: ratingsData } = await supabase
        .from('ratings')
        .select('rating')
        .eq('rated_entity_type', 'product')
        .eq('rated_entity_id', productId);

      if (ratingsData && ratingsData.length > 0) {
        const average = ratingsData.reduce((sum, rating) => sum + rating.rating, 0) / ratingsData.length;
        
        // Update the product's average rating
        await supabase
          .from('products')
          .update({ average_rating: Math.round(average * 10) / 10 })
          .eq('id', productId);
      }
    } catch (error) {
      console.error('Error updating product ratings:', error);
    }
  }

  // Product-related methods
  static async getAllProducts(): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          users!products_seller_id_fkey(name)
        `)
        .gt('stock', 0)
        .order('featured', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data.map(row => mapDbRowToProduct({
        ...row,
        seller_name: row.users?.name
      }));
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  }

  static async getProductsBySellerId(sellerId: string): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          users!products_seller_id_fkey(name)
        `)
        .eq('seller_id', sellerId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data.map(row => mapDbRowToProduct({
        ...row,
        seller_name: row.users?.name
      }));
    } catch (error) {
      console.error('Error fetching seller products:', error);
      return [];
    }
  }

  static async createProduct(product: Omit<Product, 'id' | 'reviews' | 'averageRating'>): Promise<Product | null> {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert({
          name: product.name,
          seller_id: product.sellerId,
          category: product.category,
          price: product.price,
          stock: product.stock,
          description: product.description,
          images: product.images,
          specifications: product.specifications,
          brand: product.brand,
          manufacturing_date: product.manufacturingDate,
          expiry_date: product.expiryDate,
          is_organic: product.isOrganic,
          certifications: product.certifications,
          min_order_quantity: product.minOrderQuantity,
          weight: product.weight,
          unit: product.unit,
          featured: product.featured,
          discount_percentage: product.discount?.percentage || 0,
          discount_valid_till: product.discount?.validTill
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return mapDbRowToProduct({ ...data, seller_name: product.seller });
    } catch (error) {
      console.error('Error creating product:', error);
      return null;
    }
  }

  static async updateProduct(productId: string, updates: Partial<Product>): Promise<boolean> {
    try {
      const updateData: any = {};
      
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.stock !== undefined) updateData.stock = updates.stock;
      if (updates.price !== undefined) updateData.price = updates.price;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.images !== undefined) updateData.images = updates.images;
      if (updates.specifications !== undefined) updateData.specifications = updates.specifications;
      if (updates.brand !== undefined) updateData.brand = updates.brand;
      if (updates.weight !== undefined) updateData.weight = updates.weight;
      if (updates.unit !== undefined) updateData.unit = updates.unit;
      if (updates.minOrderQuantity !== undefined) updateData.min_order_quantity = updates.minOrderQuantity;
      if (updates.featured !== undefined) updateData.featured = updates.featured;
      if (updates.discount !== undefined) {
        updateData.discount_percentage = updates.discount?.percentage || 0;
        updateData.discount_valid_till = updates.discount?.validTill;
      }

      const { error } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', productId);

      return !error;
    } catch (error) {
      console.error('Error updating product:', error);
      return false;
    }
  }

  static async deleteProduct(productId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      return !error;
    } catch (error) {
      console.error('Error deleting product:', error);
      return false;
    }
  }
}