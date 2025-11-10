import React from 'react';
import type { Offer } from '../types';
import CountdownTimer from './CountdownTimer';

const OfferCard: React.FC<{ offer: Offer }> = ({ offer }) => {
    const handleClick = () => {
        if (offer.restaurantId) {
            window.location.hash = `#/restaurant/${offer.restaurantId}`;
        } else {
            window.location.hash = `#/offers`;
        }
    };
    
    return (
        <div className="bg-white rounded-lg overflow-hidden shadow-md group hover:shadow-xl transition-shadow flex flex-col h-full">
            <div className="relative cursor-pointer" onClick={handleClick}>
                <img src={offer.imageUrl.replace('/1200/400', '/600/300')} alt={offer.title} className="w-full h-32 object-cover" />
                {offer.expiresAt &&
                    <div className="absolute bottom-2 right-2">
                        <CountdownTimer expiryDate={offer.expiresAt} />
                    </div>
                }
            </div>
            <div className="p-4 flex flex-col flex-grow">
                <h3 className="font-bold text-gray-800 truncate">{offer.title}</h3>
                <p className="text-sm text-gray-600 truncate flex-grow">{offer.description}</p>
                 {offer.restaurantName && <p className="text-xs text-gray-500 mt-1">At {offer.restaurantName}</p>}
                 <button onClick={handleClick} className="mt-2 w-full bg-red-500 text-white font-semibold py-2 rounded-lg text-sm hover:bg-red-600 transition">
                    Order Now
                </button>
            </div>
        </div>
    );
};


const OffersCarousel: React.FC<{ offers: Offer[] }> = ({ offers }) => {
    return (
        <div className="bg-gray-50">
            <div className="container mx-auto px-4 py-8">
                 <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-800">Limited-Time Offers</h2>
                    <a href="#/offers" className="text-red-500 font-semibold hover:text-red-700 transition">
                        View All &rarr;
                    </a>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {offers.length > 0
                        ? offers.map((offer) => <OfferCard key={offer.id} offer={offer} />)
                        : Array.from({ length: 3 }).map((_, i) => (
                             <div key={i} className="bg-white rounded-lg shadow-md animate-pulse">
                                <div className="w-full h-32 bg-gray-200"></div>
                                <div className="p-4 space-y-2">
                                    <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                                    <div className="h-10 bg-gray-200 rounded-lg mt-2"></div>
                                </div>
                            </div>
                        ))
                    }
                </div>
            </div>
        </div>
    );
};

export default OffersCarousel;