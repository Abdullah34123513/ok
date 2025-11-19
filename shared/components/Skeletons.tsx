
import React from 'react';

export const SkeletonLine: React.FC<{ className?: string }> = ({ className }) => (
    <div className={`bg-gray-200 rounded animate-pulse ${className}`}></div>
);

export const SkeletonCard: React.FC = () => (
    <div className="bg-white rounded-lg shadow-md p-4 animate-pulse space-y-4">
        <div className="h-40 bg-gray-200 rounded-md w-full"></div>
        <div className="space-y-2">
            <SkeletonLine className="h-6 w-3/4" />
            <SkeletonLine className="h-4 w-1/2" />
        </div>
        <div className="flex justify-between pt-2">
            <SkeletonLine className="h-8 w-24" />
            <SkeletonLine className="h-8 w-24" />
        </div>
    </div>
);

export const SkeletonTableRow: React.FC = () => (
    <tr className="animate-pulse border-b last:border-0">
        <td className="p-4"><SkeletonLine className="h-5 w-20" /></td>
        <td className="p-4">
            <SkeletonLine className="h-5 w-32 mb-2" />
            <SkeletonLine className="h-4 w-24" />
        </td>
        <td className="p-4"><SkeletonLine className="h-5 w-32" /></td>
        <td className="p-4"><SkeletonLine className="h-6 w-16" /></td>
        <td className="p-4 text-right"><SkeletonLine className="h-8 w-24 ml-auto" /></td>
    </tr>
);

export const SkeletonList: React.FC<{ count?: number }> = ({ count = 3 }) => (
    <div className="space-y-4">
        {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="bg-white p-4 rounded-lg shadow animate-pulse flex justify-between items-center">
                <div className="space-y-2 w-full">
                    <SkeletonLine className="h-5 w-1/3" />
                    <SkeletonLine className="h-4 w-1/2" />
                </div>
                <SkeletonLine className="h-8 w-20" />
            </div>
        ))}
    </div>
);
