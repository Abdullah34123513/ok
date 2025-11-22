
import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import FinancePage from './pages/FinancePage';
import ModeratorManagementPage from './pages/ModeratorManagementPage';
import UserDatabasePage from './pages/UserDatabasePage';
import Sidebar from './components/Sidebar';

export type View = 'dashboard' | 'finance' | 'moderators' | 'users';

const AppContent: React.FC = () => {
    const { currentAdmin, isLoading } = useAuth();
    const [activeView, setActiveView] = useState<View>('dashboard');

    useEffect(() => {
        const handleHashChange = () => {
            const hash = window.location.hash.substring(2) || 'dashboard';
            const view = hash.split('/')[0] as View;
            setActiveView(view);
        };
        handleHashChange(); // Set initial
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    if (isLoading) return <div className="flex h-screen items-center justify-center bg-gray-900 text-white">Loading System...</div>;

    if (!currentAdmin) return <LoginPage />;

    const renderView = () => {
        switch (activeView) {
            case 'finance': return <FinancePage />;
            case 'moderators': return <ModeratorManagementPage />;
            case 'users': return <UserDatabasePage />;
            case 'dashboard':
            default: return <DashboardPage />;
        }
    };

    return (
        <div className="flex h-screen bg-gray-100 font-sans text-gray-900">
            <Sidebar activeView={activeView} />
            <main className="flex-1 overflow-auto">
                {renderView()}
            </main>
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
