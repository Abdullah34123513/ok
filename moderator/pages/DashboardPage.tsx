import React from 'react';

const DashboardPage: React.FC = () => {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-800">Moderator Dashboard</h1>
            <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
                <p>Welcome to the moderation dashboard. Content management tools will be available here.</p>
            </div>
        </div>
    );
};

export default DashboardPage;
