import React from 'react';
import type { Offer } from '../types';
import CountdownTimer from './CountdownTimer';

interface OfferCardProps {
    offer: Offer;
}

const OfferCard: React.FC<OfferCardProps> = ({ offer }) => {
    const handleCardClick = () => {
        window.location.hash = `#/offer/${offer.id}`;
    };

    return (
        <div
            onClick={handleCardClick}
            className="bg-white rounded-lg overflow-hidden shadow-lg group transform hover:-translate-y-1 transition-transform duration-300 flex flex-col cursor-pointer"
        >
            <img src={offer.imageUrl.replace('/1200/400', '/600/300')} alt={offer.title} className="w-full h-40 object-cover" />
            <div className="p-4 flex flex-col flex-grow">
                <h3 className="font-bold text-lg text-gray-800">{offer.title}</h3>
                <p className="text-sm text-gray-600 mt-1 flex-grow">{offer.description}</p>
                {offer.expiry && (
                     <div className="mt-4 pt-4 border-t border-dashed">
                         <p className="text-xs text-gray-500 mb-1">Expires in:</p>
                         <CountdownTimer expiry={offer.expiry} />
                     </div>
                )}
            </div>
        </div>
    );
};


const OffersCarousel: React.FC<{ offers: Offer[] }> = ({ offers }) => {
    return (
        <div className="bg-gray-50">
            <div className="container mx-auto px-4 py-8">
                 <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-800">Special Offers</h2>
                    <a href="#/offers" className="text-red-500 font-semibold hover:text-red-700 transition">
                        View All &rarr;
                    </a>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {offers.length > 0
                        ? offers.slice(0,3).map((offer) => <OfferCard key={offer.id} offer={offer} />)
                        : Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="bg-white rounded-lg shadow-lg animate-pulse">
                                <div className="w-full h-40 bg-gray-200"></div>
                                <div className="p-4">
                                    <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                     <div className="mt-4 pt-4 border-t border-dashed">
                                        <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                                        <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                                     </div>
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