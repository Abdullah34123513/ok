
import React, { useState, useEffect } from 'react';
import { useLocalStorage } from '@hooks/useLocalStorage';
import Header from '@components/Header';
import LocationModal from '@components/LocationModal';
import HomePage from '@pages/HomePage';
import RestaurantListPage from '@pages/RestaurantListPage';
import RestaurantDetailPage from '@pages/RestaurantDetailPage';
import FoodDetailPage from '@pages/FoodDetailPage';
import CartPage from '@pages/CartPage';
import CheckoutPage from '@pages/CheckoutPage';
import ProfilePage from '@pages/ProfilePage';
import LoginPage from '@pages/LoginPage';
import SignupPage from '@pages/SignupPage';
import OrderTrackingPage from '@pages/OrderTrackingPage';
import OrderConfirmationPage from '@pages/OrderConfirmationPage';
import OffersPage from '@pages/OffersPage';
import OfferDetailPage from '@pages/OfferDetailPage';
import FavoritesPage from '@pages/FavoritesPage';
import CategoryListPage from '@pages/CategoryListPage';
import FlashSaleListPage from '@pages/FlashSaleListPage';
import BottomNav from '@components/BottomNav';
import { CartProvider } from '@contexts/CartContext';
import { NotificationProvider } from '@contexts/NotificationContext';
import { AuthProvider, useAuth } from '@contexts/AuthContext';
import Notification from '@components/Notification';
import type { Area } from '@shared/types';


export type View = 'home' | 'restaurants' | 'restaurantDetail' | 'foodDetail' | 'cart' | 'checkout' | 'profile' | 'login' | 'signup' | 'orderTracking' | 'orderConfirmation' | 'offers' | 'offerDetail' | 'favorites' | 'category' | 'flash-sale';

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
        case 'offers': return { view: 'offers' };
        case 'offer': return { view: 'offerDetail', id };
        case 'favorites': return { view: 'favorites' };
        case 'category': return { view: 'category', id };
        case 'flash-sale': return { view: 'flash-sale' };
        case 'home':
        default:
            return { view: 'home' };
    }
};

const AppContent: React.FC = () => {
    const { currentUser } = useAuth();
    const [area, setArea] = useLocalStorage<Area | null>('user-area', null);
    const [route, setRoute] = useState<Route>(parseHash());
    
    useEffect(() => {
        const handleHashChange = () => {
            setRoute(parseHash());
            window.scrollTo(0, 0);
        };
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    // Primary gate: Area. If no area, nothing else matters.
    if (!area) {
        return <LocationModal onLocationSet={setArea} />;
    }

    const protectedViews: View[] = ['profile', 'checkout', 'orderTracking', 'orderConfirmation', 'favorites'];
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
                return <Header title={`Restaurants in ${area.name}`} />;
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
                return <Header title={`Live Delivery`} />;
            case 'orderConfirmation':
                 return <Header title="Order Confirmed" />;
            case 'offers':
                return <Header title="Limited-Time Offers" />;
            case 'offerDetail':
                return <Header title="Special Offer" />;
            case 'favorites':
                return <Header title="Saved Restaurants" />;
            case 'category':
                return <Header title={id ? id.charAt(0).toUpperCase() + id.slice(1) : 'Category'} />;
            case 'flash-sale':
                return <Header title="Flash Sale" />;
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
                return <RestaurantListPage area={area} />;
            case 'restaurantDetail':
                if (!id) { window.location.hash = '#/restaurants'; return null; }
                return <RestaurantDetailPage restaurantId={id} />;
            case 'foodDetail':
                 if (!id) { window.location.hash = '#/home'; return null; }
                return <FoodDetailPage foodId={id} area={area} />;
            case 'cart':
                return <CartPage />;
            case 'checkout':
                return <CheckoutPage />;
             case 'profile':
                return <ProfilePage onChangeLocation={() => setArea(null)} />;
            case 'orderTracking':
                if (!id) { window.location.hash = '#/home'; return null; }
                return <OrderTrackingPage orderId={id} />;
            case 'orderConfirmation':
                if (!id) { window.location.hash = '#/home'; return null; }
                return <OrderConfirmationPage orderId={id} />;
            case 'offers':
                return <OffersPage area={area} />;
            case 'offerDetail':
                if (!id) { window.location.hash = '#/offers'; return null; }
                return <OfferDetailPage offerId={id} area={area} />;
            case 'favorites':
                return <FavoritesPage />;
            case 'category':
                if (!id) { window.location.hash = '#/home'; return null; }
                return <CategoryListPage categoryId={id} area={area} />;
            case 'flash-sale':
                return <FlashSaleListPage area={area} />;
            case 'home':
            default:
                return <HomePage area={area} />;
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
