
import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import MenuPage from './pages/MenuPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import EarningsPage from './pages/EarningsPage';
import Navigation from './components/Sidebar';
import Header from './components/Header';

export type View = 'dashboard' | 'menu' | 'settings' | 'profile' | 'earnings';

interface Route {
    view: View;
    id?: string;
}

const parseHash = (): Route => {
    const hash = window.location.hash.substring(2) || 'dashboard'; // remove '#/'
    const parts = hash.split('/');
    const view = parts[0] as View;
    
    switch (view) {
        case 'menu': return { view: 'menu' };
        case 'settings': return { view: 'settings' };
        case 'profile': return { view: 'profile' };
        case 'earnings': return { view: 'earnings' };
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
            case 'menu':
                return <MenuPage />;
            case 'settings':
                return <SettingsPage />;
            case 'profile':
                return <ProfilePage />;
            case 'earnings':
                return <EarningsPage />;
            case 'dashboard':
            default:
                return <DashboardPage />;
        }
    };
    
    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            <Navigation activeView={route.view} />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header vendorName={currentVendor.name} />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 pb-16 md:pb-0">
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