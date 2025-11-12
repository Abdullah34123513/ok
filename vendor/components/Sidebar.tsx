import React from 'react';
import { View } from '../App';
import { DashboardIcon, OrdersIcon, MenuIcon, SettingsIcon } from './Icons';

interface BottomNavProps {
    activeView: View;
}

interface NavLinkProps {
    view: View;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    isActive: boolean;
}

const NavLink: React.FC<NavLinkProps> = ({ view, label, icon: Icon, isActive }) => {
    return (
        <a href={`#/${view}`} className={`flex flex-col items-center justify-center flex-1 py-2 transition-colors ${
            isActive ? 'text-blue-600' : 'text-gray-600 hover:text-blue-500'
        }`}>
            <Icon className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">{label}</span>
        </a>
    );
};

const BottomNav: React.FC<BottomNavProps> = ({ activeView }) => {
    // Note: The logout button has been moved to the Profile page for a cleaner bottom navigation.
    return (
        <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t">
            <div className="flex justify-around items-center max-w-4xl mx-auto px-4 h-16">
                <NavLink view="dashboard" label="Dashboard" icon={DashboardIcon} isActive={activeView === 'dashboard'} />
                <NavLink view="orders" label="Orders" icon={OrdersIcon} isActive={activeView === 'orders'} />
                <NavLink view="menu" label="Menu" icon={MenuIcon} isActive={activeView === 'menu'} />
                <NavLink view="settings" label="Settings" icon={SettingsIcon} isActive={activeView === 'settings'} />
            </div>
        </nav>
    );
};

export default BottomNav;
