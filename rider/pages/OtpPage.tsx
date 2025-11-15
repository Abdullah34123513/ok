import React, { useState } from 'react';
import { LogoIcon } from '../components/Icons';
import { useAuth } from '../contexts/AuthContext';

interface OtpPageProps {
    phone?: string;
}

const OtpPage: React.FC<OtpPageProps> = ({ phone }) => {
    const [otp, setOtp] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();


    const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, '');
        if (value.length <= 6) {
            setOtp(value);
            if (error) setError('');
        }
    };
    
    const isValid = otp.length === 6;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isValid || !phone) return;
        
        setIsLoading(true);
        setError('');
        try {
            // In a real app, you'd verify the OTP with a backend service.
            // Here, we simulate success if the OTP is '123456' and log the user in.
            if (otp === '123456') {
                await login(phone);
                // Navigation is handled by the AuthContext and App router
            } else {
                setError('Invalid verification code.');
            }
        } catch(err) {
            setError('Login failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col justify-center items-center p-4 font-sans">
            <div className="max-w-xs w-full space-y-10 animate-fade-in-up">
                <div className="text-center space-y-4">
                    <div className="flex justify-center">
                        <LogoIcon />
                    </div>
                    <h2 className="text-2xl font-semibold" style={{ color: '#1E1E1E' }}>
                        Enter Verification Code
                    </h2>
                    <p className="text-sm text-gray-500">
                        We've sent a 6-digit code to <br />
                        <span className="font-semibold" style={{ color: '#1E1E1E' }}>+880 {phone}</span>
                         <br/>(Hint: use 123456)
                    </p>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <input
                            type="tel"
                            id="otp"
                            value={otp}
                            onChange={handleOtpChange}
                            className="block w-full rounded-lg border-0 py-4 text-center text-2xl tracking-[.5em] font-semibold text-gray-900 ring-1 ring-inset ring-[#DADADA] placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#FF6B00]"
                            placeholder="_ _ _ _ _ _"
                            maxLength={6}
                        />
                         {error && (
                            <p className="mt-2 text-sm text-red-600" id="otp-error">
                                {error}
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={!isValid || isLoading}
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-lg font-medium text-white bg-[#FF6B00] hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:bg-orange-300 disabled:cursor-not-allowed transition-colors"
                    >
                        {isLoading ? 'Verifying...' : 'Verify & Continue'}
                    </button>
                </form>

                 <div className="text-center">
                    <a href="#/login" className="font-medium text-[#FF6B00] hover:text-orange-500 text-sm">
                        Change number
                    </a>
                </div>
            </div>
        </div>
    );
};

export default OtpPage;