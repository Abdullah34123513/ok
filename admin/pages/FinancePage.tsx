
import React, { useState, useEffect } from 'react';
import * as api from '@shared/api';
import type { Expense, MonthlyFinancialReport } from '@shared/types';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import AddExpenseModal from '../components/AddExpenseModal';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend);

const FinancePage: React.FC = () => {
    const [report, setReport] = useState<MonthlyFinancialReport[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedMonthFilter, setSelectedMonthFilter] = useState<number | 'all'>('all');

    const currentYear = new Date().getFullYear();

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [reportData, expenseData] = await Promise.all([
                api.getYearlyFinancialReport(currentYear),
                api.getExpenses()
            ]);
            setReport(reportData);
            setExpenses(expenseData);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAddExpense = async (expenseData: Omit<Expense, 'id'>) => {
        await api.addExpense(expenseData);
        fetchData(); // Refresh data to update charts and lists
    };

    // Chart Configuration
    const chartData = {
        labels: report.map(r => r.month.split(' ')[0]), // Jan, Feb...
        datasets: [
            {
                label: 'Gross Platform Profit (Commissions)',
                data: report.map(r => r.expenses + r.profit), // Reconstructing Gross Profit from Net + Expenses
                backgroundColor: 'rgba(59, 130, 246, 0.7)', // Blue
                order: 2,
            },
            {
                label: 'Operational Expenses',
                data: report.map(r => r.expenses),
                backgroundColor: 'rgba(239, 68, 68, 0.7)', // Red
                order: 3,
            },
            {
                label: 'Net Income',
                data: report.map(r => r.profit),
                backgroundColor: 'rgba(16, 185, 129, 0.7)', // Emerald
                type: 'line' as const,
                borderColor: 'rgba(16, 185, 129, 1)',
                borderWidth: 2,
                fill: false,
                order: 1,
            } as any
        ],
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: { position: 'top' as const },
            title: { display: true, text: `Profitability Analysis - ${currentYear}` },
        },
    };

    const filteredExpenses = selectedMonthFilter === 'all' 
        ? expenses 
        : expenses.filter(e => new Date(e.date).getMonth() === selectedMonthFilter && new Date(e.date).getFullYear() === currentYear);

    // Summary Totals
    const totalGMV = report.reduce((sum, r) => sum + r.revenue, 0); // Gross Merchandise Value
    const totalExpenseYTD = report.reduce((sum, r) => sum + r.expenses, 0);
    const netIncomeYTD = report.reduce((sum, r) => sum + r.profit, 0);
    const grossPlatformProfit = netIncomeYTD + totalExpenseYTD;

    if (isLoading) return <div className="p-8 text-center text-gray-500">Loading financial data...</div>;

    return (
        <div className="p-8 space-y-8 bg-gray-50 min-h-full">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Finance & Cashflow</h1>
                    <p className="text-gray-500 mt-1">Profit tracking based on 15% Vendor Commission & 20% Delivery Fees.</p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold shadow hover:bg-indigo-700 transition flex items-center"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
                    Add Expense
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-gray-400">
                    <p className="text-xs text-gray-500 font-bold uppercase">Total Order Volume (GMV)</p>
                    <p className="text-2xl font-bold text-gray-700 mt-2">৳{totalGMV.toLocaleString()}</p>
                    <p className="text-xs text-gray-400 mt-1">Total sales processed</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500">
                    <p className="text-xs text-gray-500 font-bold uppercase">Gross Platform Revenue</p>
                    <p className="text-2xl font-bold text-blue-600 mt-2">৳{grossPlatformProfit.toLocaleString()}</p>
                    <p className="text-xs text-gray-400 mt-1">Before expenses (Commissions)</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-red-500">
                    <p className="text-xs text-gray-500 font-bold uppercase">Total Expenses</p>
                    <p className="text-2xl font-bold text-red-600 mt-2">৳{totalExpenseYTD.toLocaleString()}</p>
                    <p className="text-xs text-gray-400 mt-1">Salaries, Hosting, Ops</p>
                </div>
                <div className={`bg-white p-6 rounded-xl shadow-sm border-l-4 ${netIncomeYTD >= 0 ? 'border-emerald-500' : 'border-orange-500'}`}>
                    <p className="text-xs text-gray-500 font-bold uppercase">Net Income</p>
                    <p className={`text-2xl font-bold mt-2 ${netIncomeYTD >= 0 ? 'text-emerald-600' : 'text-orange-600'}`}>
                        {netIncomeYTD >= 0 ? '+' : ''}৳{netIncomeYTD.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">Actual Profit</p>
                </div>
            </div>

            {/* Chart Section */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <Bar options={chartOptions} data={chartData} height={80} />
            </div>

            {/* Expense Details Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b bg-gray-50 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <h3 className="text-lg font-bold text-gray-800">Expense History</h3>
                    <div className="flex items-center space-x-2">
                        <label className="text-sm text-gray-600 font-medium">Filter Month:</label>
                        <select 
                            className="border border-gray-300 rounded p-1.5 text-sm focus:ring-indigo-500"
                            value={selectedMonthFilter}
                            onChange={(e) => setSelectedMonthFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                        >
                            <option value="all">All Months</option>
                            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, i) => (
                                <option key={i} value={i}>{m}</option>
                            ))}
                        </select>
                    </div>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-100 text-gray-600 text-xs uppercase font-bold">
                            <tr>
                                <th className="p-4">Date</th>
                                <th className="p-4">Category</th>
                                <th className="p-4">Description</th>
                                <th className="p-4 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 text-sm">
                            {filteredExpenses.length === 0 ? (
                                <tr><td colSpan={4} className="p-8 text-center text-gray-500">No expenses recorded for this period.</td></tr>
                            ) : (
                                filteredExpenses.map(expense => (
                                    <tr key={expense.id} className="hover:bg-gray-50">
                                        <td className="p-4 whitespace-nowrap text-gray-500">{new Date(expense.date).toLocaleDateString()}</td>
                                        <td className="p-4">
                                            <span className="px-2 py-1 bg-gray-200 rounded text-xs font-bold text-gray-700">{expense.category}</span>
                                        </td>
                                        <td className="p-4 font-medium text-gray-800">{expense.description}</td>
                                        <td className="p-4 text-right font-bold text-red-600">-৳{expense.amount.toLocaleString()}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && <AddExpenseModal onClose={() => setIsModalOpen(false)} onSave={handleAddExpense} />}
        </div>
    );
};

export default FinancePage;
