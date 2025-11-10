
import React from 'react';
import type { Offer } from '../types';

interface OfferCardProps {
    offer: Offer;
}

const OfferCard: React.FC<OfferCardProps> = ({ offer }) => (
    <div className="flex-shrink-0 w-80 mr-4 group cursor-pointer">
        <div className="rounded-lg overflow-hidden shadow-lg transform group-hover:scale-105 transition-transform duration-300">
            <img src={offer.imageUrl.replace('/1200/400', '/600/300')} alt={offer.title} className="w-full h-40 object-cover" />
            <div className="p-4 bg-white">
                <h3 className="font-bold text-gray-800">{offer.title}</h3>
                <p className="text-sm text-gray-600">{offer.description}</p>
            </div>
        </div>
    </div>
);

const OffersCarousel: React.FC<{ offers: Offer[] }> = ({ offers }) => {
    return (
        <div className="bg-gray-50">
            <div className="container mx-auto px-4 py-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Limited-Time Offers</h2>
                <div className="flex overflow-x-auto pb-4 -mx-2">
                    {offers.length > 0
                        ? offers.map((offer) => <OfferCard key={offer.id} offer={offer} />)
                        : Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="flex-shrink-0 w-80 mr-4">
                                <div className="rounded-lg shadow-lg bg-white">
                                    <div className="w-full h-40 bg-gray-200 animate-pulse"></div>
                                    <div className="p-4">
                                        <div className="h-5 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
                                        <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
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
