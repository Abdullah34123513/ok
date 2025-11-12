// --- Authentication ---
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  name: string;
  email: string;
  phone: string;
  age?: number;
  gender?: User['gender'];
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  vendorId?: string;
}

// --- Core App Entities ---
export interface User {
  name: string;
  email: string;
  phone: string;
  age?: number;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  authToken?: string;
}

export interface Restaurant {
  id: string;
  logoUrl: string;
  coverImageUrl: string;
  name: string;
  rating: number;
  cuisine: string;
  deliveryFee: number;
  deliveryTime: string;
  address: string;
  isFavorite?: boolean;
}

export interface Food {
  id: string;
  imageUrl: string;
  name: string;
  price: number;
  rating: number;
  restaurantId: string;
  description: string;
  vendor: {
    name: string;
  };
  customizationOptions?: CustomizationOption[];
  isPackage?: boolean;
  category?: string;
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
  category?: string;
}

export interface MenuCategory {
  name: string;
  items: MenuItem[];
}

export interface CustomizationChoice {
  name: string;
  price: number;
}

export interface CustomizationOption {
  id: string;
  name: string;
  type: 'SINGLE' | 'MULTIPLE';
  required: boolean;
  choices: CustomizationChoice[];
}

export interface SelectedCustomization {
  optionId: string;
  optionName: string;
  choices: CustomizationChoice[];
}

export interface Offer {
  id: string;
  imageUrl: string;
  title: string;
  description: string;
  expiry?: string;
  discountType?: 'PERCENTAGE' | 'FIXED';
  discountValue?: number;
  minOrderValue?: number;
  applicableTo?: 'ALL' | { type: 'RESTAURANT'; id: string };
  couponCode?: string;
  applicableFoods?: string[];
}

export interface AppliedOffer extends Offer {
    discountAmount: number;
}


export interface Review {
  id: string;
  author: string;
  rating: number;
  text: string;
  avatarUrl: string;
}

// --- Cart & Order ---

export interface CartItem {
  cartItemId: string;
  baseItem: MenuItem;
  quantity: number;
  selectedCustomizations: SelectedCustomization[];
  totalPrice: number;
}

export interface LocationPoint {
  lat: number;
  lng: number;
}

export interface Order {
  id: string;
  status: 'Pending' | 'Placed' | 'Preparing' | 'On its way' | 'Delivered' | 'Cancelled';
  date: string;
  restaurantName: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  discount: number;
  appliedOfferId?: string;
  address: Address;
  paymentMethod: string;
  deliveryOption: string;
  restaurantLocation?: LocationPoint;
  deliveryLocation?: LocationPoint;
  estimatedDeliveryTime?: string;
  rider?: {
    name: string;
    phone: string;
    vehicle: string;
    rating: number;
    location: LocationPoint;
  };
  isReviewed?: boolean;
  customerName?: string;
}

export interface OrderReview {
  orderId: string;
  itemReviews: {
    itemId: string;
    rating: number;
    comment?: string;
  }[];
}


// --- User Profile & Location ---

export interface Address {
  id: string;
  label: string;
  details: string;
}

export interface AddressSuggestion {
  id: string;
  description: string;
}

export interface AddressDetails {
  street: string;
  city: string;
  postalCode: string;
  country: string;
}

// --- API & Pagination ---

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

// --- Support ---

export interface SupportInfo {
  phoneNumber: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'support';
  timestamp: string;
}

// --- Vendor ---

export interface Vendor {
  id: string;
  restaurantId: string;
  name: string;
}

export interface VendorDashboardSummary {
  totalRevenue: number;
  totalOrders: number;
  activeOrders: number;
  averageItemRating: number;
}
