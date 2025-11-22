
import React from 'react';
import { View } from '../types';
import { useAuth } from '../contexts/AuthContext';

// Icons
const DashboardIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>;
const UsersIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm6-11a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
const CashIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01M12 6v-1m0-1V4m0 2.01v.01M12 14c-1.11 0-2.08-.402-2.599-1M12 14v1m0-1v-.01M12 16v1m0 1v1m0-2.01v-.01M4 4h16v16H4V4z" /></svg>;
const ShieldIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>;
const LogoutIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>;

interface NavProps {
    activeView: View;
}

interface NavLinkProps {
    view: View;
    label: string;
    icon: React.ReactNode;
    isActive: boolean;
}

const SidebarNavLink: React.FC<NavLinkProps> = ({ view, label, icon, isActive }) => (
    <a href={`#/${view}`} className={`flex items-center space-x-3 px-4 py-3 rounded-lg font-semibold transition-colors ${
        isActive ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
    }`}>
        {icon}
        <span>{label}</span>
    </a>
);

const Sidebar: React.FC<NavProps> = ({ activeView }) => {
    const { logout } = useAuth();
    const navItems: { view: View; label: string; icon: React.ReactNode }[] = [
        { view: 'dashboard', label: 'Overview', icon: <DashboardIcon /> },
        { view: 'finance', label: 'Finance & Cashflow', icon: <CashIcon /> },
        { view: 'moderators', label: 'Moderators', icon: <ShieldIcon /> },
        { view: 'users', label: 'User Database', icon: <UsersIcon /> },
    ];

    return (
        <aside className="hidden md:flex flex-col w-64 bg-[#1e293b] border-r border-gray-700 flex-shrink-0 text-white">
            <div className="flex items-center space-x-2 px-6 h-20 border-b border-gray-700">
                 <div className="w-8 h-8 bg-indigo-500 rounded-md flex items-center justify-center font-bold">S</div>
                 <span className="font-bold text-xl tracking-wide">Super Admin</span>
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
            <div className="p-4 border-t border-gray-700">
                <button
                  onClick={logout}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-semibold transition-colors text-gray-400 hover:bg-red-900/30 hover:text-red-400"
                >
                  <LogoutIcon />
                  <span>Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
