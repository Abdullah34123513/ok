import React, { useState, useEffect, useRef } from 'react';
import * as api from '@shared/api';
import { useAuth } from '../contexts/AuthContext';
import { CloseIcon, PlusCircleIcon, TrashIcon } from './Icons';
import type { MenuItem, CustomizationOption, ItemAvailability } from '@shared/types';

interface AddMenuItemModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    itemToEdit?: MenuItem | null;
}

const AddMenuItemModal: React.FC<AddMenuItemModalProps> = ({ isOpen, onClose, onSuccess, itemToEdit }) => {
    const { currentVendor } = useAuth();
    const isEditMode = !!itemToEdit;
    
    // Basic Info
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [categories, setCategories] = useState<string[]>([]);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>('');
    const [status, setStatus] = useState<'active' | 'inactive'>('active');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Pricing & Sizes
    const [enableSizes, setEnableSizes] = useState(false);
    const [price, setPrice] = useState('');
    const [sizes, setSizes] = useState([{ name: '', price: '' }]);

    // Toppings
    const [toppings, setToppings] = useState<{ name: string; price: string }[]>([]);

    // Availability
    const [availability, setAvailability] = useState<ItemAvailability>({ type: 'ALL_DAY' });

    // Component State
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');

    const resetState = () => {
        setName('');
        setDescription('');
        setCategory('');
        setImageFile(null);
        setImagePreview('');
        setStatus('active');
        setEnableSizes(false);
        setPrice('');
        setSizes([{ name: '', price: '' }]);
        setToppings([]);
        setAvailability({ type: 'ALL_DAY' });
        setError('');
    };
    
    useEffect(() => {
        if (isOpen) {
            api.getVendorCategories().then(setCategories);
            if (isEditMode && itemToEdit) {
                // Pre-populate form for editing
                setName(itemToEdit.name);
                setDescription(itemToEdit.description);
                setCategory(itemToEdit.category || '');
                setImagePreview(itemToEdit.imageUrl);
                setAvailability(itemToEdit.availability || { type: 'ALL_DAY' });
                
                // Deconstruct customization options
                const sizeOption = itemToEdit.customizationOptions?.find(o => o.id === 'size');
                if (sizeOption) {
                    setEnableSizes(true);
                    setSizes(sizeOption.choices.map(c => ({
                        name: c.name,
                        price: (itemToEdit.price + c.price).toFixed(2)
                    })));
                } else {
                    setEnableSizes(false);
                    setPrice(itemToEdit.price.toFixed(2));
                }
                
                const toppingOption = itemToEdit.customizationOptions?.find(o => o.id === 'toppings');
                if (toppingOption) {
                    setToppings(toppingOption.choices.map(c => ({
                        name: c.name,
                        price: c.price.toFixed(2)
                    })));
                }

            } else {
                // Reset form for adding
                resetState();
            }
        }
    }, [isOpen, isEditMode, itemToEdit]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSizeChange = (index: number, field: 'name' | 'price', value: string) => {
        const newSizes = [...sizes];
        newSizes[index][field] = value;
        setSizes(newSizes);
    };

    const addSize = () => setSizes([...sizes, { name: '', price: '' }]);
    const removeSize = (index: number) => setSizes(sizes.filter((_, i) => i !== index));

    const handleToppingChange = (index: number, field: 'name' | 'price', value: string) => {
        const newToppings = [...toppings];
        newToppings[index][field] = value;
        setToppings(newToppings);
    };

    const addTopping = () => setToppings([...toppings, { name: '', price: '' }]);
    const removeTopping = (index: number) => setToppings(toppings.filter((_, i) => i !== index));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentVendor) {
            setError('Authentication error. Please log in again.');
            return;
        }

        // Validation
        if (!name || !category || !imagePreview) { // imagePreview check covers both edit and add
            setError('Name, Category, and Image are required.');
            return;
        }
        if (enableSizes) {
            if (sizes.some(s => !s.name || !s.price)) {
                setError('All size fields must be filled.');
                return;
            }
        } else {
            if (!price) {
                setError('Price is required.');
                return;
            }
        }
        if (availability.type === 'CUSTOM_TIME' && (!availability.startTime || !availability.endTime)) {
            setError('Both start and end times are required for custom availability.');
            return;
        }

        setIsSaving(true);
        setError('');

        try {
            let uploadedImageUrl = imagePreview;
            if (imageFile) { // If a new file was selected, upload it
                uploadedImageUrl = await api.uploadImage(imageFile);
            }

            const payload = {
                name,
                description,
                category,
                imageUrl: uploadedImageUrl,
                status,
                price: enableSizes ? undefined : parseFloat(price),
                sizes: enableSizes ? sizes.map(s => ({ ...s, price: parseFloat(s.price) })) : undefined,
                toppings: toppings.map(t => ({ ...t, price: parseFloat(t.price) })),
                availability,
            };
            
            if (isEditMode && itemToEdit) {
                // This logic is duplicated from api.addMenuItem to construct the MenuItem object
                // A better long-term solution would be to have this logic in a shared utility or have the API accept the payload directly
                const customizationOptions: CustomizationOption[] = [];
                let basePrice = 0;
                if (payload.sizes && payload.sizes.length > 0) {
                    const sortedSizes = [...payload.sizes].sort((a, b) => a.price - b.price);
                    basePrice = sortedSizes[0].price;
                    customizationOptions.push({
                        id: 'size', name: 'Size', type: 'SINGLE', required: true,
                        choices: sortedSizes.map(s => ({ name: s.name, price: s.price - basePrice })),
                    });
                } else {
                    basePrice = payload.price || 0;
                }
                if (payload.toppings && payload.toppings.length > 0) {
                    customizationOptions.push({
                        id: 'toppings', name: 'Toppings', type: 'MULTIPLE', required: false,
                        choices: payload.toppings.map(t => ({ name: t.name, price: t.price })),
                    });
                }
                
                const updatedMenuItem: MenuItem = {
                    ...itemToEdit,
                    name: payload.name,
                    description: payload.description,
                    category: payload.category,
                    imageUrl: payload.imageUrl,
                    price: basePrice,
                    customizationOptions: customizationOptions.length > 0 ? customizationOptions : undefined,
                    availability: payload.availability,
                };

                await api.updateMenuItem(currentVendor.id, updatedMenuItem);
            } else {
                 await api.addMenuItem(currentVendor.id, payload);
            }
            onSuccess();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save item.');
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-2xl w-full max-w-3xl animate-fade-in-up flex flex-col">
                 <header className="p-4 border-b flex justify-between items-center flex-shrink-0">
                    <h2 className="text-2xl font-bold text-gray-800">{isEditMode ? 'Edit Menu Item' : 'Add New Item'}</h2>
                    <button type="button" onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 transition-colors">
                        <CloseIcon className="w-6 h-6 text-gray-500" />
                    </button>
                </header>
                
                <main className="p-6 space-y-6 overflow-y-auto">
                    {error && <div className="bg-red-100 text-red-700 p-3 rounded-md">{error}</div>}
                    
                    {/* Basic Information */}
                    <details open className="group">
                        <summary className="text-xl font-bold cursor-pointer list-none flex justify-between items-center">
                            Basic Information
                            <span className="text-sm font-normal text-gray-500 group-open:hidden">Click to expand</span>
                        </summary>
                        <div className="mt-4 space-y-4 border-t pt-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input type="text" placeholder="Food Name" value={name} onChange={e => setName(e.target.value)} required className="p-2 border rounded" />
                                <select value={category} onChange={e => setCategory(e.target.value)} required className="p-2 border rounded bg-white">
                                    <option value="" disabled>Select Category</option>
                                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} className="p-2 border rounded w-full" rows={3}></textarea>
                            <div className="flex items-center space-x-4">
                                <div>
                                    <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
                                    <button type="button" onClick={() => fileInputRef.current?.click()} className="px-4 py-2 bg-gray-200 text-sm font-semibold rounded-md hover:bg-gray-300">Upload Image</button>
                                </div>
                                {imagePreview && <img src={imagePreview} alt="Preview" className="w-20 h-20 rounded-md object-cover"/>}
                            </div>
                            <div className="flex items-center justify-between py-2">
                                <p className="font-medium text-gray-800">Status</p>
                                <div className="flex items-center space-x-2">
                                    <button type="button" onClick={() => setStatus('active')} className={`px-3 py-1 text-sm rounded-full ${status === 'active' ? 'bg-green-500 text-white' : 'bg-gray-200'}`}>Active</button>
                                    <button type="button" onClick={() => setStatus('inactive')} className={`px-3 py-1 text-sm rounded-full ${status === 'inactive' ? 'bg-gray-500 text-white' : 'bg-gray-200'}`}>Inactive</button>
                                </div>
                            </div>
                        </div>
                    </details>

                    {/* Pricing & Sizes */}
                     <details className="group">
                        <summary className="text-xl font-bold cursor-pointer list-none flex justify-between items-center">
                            Pricing & Sizes
                            <span className="text-sm font-normal text-gray-500 group-open:hidden">Click to expand</span>
                        </summary>
                         <div className="mt-4 space-y-4 border-t pt-4">
                            <div className="flex items-center justify-between">
                                <label htmlFor="enable-sizes" className="font-medium">Enable multiple sizes</label>
                                <button type="button" onClick={() => setEnableSizes(!enableSizes)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${enableSizes ? 'bg-blue-600' : 'bg-gray-200'}`}>
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enableSizes ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>
                             {enableSizes ? (
                                <div className="space-y-2">
                                    {sizes.map((size, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                            <input type="text" placeholder="Size Name (e.g., Small)" value={size.name} onChange={e => handleSizeChange(index, 'name', e.target.value)} className="p-2 border rounded flex-1" />
                                            <input type="number" placeholder="Price" value={size.price} onChange={e => handleSizeChange(index, 'price', e.target.value)} className="p-2 border rounded w-28" step="0.01" />
                                            <button type="button" onClick={() => removeSize(index)} className="p-2 text-red-500 hover:bg-red-50 rounded-full"><TrashIcon /></button>
                                        </div>
                                    ))}
                                    <button type="button" onClick={addSize} className="flex items-center text-sm font-semibold text-blue-600 hover:text-blue-800"><PlusCircleIcon className="w-5 h-5 mr-1"/>Add Size</button>
                                </div>
                            ) : (
                                <input type="number" placeholder="Price" value={price} onChange={e => setPrice(e.target.value)} className="p-2 border rounded w-full" step="0.01" />
                            )}
                        </div>
                    </details>
                    
                    {/* Toppings / Add-ons */}
                     <details className="group">
                        <summary className="text-xl font-bold cursor-pointer list-none flex justify-between items-center">
                            Toppings / Add-ons
                            <span className="text-sm font-normal text-gray-500 group-open:hidden">Click to expand</span>
                        </summary>
                         <div className="mt-4 space-y-2 border-t pt-4">
                             {toppings.map((topping, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <input type="text" placeholder="Topping Name (e.g., Extra Cheese)" value={topping.name} onChange={e => handleToppingChange(index, 'name', e.target.value)} className="p-2 border rounded flex-1" />
                                    <input type="number" placeholder="Price" value={topping.price} onChange={e => handleToppingChange(index, 'price', e.target.value)} className="p-2 border rounded w-28" step="0.01" />
                                    <button type="button" onClick={() => removeTopping(index)} className="p-2 text-red-500 hover:bg-red-50 rounded-full"><TrashIcon /></button>
                                </div>
                            ))}
                            <button type="button" onClick={addTopping} className="flex items-center text-sm font-semibold text-blue-600 hover:text-blue-800"><PlusCircleIcon className="w-5 h-5 mr-1"/>Add Topping</button>
                        </div>
                    </details>
                    
                    {/* Availability */}
                    <details className="group">
                        <summary className="text-xl font-bold cursor-pointer list-none flex justify-between items-center">
                            Availability
                            <span className="text-sm font-normal text-gray-500 group-open:hidden">Click to expand</span>
                        </summary>
                        <div className="mt-4 space-y-4 border-t pt-4">
                             <div className="flex space-x-4">
                                <label className="flex items-center">
                                    <input type="radio" name="availability" value="ALL_DAY" checked={availability.type === 'ALL_DAY'} onChange={() => setAvailability({ type: 'ALL_DAY' })} className="mr-2"/>
                                    Available All Day
                                </label>
                                <label className="flex items-center">
                                    <input type="radio" name="availability" value="CUSTOM_TIME" checked={availability.type === 'CUSTOM_TIME'} onChange={() => setAvailability({ type: 'CUSTOM_TIME', startTime: '17:00', endTime: '22:00' })} className="mr-2"/>
                                    Custom Time
                                </label>
                            </div>
                            {availability.type === 'CUSTOM_TIME' && (
                                <div className="flex items-center gap-2 pl-6">
                                    <input type="time" value={availability.startTime || ''} onChange={e => setAvailability(prev => ({ ...prev, startTime: e.target.value }))} className="p-1 border rounded text-sm w-full max-w-[120px]"/>
                                    <span className="text-gray-500">to</span>
                                    <input type="time" value={availability.endTime || ''} onChange={e => setAvailability(prev => ({ ...prev, endTime: e.target.value }))} className="p-1 border rounded text-sm w-full max-w-[120px]"/>
                                </div>
                            )}
                        </div>
                    </details>

                </main>

                <footer className="p-4 border-t bg-gray-50 rounded-b-lg flex justify-end space-x-3 flex-shrink-0">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 font-semibold rounded-lg hover:bg-gray-300 transition">
                        Cancel
                    </button>
                    <button type="submit" disabled={isSaving} className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:bg-blue-300">
                        {isSaving ? 'Saving...' : (isEditMode ? 'Save Changes' : 'Save Item')}
                    </button>
                </footer>
            </form>
        </div>
    );
};

export default AddMenuItemModal;