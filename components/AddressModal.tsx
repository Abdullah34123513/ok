import React, { useState, useEffect, useCallback } from 'react';
import * as api from '../services/api';
import type { AddressSuggestion, AddressDetails } from '../types';
import { SearchIcon, LocationIcon } from './Icons';

interface AddressModalProps {
  onClose: () => void;
  onAddressAdded: () => void;
}

const AddressModal: React.FC<AddressModalProps> = ({ onClose, onAddressAdded }) => {
  const [label, setLabel] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [selectedDetails, setSelectedDetails] = useState<AddressDetails | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const debounce = (func: (...args: any[]) => void, delay: number) => {
    // FIX: Replaced NodeJS.Timeout with ReturnType<typeof setTimeout> for browser compatibility.
    let timeout: ReturnType<typeof setTimeout>;
    return (...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), delay);
    };
  };
  
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      if (query.trim()) {
        setIsSearching(true);
        api.searchAddresses(query).then(results => {
          setSuggestions(results);
          setIsSearching(false);
        });
      } else {
        setSuggestions([]);
      }
    }, 500),
    []
  );

  useEffect(() => {
    debouncedSearch(searchQuery);
  }, [searchQuery, debouncedSearch]);

  const handleSuggestionClick = async (suggestion: AddressSuggestion) => {
    setSearchQuery(suggestion.description);
    setSuggestions([]);
    const details = await api.getAddressDetails(suggestion.id);
    setSelectedDetails(details);
  };

  const handleSave = async () => {
    if (!label.trim() || !selectedDetails) {
        // This should be prevented by disabling the button, but as a safeguard.
        return;
    }
    setIsSaving(true);
    try {
        await api.addAddress(label, selectedDetails);
        onAddressAdded();
    } catch(error) {
        console.error("Failed to save address", error);
        // Here you would show a notification to the user
    } finally {
        setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl p-6 sm:p-8 w-full max-w-lg animate-fade-in-up relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Add New Address</h2>

        <div className="space-y-4">
            <div>
                <label htmlFor="address-label" className="block text-sm font-medium text-gray-700 mb-1">Label (e.g., Home, Work)</label>
                <input
                    type="text"
                    id="address-label"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    placeholder="My Apartment"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-400"
                />
            </div>

            <div>
                 <label htmlFor="address-search" className="block text-sm font-medium text-gray-700 mb-1">Find Address</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <SearchIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        id="address-search"
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setSelectedDetails(null); // Reset details if user types again
                        }}
                        placeholder="Start typing your address..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-400"
                    />
                    {isSearching && <div className="absolute inset-y-0 right-0 flex items-center pr-3"><div className="w-5 h-5 border-t-2 border-red-500 rounded-full animate-spin"></div></div>}
                </div>
                
                {suggestions.length > 0 && (
                    <ul className="border border-gray-300 rounded-md mt-1 max-h-40 overflow-y-auto">
                        {suggestions.map(s => (
                            <li key={s.id} onClick={() => handleSuggestionClick(s)} className="p-3 hover:bg-gray-100 cursor-pointer flex items-start">
                               <LocationIcon className="w-5 h-5 text-gray-500 mr-3 mt-1 flex-shrink-0" />
                               <span>{s.description}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
        
        <div className="mt-6">
            <button
                onClick={handleSave}
                disabled={!label.trim() || !selectedDetails || isSaving}
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
