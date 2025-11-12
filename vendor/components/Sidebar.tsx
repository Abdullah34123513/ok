import React from 'react';
import { View } from '../App';
import { DashboardIcon, MenuIcon, SettingsIcon, LogoIcon, LogoutIcon, EarningsIcon } from './Icons';
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
        isActive ? 'bg-blue-500 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'
    }`}>
        <Icon className="w-6 h-6" />
        <span>{label}</span>
    </a>
);

const BottomNavLink: React.FC<NavLinkProps> = ({ view, label, icon: Icon, isActive }) => (
     <a href={`#/${view}`} className={`flex flex-col items-center justify-center flex-1 py-2 transition-colors ${
        isActive ? 'text-blue-600' : 'text-gray-600 hover:text-blue-500'
    }`}>
        <Icon className="w-6 h-6 mb-1" />
        <span className="text-xs font-medium">{label}</span>
    </a>
);


const Navigation: React.FC<NavProps> = ({ activeView }) => {
    const { logout } = useAuth();
    const navItems: { view: View; label: string; icon: React.ComponentType<{ className?: string }>; }[] = [
        { view: 'dashboard', label: 'Dashboard', icon: DashboardIcon },
        { view: 'menu', label: 'Menu', icon: MenuIcon },
        { view: 'earnings', label: 'Earnings', icon: EarningsIcon },
        { view: 'settings', label: 'Settings', icon: SettingsIcon },
    ];

    return (
        <>
            {/* --- Desktop Sidebar --- */}
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
            
            {/* --- Mobile Bottom Navigation --- */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t">
                <div className="flex justify-around items-center max-w-4xl mx-auto px-4 h-16">
                     {navItems.map(item => (
                        <BottomNavLink 
                            key={item.view}
                            view={item.view}
                            label={item.label}
                            icon={item.icon}
                            isActive={activeView === item.view}
                        />
                    ))}
                </div>
            </nav>
        </>
    );
};

export default Navigation;