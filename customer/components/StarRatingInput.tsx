import React from 'react';
import { StarIcon } from '@components/Icons';

interface StarRatingInputProps {
  rating: number;
  onRatingChange: (rating: number) => void;
  starCount?: number;
}

const StarRatingInput: React.FC<StarRatingInputProps> = ({ rating, onRatingChange, starCount = 5 }) => {
  return (
    <div className="flex items-center space-x-1">
      {Array.from({ length: starCount }).map((_, index) => {
        const starValue = index + 1;
        return (
          <button
            key={starValue}
            type="button"
            onClick={() => onRatingChange(starValue)}
            className={`p-1 transition-transform transform hover:scale-125 ${
              starValue <= rating ? 'text-yellow-400' : 'text-gray-300'
            }`}
            aria-label={`Rate ${starValue} star`}
          >
            <StarIcon className="w-8 h-8" />
          </button>
        );
      })}
    </div>
  );
};

export default StarRatingInput;
