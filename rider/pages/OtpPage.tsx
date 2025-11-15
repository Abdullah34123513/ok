import React, { useState } from 'react';
import { LogoIcon } from '../components/Icons';

interface OtpPageProps {
    phone?: string;
}

const OtpPage: React.FC<OtpPageProps> = ({ phone }) => {
    const [otp, setOtp] = useState('');

    const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, '');
        if (value.length <= 6) {
            setOtp(value);
        }
    };
    
    const isValid = otp.length === 6;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isValid) {
            // Placeholder for OTP verification logic
            alert(`Verifying OTP: ${otp} for number: +880${phone}`);
            // On success, you would navigate to the rider's dashboard
            // window.location.hash = '#/dashboard';
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
                    </div>

                    <button
                        type="submit"
                        disabled={!isValid}
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-lg font-medium text-white bg-[#FF6B00] hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:bg-orange-300 disabled:cursor-not-allowed transition-colors"
                    >
                        Verify & Continue
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