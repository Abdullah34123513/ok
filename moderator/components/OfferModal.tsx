
import React, { useState, useEffect } from 'react';
import { CloseIcon } from './Icons';
import type { Offer } from '@shared/types';

interface OfferModalProps {
    offer?: Offer;
    onClose: () => void;
    onSave: (offer: Omit<Offer, 'id'>) => void;
}

const OfferModal: React.FC<OfferModalProps> = ({ offer, onClose, onSave }) => {
    const [title, setTitle] = useState(offer?.title || '');
    const [description, setDescription] = useState(offer?.description || '');
    const [imageUrl, setImageUrl] = useState(offer?.imageUrl || 'https://picsum.photos/seed/newoffer/1200/400');
    const [couponCode, setCouponCode] = useState(offer?.couponCode || '');
    const [discountType, setDiscountType] = useState<Offer['discountType']>(offer?.discountType || 'PERCENTAGE');
    const [discountValue, setDiscountValue] = useState<number>(offer?.discountValue || 0);
    const [expiry, setExpiry] = useState(offer?.expiry ? new Date(offer.expiry).toISOString().split('T')[0] : '');
    const [applicableTo, setApplicableTo] = useState<string>('ALL'); // Simplify for mock: 'ALL' or restaurant ID

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            title,
            description,
            imageUrl,
            couponCode: couponCode || undefined,
            discountType,
            discountValue,
            expiry: expiry ? new Date(expiry).toISOString() : undefined,
            applicableTo: applicableTo === 'ALL' ? 'ALL' : { type: 'RESTAURANT', id: applicableTo },
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg flex flex-col max-h-[90vh]">
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800">{offer ? 'Edit Offer' : 'Create Offer'}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700"><CloseIcon /></button>
                </div>
                
                <form id="offer-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Title</label>
                        <input type="text" required value={title} onChange={e => setTitle(e.target.value)} className="w-full border p-2 rounded mt-1" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea required value={description} onChange={e => setDescription(e.target.value)} className="w-full border p-2 rounded mt-1" rows={3} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Discount Type</label>
                            <select value={discountType} onChange={e => setDiscountType(e.target.value as any)} className="w-full border p-2 rounded mt-1">
                                <option value="PERCENTAGE">Percentage (%)</option>
                                <option value="FIXED">Fixed Amount (৳)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Value</label>
                            <input type="number" required value={discountValue} onChange={e => setDiscountValue(Number(e.target.value))} className="w-full border p-2 rounded mt-1" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Expiry Date</label>
                        <input type="date" value={expiry} onChange={e => setExpiry(e.target.value)} className="w-full border p-2 rounded mt-1" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Coupon Code (Optional)</label>
                        <input type="text" value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())} className="w-full border p-2 rounded mt-1" placeholder="e.g. SAVE50" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Image URL</label>
                        <input type="text" required value={imageUrl} onChange={e => setImageUrl(e.target.value)} className="w-full border p-2 rounded mt-1" />
                    </div>
                </form>

                <div className="p-4 border-t flex justify-end space-x-3">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 font-semibold rounded-lg hover:bg-gray-300 transition">Cancel</button>
                    <button type="submit" form="offer-form" className="px-4 py-2 bg-[#FF6B00] text-white font-semibold rounded-lg hover:bg-orange-600 transition">Save Offer</button>
                </div>
            </div>
        </div>
    );
};

export default OfferModal;
