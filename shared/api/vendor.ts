import type { Order, Restaurant, MenuItem, VendorDashboardSummary, CustomizationOption } from '../types';
import { simulateDelay } from './utils';
import { mockVendors, mockOrders, allMockRestaurants, allMockFoods } from './mockData';

// --- VENDOR-SPECIFIC APIS ---

export const getVendorDashboardSummary = async (vendorId: string): Promise<VendorDashboardSummary> => {
    await simulateDelay(600);
    const vendor = mockVendors.find(v => v.id === vendorId);
    if (!vendor) throw new Error("Vendor not found");

    const vendorOrders = mockOrders.filter(o => o.items.some(i => i.baseItem.restaurantId === vendor.restaurantId));
    
    return {
        totalRevenue: vendorOrders.reduce((sum, order) => sum + order.total, 0),
        totalOrders: vendorOrders.length,
        activeOrders: vendorOrders.filter(o => ['Placed', 'Preparing'].includes(o.status)).length,
        averageItemRating: 4.6, // Mocked value
    };
};

export const getVendorOrderCounts = async (vendorId: string): Promise<Record<string, number>> => {
    await simulateDelay(300);
    const vendor = mockVendors.find(v => v.id === vendorId);
    if (!vendor) throw new Error("Vendor not found");

    const counts = {
        'New': 0, // Maps to 'Placed'
        'Preparing': 0,
        'On its way': 0,
        'Delivered': 0,
        'Cancelled': 0,
    };

    mockOrders.forEach(order => {
        if (order.items.some(i => i.baseItem.restaurantId === vendor.restaurantId)) {
            switch (order.status) {
                case 'Placed':
                    counts['New']++;
                    break;
                case 'Preparing':
                    counts['Preparing']++;
                    break;
                case 'On its way':
                    counts['On its way']++;
                    break;
                case 'Delivered':
                    counts['Delivered']++;
                    break;
                case 'Cancelled':
                    counts['Cancelled']++;
                    break;
            }
        }
    });

    return counts;
};


export const getVendorOrders = async (vendorId: string, statuses: Array<Order['status'] | 'New'>): Promise<Order[]> => {
    await simulateDelay(700);
    const vendor = mockVendors.find(v => v.id === vendorId);
    if (!vendor) throw new Error("Vendor not found");

    const statusesToFetch = statuses.map(s => s === 'New' ? 'Placed' : s);

    return mockOrders.filter(o => 
        statusesToFetch.includes(o.status) &&
        o.items.some(i => i.baseItem.restaurantId === vendor.restaurantId)
    ).map(o => ({ ...o, customerName: o.customerName || 'Valued Customer' })); // Add customer name for vendor view
};


export const updateOrderStatus = async (orderId: string, newStatus: Order['status']): Promise<Order> => {
    await simulateDelay(400);
    const orderIndex = mockOrders.findIndex(o => o.id === orderId);
    if (orderIndex === -1) {
      throw new Error("Order not found");
    }
    const order = mockOrders[orderIndex];
    order.status = newStatus;

    if (newStatus === 'Delivered') {
        order.date = new Date().toLocaleString('en-US'); // Update timestamp on delivery
    }
    
    return { ...order };
};

export const updateRestaurantDetails = async (restaurantId: string, details: Partial<Restaurant>): Promise<Restaurant> => {
    await simulateDelay(500);
    const restaurantIndex = allMockRestaurants.findIndex(r => r.id === restaurantId);
    if (restaurantIndex === -1) {
        throw new Error("Restaurant not found");
    }
    allMockRestaurants[restaurantIndex] = { ...allMockRestaurants[restaurantIndex], ...details };
    return allMockRestaurants[restaurantIndex];
};

export const getVendorCategories = async (): Promise<string[]> => {
    await simulateDelay(200);
    // In a real app, this would be a separate table. Here, we derive from existing items.
    const categories = new Set(allMockFoods.map(f => f.category).filter(Boolean) as string[]);
    return ['Main Course', 'Appetizers', 'Desserts', 'Beverages', ...categories];
};

export const uploadImage = async (file: File): Promise<string> => {
    await simulateDelay(1500);
    // In a real app, this would upload to a cloud storage service and return the URL.
    // For this mock, we'll use a FileReader to return a data URL as a placeholder.
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            if (typeof reader.result === 'string') {
                resolve(reader.result);
            } else {
                reject(new Error("Failed to read file."));
            }
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

export const addMenuItem = async (vendorId: string, itemData: any): Promise<MenuItem> => {
    await simulateDelay(800);
    const vendor = mockVendors.find(v => v.id === vendorId);
    if (!vendor) throw new Error("Vendor not found");

    const customizationOptions: CustomizationOption[] = [];
    let basePrice = 0;

    // Handle sizes
    if (itemData.sizes && itemData.sizes.length > 0) {
        // Find the lowest price to use as the base price
        const sortedSizes = [...itemData.sizes].sort((a, b) => a.price - b.price);
        basePrice = sortedSizes[0].price;
        customizationOptions.push({
            id: 'size',
            name: 'Size',
            type: 'SINGLE',
            required: true,
            choices: sortedSizes.map(s => ({
                name: s.name,
                price: s.price - basePrice // Price diff from base
            }))
        });
    } else {
        basePrice = itemData.price;
    }

    // Handle toppings
    if (itemData.toppings && itemData.toppings.length > 0) {
        customizationOptions.push({
            id: 'toppings',
            name: 'Toppings',
            type: 'MULTIPLE',
            required: false,
            choices: itemData.toppings
        });
    }

    const newMenuItem = {
        id: `food-${Date.now()}`,
        name: itemData.name,
        description: itemData.description,
        price: basePrice,
        imageUrl: itemData.imageUrl,
        restaurantId: vendor.restaurantId,
        restaurantName: vendor.name,
        category: itemData.category,
        customizationOptions: customizationOptions.length > 0 ? customizationOptions : undefined,
        availability: itemData.availability,
    };
    
    // Convert back to a Food item to add to our mock DB
    const newFood = {
        ...newMenuItem,
        rating: 0, // New items have no rating
        vendor: { name: vendor.name }
    }

    allMockFoods.unshift(newFood);
    return newMenuItem;
};

export const updateMenuItem = async (vendorId: string, updatedItem: MenuItem): Promise<MenuItem> => {
    await simulateDelay(500);
    const vendor = mockVendors.find(v => v.id === vendorId);
    if (!vendor || updatedItem.restaurantId !== vendor.restaurantId) {
        throw new Error("Authorization error: Cannot edit this item.");
    }
    
    const itemIndex = allMockFoods.findIndex(f => f.id === updatedItem.id);
    if (itemIndex === -1) {
        throw new Error("Menu item not found.");
    }
    
    // Update logic needs to be careful here to merge correctly
    const originalFood = allMockFoods[itemIndex];
    allMockFoods[itemIndex] = {
        ...originalFood, // keep rating, etc.
        ...updatedItem,
        vendor: { name: updatedItem.restaurantName }
    };

    return updatedItem;
};

export const deleteMenuItem = async (vendorId: string, itemId: string): Promise<void> => {
    await simulateDelay(500);
    const vendor = mockVendors.find(v => v.id === vendorId);
    if (!vendor) throw new Error("Authorization error.");

    const itemIndex = allMockFoods.findIndex(f => f.id === itemId);
    if (itemIndex > -1 && allMockFoods[itemIndex].restaurantId === vendor.restaurantId) {
        allMockFoods.splice(itemIndex, 1);
    } else {
        throw new Error("Item not found or permission denied.");
    }
};
