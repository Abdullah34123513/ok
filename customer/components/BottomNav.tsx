
import React, { useState, useEffect } from 'react';
import { HomeIcon, CartIcon, ProfileIcon, HeartIcon } from '@components/Icons';
import { useCart } from '@contexts/CartContext';

type Tab = 'home' | 'favorites' | 'cart' | 'profile' | null;

const getActiveTab = (): Tab => {
    const hash = window.location.hash.substring(2); // remove '#/'
    if (hash.startsWith('favorites')) return 'favorites';
    if (hash.startsWith('cart') || hash.startsWith('checkout')) return 'cart';
    if (hash.startsWith('profile') || hash.startsWith('track')) return 'profile';
    if (hash.startsWith('home') || hash === '') return 'home';
    return null; 
}

interface NavLinkProps {
    href: string;
    label: string;
    icon: React.ComponentType<{ className?: string; isFilled?: boolean }>;
    isActive: boolean;
    badgeCount?: number;
}

const NavLink: React.FC<NavLinkProps> = ({ href, label, icon: Icon, isActive, badgeCount }) => {
    const activeClass = 'text-red-500';
    const inactiveClass = 'text-gray-500';

    // Fix for HeartIcon which expects isFilled prop
    const iconProps = Icon === HeartIcon ? { isFilled: isActive } : {};

    return (
        <a href={href} className="flex flex-col items-center justify-center flex-1 pt-2 pb-1 group">
            <div className="relative">
                <Icon className={`w-7 h-7 transition-colors ${isActive ? activeClass : inactiveClass}`} {...iconProps} />
                {(badgeCount ?? 0) > 0 && (
                    <span className="absolute top-0 right-0 block h-5 min-w-[1.25rem] px-1 rounded-full bg-red-500 text-white text-xs flex items-center justify-center transform translate-x-1/2 -translate-y-1/2">
                        {badgeCount}
                    </span>
                )}
            </div>
            <span className={`text-xs mt-1 transition-colors ${isActive ? activeClass : inactiveClass}`}>{label}</span>
        </a>
    )
};

const BottomNav: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>(getActiveTab());
    const { cartCount } = useCart();

    useEffect(() => {
        const handleHashChange = () => {
            setActiveTab(getActiveTab());
        };
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around shadow-up sm:hidden z-40 pb-safe">
            <NavLink href="#/home" label="Home" icon={HomeIcon} isActive={activeTab === 'home'} />
            <NavLink href="#/favorites" label="Saved" icon={HeartIcon} isActive={activeTab === 'favorites'} />
            <NavLink href="#/cart" label="Cart" icon={CartIcon} isActive={activeTab === 'cart'} badgeCount={cartCount} />
            <NavLink href="#/profile" label="Profile" icon={ProfileIcon} isActive={activeTab === 'profile'} />
        </nav>
    );
};

export default BottomNav;
