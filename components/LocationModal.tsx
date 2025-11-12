
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
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState<{ type: 'permission' | 'timeout' | 'generic', message: string } | null>(null);

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
      let errorType: 'permission' | 'timeout' | 'generic' = 'generic';
      let errorMessage = 'Could not detect your location.';

      if (err instanceof Error) {
        if (err.message.includes('permission') || err.message.includes('denied')) {
          errorType = 'permission';
          errorMessage = 'Location permission was denied.';
        } else if (err.message.includes('timeout')) {
            errorType = 'timeout';
            errorMessage = 'Could not get your location in time.';
        }
      }
      setError({ type: errorType, message: errorMessage });
    } finally {
        setIsDetecting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl p-6 sm:p-8 w-full max-w-md animate-fade-in-up text-center">
        <LocationIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Find Food Near You</h2>
        <p className="text-gray-600 mb-6">To see available restaurants and offers, please allow FoodieFind to access your location.</p>
        
        <button 
          onClick={handleDetectLocation} 
          disabled={isDetecting}
          className="w-full flex items-center justify-center bg-red-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-red-600 transition duration-300 disabled:opacity-50"
        >
          <LocationIcon className="mr-2"/>
          {isDetecting ? 'Finding your location...' : 'Use My Current Location'}
        </button>

        {error && (
          <div className="mt-4 p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 rounded-r-lg text-left" role="alert">
              <div className="flex">
                  <div className="py-1">
                      <svg className="fill-current h-6 w-6 text-yellow-500 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zM9 5v6h2V5H9zm0 8v2h2v-2H9z"/></svg>
                  </div>
                  <div>
                      <p className="font-bold">{error.message}</p>
                      {error.type === 'permission' && (
                          <p className="text-sm">
                              To protect your privacy, browsers don't ask again after permission is denied. Please go to your <strong>device or browser settings</strong> to allow location access for this site, then try again.
                          </p>
                      )}
                       {error.type === 'timeout' && (
                        <p className="text-sm mt-1">Please check your connection and try again.</p>
                      )}
                       {error.type === 'generic' && (
                        <p className="text-sm mt-1">Please ensure location services are enabled on your device.</p>
                      )}
                  </div>
              </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationModal;
