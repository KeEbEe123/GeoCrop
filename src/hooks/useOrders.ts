import { useState, useEffect } from 'react';
import { Order } from '@/types';
import { SupabaseService } from '@/services/supabase';

export const useOrders = (userId?: string, userRole?: 'buyer' | 'seller') => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        let ordersData: Order[] = [];
        
        if (userId && userRole) {
          ordersData = await SupabaseService.getOrdersByUserId(userId, userRole);
        }
        
        setOrders(ordersData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [userId, userRole]);

  const createOrder = async (orderData: Omit<Order, 'id' | 'orderDate'>) => {
    try {
      const newOrder = await SupabaseService.createOrder(orderData);
      if (newOrder) {
        setOrders(prev => [newOrder, ...prev]);
        return newOrder;
      }
      return null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create order');
      return null;
    }
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      // TODO: Implement updateOrderStatus in SupabaseService
      // For now, just update locally
      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, status } : order
      ));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update order');
      return false;
    }
  };

  const refetch = async () => {
    try {
      setLoading(true);
      let ordersData: Order[] = [];
      
      if (userId && userRole) {
        ordersData = await SupabaseService.getOrdersByUserId(userId, userRole);
      }
      
      setOrders(ordersData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  return {
    orders,
    loading,
    error,
    createOrder,
    updateOrderStatus,
    refetch
  };
};