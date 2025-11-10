import React, { useState, useEffect, useCallback } from 'react';
import * as api from '../services/api';
import type { User, Address, Order, Restaurant } from '../types';
import { useNotification } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';
import { UserCircleIcon, TrashIcon } from '../components/Icons';
import AddressModal from '../components/AddressModal';
import SupportModal from '../components/SupportModal';
import ChatWindow from '../components/ChatWindow';
import ReviewModal from '../components/ReviewModal';

interface ProfilePageProps {
    onChangeLocation: () => void;
}

type ProfileTab = 'profile' | 'addresses' | 'orders' | 'favorites';
type OrderFilter = 'ongoing' | 'past' | 'cancelled';

const ProfilePageSkeleton = () => (
    <div className="container mx-auto px-4 py-6 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Sidebar Skeleton */}
            <aside className="md:col-span-1">
                <div className="bg-white p-4 rounded-lg shadow-md sticky top-24">
                    <div className="text-center mb-4">
                       <div className="w-20 h-20 mx-auto bg-gray-200 rounded-full"></div>
                       <div className="mt-2 h-6 bg-gray-200 rounded w-3/4 mx-auto"></div>
                       <div className="mt-1 h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
                    </div>
                    <div className="flex flex-col space-y-2">
                        <div className="h-10 bg-gray-200 rounded"></div>
                        <div className="h-10 bg-gray-200 rounded"></div>
                        <div className="h-10 bg-gray-200 rounded"></div>
                        <div className="h-10 bg-gray-200 rounded"></div>
                    </div>
                    <div className="mt-6 pt-4 border-t space-y-2">
                        <div className="h-10 bg-gray-200 rounded"></div>
                        <div className="h-10 bg-gray-200 rounded"></div>
                        <div className="h-10 bg-gray-200 rounded"></div>
                    </div>
                </div>
            </aside>

            {/* Content Skeleton */}
            <main className="md:col-span-3">
                <div className="bg-white p-6 rounded-lg shadow-md min-h-[60vh]">
                    <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
                    <div className="space-y-4">
                        <div className="h-12 bg-gray-200 rounded"></div>
                        <div className="h-12 bg-gray-200 rounded"></div>
                        <div className="h-12 bg-gray-200 rounded"></div>
                    </div>
                     <div className="mt-6 h-12 w-32 bg-gray-200 rounded-lg"></div>
                </div>
            </main>
        </div>
    </div>
);


const ProfilePage: React.FC<ProfilePageProps> = ({ onChangeLocation }) => {
    const [activeTab, setActiveTab] = useState<ProfileTab>('profile');
    const [user, setUser] = useState<User | null>(null);
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [favoriteRestaurants, setFavoriteRestaurants] = useState<Restaurant[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [orderFilter, setOrderFilter] = useState<OrderFilter>('ongoing');
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
    const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
    const [isChatWindowOpen, setIsChatWindowOpen] = useState(false);
    const [reviewingOrder, setReviewingOrder] = useState<Order | null>(null);
    const { logout } = useAuth();
    const { showNotification } = useNotification();

    const handleStartChat = () => {
        setIsSupportModalOpen(false);
        setIsChatWindowOpen(true);
    };

    const fetchOrders = useCallback(() => {
        api.getOrders(orderFilter).then(setOrders);
    }, [orderFilter]);

    useEffect(() => {
        const loadAllData = async () => {
            setIsLoading(true);
            try {
                const [profileData, addressesData, favsData] = await Promise.all([
                    api.getUserProfile(),
                    api.getAddresses(),
                    api.getFavoriteRestaurants(),
                ]);
                setUser(profileData);
                setAddresses(addressesData);
                setFavoriteRestaurants(favsData);
            } catch (error) {
                console.error("Failed to load profile data", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadAllData();
    }, []);

    useEffect(() => {
        if (activeTab === 'orders') {
            fetchOrders();
        }
    }, [activeTab, orderFilter, fetchOrders]);
    
    const handleAddressAdded = () => {
        setIsAddressModalOpen(false);
        api.getAddresses().then(setAddresses);
    };

    const handleRemoveAddress = async (id: string) => {
        if (window.confirm('Are you sure you want to remove this address?')) {
            const updatedAddresses = await api.removeAddress(id);
            setAddresses(updatedAddresses);
        }
    };
    
    const handleReviewSubmitted = () => {
        setReviewingOrder(null);
        showNotification('Thank you for your review!', 'success');
        fetchOrders(); // Refetch orders to update the button state
    };
    
    if (isLoading) {
        return <ProfilePageSkeleton />;
    }

    return (
        <>
            <div className="container mx-auto px-4 py-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Sidebar/Tabs */}
                    <aside className="md:col-span-1">
                        <div className="bg-white p-4 rounded-lg shadow-md sticky top-24">
                            <div className="text-center mb-4">
                               <UserCircleIcon className="w-20 h-20 mx-auto text-gray-400"/>
                               <h2 className="mt-2 text-xl font-bold">{user?.name}</h2>
                               <p className="text-sm text-gray-500">{user?.email}</p>
                            </div>
                            <nav className="flex flex-col space-y-2">
                                <TabButton id="profile" label="Profile Info" activeTab={activeTab} onClick={setActiveTab} />
                                <TabButton id="addresses" label="My Addresses" activeTab={activeTab} onClick={setActiveTab} />
                                <TabButton id="orders" label="Order History" activeTab={activeTab} onClick={setActiveTab} />
                                <TabButton id="favorites" label="Saved Restaurants" activeTab={activeTab} onClick={setActiveTab} />
                            </nav>
                            <div className="mt-6 pt-4 border-t">
                                <button
                                    onClick={() => setIsSupportModalOpen(true)}
                                    className="w-full text-left px-4 py-2 rounded-md font-semibold transition hover:bg-gray-100 mb-2"
                                >
                                    Customer Support
                                </button>
                                 <button 
                                    onClick={onChangeLocation}
                                    className="w-full text-left px-4 py-2 rounded-md font-semibold transition hover:bg-gray-100 mb-2"
                                >
                                    Change Location
                                </button>
                                <button 
                                    onClick={logout}
                                    className="w-full text-left px-4 py-2 rounded-md font-semibold transition text-red-500 hover:bg-red-50"
                                >
                                    Logout
                                </button>
                            </div>
                        </div>
                    </aside>

                    {/* Content */}
                    <main className="md:col-span-3">
                        <div className="bg-white p-6 rounded-lg shadow-md min-h-[60vh]">
                            {activeTab === 'profile' && user && <ProfileInfoSection user={user} />}
                            {activeTab === 'addresses' && (
                                <AddressSection 
                                    addresses={addresses}
                                    onAddClick={() => setIsAddressModalOpen(true)}
                                    onRemoveClick={handleRemoveAddress}
                                />
                            )}
                            {activeTab === 'orders' && (
                                <OrdersSection 
                                    orders={orders} 
                                    filter={orderFilter}
                                    onFilterChange={setOrderFilter}
                                    onReviewClick={setReviewingOrder}
                                />
                            )}
                            {activeTab === 'favorites' && <FavoritesSection restaurants={favoriteRestaurants} />}
                        </div>
                    </main>
                </div>
            </div>
            {isAddressModalOpen && <AddressModal onClose={() => setIsAddressModalOpen(false)} onAddressAdded={handleAddressAdded} />}
            {isSupportModalOpen && <SupportModal onClose={() => setIsSupportModalOpen(false)} onStartChat={handleStartChat} />}
            {isChatWindowOpen && <ChatWindow onClose={() => setIsChatWindowOpen(false)} />}
            {reviewingOrder && (
                <ReviewModal 
                    order={reviewingOrder}
                    onClose={() => setReviewingOrder(null)}
                    onSubmit={handleReviewSubmitted}
                />
            )}
        </>
    );
};

const TabButton: React.FC<{id: ProfileTab, label: string, activeTab: ProfileTab, onClick: (tab: ProfileTab) => void}> = ({ id, label, activeTab, onClick }) => (
    <button 
        onClick={() => onClick(id)}
        className={`w-full text-left px-4 py-2 rounded-md font-semibold transition ${
            activeTab === id ? 'bg-red-500 text-white' : 'hover:bg-gray-100'
        }`}
    >
        {label}
    </button>
);

// Profile Info Section
const ProfileInfoSection: React.FC<{ user: User }> = ({ user: initialUser }) => {
    const [user, setUser] = useState(initialUser);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const { showNotification } = useNotification();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUser({ ...user, [e.target.name]: e.target.value });
    };
    
    const handleSave = async () => {
        setIsSaving(true);
        try {
            await api.updateUserProfile(user);
            showNotification('Profile updated successfully!', 'success');
            setIsEditing(false);
        } catch (error) {
            showNotification('Failed to update profile.', 'error');
        } finally {
            setIsSaving(false);
        }
    };
    
    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">Profile Information</h2>
            <div className="space-y-4">
                <InputField label="Name" name="name" value={user.name} onChange={handleChange} disabled={!isEditing} />
                <InputField label="Email" name="email" value={user.email} onChange={handleChange} disabled={true} />
                <InputField label="Phone" name="phone" value={user.phone} onChange={handleChange} disabled={!isEditing} />
            </div>
            <div className="mt-6">
                {isEditing ? (
                    <div className="flex space-x-4">
                        <button onClick={handleSave} disabled={isSaving} className="px-6 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 disabled:bg-red-300">
                            {isSaving ? 'Saving...' : 'Save'}
                        </button>
                         <button onClick={() => { setIsEditing(false); setUser(initialUser); }} className="px-6 py-2 bg-gray-200 font-semibold rounded-lg hover:bg-gray-300">
                            Cancel
                        </button>
                    </div>
                ) : (
                    <button onClick={() => setIsEditing(true)} className="px-6 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600">
                        Edit Profile
                    </button>
                )}
            </div>
        </div>
    );
};

const InputField: React.FC<{label: string, name: string, value: string, disabled: boolean, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void}> = ({ label, ...props}) => (
    <div>
        <label className="block text-sm font-medium text-gray-500">{label}</label>
        <input {...props} className="mt-1 w-full max-w-sm px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 disabled:bg-gray-100 disabled:text-gray-500" />
    </div>
);

// Address Section
const AddressSection: React.FC<{ addresses: Address[], onAddClick: () => void, onRemoveClick: (id: string) => void }> = ({ addresses, onAddClick, onRemoveClick }) => (
    <div>
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">My Addresses</h2>
            <button onClick={onAddClick} className="px-4 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600">+ Add New</button>
        </div>
        <div className="space-y-4">
            {addresses.length > 0 ? addresses.map(addr => (
                <div key={addr.id} className="p-4 border rounded-lg flex justify-between items-start">
                    <div>
                        <p className="font-bold">{addr.label}</p>
                        <p className="text-gray-600">{addr.details}</p>
                    </div>
                    <button onClick={() => onRemoveClick(addr.id)} className="p-2 text-gray-400 hover:text-red-500">
                        <TrashIcon />
                    </button>
                </div>
            )) : <p>You have no saved addresses.</p>}
        </div>
    </div>
);

// Orders Section
const OrdersSection: React.FC<{ orders: Order[], filter: OrderFilter, onFilterChange: (filter: OrderFilter) => void, onReviewClick: (order: Order) => void }> = ({ orders, filter, onFilterChange, onReviewClick }) => (
    <div>
        <h2 className="text-2xl font-bold mb-4">Order History</h2>
        <div className="border-b mb-4">
            <nav className="flex space-x-4">
                <OrderFilterButton label="Ongoing" id="ongoing" activeFilter={filter} onClick={onFilterChange} />
                <OrderFilterButton label="Past Orders" id="past" activeFilter={filter} onClick={onFilterChange} />
                <OrderFilterButton label="Cancelled" id="cancelled" activeFilter={filter} onClick={onFilterChange} />
            </nav>
        </div>
        <div className="space-y-4">
            {orders.length > 0 ? orders.map(order => (
                <div key={order.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="font-bold">{order.restaurantName}</p>
                            <p className="text-sm text-gray-500">ID: {order.id}</p>
                            <p className="text-sm text-gray-500">{order.date}</p>
                        </div>
                        <div className="text-right">
                           <p className="font-bold text-lg">${order.total.toFixed(2)}</p>
                           <p className={`text-sm font-semibold ${order.status === 'Delivered' ? 'text-green-600' : 'text-gray-600'}`}>{order.status}</p>
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t text-right">
                        {filter === 'ongoing' && (
                            <a 
                                href={`#/track/${order.id}`}
                                className="px-4 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition inline-block"
                            >
                                Track Order
                            </a>
                        )}
                        {filter === 'past' && (
                            order.isReviewed ? (
                                <button className="px-4 py-2 bg-gray-200 text-gray-500 font-semibold rounded-lg cursor-not-allowed" disabled>
                                    Reviewed
                                </button>
                            ) : (
                                <button
                                    onClick={() => onReviewClick(order)}
                                    className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition inline-block"
                                >
                                    Leave a Review
                                </button>
                            )
                        )}
                    </div>
                </div>
            )) : <p>No {filter} orders found.</p>}
        </div>
    </div>
);

const OrderFilterButton: React.FC<{ label: string, id: OrderFilter, activeFilter: OrderFilter, onClick: (filter: OrderFilter) => void }> = ({ label, id, activeFilter, onClick }) => (
    <button onClick={() => onClick(id)} className={`px-3 py-2 font-semibold transition ${activeFilter === id ? 'border-b-2 border-red-500 text-red-500' : 'text-gray-500 hover:text-red-500'}`}>
        {label}
    </button>
);


// Favorites Section
const FavoritesSection: React.FC<{ restaurants: Restaurant[] }> = ({ restaurants }) => (
    <div>
        <h2 className="text-2xl font-bold mb-6">Saved Restaurants</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {restaurants.length > 0 ? restaurants.map(r => (
                <a key={r.id} href={`#/restaurant/${r.id}`} className="p-4 border rounded-lg flex items-center space-x-4 cursor-pointer hover:bg-gray-50 transition">
                    <img src={r.logoUrl} alt={r.name} className="w-16 h-16 rounded-full object-cover" />
                    <div>
                        <p className="font-bold">{r.name}</p>
                        <p className="text-sm text-gray-600">{r.cuisine}</p>
                    </div>
                </a>
            )) : <p>You haven't saved any restaurants yet.</p>}
        </div>
    </div>
);


export default ProfilePage;