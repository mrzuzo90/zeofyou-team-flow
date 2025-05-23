
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Users, BarChart3, Settings, Calendar, Target, Clock, User } from 'lucide-react';

const Sidebar = () => {
  const navItems = [
    { icon: Home, label: 'Inicio', path: '/' },
    { icon: Users, label: 'Equipo', path: '/identidades' },
    { icon: Target, label: 'Enfoque', path: '/enfoque' },
    { icon: Clock, label: 'Planificación', path: '/planificacion' },
    { icon: BarChart3, label: 'Insights', path: '/insights' },
    { icon: User, label: 'Perfil', path: '/perfil' }
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-gray-800 border-r border-gray-700 h-screen sticky top-0 p-4">
      {/* Logo */}
      <div className="flex items-center justify-center mb-8 mt-4">
        <div className="bg-blue-500/20 w-12 h-12 rounded-full flex items-center justify-center">
          <Users className="w-6 h-6 text-blue-400" />
        </div>
        <h1 className="text-xl font-bold text-white ml-3">Zeofyou</h1>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center p-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700'
                  }`
                }
              >
                <item.icon className="w-5 h-5 mr-3" />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      
      {/* User Section */}
      <div className="border-t border-gray-700 pt-4 mt-4">
        <div className="flex items-center p-3 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-all duration-200 cursor-pointer">
          <Settings className="w-5 h-5 mr-3" />
          <span className="font-medium">Configuración</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
