import React from 'react';
import { TaskListIcon, EarningsIcon, HistoryIcon } from './Icons';
import type { RiderView } from '../pages/DashboardPage';

interface NavLinkProps {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    isActive: boolean;
    onClick: () => void;
}

const NavLink: React.FC<NavLinkProps> = ({ label, icon: Icon, isActive, onClick }) => {
    const activeClass = 'text-[#FF6B00]';
    const inactiveClass = 'text-gray-500';

    return (
        <button onClick={onClick} className="flex flex-col items-center justify-center flex-1 pt-2 pb-1 group">
            <Icon className={`w-7 h-7 transition-colors ${isActive ? activeClass : inactiveClass}`} />
            <span className={`text-xs mt-1 font-medium transition-colors ${isActive ? activeClass : inactiveClass}`}>{label}</span>
        </button>
    );
};

interface BottomNavProps {
    activeView: RiderView;
    setActiveView: (view: RiderView) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeView, setActiveView }) => {
    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around shadow-[0_-2px_10px_rgba(0,0,0,0.05)] z-20">
            <NavLink label="Tasks" icon={TaskListIcon} isActive={activeView === 'tasks'} onClick={() => setActiveView('tasks')} />
            <NavLink label="Earnings" icon={EarningsIcon} isActive={activeView === 'earnings'} onClick={() => setActiveView('earnings')} />
            <NavLink label="History" icon={HistoryIcon} isActive={activeView === 'history'} onClick={() => setActiveView('history')} />
        </nav>
    );
};

export default BottomNav;