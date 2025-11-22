
import type { Offer, Restaurant, Food, PaginatedFoods, SearchResult, PaginatedRestaurants, MenuCategory, Review, CartItem, MenuItem, Address, Order, AddressSuggestion, AddressDetails, User, LocationPoint, SupportInfo, ChatMessage, OrderReview, SelectedCustomization, Area, FlashSaleCampaign } from '../types';
import { simulateDelay, shuffleArray } from './utils';
import { mockOffers, allMockRestaurants, allMockFoods, mockCart, mockAddresses, mockOrders, allMockReviews, mockChatHistory, mockUsers, mockRiders, mockAreas, mockFlashSale } from './mockData';

export const getAreaForLocation = async (lat: number, _lng: number): Promise<Area> => {
    await simulateDelay(300);
    // Simple mock logic: Downtown for higher latitude, Suburbia otherwise.
    if (lat > 34.055) {
        return mockAreas.find(a => a.name === 'Downtown') || mockAreas[0];
    }
    return mockAreas.find(a => a.name === 'Suburbia') || mockAreas[1];
};

export const getOffers = async (areaId: string): Promise<Offer[]> => {
  await simulateDelay(500);
  const seed = locationHash(areaId);
  return shuffleArray(mockOffers, seed).slice(0, 5);
};

export const getActiveOffers = async (areaId: string): Promise<Offer[]> => {
    await simulateDelay(500);
    const seed = locationHash(areaId);
    const now = new Date();
    const active = mockOffers.filter(o => o.expiry && new Date(o.expiry) > now);
    return shuffleArray(active, seed);
};

export const getOfferDetails = async (offerId: string): Promise<Offer | undefined> => {
    await simulateDelay(400);
    return mockOffers.find(o => o.id === offerId);
};

export const getOffersForRestaurant = async (restaurantId: string): Promise<Offer[]> => {
    await simulateDelay(400);
    const now = new Date();
    // Filter for offers that are either for this specific restaurant or for ALL, and are not expired.
    return mockOffers.filter(o => {
        const isExpired = o.expiry && new Date(o.expiry) < now;
        if (isExpired) return false;
        
        const applicableTo = o.applicableTo;

        if (applicableTo === 'ALL') {
            return true;
        }

        if (applicableTo && typeof applicableTo === 'object' && applicableTo.id === restaurantId) {
            return true;
        }
        return false;
    });
};

export const getFoodsForOffer = async (offerId: string, areaId: string): Promise<Food[]> => {
    await simulateDelay(600);
    const offer = mockOffers.find(o => o.id === offerId);
    if (!offer) return [];

    const applicableTo = offer.applicableTo;

    if (applicableTo === 'ALL') {
        return getFoods(areaId, 1).then(p => p.foods.slice(0, 8));
    }
    if (applicableTo && typeof applicableTo === 'object') {
        return allMockFoods.filter(f => f.restaurantId === applicableTo.id).slice(0, 8);
    }
    if (offer.applicableFoods) {
        return allMockFoods.filter(f => offer.applicableFoods?.includes(f.id));
    }
    return [];
};

export const getTopRestaurants = async (areaId: string): Promise<Restaurant[]> => {
  await simulateDelay(600);
  const seed = locationHash(areaId);
  const areaRestaurants = allMockRestaurants.filter(r => r.areaId === areaId && r.type === 'RESTAURANT');
  return shuffleArray(areaRestaurants, seed).slice(0, 10);
};

// --- New Methods for Grocery & Warehouse ---

export const getStoresByType = async (areaId: string, type: 'GROCERY' | 'WAREHOUSE'): Promise<Restaurant[]> => {
    await simulateDelay(500);
    // Filter by type and optionally area (though for mock we allow some flexibility)
    return allMockRestaurants.filter(r => r.type === type && r.areaId === areaId); 
};

// Deprecated but kept for compatibility if needed, though replaced by getStoresByType
export const getTopGroceryStores = async (areaId: string): Promise<Restaurant[]> => {
    return getStoresByType(areaId, 'GROCERY');
};

export const getGroceryProducts = async (areaId: string): Promise<Food[]> => {
    await simulateDelay(600);
    // Find grocery stores in area (or accessible to area)
    const groceryStoreIds = allMockRestaurants
        .filter(r => r.type === 'GROCERY' && r.areaId === areaId)
        .map(r => r.id);
    
    // Find foods belonging to these stores
    const products = allMockFoods.filter(f => groceryStoreIds.includes(f.restaurantId));
    
    // Duplicate for demo purposes if list is small to show grid effect
    if (products.length < 10 && products.length > 0) {
        return [...products, ...products, ...products].map((p, i) => ({...p, id: `${p.id}-dup-${i}`}));
    }
    
    return products;
};

export const getWarehouseProducts = async (areaId: string): Promise<Food[]> => {
    await simulateDelay(600);
    const area = mockAreas.find(a => a.id === areaId);
    
    // Check if area allows warehouse access
    if (!area || !area.hasWarehouseAccess) {
        return [];
    }

    // Get the warehouse ID (mocking assumption: there is one main warehouse or specific per area)
    const warehouse = allMockRestaurants.find(r => r.type === 'WAREHOUSE');
    if (!warehouse) return [];

    // Return foods belonging to the warehouse
    return allMockFoods.filter(f => f.restaurantId === warehouse.id);
};

// -------------------------------------------

interface RestaurantFilters {
    sortBy?: 'rating' | 'deliveryTime' | 'deliveryFee';
    minRating?: number;
    priceRange?: string; // $, $$, $$$
}

export const getRestaurants = async (
    areaId: string, 
    page: number, 
    limit = 12, 
    filters?: RestaurantFilters
): Promise<PaginatedRestaurants> => {
    await simulateDelay(800);
    
    // Filter for RESTAURANT type specifically for the main listing
    let filtered = allMockRestaurants.filter(r => r.areaId === areaId && r.type === 'RESTAURANT');

    if (filters) {
        if (filters.minRating) {
            filtered = filtered.filter(r => r.rating >= filters.minRating!);
        }
        if (filters.priceRange) {
            // Mock logic: derive price range from delivery fee for demo purposes
            // Low fee = $, High fee = $$$
            filtered = filtered.filter(r => {
                if (filters.priceRange === '$') return r.deliveryFee < 2;
                if (filters.priceRange === '$$') return r.deliveryFee >= 2 && r.deliveryFee < 4;
                if (filters.priceRange === '$$$') return r.deliveryFee >= 4;
                return true;
            });
        }

        if (filters.sortBy) {
            filtered.sort((a, b) => {
                switch(filters.sortBy) {
                    case 'rating':
                        return b.rating - a.rating;
                    case 'deliveryFee':
                        return a.deliveryFee - b.deliveryFee;
                    case 'deliveryTime':
                        // Parse "20-30 min" -> 25
                        const parseTime = (str: string) => {
                            const match = str.match(/\d+/);
                            return match ? parseInt(match[0]) : 999;
                        };
                        return parseTime(a.deliveryTime) - parseTime(b.deliveryTime);
                    default:
                        return 0;
                }
            });
        } else {
             // Default shuffle if no sort
             const seed = locationHash(areaId);
             filtered = shuffleArray(filtered, seed);
        }
    } else {
        const seed = locationHash(areaId);
        filtered = shuffleArray(filtered, seed);
    }

    const start = (page - 1) * limit;
    const end = start + limit;
    const restaurants = filtered.slice(start, end);
    
    return {
        restaurants,
        hasMore: end < filtered.length,
        nextPage: page + 1,
    };
};

export const getFoods = async (areaId: string, page: number, limit = 12, category?: string): Promise<PaginatedFoods> => {
  await simulateDelay(1000);
  const seed = locationHash(areaId + (category || ''));
  
  // Only food from normal restaurants in food feed unless category implies otherwise
  const restaurantsInArea = new Set(allMockRestaurants.filter(r => r.areaId === areaId && r.type === 'RESTAURANT').map(r => r.id));
  
  let areaFoods = allMockFoods.filter(f => restaurantsInArea.has(f.restaurantId));
  
  if (category) {
      const lowerCat = category.toLowerCase();
      areaFoods = allMockFoods.filter(f => {
          // Broad search for category match in item category, name, or description
          return (f.category?.toLowerCase().includes(lowerCat)) || 
                 (f.name.toLowerCase().includes(lowerCat)) || 
                 (f.description.toLowerCase().includes(lowerCat));
      });
  }

  const shuffled = shuffleArray(areaFoods, seed);
  const start = (page - 1) * limit;
  const end = start + limit;
  const foods = shuffled.slice(start, end);
  return {
    foods,
    hasMore: end < shuffled.length,
    nextPage: page + 1,
  };
};

export const search = async (query: string, areaId: string): Promise<SearchResult> => {
    await simulateDelay(500);
    const lowerQuery = query.toLowerCase();
    
    // Allow searching all types in area
    const restaurantsInArea = allMockRestaurants.filter(r => r.areaId === areaId);
    const restaurantsInAreaIds = new Set(restaurantsInArea.map(r => r.id));
    const foodsInArea = allMockFoods.filter(f => restaurantsInAreaIds.has(f.restaurantId));

    const restaurants = restaurantsInArea.filter(r =>
        r.name.toLowerCase().includes(lowerQuery) ||
        r.cuisine.toLowerCase().includes(lowerQuery)
    ).slice(0, 6);

    const foods = foodsInArea.filter(f =>
        f.name.toLowerCase().includes(lowerQuery) ||
        f.vendor.name.toLowerCase().includes(lowerQuery)
    ).slice(0, 8);

    return { restaurants, foods };
};

export const getRestaurantDetails = async (id: string): Promise<Restaurant | undefined> => {
    await simulateDelay(400);
    const restaurant = allMockRestaurants.find(r => r.id === id);
    if (restaurant) {
        // Simulate fetching favorite status
        const favs = JSON.parse(localStorage.getItem('favorite_restaurants') || '[]');
        return { ...restaurant, isFavorite: favs.includes(id) };
    }
    return undefined;
};

export const getRestaurantMenu = async (restaurantId: string): Promise<MenuCategory[]> => {
    await simulateDelay(500);
    const items = allMockFoods
        .filter(f => f.restaurantId === restaurantId)
        .map(food => ({ // Convert Food to MenuItem
            id: food.id,
            name: food.name,
            description: food.description,
            price: food.price,
            imageUrl: food.imageUrl,
            restaurantId: food.restaurantId,
            restaurantName: food.vendor.name,
            customizationOptions: food.customizationOptions,
            isPackage: food.isPackage,
            category: food.category,
            availability: food.availability,
        }));

    // Group items by category
    const categorizedItems = items.reduce<Record<string, MenuItem[]>>((acc, item) => {
        const categoryName = item.category || 'Menu';
        if (!acc[categoryName]) {
            acc[categoryName] = [];
        }
        acc[categoryName].push(item);
        return acc;
    }, {});

    const categories: MenuCategory[] = Object.keys(categorizedItems).map(name => ({
        name,
        items: categorizedItems[name]
    }));
    
    // Fallback if no items have categories
    if (categories.length === 0 && items.length > 0) {
        return [{ name: 'Menu', items }];
    }
    
    return categories;
};

export const getRestaurantReviews = async (restaurantId: string): Promise<Review[]> => {
    await simulateDelay(300);
    const seed = locationHash(restaurantId); // Use restaurant ID for deterministic reviews
    return shuffleArray(allMockReviews, seed).slice(0, 5);
};

export const getFoodDetails = async (id: string): Promise<Food | undefined> => {
    await simulateDelay(400);
    return allMockFoods.find(f => f.id === id);
};

export const getFoodReviews = async (foodId: string): Promise<Review[]> => {
    await simulateDelay(300);
    const seed = locationHash(foodId);
    return shuffleArray(allMockReviews, seed).slice(0, 3);
};

export const getRelatedFoods = async (foodId: string, areaId: string): Promise<Food[]> => {
    await simulateDelay(700);
    const food = allMockFoods.find(f => f.id === foodId);
    if (!food) return [];
    
    const seed = locationHash(areaId);
    const restaurantsInArea = new Set(allMockRestaurants.filter(r => r.areaId === areaId).map(r => r.id));
    const areaFoods = allMockFoods.filter(f => restaurantsInArea.has(f.restaurantId));
    const shuffled = shuffleArray(areaFoods, seed);

    return shuffled.filter(
        f => f.id !== foodId && (f.restaurantId === food.restaurantId)
    ).slice(0, 5);
};


// --- Cart API ---
export const getCart = async (): Promise<CartItem[]> => {
    await simulateDelay(100);
    return [...mockCart];
};

export const addToCart = async (item: MenuItem, quantity: number, customizations: SelectedCustomization[], totalPrice: number): Promise<CartItem[]> => {
    await simulateDelay(200);
    
    const newCartItem: CartItem = {
        cartItemId: `cart-item-${Date.now()}-${Math.random()}`,
        baseItem: item,
        quantity,
        selectedCustomizations: customizations,
        totalPrice: totalPrice * quantity,
    };

    // For simplicity in this mock, we just add it. A real app would check for existing identical items.
    mockCart.push(newCartItem);
    return [...mockCart];
};

export const removeCartItem = async (cartItemId: string): Promise<CartItem[]> => {
    await simulateDelay(150);
    const updatedCart = mockCart.filter(item => item.cartItemId !== cartItemId);
    mockCart.length = 0;
    Array.prototype.push.apply(mockCart, updatedCart);
    return [...mockCart];
};

export const updateCartItemQuantity = async (cartItemId: string, quantity: number): Promise<CartItem[]> => {
    await simulateDelay(150);
    const itemIndex = mockCart.findIndex(item => item.cartItemId === cartItemId);
    if (itemIndex > -1 && quantity > 0) {
        const item = mockCart[itemIndex];
        const pricePerItem = item.totalPrice / item.quantity;
        item.quantity = quantity;
        item.totalPrice = pricePerItem * quantity;
    }
    return [...mockCart];
};


// --- Address & Geocoding ---

export const reverseGeocode = async (_lat: number, _lng: number): Promise<string> => {
    await simulateDelay(500);
    // In a real app, this would call a geocoding API.
    return "Downtown, Food City";
};

export const searchAddresses = async (query: string): Promise<AddressSuggestion[]> => {
    await simulateDelay(300);
    // Mock address suggestions
    return [
        { id: 'place-1', description: `${query}, 123 Main St, Anytown` },
        { id: 'place-2', description: `${query}, 456 Oak Ave, Someville` },
        { id: 'place-3', description: `${query}, 789 Pine Ln, Otherplace` },
    ];
};

export const getAddressDetails = async (_placeId: string): Promise<AddressDetails> => {
    await simulateDelay(400);
    // Mock details for a selected place
    return {
        street: '123 Main St',
        city: 'Anytown',
        postalCode: '12345',
        country: 'USA'
    };
};

export const getAddresses = async (): Promise<Address[]> => {
    await simulateDelay(200);
    return [...mockAddresses];
};

export const addAddress = async (label: string, details: AddressDetails, location?: LocationPoint): Promise<Address[]> => {
    await simulateDelay(500);
    const newAddress: Address = {
        id: `addr-${Date.now()}`,
        label,
        details: `${details.street}, ${details.city}, ${details.postalCode}`,
        location
    };
    mockAddresses.push(newAddress);
    return [...mockAddresses];
};

export const removeAddress = async (id: string): Promise<Address[]> => {
    await simulateDelay(300);
    const updatedAddresses = mockAddresses.filter(a => a.id !== id);
    mockAddresses.length = 0;
    Array.prototype.push.apply(mockAddresses, updatedAddresses);
    return [...mockAddresses];
};

// --- Order API ---
export const createOrder = async (orderData: Omit<Order, 'id' | 'status' | 'restaurantName'| 'date'>): Promise<Order> => {
    await simulateDelay(1000);
    const restaurants = [...new Set(orderData.items.map(item => item.baseItem.restaurantName))];
    const newOrder: Order = {
        id: `ORDER-${Date.now()}`,
        status: 'Placed',
        date: new Date().toLocaleDateString(),
        restaurantName: restaurants.join(', '),
        ...orderData,
        // Mock tracking data
        restaurantLocation: { lat: 34.0522, lng: -118.2437 }, // Downtown LA
        deliveryLocation: orderData.address.location || { lat: 34.0622, lng: -118.2537 }, // Use address location or default
        estimatedDeliveryTime: '8:45 PM',
        rider: {
            name: 'John Rider',
            phone: '555-1234',
            vehicle: 'Honda Activa',
            rating: 4.8,
            location: { lat: 34.0522, lng: -118.2437 }
        },
        isReviewed: false,
        deliveryOtp: Math.floor(1000 + Math.random() * 9000).toString(), // Generate 4-digit OTP
    };
    mockOrders.unshift(newOrder); // Add to the beginning of the list
    mockCart.length = 0; // Clear the cart after order
    return newOrder;
};

export const getOrderDetails = async (orderId: string): Promise<Order | undefined> => {
    await simulateDelay(500);
    return mockOrders.find(o => o.id === orderId);
};

export const getRiderLocation = async (orderId: string): Promise<LocationPoint | null> => {
    await simulateDelay(200);
    const order = mockOrders.find(o => o.id === orderId);
    if (!order || !order.riderId) return null;

    const rider = mockRiders.find(r => r.id === order.riderId);
    if (!rider) return null;

    // To make the mock feel alive, we simulate a tiny bit of movement towards the destination,
    // even though the rider app is responsible for the "real" updates.
    if (order.deliveryLocation && order.status === 'On its way') {
        const destLoc = order.deliveryLocation;
        const riderLoc = rider.location;
        const latDiff = destLoc.lat - riderLoc.lat;
        const lngDiff = destLoc.lng - riderLoc.lng;

        // Move a small fraction of the remaining distance
        if (Math.abs(latDiff) > 0.0001 || Math.abs(lngDiff) > 0.0001) {
            riderLoc.lat += latDiff * 0.1;
            riderLoc.lng += lngDiff * 0.1;
        }

    } else if (order.restaurantLocation && order.status === 'Preparing') {
        const destLoc = order.restaurantLocation;
        const riderLoc = rider.location;
        const latDiff = destLoc.lat - riderLoc.lat;
        const lngDiff = destLoc.lng - riderLoc.lng;
        if (Math.abs(latDiff) > 0.0001 || Math.abs(lngDiff) > 0.0001) {
            riderLoc.lat += latDiff * 0.1;
            riderLoc.lng += lngDiff * 0.1;
        }
    }
    
    // update order's rider location as well for consistency
    if(order.rider) {
        order.rider.location = rider.location;
    }

    return { ...rider.location };
};

export const getOrders = async (filter: 'ongoing' | 'past' | 'cancelled' = 'ongoing'): Promise<Order[]> => {
    await simulateDelay(600);
    const ongoingStatuses: Order['status'][] = ['Placed', 'Preparing', 'On its way'];
    const pastStatuses: Order['status'][] = ['Delivered'];
    
    if (filter === 'ongoing') {
        return mockOrders.filter(o => ongoingStatuses.includes(o.status));
    }
    if (filter === 'past') {
        return mockOrders.filter(o => pastStatuses.includes(o.status));
    }
    if (filter === 'cancelled') {
        return mockOrders.filter(o => o.status === 'Cancelled');
    }
    return [];
};


export const submitOrderReview = async (review: OrderReview): Promise<void> => {
    await simulateDelay(800);
    const orderIndex = mockOrders.findIndex(o => o.id === review.orderId);
    if (orderIndex > -1) {
        mockOrders[orderIndex].isReviewed = true;
    }
    console.log("Review submitted:", review);
    return;
};

// --- User Profile & Favorites ---
export const getUserProfile = async (): Promise<User> => {
    await simulateDelay(300);
    // In a real app, you'd get this based on the auth token
    return mockUsers[0];
};

export const updateUserProfile = async (userData: User): Promise<User> => {
    await simulateDelay(500);
    const userIndex = mockUsers.findIndex(u => u.email === userData.email);
    if (userIndex > -1) {
        mockUsers[userIndex] = { ...mockUsers[userIndex], ...userData };
    }
    return mockUsers[userIndex];
};

export const getFavoriteRestaurants = async (): Promise<Restaurant[]> => {
    await simulateDelay(400);
    const favIds: string[] = JSON.parse(localStorage.getItem('favorite_restaurants') || '[]');
    return allMockRestaurants.filter(r => favIds.includes(r.id));
};

export const addFavoriteRestaurant = async (restaurantId: string): Promise<void> => {
    await simulateDelay(200);
    const favs: string[] = JSON.parse(localStorage.getItem('favorite_restaurants') || '[]');
    if (!favs.includes(restaurantId)) {
        favs.push(restaurantId);
        localStorage.setItem('favorite_restaurants', JSON.stringify(favs));
    }
};

export const removeFavoriteRestaurant = async (restaurantId: string): Promise<void> => {
    await simulateDelay(200);
    let favs: string[] = JSON.parse(localStorage.getItem('favorite_restaurants') || '[]');
    favs = favs.filter(id => id !== restaurantId);
    localStorage.setItem('favorite_restaurants', JSON.stringify(favs));
};

// --- Support API ---
export const getSupportInfo = async (): Promise<SupportInfo> => {
    await simulateDelay(100);
    return { phoneNumber: '1-800-FOOD-FIND' };
};

export const getChatHistory = async (userId: string): Promise<ChatMessage[]> => {
    await simulateDelay(200);
    if (!mockChatHistory.has(userId)) {
        mockChatHistory.set(userId, [
            { id: 'chat-1', text: 'Hello! How can I help you today?', sender: 'support', timestamp: new Date().toISOString() }
        ]);
    }
    return mockChatHistory.get(userId) || [];
};

export const sendChatMessage = async (text: string, userId: string): Promise<ChatMessage[]> => {
    await simulateDelay(500);
    const history = mockChatHistory.get(userId) || [];
    
    const userMessage: ChatMessage = {
        id: `chat-${Date.now()}`,
        text,
        sender: 'user',
        timestamp: new Date().toISOString()
    };
    history.push(userMessage);

    // Simulate support reply
    setTimeout(() => {
        const supportReply: ChatMessage = {
            id: `chat-${Date.now() + 1}`,
            text: 'Thank you for your message. An agent will be with you shortly.',
            sender: 'support',
            timestamp: new Date().toISOString()
        };
        history.push(supportReply);
    }, 1500);
    
    return history;
};


// --- Coupon API ---
export const validateCoupon = async (code: string): Promise<Offer | null> => {
    await simulateDelay(400);
    const offer = mockOffers.find(o => o.couponCode === code);
    if (offer && (!offer.expiry || new Date(offer.expiry) > new Date())) {
        return offer;
    }
    return null;
};

// --- Flash Sale (Customer Access) ---
export const getActiveFlashSale = async (): Promise<FlashSaleCampaign> => {
    await simulateDelay(400);
    // Return the global mock flash sale state
    return mockFlashSale;
};

export const getFoodsByIds = async (ids: string[], areaId?: string): Promise<Food[]> => {
    await simulateDelay(500);
    let foods = allMockFoods.filter(f => ids.includes(f.id));
    
    if (areaId) {
        // Get all restaurant IDs in this area
        const restaurantsInArea = new Set(
            allMockRestaurants.filter(r => r.areaId === areaId).map(r => r.id)
        );
        // Filter foods that belong to restaurants in the area
        foods = foods.filter(f => restaurantsInArea.has(f.restaurantId));
    }
    
    return foods;
};

// --- Tracking API ---
export const logTrackingEvent = async (eventName: string, payload: Record<string, any>, userEmail?: string): Promise<void> => {
    // This is a fire-and-forget call
    await simulateDelay(50);
    console.log(`[TRACKING] Event: ${eventName}`, {
        user: userEmail || 'guest',
        timestamp: new Date().toISOString(),
        ...payload,
    });
};

function locationHash(location: string): number {
    let hash = 0;
    if (location.length === 0) return hash;
    for (let i = 0; i < location.length; i++) {
        const char = location.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0; 
    }
    return Math.abs(hash);
}
