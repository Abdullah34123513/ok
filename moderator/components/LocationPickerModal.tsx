
import React, { useState, useEffect, useRef } from 'react';
import { CloseIcon, SearchIcon } from './Icons';
import type { LocationPoint } from '@shared/types';

interface LocationPickerModalProps {
    initialLocation?: LocationPoint;
    title?: string;
    onClose: () => void;
    onSave: (location: LocationPoint) => void;
}

declare global {
    interface Window {
        google: any;
    }
}

const LocationPickerModal: React.FC<LocationPickerModalProps> = ({ initialLocation, title = "Pick Location", onClose, onSave }) => {
    const [location, setLocation] = useState<LocationPoint>(initialLocation || { lat: 34.0522, lng: -118.2437 });
    const mapRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const mapInstance = useRef<any>(null);
    const markerInstance = useRef<any>(null);

    useEffect(() => {
        if (!mapRef.current || !window.google) return;

        // Initialize Map
        mapInstance.current = new window.google.maps.Map(mapRef.current, {
            center: location,
            zoom: 13,
            streetViewControl: false,
            mapTypeControl: false,
        });

        // Initialize Marker
        markerInstance.current = new window.google.maps.Marker({
            position: location,
            map: mapInstance.current,
            draggable: true,
            title: "Selected Location",
        });

        // Drag End Listener
        markerInstance.current.addListener('dragend', (event: any) => {
            const newLat = event.latLng.lat();
            const newLng = event.latLng.lng();
            setLocation({ lat: newLat, lng: newLng });
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

                if (place.geometry.viewport) {
                    mapInstance.current.fitBounds(place.geometry.viewport);
                } else {
                    mapInstance.current.setCenter(newLoc);
                    mapInstance.current.setZoom(17);
                }

                markerInstance.current.setPosition(newLoc);
                setLocation(newLoc);
            });
        }
    }, []);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg flex flex-col max-h-[90vh]">
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800">{title}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700"><CloseIcon /></button>
                </div>
                
                <div className="flex-1 p-4 space-y-4">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <SearchIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input 
                            ref={searchInputRef}
                            type="text"
                            className="w-full pl-10 border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF6B00]" 
                            placeholder="Search address..." 
                        />
                    </div>

                    <div className="h-80 w-full bg-gray-100 rounded-md overflow-hidden relative">
                        {!window.google && (
                            <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                                Map could not be loaded.
                            </div>
                        )}
                        <div ref={mapRef} className="w-full h-full"></div>
                    </div>
                    
                    <div className="text-xs text-gray-500 text-center">
                        Drag the marker to the exact location.
                    </div>
                </div>

                <div className="p-4 border-t flex justify-end space-x-3">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition">Cancel</button>
                    <button onClick={() => onSave(location)} className="px-4 py-2 bg-[#FF6B00] text-white font-semibold rounded-lg hover:bg-orange-600 transition">Confirm Location</button>
                </div>
            </div>
        </div>
    );
};

export default LocationPickerModal;
