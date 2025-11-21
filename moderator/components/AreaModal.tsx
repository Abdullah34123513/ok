
import React, { useState } from 'react';
import { CloseIcon } from './Icons';
import type { Area } from '@shared/types';

interface AreaModalProps {
    area?: Area;
    onClose: () => void;
    onSave: (name: string) => void;
}

const AreaModal: React.FC<AreaModalProps> = ({ area, onClose, onSave }) => {
    const [name, setName] = useState(area?.name || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(name);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96 relative">
                <button onClick={onClose} className="absolute top-4 right-4"><CloseIcon /></button>
                <h2 className="text-xl font-bold mb-4">{area ? 'Edit Area' : 'Add Area'}</h2>
                <form onSubmit={handleSubmit}>
                    <input 
                        className="w-full border p-2 rounded mb-4" 
                        value={name} 
                        onChange={e => setName(e.target.value)} 
                        placeholder="Area Name" 
                        required 
                    />
                    <button type="submit" className="w-full bg-orange-500 text-white py-2 rounded font-bold">Save</button>
                </form>
            </div>
        </div>
    );
};
export default AreaModal;
