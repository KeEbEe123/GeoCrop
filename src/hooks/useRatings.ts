import { useState, useEffect } from 'react';
import { RatingService, Rating, CreateRatingData } from '@/services/ratingService';

export const useRatings = (entityType?: 'crop' | 'user', entityId?: string) => {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (entityType && entityId) {
      fetchRatings();
    }
  }, [entityType, entityId]);

  const fetchRatings = async () => {
    if (!entityType || !entityId) return;

    try {
      setLoading(true);
      setError(null);

      const [ratingsData, averageData] = await Promise.all([
        RatingService.getRatingsByEntity(entityType, entityId),
        RatingService.getAverageRating(entityType, entityId)
      ]);

      setRatings(ratingsData);
      setAverageRating(averageData.average);
      setTotalRatings(averageData.count);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch ratings');
    } finally {
      setLoading(false);
    }
  };

  const submitRating = async (ratingData: CreateRatingData) => {
    try {
      const newRating = await RatingService.submitRating(ratingData);
      if (newRating) {
        // Refresh ratings after successful submission
        await fetchRatings();
        return newRating;
      }
      return null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit rating');
      return null;
    }
  };

  const submitMultipleRatings = async (ratingsData: CreateRatingData[]) => {
    try {
      const newRatings = await RatingService.submitRatings(ratingsData);
      if (newRatings.length > 0) {
        // Refresh ratings after successful submission
        await fetchRatings();
        return newRatings;
      }
      return [];
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit ratings');
      return [];
    }
  };

  const checkIfUserRated = async (orderId: string, userId: string) => {
    try {
      return await RatingService.hasUserRatedOrder(orderId, userId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check rating status');
      return false;
    }
  };

  const getUserRatingStats = async (userId: string) => {
    try {
      return await RatingService.getUserRatingStats(userId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get user rating stats');
      return {
        averageRating: 0,
        totalRatings: 0,
        ratingDistribution: {}
      };
    }
  };

  return {
    ratings,
    averageRating,
    totalRatings,
    loading,
    error,
    fetchRatings,
    submitRating,
    submitMultipleRatings,
    checkIfUserRated,
    getUserRatingStats,
    refetch: fetchRatings
  };
};