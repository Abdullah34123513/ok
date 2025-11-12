import React, { useState, useEffect } from 'react';
import type { Offer } from '@shared/types';
import * as api from '@shared/api';
import CountdownTimer from '@components/CountdownTimer';

const OfferCard: React.FC<{ offer: Offer }> = ({ offer }) => {
    const handleCardClick = () => {
        window.location.hash = `#/offer/${offer.id}`;
    };

    return (
        <div 
            onClick={handleCardClick}
            className="bg-white rounded-lg overflow-hidden shadow-lg group transform hover:-translate-y-1 transition-transform duration-300 flex flex-col cursor-pointer"
        >
            <img src={offer.imageUrl.replace('/1200/400', '/600/300')} alt={offer.title} className="w-full h-48 object-cover" />
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

interface OffersPageProps {
    location: string;
}

const OffersPage: React.FC<OffersPageProps> = ({ location }) => {
    const [offers, setOffers] = useState<Offer[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        api.getOffers(location)
            .then(setOffers)
            .finally(() => setIsLoading(false));
    }, [location]);
    
    // Mock filters for UI
    const filters = ['All Offers', 'Nearby', 'Restaurant-Specific'];
    const [activeFilter, setActiveFilter] = useState(filters[0]);
    
    return (
        <div className="container mx-auto px-4 py-6">
            <h1 className="text-3xl font-extrabold text-gray-800 mb-2">Limited-Time Offers</h1>
            <p className="text-gray-600 mb-6">Don't miss out on these amazing deals from your favorite restaurants!</p>

            <div className="border-b mb-6">
                <nav className="flex space-x-4">
                    {filters.map(filter => (
                        <button 
                            key={filter} 
                            onClick={() => setActiveFilter(filter)} 
                            className={`px-3 py-2 font-semibold transition ${activeFilter === filter ? 'border-b-2 border-red-500 text-red-500' : 'text-gray-500 hover:text-red-500'}`}
                        >
                            {filter}
                        </button>
                    ))}
                </nav>
            </div>

            {isLoading ? (
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, i) => (
                         <div key={i} className="bg-white rounded-lg shadow-lg animate-pulse">
                            <div className="w-full h-48 bg-gray-200"></div>
                            <div className="p-4">
                                <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                 <div className="mt-4 pt-4 border-t border-dashed">
                                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                                 </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {offers.map(offer => <OfferCard key={offer.id} offer={offer} />)}
                </div>
            )}
        </div>
    );
};

export default OffersPage;
