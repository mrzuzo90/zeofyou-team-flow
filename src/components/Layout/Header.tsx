
import React from 'react';
import { Bell, Menu } from 'lucide-react';

interface HeaderProps {
  title: string;
  showMenu?: boolean;
  onMenuClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, showMenu = false, onMenuClick }) => {
  return (
    <header className="bg-gray-900 border-b border-gray-700 px-4 py-4 sticky top-0 z-40">
      <div className="flex items-center justify-between max-w-md mx-auto">
        <div className="flex items-center">
          {showMenu && (
            <button
              onClick={onMenuClick}
              className="mr-3 p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
          <h1 className="text-xl font-bold text-white">{title}</h1>
        </div>
        
        <div className="flex items-center space-x-2">
          <button className="relative p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              3
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
