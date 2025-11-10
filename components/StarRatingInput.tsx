import React, { useState } from 'react';
import { StarIcon, XCircleIcon } from './Icons';

interface StarRatingInputProps {
  rating: number;
  onRatingChange: (rating: number) => void;
  maxRating?: number;
}

const StarRatingInput: React.FC<StarRatingInputProps> = ({ rating, onRatingChange, maxRating = 5 }) => {
  const [hoverRating, setHoverRating] = useState(0);

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRatingChange(0);
  };

  return (
    <div className="flex items-center space-x-1">
      {[...Array(maxRating)].map((_, index) => {
        const starValue = index + 1;
        return (
          <button
            key={starValue}
            type="button"
            className={`transition-colors duration-150 ${
              starValue <= (hoverRating || rating)
                ? 'text-yellow-400'
                : 'text-gray-300'
            }`}
            onClick={(e) => {
                e.stopPropagation();
                onRatingChange(starValue)
            }}
            onMouseEnter={() => setHoverRating(starValue)}
            onMouseLeave={() => setHoverRating(0)}
            aria-label={`Rate ${starValue} star${starValue > 1 ? 's' : ''}`}
          >
            <StarIcon className="w-6 h-6" />
          </button>
        );
      })}
      {rating > 0 && (
         <button
            type="button"
            onClick={handleClear}
            className="text-gray-400 hover:text-red-500 ml-2"
            aria-label="Clear rating"
        >
            <XCircleIcon />
        </button>
      )}
    </div>
  );
};

export default StarRatingInput;