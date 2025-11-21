
import React, { useState, useEffect } from 'react';
import * as api from '@shared/api';
import type { Rider, User } from '@shared/types';
import { StarIcon, EditIcon } from '../components/Icons';
import EditRiderModal from '../components/EditRiderModal';
import CustomerAddressModal from '../components/CustomerAddressModal';

type RiderWithArea = Rider & { areaName?: string };

type Tab = 'riders' | 'customers';

const UserManagementPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>('riders');
    const [riders, setRiders] = useState<RiderWithArea[]>([]);
    const [customers, setCustomers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [riderToEdit, setRiderToEdit] = useState<RiderWithArea | null>(null);
    const [customerToView, setCustomerToView] = useState<User | null>(null);

    const fetchData = async () => {
        setIsLoading(true);
        if (activeTab === 'riders') {
            const data = await api.getAllRiders();
            setRiders(data);
        } else {
            const data = await api.getCustomers();
            setCustomers(data);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, [activeTab]);
    
    const StatusBadge: React.FC<{ isOnline: boolean }> = ({ isOnline }) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            isOnline ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
            <span className={`w-2 h-2 mr-1.5 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></span>
            {isOnline ? 'Online' : 'Offline'}
        </span>
    );

    return (
        <div className="p-6">
            <div className="flex space-x-6 border-b mb-6">
                <button 
                    className={`pb-2 font-bold text-lg ${activeTab === 'riders' ? 'text-[#FF6B00] border-b-2 border-[#FF6B00]' : 'text-gray-500'}`}
                    onClick={() => setActiveTab('riders')}
                >
                    Riders
                </button>
                <button 
                    className={`pb-2 font-bold text-lg ${activeTab === 'customers' ? 'text-[#FF6B00] border-b-2 border-[#FF6B00]' : 'text-gray-500'}`}
                    onClick={() => setActiveTab('customers')}
                >
                    Customers
                </button>
            </div>

             <div className="bg-white rounded-lg shadow-md overflow-hidden">
                {isLoading ? (
                    <p className="p-6 text-center text-gray-500">Loading...</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="p-4 font-semibold">Name</th>
                                    <th className="p-4 font-semibold">Contact</th>
                                    {activeTab === 'riders' && <th className="p-4 font-semibold">Vehicle</th>}
                                    {activeTab === 'riders' && <th className="p-4 font-semibold">Rating</th>}
                                    {activeTab === 'riders' && <th className="p-4 font-semibold">Area</th>}
                                    {activeTab === 'riders' && <th className="p-4 font-semibold">Status</th>}
                                    <th className="p-4 font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {activeTab === 'riders' ? riders.map(rider => (
                                    <tr key={rider.id} className="border-b last:border-0 hover:bg-gray-50">
                                        <td className="p-4 font-medium whitespace-nowrap">{rider.name}</td>
                                        <td className="p-4 text-gray-600 whitespace-nowrap">{rider.phone}</td>
                                        <td className="p-4 text-gray-600 whitespace-nowrap">{rider.vehicle}</td>
                                        <td className="p-4 text-gray-600 whitespace-nowrap">
                                            <span className="flex items-center font-semibold">
                                                <StarIcon className="w-4 h-4 text-yellow-500 mr-1"/>
                                                {rider.rating.toFixed(1)}
                                            </span>
                                        </td>
                                        <td className="p-4 text-gray-600 font-semibold whitespace-nowrap">{rider.areaName || 'Unassigned'}</td>
                                        <td className="p-4"><StatusBadge isOnline={!!rider.isOnline} /></td>
                                        <td className="p-4 whitespace-nowrap">
                                            <button onClick={() => setRiderToEdit(rider)} className="text-sm font-semibold text-blue-600 hover:underline inline-flex items-center"><EditIcon className="w-4 h-4 mr-1" /> Edit Area</button>
                                        </td>
                                    </tr>
                                )) : customers.map(customer => (
                                    <tr key={customer.email} className="border-b last:border-0 hover:bg-gray-50">
                                        <td className="p-4 font-medium whitespace-nowrap">{customer.name}</td>
                                        <td className="p-4 text-gray-600 whitespace-nowrap">{customer.email}</td>
                                        <td className="p-4 whitespace-nowrap">
                                            <button onClick={() => setCustomerToView(customer)} className="text-sm font-semibold text-blue-600 hover:underline">Manage Addresses</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            {riderToEdit && <EditRiderModal rider={riderToEdit} onClose={() => setRiderToEdit(null)} onSave={() => { setRiderToEdit(null); fetchData(); }} />}
            {customerToView && <CustomerAddressModal user={customerToView} onClose={() => setCustomerToView(null)} />}
        </div>
    );
};

export default UserManagementPage;
