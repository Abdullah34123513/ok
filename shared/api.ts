import type { Offer, Restaurant, Food, PaginatedFoods, SearchResult, PaginatedRestaurants, MenuCategory, Review, CartItem, MenuItem, Address, Order, AddressSuggestion, AddressDetails, User, LoginCredentials, SignupData, AuthResponse, LocationPoint, SupportInfo, ChatMessage, OrderReview, SelectedCustomization, CustomizationOption, Vendor, VendorDashboardSummary, ConversationSummary, OperatingHours, Rider } from './types';

// --- Location-based data simulation helpers ---

// Helper to create a consistent hash from the location string
const locationHash = (str: string): number => {
  let hash = 0;
  if (str.length === 0) return hash;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
};

// Helper to create a seeded pseudo-random number generator for consistent shuffling
const seededRandom = (seed: number) => {
  let s = seed;
  return () => {
    s = Math.sin(s) * 10000;
    return s - Math.floor(s);
  };
};

// Helper to shuffle an array based on a seed, making it deterministic for a location
const shuffleArray = <T,>(array: T[], seed: number): T[] => {
  const newArr = [...array];
  const random = seededRandom(seed);
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};

// --- Mock Databases ---
let mockUsers: User[] = [
    { name: 'Alex Doe', email: 'alex.doe@example.com', phone: '123-456-7890', age: 30, gender: 'male' },
    { name: 'Vendor One', email: 'vendor1@example.com', phone: '555-0101' },
];

// In a real app, passwords would be hashed. For this mock, we'll store them in a separate map.
const mockUserPasswords = new Map<string, string>([
    ['alex.doe@example.com', 'password123'],
    ['vendor1@example.com', 'vendorpass1'],
]);

// Helper to create future expiry dates
const createExpiryDate = (days: number): string => new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();


// Mock data generation
const createMockFood = (id: number, restaurant: Restaurant): Food => ({
  id: `food-${id}`,
  imageUrl: `https://picsum.photos/seed/food${id}/400/300`,
  name: `Delicious Plate ${id}`,
  price: parseFloat((Math.random() * 20 + 5).toFixed(2)),
  rating: parseFloat((Math.random() * 2 + 3).toFixed(1)),
  restaurantId: restaurant.id,
  description: 'A beautifully crafted dish made with the freshest ingredients, guaranteed to delight your taste buds.',
  vendor: {
    name: restaurant.name,
  },
  availability: { type: 'ALL_DAY' }
});

const twentyFourSevenHours: OperatingHours = {
    monday: { isOpen: true, slots: [{ open: '00:00', close: '23:59' }] },
    tuesday: { isOpen: true, slots: [{ open: '00:00', close: '23:59' }] },
    wednesday: { isOpen: true, slots: [{ open: '00:00', close: '23:59' }] },
    thursday: { isOpen: true, slots: [{ open: '00:00', close: '23:59' }] },
    friday: { isOpen: true, slots: [{ open: '00:00', close: '23:59' }] },
    saturday: { isOpen: true, slots: [{ open: '00:00', close: '23:59' }] },
    sunday: { isOpen: true, slots: [{ open: '00:00', close: '23:59' }] },
};


const createMockRestaurant = (id: number): Restaurant => ({
  id: `restaurant-${id}`,
  logoUrl: `https://picsum.photos/seed/logo${id}/100/100`,
  coverImageUrl: `https://picsum.photos/seed/cover${id}/1200/400`,
  name: `Restaurant Hub ${id}`,
  rating: parseFloat((Math.random() * 2 + 3).toFixed(1)),
  cuisine: ['Italian', 'Mexican', 'Indian', 'Thai', 'Japanese', 'American', 'Chinese', 'French'][id % 8],
  deliveryFee: parseFloat((Math.random() * 5).toFixed(2)),
  deliveryTime: `${Math.floor(Math.random() * 20) + 20}-${Math.floor(Math.random() * 20) + 40} min`,
  address: `${120 + id} Flavor St, Food City`,
  operatingHours: {
    monday: { isOpen: true, slots: [{ open: '09:00', close: '21:00' }] },
    tuesday: { isOpen: true, slots: [{ open: '09:00', close: '21:00' }] },
    wednesday: { isOpen: true, slots: [{ open: '09:00', close: '14:00' }, { open: '17:00', close: '21:00' }] }, // Example split
    thursday: { isOpen: true, slots: [{ open: '09:00', close: '21:00' }] },
    friday: { isOpen: true, slots: [{ open: '09:00', close: '22:00' }] },
    saturday: { isOpen: true, slots: [{ open: '11:00', close: '22:00' }] },
    sunday: { isOpen: false, slots: [] },
  }
});

const mockOffers: Offer[] = [
  {
    id: 'offer-1',
    imageUrl: 'https://picsum.photos/seed/banner1/1200/400',
    title: '50% Off This Weekend',
    description: 'Get a massive 50% off on all orders this weekend. Don\'t miss out!',
    discountType: 'PERCENTAGE',
    discountValue: 50,
    applicableTo: 'ALL',
    couponCode: 'WEEKEND50',
    minOrderValue: 20,
    expiry: createExpiryDate(2),
  },
  {
    id: 'offer-2',
    imageUrl: 'https://picsum.photos/seed/banner2/1200/400',
    title: 'Free Delivery Today Only',
    description: 'Enjoy free delivery on any orders above $20. A perfect day to order in.',
    discountType: 'FIXED',
    discountValue: 5.99,
    minOrderValue: 20,
    applicableTo: 'ALL',
    expiry: createExpiryDate(1),
  },
  {
    id: 'offer-r1-10off',
    imageUrl: 'https://picsum.photos/seed/offerR1/600/300',
    title: '10% Off Restaurant Hub 1',
    description: 'Enjoy 10% off on all items from Restaurant Hub 1.',
    discountType: 'PERCENTAGE',
    discountValue: 10,
    applicableTo: { type: 'RESTAURANT', id: 'restaurant-1' },
    couponCode: 'HUB10',
    expiry: createExpiryDate(5),
  },
];

const allMockRestaurants: Restaurant[] = Array.from({ length: 20 }, (_, i) => createMockRestaurant(i + 1));
let allMockFoods: Food[] = Array.from({ length: 40 }, (_, i) => createMockFood(i + 1, allMockRestaurants[(i % 10)]));


// --- Add More Customizable Items ---
const pizzaCustomizations: CustomizationOption[] = [
    {
        id: 'size',
        name: 'Size',
        type: 'SINGLE',
        required: true,
        choices: [
            { name: 'Medium (12")', price: 0 },
            { name: 'Large (14")', price: 3.50 },
            { name: 'Extra Large (16")', price: 6.00 },
        ]
    },
    {
        id: 'toppings',
        name: 'Toppings',
        type: 'MULTIPLE',
        required: false,
        choices: [
            { name: 'Extra Cheese', price: 1.50 },
            { name: 'Pepperoni', price: 1.00 },
            { name: 'Mushrooms', price: 0.75 },
        ]
    }
];

const burgerCustomizations: CustomizationOption[] = [
    {
        id: 'addons',
        name: 'Add-ons',
        type: 'MULTIPLE',
        required: false,
        choices: [
            { name: 'Extra Patty', price: 3.00 },
            { name: 'Bacon', price: 1.50 },
            { name: 'Avocado', price: 1.25 },
        ]
    },
    {
        id: 'side',
        name: 'Choose a Side',
        type: 'SINGLE',
        required: true,
        choices: [
            { name: 'French Fries', price: 0 },
            { name: 'Onion Rings', price: 1.00 },
        ]
    }
];


allMockFoods.unshift({
  id: 'food-pizza-1',
  imageUrl: 'https://picsum.photos/seed/pizza1/400/300',
  name: 'Margherita Pizza',
  price: 12.99,
  rating: 4.8,
  restaurantId: allMockRestaurants[0].id,
  description: 'Classic delight with 100% real mozzarella cheese. Customize it to your liking!',
  vendor: { name: allMockRestaurants[0].name },
  customizationOptions: pizzaCustomizations,
  availability: { type: 'CUSTOM_TIME', startTime: '17:00', endTime: '22:00'}
});

// Add a customizable burger
const burgerRestaurant = allMockRestaurants.find(r => r.cuisine === 'American') || allMockRestaurants[5];
allMockFoods.push({
    id: `food-burger-1`,
    imageUrl: `https://picsum.photos/seed/burger1/400/300`,
    name: `The Classic Burger`,
    price: 9.99,
    rating: 4.6,
    restaurantId: burgerRestaurant.id,
    description: 'A juicy, all-beef patty with your choice of sides and add-ons!',
    vendor: { name: burgerRestaurant.name },
    customizationOptions: burgerCustomizations,
    availability: { type: 'ALL_DAY' }
});

// Update some restaurants to be 24/7
const diner = allMockRestaurants.find(r => r.id === 'restaurant-5');
if (diner) {
    diner.name = "24/7 Diner";
    diner.operatingHours = twentyFourSevenHours;
    diner.deliveryTime = "15-25 min";
}
const munchies = allMockRestaurants.find(r => r.id === 'restaurant-15');
if (munchies) {
    munchies.name = "Midnight Munchies";
    munchies.operatingHours = twentyFourSevenHours;
    munchies.deliveryTime = "20-30 min";
}


let mockCart: CartItem[] = [];

let mockAddresses: Address[] = [
    { id: 'addr-1', label: 'Home', details: '123 Main St, Anytown, USA 12345' },
    { id: 'addr-2', label: 'Work', details: '456 Business Ave, Corp City, USA 54321' },
];

const restaurant1Foods = allMockFoods.filter(f => f.restaurantId === 'restaurant-1');
const restaurant2Foods = allMockFoods.filter(f => f.restaurantId === 'restaurant-2');

// Helper to convert Food to MenuItem
const foodToMenuItem = (food: Food): MenuItem => ({
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
});


let mockOrders: Order[] = [
    {
        id: 'ORDER-1001',
        status: 'Placed',
        date: new Date(Date.now() - 10 * 60 * 1000).toLocaleString('en-US'),
        restaurantName: 'Restaurant Hub 1',
        items: [
            {
                cartItemId: 'ci-1',
                baseItem: foodToMenuItem(restaurant1Foods[0]),
                quantity: 2,
                selectedCustomizations: [],
                totalPrice: restaurant1Foods[0].price * 2,
            },
            {
                cartItemId: 'ci-2',
                baseItem: foodToMenuItem(restaurant1Foods[1]),
                quantity: 1,
                selectedCustomizations: [],
                totalPrice: restaurant1Foods[1].price,
            }
        ],
        subtotal: restaurant1Foods[0].price * 2 + restaurant1Foods[1].price,
        deliveryFee: 3.99,
        total: restaurant1Foods[0].price * 2 + restaurant1Foods[1].price + 3.99,
        discount: 0,
        address: mockAddresses[0],
        paymentMethod: 'cod',
        deliveryOption: 'home',
        customerName: 'Alex Doe',
    },
    {
        id: 'ORDER-1002',
        status: 'Preparing',
        date: new Date(Date.now() - 30 * 60 * 1000).toLocaleString('en-US'),
        restaurantName: 'Restaurant Hub 1',
        items: [
            {
                cartItemId: 'ci-3',
                baseItem: foodToMenuItem(restaurant1Foods[2]),
                quantity: 1,
                selectedCustomizations: [],
                totalPrice: restaurant1Foods[2].price,
            }
        ],
        subtotal: restaurant1Foods[2].price,
        deliveryFee: 3.99,
        total: restaurant1Foods[2].price + 3.99,
        discount: 0,
        address: mockAddresses[1],
        paymentMethod: 'online',
        deliveryOption: 'home',
        customerName: 'Jane Smith',
    },
    {
        id: 'ORDER-1003',
        status: 'Placed',
        date: new Date(Date.now() - 5 * 60 * 1000).toLocaleString('en-US'),
        restaurantName: 'Restaurant Hub 1',
        items: [
            {
                cartItemId: 'ci-4',
                baseItem: foodToMenuItem(restaurant1Foods[3]),
                quantity: 1,
                selectedCustomizations: [],
                totalPrice: restaurant1Foods[3].price,
            }
        ],
        subtotal: restaurant1Foods[3].price,
        deliveryFee: 3.99,
        total: restaurant1Foods[3].price + 3.99,
        discount: 0,
        address: { id: 'addr-3', label: 'Friend\'s House', details: '789 Other St, Anytown' },
        paymentMethod: 'cod',
        deliveryOption: 'home',
        customerName: 'Sam Wilson',
    },
    {
        id: 'ORDER-1004',
        status: 'On its way',
        date: new Date(Date.now() - 2 * 60 * 1000).toLocaleString('en-US'),
        restaurantName: 'Restaurant Hub 2',
        distance: 4.2,
        estimatedDeliveryTime: '25 min',
        items: [
            {
                cartItemId: 'ci-5',
                baseItem: foodToMenuItem(restaurant2Foods[0]),
                quantity: 1,
                selectedCustomizations: [],
                totalPrice: restaurant2Foods[0].price,
            }
        ],
        subtotal: restaurant2Foods[0].price,
        deliveryFee: 2.50,
        total: restaurant2Foods[0].price + 2.50,
        discount: 0,
        address: { id: 'addr-4', label: 'Office', details: '555 Work Rd, Business Park' },
        paymentMethod: 'online',
        deliveryOption: 'home',
        customerName: 'Maria Garcia',
    },
    {
        id: 'ORDER-1005',
        status: 'On its way',
        date: new Date(Date.now() - 5 * 60 * 1000).toLocaleString('en-US'),
        restaurantName: '24/7 Diner',
        distance: 1.8,
        estimatedDeliveryTime: '15 min',
        items: [
            {
                cartItemId: 'ci-6',
                baseItem: foodToMenuItem(allMockFoods.find(f => f.restaurantId === 'restaurant-5')!),
                quantity: 2,
                selectedCustomizations: [],
                totalPrice: allMockFoods.find(f => f.restaurantId === 'restaurant-5')!.price * 2,
            }
        ],
        subtotal: allMockFoods.find(f => f.restaurantId === 'restaurant-5')!.price * 2,
        deliveryFee: 1.99,
        total: allMockFoods.find(f => f.restaurantId === 'restaurant-5')!.price * 2 + 1.99,
        discount: 0,
        address: { id: 'addr-1', label: 'Home', details: '123 Main St, Anytown' },
        paymentMethod: 'cod',
        deliveryOption: 'home',
        customerName: 'Alex Doe',
    }
]; 

const allMockReviews: Review[] = Array.from({ length: 15 }, (_, i) => ({
    id: `review-${i+1}`,
    author: `Customer ${i+1}`,
    rating: parseFloat((Math.random() * 1.5 + 3.5).toFixed(1)),
    text: 'This was an amazing experience! The food was delicious and the service was top-notch. Highly recommended.',
    avatarUrl: `https://i.pravatar.cc/48?u=customer${i+1}`
}));

const mockChatHistory = new Map<string, ChatMessage[]>();

const mockVendors: Vendor[] = [
    { id: 'vendor-1', restaurantId: 'restaurant-1', name: 'Vendor One', email: 'vendor1@example.com' }
];

const mockRiders: Rider[] = [
    // FIX: Added location to mock rider to satisfy the Rider interface and fix type error in acceptRiderOrder.
    { id: 'rider-1', name: 'John Rider', phone: '1700000000', vehicle: 'Motorcycle', rating: 4.8, location: { lat: 34.0522, lng: -118.2437 } }
];


// --- API Simulation ---

const simulateDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const getOffers = async (location: string): Promise<Offer[]> => {
  await simulateDelay(500);
  const seed = locationHash(location);
  return shuffleArray(mockOffers, seed).slice(0, 5);
};

export const getActiveOffers = async (location: string): Promise<Offer[]> => {
    await simulateDelay(500);
    const seed = locationHash(location);
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

export const getFoodsForOffer = async (offerId: string, location: string): Promise<Food[]> => {
    await simulateDelay(600);
    const offer = mockOffers.find(o => o.id === offerId);
    if (!offer) return [];

    const applicableTo = offer.applicableTo;

    if (applicableTo === 'ALL') {
        return getFoods(location, 1).then(p => p.foods.slice(0, 8));
    }
    if (applicableTo && typeof applicableTo === 'object') {
        return allMockFoods.filter(f => f.restaurantId === applicableTo.id).slice(0, 8);
    }
    if (offer.applicableFoods) {
        return allMockFoods.filter(f => offer.applicableFoods?.includes(f.id));
    }
    return [];
};

export const getTopRestaurants = async (location: string): Promise<Restaurant[]> => {
  await simulateDelay(600);
  const seed = locationHash(location);
  return shuffleArray(allMockRestaurants, seed).slice(0, 10);
};

export const getRestaurants = async (location: string, page: number, limit = 12): Promise<PaginatedRestaurants> => {
    await simulateDelay(800);
    const seed = locationHash(location);
    const shuffled = shuffleArray(allMockRestaurants, seed);
    const start = (page - 1) * limit;
    const end = start + limit;
    const restaurants = shuffled.slice(start, end);
    return {
        restaurants,
        hasMore: end < shuffled.length,
        nextPage: page + 1,
    };
};

export const getFoods = async (location: string, page: number, limit = 12): Promise<PaginatedFoods> => {
  await simulateDelay(1000);
  const seed = locationHash(location);
  const shuffled = shuffleArray(allMockFoods, seed);
  const start = (page - 1) * limit;
  const end = start + limit;
  const foods = shuffled.slice(start, end);
  return {
    foods,
    hasMore: end < shuffled.length,
    nextPage: page + 1,
  };
};

export const search = async (query: string, location: string): Promise<SearchResult> => {
    await simulateDelay(500);
    const lowerQuery = query.toLowerCase();
    const seed = locationHash(location);
    const shuffledRestaurants = shuffleArray(allMockRestaurants, seed);
    const shuffledFoods = shuffleArray(allMockFoods, seed);

    const restaurants = shuffledRestaurants.filter(r =>
        r.name.toLowerCase().includes(lowerQuery) ||
        r.cuisine.toLowerCase().includes(lowerQuery)
    ).slice(0, 6);

    const foods = shuffledFoods.filter(f =>
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

export const getRelatedFoods = async (foodId: string, location: string): Promise<Food[]> => {
    await simulateDelay(700);
    const food = allMockFoods.find(f => f.id === foodId);
    if (!food) return [];
    
    const seed = locationHash(location);
    const shuffled = shuffleArray(allMockFoods, seed);

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
    mockCart = mockCart.filter(item => item.cartItemId !== cartItemId);
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

export const addAddress = async (label: string, details: AddressDetails): Promise<Address[]> => {
    await simulateDelay(500);
    const newAddress: Address = {
        id: `addr-${Date.now()}`,
        label,
        details: `${details.street}, ${details.city}, ${details.postalCode}`
    };
    mockAddresses.push(newAddress);
    return [...mockAddresses];
};

export const removeAddress = async (id: string): Promise<Address[]> => {
    await simulateDelay(300);
    mockAddresses = mockAddresses.filter(a => a.id !== id);
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
        deliveryLocation: { lat: 34.0622, lng: -118.2537 },
        estimatedDeliveryTime: '8:45 PM',
        rider: {
            name: 'John Rider',
            phone: '555-1234',
            vehicle: 'Honda Activa',
            rating: 4.8,
            location: { lat: 34.0522, lng: -118.2437 }
        },
        isReviewed: false,
    };
    mockOrders.unshift(newOrder); // Add to the beginning of the list
    mockCart = []; // Clear the cart after order
    return newOrder;
};

export const getOrderDetails = async (orderId: string): Promise<Order | undefined> => {
    await simulateDelay(500);
    return mockOrders.find(o => o.id === orderId);
};

export const getRiderLocation = async (orderId: string): Promise<LocationPoint | null> => {
    await simulateDelay(200);
    const order = mockOrders.find(o => o.id === orderId);
    if (!order || !order.rider || !order.deliveryLocation) return null;

    // Simulate rider moving towards destination
    const riderLoc = order.rider.location;
    const destLoc = order.deliveryLocation;
    
    const latDiff = destLoc.lat - riderLoc.lat;
    const lngDiff = destLoc.lng - riderLoc.lng;

    // Move 20% of the remaining distance
    riderLoc.lat += latDiff * 0.2;
    riderLoc.lng += lngDiff * 0.2;

    return { ...riderLoc };
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

// --- Auth API ---
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    await simulateDelay(800);
    const user = mockUsers.find(u => u.email === credentials.email);
    const password = mockUserPasswords.get(credentials.email);

    if (user && password === credentials.password) {
        const vendor = mockVendors.find(v => v.name === user.name);
        return { 
            user, 
            token: `mock-auth-token-${Date.now()}`,
            vendorId: vendor ? vendor.id : undefined,
        };
    } else {
        throw new Error('Invalid email or password.');
    }
};

export const signup = async (data: SignupData): Promise<AuthResponse> => {
    await simulateDelay(1000);
    if (mockUsers.some(u => u.email === data.email)) {
        throw new Error('An account with this email already exists.');
    }

    const newUser: User = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        age: data.age,
        gender: data.gender,
    };

    mockUsers.push(newUser);
    mockUserPasswords.set(data.email, data.password);
    
    return { user: newUser, token: `mock-auth-token-${Date.now()}` };
};

export const changePassword = async (email: string, currentPassword: string, newPassword: string): Promise<void> => {
    await simulateDelay(600);
    const storedPassword = mockUserPasswords.get(email);

    if (!storedPassword || storedPassword !== currentPassword) {
        throw new Error("Your current password is not correct.");
    }

    mockUserPasswords.set(email, newPassword);
    console.log(`Password updated for ${email}`);
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
    ).map(o => ({ ...o, customerName: o.customerName || mockUsers[0].name })); // Add customer name for vendor view
};


export const updateOrderStatus = async (orderId: string, newStatus: Order['status']): Promise<Order> => {
    await simulateDelay(400);
    const order = mockOrders.find(o => o.id === orderId);
    if (!order) throw new Error("Order not found");
    order.status = newStatus;
    return order;
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

    const newMenuItem: MenuItem = {
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
    const newFood: Food = {
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

    // Convert MenuItem back to Food for storage, preserving existing rating
    const updatedFood: Food = {
        ...allMockFoods[itemIndex],
        ...updatedItem,
        vendor: { name: vendor.name },
    };

    allMockFoods[itemIndex] = updatedFood;
    return updatedItem;
};

export const deleteMenuItem = async (vendorId: string, itemId: string): Promise<void> => {
    await simulateDelay(300);
    const vendor = mockVendors.find(v => v.id === vendorId);
    const itemIndex = allMockFoods.findIndex(f => f.id === itemId);

    if (itemIndex === -1) throw new Error("Item not found");

    if (!vendor || allMockFoods[itemIndex].restaurantId !== vendor.restaurantId) {
        throw new Error("Authorization error: Cannot delete this item.");
    }

    allMockFoods.splice(itemIndex, 1);
};


export const getVendorConversations = async (_vendorId: string): Promise<ConversationSummary[]> => {
    await simulateDelay(500);
    // This is a mock. In a real app, you'd query your chat database.
    return [
        { customerId: 'alex.doe@example.com', customerName: 'Alex Doe', lastMessage: 'Is my order on the way?', timestamp: new Date(Date.now() - 5 * 60000).toISOString(), hasUnread: true },
        { customerId: 'jane.smith@example.com', customerName: 'Jane Smith', lastMessage: 'Thank you!', timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(), hasUnread: false },
    ];
};

// --- RIDER-SPECIFIC APIS ---

export const loginRider = async (phone: string): Promise<Rider | undefined> => {
    await simulateDelay(500);
    // In a real app, this would verify the phone number and send an OTP.
    // For the mock, we just find the rider by their phone number.
    return mockRiders.find(r => r.phone === phone);
};

export const getRiderNewOrders = async (): Promise<Order[]> => {
    await simulateDelay(800);
    // Find orders that are ready for pickup ('On its way') but don't have a rider assigned yet.
    return mockOrders.filter(o => o.status === 'On its way' && !o.riderId);
};

export const acceptRiderOrder = async (orderId: string, riderId: string): Promise<Order> => {
    await simulateDelay(500);
    const orderIndex = mockOrders.findIndex(o => o.id === orderId);
    if (orderIndex === -1) {
        throw new Error("Order not found.");
    }
    const rider = mockRiders.find(r => r.id === riderId);
    if (!rider) {
        throw new Error("Rider not found");
    }
    mockOrders[orderIndex].riderId = riderId;
    mockOrders[orderIndex].rider = rider; // Assign full rider details for tracking page
    return mockOrders[orderIndex];
};
