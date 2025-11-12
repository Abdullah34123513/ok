
import React from 'react';
import { LogoIcon, SearchIcon, CartIcon, ProfileIcon, ArrowLeftIcon } from './Icons';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
    searchQuery?: string;
    onSearchChange?: (query: string) => void;
    title?: string;
}

const Header: React.FC<HeaderProps> = ({ searchQuery, onSearchChange, title }) => {
  const { cartCount } = useCart();
  const { currentUser } = useAuth();
  
  const handleBack = () => {
      window.history.back();
  }

  return (
    <header className="sticky top-0 bg-white/80 backdrop-blur-md shadow-sm z-30">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {title ? (
            <div className="flex items-center space-x-2 flex-1">
                <button onClick={handleBack} className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition">
                    <ArrowLeftIcon />
                </button>
                <h1 className="font-bold text-xl text-gray-800 truncate">{title}</h1>
            </div>
        ) : (
            <div className="flex items-center space-x-2">
                <a href="#/home" className="flex items-center space-x-2">
                    <LogoIcon />
                    <span className="font-bold text-xl text-gray-800 hidden sm:block">FoodieFind</span>
                </a>
            </div>
        )}

        {onSearchChange && (
            <div className="flex-1 max-w-xl mx-4">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <SearchIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search food or restaurants"
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-red-400 transition"
                    />
                </div>
            </div>
        )}
        
        <div className="hidden sm:flex items-center space-x-4">
          <a href="#/cart" className="relative p-2 rounded-full hover:bg-gray-100 transition">
            <CartIcon />
            {cartCount > 0 && (
                <span className="absolute top-0 right-0 block h-5 min-w-[1.25rem] px-1 rounded-full bg-red-500 text-white text-xs flex items-center justify-center transform translate-x-1/2 -translate-y-1/2">
                    {cartCount}
                </span>
            )}
          </a>
          <a href={currentUser ? '#/profile' : '#/login'} className="p-2 rounded-full hover:bg-gray-100 transition">
            <ProfileIcon />
          </a>
        </div>
      </div>
    </header>
  );
};

export default Header;
