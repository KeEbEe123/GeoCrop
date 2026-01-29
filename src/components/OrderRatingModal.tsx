import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useRatings } from '@/hooks/useRatings';
import { Order } from '@/types';
import { RatingService, Rating } from '@/services/ratingService';
import RatingInput from './RatingInput';
import RatingDisplay from './RatingDisplay';
import { X, Star, User, Package } from 'lucide-react';

interface OrderRatingModalProps {
  order: Order;
  onClose: () => void;
  onRatingSubmitted: () => void;
}

interface RatingData {
  cropRating: number;
  cropComment: string;
  userRating: number;
  userComment: string;
}

const OrderRatingModal: React.FC<OrderRatingModalProps> = ({
  order,
  onClose,
  onRatingSubmitted
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { submitMultipleRatings } = useRatings();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingRatings, setExistingRatings] = useState<Rating[]>([]);
  const [ratingData, setRatingData] = useState<RatingData>({
    cropRating: 0,
    cropComment: '',
    userRating: 0,
    userComment: ''
  });

  // Determine what the user can rate based on their role
  const canRateCrop = user?.role === 'buyer' && order.type === 'crop';
  const canRateUser = true; // Both buyers and sellers can rate each other
  const ratedUserId = user?.role === 'buyer' ? order.sellerId : order.buyerId;
  const ratedUserName = user?.role === 'buyer' ? order.seller : order.buyer;

  useEffect(() => {
    // Load existing ratings for this order
    loadExistingRatings();
  }, [order.id]);

  const loadExistingRatings = async () => {
    try {
      if (!user) return;
      
      const ratings = await RatingService.getRatingsByOrderId(order.id);
      const userRatings = ratings.filter(rating => rating.raterId === user.id);
      setExistingRatings(userRatings);
    } catch (error) {
      console.error('Error loading existing ratings:', error);
    }
  };

  const handleSubmit = async () => {
    if (!user) return;

    // Validate that at least one rating is provided
    if ((!canRateCrop || ratingData.cropRating === 0) && ratingData.userRating === 0) {
      toast({
        title: "Rating Required",
        description: "Please provide at least one rating before submitting.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const ratings = [];

      // Add crop rating if applicable
      if (canRateCrop && ratingData.cropRating > 0) {
        ratings.push({
          orderId: order.id,
          raterId: user.id,
          ratedEntityType: 'crop',
          ratedEntityId: order.itemId,
          rating: ratingData.cropRating,
          comment: ratingData.cropComment
        });
      }

      // Add user rating if provided
      if (ratingData.userRating > 0) {
        ratings.push({
          orderId: order.id,
          raterId: user.id,
          ratedEntityType: 'user',
          ratedEntityId: ratedUserId,
          rating: ratingData.userRating,
          comment: ratingData.userComment
        });
      }

      // Submit ratings using the rating service
      const ratingsToSubmit = [];

      // Add crop rating if applicable
      if (canRateCrop && ratingData.cropRating > 0) {
        ratingsToSubmit.push({
          orderId: order.id,
          raterId: user.id,
          ratedEntityType: 'crop' as const,
          ratedEntityId: order.itemId,
          rating: ratingData.cropRating,
          comment: ratingData.cropComment
        });
      }

      // Add user rating if provided
      if (ratingData.userRating > 0) {
        ratingsToSubmit.push({
          orderId: order.id,
          raterId: user.id,
          ratedEntityType: 'user' as const,
          ratedEntityId: ratedUserId,
          rating: ratingData.userRating,
          comment: ratingData.userComment
        });
      }

      const submittedRatings = await submitMultipleRatings(ratingsToSubmit);

      toast({
        title: "Ratings Submitted",
        description: "Thank you for your feedback!",
      });

      onRatingSubmitted();
      onClose();
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "Failed to submit ratings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if ratings already exist
  const hasExistingRatings = existingRatings.length > 0;

  if (hasExistingRatings) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <Card className="max-w-2xl w-full">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5" />
                Your Ratings - Order #{order.id}
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <CardDescription>
              You have already rated this order
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {existingRatings.map((rating, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  {rating.ratedEntityType === 'crop' ? (
                    <Package className="w-4 h-4" />
                  ) : (
                    <User className="w-4 h-4" />
                  )}
                  <span className="font-medium">
                    {rating.ratedEntityType === 'crop' ? 'Crop Rating' : 'User Rating'}
                  </span>
                </div>
                <RatingDisplay rating={rating.rating} />
                {rating.comment && (
                  <p className="text-sm text-muted-foreground mt-2">{rating.comment}</p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5" />
              Rate Your Experience - Order #{order.id}
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          <CardDescription>
            Help others by sharing your experience with this order
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Crop Rating Section */}
          {canRateCrop && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                <h3 className="text-lg font-semibold">Rate the Crop</h3>
              </div>
              <div className="p-4 border rounded-lg space-y-4">
                <div>
                  <Label className="text-base font-medium">{order.item}</Label>
                  <p className="text-sm text-muted-foreground">
                    How would you rate the quality of this crop?
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Rating</Label>
                  <RatingInput
                    rating={ratingData.cropRating}
                    onRatingChange={(rating) => 
                      setRatingData(prev => ({ ...prev, cropRating: rating }))
                    }
                    size="lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cropComment">Comment (Optional)</Label>
                  <Textarea
                    id="cropComment"
                    value={ratingData.cropComment}
                    onChange={(e) => 
                      setRatingData(prev => ({ ...prev, cropComment: e.target.value }))
                    }
                    placeholder="Share your thoughts about the crop quality, freshness, etc."
                    rows={3}
                  />
                </div>
              </div>
            </div>
          )}

          {/* User Rating Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5" />
              <h3 className="text-lg font-semibold">
                Rate {user?.role === 'buyer' ? 'the Seller' : 'the Buyer'}
              </h3>
            </div>
            <div className="p-4 border rounded-lg space-y-4">
              <div>
                <Label className="text-base font-medium">{ratedUserName}</Label>
                <p className="text-sm text-muted-foreground">
                  How was your experience with this {user?.role === 'buyer' ? 'seller' : 'buyer'}?
                </p>
              </div>
              <div className="space-y-2">
                <Label>Rating</Label>
                <RatingInput
                  rating={ratingData.userRating}
                  onRatingChange={(rating) => 
                    setRatingData(prev => ({ ...prev, userRating: rating }))
                  }
                  size="lg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="userComment">Comment (Optional)</Label>
                <Textarea
                  id="userComment"
                  value={ratingData.userComment}
                  onChange={(e) => 
                    setRatingData(prev => ({ ...prev, userComment: e.target.value }))
                  }
                  placeholder={`Share your experience with ${ratedUserName} - communication, delivery, etc.`}
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4 border-t">
            <Button onClick={handleSubmit} disabled={isSubmitting} className="flex-1">
              {isSubmitting ? 'Submitting...' : 'Submit Ratings'}
            </Button>
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderRatingModal;