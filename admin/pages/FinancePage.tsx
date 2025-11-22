
import React, { useState, useEffect } from 'react';
import * as api from '@shared/api';
import type { FinancialSpreadsheetData, Expense, ExpenseCategory } from '@shared/types';
import AddExpenseModal from '../components/AddExpenseModal';

const FinancePage: React.FC = () => {
    const [data, setData] = useState<FinancialSpreadsheetData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const currentYear = new Date().getFullYear();

    const fetchData = async () => {
        setIsLoading(true);
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

    const handleAddExpense = async (expenseData: Omit<Expense, 'id'>) => {
        await api.addExpense(expenseData);
        fetchData();
    };

    if (isLoading || !data) return <div className="p-8 text-center text-gray-500">Loading detailed financial data...</div>;

    const { months, expenses, totalOpEx, netProfit, metrics, totals } = data;
    const expenseCategories = Object.keys(expenses) as ExpenseCategory[];

    // Helper to format money without currency symbol for cleaner cells
    const fm = (val: number) => val !== 0 ? Math.round(val).toLocaleString() : '0';

    return (
        <div className="p-6 space-y-6 bg-gray-100 min-h-full overflow-x-auto">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Financial Report {currentYear}</h1>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition font-bold text-sm"
                >
                    + Add Expense
                </button>
            </div>

            <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-300">
                <table className="w-full text-xs md:text-sm text-right border-collapse">
                    <thead className="bg-orange-100 text-gray-800 font-bold">
                        <tr>
                            <th className="p-2 text-left border border-orange-200 bg-orange-100 sticky left-0 min-w-[150px]">date</th>
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
                                <tr key={cat} className="hover:bg-red-50">
                                    <td className="p-2 text-left border border-gray-200 bg-red-50/30 font-medium sticky left-0">{cat}</td>
                                    {expenses[cat].map((amount, idx) => (
                                        <td key={idx} className="p-2 border border-gray-200">{fm(amount)}</td>
                                    ))}
                                    <td className="p-2 border border-gray-200 font-bold">{fm(rowTotal)}</td>
                                    <td className="p-2 border border-gray-200 bg-orange-50">
                                        {/* Placeholder for salaries column logic if specifically needed separately */}
                                    </td>
                                </tr>
                            );
                        })}

                        {/* --- TOTAL OPEX --- */}
                        <tr className="bg-red-200 font-bold text-red-900">
                            <td className="p-2 text-left border border-red-300 sticky left-0 bg-red-200">total OpEx</td>
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
                            <td className="p-2 text-left border border-green-200 sticky left-0 bg-green-100">total net profit</td>
                            {netProfit.map((val, idx) => (
                                <td key={idx} className={`p-2 border border-green-200 ${val < 0 ? 'text-red-600' : ''}`}>{fm(val)}</td>
                            ))}
                            <td className="p-2 border border-green-200"></td> {/* No annual sum here usually for net profit rows in this specific view style, or maybe there is. Let's leave blank to match image approx */}
                            <td className="p-2 border border-green-200"></td>
                        </tr>

                        {/* Spacer */}
                        <tr className="h-4 bg-white"><td colSpan={15}></td></tr>

                        {/* --- METRICS --- */}
                        <tr className="bg-white hover:bg-gray-50">
                            <td className="p-2 text-left border border-gray-200 bg-gray-50 sticky left-0 font-medium">daily sales</td>
                            {metrics.dailySales.map((val, idx) => <td key={idx} className="p-2 border border-gray-200">{val}</td>)}
                            <td className="p-2 border border-gray-200"></td>
                            <td className="p-2 border border-gray-200"></td>
                        </tr>
                        <tr className="bg-white hover:bg-gray-50">
                            <td className="p-2 text-left border border-gray-200 bg-gray-50 sticky left-0 font-medium">monthly sales</td>
                            {metrics.monthlySales.map((val, idx) => <td key={idx} className="p-2 border border-gray-200">{val}</td>)}
                            <td className="p-2 border border-gray-200"></td>
                            <td className="p-2 border border-gray-200"></td>
                        </tr>
                        <tr className="bg-green-100 hover:bg-green-200 text-green-900">
                            <td className="p-2 text-left border border-green-200 sticky left-0 bg-green-100 font-medium">Sales commission per order</td>
                            {metrics.commissionPerOrder.map((val, idx) => <td key={idx} className="p-2 border border-green-200">{val}</td>)}
                            <td className="p-2 border border-green-200"></td>
                            <td className="p-2 border border-green-200"></td>
                        </tr>
                        <tr className="bg-green-100 hover:bg-green-200 text-green-900">
                            <td className="p-2 text-left border border-green-200 sticky left-0 bg-green-100 font-medium">Avg gross profit/delivery revenue</td>
                            {metrics.avgGrossProfit.map((val, idx) => <td key={idx} className="p-2 border border-green-200">{val}</td>)}
                            <td className="p-2 border border-green-200"></td>
                            <td className="p-2 border border-green-200"></td>
                        </tr>
                        <tr className="bg-white hover:bg-gray-50">
                            <td className="p-2 text-left border border-gray-200 bg-gray-50 sticky left-0 font-medium">Avg marketing cost</td>
                            {metrics.avgMarketingCost.map((val, idx) => <td key={idx} className="p-2 border border-gray-200">{val}</td>)}
                            <td className="p-2 border border-gray-200"></td>
                            <td className="p-2 border border-gray-200"></td>
                        </tr>
                        <tr className="bg-white hover:bg-gray-50">
                            <td className="p-2 text-left border border-gray-200 bg-gray-50 sticky left-0 font-medium">other cost</td>
                            {metrics.otherCost.map((val, idx) => <td key={idx} className="p-2 border border-gray-200">{val}</td>)}
                            <td className="p-2 border border-gray-200"></td>
                            <td className="p-2 border border-gray-200"></td>
                        </tr>
                        <tr className="bg-white hover:bg-gray-50">
                            <td className="p-2 text-left border border-gray-200 bg-gray-50 sticky left-0 font-medium">product testing</td>
                            {Array(12).fill(0).map((val, idx) => <td key={idx} className="p-2 border border-gray-200">{val}</td>)}
                            <td className="p-2 border border-gray-200"></td>
                            <td className="p-2 border border-gray-200"></td>
                        </tr>
                        <tr className="bg-green-100 hover:bg-green-200 text-green-900 font-bold">
                            <td className="p-2 text-left border border-green-200 sticky left-0 bg-green-100">net profit</td>
                            {netProfit.map((val, idx) => <td key={idx} className={`p-2 border border-green-200 ${val < 0 ? 'text-red-600' : ''}`}>{fm(val)}</td>)}
                            <td className="p-2 border border-green-200"></td>
                            <td className="p-2 border border-green-200"></td>
                        </tr>
                        <tr className="bg-red-50 hover:bg-red-100">
                            <td className="p-2 text-left border border-red-200 sticky left-0 bg-red-50 font-medium">net profit per sales</td>
                            {metrics.netProfitPerSales.map((val, idx) => <td key={idx} className={`p-2 border border-red-200 ${val < 0 ? 'text-red-600' : ''}`}>{val}</td>)}
                            <td className="p-2 border border-red-200"></td>
                            <td className="p-2 border border-red-200"></td>
                        </tr>

                        {/* Spacer */}
                        <tr className="h-4 bg-white"><td colSpan={15}></td></tr>

                        {/* --- TOTAL COST ROW --- */}
                        <tr className="bg-red-200 font-bold text-red-900">
                            <td className="p-2 text-left border border-red-300 sticky left-0 bg-red-200">total cost</td>
                            {totalOpEx.map((val, idx) => (
                                <td key={idx} className="p-2 border border-red-300">{fm(val)}</td>
                            ))}
                            <td className="p-2 border border-red-300"></td>
                            <td className="p-2 border border-red-300"></td>
                        </tr>
                        
                        {/* --- FOOTER SUMMARY --- */}
                        <tr className="h-8 bg-white"><td colSpan={15}></td></tr>
                        <tr className="bg-yellow-100 font-bold text-gray-800">
                            <td className="p-3 text-left border border-yellow-200 sticky left-0 bg-yellow-100">1 year total revenue</td>
                            <td colSpan={2} className="p-3 text-left text-green-600 border border-yellow-200">{fm(totals.totalRevenueYear)}</td>
                            <td colSpan={12}></td>
                        </tr>
                        <tr className="bg-red-100 font-bold text-gray-800">
                            <td className="p-3 text-left border border-red-200 sticky left-0 bg-red-100">1 year total cost</td>
                            <td colSpan={2} className="p-3 text-left text-red-600 border border-red-200">{fm(totals.totalCostYear)}</td>
                            <td colSpan={12}></td>
                        </tr>
                        <tr><td colSpan={3} className="border-b-2 border-dashed border-black"></td><td colSpan={12}></td></tr>
                        <tr className="bg-green-100 font-bold text-gray-800">
                            <td className="p-3 text-left border border-green-200 sticky left-0 bg-orange-200">Difference</td>
                            <td colSpan={2} className={`p-3 text-left border border-green-200 bg-green-100 ${totals.difference >= 0 ? 'text-green-700' : 'text-red-700'}`}>{fm(totals.difference)}</td>
                            <td colSpan={12}></td>
                        </tr>

                    </tbody>
                </table>
            </div>

            {isModalOpen && <AddExpenseModal onClose={() => setIsModalOpen(false)} onSave={handleAddExpense} />}
        </div>
    );
};

export default FinancePage;
