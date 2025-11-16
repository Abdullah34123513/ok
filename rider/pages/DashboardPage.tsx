import React, { useState } from 'react';
import BottomNav, { RiderView } from '../components/BottomNav';
import TasksPage from './TasksPage';
import EarningsPage from './EarningsPage';
import HistoryPage from './HistoryPage';

const DashboardPage: React.FC = () => {
    const [activeView, setActiveView] = useState<RiderView>('tasks');
    
    const renderView = () => {
        switch (activeView) {
            case 'earnings':
                return <EarningsPage />;
            case 'history':
                return <HistoryPage />;
            case 'tasks':
            default:
                return <TasksPage />;
        }
    };
    
    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <main className="pb-20">
                {renderView()}
            </main>
            <BottomNav activeView={activeView} setActiveView={setActiveView} />
        </div>
    );
};

export default DashboardPage;
