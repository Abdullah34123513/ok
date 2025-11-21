
import React, { useState, useEffect, useRef } from 'react';
import { CloseIcon, SearchIcon, StorefrontIcon } from './Icons';
import type { Area, LocationPoint } from '@shared/types';
import * as api from '@shared/api';

interface VendorCreateModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

declare global {
    interface Window {
        google: any;
    }
}

const VendorCreateModal: React.FC<VendorCreateModalProps> = ({ onClose, onSuccess }) => {
    const [vendorName, setVendorName] = useState('');
    const [email, setEmail] = useState('');
    const [restaurantName, setRestaurantName] = useState('');
    const [cuisine, setCuisine] = useState('');
    const [address, setAddress] = useState('');
    const [areaId, setAreaId] = useState('');
    const [location, setLocation] = useState<LocationPoint>({ lat: 34.0522, lng: -118.2437 });
    
    const [areas, setAreas] = useState<Area[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');

    const mapRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const mapInstance = useRef<any>(null);
    const markerInstance = useRef<any>(null);

    useEffect(() => {
        api.getAreas().then(data => {
            setAreas(data);
            if (data.length > 0) setAreaId(data[0].id);
        });
    }, []);

    useEffect(() => {
        if (!mapRef.current || !window.google) return;

        mapInstance.current = new window.google.maps.Map(mapRef.current, {
            center: location,
            zoom: 13,
            streetViewControl: false,
            mapTypeControl: false,
        });

        markerInstance.current = new window.google.maps.Marker({
            position: location,
            map: mapInstance.current,
            draggable: true,
            title: "Restaurant Location",
        });

        markerInstance.current.addListener('dragend', (event: any) => {
            const newLat = event.latLng.lat();
            const newLng = event.latLng.lng();
            setLocation({ lat: newLat, lng: newLng });
        });

        if (searchInputRef.current) {
            const autocomplete = new window.google.maps.places.Autocomplete(searchInputRef.current);
            autocomplete.bindTo("bounds", mapInstance.current);
            
            autocomplete.addListener("place_changed", () => {
                const place = autocomplete.getPlace();
                if (!place.geometry || !place.geometry.location) return;
                
                const newLoc = {
                    lat: place.geometry.location.lat(),
                    lng: place.geometry.location.lng()
                };

                if (place.geometry.viewport) {
                    mapInstance.current.fitBounds(place.geometry.viewport);
                } else {
                    mapInstance.current.setCenter(newLoc);
                    mapInstance.current.setZoom(17);
                }

                markerInstance.current.setPosition(newLoc);
                setLocation(newLoc);
                setAddress(place.formatted_address || '');
            });
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!vendorName || !email || !restaurantName || !areaId) {
            setError('Please fill in all required fields.');
            return;
        }
        setIsSaving(true);
        setError('');
        try {
            await api.createVendor(vendorName, email, restaurantName, cuisine, address, areaId, location);
            onSuccess();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create vendor.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl flex flex-col max-h-[90vh]">
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center">
                        <StorefrontIcon className="w-6 h-6 mr-2 text-[#FF6B00]" />
                        Add New Vendor
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700"><CloseIcon /></button>
                </div>
                
                <form id="vendor-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                    {error && <div className="bg-red-100 text-red-700 p-3 rounded-md">{error}</div>}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="font-bold text-gray-700 mb-3 border-b pb-2">Vendor Details</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Vendor Name</label>
                                    <input type="text" required value={vendorName} onChange={e => setVendorName(e.target.value)} className="w-full border p-2 rounded mt-1" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Email (Login ID)</label>
                                    <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full border p-2 rounded mt-1" />
                                </div>
                            </div>
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-700 mb-3 border-b pb-2">Restaurant Details</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Restaurant Name</label>
                                    <input type="text" required value={restaurantName} onChange={e => setRestaurantName(e.target.value)} className="w-full border p-2 rounded mt-1" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Cuisine</label>
                                    <input type="text" value={cuisine} onChange={e => setCuisine(e.target.value)} className="w-full border p-2 rounded mt-1" placeholder="e.g., Italian, Burgers" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Assigned Area</label>
                                    <select value={areaId} onChange={e => setAreaId(e.target.value)} className="w-full border p-2 rounded mt-1 bg-white">
                                        {areas.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="font-bold text-gray-700 mb-3 border-b pb-2">Location</h3>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Address Search</label>
                                <div className="relative mt-1">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                        <SearchIcon className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input ref={searchInputRef} type="text" className="w-full pl-10 border p-2 rounded" placeholder="Search for a location..." />
                                </div>
                            </div>
                            <div className="h-64 w-full bg-gray-100 rounded overflow-hidden border">
                                <div ref={mapRef} className="w-full h-full"></div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Full Address</label>
                                <input type="text" value={address} onChange={e => setAddress(e.target.value)} className="w-full border p-2 rounded mt-1" />
                            </div>
                        </div>
                    </div>
                </form>

                <div className="p-4 border-t flex justify-end space-x-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 font-semibold rounded-lg hover:bg-gray-300 transition">Cancel</button>
                    <button type="submit" form="vendor-form" disabled={isSaving} className="px-4 py-2 bg-[#FF6B00] text-white font-semibold rounded-lg hover:bg-orange-600 transition disabled:opacity-50">
                        {isSaving ? 'Creating...' : 'Create Vendor'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VendorCreateModal;
