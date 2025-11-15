
import type { Order, Rider, LocationPoint } from '../types';
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

export const getRiderNewOrders = async (): Promise<Order[]> => {
    await simulateDelay(700);
    // Find orders that are 'On its way' but have no rider assigned yet.
    // In our mock data, this status means "Ready for Pickup" from the vendor side.
    return mockOrders.filter(o => o.status === 'On its way' && !o.riderId);
};

export const acceptRiderOrder = async (orderId: string, riderId: string): Promise<Order> => {
    await simulateDelay(400);
    const orderIndex = mockOrders.findIndex(o => o.id === orderId);
    if (orderIndex === -1) throw new Error("Order not found");
    
    const order = mockOrders[orderIndex];
    if (order.riderId) throw new Error("Order already taken");

    const rider = mockRiders.find(r => r.id === riderId);
    if (!rider) throw new Error("Rider not found");

    order.riderId = riderId;
    order.status = 'Preparing'; // Status changes to 'Preparing' from rider's perspective (means "Go to Pickup")
    order.rider = rider;

    return { ...order };
};

export const getRiderOngoingOrders = async (riderId: string): Promise<Order[]> => {
    await simulateDelay(600);
    const ongoingStatuses: Order['status'][] = ['Preparing', 'On its way'];
    return mockOrders
        .filter(o => o.riderId === riderId && ongoingStatuses.includes(o.status))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const getRiderDeliveredOrders = async (riderId: string): Promise<Order[]> => {
    await simulateDelay(600);
    return mockOrders
        .filter(o => o.riderId === riderId && o.status === 'Delivered')
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};