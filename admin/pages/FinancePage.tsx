
import React, { useState, useEffect } from 'react';
import * as api from '@shared/api';

const FinancePage: React.FC = () => {
    const [data, setData] = useState<{ date: string, revenue: number, profit: number }[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        api.getFinancialStats()
            .then(setData)
            .finally(() => setIsLoading(false));
    }, []);

    if (isLoading) return <div className="p-8">Loading financial data...</div>;

    return (
        <div className="p-8 space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Finance & Cashflow</h1>
                <p className="text-gray-500">Weekly revenue and profit analysis.</p>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="p-4 font-semibold text-gray-600">Date</th>
                            <th className="p-4 font-semibold text-gray-600">Gross Revenue</th>
                            <th className="p-4 font-semibold text-gray-600">Net Profit (Est. 20%)</th>
                            <th className="p-4 font-semibold text-gray-600">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {data.map((row, idx) => (
                            <tr key={idx} className="hover:bg-gray-50">
                                <td className="p-4 font-mono text-sm">{row.date}</td>
                                <td className="p-4 font-bold text-gray-800">৳{row.revenue.toFixed(2)}</td>
                                <td className="p-4 font-bold text-green-600">+৳{row.profit.toFixed(2)}</td>
                                <td className="p-4">
                                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-bold">Settled</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default FinancePage;
