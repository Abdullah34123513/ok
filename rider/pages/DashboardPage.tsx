import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogoutIcon } from '../components/Icons';
import BottomNav from '../components/BottomNav';
import TasksPage from './TasksPage';
import EarningsPage from './EarningsPage';
import HistoryPage from './HistoryPage';

export type RiderView = 'tasks' | 'earnings' | 'history';

const DashboardPage: React.FC = () => {
    const { currentRider, logout } = useAuth();
    const [activeView, setActiveView] = useState<RiderView>('tasks');
    const [isOnline, setIsOnline] = useState(true);

    const renderView = () => {
        switch (activeView) {
            case 'tasks':
                return <TasksPage isOnline={isOnline} />;
            case 'earnings':
                return <EarningsPage />;
            case 'history':
                return <HistoryPage />;
            default:
                return <TasksPage isOnline={isOnline} />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <header className="bg-white text-gray-800 shadow-sm sticky top-0 z-10">
                <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-bold">Rider Dashboard</h1>
                        <p className="text-sm text-gray-500">Welcome, {currentRider?.name}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                             <span className={`text-sm font-semibold ${isOnline ? 'text-green-600' : 'text-gray-500'}`}>{isOnline ? 'Online' : 'Offline'}</span>
                            <button onClick={() => setIsOnline(!isOnline)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isOnline ? 'bg-green-500' : 'bg-gray-300'}`}>
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isOnline ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>
                        <button onClick={logout} className="p-2 rounded-full hover:bg-gray-100 transition-colors"><LogoutIcon className="w-6 h-6 text-gray-600" /></button>
                    </div>
                </div>
            </header>

            <main className="container mx-auto pb-24">
                {renderView()}
            </main>
            
            <BottomNav activeView={activeView} setActiveView={setActiveView} />
        </div>
    );
};

export default DashboardPage;