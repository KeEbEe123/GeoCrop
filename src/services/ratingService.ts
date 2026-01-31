import { supabase } from '@/lib/supabase';

export interface Rating {
  id: string;
  orderId: string;
  raterId: string;
  ratedEntityType: 'crop' | 'user' | 'product';
  ratedEntityId: string;
  rating: number;
  comment?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRatingData {
  orderId: string;
  raterId: string;
  ratedEntityType: 'crop' | 'user' | 'product';
  ratedEntityId: string;
  rating: number;
  comment?: string;
}

export class RatingService {
  /**
   * Submit a single rating
   */
  static async submitRating(ratingData: CreateRatingData): Promise<Rating | null> {
    try {
      const { data, error } = await supabase
        .from('ratings')
        .insert({
          order_id: ratingData.orderId,
          rater_id: ratingData.raterId,
          rated_entity_type: ratingData.ratedEntityType,
          rated_entity_id: ratingData.ratedEntityId,
          rating: ratingData.rating,
          comment: ratingData.comment
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return this.mapDbRowToRating(data);
    } catch (error) {
      console.error('Error submitting rating:', error);
      return null;
    }
  }

  /**
   * Submit multiple ratings at once
   */
  static async submitRatings(ratingsData: CreateRatingData[]): Promise<Rating[]> {
    try {
      const insertData = ratingsData.map(rating => ({
        order_id: rating.orderId,
        rater_id: rating.raterId,
        rated_entity_type: rating.ratedEntityType,
        rated_entity_id: rating.ratedEntityId,
        rating: rating.rating,
        comment: rating.comment
      }));

      const { data, error } = await supabase
        .from('ratings')
        .insert(insertData)
        .select();

      if (error) {
        throw error;
      }

      return data.map(row => this.mapDbRowToRating(row));
    } catch (error) {
      console.error('Error submitting ratings:', error);
      return [];
    }
  }

  /**
   * Get ratings for a specific order
   */
  static async getRatingsByOrderId(orderId: string): Promise<Rating[]> {
    try {
      const { data, error } = await supabase
        .from('ratings')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data.map(row => this.mapDbRowToRating(row));
    } catch (error) {
      console.error('Error fetching ratings by order:', error);
      return [];
    }
  }

  /**
   * Get ratings for a specific entity (crop, user, or product)
   */
  static async getRatingsByEntity(entityType: 'crop' | 'user' | 'product', entityId: string): Promise<Rating[]> {
    try {
      const { data, error } = await supabase
        .from('ratings')
        .select(`
          *,
          users!ratings_rater_id_fkey(name, avatar)
        `)
        .eq('rated_entity_type', entityType)
        .eq('rated_entity_id', entityId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data.map(row => ({
        ...this.mapDbRowToRating(row),
        raterName: row.users?.name,
        raterAvatar: row.users?.avatar
      }));
    } catch (error) {
      console.error('Error fetching ratings by entity:', error);
      return [];
    }
  }

  /**
   * Get average rating for an entity
   */
  static async getAverageRating(entityType: 'crop' | 'user' | 'product', entityId: string): Promise<{ average: number; count: number }> {
    try {
      const { data, error } = await supabase
        .from('ratings')
        .select('rating')
        .eq('rated_entity_type', entityType)
        .eq('rated_entity_id', entityId);

      if (error) {
        throw error;
      }

      if (data.length === 0) {
        return { average: 0, count: 0 };
      }

      const total = data.reduce((sum, rating) => sum + rating.rating, 0);
      const average = total / data.length;

      return { average: Math.round(average * 10) / 10, count: data.length };
    } catch (error) {
      console.error('Error calculating average rating:', error);
      return { average: 0, count: 0 };
    }
  }

  /**
   * Check if user has already rated an order
   */
  static async hasUserRatedOrder(orderId: string, userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('ratings')
        .select('id')
        .eq('order_id', orderId)
        .eq('rater_id', userId)
        .limit(1);

      if (error) {
        throw error;
      }

      return data.length > 0;
    } catch (error) {
      console.error('Error checking if user rated order:', error);
      return false;
    }
  }

  /**
   * Get user's rating statistics
   */
  static async getUserRatingStats(userId: string): Promise<{
    averageRating: number;
    totalRatings: number;
    ratingDistribution: { [key: number]: number };
  }> {
    try {
      const { data, error } = await supabase
        .from('ratings')
        .select('rating')
        .eq('rated_entity_type', 'user')
        .eq('rated_entity_id', userId);

      if (error) {
        throw error;
      }

      if (data.length === 0) {
        return {
          averageRating: 0,
          totalRatings: 0,
          ratingDistribution: {}
        };
      }

      const total = data.reduce((sum, rating) => sum + rating.rating, 0);
      const average = total / data.length;

      const distribution = data.reduce((acc, rating) => {
        acc[rating.rating] = (acc[rating.rating] || 0) + 1;
        return acc;
      }, {} as { [key: number]: number });

      return {
        averageRating: Math.round(average * 10) / 10,
        totalRatings: data.length,
        ratingDistribution: distribution
      };
    } catch (error) {
      console.error('Error getting user rating stats:', error);
      return {
        averageRating: 0,
        totalRatings: 0,
        ratingDistribution: {}
      };
    }
  }

  /**
   * Update an existing rating
   */
  static async updateRating(ratingId: string, updates: { rating?: number; comment?: string }): Promise<boolean> {
    try {
      const updateData: any = {};
      if (updates.rating !== undefined) updateData.rating = updates.rating;
      if (updates.comment !== undefined) updateData.comment = updates.comment;

      const { error } = await supabase
        .from('ratings')
        .update(updateData)
        .eq('id', ratingId);

      return !error;
    } catch (error) {
      console.error('Error updating rating:', error);
      return false;
    }
  }

  /**
   * Delete a rating
   */
  static async deleteRating(ratingId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('ratings')
        .delete()
        .eq('id', ratingId);

      return !error;
    } catch (error) {
      console.error('Error deleting rating:', error);
      return false;
    }
  }

  /**
   * Helper function to map database row to Rating interface
   */
  private static mapDbRowToRating(row: any): Rating {
    return {
      id: row.id,
      orderId: row.order_id,
      raterId: row.rater_id,
      ratedEntityType: row.rated_entity_type,
      ratedEntityId: row.rated_entity_id,
      rating: row.rating,
      comment: row.comment,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}