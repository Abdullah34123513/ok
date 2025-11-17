import React, { useState, useEffect } from 'react';
import * as api from '@shared/api';
import type { Rider } from '@shared/types';
import { StarIcon } from '../components/Icons';

type RiderWithArea = Rider & { areaName?: string };

const UserManagementPage: React.FC = () => {
    const [riders, setRiders] = useState<RiderWithArea[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        api.getAllRiders()
            .then(data => setRiders(data))
            .finally(() => setIsLoading(false));
    }, []);
    
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
            <h1 className="text-2xl font-bold text-gray-800">Rider Management</h1>
             <div className="mt-6 bg-white rounded-lg shadow-md overflow-hidden">
                {isLoading ? (
                    <p className="p-6 text-center text-gray-500">Loading riders...</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="p-4 font-semibold">Name</th>
                                    <th className="p-4 font-semibold">Contact</th>
                                    <th className="p-4 font-semibold">Vehicle</th>
                                    <th className="p-4 font-semibold">Rating</th>
                                    <th className="p-4 font-semibold">Area</th>
                                    <th className="p-4 font-semibold">Status</th>
                                    <th className="p-4 font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {riders.map(rider => (
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
                                            <button className="text-sm font-semibold text-blue-600 hover:underline">Edit</button>
                                            <button className="ml-4 text-sm font-semibold text-red-600 hover:underline">Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserManagementPage;