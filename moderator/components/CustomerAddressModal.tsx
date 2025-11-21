
import React, { useState, useEffect } from 'react';
import { CloseIcon, TrashIcon, MapPinIcon } from './Icons';
import type { User, Address } from '@shared/types';
import * as api from '@shared/api';

interface CustomerAddressModalProps {
    user: User;
    onClose: () => void;
}

const CustomerAddressModal: React.FC<CustomerAddressModalProps> = ({ user, onClose }) => {
    const [addresses, setAddresses] = useState<Address[]>([]);

    useEffect(() => {
        api.getCustomerAddresses(user.email).then(setAddresses);
    }, [user.email]);

    const handleDelete = async (id: string) => {
        if(confirm('Delete this address?')) {
            await api.deleteCustomerAddress(id);
            setAddresses(prev => prev.filter(a => a.id !== id));
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md relative max-h-[80vh] overflow-hidden flex flex-col">
                <button onClick={onClose} className="absolute top-4 right-4"><CloseIcon /></button>
                <h2 className="text-xl font-bold mb-1">Manage Addresses</h2>
                <p className="text-sm text-gray-500 mb-4">{user.name}</p>
                
                <div className="overflow-y-auto flex-1">
                    {addresses.length === 0 ? <p>No addresses found.</p> : (
                        <div className="space-y-2">
                            {addresses.map(addr => (
                                <div key={addr.id} className="border p-3 rounded flex justify-between items-start">
                                    <div className="flex items-start">
                                        <MapPinIcon className="w-5 h-5 text-gray-400 mr-2 mt-0.5" />
                                        <div>
                                            <p className="font-bold text-sm">{addr.label}</p>
                                            <p className="text-sm text-gray-600">{addr.details}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => handleDelete(addr.id)} className="text-red-500 hover:bg-red-50 p-1 rounded"><TrashIcon className="w-4 h-4" /></button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
export default CustomerAddressModal;
