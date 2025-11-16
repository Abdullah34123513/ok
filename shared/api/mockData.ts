

import type { Offer, Restaurant, Food, MenuItem, Review, CartItem, Address, Order, User, Vendor, Rider, OperatingHours, CustomizationOption, ChatMessage } from '../types';

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
    expiry: createExpiryDate(3)
  },
  {
    id: 'offer-2',
    imageUrl: 'https://picsum.photos/seed/banner2/1200/400',
    title: 'Free Delivery on Orders Over ৳50',
    description: 'Enjoy free delivery from your favorite restaurants when you spend ৳50 or more.',
    minOrderValue: 50,
    applicableTo: 'ALL',
    couponCode: 'FREEDEL',
  },
  {
    id: 'offer-3',
    imageUrl: 'https://picsum.photos/seed/banner3/1200/400',
    title: '20% Off at Restaurant Hub 1',
    description: 'A special treat for our loyal customers at Restaurant Hub 1. Get 20% off your next order.',
    discountType: 'PERCENTAGE',
    discountValue: 20,
    applicableTo: { type: 'RESTAURANT', id: 'restaurant-1' },
  },
  {
    id: 'offer-4',
    imageUrl: 'https://picsum.photos/seed/banner4/1200/400',
    title: '৳10 Off Your Next Order',
    description: 'Get a flat ৳10 discount on any order over ৳30. Use code TAKE10.',
    discountType: 'FIXED',
    discountValue: 10,
    minOrderValue: 30,
    applicableTo: 'ALL',
    couponCode: 'TAKE10'
  },
  {
    id: 'offer-5',
    imageUrl: 'https://picsum.photos/seed/banner5/1200/400',
    title: 'Combo Meal Deal',
    description: 'Get a special price on our new combo meal, including a burger, fries, and a drink!',
    applicableFoods: ['food-1', 'food-2'] // Assuming these IDs exist
  },
  {
    id: 'offer-6',
    imageUrl: 'https://picsum.photos/seed/banner6/1200/400',
    title: 'Expired Deal',
    description: 'This deal was great, but it has expired.',
    expiry: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  },
];

export const allMockRestaurants: Restaurant[] = Array.from({ length: 25 }, (_, i) => createMockRestaurant(i + 1));
allMockRestaurants.push({
  id: `restaurant-26`,
  logoUrl: `https://picsum.photos/seed/logo26/100/100`,
  coverImageUrl: `https://picsum.photos/seed/cover26/1200/400`,
  name: `24/7 Diner`,
  rating: 4.8,
  cuisine: 'American',
  deliveryFee: 3.50,
  deliveryTime: '15-25 min',
  address: `125 Flavor St, Food City`,
  operatingHours: twentyFourSevenHours
});

export const mockVendors: Vendor[] = [
    { id: 'vendor-1', restaurantId: 'restaurant-1', name: 'Vendor One', email: 'vendor1@example.com' },
];

export let mockCart: CartItem[] = [];
export let mockAddresses: Address[] = [
    { id: 'addr-1', label: 'Home', details: '123 Main St, Apt 4B, Anytown, 12345' },
    { id: 'addr-2', label: 'Work', details: '456 Business Blvd, Suite 500, Workville, 67890' },
];

const toppingsOption: CustomizationOption = {
  id: 'toppings',
  name: 'Add Toppings',
  type: 'MULTIPLE',
  required: false,
  choices: [
    { name: 'Extra Cheese', price: 1.50 },
    { name: 'Mushrooms', price: 0.75 },
    { name: 'Pepperoni', price: 1.25 },
  ],
};

const sizeOption: CustomizationOption = {
  id: 'size',
  name: 'Size',
  type: 'SINGLE',
  required: true,
  choices: [
    { name: 'Regular', price: 0.00 },
    { name: 'Large', price: 3.00 },
    { name: 'Extra Large', price: 5.00 },
  ],
};

export const allMockFoods: Food[] = allMockRestaurants.flatMap(r =>
  Array.from({ length: 5 }, (_, i) => {
    const food = createMockFood(Number(r.id.split('-')[1]) * 10 + i, r);
    if (i === 0 && r.id === 'restaurant-1') {
        food.customizationOptions = [sizeOption, toppingsOption];
        food.name = 'Customizable Pizza';
        food.category = 'Main Course';
    }
    if (i === 1) {
        food.isPackage = true;
        food.name = "Lunch Special Package";
        food.category = 'Deals';
    }
    if (i === 2) {
        food.category = 'Appetizers';
    }
    if (i === 3) {
        food.category = 'Desserts';
    }
    if(i === 4 && r.name === '24/7 Diner') {
        food.name = 'Late Night Tacos';
        food.availability = { type: 'CUSTOM_TIME', startTime: '22:00', endTime: '06:00' };
    }
    return food;
  })
);

export const allMockReviews: Review[] = Array.from({ length: 50 }, (_, i) => ({
  id: `review-${i}`,
  author: ['Alex', 'Jamie', 'Sam', 'Taylor', 'Chris', 'Jordan'][i % 6],
  rating: parseFloat((Math.random() * 2 + 3).toFixed(1)),
  text: 'This was an amazing experience, the food was delicious and the service was top-notch. Highly recommended!',
  avatarUrl: `https://i.pravatar.cc/48?u=person${i}`,
}));

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
    id: 'ORDER-1',
    status: 'Delivered',
    date: '2023-10-26, 1:30 PM',
    restaurantName: 'Restaurant Hub 1',
    items: [
      { cartItemId: 'ci-1', baseItem: foodToMenuItem(allMockFoods[0]), quantity: 2, selectedCustomizations: [], totalPrice: allMockFoods[0].price * 2 },
    ],
    subtotal: 25.98,
    deliveryFee: 5.99,
    total: 31.97,
    discount: 0,
    address: mockAddresses[0],
    paymentMethod: 'Credit Card',
    deliveryOption: 'home',
    customerName: 'Alex Doe',
    riderId: 'rider-1',
    restaurantLocation: { lat: 34.0522, lng: -118.2437 },
    deliveryLocation: { lat: 34.0622, lng: -118.2537 },
  },
  {
    id: 'ORDER-2',
    status: 'On its way',
    date: new Date().toLocaleString(),
    restaurantName: 'Restaurant Hub 1',
    items: [
       { cartItemId: 'ci-2', baseItem: foodToMenuItem(allMockFoods[1]), quantity: 1, selectedCustomizations: [], totalPrice: allMockFoods[1].price },
    ],
    subtotal: 12.50,
    deliveryFee: 5.99,
    total: 18.49,
    discount: 0,
    address: mockAddresses[1],
    paymentMethod: 'Cash on Delivery',
    deliveryOption: 'home',
    customerName: 'Alex Doe',
    riderId: 'rider-1',
    restaurantLocation: { lat: 34.0522, lng: -118.2437 },
    deliveryLocation: { lat: 34.0622, lng: -118.2537 },
    acceptedAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(), // 12 mins ago
  },
   {
    id: 'ORDER-3',
    status: 'Preparing', // Rider is going to pickup
    date: new Date().toLocaleString(),
    restaurantName: 'Restaurant Hub 2',
    items: [
       { cartItemId: 'ci-3', baseItem: foodToMenuItem(allMockFoods[10]), quantity: 1, selectedCustomizations: [], totalPrice: allMockFoods[10].price },
       { cartItemId: 'ci-4', baseItem: foodToMenuItem(allMockFoods[11]), quantity: 1, selectedCustomizations: [], totalPrice: allMockFoods[11].price },
    ],
    subtotal: 20.00,
    deliveryFee: 4.50,
    total: 24.50,
    discount: 0,
    address: mockAddresses[0],
    paymentMethod: 'Online',
    deliveryOption: 'home',
    customerName: 'Alex Doe',
    riderId: 'rider-1',
    restaurantLocation: { lat: 34.055, lng: -118.25 },
    deliveryLocation: { lat: 34.045, lng: -118.23 },
    distance: 3.2,
    estimatedDeliveryTime: "25-30 min",
    acceptedAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(), // 2 mins ago
  },
  {
    id: 'ORDER-4',
    status: 'On its way', // Ready for pickup by a rider
    date: new Date().toLocaleString(),
    restaurantName: 'Restaurant Hub 1',
    items: [
       { cartItemId: 'ci-5', baseItem: foodToMenuItem(allMockFoods[2]), quantity: 1, selectedCustomizations: [], totalPrice: allMockFoods[2].price },
    ],
    subtotal: 8.00,
    deliveryFee: 3.00,
    total: 11.00,
    discount: 0,
    address: mockAddresses[1],
    paymentMethod: 'Online',
    deliveryOption: 'home',
    customerName: 'Alex Doe',
    distance: 2.5,
    estimatedDeliveryTime: "20-25 min",
    restaurantLocation: { lat: 34.0522, lng: -118.2437 },
    deliveryLocation: { lat: 34.0622, lng: -118.2537 },
    acceptedAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(), // 25 mins ago
  },
  {
    id: 'ORDER-5',
    status: 'Placed', // New order for vendor
    date: new Date().toLocaleString(),
    restaurantName: 'Restaurant Hub 1',
    items: [
       { cartItemId: 'ci-6', baseItem: foodToMenuItem(allMockFoods[3]), quantity: 2, selectedCustomizations: [], totalPrice: allMockFoods[3].price * 2 },
    ],
    subtotal: 15.00,
    deliveryFee: 3.00,
    total: 18.00,
    discount: 0,
    address: mockAddresses[0],
    paymentMethod: 'Cash on Delivery',
    deliveryOption: 'home',
    customerName: 'Valued Customer',
  },
  {
    id: 'ORDER-6',
    status: 'On its way', // Ready for pickup
    date: new Date().toLocaleString(),
    restaurantName: 'Restaurant Hub 2',
    items: [
       { cartItemId: 'ci-7', baseItem: foodToMenuItem(allMockFoods[12]), quantity: 1, selectedCustomizations: [], totalPrice: allMockFoods[12].price },
    ],
    subtotal: 9.50,
    deliveryFee: 4.00,
    total: 13.50,
    discount: 0,
    address: mockAddresses[1],
    paymentMethod: 'Online',
    deliveryOption: 'home',
    customerName: 'Sam Jones',
    distance: 1.8,
    estimatedDeliveryTime: "15-20 min",
    restaurantLocation: { lat: 34.055, lng: -118.25 },
    deliveryLocation: { lat: 34.065, lng: -118.26 },
    acceptedAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(), // 8 mins ago
  }
];

export const mockRiders: Rider[] = [
    { id: 'rider-1', name: 'John Rider', phone: '1700000000', vehicle: 'Honda Activa', rating: 4.8, location: { lat: 34.045, lng: -118.24 } },
];

export const mockChatHistory = new Map<string, ChatMessage[]>();