
import { simulateDelay } from './utils';
import { mockRiders, mockOrders, allMockRestaurants, mockUsers, mockVendors, mockModerators, mockAdmins, mockUserPasswords, mockExpenses } from './mockData';
import type { AdminDashboardSummary, Moderator, User, Expense, MonthlyFinancialReport, ExpenseCategory } from '../types';

export const getAdminDashboardSummary = async (): Promise<AdminDashboardSummary> => {
    await simulateDelay(600);
    
    const totalRevenue = mockOrders.reduce((acc, order) => acc + order.total, 0);
    // Assuming a flat 15% commission on subtotal + delivery fee for profit calculation
    const netProfit = mockOrders.reduce((acc, order) => acc + (order.subtotal * 0.15) + (order.deliveryFee * 0.2), 0);

    return {
        totalRevenue,
        netProfit,
        totalOrders: mockOrders.length,
        activeUsers: mockUsers.length,
        activeVendors: mockVendors.filter(v => v.status === 'active').length,
        activeRiders: mockRiders.filter(r => r.isOnline).length,
    };
};

export const getAllModerators = async (): Promise<Moderator[]> => {
    await simulateDelay(400);
    return mockModerators;
};

export const createModerator = async (name: string, email: string, password: string): Promise<Moderator> => {
    await simulateDelay(800);
    if (mockModerators.some(m => m.email === email)) {
        throw new Error("Moderator with this email already exists.");
    }
    const newMod: Moderator = {
        id: `mod-${Date.now()}`,
        name,
        email,
        permissions: ['manage_users', 'review_content']
    };
    mockModerators.push(newMod);
    mockUsers.push({ name, email, phone: '555-MOD' });
    mockUserPasswords.set(email, password);
    return newMod;
};

export const deleteModerator = async (modId: string): Promise<void> => {
    await simulateDelay(500);
    const index = mockModerators.findIndex(m => m.id === modId);
    if (index > -1) {
        // Also remove from users list
        const email = mockModerators[index].email;
        const userIndex = mockUsers.findIndex(u => u.email === email);
        if (userIndex > -1) mockUsers.splice(userIndex, 1);
        mockModerators.splice(index, 1);
    }
};

// --- Financial API ---

export const addExpense = async (expense: Omit<Expense, 'id'>): Promise<Expense> => {
    await simulateDelay(500);
    const newExpense: Expense = {
        ...expense,
        id: `exp-${Date.now()}`,
    };
    mockExpenses.unshift(newExpense); // Add to top
    return newExpense;
};

export const getExpenses = async (): Promise<Expense[]> => {
    await simulateDelay(400);
    return [...mockExpenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const getYearlyFinancialReport = async (year: number): Promise<MonthlyFinancialReport[]> => {
    await simulateDelay(800);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    return months.map((monthName, index) => {
        // 1. Calculate Real Expenses from mockExpenses
        const monthlyExpenses = mockExpenses.filter(e => {
            const d = new Date(e.date);
            return d.getFullYear() === year && d.getMonth() === index;
        });
        
        const totalExpense = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0);
        
        const expenseBreakdown: Record<ExpenseCategory, number> = {
            'Rider Salary': 0, 'Hosting Cost': 0, 'Marketing': 0, 'Office Supplies': 0, 'Maintenance': 0, 'Other': 0
        };
        monthlyExpenses.forEach(e => {
            if (expenseBreakdown[e.category] !== undefined) {
                expenseBreakdown[e.category] += e.amount;
            }
        });

        // 2. Calculate Real Revenue from mockOrders (limited data usually, so we might simulate past months)
        // For current month and last month, try to use real data. For older months, simulate consistent revenue.
        let totalRevenue = 0;
        const monthlyOrders = mockOrders.filter(o => {
            const d = new Date(o.date);
            return d.getFullYear() === year && d.getMonth() === index;
        });

        if (monthlyOrders.length > 0) {
            totalRevenue = monthlyOrders.reduce((sum, o) => sum + o.total, 0);
        } else if (year === new Date().getFullYear() && index <= new Date().getMonth()) {
            // Simulate revenue for past months without mock order data
            totalRevenue = 15000 + Math.random() * 5000; 
        }

        return {
            month: `${monthName} ${year}`,
            year,
            monthIndex: index,
            revenue: totalRevenue,
            expenses: totalExpense,
            profit: totalRevenue - totalExpense,
            expenseBreakdown
        };
    });
};

export const getAllSystemUsers = async (): Promise<{name: string, email: string, role: string}[]> => {
    await simulateDelay(800);
    const allUsers = mockUsers.map(u => {
        let role = 'Customer';
        if (mockVendors.some(v => v.email === u.email)) role = 'Vendor';
        if (mockRiders.some(r => r.phone === u.phone)) role = 'Rider';
        if (mockModerators.some(m => m.email === u.email)) role = 'Moderator';
        if (mockAdmins.some(a => a.email === u.email)) role = 'Super Admin';
        return { name: u.name, email: u.email, role };
    });
    return allUsers;
}
