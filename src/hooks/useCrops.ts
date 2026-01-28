import { useState, useEffect } from 'react';
import { Crop } from '@/types';
import { SupabaseService } from '@/services/supabase';

// This hook uses the real SupabaseService for database operations
export const useCrops = () => {
  const [crops, setCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCrops = async () => {
      try {
        setLoading(true);
        const cropsData = await SupabaseService.getAllCrops();
        setCrops(cropsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch crops');
      } finally {
        setLoading(false);
      }
    };

    fetchCrops();
  }, []);

  const addCrop = async (cropData: Omit<Crop, 'id' | 'reviews' | 'averageRating' | 'totalSold'>) => {
    try {
      const newCrop = await SupabaseService.createCrop(cropData);
      if (newCrop) {
        setCrops(prev => [newCrop, ...prev]);
        return newCrop;
      }
      return null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add crop');
      return null;
    }
  };

  const updateCrop = async (cropId: string, updates: Partial<Crop>) => {
    try {
      const success = await SupabaseService.updateCrop(cropId, updates);
      if (success) {
        setCrops(prev => prev.map(crop => 
          crop.id === cropId ? { ...crop, ...updates } : crop
        ));
        return true;
      }
      return false;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update crop');
      return false;
    }
  };

  const deleteCrop = async (cropId: string) => {
    try {
      const success = await SupabaseService.deleteCrop(cropId);
      if (success) {
        setCrops(prev => prev.filter(crop => crop.id !== cropId));
        return true;
      }
      return false;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete crop');
      return false;
    }
  };

  const getCropsByFarmer = (farmerId: string) => {
    return crops.filter(crop => crop.farmerId === farmerId);
  };

  const refetch = async () => {
    try {
      setLoading(true);
      const cropsData = await SupabaseService.getAllCrops();
      setCrops(cropsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch crops');
    } finally {
      setLoading(false);
    }
  };

  return {
    crops,
    loading,
    error,
    addCrop,
    updateCrop,
    deleteCrop,
    getCropsByFarmer,
    refetch
  };
};