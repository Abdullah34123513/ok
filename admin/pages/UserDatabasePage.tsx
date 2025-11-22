
import React, { useState, useEffect } from 'react';
import * as api from '@shared/api';

const UserDatabasePage: React.FC = () => {
    const [users, setUsers] = useState<{name: string, email: string, role: string}[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState('All');

    useEffect(() => {
        api.getAllSystemUsers()
            .then(setUsers)
            .finally(() => setIsLoading(false));
    }, []);

    const filteredUsers = filter === 'All' ? users : users.filter(u => u.role === filter);

    return (
        <div className="p-8 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">User Database</h1>
                    <p className="text-gray-500">Complete registry of all platform users.</p>
                </div>
                <select 
                    value={filter} 
                    onChange={e => setFilter(e.target.value)} 
                    className="border p-2 rounded-md bg-white shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                >
                    <option value="All">All Roles</option>
                    <option value="Customer">Customer</option>
                    <option value="Vendor">Vendor</option>
                    <option value="Rider">Rider</option>
                    <option value="Moderator">Moderator</option>
                    <option value="Super Admin">Super Admin</option>
                </select>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="max-h-[600px] overflow-y-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 sticky top-0">
                            <tr>
                                <th className="p-4 font-semibold text-gray-600">Name</th>
                                <th className="p-4 font-semibold text-gray-600">Email / ID</th>
                                <th className="p-4 font-semibold text-gray-600">Role</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {isLoading ? (
                                <tr><td colSpan={3} className="p-8 text-center">Loading database...</td></tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr><td colSpan={3} className="p-8 text-center">No users found.</td></tr>
                            ) : (
                                filteredUsers.map((user, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50">
                                        <td className="p-4 font-medium text-gray-900">{user.name}</td>
                                        <td className="p-4 text-gray-600">{user.email}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold 
                                                ${user.role === 'Customer' ? 'bg-blue-100 text-blue-800' : ''}
                                                ${user.role === 'Vendor' ? 'bg-green-100 text-green-800' : ''}
                                                ${user.role === 'Rider' ? 'bg-orange-100 text-orange-800' : ''}
                                                ${user.role === 'Moderator' ? 'bg-purple-100 text-purple-800' : ''}
                                                ${user.role === 'Super Admin' ? 'bg-red-100 text-red-800' : ''}
                                            `}>
                                                {user.role}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default UserDatabasePage;
