import { simulateDelay } from './utils';
import { mockRiders, mockOrders, allMockRestaurants, mockSupportTickets, mockUsers, mockVendors, mockModerators } from './mockData';
import type { ModeratorDashboardSummary, Restaurant, SupportTicket, Rider, User, Vendor } from '../types';

export const getModeratorDashboardSummary = async (): Promise<ModeratorDashboardSummary> => {
    await simulateDelay(600);

    const today = new Date();
    
    const newOrdersToday = mockOrders.filter(o => {
        try {
            // This is a rough check for mock data with inconsistent date formats
            return new Date(o.date).toDateString() === today.toDateString();
        } catch {
            return false;
        }
    }).length;

    return {
        activeRiders: mockRiders.filter(r => r.isOnline).length,
        newOrdersToday: newOrdersToday || 5, // Fallback for inconsistent mock dates
        ongoingOrders: mockOrders.filter(o => ['Placed', 'Preparing', 'On its way'].includes(o.status)).length,
        completedOrders: mockOrders.filter(o => o.status === 'Delivered').length,
        cancelledOrders: mockOrders.filter(o => o.status === 'Cancelled').length,
        openSupportTickets: mockSupportTickets.filter(t => t.status !== 'Closed').length,
    };
};

export const getTopVendorsForModerator = async (): Promise<Pick<Restaurant, 'id' | 'name' | 'rating' | 'logoUrl'>[]> => {
    await simulateDelay(500);
    return [...allMockRestaurants]
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 5)
        .map(({ id, name, rating, logoUrl }) => ({ id, name, rating, logoUrl }));
};

export const getOpenSupportTickets = async (): Promise<SupportTicket[]> => {
    await simulateDelay(400);
    return mockSupportTickets.filter(t => t.status !== 'Closed');
};

export const getActiveRidersForMap = async (): Promise<Pick<Rider, 'id' | 'name' | 'location'>[]> => {
    await simulateDelay(200);
    return mockRiders
        .filter(r => r.isOnline)
        .map(({ id, name, location }) => ({ id, name, location }));
};

export const getAllUsersForModerator = async (): Promise<(User & { role: string })[]> => {
    await simulateDelay(700);
    // Add roles to users for the management page
    return mockUsers.map(user => {
        let role = 'Customer';
        if (mockVendors.some(v => v.email === user.email)) role = 'Vendor';
        if (mockModerators.some(m => m.email === user.email)) role = 'Moderator';
        return { ...user, role };
    });
};

export const getAllVendors = async (): Promise<(Vendor & { restaurantName: string })[]> => {
    await simulateDelay(500);
    return mockVendors.map(v => {
        const restaurant = allMockRestaurants.find(r => r.id === v.restaurantId);
        return {
            ...v,
            restaurantName: restaurant?.name || 'N/A'
        };
    });
};

export const getVendorDetailsForModerator = async (vendorId: string): Promise<{vendor: Vendor, restaurant: Restaurant} | null> => {
    await simulateDelay(400);
    const vendor = mockVendors.find(v => v.id === vendorId);
    if (!vendor) return null;
    const restaurant = allMockRestaurants.find(r => r.id === vendor.restaurantId);
    if (!restaurant) return null;
    return { vendor: { ...vendor }, restaurant: { ...restaurant } };
};

export const updateVendorStatus = async (vendorId: string, status: 'active' | 'disabled' | 'pending'): Promise<Vendor> => {
    await simulateDelay(400);
    const vendorIndex = mockVendors.findIndex(v => v.id === vendorId);
    if (vendorIndex === -1) throw new Error('Vendor not found');
    mockVendors[vendorIndex].status = status;
    return { ...mockVendors[vendorIndex] };
};
