import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { View } from '../App';
import { DashboardIcon, OrdersIcon, MenuIcon, SettingsIcon, LogoutIcon, LogoIcon } from './Icons';

interface SidebarProps {
    activeView: View;
    isOpen: boolean;
    onClose: () => void;
}

interface NavLinkProps {
    view: View;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    isActive: boolean;
}

const NavLink: React.FC<NavLinkProps> = ({ view, label, icon: Icon, isActive }) => {
    return (
        <a href={`#/${view}`} className={`flex items-center px-4 py-3 text-lg font-medium rounded-lg transition-colors ${
            isActive ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-200'
        }`}>
            <Icon className="w-6 h-6 mr-3" />
            <span>{label}</span>
        </a>
    );
};

const Sidebar: React.FC<SidebarProps> = ({ activeView, isOpen }) => {
    const { logout } = useAuth();

    return (
        <aside className={`w-64 flex-shrink-0 bg-white border-r p-4 flex flex-col transition-transform transform fixed inset-y-0 left-0 z-30 md:static md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="flex items-center space-x-2 px-4 py-3 mb-6">
                <LogoIcon />
                <span className="font-bold text-2xl text-gray-800">FoodieFind</span>
            </div>
            <nav className="flex-1 space-y-2">
                <NavLink view="dashboard" label="Dashboard" icon={DashboardIcon} isActive={activeView === 'dashboard'} />
                <NavLink view="orders" label="Orders" icon={OrdersIcon} isActive={activeView === 'orders'} />
                <NavLink view="menu" label="Menu" icon={MenuIcon} isActive={activeView === 'menu'} />
                <NavLink view="settings" label="Settings" icon={SettingsIcon} isActive={activeView === 'settings'} />
            </nav>
            <div>
                <button onClick={logout} className="flex items-center w-full px-4 py-3 text-lg font-medium text-gray-600 hover:bg-gray-200 rounded-lg">
                    <LogoutIcon className="w-6 h-6 mr-3" />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;