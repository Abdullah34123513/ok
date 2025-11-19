
import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from '@shared/contexts/NotificationContext';
import Notification from '@shared/components/Notification';
import LoginPage from './pages/LoginPage';
import OtpPage from './pages/OtpPage';
import DashboardPage from './pages/DashboardPage';

// Keep the router to handle the multi-step login
export type View = 'login' | 'otp' | 'dashboard';

interface Route {
    view: View;
    param?: string;
}

const parseHash = (): Route => {
    const hash = window.location.hash.substring(2) || 'login'; // remove '#/'
    const parts = hash.split('/');
    const view = parts[0] as View;
    const param = parts[1];

    switch (view) {
        case 'otp': return { view: 'otp', param };
        case 'dashboard': return { view: 'dashboard' };
        case 'login':
        default:
            return { view: 'login' };
    }
};

const AppContent: React.FC = () => {
    const { currentRider, isLoading } = useAuth();
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

    // If logged in, always show dashboard.
    if (currentRider) {
        return <DashboardPage />;
    }

    // If not logged in, show login or OTP page.
    if (route.view === 'otp') {
        return <OtpPage phone={route.param} />;
    }
    return <LoginPage />;
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
