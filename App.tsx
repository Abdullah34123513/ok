import React, { useState, useEffect } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import Header from './components/Header';
import LocationModal from './components/LocationModal';
import HomePage from './pages/HomePage';
import RestaurantListPage from './pages/RestaurantListPage';
import RestaurantDetailPage from './pages/RestaurantDetailPage';
import FoodDetailPage from './pages/FoodDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import OrderTrackingPage from './pages/OrderTrackingPage';
import { CartProvider } from './contexts/CartContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Notification from './components/Notification';


export type View = 'home' | 'restaurants' | 'restaurantDetail' | 'foodDetail' | 'cart' | 'checkout' | 'profile' | 'login' | 'signup' | 'orderTracking';

interface NavigationContext {
    id?: string;
    orderId?: string;
}

const AppContent: React.FC = () => {
    const { currentUser } = useAuth();
    const [location, setLocation] = useLocalStorage<string | null>('user-location', null);
    const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

    // Navigation state
    const [view, setView] = useState<View>('home');
    const [currentRestaurantId, setCurrentRestaurantId] = useState<string | null>(null);
    const [currentFoodId, setCurrentFoodId] = useState<string | null>(null);
    const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
    const [history, setHistory] = useState<View[]>(['home']);
    
    useEffect(() => {
        // If user is logged in but has no location, show the modal.
        if (currentUser && !location) {
            setIsLocationModalOpen(true);
        }
    }, [currentUser, location]);

    const handleLocationSet = (newLocation: string) => {
        setLocation(newLocation);
        setIsLocationModalOpen(false);
    };

    const navigate = (targetView: View, context?: NavigationContext) => {
        // Reset state when navigating to auth pages
        if (targetView === 'login' || targetView === 'signup') {
            setHistory([targetView]);
            setView(targetView);
            return;
        }

        if (targetView === 'restaurantDetail' && context?.id) {
            setCurrentRestaurantId(context.id);
        }
        if (targetView === 'foodDetail' && context?.id) {
            setCurrentFoodId(context.id);
        }
        if (targetView === 'orderTracking' && context?.orderId) {
            setCurrentOrderId(context.orderId);
        }
        setHistory(prev => [...prev, targetView]);
        setView(targetView);
    };

    const goBack = () => {
        const newHistory = [...history];
        newHistory.pop();
        const previousView = newHistory[newHistory.length - 1] || (currentUser ? 'home' : 'login');
        setHistory(newHistory);
        setView(previousView);
    };

    const renderHeader = () => {
        switch (view) {
            case 'restaurants':
                return <Header title={`Restaurants in ${location}`} onBack={goBack} onNavigate={navigate} />;
            case 'restaurantDetail':
                return <Header title="Restaurant Details" onBack={goBack} onNavigate={navigate} />;
            case 'foodDetail':
                return <Header title="Food Details" onBack={goBack} onNavigate={navigate} />;
            case 'cart':
                return <Header title="Your Cart" onBack={goBack} onNavigate={navigate} />;
            case 'checkout':
                return <Header title="Checkout" onBack={goBack} onNavigate={navigate} />;
            case 'profile':
                return <Header title="My Profile" onBack={goBack} onNavigate={navigate} />;
            case 'orderTracking':
                return <Header title={`Track Order #${currentOrderId}`} onBack={goBack} onNavigate={navigate} />;
            case 'login':
            case 'signup':
                return null;
            case 'home':
            default:
                // Header is rendered inside HomePage
                return null;
        }
    };
    
    if (!currentUser) {
        if (view === 'signup') {
            return <SignupPage onNavigate={navigate} />;
        }
        return <LoginPage onNavigate={navigate} />;
    }

    const renderView = () => {
        if (!location) return null;

        switch (view) {
            case 'restaurants':
                return <RestaurantListPage location={location} onRestaurantClick={(id) => navigate('restaurantDetail', { id })} />;
            case 'restaurantDetail':
                if (!currentRestaurantId) {
                    navigate('restaurants'); return null;
                }
                return <RestaurantDetailPage restaurantId={currentRestaurantId} onNavigate={navigate} onFoodClick={(id) => navigate('foodDetail', { id })} />;
            case 'foodDetail':
                 if (!currentFoodId) {
                    navigate('home'); return null;
                }
                return <FoodDetailPage foodId={currentFoodId} location={location} onNavigate={navigate} onRestaurantClick={(id) => navigate('restaurantDetail', { id })} onFoodClick={(id) => navigate('foodDetail', { id })} />;
            case 'cart':
                return <CartPage onNavigate={navigate} />;
            case 'checkout':
                return <CheckoutPage onOrderPlaced={(orderId) => navigate('orderTracking', { orderId })} />;
             case 'profile':
                return <ProfilePage onNavigate={navigate} onChangeLocation={() => setIsLocationModalOpen(true)} />;
            case 'orderTracking':
                if (!currentOrderId) {
                    navigate('home'); return null;
                }
                return <OrderTrackingPage orderId={currentOrderId} />;
            case 'home':
            default:
                return <HomePage location={location} onViewAllRestaurants={() => navigate('restaurants')} onRestaurantClick={(id) => navigate('restaurantDetail', { id })} onFoodClick={(id) => navigate('foodDetail', { id })} onNavigate={navigate} />;
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen font-sans">
            {isLocationModalOpen && <LocationModal onLocationSet={handleLocationSet} />}
            {renderHeader()}
            <main className="pb-24">
                {renderView()}
            </main>
        </div>
    );
};


const App: React.FC = () => {
    return (
        <NotificationProvider>
            <AuthProvider>
                <CartProvider>
                    <Notification />
                    <AppContent />
                </CartProvider>
            </AuthProvider>
        </NotificationProvider>
    );
};

export default App;