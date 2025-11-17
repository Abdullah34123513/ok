import React, { useState, useEffect } from 'react';
import * as api from '@shared/api';
import type { Area } from '@shared/types';
import { GlobeIcon } from '../components/Icons';

const AreaManagementPage: React.FC = () => {
    const [areas, setAreas] = useState<Area[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchAreas = async () => {
            setIsLoading(true);
            setError('');
            try {
                const data = await api.getAreas();
                setAreas(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load areas.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchAreas();
    }, []);

    return (
        <div className="p-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                    <GlobeIcon className="w-7 h-7 mr-3" />
                    Area Management
                </h1>
                 <button className="px-4 py-2 bg-[#FF6B00] text-white font-semibold rounded-lg hover:bg-orange-600 transition">
                    + Create New Area
                </button>
            </div>
            
             <div className="mt-6 bg-white rounded-lg shadow-md overflow-hidden">
                {isLoading ? (
                    <p className="p-6 text-center text-gray-500">Loading areas...</p>
                ) : error ? (
                    <p className="p-6 text-center text-red-500">{error}</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="p-4 font-semibold">Area Name</th>
                                    <th className="p-4 font-semibold">Area ID</th>
                                    <th className="p-4 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {areas.map(area => (
                                    <tr key={area.id} className="border-b last:border-0 hover:bg-gray-50">
                                        <td className="p-4 font-medium whitespace-nowrap">{area.name}</td>
                                        <td className="p-4 text-gray-600 font-mono whitespace-nowrap">{area.id}</td>
                                        <td className="p-4 whitespace-nowrap text-right">
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

export default AreaManagementPage;
