import React, { useState } from 'react';
import type { Order, OrderReview } from '../types';
import * as api from '../services/api';
import { CloseIcon } from './Icons';
import StarRatingInput from './StarRatingInput';
import { useNotification } from '../contexts/NotificationContext';

interface ReviewModalProps {
  order: Order;
  onClose: () => void;
  onSubmit: () => void;
}

interface ItemReviewState {
  rating: number;
  comment: string;
}

const ReviewModal: React.FC<ReviewModalProps> = ({ order, onClose, onSubmit }) => {
  // Fix: Explicitly typed the accumulator in the 'reduce' method to ensure the initial state 'reviews' is correctly typed.
  const [reviews, setReviews] = useState<Record<string, ItemReviewState>>(
    order.items.reduce((acc: Record<string, ItemReviewState>, item) => {
      acc[item.baseItem.id] = { rating: 0, comment: '' };
      return acc;
    }, {})
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showNotification } = useNotification();

  const handleRatingChange = (itemId: string, rating: number) => {
    setReviews(prev => ({ ...prev, [itemId]: { ...prev[itemId], rating } }));
  };

  const handleCommentChange = (itemId: string, comment: string) => {
    setReviews(prev => ({ ...prev, [itemId]: { ...prev[itemId], comment } }));
  };
  
  // FIX: Refactored to use Object.keys() to ensure proper type inference and resolve 'unknown' type error.
  const canSubmit = Object.keys(reviews).some(itemId => reviews[itemId].rating > 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) {
      showNotification('Please rate at least one item.', 'error');
      return;
    }
    
    setIsSubmitting(true);
    
    // FIX: Refactored to use Object.keys() to ensure proper type inference and resolve 'unknown' type error.
    const reviewPayload: OrderReview = {
        orderId: order.id,
        itemReviews: Object.keys(reviews)
            .filter((itemId) => reviews[itemId].rating > 0)
            .map((itemId) => ({
                itemId,
                rating: reviews[itemId].rating,
                comment: reviews[itemId].comment || undefined,
            }))
    };
    
    try {
        await api.submitOrderReview(reviewPayload);
        onSubmit();
    } catch(error) {
        console.error("Failed to submit review", error);
        showNotification('There was a problem submitting your review. Please try again.', 'error');
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl animate-fade-in-up flex flex-col">
        <header className="p-4 border-b flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">Leave a Review</h2>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
                <CloseIcon />
            </button>
        </header>

        <form onSubmit={handleSubmit}>
            <main className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                {order.items.map(item => (
                    // FIX: Use the unique `cartItemId` for the key and access display properties via `baseItem`.
                    <div key={item.cartItemId} className="flex space-x-4 pb-4 border-b last:border-b-0">
                        <img src={item.baseItem.imageUrl} alt={item.baseItem.name} className="w-24 h-24 rounded-md object-cover flex-shrink-0"/>
                        <div className="flex-1 space-y-2">
                            <h3 className="font-bold">{item.baseItem.name}</h3>
                            <StarRatingInput 
                                // FIX: Use the `baseItem.id` to look up the review state.
                                rating={reviews[item.baseItem.id]?.rating || 0}
                                onRatingChange={(rating) => handleRatingChange(item.baseItem.id, rating)}
                            />
                            <textarea
                                // FIX: Use the `baseItem.id` to look up the review state.
                                value={reviews[item.baseItem.id]?.comment || ''}
                                onChange={(e) => handleCommentChange(item.baseItem.id, e.target.value)}
                                placeholder="Optional: Tell us more about your experience..."
                                className="w-full mt-2 p-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                                rows={2}
                            ></textarea>
                        </div>
                    </div>
                ))}
            </main>

            <footer className="p-4 border-t bg-gray-50 rounded-b-lg">
                <button
                    type="submit"
                    disabled={!canSubmit || isSubmitting}
                    className="w-full bg-red-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-red-600 transition duration-300 disabled:bg-red-300 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? 'Submitting...' : 'Submit Review'}
                </button>
            </footer>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;
