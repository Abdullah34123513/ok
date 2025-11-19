
import React, { useState, useEffect, useCallback } from 'react';
import * as api from '@shared/api';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '@shared/contexts/NotificationContext';
import type { MenuCategory, MenuItem } from '@shared/types';
import { PlusCircleIcon, EditIcon, TrashIcon, MenuIcon } from '../components/Icons';
import AddMenuItemModal from '../components/AddMenuItemModal';
import EmptyState from '@shared/components/EmptyState';
import { SkeletonCard } from '@shared/components/Skeletons';

const MenuPage: React.FC = () => {
    const { currentVendor } = useAuth();
    const { showNotification } = useNotification();
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
        showNotification(editingItem ? 'Item updated successfully!' : 'Item added successfully!', 'success');
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
                showNotification('Item deleted successfully.', 'success');
                fetchMenu(); // Refresh menu
            } catch (err) {
                showNotification('Failed to delete item.', 'error');
            }
        }
    };

    const renderContent = () => {
        if (isLoading) {
             return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
                </div>
             );
        }
        if (error) {
            return <div className="text-red-500 bg-white p-6 rounded-lg shadow">{error}</div>;
        }
        if (menu.length === 0) {
            return (
                <EmptyState
                    title="Your menu is empty"
                    description="Add delicious items to your menu to start receiving orders."
                    icon={<MenuIcon className="w-12 h-12" />}
                    actionLabel="Add First Item"
                    onAction={handleOpenAddModal}
                />
            );
        }
        return (
            <div className="space-y-8">
                {menu.map(category => (
                    <div key={category.name}>
                        <h2 className="text-xl font-bold text-gray-700 mb-4 pb-2 border-b">{category.name}</h2>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {category.items.map(item => (
                                <div key={item.id} className="bg-white p-4 rounded-lg shadow-md flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-4 hover:shadow-lg transition-shadow">
                                    <img src={item.imageUrl} alt={item.name} className="w-full sm:w-24 h-32 sm:h-24 rounded-md object-cover bg-gray-100"/>
                                    <div className="flex-1 w-full">
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-bold text-gray-800">{item.name}</h3>
                                            <span className="font-bold text-green-600">৳{item.price.toFixed(2)}</span>
                                        </div>
                                        
                                        <div className="flex flex-wrap gap-2 mt-1 mb-2">
                                            {item.customizationOptions && item.customizationOptions.length > 0 && (
                                                <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full uppercase tracking-wide">Customizable</span>
                                            )}
                                             {item.availability?.type === 'CUSTOM_TIME' && (
                                                <span className="text-[10px] font-bold bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full uppercase tracking-wide">Limited Time</span>
                                            )}
                                        </div>

                                        <p className="text-sm text-gray-500 line-clamp-2">{item.description}</p>
                                        
                                        <div className="flex items-center justify-end space-x-2 mt-3 pt-3 border-t">
                                            <button onClick={() => handleEditItem(item)} className="flex items-center px-3 py-1.5 bg-gray-100 text-gray-600 text-xs font-bold rounded hover:bg-gray-200 transition">
                                                <EditIcon className="w-3 h-3 mr-1"/> Edit
                                            </button>
                                            <button onClick={() => handleDeleteItem(item.id)} className="flex items-center px-3 py-1.5 bg-red-50 text-red-600 text-xs font-bold rounded hover:bg-red-100 transition">
                                                <TrashIcon className="w-3 h-3 mr-1"/> Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-800">Menu Management</h1>
                {menu.length > 0 && (
                    <button
                        onClick={handleOpenAddModal}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition shadow-sm"
                    >
                        <PlusCircleIcon className="w-5 h-5 mr-2" />
                        Add Menu Item
                    </button>
                )}
            </div>
            
            {renderContent()}
            
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
