import React, { useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import OtpPage from './pages/OtpPage';
import DashboardPage from './pages/DashboardPage';

const AppContent: React.FC = () => {
    const { currentRider, isLoading } = useAuth();
    
    // Simple hash change listener to re-render on nav actions
    // that don't change the main component (e.g. login -> otp)
    const [, setHash] = React.useState(window.location.hash);
    useEffect(() => {
        const handleHashChange = () => setHash(window.location.hash);
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);


    if (isLoading) {
        return <div className="flex h-screen items-center justify-center">Loading...</div>;
    }

    if (!currentRider) {
        const hash = window.location.hash.substring(2) || 'login';
        const parts = hash.split('/');
        const view = parts[0];

        if (view === 'otp' && parts[1]) {
            return <OtpPage phone={parts[1]} />;
        }
        return <LoginPage />;
    }
    
    return <DashboardPage />;
};

const App: React.FC = () => {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
};

export default App;