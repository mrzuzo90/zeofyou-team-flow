
import React from 'react';
import Header from '../components/Layout/Header';
import Button from '../components/UI/Button';
import { useApp } from '../contexts/AppContext';
import { User, Mail, Settings, LogOut, Shield, Bell, HelpCircle } from 'lucide-react';

const Profile = () => {
  const { currentUser, logout } = useApp();

  const profileStats = [
    { label: 'Días Activo', value: '45', color: 'blue' },
    { label: 'Sesiones Focus', value: '128', color: 'green' },
    { label: 'Tareas Completadas', value: '89', color: 'purple' },
    { label: 'Horas Productivas', value: '156h', color: 'orange' }
  ];

  const menuItems = [
    { icon: Settings, label: 'Configuración General', action: () => {} },
    { icon: Bell, label: 'Notificaciones', action: () => {} },
    { icon: Shield, label: 'Privacidad y Seguridad', action: () => {} },
    { icon: HelpCircle, label: 'Ayuda y Soporte', action: () => {} }
  ];

  return (
    <div className="min-h-screen bg-gray-900 pb-20">
      <Header title="Mi Perfil" />
      
      <main className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Información del Usuario */}
        <section className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="text-center">
            <div className="w-24 h-24 bg-gray-700 rounded-full mx-auto mb-4 flex items-center justify-center">
              <User className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-1">
              {currentUser?.name || 'Usuario Zeofyou'}
            </h2>
            <div className="flex items-center justify-center text-gray-400 mb-4">
              <Mail className="w-4 h-4 mr-2" />
              <span className="text-sm">{currentUser?.email || 'usuario@zeofyou.com'}</span>
            </div>
            <Button variant="secondary" size="sm">
              Editar Perfil
            </Button>
          </div>
        </section>

        {/* Estadísticas */}
        <section>
          <h3 className="text-lg font-semibold text-white mb-4">Estadísticas</h3>
          <div className="grid grid-cols-2 gap-4">
            {profileStats.map((stat, index) => (
              <div key={index} className="bg-gray-800 rounded-lg p-4 border border-gray-700 text-center">
                <div className={`text-2xl font-bold ${
                  stat.color === 'blue' ? 'text-blue-400' :
                  stat.color === 'green' ? 'text-green-400' :
                  stat.color === 'purple' ? 'text-purple-400' :
                  'text-orange-400'
                }`}>
                  {stat.value}
                </div>
                <div className="text-gray-400 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Progreso del Nivel */}
        <section className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-medium">Nivel de Maestría</h3>
            <span className="text-blue-400 font-bold">Nivel 7</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3 mb-2">
            <div className="bg-blue-500 h-3 rounded-full" style={{ width: '65%' }}></div>
          </div>
          <div className="flex justify-between text-sm text-gray-400">
            <span>1,280 XP</span>
            <span>2,000 XP</span>
          </div>
        </section>

        {/* Logros Recientes */}
        <section>
          <h3 className="text-lg font-semibold text-white mb-4">Logros Recientes</h3>
          <div className="space-y-3">
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 flex items-center">
              <div className="bg-yellow-500/20 p-2 rounded-lg mr-3">
                <span className="text-yellow-400 text-xl">🏆</span>
              </div>
              <div>
                <h4 className="text-white font-medium">Maestro del Enfoque</h4>
                <p className="text-gray-400 text-sm">Completaste 100 sesiones de enfoque</p>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 flex items-center">
              <div className="bg-green-500/20 p-2 rounded-lg mr-3">
                <span className="text-green-400 text-xl">🎯</span>
              </div>
              <div>
                <h4 className="text-white font-medium">Equilibrio Perfecto</h4>
                <p className="text-gray-400 text-sm">Todas las identidades activas por 7 días</p>
              </div>
            </div>
          </div>
        </section>

        {/* Menú de Configuración */}
        <section>
          <h3 className="text-lg font-semibold text-white mb-4">Configuración</h3>
          <div className="space-y-2">
            {menuItems.map((item, index) => (
              <button
                key={index}
                onClick={item.action}
                className="w-full bg-gray-800 hover:bg-gray-700 rounded-lg p-4 border border-gray-700 flex items-center transition-all duration-200"
              >
                <item.icon className="w-5 h-5 text-gray-400 mr-3" />
                <span className="text-white font-medium">{item.label}</span>
                <span className="ml-auto text-gray-400">›</span>
              </button>
            ))}
          </div>
        </section>

        {/* Cerrar Sesión */}
        <section className="pt-4">
          <Button
            variant="danger"
            size="lg"
            fullWidth
            onClick={logout}
          >
            <LogOut className="w-5 h-5 mr-2" />
            Cerrar Sesión
          </Button>
        </section>

        {/* Información de la App */}
        <section className="text-center text-gray-500 text-sm pt-4">
          <p>Zeofyou v1.0.0</p>
          <p>© 2024 Zeofyou. Todos los derechos reservados.</p>
        </section>
      </main>
    </div>
  );
};

export default Profile;
