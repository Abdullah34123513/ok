
import React, { useState, useEffect } from 'react';
import * as api from '@shared/api';
import type { FinancialSpreadsheetData, ExpenseCategory } from '@shared/types';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const FinancePage: React.FC = () => {
    const [data, setData] = useState<FinancialSpreadsheetData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [newRowName, setNewRowName] = useState('');
    const [isAddingRow, setIsAddingRow] = useState(false);

    const currentYear = new Date().getFullYear();

    const fetchData = async () => {
        try {
            const spreadsheetData = await api.getFinancialSpreadsheetData(currentYear);
            setData(spreadsheetData);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCellUpdate = async (category: string, monthIndex: number, value: string) => {
        const numValue = parseFloat(value);
        if (isNaN(numValue)) return; 
        try {
            const updatedData = await api.updateMonthlyExpense(category, currentYear, monthIndex, numValue);
            setData(updatedData);
        } catch (e) {
            console.error("Failed to update cell", e);
        }
    };

    const handleAddRow = async () => {
        if (!newRowName.trim()) return;
        await api.addExpenseCategory(newRowName);
        setNewRowName('');
        setIsAddingRow(false);
        fetchData(); 
    };

    const handleRemoveRow = async (category: string) => {
        if (confirm(`Are you sure you want to remove the "${category}" row?`)) {
            try {
                const updatedData = await api.removeExpenseCategory(category, currentYear);
                setData(updatedData);
            } catch (e) {
                console.error("Failed to remove row", e);
            }
        }
    };

    if (isLoading || !data) return <div className="p-8 text-center text-gray-500">Loading financial data...</div>;

    const { months, expenses, totalOpEx, netProfit, revenueSources, expenseBreakdown, metrics, totals } = data;
    const expenseCategories = Object.keys(expenses) as ExpenseCategory[];
    const fm = (val: number) => val !== 0 ? Math.round(val).toLocaleString() : '0';

    // --- CHART DATA ---
    const cashFlowData = {
        labels: months,
        datasets: [
            {
                label: 'Total Revenue',
                data: revenueSources.commissions.map((c, i) => c + revenueSources.deliveryFees[i] + revenueSources.ads[i]),
                borderColor: '#10B981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                tension: 0.3,
                fill: true,
            },
            {
                label: 'Total Expenses',
                data: totalOpEx,
                borderColor: '#EF4444',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                tension: 0.3,
                fill: true,
            },
            {
                label: 'Net Profit',
                data: netProfit,
                borderColor: '#3B82F6',
                borderDash: [5, 5],
                tension: 0.3,
            },
        ],
    };

    const revenueBreakdownData = {
        labels: ['Commissions', 'Delivery Fees', 'Ad Revenue'],
        datasets: [
            {
                data: [
                    revenueSources.commissions.reduce((a,b) => a+b, 0),
                    revenueSources.deliveryFees.reduce((a,b) => a+b, 0),
                    revenueSources.ads.reduce((a,b) => a+b, 0),
                ],
                backgroundColor: ['#3B82F6', '#10B981', '#F59E0B'],
                borderWidth: 0,
            },
        ],
    };

    const expenseBreakdownData = {
        labels: ['Operations (Salaries/Rent)', 'Marketing', 'Technology'],
        datasets: [
            {
                data: [
                    expenseBreakdown.operations.reduce((a,b) => a+b, 0),
                    expenseBreakdown.marketing.reduce((a,b) => a+b, 0),
                    expenseBreakdown.technology.reduce((a,b) => a+b, 0),
                ],
                backgroundColor: ['#6366F1', '#EC4899', '#8B5CF6'],
                borderWidth: 0,
            },
        ],
    };

    return (
        <div className="p-6 space-y-8 bg-gray-100 min-h-full">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Financial Performance {currentYear}</h1>
                <div className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full shadow-sm">
                    Data updates in real-time
                </div>
            </div>

            {/* 1. TOP LEVEL SUMMARY CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500">
                    <p className="text-sm font-semibold text-gray-500 uppercase">Total Revenue (YTD)</p>
                    <p className="text-3xl font-bold text-green-600 mt-1">৳{fm(totals.totalRevenueYear)}</p>
                    <p className="text-xs text-gray-400 mt-2">Commissions, Fees & Ads</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-red-500">
                    <p className="text-sm font-semibold text-gray-500 uppercase">Total Expenses (YTD)</p>
                    <p className="text-3xl font-bold text-red-600 mt-1">৳{fm(totals.totalCostYear)}</p>
                    <p className="text-xs text-gray-400 mt-2">Operational & Marketing Costs</p>
                </div>
                <div className={`bg-white p-6 rounded-xl shadow-sm border-l-4 ${totals.difference >= 0 ? 'border-blue-500' : 'border-orange-500'}`}>
                    <p className="text-sm font-semibold text-gray-500 uppercase">Net Profit (YTD)</p>
                    <p className={`text-3xl font-bold mt-1 ${totals.difference >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                        {totals.difference >= 0 ? '+' : ''}৳{fm(totals.difference)}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">Gross Profit Margin</p>
                </div>
            </div>

            {/* 2. CHARTS SECTION */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Trend Line */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm">
                    <h3 className="font-bold text-gray-700 mb-4">Cash Flow Trend</h3>
                    <div className="h-64">
                        <Line 
                            data={cashFlowData} 
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: { legend: { position: 'bottom' } },
                                scales: { y: { grid: { display: true, color: '#f3f4f6' } }, x: { grid: { display: false } } }
                            }} 
                        />
                    </div>
                </div>

                {/* Breakdown Doughnuts */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm flex flex-col items-center">
                        <h3 className="font-bold text-gray-700 mb-2 w-full text-left">Income Sources</h3>
                        <div className="h-40 w-full">
                            <Doughnut 
                                data={revenueBreakdownData} 
                                options={{ maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { boxWidth: 12 } } } }} 
                            />
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm flex flex-col items-center">
                        <h3 className="font-bold text-gray-700 mb-2 w-full text-left">Expense Split</h3>
                        <div className="h-40 w-full">
                            <Doughnut 
                                data={expenseBreakdownData} 
                                options={{ maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { boxWidth: 12 } } } }} 
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. DATA SPREADSHEET */}
            <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-300">
                <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                    <h3 className="font-bold text-gray-700">Monthly Data Breakdown</h3>
                    <button onClick={() => fetchData()} className="text-sm text-blue-600 hover:underline">Refresh Data</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-xs md:text-sm text-right border-collapse">
                        <thead className="bg-orange-50 text-gray-800 font-bold">
                            <tr>
                                <th className="p-3 text-left border border-orange-100 bg-orange-50 sticky left-0 min-w-[180px] z-20">Category</th>
                                {months.map(m => <th key={m} className="p-3 border border-orange-100 min-w-[80px]">{m}</th>)}
                                <th className="p-3 border border-orange-100 min-w-[100px] bg-orange-100">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* Revenue Section (Read Only) */}
                            <tr className="bg-green-50 font-bold text-green-800"><td className="p-2 text-left pl-4" colSpan={14}>REVENUE STREAMS</td></tr>
                            <tr>
                                <td className="p-2 text-left border border-gray-100 sticky left-0 bg-white font-medium">Commissions</td>
                                {revenueSources.commissions.map((v, i) => <td key={i} className="p-2 border border-gray-100 text-gray-500">{fm(v)}</td>)}
                                <td className="p-2 border border-gray-100 font-bold">{fm(revenueSources.commissions.reduce((a,b)=>a+b,0))}</td>
                            </tr>
                            <tr>
                                <td className="p-2 text-left border border-gray-100 sticky left-0 bg-white font-medium">Delivery Fees</td>
                                {revenueSources.deliveryFees.map((v, i) => <td key={i} className="p-2 border border-gray-100 text-gray-500">{fm(v)}</td>)}
                                <td className="p-2 border border-gray-100 font-bold">{fm(revenueSources.deliveryFees.reduce((a,b)=>a+b,0))}</td>
                            </tr>
                            <tr>
                                <td className="p-2 text-left border border-gray-100 sticky left-0 bg-white font-medium">Ad Revenue</td>
                                {revenueSources.ads.map((v, i) => <td key={i} className="p-2 border border-gray-100 text-gray-500">{fm(v)}</td>)}
                                <td className="p-2 border border-gray-100 font-bold">{fm(revenueSources.ads.reduce((a,b)=>a+b,0))}</td>
                            </tr>

                            {/* Expenses Section (Editable) */}
                            <tr className="bg-red-50 font-bold text-red-800"><td className="p-2 text-left pl-4" colSpan={14}>OPERATING EXPENSES</td></tr>
                            {expenseCategories.map(cat => {
                                const rowTotal = expenses[cat].reduce((a, b) => a + b, 0);
                                return (
                                    <tr key={cat} className="hover:bg-gray-50 group">
                                        <td className="p-2 text-left border border-gray-200 bg-white font-medium sticky left-0 z-10 group-hover:bg-gray-50">
                                            <div className="flex justify-between items-center w-full">
                                                <span className="truncate">{cat}</span>
                                                <button 
                                                    onClick={() => handleRemoveRow(cat)}
                                                    className="ml-2 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    title="Remove Row"
                                                >
                                                    &times;
                                                </button>
                                            </div>
                                        </td>
                                        {expenses[cat].map((amount, idx) => (
                                            <td key={idx} className="p-0 border border-gray-200 relative">
                                                <input
                                                    type="number"
                                                    defaultValue={amount}
                                                    onBlur={(e) => handleCellUpdate(cat, idx, e.target.value)}
                                                    className="w-full h-full p-2 text-right bg-transparent focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 absolute inset-0 text-gray-700"
                                                />
                                                <span className="opacity-0 pointer-events-none p-2 block">{amount}</span>
                                            </td>
                                        ))}
                                        <td className="p-2 border border-gray-200 font-bold bg-gray-50">{fm(rowTotal)}</td>
                                    </tr>
                                );
                            })}

                            {/* Add Row */}
                            <tr>
                                <td className="p-2 border border-gray-200 sticky left-0 bg-white z-10" colSpan={1}>
                                    {isAddingRow ? (
                                        <div className="flex space-x-2">
                                            <input 
                                                autoFocus
                                                className="border rounded px-1 w-full text-sm"
                                                placeholder="Category Name"
                                                value={newRowName}
                                                onChange={e => setNewRowName(e.target.value)}
                                                onKeyDown={e => {
                                                    if(e.key === 'Enter') handleAddRow();
                                                    if(e.key === 'Escape') setIsAddingRow(false);
                                                }}
                                            />
                                            <button onClick={handleAddRow} className="text-green-600 font-bold">✓</button>
                                            <button onClick={() => setIsAddingRow(false)} className="text-red-600 font-bold">✕</button>
                                        </div>
                                    ) : (
                                        <button onClick={() => setIsAddingRow(true)} className="text-blue-600 hover:underline text-xs font-bold flex items-center">
                                            + Add Expense Row
                                        </button>
                                    )}
                                </td>
                                <td colSpan={13} className="border border-gray-200 bg-gray-50"></td>
                            </tr>

                            {/* Summary Footer */}
                            <tr className="h-4"><td colSpan={14}></td></tr>
                            <tr className="bg-gray-100 font-bold text-gray-800">
                                <td className="p-3 text-left border border-gray-200 sticky left-0 bg-gray-100 z-10">Net Profit</td>
                                {netProfit.map((val, idx) => (
                                    <td key={idx} className={`p-2 border border-gray-200 ${val < 0 ? 'text-red-600' : 'text-green-600'}`}>{fm(val)}</td>
                                ))}
                                <td className={`p-2 border border-gray-200 ${totals.difference >= 0 ? 'text-green-700' : 'text-red-700'}`}>{fm(totals.difference)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default FinancePage;
