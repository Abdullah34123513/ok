
import { simulateDelay } from './utils';
import { mockRiders, mockOrders, allMockRestaurants, mockUsers, mockVendors, mockModerators, mockAdmins, mockUserPasswords, mockExpenses } from './mockData';
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

export const getExpenses = async (): Promise<Expense[]> => {
    await simulateDelay(400);
    return [...mockExpenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const getFinancialSpreadsheetData = async (year: number): Promise<FinancialSpreadsheetData> => {
    await simulateDelay(1000); // Simulate heavier calculation
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthsFull = months.map(m => `${m}-${year.toString().slice(-2)}`); // e.g., "Jan-26"
    
    const expenseCategories: ExpenseCategory[] = [
        'Bike Purchase', 'Office Rent', 'Employee 1', 'Employee 2', 
        'Per Order Commission', 'Other Cost', 'Trade Licence', 
        'Hosting', 'Google API', 'Firebase', 'Rider Uniform', 'Marketing', 'Product Testing'
    ];

    // Initialize data structures
    const expenses: Record<ExpenseCategory, number[]> = {} as any;
    expenseCategories.forEach(cat => expenses[cat] = new Array(12).fill(0));
    
    const totalOpEx = new Array(12).fill(0);
    const netProfit = new Array(12).fill(0);
    
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
            if (expenses[e.category]) {
                expenses[e.category][monthIdx] += e.amount;
            }
        }
    });

    // 2. Calculate OpEx per month
    for (let i = 0; i < 12; i++) {
        let monthlySum = 0;
        expenseCategories.forEach(cat => {
            monthlySum += expenses[cat][i];
        });
        totalOpEx[i] = monthlySum;
    }

    // 3. Calculate Revenue & Profit Logic
    // Since mock orders are sparse, we'll simulate volume based on month index to create a realistic trend
    for (let i = 0; i < 12; i++) {
        // Simulate varying order volume increasing over the year
        const baseVolume = 150 + (i * 50); 
        const orderCount = Math.floor(baseVolume * (0.9 + Math.random() * 0.2)); // +/- 10% variance
        
        // Simulate Revenue components
        const avgOrderValue = 1200; // avg basket size
        const avgDeliveryFee = 60;
        const avgCommissionRate = 0.15; // 15% platform commission

        const totalSalesVolume = orderCount * avgOrderValue; // GMV
        const totalCommissionRevenue = totalSalesVolume * avgCommissionRate;
        const totalDeliveryRevenue = orderCount * avgDeliveryFee;
        
        const grossPlatformRevenue = totalCommissionRevenue + totalDeliveryRevenue;

        // Populate Metrics
        metrics.monthlySales[i] = orderCount;
        metrics.dailySales[i] = Math.round(orderCount / 30);
        
        // "Sales commission per order": Total Commission / Orders
        metrics.commissionPerOrder[i] = orderCount > 0 ? Math.round(totalCommissionRevenue / orderCount) : 0;
        
        // "Avg gross profit/delivery revenue": Total Revenue / Orders
        metrics.avgGrossProfit[i] = orderCount > 0 ? Math.round(grossPlatformRevenue / orderCount) : 0;
        
        // "Avg marketing cost": Marketing Spend / Orders
        const marketingSpend = expenses['Marketing'][i];
        metrics.avgMarketingCost[i] = orderCount > 0 ? Math.round(marketingSpend / orderCount) : 0;
        
        metrics.otherCost[i] = expenses['Other Cost'][i];

        // Net Profit = Gross Revenue - OpEx
        const monthlyNetProfit = grossPlatformRevenue - totalOpEx[i];
        netProfit[i] = monthlyNetProfit;

        // "net profit per sales": Net Profit / Order Count
        metrics.netProfitPerSales[i] = orderCount > 0 ? Math.round(monthlyNetProfit / orderCount) : 0;
    }

    // 4. Totals
    const totalOpExYear = totalOpEx.reduce((a, b) => a + b, 0);
    const totalRevenueYear = metrics.monthlySales.reduce((sum, count, idx) => {
        // Re-calculate revenue from metrics for consistency
        return sum + (metrics.avgGrossProfit[idx] * count);
    }, 0);
    
    const totalCostYear = totalOpExYear; // Assuming Cost = OpEx for this spreadsheet model
    const difference = totalRevenueYear - totalCostYear;

    return {
        months: monthsFull,
        expenses,
        totalOpEx,
        netProfit,
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
