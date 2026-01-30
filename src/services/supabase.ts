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

// Helper function to convert database row to Order interface
const mapDbRowToOrder = (row: any): Order => {
  return {
    id: row.id,
    buyer: row.buyer_name || 'Unknown Buyer',
    buyerId: row.buyer_id,
    buyerEmail: row.buyer_email,
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

      return data.map(row => mapDbRowToCrop({
        ...row,
        farmer_name: row.users?.name
      }));
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

      return data.map(row => mapDbRowToCrop({
        ...row,
        farmer_name: row.users?.name
      }));
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

      // Map the data to Order objects with names and emails
      const mappedOrders = ordersData.map(row => mapDbRowToOrder({
        ...row,
        buyer_name: userMap.get(row.buyer_id)?.name,
        buyer_email: userMap.get(row.buyer_id)?.email,
        seller_name: userMap.get(row.seller_id)?.name,
        seller_email: userMap.get(row.seller_id)?.email,
        item_name: row.item_type === 'crop' ? cropMap.get(row.item_id) : productMap.get(row.item_id)
      }));

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

  // Debug method to get all orders
  static async getAllOrdersDebug(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*');

      console.log('All orders in database:', { data, error });
      return data || [];
    } catch (error) {
      console.error('Error fetching all orders:', error);
      return [];
    }
  }
}