import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import OrdersPage from './pages/OrdersPage';
import MenuPage from './pages/MenuPage';
import Sidebar from './components/Sidebar';
import Header from './components/Header';

export type View = 'dashboard' | 'orders' | 'menu' | 'settings';

interface Route {
    view: View;
    id?: string;
}

const parseHash = (): Route => {
    const hash = window.location.hash.substring(2) || 'dashboard'; // remove '#/'
    const parts = hash.split('/');
    const view = parts[0] as View;
    
    switch (view) {
        case 'orders': return { view: 'orders' };
        case 'menu': return { view: 'menu' };
        case 'settings': return { view: 'settings' };
        case 'dashboard':
        default:
            return { view: 'dashboard' };
    }
};

const AppContent: React.FC = () => {
    const { currentVendor, isLoading } = useAuth();
    const [route, setRoute] = useState<Route>(parseHash());
    
    useEffect(() => {
        const handleHashChange = () => {
            setRoute(parseHash());
            window.scrollTo(0, 0);
        };
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    if (isLoading) {
        return <div className="flex h-screen items-center justify-center">Loading...</div>;
    }

    if (!currentVendor) {
        return <LoginPage />;
    }

    const renderView = () => {
        switch (route.view) {
            case 'orders':
                return <OrdersPage />;
            case 'menu':
                return <MenuPage />;
            case 'settings':
                return <div className="p-6"><h1 className="text-2xl font-bold">Settings</h1><p>Settings page is under construction.</p></div>;
            case 'dashboard':
            default:
                return <DashboardPage />;
        }
    };
    
    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            <Sidebar activeView={route.view} />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header vendorName={currentVendor.name} />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
                    {renderView()}
                </main>
            </div>
        </div>
    );
};

const App: React.FC = () => {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
};

export default App;