
import { simulateDelay } from './utils';
import { mockRiders, mockOrders, allMockRestaurants, mockSupportTickets, mockUsers, mockVendors, mockModerators, mockAreas, mockAddresses, mockUserPasswords } from './mockData';
import type { ModeratorDashboardSummary, Restaurant, SupportTicket, Rider, User, Vendor, Order, Area, SystemAlert, Address, LocationPoint, OperatingHours } from '../types';

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

export const getAllRiders = async (): Promise<(Rider & { areaName?: string })[]> => {
    await simulateDelay(500);
    return mockRiders.map(rider => {
        const area = mockAreas.find(a => a.id === rider.areaId);
        return { ...rider, areaName: area?.name };
    });
};

export const getAllVendors = async (): Promise<(Vendor & { restaurantName: string, areaName?: string })[]> => {
    await simulateDelay(500);
    return mockVendors.map(v => {
        const restaurant = allMockRestaurants.find(r => r.id === v.restaurantId);
        const area = mockAreas.find(a => a.id === v.areaId);
        return {
            ...v,
            restaurantName: restaurant?.name || 'N/A',
            areaName: area?.name,
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

export const createVendor = async (
    vendorName: string, 
    email: string, 
    restaurantName: string, 
    cuisine: string, 
    address: string, 
    areaId: string,
    location: LocationPoint
): Promise<Vendor> => {
    await simulateDelay(1000);
    
    if (mockVendors.some(v => v.email === email)) {
        throw new Error("Vendor with this email already exists");
    }

    // 1. Create Restaurant
    const newRestaurant: Restaurant = {
        id: `restaurant-${Date.now()}`,
        type: 'RESTAURANT',
        name: restaurantName,
        cuisine,
        address,
        areaId,
        location,
        rating: 0,
        deliveryFee: 5.00,
        deliveryTime: '30-40 min',
        logoUrl: 'https://via.placeholder.com/100',
        coverImageUrl: 'https://via.placeholder.com/1200x400',
        operatingHours: {
            monday: { isOpen: true, slots: [{ open: '09:00', close: '21:00' }] },
            tuesday: { isOpen: true, slots: [{ open: '09:00', close: '21:00' }] },
            wednesday: { isOpen: true, slots: [{ open: '09:00', close: '21:00' }] },
            thursday: { isOpen: true, slots: [{ open: '09:00', close: '21:00' }] },
            friday: { isOpen: true, slots: [{ open: '09:00', close: '22:00' }] },
            saturday: { isOpen: true, slots: [{ open: '10:00', close: '22:00' }] },
            sunday: { isOpen: false, slots: [] },
        }
    };
    allMockRestaurants.push(newRestaurant);

    // 2. Create Vendor
    const newVendor: Vendor = {
        id: `vendor-${Date.now()}`,
        restaurantId: newRestaurant.id,
        name: vendorName,
        email,
        status: 'active',
        areaId
    };
    mockVendors.push(newVendor);

    // 3. Create Vendor User Login
    mockUsers.push({ name: vendorName, email, phone: '555-0000' });
    mockUserPasswords.set(email, 'password123'); // Default password

    return newVendor;
};

export const updateRestaurantLocation = async (restaurantId: string, location: LocationPoint): Promise<Restaurant> => {
    await simulateDelay(500);
    const restaurant = allMockRestaurants.find(r => r.id === restaurantId);
    if (!restaurant) throw new Error("Restaurant not found");
    
    restaurant.location = location;
    return { ...restaurant };
};

export const getOrdersForVendorByModerator = async (vendorId: string): Promise<Order[]> => {
    await simulateDelay(700);
    const vendor = mockVendors.find(v => v.id === vendorId);
    if (!vendor) throw new Error("Vendor not found");

    return mockOrders.filter(o => 
        o.items.some(i => i.baseItem.restaurantId === vendor.restaurantId)
    );
};

export const getModeratorAllOngoingOrders = async (): Promise<Order[]> => {
    await simulateDelay(800);
    const ongoingStatuses: Order['status'][] = ['Placed', 'Preparing', 'On its way'];
    return mockOrders
        .filter(o => ongoingStatuses.includes(o.status))
        .map(o => ({ 
            ...o, 
            // Ensure mock data has names for display
            customerName: o.customerName || 'Valued Customer',
            rider: o.riderId ? mockRiders.find(r => r.id === o.riderId) : undefined,
         }))
        .sort((a, b) => new Date(b.placedAt || b.date).getTime() - new Date(a.placedAt || a.date).getTime());
};

export const updateOrderStatusByModerator = async (orderId: string, newStatus: Order['status'], note?: string): Promise<Order> => {
    await simulateDelay(400);
    const orderIndex = mockOrders.findIndex(o => o.id === orderId);
    if (orderIndex === -1) {
      throw new Error("Order not found");
    }
    const order = mockOrders[orderIndex];
    order.status = newStatus;
    
    if (note) {
        order.moderatorNote = note;
    }

    if (newStatus === 'Preparing' && !order.acceptedAt) {
        order.acceptedAt = new Date().toISOString();
    }
    
    return { ...order };
};

export const getAreas = async (): Promise<Area[]> => {
    await simulateDelay(300);
    return mockAreas;
};

export const getSystemAlerts = async (): Promise<SystemAlert[]> => {
    await simulateDelay(600);
    const alerts: SystemAlert[] = [];

    // 1. Scan Vendors for Low Ratings
    allMockRestaurants.forEach(restaurant => {
        if (restaurant.rating < 3.5) {
            alerts.push({
                id: `alert-vendor-${restaurant.id}`,
                type: 'vendor_rating',
                severity: 'high',
                title: 'Low Vendor Rating',
                message: `${restaurant.name} has a critically low rating of ${restaurant.rating}. Investigate quality issues.`,
                entityId: restaurant.id,
                timestamp: new Date().toISOString(),
            });
        }
    });

    // 2. Scan Riders for Conduct (Cancellations & Offline)
    mockRiders.forEach(rider => {
        const cancelledCount = mockOrders.filter(o => o.riderId === rider.id && o.status === 'Cancelled').length;
        
        if (cancelledCount > 0 && !rider.isOnline) {
             alerts.push({
                id: `alert-rider-offline-${rider.id}`,
                type: 'rider_conduct',
                severity: 'high',
                title: 'Suspicious Rider Activity',
                message: `${rider.name} went offline after ${cancelledCount} cancelled order(s).`,
                entityId: rider.id,
                timestamp: new Date().toISOString(),
            });
        }

        if (rider.rating < 4.2) {
             alerts.push({
                id: `alert-rider-rating-${rider.id}`,
                type: 'rider_conduct',
                severity: 'medium',
                title: 'Low Rider Rating',
                message: `${rider.name} has a rating of ${rider.rating}. Monitoring recommended.`,
                entityId: rider.id,
                timestamp: new Date().toISOString(),
            });
        }
    });

    return alerts;
};

// --- NEW MANAGEMENT APIS ---

export const createArea = async (name: string, center?: LocationPoint, radius?: number, hasWarehouseAccess?: boolean): Promise<Area> => {
    await simulateDelay(400);
    const newArea: Area = { id: `area-${Date.now()}`, name, center, radius, hasWarehouseAccess };
    mockAreas.push(newArea);
    return newArea;
};

export const updateArea = async (id: string, name: string, center?: LocationPoint, radius?: number, hasWarehouseAccess?: boolean): Promise<Area> => {
    await simulateDelay(400);
    const area = mockAreas.find(a => a.id === id);
    if (!area) throw new Error("Area not found");
    area.name = name;
    area.center = center;
    area.radius = radius;
    area.hasWarehouseAccess = hasWarehouseAccess;
    return area;
};

export const deleteArea = async (id: string): Promise<void> => {
    await simulateDelay(400);
    const index = mockAreas.findIndex(a => a.id === id);
    if (index > -1) {
        mockAreas.splice(index, 1);
    }
};

export const updateRiderArea = async (riderId: string, areaId: string): Promise<void> => {
    await simulateDelay(400);
    const rider = mockRiders.find(r => r.id === riderId);
    if (rider) {
        rider.areaId = areaId;
    }
};

export const updateVendorArea = async (vendorId: string, areaId: string): Promise<void> => {
    await simulateDelay(400);
    const vendor = mockVendors.find(v => v.id === vendorId);
    if (vendor) {
        vendor.areaId = areaId;
        const restaurant = allMockRestaurants.find(r => r.id === vendor.restaurantId);
        if (restaurant) restaurant.areaId = areaId;
    }
};

export const getCustomers = async (): Promise<User[]> => {
    await simulateDelay(500);
    const vendorEmails = new Set(mockVendors.map(v => v.email));
    const modEmails = new Set(mockModerators.map(m => m.email));
    return mockUsers.filter(u => !vendorEmails.has(u.email) && !modEmails.has(u.email));
};

export const getCustomerAddresses = async (userEmail: string): Promise<Address[]> => {
    await simulateDelay(300);
    // In mock, we return all addresses as a demo since they aren't linked by ID in the mock structure
    return mockAddresses;
};

export const deleteCustomerAddress = async (addressId: string): Promise<void> => {
    await simulateDelay(300);
    const index = mockAddresses.findIndex(a => a.id === addressId);
    if(index > -1) mockAddresses.splice(index, 1);
};
