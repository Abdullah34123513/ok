import React from 'react';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color }) => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
            {/* FIX: Moved color style to the parent div to be inherited by the icon's `currentColor` property, resolving the type error. */}
            <div className={`p-4 rounded-full mr-4`} style={{ backgroundColor: `${color}20`, color: color }}>
                <Icon className={`w-8 h-8`} />
            </div>
            <div>
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <p className="text-3xl font-bold text-gray-800">{value}</p>
            </div>
        </div>
    );
};

export default StatCard;