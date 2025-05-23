
import React from 'react';
import { Bell, Menu, Search } from 'lucide-react';
import { useIsMobile } from '../../hooks/use-mobile';

interface HeaderProps {
  title: string;
  showMenu?: boolean;
  onMenuClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, showMenu = false, onMenuClick }) => {
  const isMobile = useIsMobile();
  
  return (
    <header className="bg-gray-900 border-b border-gray-700 px-4 py-4 sticky top-0 z-40">
      <div className={`flex items-center justify-between ${isMobile ? 'max-w-md mx-auto' : 'mx-6'}`}>
        <div className="flex items-center">
          {showMenu && (
            <button
              onClick={onMenuClick}
              className="mr-3 p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800 lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
          <h1 className={`font-bold text-white ${isMobile ? 'text-xl' : 'text-2xl'}`}>{title}</h1>
        </div>
        
        <div className="flex items-center space-x-2 sm:space-x-4">
          {!isMobile && (
            <div className="relative hidden sm:block">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar..."
                className="w-64 pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
          
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
