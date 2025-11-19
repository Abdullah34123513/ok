
import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from '@shared/contexts/NotificationContext';
import Notification from '@shared/components/Notification';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import MenuPage from './pages/MenuPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import EarningsPage from './pages/EarningsPage';
import Navigation from './components/Sidebar';
import Header from './components/Header';
import MasqueradeBanner from './components/MasqueradeBanner';

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
    const [isMasquerading, setIsMasquerading] = useState(false);
    
    useEffect(() => {
        const handleHashChange = () => {
            setRoute(parseHash());
            window.scrollTo(0, 0);
        };
        // Check for masquerade session
        if (sessionStorage.getItem('foodie-find-original-moderator')) {
            setIsMasquerading(true);
        }

        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    if (isLoading) {
        return <div className="flex h-screen items-center justify-center">Loading...</div>;
    }

    if (!currentVendor) {
        if (isMasquerading) {
            return (
                <div className="flex h-screen items-center justify-center p-4 text-center bg-gray-100">
                    <div className="bg-white p-8 rounded-lg shadow-md max-w-md animate-fade-in-up">
                        <h1 className="text-2xl font-bold text-red-600">Automatic Login Failed</h1>
                        <p className="mt-2 text-gray-700">There was a problem automatically logging you in as the vendor. This can sometimes happen during the session switch.</p>
                        <p className="mt-2 text-gray-700">Please return to the moderator dashboard and try again.</p>
                        <a href="/moderator/#/vendors" className="mt-6 inline-block w-full px-4 py-3 bg-[#FF6B00] text-white font-semibold rounded-lg hover:bg-orange-600 transition">
                            Return to Moderator Dashboard
                        </a>
                    </div>
                </div>
            );
        }
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
        <>
            {isMasquerading && <MasqueradeBanner vendorName={currentVendor.name} />}
            <div className="flex h-screen bg-gray-100 font-sans">
                <Navigation activeView={route.view} />
                <div className="flex-1 flex flex-col overflow-hidden">
                    <Header vendorName={currentVendor.name} />
                    <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 pb-16 md:pb-0">
                        {renderView()}
                    </main>
                </div>
            </div>
        </>
    );
};

const App: React.FC = () => {
    return (
        <NotificationProvider>
            <AuthProvider>
                <Notification />
                <AppContent />
            </AuthProvider>
        </NotificationProvider>
    );
};

export default App;
