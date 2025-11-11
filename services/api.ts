
import type { Offer, Restaurant, Food, PaginatedFoods, SearchResult, PaginatedRestaurants, MenuCategory, Review, CartItem, MenuItem, Address, Order, AddressSuggestion, AddressDetails, User, LoginCredentials, SignupData, AuthResponse, LocationPoint, SupportInfo, ChatMessage, OrderReview, SelectedCustomization, CustomizationOption } from '../types';

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
    { name: 'Alex Doe', email: 'alex.doe@example.com', phone: '123-456-7890', age: 30, gender: 'male' }
];

// In a real app, passwords would be hashed. For this mock, we'll store them in a separate map.
const mockUserPasswords = new Map<string, string>([
    ['alex.doe@example.com', 'password123']
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
  description: 'A beautifully crafted dish made with the freshest ingredients, guaranteed to delight your taste buds. Perfect for any occasion, combining rich flavors and a stunning presentation.',
  vendor: {
    name: restaurant.name,
  },
});

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
    id: 'offer-3',
    imageUrl: 'https://picsum.photos/seed/banner3/1200/400',
    title: 'Special Combo Deals',
    description: 'Check out our new combo and family packages for great value!',
    applicableFoods: ['food-combo-1', 'food-family-pack-1'],
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
  {
    id: 'offer-r2-5flat',
    imageUrl: 'https://picsum.photos/seed/offerR2/600/300',
    title: '$5 Flat Off at Restaurant Hub 2',
    description: 'Get a flat $5 discount on orders above $30 from Restaurant Hub 2.',
    discountType: 'FIXED',
    discountValue: 5,
    minOrderValue: 30,
    applicableTo: { type: 'RESTAURANT', id: 'restaurant-2' }
  },
];

const allMockRestaurants: Restaurant[] = Array.from({ length: 50 }, (_, i) => createMockRestaurant(i + 1));
const allMockFoods: Food[] = Array.from({ length: 100 }, (_, i) => createMockFood(i + 1, allMockRestaurants[(i % 10)]));


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
        id: 'crust',
        name: 'Crust',
        type: 'SINGLE',
        required: true,
        choices: [
            { name: 'Classic', price: 0 },
            { name: 'Thin Crust', price: 0 },
            { name: 'Stuffed Crust', price: 2.50 },
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
            { name: 'Onions', price: 0.50 },
            { name: 'Olives', price: 0.75 },
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
            { name: 'Side Salad', price: 1.50 },
        ]
    }
];

const saladCustomizations: CustomizationOption[] = [
    {
        id: 'dressing',
        name: 'Choose Your Dressing',
        type: 'SINGLE',
        required: true,
        choices: [
            { name: 'Italian Vinaigrette', price: 0 },
            { name: 'Ranch Dressing', price: 0 },
            { name: 'Caesar Dressing', price: 0.50 },
        ]
    },
    {
        id: 'protein',
        name: 'Add a Protein',
        type: 'SINGLE',
        required: false,
        choices: [
            { name: 'Grilled Chicken', price: 3.50 },
            { name: 'Crispy Tofu', price: 2.50 },
            { name: 'Shrimp', price: 4.50 },
        ]
    },
     {
        id: 'extras',
        name: 'Extras',
        type: 'MULTIPLE',
        required: false,
        choices: [
            { name: 'Avocado', price: 1.50 },
            { name: 'Feta Cheese', price: 1.00 },
            { name: 'Croutons', price: 0.50 },
        ]
    }
];

const pastaCustomizations: CustomizationOption[] = [
    {
        id: 'sauce',
        name: 'Pick Your Sauce',
        type: 'SINGLE',
        required: true,
        choices: [
            { name: 'Classic Marinara', price: 0 },
            { name: 'Creamy Alfredo', price: 1.50 },
            { name: 'Basil Pesto', price: 1.50 },
        ]
    },
    {
        id: 'addons',
        name: 'Add-ons',
        type: 'MULTIPLE',
        required: false,
        choices: [
            { name: 'Meatballs (3)', price: 3.00 },
            { name: 'Sausage', price: 2.50 },
            { name: 'Extra Veggies', price: 1.75 },
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
  description: 'Classic delight with 100% real mozzarella cheese, fresh tomatoes, and a savory tomato sauce base. Customize it to your liking!',
  vendor: { name: allMockRestaurants[0].name },
  customizationOptions: pizzaCustomizations,
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
    description: 'A juicy, all-beef patty with lettuce, tomato, and our special sauce on a toasted bun. Customize it with your favorite sides and add-ons!',
    vendor: { name: burgerRestaurant.name },
    customizationOptions: burgerCustomizations,
});

// Add a customizable salad
const saladRestaurant = allMockRestaurants.find(r => r.cuisine === 'American') || allMockRestaurants[5];
allMockFoods.push({
    id: `food-salad-1`,
    imageUrl: `https://picsum.photos/seed/salad1/400/300`,
    name: `Build Your Own Garden Salad`,
    price: 8.50,
    rating: 4.4,
    restaurantId: saladRestaurant.id,
    description: 'A fresh bed of mixed greens and seasonal vegetables. Make it your own with our delicious dressings and protein add-ons!',
    vendor: { name: saladRestaurant.name },
    customizationOptions: saladCustomizations,
});

// Add a customizable pasta
const pastaRestaurant = allMockRestaurants.find(r => r.cuisine === 'Italian') || allMockRestaurants[0];
allMockFoods.push({
    id: `food-pasta-1`,
    imageUrl: `https://picsum.photos/seed/pasta1/400/300`,
    name: `Create Your Own Pasta Bowl`,
    price: 11.99,
    rating: 4.7,
    restaurantId: pastaRestaurant.id,
    description: 'Your perfect pasta, your way. Choose your favorite sauce and load up on tasty add-ons for a meal you\'ll love.',
    vendor: { name: pastaRestaurant.name },
    customizationOptions: pastaCustomizations,
});


// --- Add Combo and Family Packages ---
allMockFoods.push({
  id: 'food-combo-1',
  imageUrl: 'https://picsum.photos/seed/combo1/400/300',
  name: 'Solo Combo Deal',
  price: 18.99,
  rating: 4.5,
  restaurantId: allMockRestaurants[1].id,
  description: 'The perfect meal for one! Includes a classic cheeseburger, medium fries, and a soft drink of your choice.',
  vendor: { name: allMockRestaurants[1].name },
  isPackage: true,
});

allMockFoods.push({
  id: 'food-family-pack-1',
  imageUrl: 'https://picsum.photos/seed/familypack1/400/300',
  name: 'Family Pizza Night Package',
  price: 39.99,
  rating: 4.7,
  restaurantId: allMockRestaurants[0].id,
  description: 'Everything you need for a family feast. Includes two large classic pizzas, a large portion of garlic bread, and a 2-liter soft drink.',
  vendor: { name: allMockRestaurants[0].name },
  isPackage: true,
});


// --- Location-aware data helpers ---
const getRestaurantsForLocation = (location: string): Restaurant[] => {
    const seed = locationHash(location);
    return shuffleArray(allMockRestaurants, seed);
};

const getFoodsForLocation = (location: string): Food[] => {
    const seed = locationHash(location);
    const locationRestaurants = getRestaurantsForLocation(location);
    const locationRestaurantIds = new Set(locationRestaurants.map(r => r.id));
    // Filter foods to only include those from restaurants in the current location
    const locationFoods = allMockFoods.filter(food => locationRestaurantIds.has(food.restaurantId));
    return shuffleArray(locationFoods, seed);
}

// API simulation functions
const simulateNetwork = <T,>(data: T, delay?: number): Promise<T> =>
  new Promise(resolve => setTimeout(() => resolve(data), delay ?? Math.random() * 800 + 200));

const simulateError = (message: string, delay?: number): Promise<any> =>
  new Promise((_, reject) => setTimeout(() => reject(new Error(message)), delay ?? 500));

// --- Auth APIs ---
export const signup = (data: SignupData): Promise<AuthResponse> => {
    console.log('API: Attempting signup for', data.email);
    if (mockUsers.some(u => u.email === data.email)) {
        return simulateError('A user with this email already exists.');
    }
    const newUser: User = { 
        name: data.name, 
        email: data.email, 
        phone: data.phone, 
        age: data.age, 
        gender: data.gender 
    };
    mockUsers.push(newUser);
    mockUserPasswords.set(data.email, data.password);

    const token = `mock-token-${Date.now()}`;
    return simulateNetwork({ user: newUser, token });
};

export const login = (credentials: LoginCredentials): Promise<AuthResponse> => {
    console.log('API: Attempting login for', credentials.email);
    const user = mockUsers.find(u => u.email === credentials.email);
    const storedPassword = mockUserPasswords.get(credentials.email);

    if (user && storedPassword === credentials.password) {
        const token = `mock-token-${Date.now()}`;
        return simulateNetwork({ user, token });
    }
    return simulateError('Invalid email or password.');
};


export const getOffers = (location: string): Promise<Offer[]> => {
  console.log(`API: Fetching offers for ${location}...`);
  // To make it feel real, let's say only a subset of restaurants are available in any location.
  const locationRestaurants = getRestaurantsForLocation(location).slice(0, 25); // Top 25 for this area
  const locationRestaurantIds = new Set(locationRestaurants.map(r => r.id));

  const locationOffers = mockOffers.filter(offer => {
      // Show offers applicable to all restaurants
      if (offer.applicableTo === 'ALL') {
          return true;
      }
      // Show offers for restaurants within the user's location
      if (offer.applicableTo && typeof offer.applicableTo === 'object' && 'id' in offer.applicableTo) {
          return locationRestaurantIds.has(offer.applicableTo.id);
      }
      // Show offers that are not tied to any specific restaurant (e.g., food-specific offers)
      if (!offer.applicableTo) {
          return true;
      }
      return false;
  });

  const seed = locationHash(location);
  // Also shuffle the resulting offers to make it seem dynamic per location
  return simulateNetwork(shuffleArray(locationOffers, seed));
};

export const getTopRestaurants = (location: string): Promise<Restaurant[]> => {
  console.log(`API: Fetching top restaurants for ${location}...`);
  const locationRestaurants = getRestaurantsForLocation(location);
  return simulateNetwork(locationRestaurants.slice(0, 10));
};

export const getFoods = (location: string, page: number, limit = 10): Promise<PaginatedFoods> => {
  console.log(`API: Fetching foods for ${location}, page ${page}...`);
  const locationFoods = getFoodsForLocation(location);
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedFoods = locationFoods.slice(startIndex, endIndex);

  return simulateNetwork({
    foods: paginatedFoods,
    hasMore: endIndex < locationFoods.length,
    nextPage: page + 1,
  });
};

export const search = (query: string, location: string): Promise<SearchResult> => {
    console.log(`API: Searching for "${query}" in ${location}...`);
    const lowerCaseQuery = query.toLowerCase();

    const locationFoods = getFoodsForLocation(location);
    const locationRestaurants = getRestaurantsForLocation(location);

    const matchingFoods = locationFoods.filter(
        food => food.name.toLowerCase().includes(lowerCaseQuery) || food.vendor.name.toLowerCase().includes(lowerCaseQuery)
    ).slice(0, 5);

    const matchingRestaurants = locationRestaurants.filter(
        restaurant => restaurant.name.toLowerCase().includes(lowerCaseQuery) || restaurant.cuisine.toLowerCase().includes(lowerCaseQuery)
    ).slice(0, 5);

    return simulateNetwork({ restaurants: matchingRestaurants, foods: matchingFoods });
};

export const getActiveOffers = (location: string): Promise<Offer[]> => {
    console.log(`API: Fetching active offers for ${location}...`);
    // In this mock, this is the same as getOffers.
    return getOffers(location);
};

export const getRestaurants = (location: string, page: number, filters: Record<string, any> = {}, limit = 12): Promise<PaginatedRestaurants> => {
    console.log(`API: Fetching restaurants for ${location}, page ${page} with filters`, filters);
    const locationRestaurants = getRestaurantsForLocation(location);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedRestaurants = locationRestaurants.slice(startIndex, endIndex);

    return simulateNetwork({
        restaurants: paginatedRestaurants,
        hasMore: endIndex < locationRestaurants.length,
        nextPage: page + 1,
    });
};

let mockFavoriteRestaurantIds = new Set(['restaurant-2', 'restaurant-5', 'restaurant-8']);

export const getRestaurantDetails = (id: string): Promise<Restaurant | undefined> => {
    console.log(`API: Fetching details for restaurant ${id}...`);
    const restaurant = allMockRestaurants.find(r => r.id === id);
    if (restaurant) {
        return simulateNetwork({ ...restaurant, isFavorite: mockFavoriteRestaurantIds.has(id) });
    }
    return simulateNetwork(undefined);
};

export const getRestaurantMenu = (id: string): Promise<MenuCategory[]> => {
    console.log(`API: Fetching menu for restaurant ${id}...`);
    const restaurant = allMockRestaurants.find(r => r.id === id);
    if (!restaurant) return simulateNetwork([]);

    const itemsForRestaurant = allMockFoods
        .filter(food => food.restaurantId === id)
        .map(food => ({
            id: food.id,
            name: food.name,
            description: food.description,
            price: food.price,
            imageUrl: food.imageUrl,
            restaurantId: food.restaurantId,
            restaurantName: restaurant.name,
            customizationOptions: food.customizationOptions,
            isPackage: food.isPackage,
        }));

    // Simple categorization for the mock
    const appetizers = itemsForRestaurant.slice(0, 5);
    const mains = itemsForRestaurant.slice(5);

    const menu: MenuCategory[] = [];
    if (appetizers.length > 0) menu.push({ name: 'Popular Items', items: appetizers });
    if (mains.length > 0) menu.push({ name: 'Main Menu', items: mains });

    return simulateNetwork(menu);
};

export const getRestaurantReviews = (id: string): Promise<Review[]> => {
    console.log(`API: Fetching reviews for restaurant ${id}...`);
    const reviews: Review[] = Array.from({length: 8}, (_, i) => ({
        id: `review-${i}`,
        author: `Diner ${i+1}`,
        rating: Math.floor(Math.random() * 2) + 4, // 4 or 5 stars
        text: 'This place was amazing! The food was delicious and the service was top-notch. Highly recommend to everyone visiting the city. I will definitely be back for more!',
        avatarUrl: `https://i.pravatar.cc/48?u=user${i}`
    }));
    return simulateNetwork(reviews);
};

// --- Food Detail APIs ---
export const getFoodDetails = (id: string): Promise<Food | undefined> => {
    console.log(`API: Fetching details for food ${id}...`);
    return simulateNetwork(allMockFoods.find(f => f.id === id));
};

export const getFoodReviews = (id: string): Promise<Review[]> => {
    console.log(`API: Fetching reviews for food ${id}...`);
    const reviews: Review[] = Array.from({length: 5}, (_, i) => ({
        id: `food-review-${id}-${i}`,
        author: `Foodie ${i+1}`,
        rating: Math.floor(Math.random() * 2) + 4, // 4 or 5 stars
        text: 'Absolutely delicious! One of the best I have ever had. The flavors were perfectly balanced and it was cooked to perfection. A must-try!',
        avatarUrl: `https://i.pravatar.cc/48?u=foodie${i}`
    }));
    return simulateNetwork(reviews);
};

export const getRelatedFoods = (foodId: string, location: string): Promise<Food[]> => {
    console.log(`API: Fetching related foods for ${foodId} in ${location}...`);
    const locationFoods = getFoodsForLocation(location);
    // Simple mock: return a few random items from the current location, excluding the current one
    const related = locationFoods.filter(f => f.id !== foodId).slice(0, 8);
    return simulateNetwork(related);
};


// --- Cart, Checkout, and Order APIs ---

let mockCart: CartItem[] = [];
let mockAddresses: Address[] = [
    { id: 'addr-1', label: 'Home', details: '123 Main St, Food City, 12345' },
    { id: 'addr-2', label: 'Work', details: '456 Business Ave, Suite 500, Food City, 12345' }
];
let mockOrders: Order[] = [
    { id: 'order-1', items: [], subtotal: 45.50, deliveryFee: 5.99, total: 51.49, address: mockAddresses[0], paymentMethod: 'cod', deliveryOption: 'home', status: 'Delivered', restaurantName: 'Restaurant Hub 1', date: '2023-10-26', isReviewed: false },
    { id: 'order-2', items: [], subtotal: 22.00, deliveryFee: 5.99, total: 27.99, address: mockAddresses[1], paymentMethod: 'online', deliveryOption: 'home', status: 'Cancelled', restaurantName: 'Restaurant Hub 3', date: '2023-10-25' },
    { 
        id: 'order-3', 
        items: [],
        subtotal: 31.80, 
        deliveryFee: 5.99, 
        total: 37.79, 
        address: mockAddresses[0], 
        paymentMethod: 'online', 
        deliveryOption: 'home', 
        status: 'On its way', 
        restaurantName: 'Restaurant Hub 2', 
        date: '2023-10-27',
        restaurantLocation: { lat: 34.0522, lng: -118.2437 },
        deliveryLocation: { lat: 34.0622, lng: -118.2537 },
        estimatedDeliveryTime: '10:45 AM',
        rider: {
            name: 'John R.',
            phone: '555-123-4567',
            vehicle: 'Scooter - XYZ 789',
            rating: 4.9,
            location: { lat: 34.0572, lng: -118.2487 },
        }
    },
    { id: 'order-4', items: [], subtotal: 25.00, deliveryFee: 5.99, total: 30.99, address: mockAddresses[0], paymentMethod: 'online', deliveryOption: 'home', status: 'Delivered', restaurantName: 'Restaurant Hub 4', date: '2023-10-24', isReviewed: true },
];
let riderLocations = new Map<string, LocationPoint>([
    ['order-3', { lat: 34.0572, lng: -118.2487 }]
]);


export const getCart = (): Promise<CartItem[]> => {
    console.log('API: Getting cart');
    return simulateNetwork([...mockCart], 100);
}

export const addToCart = (item: MenuItem, quantity: number, customizations: SelectedCustomization[], totalPrice: number): Promise<CartItem[]> => {
    console.log(`API: Adding item ${item.id} to cart with customizations`);
    
    const newCartItem: CartItem = {
        cartItemId: `${item.id}-${Math.random().toString(36).substr(2, 9)}`,
        baseItem: item,
        quantity: quantity,
        selectedCustomizations: customizations,
        totalPrice: totalPrice * quantity,
    };

    mockCart.push(newCartItem);
    return simulateNetwork([...mockCart]);
}

export const updateCartItemQuantity = (cartItemId: string, quantity: number): Promise<CartItem[]> => {
    console.log(`API: Updating item ${cartItemId} quantity to ${quantity}`);
    const itemIndex = mockCart.findIndex(cartItem => cartItem.cartItemId === cartItemId);
    if (itemIndex > -1) {
        if (quantity <= 0) {
            mockCart.splice(itemIndex, 1);
        } else {
            const item = mockCart[itemIndex];
            const pricePerItem = item.totalPrice / item.quantity;
            item.quantity = quantity;
            item.totalPrice = pricePerItem * quantity;
        }
    }
    return simulateNetwork([...mockCart]);
}

export const removeCartItem = (cartItemId: string): Promise<CartItem[]> => {
    console.log(`API: Removing item ${cartItemId} from cart`);
    mockCart = mockCart.filter(item => item.cartItemId !== cartItemId);
    return simulateNetwork([...mockCart]);
}

export const getAddresses = (): Promise<Address[]> => {
    console.log('API: Getting addresses');
    return simulateNetwork([...mockAddresses]);
}

export const createOrder = (orderPayload: Omit<Order, 'id' | 'status' | 'restaurantName' | 'date'>): Promise<Order> => {
    console.log('API: Creating order with payload:', orderPayload);
    const restaurantNames = [...new Set(orderPayload.items.map(item => item.baseItem.restaurantName))].join(', ');

    const newOrder: Order = {
        ...orderPayload,
        id: `order-${Date.now()}`,
        status: 'Placed',
        restaurantName: restaurantNames || 'Unknown Restaurant',
        date: new Date().toISOString().split('T')[0],
    };
    mockOrders.unshift(newOrder);
    mockCart = []; // Clear the cart after order is placed
    return simulateNetwork(newOrder, 1500);
}

// --- Mock Maps API ---

const mockAddressSuggestionsDb: Record<string, AddressSuggestion[]> = {
    '123': [{ id: 'place-1', description: '123 Main St, Food City, FC 12345, Foodland' }],
    'park': [
        { id: 'place-2', description: 'Park Avenue, Food City, FC 12345, Foodland' },
        { id: 'place-3', description: 'Central Park, Metroville, MV 54321, Foodland' },
    ],
    'downtown': [{ id: 'place-4', description: '1 Downtown Square, Food City, FC 11111, Foodland' }],
};

const mockAddressDetailsDb: Record<string, AddressDetails> = {
    'place-1': { street: '123 Main St', city: 'Food City', postalCode: '12345', country: 'Foodland' },
    'place-2': { street: 'Park Avenue', city: 'Food City', postalCode: '12345', country: 'Foodland' },
    'place-3': { street: 'Central Park', city: 'Metroville', postalCode: '54321', country: 'Foodland' },
    'place-4': { street: '1 Downtown Square', city: 'Food City', postalCode: '11111', country: 'Foodland' },
};

export const searchAddresses = (query: string): Promise<AddressSuggestion[]> => {
    console.log(`API: Searching addresses for "${query}"`);
    if (!query.trim()) {
        return Promise.resolve([]);
    }
    const lowerQuery = query.toLowerCase();
    const results = Object.keys(mockAddressSuggestionsDb)
        .filter(key => lowerQuery.includes(key))
        .flatMap(key => mockAddressSuggestionsDb[key]);
    return simulateNetwork(results || [], 250);
};

export const getAddressDetails = (placeId: string): Promise<AddressDetails | null> => {
    console.log(`API: Getting details for place ID "${placeId}"`);
    return simulateNetwork(mockAddressDetailsDb[placeId] || null, 300);
};

export const addAddress = (label: string, details: AddressDetails): Promise<Address[]> => {
    console.log('API: Adding new address', { label, details });
    const formattedDetails = `${details.street}, ${details.city}, ${details.postalCode}`;
    const newAddress = { id: `addr-${Date.now()}`, label, details: formattedDetails };
    mockAddresses.push(newAddress);
    return simulateNetwork([...mockAddresses]);
};

const mockCities = [
    { name: 'Riyadh', lat: 24.7136, lng: 46.6753 },
    { name: 'New York', lat: 40.7128, lng: -74.0060 },
    { name: 'London', lat: 51.5074, lng: -0.1278 },
    { name: 'Tokyo', lat: 35.6895, lng: 139.6917 },
];

// Simple distance calculation (not geographically accurate, but fine for a mock)
const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    return Math.sqrt(Math.pow(lat1 - lat2, 2) + Math.pow(lng1 - lng2, 2));
};

export const reverseGeocode = (lat: number, lng: number): Promise<string> => {
    console.log(`API: Reverse geocoding for lat: ${lat}, lng: ${lng}`);
    
    let closestCity = null;
    let minDistance = Infinity;

    for (const city of mockCities) {
        const distance = calculateDistance(lat, lng, city.lat, city.lng);
        if (distance < minDistance) {
            minDistance = distance;
            closestCity = city;
        }
    }
    
    // If the closest city is reasonably close (e.g., within ~500km, which is roughly 5 degrees), use it.
    if (closestCity && minDistance < 5) {
        return simulateNetwork(`${closestCity.name} (Auto)`, 750);
    }
    
    return simulateNetwork(`Your Location (Auto)`, 750);
};


// --- Profile Page & Order Tracking APIs ---

export const getUserProfile = (): Promise<User> => {
    console.log('API: Getting user profile');
    // In a real app, you'd get this based on an auth token. Here we get the first mock user.
    return simulateNetwork(mockUsers[0]);
};

export const updateUserProfile = (updatedProfile: User): Promise<User> => {
    console.log('API: Updating user profile', updatedProfile);
    const userIndex = mockUsers.findIndex(u => u.email === updatedProfile.email);
    if (userIndex > -1) {
        mockUsers[userIndex] = { ...updatedProfile };
        return simulateNetwork(mockUsers[userIndex]);
    }
    return simulateError('User not found for update.');
};

export const removeAddress = (addressId: string): Promise<Address[]> => {
    console.log(`API: Removing address ${addressId}`);
    mockAddresses = mockAddresses.filter(addr => addr.id !== addressId);
    return simulateNetwork([...mockAddresses]);
};

export const getOrders = (status: 'ongoing' | 'past' | 'cancelled'): Promise<Order[]> => {
    console.log(`API: Getting orders with status: ${status}`);
    const filtered = mockOrders.filter(order => {
        if (status === 'ongoing') return ['Placed', 'Preparing', 'On its way'].includes(order.status);
        if (status === 'past') return order.status === 'Delivered';
        if (status === 'cancelled') return order.status === 'Cancelled';
        return false;
    });
    return simulateNetwork(filtered);
};

export const getFavoriteRestaurants = (): Promise<Restaurant[]> => {
    console.log('API: Getting favorite restaurants');
    const favorites = allMockRestaurants.filter(r => mockFavoriteRestaurantIds.has(r.id));
    return simulateNetwork(favorites);
};

export const addFavoriteRestaurant = (restaurantId: string): Promise<{ success: boolean }> => {
    console.log(`API: Adding favorite restaurant ${restaurantId}`);
    mockFavoriteRestaurantIds.add(restaurantId);
    return simulateNetwork({ success: true });
};

export const removeFavoriteRestaurant = (restaurantId: string): Promise<{ success: boolean }> => {
    console.log(`API: Removing favorite restaurant ${restaurantId}`);
    mockFavoriteRestaurantIds.delete(restaurantId);
    return simulateNetwork({ success: true });
};

export const getOrderDetails = (orderId: string): Promise<Order | undefined> => {
    console.log(`API: Getting details for order ${orderId}`);
    return simulateNetwork(mockOrders.find(o => o.id === orderId));
}

export const getRiderLocation = (orderId: string): Promise<LocationPoint | null> => {
    console.log(`API: Getting rider location for order ${orderId}`);
    const currentLoc = riderLocations.get(orderId);
    if (!currentLoc) {
        return simulateNetwork(null, 100);
    }
    // Simulate movement
    const newLoc = {
        lat: currentLoc.lat + (Math.random() - 0.5) * 0.0005,
        lng: currentLoc.lng + (Math.random() - 0.5) * 0.0005,
    };
    riderLocations.set(orderId, newLoc);
    return simulateNetwork(newLoc, 100);
}

// --- Support Mock Data ---
const mockSupportInfo: SupportInfo = {
    phoneNumber: '1-800-FOOD-FAST'
};

let mockChatHistory: ChatMessage[] = [
    { id: 'chat-1', text: 'Hello! How can I help you today?', sender: 'support', timestamp: new Date(Date.now() - 60000 * 5).toISOString() },
    { id: 'chat-2', text: 'Hi, I have a question about my last order.', sender: 'user', timestamp: new Date(Date.now() - 60000 * 4).toISOString() },
    { id: 'chat-3', text: 'Of course, I can help with that. What is the order ID?', sender: 'support', timestamp: new Date(Date.now() - 60000 * 3).toISOString() },
];

// --- Support APIs ---
export const getSupportInfo = (): Promise<SupportInfo> => {
    console.log('API: Fetching support info...');
    return simulateNetwork(mockSupportInfo);
};

export const getChatHistory = (userId: string): Promise<ChatMessage[]> => {
    console.log(`API: Fetching chat history for user ${userId}...`);
    return simulateNetwork([...mockChatHistory]);
};

export const sendChatMessage = (messageText: string, userId: string): Promise<ChatMessage> => {
    console.log(`API: Sending chat message for user ${userId}`);
    const userMessage: ChatMessage = {
        id: `chat-${Date.now()}`,
        text: messageText,
        sender: 'user',
        timestamp: new Date().toISOString()
    };
    mockChatHistory.push(userMessage);

    // Simulate support agent replying after a short delay
    setTimeout(() => {
        const supportReply: ChatMessage = {
            id: `chat-${Date.now() + 1}`,
            text: 'Thank you for your message. An agent will be with you shortly.',
            sender: 'support',
            timestamp: new Date().toISOString()
        };
        mockChatHistory.push(supportReply);
    }, 1500);

    return simulateNetwork(userMessage);
};

// --- Review API ---
export const submitOrderReview = (review: OrderReview): Promise<{ success: boolean }> => {
    console.log('API: Submitting review for order:', review);
    const orderIndex = mockOrders.findIndex(o => o.id === review.orderId);
    if (orderIndex > -1) {
        mockOrders[orderIndex].isReviewed = true;
        return simulateNetwork({ success: true }, 1000);
    }
    return simulateError('Order not found for review.');
};

// --- New Offer APIs ---
export const getOffersForRestaurant = (restaurantId: string): Promise<Offer[]> => {
  console.log(`API: Fetching offers for restaurant ${restaurantId}...`);
  // FIX: Added a type guard to safely access properties on the 'applicableTo' union type before checking the restaurant ID.
  const restaurantOffers = mockOffers.filter(
    offer => offer.applicableTo && typeof offer.applicableTo === 'object' && 'id' in offer.applicableTo && offer.applicableTo.id === restaurantId
  );
  return simulateNetwork(restaurantOffers);
};

export const validateCoupon = (code: string): Promise<Offer | null> => {
    console.log(`API: Validating coupon code "${code}"...`);
    if (!code) return simulateNetwork(null);
    const offer = mockOffers.find(o => o.couponCode?.toUpperCase() === code.toUpperCase());
    return simulateNetwork(offer || null);
};

export const getOfferDetails = (offerId: string): Promise<Offer | undefined> => {
    console.log(`API: Fetching details for offer ${offerId}...`);
    return simulateNetwork(mockOffers.find(o => o.id === offerId));
};

export const getFoodsForOffer = (offerId: string, location: string): Promise<Food[]> => {
    console.log(`API: Fetching foods for offer ${offerId} in ${location}...`);
    const offer = mockOffers.find(o => o.id === offerId);
    if (!offer) {
        return simulateNetwork([]);
    }

    const locationFoods = getFoodsForLocation(location);
    let offerFoods: Food[] = [];

    if (offer.applicableFoods) {
        const applicableFoodIds = new Set(offer.applicableFoods);
        offerFoods = locationFoods.filter(food => applicableFoodIds.has(food.id));
    } else if (offer.applicableTo && typeof offer.applicableTo === 'object' && offer.applicableTo.type === 'RESTAURANT') {
        offerFoods = locationFoods.filter(food => food.restaurantId === offer.applicableTo.id);
    }

    return simulateNetwork(offerFoods);
};

// --- New Tracking API ---
export const logTrackingEvent = (eventName: string, payload: Record<string, any>, userEmail?: string): Promise<{ success: boolean }> => {
    // In a real backend, you'd save this event to a database/analytics service.
    // Here we just log it to the console to simulate the process.
    console.log(
        `[USER TRACKING EVENT]
        User: ${userEmail || 'anonymous'}
        Event: ${eventName}
        Payload: ${JSON.stringify(payload, null, 2)}
        Timestamp: ${new Date().toISOString()}`
    );
    return simulateNetwork({ success: true }, 50); // Simulate a quick network request
};