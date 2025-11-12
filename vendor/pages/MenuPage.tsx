import React, { useState, useEffect, useCallback } from 'react';
import * as api from '@shared/api';
import { useAuth } from '../contexts/AuthContext';
import type { MenuCategory, MenuItem } from '@shared/types';
import { PlusCircleIcon, EditIcon, TrashIcon } from '../components/Icons';
import AddMenuItemModal from '../components/AddMenuItemModal';

const MenuPage: React.FC = () => {
    const { currentVendor } = useAuth();
    const [menu, setMenu] = useState<MenuCategory[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

    const fetchMenu = useCallback(async () => {
        if (!currentVendor) return;
        setIsLoading(true);
        setError('');
        try {
            const data = await api.getRestaurantMenu(currentVendor.restaurantId);
            setMenu(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load menu.');
        } finally {
            setIsLoading(false);
        }
    }, [currentVendor]);

    useEffect(() => {
        fetchMenu();
    }, [fetchMenu]);

    const handleSuccess = () => {
        setIsModalOpen(false);
        setEditingItem(null);
        fetchMenu();
    };

    const handleOpenAddModal = () => {
        setEditingItem(null);
        setIsModalOpen(true);
    };

    const handleEditItem = (item: MenuItem) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };
    
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
    };

    const handleDeleteItem = async (itemId: string) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            if (!currentVendor) return;
            try {
                await api.deleteMenuItem(currentVendor.id, itemId);
                fetchMenu(); // Refresh menu
            } catch (err) {
                alert('Failed to delete item.');
            }
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Menu Management</h1>
                <button
                    onClick={handleOpenAddModal}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
                >
                    <PlusCircleIcon className="w-5 h-5 mr-2" />
                    Add Menu Item
                </button>
            </div>
            
            {isLoading ? (
                <div>Loading menu...</div>
            ) : error ? (
                <div className="text-red-500">{error}</div>
            ) : menu.length > 0 ? (
                <div className="space-y-8">
                    {menu.map(category => (
                        <div key={category.name}>
                            <h2 className="text-xl font-bold text-gray-700 mb-4 pb-2 border-b">{category.name}</h2>
                            <div className="space-y-4">
                                {category.items.map(item => (
                                    <div key={item.id} className="bg-white p-4 rounded-lg shadow-md flex items-center space-x-4">
                                        <img src={item.imageUrl} alt={item.name} className="w-20 h-20 rounded-md object-cover"/>
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-3 mb-1">
                                                <h3 className="font-bold">{item.name}</h3>
                                                {item.customizationOptions && item.customizationOptions.length > 0 && (
                                                    <span className="text-xs font-semibold bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">Customizable</span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-500 max-w-lg truncate">{item.description}</p>
                                        </div>
                                        <div className="font-semibold text-lg">${item.price.toFixed(2)}</div>
                                        <div className="flex items-center space-x-2">
                                            <button onClick={() => handleEditItem(item)} className="p-2 bg-gray-200 text-sm font-semibold rounded-md hover:bg-gray-300">
                                                <EditIcon className="w-5 h-5 text-gray-600"/>
                                            </button>
                                            <button onClick={() => handleDeleteItem(item.id)} className="p-2 bg-red-100 text-red-600 text-sm font-semibold rounded-md hover:bg-red-200">
                                                <TrashIcon className="w-5 h-5"/>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-10 bg-white rounded-lg shadow-md">
                    <p>No menu items found. Click "Add Menu Item" to get started.</p>
                </div>
            )}
            
            {isModalOpen && (
                <AddMenuItemModal 
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    onSuccess={handleSuccess}
                    itemToEdit={editingItem}
                />
            )}
        </div>
    );
};

export default MenuPage;