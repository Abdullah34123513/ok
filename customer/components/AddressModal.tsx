import React, { useState, useEffect, useRef } from 'react';
import * as api from '@shared/api';
import type { AddressDetails, LocationPoint } from '@shared/types';
import { SearchIcon, LocationIcon, CloseIcon } from './Icons';

interface AddressModalProps {
  onClose: () => void;
  onAddressAdded: () => void;
}

declare global {
    interface Window {
        google: any;
    }
}

const AddressModal: React.FC<AddressModalProps> = ({ onClose, onAddressAdded }) => {
  const [label, setLabel] = useState('');
  const [location, setLocation] = useState<LocationPoint>({ lat: 34.0522, lng: -118.2437 }); // Default to LA
  const [fullAddress, setFullAddress] = useState('');
  const [isSaving, setIsSaving] = useState(false);

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
          title: "Delivery Location",
      });

      // Drag End Listener
      markerInstance.current.addListener('dragend', (event: any) => {
          const newLat = event.latLng.lat();
          const newLng = event.latLng.lng();
          setLocation({ lat: newLat, lng: newLng });
          // In a real app, we would reverse geocode here to update fullAddress
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

              // Update Viewport
              if (place.geometry.viewport) {
                  mapInstance.current.fitBounds(place.geometry.viewport);
              } else {
                  mapInstance.current.setCenter(newLoc);
                  mapInstance.current.setZoom(17);
              }

              // Update Marker & State
              markerInstance.current.setPosition(newLoc);
              setLocation(newLoc);
              setFullAddress(place.formatted_address || '');
          });
      }
      
      // Try to get current location
      if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition((position) => {
              const pos = {
                  lat: position.coords.latitude,
                  lng: position.coords.longitude,
              };
              mapInstance.current.setCenter(pos);
              markerInstance.current.setPosition(pos);
              setLocation(pos);
          });
      }

  }, []); // Run once

  const handleSave = async () => {
    if (!label.trim()) return;
    setIsSaving(true);
    
    // Construct a mock AddressDetails object since we have the full string
    // In a real app, we'd parse the Google Place components
    const mockDetails: AddressDetails = {
        street: fullAddress.split(',')[0] || 'Unknown Street',
        city: 'City',
        postalCode: '00000',
        country: 'Country'
    };

    try {
        await api.addAddress(label, mockDetails, location);
        onAddressAdded();
    } catch(error) {
        console.error("Failed to save address", error);
    } finally {
        setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh] animate-fade-in-up relative">
        
        <div className="p-4 border-b flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">Set Delivery Location</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><CloseIcon /></button>
        </div>

        <div className="p-4 space-y-4 flex-1 overflow-y-auto">
            <div>
                <label htmlFor="address-label" className="block text-sm font-medium text-gray-700 mb-1">Label (e.g., Home, Office)</label>
                <input
                    type="text"
                    id="address-label"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    placeholder="My Home"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-400"
                />
            </div>

            <div>
                 <label htmlFor="address-search" className="block text-sm font-medium text-gray-700 mb-1">Search Address</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <SearchIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        ref={searchInputRef}
                        type="text"
                        id="address-search"
                        placeholder="Enter your address..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-400"
                        onChange={(e) => setFullAddress(e.target.value)}
                    />
                </div>
            </div>
            
            <div className="h-64 w-full bg-gray-100 rounded-lg overflow-hidden relative border">
                 {!window.google && (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                        Loading Maps...
                    </div>
                )}
                <div ref={mapRef} className="w-full h-full"></div>
            </div>
            
            <p className="text-xs text-gray-500 text-center">Drag the pin to adjust your exact location.</p>
        </div>
        
        <div className="p-4 border-t bg-gray-50 rounded-b-lg">
            <button
                onClick={handleSave}
                disabled={!label.trim() || isSaving}
                className="w-full bg-red-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-red-600 transition duration-300 disabled:bg-red-300 disabled:cursor-not-allowed"
            >
                {isSaving ? 'Saving...' : 'Save Address'}
            </button>
        </div>

      </div>
    </div>
  );
};

export default AddressModal;