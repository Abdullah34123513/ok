import React, { useState, useEffect } from 'react';
import type { Offer } from '../types';
import * as api from '../services/api';
import CountdownTimer from '../components/CountdownTimer';
import { useCart } from '../contexts/CartContext';
import { useNotification } from '../contexts/NotificationContext';

const OfferCard: React.FC<{ offer: Offer, onApply: (offer: Offer) => void }> = ({ offer, onApply }) => (
    <div className="bg-white rounded-lg overflow-hidden shadow-md flex flex-col h-full">
        <div className="relative">
            <img src={offer.imageUrl.replace('/1200/400', '/600/300')} alt={offer.title} className="w-full h-40 object-cover" />
             {offer.expiresAt &&
                <div className="absolute bottom-2 right-2">
                    <CountdownTimer expiryDate={offer.expiresAt} />
                </div>
            }
        </div>
        <div className="p-4 flex-grow flex flex-col">
            <h3 className="font-bold text-gray-800">{offer.title}</h3>
            <p className="text-sm text-gray-600 mt-1 flex-grow">{offer.description}</p>
            {offer.restaurantName && <p className="text-xs text-gray-500 mt-1">From: <span className="font-semibold">{offer.restaurantName}</span></p>}
            <button 
                onClick={() => onApply(offer)}
                className="mt-3 w-full bg-red-100 text-red-600 font-semibold py-2 rounded-lg text-sm hover:bg-red-500 hover:text-white transition-colors"
            >
                Apply Offer
            </button>
        </div>
    </div>
);

const OffersPage: React.FC = () => {
    const [offers, setOffers] = useState<Offer[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const { applyOffer } = useCart();
    const { showNotification } = useNotification();

    useEffect(() => {
        setIsLoading(true);
        api.getAllActiveOffers()
            .then(setOffers)
            .finally(() => setIsLoading(false));
    }, []);

    const handleApplyOffer = (offer: Offer) => {
        const success = applyOffer(offer);
        if (success) {
            showNotification(`Offer "${offer.title}" applied!`, 'success');
            window.location.hash = '#/cart';
        } else {
            let message = 'Your cart does not meet the requirements for this offer.';
            if (offer.minOrderValue) {
                message += ` Minimum order is $${offer.minOrderValue}.`
            }
             if (offer.restaurantId) {
                message += ` It is only valid for items from ${offer.restaurantName}.`
            }
            showNotification(message, 'error');
        }
    };

    const filteredOffers = offers; // Mocking filters for now

    const OfferGridSkeleton = () => (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-md animate-pulse">
                    <div className="w-full h-40 bg-gray-200"></div>
                    <div className="p-4 space-y-2">
                        <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                        <div className="h-10 bg-gray-200 rounded-lg mt-3"></div>
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <div className="container mx-auto px-4 py-6">
            <div className="mb-6">
                 {/* Tabs/Filters */}
                <div className="border-b">
                    <nav className="flex space-x-4">
                        <button onClick={() => setFilter('all')} className={`px-3 py-2 font-semibold transition ${filter === 'all' ? 'border-b-2 border-red-500 text-red-500' : 'text-gray-500 hover:text-red-500'}`}>All Offers</button>
                        <button onClick={() => setFilter('nearby')} className={`px-3 py-2 font-semibold transition ${filter === 'nearby' ? 'border-b-2 border-red-500 text-red-500' : 'text-gray-500 hover:text-red-500'}`}>Nearby</button>
                        <button onClick={() => setFilter('restaurants')} className={`px-3 py-2 font-semibold transition ${filter === 'restaurants' ? 'border-b-2 border-red-500 text-red-500' : 'text-gray-500 hover:text-red-500'}`}>Restaurants</button>
                    </nav>
                </div>
            </div>

            {isLoading ? <OfferGridSkeleton /> : (
                filteredOffers.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredOffers.map(offer => (
                            <OfferCard key={offer.id} offer={offer} onApply={handleApplyOffer} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 text-gray-500">
                        <p className="text-xl font-semibold">No offers available right now.</p>
                        <p>Please check back later!</p>
                    </div>
                )
            )}
        </div>
    );
}

export default OffersPage;
