
import React, { useState } from 'react';
import { LocationIcon } from './Icons';

interface LocationModalProps {
  onLocationSet: (location: string) => void;
}

const LocationModal: React.FC<LocationModalProps> = ({ onLocationSet }) => {
  const [manualLocation, setManualLocation] = useState('');
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDetectLocation = () => {
    setIsDetecting(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        // In a real app, you would use a reverse geocoding service.
        // For this demo, we'll just use a mock city.
        console.log('Detected coordinates:', position.coords);
        onLocationSet('Riyadh (Auto)'); 
        setIsDetecting(false);
      },
      (err) => {
        console.error(err);
        setError('Could not detect location. Please enable location services or enter manually.');
        setIsDetecting(false);
      },
      { timeout: 10000 }
    );
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
          {isDetecting ? 'Detecting...' : 'Use current location'}
        </button>

        {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}
      </div>
    </div>
  );
};

export default LocationModal;