
import React, { useState, useEffect } from 'react';
import * as api from '@shared/api';
import type { FinancialSpreadsheetData, ExpenseCategory } from '@shared/types';

const FinancePage: React.FC = () => {
    const [data, setData] = useState<FinancialSpreadsheetData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [newRowName, setNewRowName] = useState('');
    const [isAddingRow, setIsAddingRow] = useState(false);

    const currentYear = new Date().getFullYear();

    const fetchData = async () => {
        // Don't set global loading to avoid flickering during updates if we had optimistic UI, 
        // but here we want to show calculations happening.
        // For smoother UX, we could keep isLoading false on updates, but let's keep it simple.
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
        if (isNaN(numValue)) return; // Ignore invalid input

        // Optimistic update or just wait for server? 
        // Given the requirement "update full table from backend", we'll send data and re-fetch.
        // We can show a small loading indicator or just rely on the quick mock response.
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
        fetchData(); // Refresh to show new empty row
    };

    if (isLoading || !data) return <div className="p-8 text-center text-gray-500">Loading financial data...</div>;

    const { months, expenses, totalOpEx, netProfit, metrics, totals } = data;
    const expenseCategories = Object.keys(expenses) as ExpenseCategory[];

    // Helper to format money without currency symbol for cleaner cells
    const fm = (val: number) => val !== 0 ? Math.round(val).toLocaleString() : '0';

    return (
        <div className="p-6 space-y-6 bg-gray-100 min-h-full overflow-x-auto">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Financial Report {currentYear}</h1>
                <div className="text-sm text-gray-500">
                    * Click on any expense cell to edit values. Changes auto-save and recalculate totals.
                </div>
            </div>

            <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-300">
                <table className="w-full text-xs md:text-sm text-right border-collapse">
                    <thead className="bg-orange-100 text-gray-800 font-bold">
                        <tr>
                            <th className="p-2 text-left border border-orange-200 bg-orange-100 sticky left-0 min-w-[150px] z-10">date</th>
                            {months.map(m => <th key={m} className="p-2 border border-orange-200 min-w-[80px]">{m}</th>)}
                            <th className="p-2 border border-orange-200 min-w-[100px]">total</th>
                            <th className="p-2 border border-orange-200 min-w-[100px]">salaries</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* --- EXPENSES --- */}
                        {expenseCategories.map(cat => {
                            const rowTotal = expenses[cat].reduce((a, b) => a + b, 0);
                            return (
                                <tr key={cat} className="hover:bg-red-50 group">
                                    <td className="p-2 text-left border border-gray-200 bg-red-50/30 font-medium sticky left-0 z-10 group-hover:bg-red-100">{cat}</td>
                                    {expenses[cat].map((amount, idx) => (
                                        <td key={idx} className="p-0 border border-gray-200 relative">
                                            <input
                                                type="number"
                                                defaultValue={amount}
                                                onBlur={(e) => handleCellUpdate(cat, idx, e.target.value)}
                                                onKeyDown={(e) => {
                                                    if(e.key === 'Enter') e.currentTarget.blur();
                                                }}
                                                className="w-full h-full p-2 text-right bg-transparent focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 absolute inset-0"
                                            />
                                            <span className="opacity-0 pointer-events-none p-2 block">{amount}</span> {/* Spacer to keep cell height */}
                                        </td>
                                    ))}
                                    <td className="p-2 border border-gray-200 font-bold">{fm(rowTotal)}</td>
                                    <td className="p-2 border border-gray-200 bg-orange-50">
                                        {/* Placeholder for salaries column logic */}
                                    </td>
                                </tr>
                            );
                        })}

                        {/* --- ADD ROW BUTTON --- */}
                        <tr>
                            <td className="p-2 border border-gray-200 sticky left-0 bg-white z-10" colSpan={1}>
                                {isAddingRow ? (
                                    <div className="flex space-x-2">
                                        <input 
                                            autoFocus
                                            className="border rounded px-1 w-full"
                                            placeholder="e.g. Employee 3"
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
                                    <button 
                                        onClick={() => setIsAddingRow(true)}
                                        className="text-blue-600 hover:underline text-xs font-bold flex items-center"
                                    >
                                        + Add Row (Employee/Rider)
                                    </button>
                                )}
                            </td>
                            <td colSpan={14} className="border border-gray-200 bg-gray-50"></td>
                        </tr>

                        {/* --- TOTAL OPEX --- */}
                        <tr className="bg-red-200 font-bold text-red-900">
                            <td className="p-2 text-left border border-red-300 sticky left-0 bg-red-200 z-10">total OpEx</td>
                            {totalOpEx.map((val, idx) => (
                                <td key={idx} className="p-2 border border-red-300">{fm(val)}</td>
                            ))}
                            <td className="p-2 border border-red-300">{fm(totals.totalOpExYear)}</td>
                            <td className="p-2 border border-red-300"></td>
                        </tr>

                        {/* Spacer */}
                        <tr className="h-4 bg-white"><td colSpan={15}></td></tr>

                        {/* --- NET PROFIT --- */}
                        <tr className="bg-green-100 font-bold text-green-900">
                            <td className="p-2 text-left border border-green-200 sticky left-0 bg-green-100 z-10">total net profit</td>
                            {netProfit.map((val, idx) => (
                                <td key={idx} className={`p-2 border border-green-200 ${val < 0 ? 'text-red-600' : ''}`}>{fm(val)}</td>
                            ))}
                            <td className="p-2 border border-green-200"></td>
                            <td className="p-2 border border-green-200"></td>
                        </tr>

                        {/* Spacer */}
                        <tr className="h-4 bg-white"><td colSpan={15}></td></tr>

                        {/* --- METRICS --- */}
                        <tr className="bg-white hover:bg-gray-50">
                            <td className="p-2 text-left border border-gray-200 bg-gray-50 sticky left-0 font-medium z-10">daily sales</td>
                            {metrics.dailySales.map((val, idx) => <td key={idx} className="p-2 border border-gray-200">{val}</td>)}
                            <td className="p-2 border border-gray-200"></td>
                            <td className="p-2 border border-gray-200"></td>
                        </tr>
                        <tr className="bg-white hover:bg-gray-50">
                            <td className="p-2 text-left border border-gray-200 bg-gray-50 sticky left-0 font-medium z-10">monthly sales</td>
                            {metrics.monthlySales.map((val, idx) => <td key={idx} className="p-2 border border-gray-200">{val}</td>)}
                            <td className="p-2 border border-gray-200"></td>
                            <td className="p-2 border border-gray-200"></td>
                        </tr>
                        <tr className="bg-green-100 hover:bg-green-200 text-green-900">
                            <td className="p-2 text-left border border-green-200 sticky left-0 bg-green-100 font-medium z-10">Sales commission per order</td>
                            {metrics.commissionPerOrder.map((val, idx) => <td key={idx} className="p-2 border border-green-200">{val}</td>)}
                            <td className="p-2 border border-green-200"></td>
                            <td className="p-2 border border-green-200"></td>
                        </tr>
                        <tr className="bg-green-100 hover:bg-green-200 text-green-900">
                            <td className="p-2 text-left border border-green-200 sticky left-0 bg-green-100 font-medium z-10">Avg gross profit/delivery revenue</td>
                            {metrics.avgGrossProfit.map((val, idx) => <td key={idx} className="p-2 border border-green-200">{val}</td>)}
                            <td className="p-2 border border-green-200"></td>
                            <td className="p-2 border border-green-200"></td>
                        </tr>
                        <tr className="bg-white hover:bg-gray-50">
                            <td className="p-2 text-left border border-gray-200 bg-gray-50 sticky left-0 font-medium z-10">Avg marketing cost</td>
                            {metrics.avgMarketingCost.map((val, idx) => <td key={idx} className="p-2 border border-gray-200">{val}</td>)}
                            <td className="p-2 border border-gray-200"></td>
                            <td className="p-2 border border-gray-200"></td>
                        </tr>
                        <tr className="bg-white hover:bg-gray-50">
                            <td className="p-2 text-left border border-gray-200 bg-gray-50 sticky left-0 font-medium z-10">other cost</td>
                            {metrics.otherCost.map((val, idx) => <td key={idx} className="p-2 border border-gray-200">{val}</td>)}
                            <td className="p-2 border border-gray-200"></td>
                            <td className="p-2 border border-gray-200"></td>
                        </tr>
                        <tr className="bg-white hover:bg-gray-50">
                            <td className="p-2 text-left border border-gray-200 bg-gray-50 sticky left-0 font-medium z-10">product testing</td>
                            {Array(12).fill(0).map((val, idx) => <td key={idx} className="p-2 border border-gray-200">{val}</td>)}
                            <td className="p-2 border border-gray-200"></td>
                            <td className="p-2 border border-gray-200"></td>
                        </tr>
                        <tr className="bg-green-100 hover:bg-green-200 text-green-900 font-bold">
                            <td className="p-2 text-left border border-green-200 sticky left-0 bg-green-100 z-10">net profit</td>
                            {netProfit.map((val, idx) => <td key={idx} className={`p-2 border border-green-200 ${val < 0 ? 'text-red-600' : ''}`}>{fm(val)}</td>)}
                            <td className="p-2 border border-green-200"></td>
                            <td className="p-2 border border-green-200"></td>
                        </tr>
                        <tr className="bg-red-50 hover:bg-red-100">
                            <td className="p-2 text-left border border-red-200 sticky left-0 bg-red-50 font-medium z-10">net profit per sales</td>
                            {metrics.netProfitPerSales.map((val, idx) => <td key={idx} className={`p-2 border border-red-200 ${val < 0 ? 'text-red-600' : ''}`}>{val}</td>)}
                            <td className="p-2 border border-red-200"></td>
                            <td className="p-2 border border-red-200"></td>
                        </tr>

                        {/* Spacer */}
                        <tr className="h-4 bg-white"><td colSpan={15}></td></tr>

                        {/* --- TOTAL COST ROW --- */}
                        <tr className="bg-red-200 font-bold text-red-900">
                            <td className="p-2 text-left border border-red-300 sticky left-0 bg-red-200 z-10">total cost</td>
                            {totalOpEx.map((val, idx) => (
                                <td key={idx} className="p-2 border border-red-300">{fm(val)}</td>
                            ))}
                            <td className="p-2 border border-red-300"></td>
                            <td className="p-2 border border-red-300"></td>
                        </tr>
                        
                        {/* --- FOOTER SUMMARY --- */}
                        <tr className="h-8 bg-white"><td colSpan={15}></td></tr>
                        <tr className="bg-yellow-100 font-bold text-gray-800">
                            <td className="p-3 text-left border border-yellow-200 sticky left-0 bg-yellow-100 z-10">1 year total revenue</td>
                            <td colSpan={2} className="p-3 text-left text-green-600 border border-yellow-200">{fm(totals.totalRevenueYear)}</td>
                            <td colSpan={12}></td>
                        </tr>
                        <tr className="bg-red-100 font-bold text-gray-800">
                            <td className="p-3 text-left border border-red-200 sticky left-0 bg-red-100 z-10">1 year total cost</td>
                            <td colSpan={2} className="p-3 text-left text-red-600 border border-red-200">{fm(totals.totalCostYear)}</td>
                            <td colSpan={12}></td>
                        </tr>
                        <tr><td colSpan={3} className="border-b-2 border-dashed border-black"></td><td colSpan={12}></td></tr>
                        <tr className="bg-green-100 font-bold text-gray-800">
                            <td className="p-3 text-left border border-green-200 sticky left-0 bg-orange-200 z-10">Difference</td>
                            <td colSpan={2} className={`p-3 text-left border border-green-200 bg-green-100 ${totals.difference >= 0 ? 'text-green-700' : 'text-red-700'}`}>{fm(totals.difference)}</td>
                            <td colSpan={12}></td>
                        </tr>

                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default FinancePage;
