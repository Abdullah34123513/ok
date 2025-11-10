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
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import BottomNav from './components/BottomNav';
import { CartProvider } from './contexts/CartContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Notification from './components/Notification';


export type View = 'home' | 'restaurants' | 'restaurantDetail' | 'foodDetail' | 'cart' | 'checkout' | 'profile' | 'login' | 'signup' | 'orderTracking' | 'orderConfirmation';

interface Route {
    view: View;
    id?: string;
}

const parseHash = (): Route => {
    const hash = window.location.hash.substring(2) || 'home'; // remove '#/'
    const parts = hash.split('/');
    const view = parts[0];
    const id = parts[1];

    switch (view) {
        case 'restaurants': return { view: 'restaurants' };
        case 'restaurant': return { view: 'restaurantDetail', id };
        case 'food': return { view: 'foodDetail', id };
        case 'cart': return { view: 'cart' };
        case 'checkout': return { view: 'checkout' };
        case 'profile': return { view: 'profile' };
        case 'login': return { view: 'login' };
        case 'signup': return { view: 'signup' };
        case 'track': return { view: 'orderTracking', id };
        case 'confirmation': return { view: 'orderConfirmation', id };
        case 'home':
        default:
            return { view: 'home' };
    }
};

const AppContent: React.FC = () => {
    const { currentUser } = useAuth();
    const [location, setLocation] = useLocalStorage<string | null>('user-location', null);
    const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
    const [route, setRoute] = useState<Route>(parseHash());
    
    useEffect(() => {
        const handleHashChange = () => {
            setRoute(parseHash());
            window.scrollTo(0, 0);
        };
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);
    
    useEffect(() => {
        if (currentUser && !location) {
            setIsLocationModalOpen(true);
        }
    }, [currentUser, location]);

    const handleLocationSet = (newLocation: string) => {
        setLocation(newLocation);
        setIsLocationModalOpen(false);
    };

    const renderHeader = () => {
        const { view, id } = route;
        switch (view) {
            case 'restaurants':
                return <Header title={`Restaurants in ${location}`} />;
            case 'restaurantDetail':
                return <Header title="Restaurant Details" />;
            case 'foodDetail':
                return <Header title="Food Details" />;
            case 'cart':
                return <Header title="Your Cart" />;
            case 'checkout':
                return <Header title="Checkout" />;
            case 'profile':
                return <Header title="My Profile" />;
            case 'orderTracking':
                return <Header title={`Track Order #${id}`} />;
            case 'orderConfirmation':
                 return <Header title="Order Confirmed" />;
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
        if (route.view === 'signup') {
            return <SignupPage />;
        }
        return <LoginPage />;
    }

    const renderView = () => {
        if (!location) return null;
        
        const { view, id } = route;

        switch (view) {
            case 'restaurants':
                return <RestaurantListPage location={location} />;
            case 'restaurantDetail':
                if (!id) { window.location.hash = '#/restaurants'; return null; }
                return <RestaurantDetailPage restaurantId={id} />;
            case 'foodDetail':
                 if (!id) { window.location.hash = '#/home'; return null; }
                return <FoodDetailPage foodId={id} location={location} />;
            case 'cart':
                return <CartPage />;
            case 'checkout':
                return <CheckoutPage />;
             case 'profile':
                return <ProfilePage onChangeLocation={() => setIsLocationModalOpen(true)} />;
            case 'orderTracking':
                if (!id) { window.location.hash = '#/home'; return null; }
                return <OrderTrackingPage orderId={id} />;
            case 'orderConfirmation':
                if (!id) { window.location.hash = '#/home'; return null; }
                return <OrderConfirmationPage orderId={id} />;
            case 'home':
            default:
                return <HomePage location={location} />;
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen font-sans">
            {isLocationModalOpen && <LocationModal onLocationSet={handleLocationSet} />}
            {renderHeader()}
            <main className="pb-24">
                {renderView()}
            </main>
            <BottomNav />
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