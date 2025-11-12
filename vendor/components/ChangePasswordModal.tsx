import React, { useState } from 'react';
import * as api from '@shared/api';
import { useAuth } from '../contexts/AuthContext';
import { CloseIcon } from './Icons';

interface ChangePasswordModalProps {
    onClose: () => void;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ onClose }) => {
    const { currentVendor } = useAuth();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!currentPassword || !newPassword || !confirmPassword) {
            setError('All fields are required.');
            return;
        }
        if (newPassword !== confirmPassword) {
            setError('New passwords do not match.');
            return;
        }
        if (newPassword.length < 8) {
            setError('New password must be at least 8 characters long.');
            return;
        }
        if (!currentVendor?.email) {
            setError('Could not identify user. Please log in again.');
            return;
        }

        setIsSaving(true);
        try {
            await api.changePassword(currentVendor.email, currentPassword, newPassword);
            alert('Password changed successfully!');
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-2xl p-6 sm:p-8 w-full max-w-md animate-fade-in-up relative">
                <button type="button" onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Change Password</h2>

                {error && <div className="mb-4 text-red-600 bg-red-100 p-3 rounded-md">{error}</div>}

                <div className="space-y-4">
                    <div>
                        <label htmlFor="current-password" className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                        <input
                            type="password"
                            id="current-password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                        <input
                            type="password"
                            id="new-password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                     <div>
                        <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                        <input
                            type="password"
                            id="confirm-password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                     <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 font-semibold rounded-lg hover:bg-gray-300 transition"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:bg-blue-300"
                    >
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ChangePasswordModal;