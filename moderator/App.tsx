import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import UserManagementPage from './pages/UserManagementPage';
import VendorManagementPage from './pages/VendorManagementPage';
import VendorDetailPage from './pages/VendorDetailPage';
import VendorOrdersPage from './pages/VendorOrdersPage';
import AreaManagementPage from './pages/AreaManagementPage';
import Sidebar from './components/Sidebar';
import Header from './components/Header';

export type View = 'dashboard' | 'users' | 'vendors' | 'vendorDetail' | 'vendorOrders' | 'areas';

interface Route {
    view: View;
    id?: string;
}

const parseHash = (): Route => {
    const hash = window.location.hash.substring(2) || 'dashboard'; // remove '#/'
    const parts = hash.split('/');
    const view = parts[0] as View;
    const id = parts[1];

    if (view === 'vendorDetail' && id) {
        return { view: 'vendorDetail', id };
    }
    
    if (view === 'vendorOrders' && id) {
        return { view: 'vendorOrders', id };
    }

    switch (view) {
        case 'users': return { view: 'users' };
        case 'vendors': return { view: 'vendors' };
        case 'areas': return { view: 'areas' };
        case 'dashboard':
        default:
            return { view: 'dashboard' };
    }
};

const AppContent: React.FC = () => {
    const { currentModerator, isLoading } = useAuth();
    const [route, setRoute] = useState<Route>(parseHash());
    
    useEffect(() => {
        const handleHashChange = () => setRoute(parseHash());
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    if (isLoading) {
        return <div className="flex h-screen items-center justify-center">Loading...</div>;
    }

    if (!currentModerator) {
        return <LoginPage />;
    }

    const renderView = () => {
        switch (route.view) {
            case 'users':
                return <UserManagementPage />;
            case 'vendors':
                return <VendorManagementPage />;
            case 'vendorDetail':
                return route.id ? <VendorDetailPage vendorId={route.id} /> : <VendorManagementPage />;
            case 'vendorOrders':
                return route.id ? <VendorOrdersPage vendorId={route.id} /> : <VendorManagementPage />;
            case 'areas':
                return <AreaManagementPage />;
            case 'dashboard':
            default:
                return <DashboardPage />;
        }
    };
    
    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            <Sidebar activeView={route.view} />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header moderatorName={currentModerator.name} />
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