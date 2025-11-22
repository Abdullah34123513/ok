
import React, { useState } from 'react';
import type { Expense, ExpenseCategory } from '@shared/types';

interface AddExpenseModalProps {
    onClose: () => void;
    onSave: (expense: Omit<Expense, 'id'>) => Promise<void>;
}

const AddExpenseModal: React.FC<AddExpenseModalProps> = ({ onClose, onSave }) => {
    const [category, setCategory] = useState<ExpenseCategory>('Other');
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [description, setDescription] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const categories: ExpenseCategory[] = ['Rider Salary', 'Hosting Cost', 'Marketing', 'Office Supplies', 'Maintenance', 'Other'];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || !date || !description) return;

        setIsSaving(true);
        await onSave({
            category,
            amount: parseFloat(amount),
            date: new Date(date).toISOString(),
            description
        });
        setIsSaving(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-md relative animate-fade-in-up">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Add New Expense</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <select 
                            value={category} 
                            onChange={e => setCategory(e.target.value as ExpenseCategory)}
                            className="w-full border border-gray-300 rounded p-2 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Amount (৳)</label>
                        <input 
                            type="number" 
                            value={amount} 
                            onChange={e => setAmount(e.target.value)}
                            className="w-full border border-gray-300 rounded p-2 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="0.00"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                        <input 
                            type="date" 
                            value={date} 
                            onChange={e => setDate(e.target.value)}
                            className="w-full border border-gray-300 rounded p-2 focus:ring-indigo-500 focus:border-indigo-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea 
                            value={description} 
                            onChange={e => setDescription(e.target.value)}
                            className="w-full border border-gray-300 rounded p-2 focus:ring-indigo-500 focus:border-indigo-500"
                            rows={3}
                            placeholder="Brief description of the expense..."
                            required
                        />
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                        <button 
                            type="button" 
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            disabled={isSaving}
                            className="px-4 py-2 bg-indigo-600 text-white font-bold rounded hover:bg-indigo-700 disabled:bg-indigo-300"
                        >
                            {isSaving ? 'Saving...' : 'Save Expense'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddExpenseModal;
