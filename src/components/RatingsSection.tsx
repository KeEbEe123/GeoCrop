import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useRatings } from '@/hooks/useRatings';
import RatingDisplay from './RatingDisplay';
import { Star, User, MessageCircle } from 'lucide-react';

interface RatingsSectionProps {
  entityType: 'crop' | 'user';
  entityId: string;
  entityName: string;
  showTitle?: boolean;
}

const RatingsSection: React.FC<RatingsSectionProps> = ({
  entityType,
  entityId,
  entityName,
  showTitle = true
}) => {
  const { ratings, averageRating, totalRatings, loading } = useRatings(entityType, entityId);
  const [showAll, setShowAll] = React.useState(false);

  const displayedRatings = showAll ? ratings : ratings.slice(0, 3);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 rounded"></div>
              <div className="h-3 bg-gray-200 rounded w-5/6"></div>
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
          {showTitle && (
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5" />
              Ratings & Reviews
            </CardTitle>
          )}
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Star className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Ratings Yet</h3>
            <p className="text-muted-foreground">
              Be the first to rate this {entityType === 'crop' ? 'crop' : 'seller'}!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        {showTitle && (
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5" />
            Ratings & Reviews
          </CardTitle>
        )}
        <CardDescription>
          What others are saying about {entityName}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Rating Summary */}
        <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
          <div className="text-center">
            <div className="text-3xl font-bold">{averageRating}</div>
            <RatingDisplay rating={averageRating} showValue={false} />
            <div className="text-sm text-muted-foreground mt-1">
              {totalRatings} {totalRatings === 1 ? 'review' : 'reviews'}
            </div>
          </div>
          <div className="flex-1">
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = ratings.filter(r => r.rating === star).length;
                const percentage = totalRatings > 0 ? (count / totalRatings) * 100 : 0;
                
                return (
                  <div key={star} className="flex items-center gap-2 text-sm">
                    <span className="w-3">{star}</span>
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="w-8 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Individual Reviews */}
        <div className="space-y-4">
          {displayedRatings.map((rating) => (
            <div key={rating.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={(rating as any).raterAvatar} />
                    <AvatarFallback>
                      <User className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium text-sm">
                      {(rating as any).raterName || 'Anonymous User'}
                    </div>
                    <div className="flex items-center gap-2">
                      <RatingDisplay rating={rating.rating} size="sm" showValue={false} />
                      <span className="text-xs text-muted-foreground">
                        {new Date(rating.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  {rating.rating}/5
                </Badge>
              </div>
              
              {rating.comment && (
                <div className="text-sm text-muted-foreground pl-11">
                  <MessageCircle className="w-3 h-3 inline mr-1" />
                  {rating.comment}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Show More Button */}
        {ratings.length > 3 && (
          <div className="text-center">
            <Button 
              variant="outline" 
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? 'Show Less' : `Show All ${totalRatings} Reviews`}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RatingsSection;