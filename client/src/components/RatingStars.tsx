import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { useLocale } from '../contexts/LocaleContext';

interface RatingStarsProps {
  reportId: string;
  averageRating: number;
  totalRatings: number;
  userRating?: number;
  onRate?: (rating: number) => void;
  readonly?: boolean;
  showCount?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const RatingStars: React.FC<RatingStarsProps> = ({
  reportId,
  averageRating,
  totalRatings,
  userRating,
  onRate,
  readonly = false,
  showCount = true,
  size = 'md'
}) => {
  const [hoverRating, setHoverRating] = useState(0);
  const { locale } = useLocale();

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const handleClick = (rating: number) => {
    if (!readonly && onRate) {
      onRate(rating);
    }
  };

  const displayRating = hoverRating || userRating || averageRating;

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => handleClick(star)}
            onMouseEnter={() => !readonly && setHoverRating(star)}
            onMouseLeave={() => !readonly && setHoverRating(0)}
            disabled={readonly}
            className={`${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} transition-transform duration-200`}
          >
            <Star
              className={`${sizeClasses[size]} ${
                star <= displayRating
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'fill-none text-gray-300 dark:text-gray-600'
              } transition-colors`}
            />
          </button>
        ))}
      </div>

      {showCount && (
        <div className="flex items-center gap-2 text-sm">
          <span className="font-bold text-gray-700 dark:text-gray-200">
            {averageRating.toFixed(1)}
          </span>
          <span className="text-gray-500 dark:text-gray-400">
            ({totalRatings} {locale === 'ar' ? 'تقييم' : 'rating'}
            {totalRatings !== 1 && locale !== 'ar' && 's'})
          </span>
        </div>
      )}

      {!readonly && userRating && (
        <span className="text-xs text-blue-600 dark:text-blue-400">
          {locale === 'ar' ? 'تقييمك' : 'Your rating'}
        </span>
      )}
    </div>
  );
};

export default RatingStars;

