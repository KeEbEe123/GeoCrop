import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useRatings } from '@/hooks/useRatings';
import RatingDisplay from './RatingDisplay';
import { Star, User, TrendingUp } from 'lucide-react';

interface UserRatingProfileProps {
  userId: string;
  userName: string;
  userRole: 'farmer' | 'buyer' | 'seller';
}

const UserRatingProfile: React.FC<UserRatingProfileProps> = ({
  userId,
  userName,
  userRole
}) => {
  const { averageRating, totalRatings, loading } = useRatings('user', userId);
  const [ratingStats, setRatingStats] = React.useState<{
    averageRating: number;
    totalRatings: number;
    ratingDistribution: { [key: number]: number };
  }>({
    averageRating: 0,
    totalRatings: 0,
    ratingDistribution: {}
  });

  React.useEffect(() => {
    const loadUserStats = async () => {
      try {
        // This would use the useRatings hook's getUserRatingStats method
        // For now, we'll use the basic data from the hook
        setRatingStats({
          averageRating,
          totalRatings,
          ratingDistribution: {} // Would be populated by the service
        });
      } catch (error) {
        console.error('Error loading user rating stats:', error);
      }
    };

    if (userId) {
      loadUserStats();
    }
  }, [userId, averageRating, totalRatings]);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            <div className="space-y-2">
              <div className="h-2 bg-gray-200 rounded"></div>
              <div className="h-2 bg-gray-200 rounded w-4/5"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (totalRatings === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            {userRole === 'farmer' ? 'Farmer' : userRole === 'seller' ? 'Seller' : 'Buyer'} Rating
          </CardTitle>
          <CardDescription>
            {userName}'s reputation in the marketplace
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <Star className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <h3 className="font-semibold mb-1">No Ratings Yet</h3>
            <p className="text-sm text-muted-foreground">
              Complete some orders to start building your reputation!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          {userRole === 'farmer' ? 'Farmer' : userRole === 'seller' ? 'Seller' : 'Buyer'} Rating
        </CardTitle>
        <CardDescription>
          {userName}'s reputation based on {totalRatings} {totalRatings === 1 ? 'review' : 'reviews'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Rating */}
        <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">{averageRating}</div>
            <RatingDisplay rating={averageRating} showValue={false} />
            <div className="text-xs text-muted-foreground mt-1">
              out of 5 stars
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium">
                {averageRating >= 4.5 ? 'Excellent' : 
                 averageRating >= 4.0 ? 'Very Good' :
                 averageRating >= 3.5 ? 'Good' :
                 averageRating >= 3.0 ? 'Average' : 'Needs Improvement'} Rating
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Based on feedback from {totalRatings} completed {totalRatings === 1 ? 'transaction' : 'transactions'}
            </p>
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Rating Breakdown</h4>
          {[5, 4, 3, 2, 1].map((star) => {
            const count = ratingStats.ratingDistribution[star] || 0;
            const percentage = totalRatings > 0 ? (count / totalRatings) * 100 : 0;
            
            return (
              <div key={star} className="flex items-center gap-2 text-sm">
                <span className="w-3 text-right">{star}</span>
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <Progress value={percentage} className="flex-1 h-2" />
                <span className="w-8 text-right text-xs text-muted-foreground">
                  {count}
                </span>
              </div>
            );
          })}
        </div>

        {/* Trust Indicators */}
        <div className="grid grid-cols-2 gap-4 pt-2 border-t">
          <div className="text-center">
            <div className="text-lg font-semibold text-primary">{totalRatings}</div>
            <div className="text-xs text-muted-foreground">Total Reviews</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-green-600">
              {totalRatings > 0 ? Math.round((Object.entries(ratingStats.ratingDistribution)
                .filter(([rating]) => parseInt(rating) >= 4)
                .reduce((sum, [, count]) => sum + count, 0) / totalRatings) * 100) : 0}%
            </div>
            <div className="text-xs text-muted-foreground">Positive Reviews</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserRatingProfile;