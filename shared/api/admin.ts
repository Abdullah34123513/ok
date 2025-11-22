
import { simulateDelay } from './utils';
import { mockRiders, mockOrders, allMockRestaurants, mockUsers, mockVendors, mockModerators, mockAdmins, mockUserPasswords } from './mockData';
import type { AdminDashboardSummary, Moderator, User } from '../types';

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

export const getFinancialStats = async (): Promise<{ date: string, revenue: number, profit: number }[]> => {
    await simulateDelay(700);
    // Mock last 7 days data
    const data = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const dateStr = d.toLocaleDateString();
        // Randomize revenue a bit based on a base
        const baseRevenue = 1500 + (Math.random() * 1000); 
        data.push({
            date: dateStr,
            revenue: parseFloat(baseRevenue.toFixed(2)),
            profit: parseFloat((baseRevenue * 0.2).toFixed(2)) // 20% profit margin
        });
    }
    return data;
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
