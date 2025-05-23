
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Users, BarChart3, Settings } from 'lucide-react';

const BottomNav = () => {
  const navItems = [
    { icon: Home, label: 'Inicio', path: '/' },
    { icon: Users, label: 'Equipo', path: '/identidades' },
    { icon: BarChart3, label: 'Insights', path: '/insights' },
    { icon: Settings, label: 'Perfil', path: '/perfil' }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 px-4 py-2 z-50">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center p-2 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'text-blue-400 bg-blue-400/10'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`
            }
          >
            <item.icon className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
