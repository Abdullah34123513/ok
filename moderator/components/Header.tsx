import React from 'react';
import { UserCircleIcon } from './Icons';

interface HeaderProps {
    moderatorName: string;
}

const Header: React.FC<HeaderProps> = ({ moderatorName }) => {
  return (
    <header className="flex-shrink-0 bg-white border-b">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-800">Moderator Dashboard</h1>
        </div>
        <div className="flex items-center space-x-3 p-2 rounded-lg">
            <span className="font-medium text-gray-700 hidden sm:block">{moderatorName}</span>
            <UserCircleIcon className="w-8 h-8 text-gray-500" />
        </div>
      </div>
    </header>
  );
};

export default Header;
