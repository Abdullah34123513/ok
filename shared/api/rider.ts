import type { Order, Rider, LocationPoint, RiderStats } from '../types';
import { simulateDelay } from './utils';
import { mockOrders, mockRiders } from './mockData';

// --- RIDER-SPECIFIC APIS ---

export const loginRider = async (phone: string): Promise<Rider | undefined> => {
    await simulateDelay(500);
    return mockRiders.find(r => r.phone === phone);
};

export const updateRiderLocation = async (riderId: string, location: LocationPoint): Promise<void> => {
    // No delay needed for this as it's a background task.
    const rider = mockRiders.find(r => r.id === riderId);
    if (rider) {
        rider.location = location;
        // Also update the location on any ongoing orders for this rider for consistency
        mockOrders.forEach(order => {
            if (order.riderId === riderId && order.rider) {
                order.rider.location = location;
            }
        });
    }
    return Promise.resolve();
};

const getActiveOrdersForRider = (riderId: string): Order[] => {
    const ongoingStatuses: Order['status'][] = ['Preparing', 'On its way'];
    return mockOrders.filter(o => o.riderId === riderId && ongoingStatuses.includes(o.status));
};

export const getRiderNewOrders = async (riderId: string): Promise<Order[]> => {
    await simulateDelay(700);
    const activeOrders = getActiveOrdersForRider(riderId);
    if (activeOrders.length >= 2) {
        return []; // Rider is at capacity
    }
    // Find orders that are 'On its way' (meaning "Ready for Pickup") but have no rider assigned yet.
    return mockOrders.filter(o => o.status === 'On its way' && !o.riderId);
};

export const acceptRiderOrder = async (orderId: string, riderId: string): Promise<Order> => {
    await simulateDelay(400);
    const activeOrders = getActiveOrdersForRider(riderId);
    if (activeOrders.length >= 2) {
        throw new Error("Cannot accept more than two orders at a time.");
    }

    const orderIndex = mockOrders.findIndex(o => o.id === orderId);
    if (orderIndex === -1) throw new Error("Order not found");
    
    const order = mockOrders[orderIndex];
    if (order.riderId) throw new Error("Order already taken");

    const rider = mockRiders.find(r => r.id === riderId);
    if (!rider) throw new Error("Rider not found");

    order.riderId = riderId;
    // From a rider's perspective, 'Preparing' means "go to restaurant for pickup".
    // This is a bit confusing because from a vendor's perspective, 'Preparing' means cooking.
    // We'll keep the status as is for now, but in a real system these states would be more granular.
    // Let's assume the vendor sets it to 'On its way' when ready, and the rider accepting it changes nothing.
    // But when the rider picks it up, they change it. Let's adjust the logic.
    // When a vendor marks 'On its way', it becomes an open job. A rider accepts it. Status is still 'On its way'.
    // The rider's first action is to pick up. When they do, nothing changes for the customer.
    // But when they confirm pickup, the status for the RIDER should change.
    // Let's adjust the logic. A rider accepts an 'On its way' order. It's now assigned to them.
    // The rider then picks it up and marks it as picked up. The status for the customer remains 'On its way'.
    // The rider then delivers it and marks it 'Delivered'.
    // So, we'll assign the rider and keep the status.
    order.status = 'On its way';
    order.rider = rider;

    return { ...order };
};

export const getRiderOngoingOrders = async (riderId: string): Promise<Order[]> => {
    await simulateDelay(600);
    return getActiveOrdersForRider(riderId)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const getRiderOrderHistory = async (riderId: string): Promise<Order[]> => {
    await simulateDelay(800);
    const pastStatuses: Order['status'][] = ['Delivered', 'Cancelled'];
    return mockOrders
        .filter(o => o.riderId === riderId && pastStatuses.includes(o.status))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};


export const getNewOrderOpportunities = async (riderId: string): Promise<Order[]> => {
    await simulateDelay(800);
    const activeOrders = getActiveOrdersForRider(riderId);
    if (activeOrders.length >= 2) {
        return [];
    }

    const rider = mockRiders.find(r => r.id === riderId);
    if (!rider) return [];

    const availableOrder = mockOrders.find(o => o.status === 'On its way' && !o.riderId);
    return availableOrder ? [availableOrder] : [];
};

export const getRiderStats = async (riderId: string): Promise<RiderStats> => {
    await simulateDelay(500);
    const rider = mockRiders.find(r => r.id === riderId);
    if (!rider) throw new Error("Rider not found");

    const today = new Date().toLocaleDateString();
    const completedOrdersToday = mockOrders.filter(o => 
        o.riderId === riderId && 
        o.status === 'Delivered' && 
        new Date(o.date).toLocaleDateString() === today
    );

    const earnings = completedOrdersToday.reduce((sum, order) => sum + order.deliveryFee, 0);

    return {
        todayEarnings: earnings,
        completedTrips: completedOrdersToday.length,
        rating: rider.rating,
        onlineHours: 5.5 // Mock value
    };
};