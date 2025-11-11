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
// FIX: Changed the named import for OffersPage to a default import to match its export type and resolve the module loading error.
import OffersPage from './pages/OffersPage';
import OfferDetailPage from './pages/OfferDetailPage';
import BottomNav from './components/BottomNav';
import { CartProvider } from './contexts/CartContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Notification from './components/Notification';


export type View = 'home' | 'restaurants' | 'restaurantDetail' | 'foodDetail' | 'cart' | 'checkout' | 'profile' | 'login' | 'signup' | 'orderTracking' | 'orderConfirmation' | 'offers' | 'offerDetail';

interface Route {
    view: View;
    id?: string;
}

const parseHash = (): Route => {
    const hash = window.location.hash.substring(2) || 'home'; // remove '#/'
    const parts = hash.split('/');
    // FIX: Changed type assertion from `as View` to a simple string to allow the switch statement to handle URL parts that are not directly part of the View type (e.g., 'restaurant' maps to 'restaurantDetail').
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
        case 'offers': return { view: 'offers' };
        case 'offer': return { view: 'offerDetail', id };
        case 'home':
        default:
            return { view: 'home' };
    }
};

const AppContent: React.FC = () => {
    const { currentUser } = useAuth();
    const [location, setLocation] = useLocalStorage<string | null>('user-location', null);
    const [route, setRoute] = useState<Route>(parseHash());
    
    useEffect(() => {
        const handleHashChange = () => {
            setRoute(parseHash());
            window.scrollTo(0, 0);
        };
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    // Primary gate: Location. If no location, nothing else matters.
    if (!location) {
        return <LocationModal onLocationSet={setLocation} />;
    }

    const protectedViews: View[] = ['profile', 'checkout', 'orderTracking', 'orderConfirmation'];
    const authViews: View[] = ['login', 'signup'];

    // Handle routing logic based on auth status and current route
    if (!currentUser) {
        // Redirect guests from protected views to login
        if (protectedViews.includes(route.view)) {
            window.location.hash = '#/login';
            return null;
        }
        // Render auth pages for guests
        if (route.view === 'login') return <LoginPage />;
        if (route.view === 'signup') return <SignupPage />;
    } else {
        // Redirect logged-in users from auth views to home
        if (authViews.includes(route.view)) {
            window.location.hash = '#/home';
            return null;
        }
    }


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
            case 'offers':
                return <Header title="Limited-Time Offers" />;
            case 'offerDetail':
                return <Header title="Special Offer" />;
            case 'login':
            case 'signup':
                return null;
            case 'home':
            default:
                // Header is rendered inside HomePage
                return null;
        }
    };
    
    const renderView = () => {
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
                return <ProfilePage onChangeLocation={() => setLocation(null)} />;
            case 'orderTracking':
                if (!id) { window.location.hash = '#/home'; return null; }
                return <OrderTrackingPage orderId={id} />;
            case 'orderConfirmation':
                if (!id) { window.location.hash = '#/home'; return null; }
                return <OrderConfirmationPage orderId={id} />;
            case 'offers':
                // FIX: Pass location prop to OffersPage to allow fetching of location-specific offers.
                return <OffersPage location={location} />;
            case 'offerDetail':
                if (!id) { window.location.hash = '#/offers'; return null; }
                return <OfferDetailPage offerId={id} location={location} />;
            case 'home':
            default:
                return <HomePage location={location} />;
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen font-sans">
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