
import React, { useState, useEffect } from 'react';
import * as api from '@shared/api';
import type { FlashSaleCampaign, Food } from '@shared/types';
import { LightningIcon, SearchIcon, TrashIcon, PlusIcon } from '../components/Icons';
import { useNotification } from '@shared/contexts/NotificationContext';

const FlashSalePage: React.FC = () => {
    const [config, setConfig] = useState<FlashSaleCampaign>({
        isActive: false,
        endTime: '',
        discountPercentage: 0,
        itemIds: []
    });
    const [currentItems, setCurrentItems] = useState<Food[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Food[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const { showNotification } = useNotification();

    useEffect(() => {
        const fetchConfig = async () => {
            setIsLoading(true);
            try {
                const data = await api.getFlashSaleConfig();
                setConfig(data);
                if (data.itemIds.length > 0) {
                    const items = await api.getFoodsByIds(data.itemIds);
                    setCurrentItems(items);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchConfig();
    }, []);

    // Search for foods to add
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchQuery.length > 2) {
                try {
                    const results = await api.searchFoodsForModerator(searchQuery);
                    // Filter out items already in the list
                    setSearchResults(results.filter(f => !config.itemIds.includes(f.id)));
                } catch (err) {
                    console.error(err);
                }
            } else {
                setSearchResults([]);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery, config.itemIds]);

    const handleAddItem = (food: Food) => {
        setConfig(prev => ({ ...prev, itemIds: [...prev.itemIds, food.id] }));
        setCurrentItems(prev => [...prev, food]);
        setSearchResults(prev => prev.filter(f => f.id !== food.id));
        setSearchQuery('');
    };

    const handleRemoveItem = (foodId: string) => {
        setConfig(prev => ({ ...prev, itemIds: prev.itemIds.filter(id => id !== foodId) }));
        setCurrentItems(prev => prev.filter(f => f.id !== foodId));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await api.updateFlashSaleConfig(config);
            showNotification('Flash Sale updated successfully!', 'success');
        } catch (err) {
            showNotification('Failed to update Flash Sale.', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <div className="p-8 text-center text-gray-500">Loading config...</div>;

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                    <LightningIcon className="w-8 h-8 mr-3 text-[#FF6B00]" />
                    Flash Sale Management
                </h1>
                <div className="flex items-center space-x-4">
                    <div className="flex items-center bg-white px-3 py-1.5 rounded-full border shadow-sm">
                        <span className={`w-2.5 h-2.5 rounded-full mr-2 ${config.isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></span>
                        <span className="text-sm font-semibold text-gray-700">{config.isActive ? 'Live on Homepage' : 'Inactive'}</span>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-6 py-2.5 bg-[#FF6B00] text-white font-bold rounded-lg shadow hover:bg-orange-600 disabled:bg-orange-300 transition"
                    >
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Configuration Panel */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
                    <h2 className="font-bold text-lg text-gray-800 mb-4 border-b pb-2">Configuration</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Campaign Status</label>
                            <select
                                value={config.isActive ? 'active' : 'inactive'}
                                onChange={(e) => setConfig({ ...config, isActive: e.target.value === 'active' })}
                                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-orange-200"
                            >
                                <option value="active">Active (Visible)</option>
                                <option value="inactive">Inactive (Hidden)</option>
                            </select>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Discount Percentage (%)</label>
                            <input
                                type="number"
                                value={config.discountPercentage}
                                onChange={(e) => setConfig({ ...config, discountPercentage: Number(e.target.value) })}
                                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-orange-200"
                                min="1"
                                max="100"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">End Time</label>
                            <input
                                type="datetime-local"
                                value={config.endTime ? new Date(config.endTime).toISOString().slice(0, 16) : ''}
                                onChange={(e) => setConfig({ ...config, endTime: new Date(e.target.value).toISOString() })}
                                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-orange-200"
                            />
                        </div>
                    </div>
                </div>

                {/* Items Management */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Search & Add */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h2 className="font-bold text-lg text-gray-800 mb-3">Add Items</h2>
                        <div className="relative">
                            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search food items to add..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-200"
                            />
                        </div>
                        
                        {/* Search Results Dropdown */}
                        {searchResults.length > 0 && (
                            <div className="mt-2 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto absolute z-10 w-full max-w-2xl">
                                {searchResults.map(item => (
                                    <div key={item.id} className="flex justify-between items-center p-3 hover:bg-gray-50 border-b last:border-0">
                                        <div className="flex items-center space-x-3">
                                            <img src={item.imageUrl} alt={item.name} className="w-10 h-10 rounded object-cover bg-gray-100" />
                                            <div>
                                                <p className="font-bold text-gray-800 text-sm">{item.name}</p>
                                                <p className="text-xs text-gray-500">{item.vendor.name} • ৳{item.price}</p>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => handleAddItem(item)}
                                            className="text-green-600 bg-green-50 hover:bg-green-100 p-1.5 rounded-full"
                                        >
                                            <PlusIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Selected Items List */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-4 border-b pb-2">
                            <h2 className="font-bold text-lg text-gray-800">Selected Items ({config.itemIds.length})</h2>
                            <p className="text-sm text-gray-500">These items will appear in the Flash Sale section.</p>
                        </div>
                        
                        {currentItems.length === 0 ? (
                            <div className="text-center py-10 text-gray-400 bg-gray-50 rounded-lg border-2 border-dashed">
                                No items selected. Search and add items above.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {currentItems.map(item => (
                                    <div key={item.id} className="flex items-center p-3 bg-white border rounded-lg shadow-sm hover:shadow-md transition">
                                        <img src={item.imageUrl} alt={item.name} className="w-16 h-16 rounded-md object-cover bg-gray-200" />
                                        <div className="ml-3 flex-1 min-w-0">
                                            <p className="font-bold text-gray-800 truncate">{item.name}</p>
                                            <p className="text-xs text-gray-500 truncate">{item.vendor.name}</p>
                                            <div className="flex items-center mt-1 space-x-2">
                                                <span className="text-sm text-gray-400 line-through">৳{item.price}</span>
                                                <span className="text-sm font-bold text-[#FF6B00]">
                                                    ৳{Math.round(item.price * (1 - config.discountPercentage / 100))}
                                                </span>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => handleRemoveItem(item.id)}
                                            className="ml-2 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition"
                                        >
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FlashSalePage;
