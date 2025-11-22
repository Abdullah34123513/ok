
import React, { useState, useEffect, useCallback } from 'react';
import * as api from '@shared/api';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '@shared/contexts/NotificationContext';
import type { MenuCategory, MenuItem } from '@shared/types';
import { PlusCircleIcon, EditIcon, TrashIcon, CubeIcon, SearchIcon } from '../components/Icons';
import AddMenuItemModal from '../components/AddMenuItemModal';
import { SkeletonTableRow } from '@shared/components/Skeletons';

const InventoryPage: React.FC = () => {
    const { currentVendor } = useAuth();
    const { showNotification } = useNotification();
    const [allItems, setAllItems] = useState<MenuItem[]>([]);
    const [filteredItems, setFilteredItems] = useState<MenuItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

    const fetchInventory = useCallback(async () => {
        if (!currentVendor) return;
        setIsLoading(true);
        try {
            // Reusing getRestaurantMenu but flattening it for inventory view
            const categories = await api.getRestaurantMenu(currentVendor.restaurantId);
            const flatItems = categories.flatMap(c => c.items);
            setAllItems(flatItems);
            setFilteredItems(flatItems);
        } catch (err) {
            showNotification('Failed to load inventory.', 'error');
        } finally {
            setIsLoading(false);
        }
    }, [currentVendor, showNotification]);

    useEffect(() => {
        fetchInventory();
    }, [fetchInventory]);

    useEffect(() => {
        const lowerQuery = searchQuery.toLowerCase();
        setFilteredItems(allItems.filter(item => 
            item.name.toLowerCase().includes(lowerQuery) || 
            item.category?.toLowerCase().includes(lowerQuery)
        ));
    }, [searchQuery, allItems]);

    const handleSuccess = () => {
        setIsModalOpen(false);
        setEditingItem(null);
        fetchInventory();
        showNotification(editingItem ? 'Product updated!' : 'Product added!', 'success');
    };

    const handleDelete = async (itemId: string) => {
        if (window.confirm('Delete this product?')) {
            if (!currentVendor) return;
            try {
                await api.deleteMenuItem(currentVendor.id, itemId);
                showNotification('Product removed.', 'success');
                fetchInventory();
            } catch (err) {
                showNotification('Failed to delete product.', 'error');
            }
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                        <CubeIcon className="w-7 h-7 mr-2 text-blue-600" />
                        Inventory Management
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">Manage your store products and stock.</p>
                </div>
                <button
                    onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
                    className="flex items-center px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition shadow-sm"
                >
                    <PlusCircleIcon className="w-5 h-5 mr-2" />
                    Add Product
                </button>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                {/* Toolbar */}
                <div className="p-4 border-b bg-gray-50 flex items-center">
                    <div className="relative w-full max-w-md">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <SearchIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search products by name or category..."
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <span className="ml-auto text-sm text-gray-500 font-medium">
                        {filteredItems.length} Products
                    </span>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-100 border-b">
                            <tr>
                                <th className="p-4 font-semibold text-gray-600 w-20">Image</th>
                                <th className="p-4 font-semibold text-gray-600">Product Name</th>
                                <th className="p-4 font-semibold text-gray-600">Category</th>
                                <th className="p-4 font-semibold text-gray-600">Price</th>
                                <th className="p-4 font-semibold text-gray-600">Status</th>
                                <th className="p-4 font-semibold text-gray-600 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => <SkeletonTableRow key={i} />)
                            ) : filteredItems.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-gray-500">
                                        No products found. Add items to your inventory.
                                    </td>
                                </tr>
                            ) : (
                                filteredItems.map(item => (
                                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-4">
                                            <img src={item.imageUrl} alt={item.name} className="w-12 h-12 rounded object-cover bg-gray-200 border" />
                                        </td>
                                        <td className="p-4">
                                            <div className="font-bold text-gray-800">{item.name}</div>
                                            <div className="text-xs text-gray-500 truncate max-w-xs">{item.description}</div>
                                        </td>
                                        <td className="p-4">
                                            <span className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-semibold">
                                                {item.category || 'General'}
                                            </span>
                                        </td>
                                        <td className="p-4 font-medium text-gray-900">
                                            ৳{item.price.toFixed(2)}
                                        </td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${item.availability?.type !== 'CUSTOM_TIME' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                {item.availability?.type === 'CUSTOM_TIME' ? 'Scheduled' : 'In Stock'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right space-x-2">
                                            <button onClick={() => { setEditingItem(item); setIsModalOpen(true); }} className="text-blue-600 hover:bg-blue-50 p-2 rounded-full transition">
                                                <EditIcon className="w-5 h-5" />
                                            </button>
                                            <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:bg-red-50 p-2 rounded-full transition">
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <AddMenuItemModal 
                    isOpen={isModalOpen}
                    onClose={() => { setIsModalOpen(false); setEditingItem(null); }}
                    onSuccess={handleSuccess}
                    itemToEdit={editingItem}
                />
            )}
        </div>
    );
};

export default InventoryPage;
