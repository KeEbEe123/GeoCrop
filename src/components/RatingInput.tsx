import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RatingInputProps {
  rating: number;
  onRatingChange: (rating: number) => void;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
}

const RatingInput: React.FC<RatingInputProps> = ({
  rating,
  onRatingChange,
  maxRating = 5,
  size = 'md',
  disabled = false,
  className
}) => {
  const [hoverRating, setHoverRating] = useState(0);

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const handleClick = (starValue: number) => {
    if (!disabled) {
      onRatingChange(starValue);
    }
  };

  const handleMouseEnter = (starValue: number) => {
    if (!disabled) {
      setHoverRating(starValue);
    }
  };

  const handleMouseLeave = () => {
    if (!disabled) {
      setHoverRating(0);
    }
  };

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {Array.from({ length: maxRating }, (_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= (hoverRating || rating);
        
        return (
          <button
            key={index}
            type="button"
            onClick={() => handleClick(starValue)}
            onMouseEnter={() => handleMouseEnter(starValue)}
            onMouseLeave={handleMouseLeave}
            disabled={disabled}
            className={cn(
              'transition-colors duration-150',
              disabled ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-110'
            )}
          >
            <Star
              className={cn(
                sizeClasses[size],
                isFilled 
                  ? 'fill-yellow-400 text-yellow-400' 
                  : 'fill-gray-200 text-gray-300',
                !disabled && 'hover:fill-yellow-300 hover:text-yellow-400'
              )}
            />
          </button>
        );
      })}
    </div>
  );
};

export default RatingInput;