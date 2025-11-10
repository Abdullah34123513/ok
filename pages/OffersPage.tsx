import React, { useState, useEffect } from 'react';
import type { Offer } from '../types';
import * as api from '../services/api';
import CountdownTimer from '../components/CountdownTimer';
import { useCart } from '../contexts/CartContext';

const OfferCard: React.FC<{ offer: Offer }> = ({ offer }) => {
    const { applyOffer } = useCart();
    
    const handleApply = () => {
        if(applyOffer(offer)) {
            // window.location.hash = '#/cart';
        }
    };

    return (
        <div className="bg-white rounded-lg overflow-hidden shadow-lg group transform hover:-translate-y-1 transition-transform duration-300 flex flex-col">
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
             <div className="p-4 bg-gray-50">
                 <button onClick={handleApply} className="w-full bg-red-500 text-white font-bold py-2 px-4 rounded-full hover:bg-red-600 transition">
                    Apply Offer
                </button>
            </div>
        </div>
    );
};

const OffersPage: React.FC = () => {
    const [offers, setOffers] = useState<Offer[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        api.getOffers()
            .then(setOffers)
            .finally(() => setIsLoading(false));
    }, []);
    
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
                            <div className="w-full h-48 bg-gray-