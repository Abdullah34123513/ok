import React, { useState, useEffect } from 'react';
import * as api from '@shared/api';
import type { User } from '@shared/types';

type UserWithRole = User & { role: string };

const UserManagementPage: React.FC = () => {
    const [users, setUsers] = useState<UserWithRole[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        api.getAllUsersForModerator()
            .then(data => setUsers(data as UserWithRole[]))
            .finally(() => setIsLoading(false));
    }, []);

    const getRoleClass = (role: string) => {
        switch (role) {
            case 'Moderator': return 'bg-purple-100 text-purple-800';
            case 'Vendor': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
             <div className="mt-6 bg-white rounded-lg shadow-md overflow-hidden">
                {isLoading ? (
                    <p className="p-6 text-center text-gray-500">Loading users...</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="p-4 font-semibold">Name</th>
                                    <th className="p-4 font-semibold">Email</th>
                                    <th className="p-4 font-semibold">Phone</th>
                                    <th className="p-4 font-semibold">Role</th>
                                    <th className="p-4 font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => (
                                    <tr key={user.email} className="border-b last:border-0 hover:bg-gray-50">
                                        <td className="p-4 font-medium whitespace-nowrap">{user.name}</td>
                                        <td className="p-4 text-gray-600 whitespace-nowrap">{user.email}</td>
                                        <td className="p-4 text-gray-600 whitespace-nowrap">{user.phone}</td>
                                        <td className="p-4">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleClass(user.role)}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="p-4 whitespace-nowrap">
                                            <button className="text-sm font-semibold text-blue-600 hover:underline">Edit</button>
                                            <button className="ml-4 text-sm font-semibold text-red-600 hover:underline">Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserManagementPage;