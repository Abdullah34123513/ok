
import React, { useState, useEffect } from 'react';
import * as api from '@shared/api';
import type { Expense, MonthlyFinancialReport, ExpenseCategory } from '@shared/types';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, type ChartData } from 'chart.js';
import { Chart } from 'react-chartjs-2';
import AddExpenseModal from '../components/AddExpenseModal';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend);

const FinancePage: React.FC = () => {
    const [report, setReport] = useState<MonthlyFinancialReport[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const currentYear = new Date().getFullYear();

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const reportData = await api.getYearlyFinancialReport(currentYear);
            setReport(reportData);
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
    const chartData: ChartData<'bar' | 'line'> = {
        labels: report.map(r => r.month.split(' ')[0]), // Jan, Feb...
        datasets: [
            {
                type: 'bar' as const,
                label: 'Gross Platform Revenue',
                data: report.map(r => r.expenses + r.profit),
                backgroundColor: 'rgba(59, 130, 246, 0.7)', // Blue
                order: 2,
            },
            {
                type: 'bar' as const,
                label: 'Total Expenses',
                data: report.map(r => r.expenses),
                backgroundColor: 'rgba(239, 68, 68, 0.7)', // Red
                order: 3,
            },
            {
                type: 'line' as const,
                label: 'Net Income',
                data: report.map(r => r.profit),
                borderColor: 'rgba(16, 185, 129, 1)', // Green
                borderWidth: 2,
                fill: false,
                tension: 0.3,
                pointBackgroundColor: 'rgba(16, 185, 129, 1)',
                order: 1,
            }
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'top' as const },
            title: { display: false },
        },
        scales: {
            y: {
                beginAtZero: true,
            }
        }
    };

    // Summary Totals
    const totalExpenseYTD = report.reduce((sum, r) => sum + r.expenses, 0);
    const netIncomeYTD = report.reduce((sum, r) => sum + r.profit, 0);
    const grossPlatformProfit = netIncomeYTD + totalExpenseYTD;

    // Define Categories for the spreadsheet
    const expenseCategories: ExpenseCategory[] = ['Rider Salary', 'Hosting Cost', 'Marketing', 'Office Supplies', 'Maintenance', 'Other'];

    // Formatting helper
    const formatMoney = (val: number) => `৳${val.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

    if (isLoading) return <div className="p-8 text-center text-gray-500">Loading financial data...</div>;

    return (
        <div className="p-8 space-y-8 bg-gray-50 min-h-full">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Finance & Cashflow</h1>
                    <p className="text-gray-500 mt-1">{currentYear} Financial Overview</p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold shadow hover:bg-indigo-700 transition flex items-center whitespace-nowrap"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
                    Add Expense
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500">
                    <p className="text-xs text-gray-500 font-bold uppercase">Gross Revenue (YTD)</p>
                    <p className="text-2xl font-bold text-blue-600 mt-2">{formatMoney(grossPlatformProfit)}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-red-500">
                    <p className="text-xs text-gray-500 font-bold uppercase">Total Expenses (YTD)</p>
                    <p className="text-2xl font-bold text-red-600 mt-2">{formatMoney(totalExpenseYTD)}</p>
                </div>
                <div className={`bg-white p-6 rounded-xl shadow-sm border-l-4 ${netIncomeYTD >= 0 ? 'border-emerald-500' : 'border-orange-500'}`}>
                    <p className="text-xs text-gray-500 font-bold uppercase">Net Income (YTD)</p>
                    <p className={`text-2xl font-bold mt-2 ${netIncomeYTD >= 0 ? 'text-emerald-600' : 'text-orange-600'}`}>
                        {netIncomeYTD >= 0 ? '+' : ''}{formatMoney(netIncomeYTD)}
                    </p>
                </div>
            </div>

            {/* Chart Section */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-80">
                <Chart type='bar' options={chartOptions} data={chartData} />
            </div>

            {/* Detailed Spreadsheet Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b bg-gray-50">
                    <h3 className="text-lg font-bold text-gray-800">Financial Report Spreadsheet</h3>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-right border-collapse">
                        <thead>
                            <tr className="bg-gray-100 text-gray-600">
                                <th className="p-3 text-left font-bold border-b border-r bg-gray-50 sticky left-0 min-w-[180px] z-10">Category</th>
                                {report.map(r => (
                                    <th key={r.month} className="p-3 border-b min-w-[100px] font-semibold">{r.month.split(' ')[0]}</th>
                                ))}
                                <th className="p-3 border-b border-l bg-gray-50 font-bold min-w-[120px]">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* --- OPEX SECTION --- */}
                            <tr className="bg-gray-50"><td colSpan={14} className="p-2 text-left font-bold text-gray-500 text-xs uppercase tracking-wider pl-4">Operational Expenses (OpEx)</td></tr>
                            
                            {expenseCategories.map(category => {
                                const rowTotal = report.reduce((sum, r) => sum + (r.expenseBreakdown[category] || 0), 0);
                                return (
                                    <tr key={category} className="hover:bg-red-50/30">
                                        <td className="p-3 text-left border-r bg-white sticky left-0 z-10 font-medium text-gray-700">{category}</td>
                                        {report.map(r => (
                                            <td key={r.month} className="p-3 border-b border-gray-100 text-red-600/80">
                                                {(r.expenseBreakdown[category] || 0) > 0 ? (r.expenseBreakdown[category] || 0).toLocaleString() : '-'}
                                            </td>
                                        ))}
                                        <td className="p-3 border-l border-b font-bold text-red-600 bg-gray-50/50">{formatMoney(rowTotal)}</td>
                                    </tr>
                                );
                            })}

                            {/* Total OpEx Row */}
                            <tr className="bg-red-100/50 font-bold">
                                <td className="p-3 text-left border-r border-red-200 bg-red-100/50 sticky left-0 z-10 text-red-800">Total OpEx</td>
                                {report.map(r => (
                                    <td key={r.month} className="p-3 border-b border-red-200 text-red-800">{r.expenses > 0 ? r.expenses.toLocaleString() : '-'}</td>
                                ))}
                                <td className="p-3 border-l border-b border-red-200 text-red-900">{formatMoney(totalExpenseYTD)}</td>
                            </tr>

                            {/* Spacer */}
                            <tr><td colSpan={14} className="h-6 bg-gray-50"></td></tr>

                            {/* --- REVENUE SECTION --- */}
                            <tr className="bg-gray-50"><td colSpan={14} className="p-2 text-left font-bold text-gray-500 text-xs uppercase tracking-wider pl-4">Revenue & Metrics</td></tr>

                            <tr>
                                <td className="p-3 text-left border-r bg-white sticky left-0 z-10 font-medium text-gray-700">Total Orders</td>
                                {report.map(r => (
                                    <td key={r.month} className="p-3 border-b border-gray-100 text-gray-600">{r.orderCount > 0 ? r.orderCount : '-'}</td>
                                ))}
                                <td className="p-3 border-l border-b bg-gray-50/50 font-bold text-gray-800">{report.reduce((acc, r) => acc + r.orderCount, 0)}</td>
                            </tr>

                            <tr>
                                <td className="p-3 text-left border-r bg-white sticky left-0 z-10 font-medium text-gray-700">Gross Platform Revenue</td>
                                {report.map(r => (
                                    <td key={r.month} className="p-3 border-b border-gray-100 text-blue-600">{(r.profit + r.expenses) > 0 ? Math.round(r.profit + r.expenses).toLocaleString() : '-'}</td>
                                ))}
                                <td className="p-3 border-l border-b bg-gray-50/50 font-bold text-blue-700">{formatMoney(grossPlatformProfit)}</td>
                            </tr>

                            {/* Net Profit Row */}
                            <tr className="bg-green-100/50 font-bold">
                                <td className="p-3 text-left border-r border-green-200 bg-green-100/50 sticky left-0 z-10 text-green-800">Net Profit</td>
                                {report.map(r => (
                                    <td key={r.month} className={`p-3 border-b border-green-200 ${r.profit >= 0 ? 'text-green-800' : 'text-red-600'}`}>
                                        {r.profit !== 0 ? r.profit.toLocaleString(undefined, {maximumFractionDigits: 0}) : '-'}
                                    </td>
                                ))}
                                <td className="p-3 border-l border-b border-green-200 text-green-900">{formatMoney(netIncomeYTD)}</td>
                            </tr>
                            
                            <tr>
                                <td className="p-3 text-left border-r bg-white sticky left-0 z-10 font-medium text-gray-700 text-xs">Avg Profit / Order</td>
                                {report.map(r => (
                                    <td key={r.month} className="p-3 border-b border-gray-100 text-gray-500 text-xs">
                                        {r.orderCount > 0 ? (r.profit / r.orderCount).toFixed(1) : '-'}
                                    </td>
                                ))}
                                <td className="p-3 border-l border-b bg-gray-50/50 font-bold text-gray-600 text-xs">
                                    {report.reduce((acc, r) => acc + r.orderCount, 0) > 0 
                                        ? (netIncomeYTD / report.reduce((acc, r) => acc + r.orderCount, 0)).toFixed(1) 
                                        : '-'}
                                </td>
                            </tr>

                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && <AddExpenseModal onClose={() => setIsModalOpen(false)} onSave={handleAddExpense} />}
        </div>
    );
};

export default FinancePage;
