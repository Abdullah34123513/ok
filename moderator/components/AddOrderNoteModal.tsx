import React, { useState } from 'react';
import type { Order } from '@shared/types';
import { CloseIcon } from './Icons';

interface AddOrderNoteModalProps {
    order: Order;
    onClose: () => void;
    onSave: (orderId: string, note: string) => void;
}

const AddOrderNoteModal: React.FC<AddOrderNoteModalProps> = ({ order, onClose, onSave }) => {
    const [note, setNote] = useState(order.moderatorNote || '');
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        await onSave(order.id, note);
        setIsSaving(false);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-lg animate-fade-in-up relative">
                <button type="button" onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 p-1 rounded-full hover:bg-gray-100">
                    <CloseIcon />
                </button>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Add/Edit Note</h2>
                <p className="text-sm text-gray-500 mb-4">For order <span className="font-mono">{order.id.split('-')[1]}</span></p>

                <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Add a note about this order (e.g., vendor contacted, issue resolved)..."
                    className="w-full mt-2 p-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={4}
                ></textarea>
                
                <div className="mt-6 flex justify-end space-x-3">
                     <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 font-semibold rounded-lg hover:bg-gray-300 transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:bg-blue-300"
                    >
                        {isSaving ? 'Saving...' : 'Save Note'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddOrderNoteModal;