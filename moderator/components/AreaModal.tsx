
import React, { useState, useEffect, useRef } from 'react';
import { CloseIcon, SearchIcon } from './Icons';
import type { Area, LocationPoint } from '@shared/types';

interface AreaModalProps {
    area?: Area;
    onClose: () => void;
    onSave: (name: string, center?: LocationPoint, radius?: number) => void;
}

declare global {
    interface Window {
        google: any;
    }
}

const AreaModal: React.FC<AreaModalProps> = ({ area, onClose, onSave }) => {
    const [name, setName] = useState(area?.name || '');
    const [center, setCenter] = useState<LocationPoint>(area?.center || { lat: 34.0522, lng: -118.2437 });
    const [radius, setRadius] = useState<number>(area?.radius || 2000);
    
    const mapRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const mapInstance = useRef<any>(null);
    const markerInstance = useRef<any>(null);
    const circleInstance = useRef<any>(null);

    useEffect(() => {
        if (!mapRef.current || !window.google) return;

        // Initialize Map
        mapInstance.current = new window.google.maps.Map(mapRef.current, {
            center: center,
            zoom: 13,
            streetViewControl: false,
            mapTypeControl: false,
        });

        // Initialize Marker (Center)
        markerInstance.current = new window.google.maps.Marker({
            position: center,
            map: mapInstance.current,
            draggable: true,
            title: "Area Center",
        });

        // Initialize Circle (Radius)
        circleInstance.current = new window.google.maps.Circle({
            strokeColor: "#FF0000",
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: "#FF0000",
            fillOpacity: 0.35,
            map: mapInstance.current,
            center: center,
            radius: radius,
            editable: true,
            draggable: false, // Move center via marker instead
        });

        // Bind Marker events
        markerInstance.current.addListener('dragend', (event: any) => {
            const newLat = event.latLng.lat();
            const newLng = event.latLng.lng();
            const newCenter = { lat: newLat, lng: newLng };
            setCenter(newCenter);
            circleInstance.current.setCenter(newCenter);
        });

        // Bind Circle events
        circleInstance.current.addListener('radius_changed', () => {
            const newRadius = circleInstance.current.getRadius();
            setRadius(newRadius);
        });
        
        // Center changed (if editable circle drag is enabled, though we disabled it to prefer marker)
        circleInstance.current.addListener('center_changed', () => {
             const newCenter = circleInstance.current.getCenter();
             // Only update if significantly different to avoid loops with marker update
             if (Math.abs(newCenter.lat() - markerInstance.current.getPosition().lat()) > 0.0001) {
                 markerInstance.current.setPosition(newCenter);
                 setCenter({ lat: newCenter.lat(), lng: newCenter.lng() });
             }
        });

        // Initialize Autocomplete
        if (searchInputRef.current) {
            const autocomplete = new window.google.maps.places.Autocomplete(searchInputRef.current);
            autocomplete.bindTo("bounds", mapInstance.current);
            
            autocomplete.addListener("place_changed", () => {
                const place = autocomplete.getPlace();
                if (!place.geometry || !place.geometry.location) {
                    return;
                }
                
                const newLoc = {
                    lat: place.geometry.location.lat(),
                    lng: place.geometry.location.lng()
                };

                // Update viewport
                if (place.geometry.viewport) {
                    mapInstance.current.fitBounds(place.geometry.viewport);
                } else {
                    mapInstance.current.setCenter(newLoc);
                    mapInstance.current.setZoom(15);
                }

                // Update state & map elements
                setCenter(newLoc);
                markerInstance.current.setPosition(newLoc);
                circleInstance.current.setCenter(newLoc);
            });
        }

    }, []); // Run once on mount

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(name, center, radius);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl flex flex-col max-h-[90vh]">
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800">{area ? 'Edit Area' : 'Add New Area'}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700"><CloseIcon /></button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4">
                    <form id="area-form" onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Area Name</label>
                            <input 
                                className="w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF6B00]" 
                                value={name} 
                                onChange={e => setName(e.target.value)} 
                                placeholder="e.g., Downtown Zone A" 
                                required 
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Location Search</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <SearchIcon className="h-5 w-5 text-gray-400" />
                                </div>
                                <input 
                                    ref={searchInputRef}
                                    type="text"
                                    className="w-full pl-10 border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF6B00]" 
                                    placeholder="Search for a landmark or street..." 
                                />
                            </div>
                        </div>

                        <div className="h-96 w-full bg-gray-100 rounded-md overflow-hidden relative">
                            {!window.google && (
                                <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                                    Map could not be loaded. Please check API configuration.
                                </div>
                            )}
                            <div ref={mapRef} className="w-full h-full"></div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                            <div>
                                <span className="font-semibold">Center:</span> {center.lat.toFixed(4)}, {center.lng.toFixed(4)}
                            </div>
                            <div>
                                <span className="font-semibold">Radius:</span> {Math.round(radius)} meters
                            </div>
                        </div>
                    </form>
                </div>

                <div className="p-4 border-t flex justify-end space-x-3">
                    <button 
                        type="button" 
                        onClick={onClose} 
                        className="px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition"
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit" 
                        form="area-form"
                        className="px-4 py-2 bg-[#FF6B00] text-white font-semibold rounded-lg hover:bg-orange-600 transition"
                    >
                        Save Area
                    </button>
                </div>
            </div>
        </div>
    );
};
export default AreaModal;
