import React from 'react';
import { View } from '../App';
import { DashboardIcon, UsersIcon, LogoIcon, LogoutIcon, StorefrontIcon, GlobeIcon } from './Icons';
import { useAuth } from '../contexts/AuthContext';

interface NavProps {
    activeView: View;
}

interface NavLinkProps {
    view: View;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    isActive: boolean;
}

const SidebarNavLink: React.FC<NavLinkProps> = ({ view, label, icon: Icon, isActive }) => (
    <a href={`#/${view}`} className={`flex items-center space-x-3 px-4 py-3 rounded-lg font-semibold transition-colors ${
        isActive ? 'bg-[#FF6B00] text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'
    }`}>
        <Icon className="w-6 h-6" />
        <span>{label}</span>
    </a>
);

const Sidebar: React.FC<NavProps> = ({ activeView }) => {
    const { logout } = useAuth();
    const navItems: { view: View; label: string; icon: React.ComponentType<{ className?: string }>; }[] = [
        { view: 'dashboard', label: 'Dashboard', icon: DashboardIcon },
        { view: 'users', label: 'Riders', icon: UsersIcon },
        { view: 'vendors', label: 'Vendors', icon: StorefrontIcon },
        { view: 'areas', label: 'Area Management', icon: GlobeIcon },
    ];

    return (
        <aside className="hidden md:flex flex-col w-64 bg-white border-r flex-shrink-0">
            <div className="flex items-center space-x-2 px-6 h-20 border-b">
                 <LogoIcon />
                 <span className="font-bold text-xl text-gray-800">FoodieFind</span>
            </div>
            <nav className="flex-1 p-4 space-y-2">
                {navItems.map(item => (
                    <SidebarNavLink 
                        key={item.view}
                        view={item.view}
                        label={item.label}
                        icon={item.icon}
                        isActive={activeView === item.view}
                    />
                ))}
            </nav>
            <div className="p-4 border-t">
                <button
                  onClick={logout}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-semibold transition-colors text-gray-600 hover:bg-red-50 hover:text-red-600"
                >
                  <LogoutIcon className="w-6 h-6" />
                  <span>Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;