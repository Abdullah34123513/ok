
import React, { useState, useEffect } from 'react';
import * as api from '@shared/api';
import type { Area, LocationPoint } from '@shared/types';
import { GlobeIcon, TrashIcon, EditIcon, PlusIcon } from '../components/Icons';
import AreaModal from '../components/AreaModal';

const AreaManagementPage: React.FC = () => {
    const [areas, setAreas] = useState<Area[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [modalArea, setModalArea] = useState<Area | undefined>(undefined);
    const [isModalOpen, setIsModalOpen] = useState(false);

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

    useEffect(() => {
        fetchAreas();
    }, []);

    const handleAdd = () => {
        setModalArea(undefined);
        setIsModalOpen(true);
    };

    const handleEdit = (area: Area) => {
        setModalArea(area);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if(confirm('Are you sure you want to delete this area?')) {
            await api.deleteArea(id);
            fetchAreas();
        }
    };

    const handleSave = async (name: string, center?: LocationPoint, radius?: number) => {
        if (modalArea) {
            await api.updateArea(modalArea.id, name, center, radius);
        } else {
            await api.createArea(name, center, radius);
        }
        setIsModalOpen(false);
        fetchAreas();
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                    <GlobeIcon className="w-7 h-7 mr-3" />
                    Area Management
                </h1>
                 <button onClick={handleAdd} className="px-4 py-2 bg-[#FF6B00] text-white font-semibold rounded-lg hover:bg-orange-600 transition flex items-center">
                    <PlusIcon className="w-4 h-4 mr-2" /> Create New Area
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
                                    <th className="p-4 font-semibold">Details</th>
                                    <th className="p-4 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {areas.map(area => (
                                    <tr key={area.id} className="border-b last:border-0 hover:bg-gray-50">
                                        <td className="p-4 font-medium whitespace-nowrap">{area.name}</td>
                                        <td className="p-4 text-gray-600 font-mono whitespace-nowrap text-xs">{area.id}</td>
                                        <td className="p-4 text-sm text-gray-500">
                                            {area.center ? (
                                                <span>
                                                    {area.center.lat.toFixed(2)}, {area.center.lng.toFixed(2)} 
                                                    <span className="mx-1">•</span> 
                                                    r: {Math.round(area.radius || 0)}m
                                                </span>
                                            ) : 'No geo data'}
                                        </td>
                                        <td className="p-4 whitespace-nowrap text-right">
                                            <button onClick={() => handleEdit(area)} className="text-sm font-semibold text-blue-600 hover:underline mr-4 inline-flex items-center"><EditIcon className="w-4 h-4 mr-1" />Edit</button>
                                            <button onClick={() => handleDelete(area.id)} className="text-sm font-semibold text-red-600 hover:underline inline-flex items-center"><TrashIcon className="w-4 h-4 mr-1" />Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            {isModalOpen && <AreaModal area={modalArea} onClose={() => setIsModalOpen(false)} onSave={handleSave} />}
        </div>
    );
};

export default AreaManagementPage;