import React, { useState, useEffect } from 'react';
import * as api from '../services/api';
import type { SupportInfo } from '../types';
import { CloseIcon, PhoneIcon, ChatIcon } from './Icons';

interface SupportModalProps {
    onClose: () => void;
    onStartChat: () => void;
}

const SupportModal: React.FC<SupportModalProps> = ({ onClose, onStartChat }) => {
    const [supportInfo, setSupportInfo] = useState<SupportInfo | null>(null);

    useEffect(() => {
        api.getSupportInfo().then(setSupportInfo);
    }, []);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl p-6 sm:p-8 w-full max-w-sm animate-fade-in-up relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700">
                    <CloseIcon />
                </button>
                <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Contact Support</h2>
                <div className="space-y-4">
                    <a
                        href={supportInfo ? `tel:${supportInfo.phoneNumber}` : '#'}
                        className="w-full flex items-center justify-center bg-green-500 text-white font-bold py-4 px-4 rounded-lg hover:bg-green-600 transition duration-300"
                    >
                        <PhoneIcon className="mr-3" />
                        <span>Call Support</span>
                    </a>
                    {supportInfo && (
                        <p className="text-center text-gray-600 font-mono tracking-wider">{supportInfo.phoneNumber}</p>
                    )}

                    <button
                        onClick={onStartChat}
                        className="w-full flex items-center justify-center bg-blue-500 text-white font-bold py-4 px-4 rounded-lg hover:bg-blue-600 transition duration-300"
                    >
                        <ChatIcon className="mr-3" />
                        <span>Live Chat</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SupportModal;
