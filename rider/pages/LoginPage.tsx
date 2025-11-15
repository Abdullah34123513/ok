import React, { useState } from 'react';
import { LogoIcon, PhoneIcon } from '../components/Icons';
import * as api from '@shared/api';

const LoginPage: React.FC = () => {
    const [phone, setPhone] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, ''); // Remove non-digit characters
        if (value.length <= 10) {
            setPhone(value);
            if (error) setError('');
        }
    };

    const isValid = phone.length === 10;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isValid) {
            setError('Please enter a valid 10-digit phone number.');
            return;
        }
        setIsLoading(true);
        setError('');
        try {
            // Check if rider exists before proceeding to OTP
            const rider = await api.loginRider(phone);
            if (rider) {
                // Navigate to OTP screen
                window.location.hash = `#/otp/${phone}`;
            } else {
                setError('No rider found with this phone number.');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
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
                        Rider Login
                    </h2>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <span className="text-white bg-[#FF6B00] px-2 py-1 rounded-md text-sm font-semibold">+880</span>
                            </div>
                            <input
                                type="tel"
                                name="phone"
                                id="phone"
                                value={phone}
                                onChange={handlePhoneChange}
                                className="block w-full rounded-lg border-0 py-4 pl-24 text-gray-900 ring-1 ring-inset ring-[#DADADA] placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#FF6B00] sm:text-sm sm:leading-6"
                                placeholder="170 000 0000"
                            />
                             <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                               <PhoneIcon className="h-5 w-5 text-gray-400" />
                            </div>
                        </div>
                         {error && (
                            <p className="mt-2 text-sm text-red-600" id="phone-error">
                                {error}
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={!isValid || isLoading}
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-lg font-medium text-white bg-[#FF6B00] hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:bg-orange-300 disabled:cursor-not-allowed transition-colors"
                    >
                        {isLoading ? 'Checking...' : 'Continue'}
                    </button>
                </form>

                 <div className="text-center">
                    <a href="#" className="font-medium text-[#FF6B00] hover:text-orange-500 text-sm">
                        Need help?
                    </a>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;