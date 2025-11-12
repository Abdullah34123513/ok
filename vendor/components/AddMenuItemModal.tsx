import React, { useState } from 'react';
import * as api from '@shared/api';
import { useAuth } from '../contexts/AuthContext';
import type { MenuItem } from '@shared/types';
import { CloseIcon } from './Icons';

interface AddMenuItemModalProps {
    isOpen: boolean;
    onClose: () => void;
    onItemAdded: () => void;
}

const AddMenuItemModal: React.FC<AddMenuItemModalProps> = ({ isOpen, onClose, onItemAdded }) => {
    const { currentVendor } = useAuth();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentVendor) {
            setError('Authentication error. Please log in again.');
            return;
        }
        if (!name || !price) {
            setError('Name and Price are required fields.');
            return;
        }

        setIsSaving(true);
        setError('');

        const newItem: Omit<MenuItem, 'id' | 'restaurantId' | 'restaurantName'> = {
            name,
            description,
            price: parseFloat(price),
            imageUrl: imageUrl || `https://picsum.photos/seed/${name.replace(/\s/g, '')}/400/300`, // Default image
        };

        try {
            await api.addMenuItem(currentVendor.id, newItem);
            onItemAdded();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to add item.');
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl p-6 sm:p-8 w-full max-w-lg animate-fade-in-up relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 p-1 rounded-full transition-colors">
                    <CloseIcon className="w-6 h-6" />
                </button>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Add New Menu Item</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && <div className="bg-red-100 text-red-700 p-3 rounded-md">{error}</div>}
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                        <input type="text" name="name" id="name" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea name="description" id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"></textarea>
                    </div>
                     <div>
                        <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price ($)</label>
                        <input type="number" name="price" id="price" value={price} onChange={(e) => setPrice(e.target.value)} required step="0.01" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
                    </div>
                    <div>
                        <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">Image URL (Optional)</label>
                        <input type="text" name="imageUrl" id="imageUrl" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://example.com/image.jpg" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
                    </div>
                    <div className="pt-4 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 font-semibold rounded-lg hover:bg-gray-300 transition">
                            Cancel
                        </button>
                        <button type="submit" disabled={isSaving} className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:bg-blue-300">
                            {isSaving ? 'Saving...' : 'Save Item'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddMenuItemModal;