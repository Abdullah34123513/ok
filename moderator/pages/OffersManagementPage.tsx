
import React, { useState, useEffect } from 'react';
import * as api from '@shared/api';
import type { Offer } from '@shared/types';
import { TagIcon, PlusIcon, EditIcon, TrashIcon } from '../components/Icons';
import OfferModal from '../components/OfferModal';
import { useNotification } from '@shared/contexts/NotificationContext';

const OffersManagementPage: React.FC = () => {
    const [offers, setOffers] = useState<Offer[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingOffer, setEditingOffer] = useState<Offer | undefined>(undefined);
    const { showNotification } = useNotification();

    const fetchOffers = async () => {
        setIsLoading(true);
        try {
            const data = await api.getSystemOffers();
            setOffers(data);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchOffers();
    }, []);

    const handleCreate = () => {
        setEditingOffer(undefined);
        setIsModalOpen(true);
    };

    const handleEdit = (offer: Offer) => {
        setEditingOffer(offer);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this offer?')) {
            await api.deleteSystemOffer(id);
            showNotification('Offer deleted successfully', 'success');
            fetchOffers();
        }
    };

    const handleSave = async (offerData: Omit<Offer, 'id'>) => {
        try {
            if (editingOffer) {
                await api.updateSystemOffer(editingOffer.id, offerData);
                showNotification('Offer updated successfully', 'success');
            } else {
                await api.createSystemOffer(offerData);
                showNotification('Offer created successfully', 'success');
            }
            setIsModalOpen(false);
            fetchOffers();
        } catch (err) {
            showNotification('Failed to save offer', 'error');
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                    <TagIcon className="w-7 h-7 mr-3 text-[#FF6B00]" />
                    Exclusive Deals Management
                </h1>
                <button onClick={handleCreate} className="px-4 py-2 bg-[#FF6B00] text-white font-semibold rounded-lg hover:bg-orange-600 transition flex items-center">
                    <PlusIcon className="w-4 h-4 mr-2" /> Create Offer
                </button>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                {isLoading ? (
                    <div className="p-8 text-center text-gray-500">Loading offers...</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="p-4 font-semibold">Offer</th>
                                    <th className="p-4 font-semibold">Discount</th>
                                    <th className="p-4 font-semibold">Code</th>
                                    <th className="p-4 font-semibold">Expiry</th>
                                    <th className="p-4 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {offers.map(offer => (
                                    <tr key={offer.id} className="hover:bg-gray-50">
                                        <td className="p-4 flex items-center space-x-3">
                                            <img src={offer.imageUrl} alt="" className="w-16 h-10 object-cover rounded" />
                                            <div>
                                                <p className="font-bold text-gray-800">{offer.title}</p>
                                                <p className="text-xs text-gray-500 truncate max-w-xs">{offer.description}</p>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-bold">
                                                {offer.discountType === 'PERCENTAGE' ? `${offer.discountValue}% OFF` : `৳${offer.discountValue} OFF`}
                                            </span>
                                        </td>
                                        <td className="p-4 font-mono text-sm">{offer.couponCode || '-'}</td>
                                        <td className="p-4 text-sm text-gray-600">
                                            {offer.expiry ? new Date(offer.expiry).toLocaleDateString() : 'No Expiry'}
                                        </td>
                                        <td className="p-4 text-right whitespace-nowrap">
                                            <button onClick={() => handleEdit(offer)} className="text-blue-600 hover:bg-blue-50 p-2 rounded transition mr-2">
                                                <EditIcon className="w-5 h-5" />
                                            </button>
                                            <button onClick={() => handleDelete(offer.id)} className="text-red-600 hover:bg-red-50 p-2 rounded transition">
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {offers.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-gray-500">No offers found. Create one to get started.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            {isModalOpen && (
                <OfferModal 
                    offer={editingOffer} 
                    onClose={() => setIsModalOpen(false)} 
                    onSave={handleSave} 
                />
            )}
        </div>
    );
};

export default OffersManagementPage;
