import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number; // 0 to 5 (can be decimal)
  onRate?: (rating: number) => void;
  interactive?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  count?: number;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  onRate,
  interactive = false,
  size = 'sm',
  showCount = false,
  count,
}) => {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const starSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const currentDisplayRating = hoverRating !== null ? hoverRating : rating;

  return (
    <div className="flex items-center gap-1.5" role="group" aria-label="Song rating">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map(star => {
          const filled = currentDisplayRating >= star;
          const half = !filled && currentDisplayRating >= star - 0.5;

          return (
            <button
              key={star}
              type="button"
              disabled={!interactive}
              onClick={() => onRate && onRate(star)}
              onMouseEnter={() => interactive && setHoverRating(star)}
              onMouseLeave={() => interactive && setHoverRating(null)}
              className={`transition-colors focus:outline-none ${
                interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'
              }`}
              title={`${star} star${star > 1 ? 's' : ''}`}
            >
              <Star
                className={`${starSizes[size]} ${
                  filled
                    ? 'fill-amber-400 text-amber-400'
                    : half
                    ? 'fill-amber-400/50 text-amber-400'
                    : 'text-zinc-600'
                }`}
              />
            </button>
          );
        })}
      </div>

      <span className="text-xs font-mono tabular-nums text-zinc-400">
        {rating > 0 ? rating.toFixed(1) : 'Unrated'}
      </span>

      {showCount && count !== undefined && count > 0 && (
        <span className="text-xs text-zinc-500">
          ({count})
        </span>
      )}
    </div>
  );
};
