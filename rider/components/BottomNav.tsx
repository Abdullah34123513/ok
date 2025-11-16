import React from 'react';
import { TasksIcon, MoneyIcon, ClockIcon } from './Icons';

export type RiderView = 'tasks' | 'earnings' | 'history';

interface NavLinkProps {
    view: RiderView;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    isActive: boolean;
    onClick: (view: RiderView) => void;
}

const NavLink: React.FC<NavLinkProps> = ({ view, label, icon: Icon, isActive, onClick }) => (
     <button onClick={() => onClick(view)} className={`flex flex-col items-center justify-center flex-1 py-2 transition-colors ${
        isActive ? 'text-[#FF6B00]' : 'text-gray-500 hover:text-[#FF6B00]'
    }`}>
        <Icon className="w-7 h-7 mb-1" />
        <span className="text-xs font-medium">{label}</span>
    </button>
);

interface BottomNavProps {
    activeView: RiderView;
    setActiveView: (view: RiderView) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeView, setActiveView }) => {
    const navItems: { view: RiderView; label: string; icon: React.ComponentType<{ className?: string }>; }[] = [
        { view: 'tasks', label: 'Tasks', icon: TasksIcon },
        { view: 'earnings', label: 'Earnings', icon: MoneyIcon },
        { view: 'history', label: 'History', icon: ClockIcon },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t">
            <div className="flex justify-around items-center max-w-lg mx-auto h-16">
                 {navItems.map(item => (
                    <NavLink
                        key={item.view}
                        view={item.view}
                        label={item.label}
                        icon={item.icon}
                        isActive={activeView === item.view}
                        onClick={setActiveView}
                    />
                ))}
            </div>
        </nav>
    );
};

export default BottomNav;
