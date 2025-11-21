
import React, { useState, useEffect } from 'react';
import { CloseIcon } from './Icons';
import type { Rider, Area } from '@shared/types';
import * as api from '@shared/api';

interface EditRiderModalProps {
    rider: Rider;
    onClose: () => void;
    onSave: () => void;
}

const EditRiderModal: React.FC<EditRiderModalProps> = ({ rider, onClose, onSave }) => {
    const [areas, setAreas] = useState<Area[]>([]);
    const [selectedArea, setSelectedArea] = useState(rider.areaId || '');

    useEffect(() => {
        api.getAreas().then(setAreas);
    }, []);

    const handleSave = async () => {
        await api.updateRiderArea(rider.id, selectedArea);
        onSave();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96 relative">
                <button onClick={onClose} className="absolute top-4 right-4"><CloseIcon /></button>
                <h2 className="text-xl font-bold mb-4">Assign Area to Rider</h2>
                <p className="mb-2 text-sm text-gray-600">{rider.name}</p>
                <select 
                    className="w-full border p-2 rounded mb-4" 
                    value={selectedArea} 
                    onChange={e => setSelectedArea(e.target.value)}
                >
                    <option value="">Select Area</option>
                    {areas.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
                <button onClick={handleSave} className="w-full bg-orange-500 text-white py-2 rounded font-bold">Save</button>
            </div>
        </div>
    );
};
export default EditRiderModal;
