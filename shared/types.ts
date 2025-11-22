
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
  moderatorId?: string;
  adminId?: string;
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

export interface TimeSlot {
  open: string; // e.g., "09:00"
  close: string; // e.g., "21:00"
}

export interface OperatingHoursForDay {
  isOpen: boolean;
  slots: TimeSlot[];
}

export interface OperatingHours {
  monday: OperatingHoursForDay;
  tuesday: OperatingHoursForDay;
  wednesday: OperatingHoursForDay;
  thursday: OperatingHoursForDay;
  friday: OperatingHoursForDay;
  saturday: OperatingHoursForDay;
  sunday: OperatingHoursForDay;
}

export interface LocationPoint {
  lat: number;
  lng: number;
}

export interface Area {
  id: string;
  name: string;
  center?: LocationPoint;
  radius?: number; // in meters
  hasWarehouseAccess?: boolean; // New field: Moderator controls this
}


export interface Restaurant {
  id: string;
  type: 'RESTAURANT' | 'GROCERY' | 'WAREHOUSE'; // New field
  logoUrl: string;
  coverImageUrl: string;
  name: string;
  rating: number;
  cuisine: string;
  deliveryFee: number;
  deliveryTime: string;
  address: string;
  location?: LocationPoint;
  isFavorite?: boolean;
  operatingHours?: OperatingHours;
  areaId?: string;
}

export interface ItemAvailability {
  type: 'ALL_DAY' | 'CUSTOM_TIME';
  startTime?: string; // e.g., "17:00"
  endTime?: string; // e.g., "22:00"
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
  availability?: ItemAvailability;
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
  availability?: ItemAvailability;
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

export interface FlashSaleCampaign {
    isActive: boolean;
    endTime: string; // ISO String
    discountPercentage: number;
    itemIds: string[];
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
  distance?: number;
  riderId?: string;
  placedAt?: string;
  acceptedAt?: string;
  moderatorNote?: string;
  
  // New fields
  deliveryInstructions?: string;
  tip?: number;
  deliveryOtp?: string;
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
  location?: LocationPoint;
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

// --- Vendor & Rider ---

export interface ConversationSummary {
  customerId: string; // user email
  customerName: string;
  lastMessage: string;
  timestamp: string;
  hasUnread: boolean;
}
export interface Vendor {
  id: string;
  restaurantId: string;
  name: string;
  email: string;
  status?: 'active' | 'disabled' | 'pending';
  areaId?: string;
}

export interface Moderator {
  id: string;
  name: string;
  email: string;
  permissions: string[];
}

export interface Admin {
    id: string;
    name: string;
    email: string;
    role: 'SUPER_ADMIN';
}

export interface Rider {
  id: string;
  name: string;
  phone: string;
  vehicle: string;
  rating: number;
  location: LocationPoint;
  isOnline?: boolean;
  areaId?: string;
}

export interface RiderStats {
    todayEarnings: number;
    completedTrips: number;
    rating: number;
}

export interface VendorDashboardSummary {
  totalRevenue: number;
  totalOrders: number;
  activeOrders: number;
  averageItemRating: number;
}

export interface SupportTicket {
    id: string;
    userEmail: string;
    subject: string;
    status: 'Open' | 'In Progress' | 'Closed';
    lastUpdate: string;
}

export interface ModeratorDashboardSummary {
    activeRiders: number;
    newOrdersToday: number;
    ongoingOrders: number;
    completedOrders: number;
    cancelledOrders: number;
    openSupportTickets: number;
}

export interface AdminDashboardSummary {
    totalRevenue: number;
    netProfit: number;
    totalOrders: number;
    activeUsers: number;
    activeVendors: number;
    activeRiders: number;
}

export interface SystemAlert {
    id: string;
    type: 'vendor_rating' | 'rider_conduct' | 'system';
    severity: 'low' | 'medium' | 'high';
    title: string;
    message: string;
    entityId?: string;
    timestamp: string;
}

// --- Finance ---
export type ExpenseCategory = 'Rider Salary' | 'Hosting Cost' | 'Marketing' | 'Office Supplies' | 'Maintenance' | 'Other';

export interface Expense {
    id: string;
    category: ExpenseCategory;
    amount: number;
    date: string; // ISO Date string
    description: string;
}

export interface MonthlyFinancialReport {
    month: string; // "Jan 2023"
    year: number;
    monthIndex: number; // 0-11
    revenue: number;
    expenses: number;
    profit: number;
    expenseBreakdown: Record<ExpenseCategory, number>;
}
