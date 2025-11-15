import type { Offer, Restaurant, Food, MenuItem, Review, CartItem, Address, Order, User, Vendor, Rider, OperatingHours, CustomizationOption } from '../types';

// --- Mock Databases ---
export let mockUsers: User[] = [
    { name: 'Alex Doe', email: 'alex.doe@example.com', phone: '123-456-7890', age: 30, gender: 'male' },
    { name: 'Vendor One', email: 'vendor1@example.com', phone: '555-0101' },
];

// In a real app, passwords would be hashed. For this mock, we'll store them in a separate map.
export const mockUserPasswords = new Map<string, string>([
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

export const mockOffers: Offer[] = [
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

export let allMockRestaurants: Restaurant[] = Array.from({ length: 20 }, (_, i) => createMockRestaurant(i + 1));
export let allMockFoods: Food[] = Array.from({ length: 40 }, (_, i) => createMockFood(i + 1, allMockRestaurants[(i % 10)]));


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


export let mockCart: CartItem[] = [];

export let mockAddresses: Address[] = [
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


export let mockOrders: Order[] = [
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

const riderOngoingOrder1: Order = {
    id: 'ORDER-1007',
    status: 'Preparing', // Rider accepted, needs to go to pickup
    date: new Date(Date.now() - 15 * 60 * 1000).toLocaleString('en-US'),
    restaurantName: 'Restaurant Hub 2',
    items: [ { cartItemId: 'ci-8', baseItem: foodToMenuItem(restaurant2Foods[2]), quantity: 2, selectedCustomizations: [], totalPrice: restaurant2Foods[2].price * 2 } ],
    subtotal: restaurant2Foods[2].price * 2,
    deliveryFee: 2.80,
    total: restaurant2Foods[2].price * 2 + 2.80,
    discount: 0,
    address: { id: 'addr-6', label: 'Work', details: '99 Business Rd, Corp Park' },
    paymentMethod: 'cod',
    deliveryOption: 'home',
    customerName: 'Peter Jones',
    riderId: 'rider-1',
};
mockOrders.unshift(riderOngoingOrder1);

const riderOngoingOrder2: Order = {
    id: 'ORDER-1008',
    status: 'On its way', // Rider has picked up, is delivering
    date: new Date(Date.now() - 10 * 60 * 1000).toLocaleString('en-US'),
    restaurantName: '24/7 Diner',
    items: [ { cartItemId: 'ci-9', baseItem: foodToMenuItem(allMockFoods.find(f => f.restaurantId === 'restaurant-5')!), quantity: 1, selectedCustomizations: [], totalPrice: allMockFoods.find(f => f.restaurantId === 'restaurant-5')!.price } ],
    subtotal: allMockFoods.find(f => f.restaurantId === 'restaurant-5')!.price,
    deliveryFee: 1.50,
    total: allMockFoods.find(f => f.restaurantId === 'restaurant-5')!.price + 1.50,
    discount: 0,
    address: { id: 'addr-7', label: 'Home', details: '321 Residential St, Anytown' },
    paymentMethod: 'online',
    deliveryOption: 'home',
    customerName: 'Susan Miller',
    riderId: 'rider-1',
};
mockOrders.unshift(riderOngoingOrder2);

const riderDeliveredOrder: Order = {
    id: 'ORDER-1006',
    status: 'Delivered',
    date: new Date(Date.now() - 2 * 60 * 60 * 1000).toLocaleString('en-US'), // 2 hours ago
    restaurantName: 'Restaurant Hub 1',
    items: [ { cartItemId: 'ci-7', baseItem: foodToMenuItem(restaurant1Foods[1]), quantity: 1, selectedCustomizations: [], totalPrice: restaurant1Foods[1].price } ],
    subtotal: restaurant1Foods[1].price,
    deliveryFee: 2.50,
    total: restaurant1Foods[1].price + 2.50,
    discount: 0,
    address: { id: 'addr-5', label: 'Home', details: '101 New St, Anytown' },
    paymentMethod: 'online',
    deliveryOption: 'home',
    customerName: 'Ken Adams',
    riderId: 'rider-1',
    isReviewed: false,
};
mockOrders.push(riderDeliveredOrder);


export const allMockReviews: Review[] = Array.from({ length: 15 }, (_, i) => ({
    id: `review-${i+1}`,
    author: `Customer ${i+1}`,
    rating: parseFloat((Math.random() * 1.5 + 3.5).toFixed(1)),
    text: 'This was an amazing experience! The food was delicious and the service was top-notch. Highly recommended.',
    avatarUrl: `https://i.pravatar.cc/48?u=customer${i+1}`
}));

export const mockChatHistory = new Map<string, any[]>();

export const mockVendors: Vendor[] = [
    { id: 'vendor-1', restaurantId: 'restaurant-1', name: 'Vendor One', email: 'vendor1@example.com' }
];

export const mockRiders: Rider[] = [
    { id: 'rider-1', name: 'John Rider', phone: '1700000000', vehicle: 'Motorcycle', rating: 4.8, location: { lat: 34.0522, lng: -118.2437 } }
];
