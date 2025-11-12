import React from 'react';
import { UserCircleIcon } from './Icons';

interface HeaderProps {
    vendorName: string;
}

const Header: React.FC<HeaderProps> = ({ vendorName }) => {
  return (
    <header className="flex-shrink-0 bg-white border-b">
      <div className="flex items-center justify-between p-4">
        <h1 className="text-xl font-semibold text-gray-800">Vendor Dashboard</h1>
        <a href="#/profile" className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <span className="font-medium text-gray-700 hidden sm:block">{vendorName}</span>
            <UserCircleIcon className="w-8 h-8 text-gray-500" />
        </a>
      </div>
    </header>
  );
};

export default Header;