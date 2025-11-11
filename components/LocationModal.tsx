
import React, { useState } from 'react';
import { LocationIcon } from './Icons';
import * as api from '../services/api';
// Assuming Capacitor is set up in the project
// In a real project: npm install @capacitor/core @capacitor/geolocation
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';


interface LocationModalProps {
  onLocationSet: (location: string) => void;
}

const LocationModal: React.FC<LocationModalProps> = ({ onLocationSet }) => {
  const [manualLocation, setManualLocation] = useState('');
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDetectLocation = async () => {
    setIsDetecting(true);
    setError(null);

    const getPosition = async (): Promise<{ latitude: number; longitude: number }> => {
      // Check if running on a native platform (iOS/Android)
      if (Capacitor.isNativePlatform()) {
        // Check and request permissions for native
        const permissions = await Geolocation.checkPermissions();
        if (permissions.location !== 'granted' && permissions.coarseLocation !== 'granted') {
            const request = await Geolocation.requestPermissions();
            if (request.location !== 'granted' && request.coarseLocation !== 'granted') {
                throw new Error('Location permission not granted.');
            }
        }
        const position = await Geolocation.getCurrentPosition();
        return {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
      } else {
        // Fallback to browser's Geolocation API for web
        return new Promise((resolve, reject) => {
          if (!navigator.geolocation) {
              return reject(new Error('Geolocation is not supported by your browser.'));
          }
          navigator.geolocation.getCurrentPosition(
            (position) => resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            }),
            (err) => reject(err),
            { timeout: 10000, enableHighAccuracy: true }
          );
        });
      }
    };

    try {
      const { latitude, longitude } = await getPosition();
      const locationName = await api.reverseGeocode(latitude, longitude);
      onLocationSet(locationName);
    } catch (err) {
      console.error('Location detection error:', err);
      let errorMessage = 'Could not detect location. Please enable location services or enter manually.';
      if (err instanceof Error) {
        if (err.message.includes('permission') || err.message.includes('denied')) {
          errorMessage = 'Location permission denied. Please enable it in your device settings.';
        } else if (err.message.includes('timeout')) {
            errorMessage = 'Could not get location in time. Please try again.';
        }
      }
      setError(errorMessage);
    } finally {
        setIsDetecting(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualLocation.trim()) {
      onLocationSet(manualLocation.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl p-6 sm:p-8 w-full max-w-md animate-fade-in-up">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome to FoodieFind!</h2>
        <p className="text-gray-600 mb-6">Please set your location to see restaurants near you.</p>
        
        <form onSubmit={handleManualSubmit}>
          <div className="relative mb-4">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <LocationIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={manualLocation}
                onChange={(e) => setManualLocation(e.target.value)}
                placeholder="Enter your city or address"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
              />
          </div>
          <button 
            type="submit"
            className="w-full bg-red-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-red-600 transition duration-300 disabled:bg-red-300"
            disabled={!manualLocation.trim()}
          >
            Find Food
          </button>
        </form>

        <div className="relative flex py-5 items-center">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="flex-shrink mx-4 text-gray-500">OR</span>
            <div className="flex-grow border-t border-gray-300"></div>
        </div>

        <button 
          onClick={handleDetectLocation} 
          disabled={isDetecting}
          className="w-full flex items-center justify-center bg-gray-100 text-gray-700 font-bold py-3 px-4 rounded-lg hover:bg-gray-200 transition duration-300 disabled:opacity-50"
        >
          <LocationIcon className="mr-2"/>
          {isDetecting ? 'Identifying location...' : 'Use current location'}
        </button>

        {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}
      </div>
    </div>
  );
};

export default LocationModal;
