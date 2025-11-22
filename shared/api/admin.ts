
import { simulateDelay } from './utils';
import { mockRiders, mockOrders, allMockRestaurants, mockUsers, mockVendors, mockModerators, mockAdmins, mockUserPasswords, mockExpenses, expenseCategories } from './mockData';
import type { AdminDashboardSummary, Moderator, User, Expense, FinancialSpreadsheetData, ExpenseCategory } from '../types';

export const getAdminDashboardSummary = async (): Promise<AdminDashboardSummary> => {
    await simulateDelay(600);
    
    // Total Gross Merchandise Value (GMV)
    const totalRevenue = mockOrders.reduce((acc, order) => acc + order.total, 0);
    
    // Actual Platform Profit based on variable commissions
    const netProfit = mockOrders.reduce((acc, order) => {
        const vendor = mockVendors.find(v => allMockRestaurants.find(r => r.id === v.restaurantId)?.name === order.restaurantName);
        const commissionRate = (vendor?.commissionRate || 15) / 100; // Default 15% if not found
        
        const vendorCut = order.subtotal * commissionRate;
        // We assume platform keeps delivery fee but pays riders from expenses (salaries), so delivery fee is revenue here.
        const deliveryRevenue = order.deliveryFee; 
        return acc + vendorCut + deliveryRevenue;
    }, 0);

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
    mockExpenses.unshift(newExpense);
    return newExpense;
};

export const addExpenseCategory = async (categoryName: string): Promise<void> => {
    await simulateDelay(300);
    if (!expenseCategories.includes(categoryName)) {
        expenseCategories.push(categoryName);
    }
}

export const removeExpenseCategory = async (categoryName: string, year: number): Promise<FinancialSpreadsheetData> => {
    await simulateDelay(300);
    const index = expenseCategories.indexOf(categoryName);
    if (index > -1) {
        expenseCategories.splice(index, 1);
    }
    return getFinancialSpreadsheetData(year);
};

export const updateMonthlyExpense = async (category: string, year: number, monthIndex: number, amount: number): Promise<FinancialSpreadsheetData> => {
    await simulateDelay(300);
    
    // Find existing expense for this category/month/year
    // For the spreadsheet logic, we assume we are updating the sum of that month. 
    // Since our mock data might have multiple entries, we will wipe them for that month and create a single new entry to represent the edited value.
    // This is a simplification for the spreadsheet "edit cell" interaction.
    
    // 1. Remove existing expenses for this cell
    for (let i = mockExpenses.length - 1; i >= 0; i--) {
        const e = mockExpenses[i];
        const d = new Date(e.date);
        if (e.category === category && d.getFullYear() === year && d.getMonth() === monthIndex) {
            mockExpenses.splice(i, 1);
        }
    }

    // 2. Add new expense entry if amount > 0
    if (amount > 0) {
        const date = new Date(year, monthIndex, 1); // Set to 1st of month
        mockExpenses.push({
            id: `exp-edit-${Date.now()}`,
            category: category,
            amount: amount,
            date: date.toISOString(),
            description: 'Manual update from spreadsheet'
        });
    }

    // 3. Return full recalculated table
    return getFinancialSpreadsheetData(year);
};

export const getExpenses = async (): Promise<Expense[]> => {
    await simulateDelay(400);
    return [...mockExpenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const getFinancialSpreadsheetData = async (year: number): Promise<FinancialSpreadsheetData> => {
    await simulateDelay(600); 
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthsFull = months.map(m => `${m}-${year.toString().slice(-2)}`); // e.g., "Jan-26"
    
    // Initialize data structures
    const expenses: Record<ExpenseCategory, number[]> = {} as any;
    expenseCategories.forEach(cat => expenses[cat] = new Array(12).fill(0));
    
    const totalOpEx = new Array(12).fill(0);
    const netProfit = new Array(12).fill(0);
    
    // Detailed Revenue Arrays
    const revenueSources = {
        commissions: new Array(12).fill(0),
        deliveryFees: new Array(12).fill(0),
        ads: new Array(12).fill(0)
    };

    // Detailed Expense Arrays (Aggregation)
    const expenseBreakdown = {
        operations: new Array(12).fill(0),
        marketing: new Array(12).fill(0),
        technology: new Array(12).fill(0),
    };
    
    const metrics = {
        dailySales: new Array(12).fill(0),
        monthlySales: new Array(12).fill(0),
        commissionPerOrder: new Array(12).fill(0),
        avgGrossProfit: new Array(12).fill(0),
        avgMarketingCost: new Array(12).fill(0),
        otherCost: new Array(12).fill(0),
        netProfitPerSales: new Array(12).fill(0)
    };

    // 1. Process Expenses
    mockExpenses.forEach(e => {
        const d = new Date(e.date);
        if (d.getFullYear() === year) {
            const monthIdx = d.getMonth();
            // Ensure category exists
            if (!expenses[e.category]) {
                expenses[e.category] = new Array(12).fill(0);
                if (!expenseCategories.includes(e.category)) expenseCategories.push(e.category);
            }
            expenses[e.category][monthIdx] += e.amount;

            // Categorize for breakdown chart
            if (['Marketing', 'Ads', 'Promo'].some(s => e.category.includes(s))) {
                expenseBreakdown.marketing[monthIdx] += e.amount;
            } else if (['Google API', 'Firebase', 'Hosting', 'Server'].some(s => e.category.includes(s))) {
                expenseBreakdown.technology[monthIdx] += e.amount;
            } else {
                expenseBreakdown.operations[monthIdx] += e.amount;
            }
        }
    });

    // 2. Calculate OpEx per month
    for (let i = 0; i < 12; i++) {
        let monthlySum = 0;
        expenseCategories.forEach(cat => {
            if(expenses[cat]) {
                monthlySum += expenses[cat][i];
            }
        });
        totalOpEx[i] = monthlySum;
    }

    // 3. Calculate Detailed Revenue (Simulated with granular logic)
    for (let i = 0; i < 12; i++) {
        // Order Volume Trend
        const baseVolume = 150 + (i * 50); 
        const orderCount = Math.floor(baseVolume * (0.9 + Math.random() * 0.2));
        
        // Averages
        const avgBasket = 1200; // ৳
        const avgCommission = 0.15; // 15%
        const avgDelivery = 60; // ৳
        
        // Revenue Streams
        const monthlyGMV = orderCount * avgBasket;
        const commRev = monthlyGMV * avgCommission;
        const delRev = orderCount * avgDelivery;
        const adRev = i * 2000 + 5000; // Simulated growing ad revenue

        revenueSources.commissions[i] = commRev;
        revenueSources.deliveryFees[i] = delRev;
        revenueSources.ads[i] = adRev;

        const totalMonthlyRevenue = commRev + delRev + adRev;

        // Metrics
        metrics.monthlySales[i] = orderCount;
        metrics.dailySales[i] = Math.round(orderCount / 30);
        metrics.commissionPerOrder[i] = orderCount > 0 ? Math.round(commRev / orderCount) : 0;
        metrics.avgGrossProfit[i] = orderCount > 0 ? Math.round(totalMonthlyRevenue / orderCount) : 0;
        
        const marketingSpend = expenses['Marketing'] ? expenses['Marketing'][i] : 0;
        metrics.avgMarketingCost[i] = orderCount > 0 ? Math.round(marketingSpend / orderCount) : 0;
        metrics.otherCost[i] = expenses['Other Cost'] ? expenses['Other Cost'][i] : 0;

        // Net Profit
        netProfit[i] = totalMonthlyRevenue - totalOpEx[i];
        metrics.netProfitPerSales[i] = orderCount > 0 ? Math.round(netProfit[i] / orderCount) : 0;
    }

    // 4. Totals
    const totalOpExYear = totalOpEx.reduce((a, b) => a + b, 0);
    const totalRevenueYear = revenueSources.commissions.reduce((a,b) => a+b, 0) + 
                             revenueSources.deliveryFees.reduce((a,b) => a+b, 0) + 
                             revenueSources.ads.reduce((a,b) => a+b, 0);
    
    const totalCostYear = totalOpExYear; 
    const difference = totalRevenueYear - totalCostYear;

    return {
        months: monthsFull,
        expenses,
        totalOpEx,
        netProfit,
        revenueSources,
        expenseBreakdown,
        metrics,
        totals: {
            totalOpExYear,
            totalRevenueYear,
            totalCostYear,
            difference
        }
    };
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
