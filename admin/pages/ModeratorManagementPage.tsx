
import React, { useState, useEffect } from 'react';
import * as api from '@shared/api';
import type { Moderator } from '@shared/types';

const ModeratorManagementPage: React.FC = () => {
    const [moderators, setModerators] = useState<Moderator[]>([]);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const fetchMods = async () => {
        const data = await api.getAllModerators();
        setModerators(data);
        setIsLoading(false);
    };

    useEffect(() => {
        fetchMods();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !email || !password) return;
        await api.createModerator(name, email, password);
        setName(''); setEmail(''); setPassword('');
        fetchMods();
    };

    const handleDelete = async (id: string) => {
        if(confirm('Delete this moderator?')) {
            await api.deleteModerator(id);
            fetchMods();
        }
    };

    return (
        <div className="p-8 space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Manage Moderators</h1>
                <p className="text-gray-500">Create and remove content moderators.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Create Form */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Add New Moderator</h3>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                                <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full border p-2 rounded mt-1" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Email</label>
                                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full border p-2 rounded mt-1" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Password</label>
                                <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full border p-2 rounded mt-1" required />
                            </div>
                            <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-2 rounded hover:bg-indigo-700 transition">Create Account</button>
                        </form>
                    </div>
                </div>

                {/* List */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="p-4 font-semibold">Name</th>
                                    <th className="p-4 font-semibold">Email</th>
                                    <th className="p-4 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {moderators.map(mod => (
                                    <tr key={mod.id}>
                                        <td className="p-4 font-medium">{mod.name}</td>
                                        <td className="p-4 text-gray-600">{mod.email}</td>
                                        <td className="p-4 text-right">
                                            <button onClick={() => handleDelete(mod.id)} className="text-red-600 hover:underline text-sm font-bold">Revoke Access</button>
                                        </td>
                                    </tr>
                                ))}
                                {moderators.length === 0 && <tr><td colSpan={3} className="p-4 text-center text-gray-500">No moderators found.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ModeratorManagementPage;
