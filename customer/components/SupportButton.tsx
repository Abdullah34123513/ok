
import React from 'react';
import { SupportIcon } from './Icons';

interface SupportButtonProps {
    onClick: () => void;
}

const SupportButton: React.FC<SupportButtonProps> = ({ onClick }) => {
    return (
        <button
            onClick={onClick}
            className="fixed bottom-24 right-6 sm:bottom-8 sm:right-8 bg-red-500 text-white w-16 h-16 rounded-full shadow-lg flex items-center justify-center hover:bg-red-600 transition-transform transform hover:scale-110 z-50"
            aria-label="Contact Support"
        >
            <SupportIcon className="w-8 h-8" />
        </button>
    );
};

export default SupportButton;
