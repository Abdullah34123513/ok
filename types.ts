export interface Offer {
  id: string;
  imageUrl: string;
  title: string;
  description: string;
  expiry?: string; // ISO 8601 string
  discountType?: 'PERCENTAGE' | 'FIXED';
  discountValue?: number;
  minOrderValue?: number;
  applicableTo?: 'ALL' | { type: 'RESTAURANT', id: string };
  couponCode?: string;
}

export interface AppliedOffer extends Offer {
    discountAmount: number;
}

export interface Restaurant {
  id: string;
  logoUrl: string;
  coverImageUrl: string;
  name: string;
  rating: number;
  cuisine: string;
  deliveryFee: number;
  deliveryTime: string; // e.g., "25-35 min"
  address: string;
  isFavorite?: boolean;
}

export interface CustomizationChoice {
    name: string;
    price: number; // Price difference, can be 0
}

export interface CustomizationOption {
    id: string;
    name: string; // e.g., "Size", "Toppings"
    type: 'SINGLE' | 'MULTIPLE'; // SINGLE for radio, MULTIPLE for checkbox
    required: boolean;
    choices: CustomizationChoice[];
}

export interface Food {
  id: string;
  imageUrl: string;
  name: string;
  price: number; // Base price
  rating: number;
  restaurantId: string;
  description: string;
  vendor: {
    name: string;
  };
  customizationOptions?: CustomizationOption[];
  isPackage?: boolean;
}

export interface MenuItem {
    id: string;
    name: string;
    description: string;
    price: number;
    imageUrl: string;
    restaurantId: string;
    restaurantName: string;
    customizationOptions?: CustomizationOption[];
    isPackage?: boolean;
}

export interface SelectedCustomization {
    optionId: string;
    optionName: string;
    choices: CustomizationChoice[];
}

// CartItem is now a more complex object to handle unique configurations
export interface CartItem {
    cartItemId: string; // A unique ID for this specific cart entry, e.g., `food-1-a8b3f`
    quantity: number;
    baseItem: MenuItem;
    selectedCustomizations: SelectedCustomization[];
    totalPrice: number; // (base price + customization prices) * quantity
}


export interface MenuCategory {
    name: string;
    items: MenuItem[];
}

export interface Review {
    id: string;
    author: string;
    rating: number;
    text: string;
    avatarUrl: string;
}

export interface PaginatedFoods {
  foods: Food[];
  hasMore: boolean;
  nextPage: number;
}

export interface PaginatedRestaurants {
  restaurants: Restaurant[];
  hasMore: boolean;
  nextPage: number;
}


export interface SearchResult {
    restaurants: Restaurant[];
    foods: Food[];
}

export interface Address {
    id:string;
    label: string;
    details: string;
}

export interface AddressSuggestion {
    id: string; // Corresponds to a "place_id"
    description: string;
}

export interface AddressDetails {
    street: string;
    city: string;
    postalCode: string;
    country: string;
}

export interface LocationPoint {
    lat: number;
    lng: number;
}

export interface Rider {
    name: string;
    phone: string;
    vehicle: string;
    rating: number;
    location: LocationPoint;
}

export interface Order {
    id: string;
    items: CartItem[];
    subtotal: number;
    deliveryFee: number;
    total: number;
    discount?: number;
    appliedOfferId?: string;
    address: Address;
    paymentMethod: string;
    deliveryOption: string;
    status: 'Pending' | 'Placed' | 'Preparing' | 'On its way' | 'Delivered' | 'Cancelled';
    restaurantName: string; 
    date: string; 
    // New fields for order tracking
    restaurantLocation?: LocationPoint;
    deliveryLocation?: LocationPoint;
    estimatedDeliveryTime?: string;
    rider?: Rider;
    isReviewed?: boolean;
}

export interface OrderReview {
    orderId: string;
    itemReviews: {
        itemId: string;
        rating: number;
        comment?: string;
    }[];
}

export interface User {
    name: string;
    email: string;
    phone: string;
    authToken?: string;
    // New fields for user behavior analysis
    age?: number;
    gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
}

// --- Auth Types ---
export interface LoginCredentials {
    email: string;
    password: string;
}

export interface SignupData {
    name: string;
    email: string;
    phone: string;
    password: string;
    // New fields for user behavior analysis
    age?: number;
    gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
}

export interface AuthResponse {
    user: User;
    token: string;
}

export interface ChatMessage {
    id: string;
    text: string;
    sender: 'user' | 'support';
    timestamp: string;
}

export interface SupportInfo {
    phoneNumber: string;
}