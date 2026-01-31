import { useState, useEffect } from 'react';
import { Product } from '@/types';
import { SupabaseService } from '@/services/supabase';
import { useAuth } from '@/contexts/AuthContext';

export const useProducts = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let fetchedProducts: Product[];
      
      if (user?.role === 'seller') {
        // Sellers see only their own products
        fetchedProducts = await SupabaseService.getProductsBySellerId(user.id);
      } else {
        // Farmers and others see all available products
        fetchedProducts = await SupabaseService.getAllProducts();
      }
      
      setProducts(fetchedProducts);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const addProduct = async (productData: Omit<Product, 'id' | 'reviews' | 'averageRating'>) => {
    try {
      const newProduct = await SupabaseService.createProduct(productData);
      if (newProduct) {
        setProducts(prev => [newProduct, ...prev]);
        return newProduct;
      }
      throw new Error('Failed to create product');
    } catch (err) {
      console.error('Error adding product:', err);
      setError('Failed to add product');
      throw err;
    }
  };

  const updateProduct = async (productId: string, updates: Partial<Product>) => {
    try {
      const success = await SupabaseService.updateProduct(productId, updates);
      if (success) {
        setProducts(prev => prev.map(product => 
          product.id === productId ? { ...product, ...updates } : product
        ));
        return true;
      }
      throw new Error('Failed to update product');
    } catch (err) {
      console.error('Error updating product:', err);
      setError('Failed to update product');
      throw err;
    }
  };

  const deleteProduct = async (productId: string) => {
    try {
      const success = await SupabaseService.deleteProduct(productId);
      if (success) {
        setProducts(prev => prev.filter(product => product.id !== productId));
        return true;
      }
      throw new Error('Failed to delete product');
    } catch (err) {
      console.error('Error deleting product:', err);
      setError('Failed to delete product');
      throw err;
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [user]);

  return {
    products,
    loading,
    error,
    refetch: fetchProducts,
    addProduct,
    updateProduct,
    deleteProduct
  };
};