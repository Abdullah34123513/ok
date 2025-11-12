
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { LogoIcon } from '../components/Icons';
import type { User } from '../../shared/types';

interface SignupPageProps {}

const SignupPage: React.FC<SignupPageProps> = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [age, setAge] = useState<number | ''>('');
    const [gender, setGender] = useState<User['gender']>('prefer_not_to_say');
    const [isLoading, setIsLoading] = useState(false);
    const { signup } = useAuth();
    const { showNotification } = useNotification();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            showNotification('Passwords do not match.', 'error');
            return;
        }
        if (!name || !email || !password) {
            showNotification('Please fill out all required fields.', 'error');
            return;
        }
        setIsLoading(true);
        try {
            await signup({ 
                name, 
                email, 
                phone, 
                password, 
                age: age ? Number(age) : undefined, 
                gender 
            });
            // Navigation to home will be handled by the App component
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
            showNotification(errorMessage, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
            <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 space-y-4 animate-fade-in-up">
                <div className="text-center">
                    <LogoIcon />
                    <h2 className="mt-4 text-3xl font-extrabold text-gray-900">
                        Create your account
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        And start exploring the best food around you
                    </p>
                </div>

                <form className="space-y-3" onSubmit={handleSubmit}>
                    <InputField label="Full Name" id="name" type="text" value={name} onChange={setName} required />
                    <InputField label="Email address" id="email" type="email" value={email} onChange={setEmail} required />
                    <InputField label="Phone Number (Optional)" id="phone" type="tel" value={phone} onChange={setPhone} />
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="age" className="block text-sm font-medium text-gray-700">Age (Optional)</label>
                            <input
                                id="age"
                                name="age"
                                type="number"
                                value={age}
                                onChange={(e) => setAge(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500"
                            />
                        </div>
                         <div>
                            <label htmlFor="gender" className="block text-sm font-medium text-gray-700">Gender (Optional)</label>
                            <select
                                id="gender"
                                name="gender"
                                value={gender}
                                onChange={(e) => setGender(e.target.value as User['gender'])}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                            >
                                <option value="prefer_not_to_say">Prefer not to say</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                    </div>
                    <InputField label="Password" id="password" type="password" value={password} onChange={setPassword} required />
                    <InputField label="Confirm Password" id="confirm-password" type="password" value={confirmPassword} onChange={setConfirmPassword} required />

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-red-300"
                    >
                        {isLoading ? 'Creating account...' : 'Create Account'}
                    </button>
                </form>

                <p className="text-center text-sm text-gray-600">
                    Already have an account?{' '}
                    <a href="#/login" className="font-medium text-red-600 hover:text-red-500">
                        Sign in
                    </a>
                </p>
            </div>
        </div>
    );
};

const InputField: React.FC<{label: string, id: string, type: string, value: string, onChange: (value: string) => void, required?: boolean}> = 
({ label, id, type, value, onChange, required }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700">{label}</label>
        <input
            id={id}
            name={id}
            type={type}
            required={required}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500"
        />
    </div>
);


export default SignupPage;
