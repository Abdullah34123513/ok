
import React, { useState } from 'react';
import { CheckCircleIcon, CloseIcon } from './Icons';

interface DeliveryVerificationModalProps {
    orderId: string;
    customerName: string;
    onClose: () => void;
    onVerify: (otp: string) => Promise<void>;
}

const DeliveryVerificationModal: React.FC<DeliveryVerificationModalProps> = ({ orderId, customerName, onClose, onVerify }) => {
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, '').slice(0, 4);
        setOtp(value);
        if (error) setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (otp.length !== 4) {
            setError('Please enter the 4-digit PIN.');
            return;
        }
        
        setIsVerifying(true);
        try {
            await onVerify(otp);
            // Parent handles closing on success
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Incorrect PIN. Please ask the customer.');
            setIsVerifying(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm animate-fade-in-up relative p-6">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700">
                    <CloseIcon className="w-6 h-6" />
                </button>
                
                <div className="text-center mb-6">
                    <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                        <CheckCircleIcon className="w-6 h-6 text-green-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800">Verify Delivery</h2>
                    <p className="text-sm text-gray-600 mt-1">Ask {customerName} for the 4-digit PIN to complete the order.</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={4}
                            value={otp}
                            onChange={handleChange}
                            className="w-full text-center text-3xl font-bold tracking-widest border-b-2 border-gray-300 focus:border-[#FF6B00] outline-none py-2 transition-colors placeholder-gray-200"
                            placeholder="0000"
                            autoFocus
                        />
                        {error && <p className="text-red-500 text-sm text-center mt-2">{error}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={isVerifying || otp.length !== 4}
                        className="w-full py-3 bg-[#FF6B00] text-white font-bold rounded-lg hover:bg-orange-600 transition disabled:bg-orange-300 flex justify-center items-center"
                    >
                        {isVerifying ? 'Verifying...' : 'Complete Delivery'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default DeliveryVerificationModal;
