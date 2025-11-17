import type { Offer, Restaurant, Food, MenuItem, Review, CartItem, Address, Order, User, Vendor, Rider, OperatingHours, CustomizationOption, ChatMessage, Moderator, SupportTicket } from '../types';

// --- UTILITY FUNCTIONS ---
const createExpiryDate = (days: number): string => new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();

const twentyFourSevenHours: OperatingHours = {
    monday: { isOpen: true, slots: [{ open: '00:00', close: '23:59' }] },
    tuesday: { isOpen: true, slots: [{ open: '00:00', close: '23:59' }] },
    wednesday: { isOpen: true, slots: [{ open: '00:00', close: '23:59' }] },
    thursday: { isOpen: true, slots: [{ open: '00:00', close: '23:59' }] },
    friday: { isOpen: true, slots: [{ open: '00:00', close: '23:59' }] },
    saturday: { isOpen: true, slots: [{ open: '00:00', close: '23:59' }] },
    sunday: { isOpen: true, slots: [{ open: '00:00', close: '23:59' }] },
};

const toppingsOption: CustomizationOption = {
  id: 'toppings', name: 'Add Toppings', type: 'MULTIPLE', required: false,
  choices: [ { name: 'Extra Cheese', price: 1.50 }, { name: 'Mushrooms', price: 0.75 }, { name: 'Pepperoni', price: 1.25 } ]
};
const sizeOption: CustomizationOption = {
  id: 'size', name: 'Size', type: 'SINGLE', required: true,
  choices: [ { name: 'Regular', price: 0.00 }, { name: 'Large', price: 3.00 }, { name: 'Extra Large', price: 5.00 } ]
};

// --- SINGLE SOURCE OF TRUTH FOR RESTAURANT & VENDOR DATA ---

const generatedData = (() => {
  const restaurants: Restaurant[] = [];
  const vendors: Vendor[] = [];
  const vendorUsers: User[] = [];
  const vendorPasswords = new Map<string, string>();
  const foods: Food[] = [];

  const restaurantCount = 25;
  const cuisines = ['Italian', 'Mexican', 'Indian', 'Thai', 'Japanese', 'American', 'Chinese', 'French'];

  for (let i = 1; i <= restaurantCount; i++) {
    // 1. Create Restaurant
    const restaurant: Restaurant = {
        id: `restaurant-${i}`,
        logoUrl: `https://picsum.photos/seed/logo${i}/100/100`,
        coverImageUrl: `https://picsum.photos/seed/cover${i}/1200/400`,
        name: `Restaurant Hub ${i}`,
        rating: parseFloat((Math.random() * 2 + 3).toFixed(1)),
        cuisine: cuisines[i % cuisines.length],
        deliveryFee: parseFloat((Math.random() * 5).toFixed(2)),
        deliveryTime: `${Math.floor(Math.random() * 20) + 20}-${Math.floor(Math.random() * 20) + 40} min`,
        address: `${120 + i} Flavor St, Food City`,
        operatingHours: {
            monday: { isOpen: true, slots: [{ open: '09:00', close: '21:00' }] },
            tuesday: { isOpen: true, slots: [{ open: '09:00', close: '21:00' }] },
            wednesday: { isOpen: true, slots: [{ open: '09:00', close: '14:00' }, { open: '17:00', close: '21:00' }] },
            thursday: { isOpen: true, slots: [{ open: '09:00', close: '21:00' }] },
            friday: { isOpen: true, slots: [{ open: '09:00', close: '22:00' }] },
            saturday: { isOpen: true, slots: [{ open: '11:00', close: '22:00' }] },
            sunday: { isOpen: false, slots: [] },
        }
    };
    restaurants.push(restaurant);

    // 2. Create corresponding Vendor
    const statuses: Vendor['status'][] = ['active', 'pending', 'disabled'];
    const vendor: Vendor = {
        id: `vendor-${i}`,
        restaurantId: restaurant.id,
        name: `Vendor ${i}`,
        email: `vendor${i}@example.com`,
        status: statuses[(i - 1) % 3]
    };
    vendors.push(vendor);

    // 3. Create corresponding User & Password for the Vendor
    const user: User = { name: vendor.name, email: vendor.email, phone: `555-01${String(i).padStart(2, '0')}` };
    vendorUsers.push(user);
    vendorPasswords.set(user.email, `vendorpass${i}`);

    // 4. Create Menu Items for the Restaurant
    for (let j = 0; j < 5; j++) {
        const foodId = i * 10 + j;
        const food: Food = {
            id: `food-${foodId}`,
            imageUrl: `https://picsum.photos/seed/food${foodId}/400/300`,
            name: `Delicious Plate ${foodId}`,
            price: parseFloat((Math.random() * 20 + 5).toFixed(2)),
            rating: parseFloat((Math.random() * 2 + 3).toFixed(1)),
            restaurantId: restaurant.id,
            description: 'A beautifully crafted dish made with the freshest ingredients, guaranteed to delight your taste buds.',
            vendor: { name: restaurant.name },
            availability: { type: 'ALL_DAY' }
        };

        if (j === 0 && restaurant.id === 'restaurant-1') {
            food.customizationOptions = [sizeOption, toppingsOption];
            food.name = 'Customizable Pizza';
            food.category = 'Main Course';
        }
        if (j === 1) { food.isPackage = true; food.name = "Lunch Special Package"; food.category = 'Deals'; }
        if (j === 2) { food.category = 'Appetizers'; }
        if (j === 3) { food.category = 'Desserts'; }
        foods.push(food);
    }
  }

  // Add a special 24/7 restaurant
   const diner: Restaurant = {
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
   };
   restaurants.push(diner);
   const dinerVendor: Vendor = { id: 'vendor-26', restaurantId: diner.id, name: 'Diner Manager', email: 'vendor26@example.com', status: 'active' };
   vendors.push(dinerVendor);
   const dinerUser: User = { name: dinerVendor.name, email: dinerVendor.email, phone: '555-0126' };
   vendorUsers.push(dinerUser);
   vendorPasswords.set(dinerUser.email, 'vendorpass26');
   const dinerFood: Food = {
      id: 'food-260',
      imageUrl: `https://picsum.photos/seed/food260/400/300`,
      name: `Late Night Tacos`,
      price: 8.99,
      rating: 4.6,
      restaurantId: diner.id,
      description: 'Perfect for a late-night craving.',
      vendor: { name: diner.name },
      availability: { type: 'CUSTOM_TIME', startTime: '22:00', endTime: '06:00' }
   };
   foods.push(dinerFood);


  return { restaurants, vendors, vendorUsers, vendorPasswords, foods };
})();


// --- EXPORTED MOCK DATA (DERIVED FROM THE SINGLE SOURCE) ---

export const allMockRestaurants: Restaurant[] = generatedData.restaurants;
export let mockVendors: Vendor[] = generatedData.vendors;
export let allMockFoods: Food[] = generatedData.foods;

// --- STATIC MOCK DATA ---

export const mockOffers: Offer[] = [
  { id: 'offer-1', imageUrl: 'https://picsum.photos/seed/banner1/1200/400', title: '50% Off This Weekend', description: 'Get a massive 50% off on all orders this weekend. Don\'t miss out!', discountType: 'PERCENTAGE', discountValue: 50, applicableTo: 'ALL', couponCode: 'WEEKEND50', expiry: createExpiryDate(3) },
  { id: 'offer-2', imageUrl: 'https://picsum.photos/seed/banner2/1200/400', title: 'Free Delivery on Orders Over ৳50', description: 'Enjoy free delivery from your favorite restaurants when you spend ৳50 or more.', minOrderValue: 50, applicableTo: 'ALL', couponCode: 'FREEDEL' },
  { id: 'offer-3', imageUrl: 'https://picsum.photos/seed/banner3/1200/400', title: '20% Off at Restaurant Hub 1', description: 'A special treat for our loyal customers at Restaurant Hub 1. Get 20% off your next order.', discountType: 'PERCENTAGE', discountValue: 20, applicableTo: { type: 'RESTAURANT', id: 'restaurant-1' }},
  { id: 'offer-4', imageUrl: 'https://picsum.photos/seed/banner4/1200/400', title: '৳10 Off Your Next Order', description: 'Get a flat ৳10 discount on any order over ৳30. Use code TAKE10.', discountType: 'FIXED', discountValue: 10, minOrderValue: 30, applicableTo: 'ALL', couponCode: 'TAKE10' },
  { id: 'offer-5', imageUrl: 'https://picsum.photos/seed/banner5/1200/400', title: 'Combo Meal Deal', description: 'Get a special price on our new combo meal, including a burger, fries, and a drink!', applicableFoods: ['food-1', 'food-2'] },
  { id: 'offer-6', imageUrl: 'https://picsum.photos/seed/banner6/1200/400', title: 'Expired Deal', description: 'This deal was great, but it has expired.', expiry: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
];

export let mockCart: CartItem[] = [];
export let mockAddresses: Address[] = [
    { id: 'addr-1', label: 'Home', details: '123 Main St, Apt 4B, Anytown, 12345' },
    { id: 'addr-2', label: 'Work', details: '456 Business Blvd, Suite 500, Workville, 67890' },
];

export const allMockReviews: Review[] = Array.from({ length: 50 }, (_, i) => ({
  id: `review-${i}`, author: ['Alex', 'Jamie', 'Sam', 'Taylor', 'Chris', 'Jordan'][i % 6],
  rating: parseFloat((Math.random() * 2 + 3).toFixed(1)),
  text: 'This was an amazing experience, the food was delicious and the service was top-notch. Highly recommended!',
  avatarUrl: `https://i.pravatar.cc/48?u=person${i}`,
}));

export const mockModerators: Moderator[] = [
    { id: 'mod-1', name: 'Mod One', email: 'mod1@example.com', permissions: ['manage_users', 'review_content'] },
];

export let mockUsers: User[] = [
    { name: 'Alex Doe', email: 'alex.doe@example.com', phone: '123-456-7890', age: 30, gender: 'male' },
    ...mockModerators.map(m => ({ name: m.name, email: m.email, phone: '555-0199' })),
    ...generatedData.vendorUsers,
];

export const mockUserPasswords = new Map<string, string>([
    ['alex.doe@example.com', 'password123'],
    ['mod1@example.com', 'modpass1'],
    ...generatedData.vendorPasswords
]);

const foodToMenuItem = (food: Food): MenuItem => ({
    id: food.id, name: food.name, description: food.description, price: food.price, imageUrl: food.imageUrl,
    restaurantId: food.restaurantId, restaurantName: food.vendor.name, customizationOptions: food.customizationOptions,
    isPackage: food.isPackage, category: food.category, availability: food.availability,
});

export let mockOrders: Order[] = [
  { id: 'ORDER-1', status: 'Delivered', date: '2023-10-26, 1:30 PM', placedAt: '2023-10-26T13:30:00Z', restaurantName: 'Restaurant Hub 1', items: [ { cartItemId: 'ci-1', baseItem: foodToMenuItem(allMockFoods[0]), quantity: 2, selectedCustomizations: [], totalPrice: allMockFoods[0].price * 2 }, ], subtotal: 25.98, deliveryFee: 5.99, total: 31.97, discount: 0, address: mockAddresses[0], paymentMethod: 'Credit Card', deliveryOption: 'home', customerName: 'Alex Doe', riderId: 'rider-1', restaurantLocation: { lat: 34.0522, lng: -118.2437 }, deliveryLocation: { lat: 34.0622, lng: -118.2537 } },
  { id: 'ORDER-2', status: 'On its way', date: new Date().toLocaleString(), placedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(), restaurantName: 'Restaurant Hub 1', items: [ { cartItemId: 'ci-2', baseItem: foodToMenuItem(allMockFoods[1]), quantity: 1, selectedCustomizations: [], totalPrice: allMockFoods[1].price }, ], subtotal: 12.50, deliveryFee: 5.99, total: 18.49, discount: 0, address: mockAddresses[1], paymentMethod: 'Cash on Delivery', deliveryOption: 'home', customerName: 'Alex Doe', riderId: 'rider-1', restaurantLocation: { lat: 34.0522, lng: -118.2437 }, deliveryLocation: { lat: 34.0622, lng: -118.2537 }, acceptedAt: new Date(Date.now() - 12 * 60 * 1000).toISOString() },
  { id: 'ORDER-3', status: 'Preparing', date: new Date().toLocaleString(), placedAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(), restaurantName: 'Restaurant Hub 2', items: [ { cartItemId: 'ci-3', baseItem: foodToMenuItem(allMockFoods[10]), quantity: 1, selectedCustomizations: [], totalPrice: allMockFoods[10].price }, { cartItemId: 'ci-4', baseItem: foodToMenuItem(allMockFoods[11]), quantity: 1, selectedCustomizations: [], totalPrice: allMockFoods[11].price }, ], subtotal: 20.00, deliveryFee: 4.50, total: 24.50, discount: 0, address: mockAddresses[0], paymentMethod: 'Online', deliveryOption: 'home', customerName: 'Alex Doe', riderId: 'rider-1', restaurantLocation: { lat: 34.055, lng: -118.25 }, deliveryLocation: { lat: 34.045, lng: -118.23 }, distance: 3.2, estimatedDeliveryTime: "25-30 min", acceptedAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(), moderatorNote: 'Vendor called, oven issues.' },
  { id: 'ORDER-4', status: 'On its way', date: new Date().toLocaleString(), placedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), restaurantName: 'Restaurant Hub 1', items: [ { cartItemId: 'ci-5', baseItem: foodToMenuItem(allMockFoods[2]), quantity: 1, selectedCustomizations: [], totalPrice: allMockFoods[2].price }, ], subtotal: 8.00, deliveryFee: 3.00, total: 11.00, discount: 0, address: mockAddresses[1], paymentMethod: 'Online', deliveryOption: 'home', customerName: 'Alex Doe', distance: 2.5, estimatedDeliveryTime: "20-25 min", restaurantLocation: { lat: 34.0522, lng: -118.2437 }, deliveryLocation: { lat: 34.0622, lng: -118.2537 }, acceptedAt: new Date(Date.now() - 25 * 60 * 1000).toISOString() },
  { id: 'ORDER-5', status: 'Placed', date: new Date(Date.now() - 10 * 60 * 1000).toLocaleString(), placedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(), restaurantName: 'Restaurant Hub 1', items: [ { cartItemId: 'ci-6', baseItem: foodToMenuItem(allMockFoods[3]), quantity: 2, selectedCustomizations: [], totalPrice: allMockFoods[3].price * 2 }, ], subtotal: 15.00, deliveryFee: 3.00, total: 18.00, discount: 0, address: mockAddresses[0], paymentMethod: 'Cash on Delivery', deliveryOption: 'home', customerName: 'Valued Customer' },
  { id: 'ORDER-6', status: 'On its way', date: new Date().toLocaleString(), placedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(), restaurantName: 'Restaurant Hub 2', items: [ { cartItemId: 'ci-7', baseItem: foodToMenuItem(allMockFoods[12]), quantity: 1, selectedCustomizations: [], totalPrice: allMockFoods[12].price }, ], subtotal: 9.50, deliveryFee: 4.00, total: 13.50, discount: 0, address: mockAddresses[1], paymentMethod: 'Online', deliveryOption: 'home', customerName: 'Sam Jones', distance: 1.8, estimatedDeliveryTime: "15-20 min", restaurantLocation: { lat: 34.055, lng: -118.25 }, deliveryLocation: { lat: 34.065, lng: -118.26 }, acceptedAt: new Date(Date.now() - 8 * 60 * 1000).toISOString() }
];

export const mockRiders: Rider[] = [
    { id: 'rider-1', name: 'John Rider', phone: '1700000000', vehicle: 'Honda Activa', rating: 4.8, location: { lat: 34.045, lng: -118.24 }, isOnline: true },
    { id: 'rider-2', name: 'Jane Driver', phone: '1800000000', vehicle: 'Suzuki Gixxer', rating: 4.9, location: { lat: 34.06, lng: -118.25 }, isOnline: true },
    { id: 'rider-3', name: 'Mike Bike', phone: '1900000000', vehicle: 'Yamaha FZ', rating: 4.6, location: { lat: 34.05, lng: -118.23 }, isOnline: false },
    { id: 'rider-4', name: 'Sara Speed', phone: '1600000000', vehicle: 'TVS Apache', rating: 4.7, location: { lat: 34.055, lng: -118.245 }, isOnline: true },
];

export const mockChatHistory = new Map<string, ChatMessage[]>();
export let mockSupportTickets: SupportTicket[] = [
    { id: 'ticket-1', userEmail: 'alex.doe@example.com', subject: 'Wrong item delivered', status: 'Open', lastUpdate: '2 hours ago' },
    { id: 'ticket-2', userEmail: 'customer2@example.com', subject: 'Late delivery inquiry', status: 'In Progress', lastUpdate: '1 day ago' },
    { id: 'ticket-3', userEmail: 'customer3@example.com', subject: 'Payment issue', status: 'Open', lastUpdate: '5 minutes ago' },
];