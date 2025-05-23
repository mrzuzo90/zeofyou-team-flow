
import React from 'react';
import Header from '../components/Layout/Header';
import MetricCard from '../components/UI/MetricCard';
import { useApp } from '../contexts/AppContext';
import { TrendingUp, Target, Clock, Lightbulb, Users } from 'lucide-react';

const Analytics = () => {
  const { metrics, identities, focusSessions } = useApp();

  const weeklyData = [
    { day: 'Lun', productivity: 75, energy: 80, focus: 70 },
    { day: 'Mar', productivity: 80, energy: 85, focus: 75 },
    { day: 'Mié', productivity: 85, energy: 90, focus: 80 },
    { day: 'Jue', productivity: 82, energy: 88, focus: 85 },
    { day: 'Vie', productivity: 88, energy: 85, focus: 90 },
    { day: 'Sáb', productivity: 70, energy: 75, focus: 65 },
    { day: 'Dom', productivity: 60, energy: 70, focus: 60 }
  ];

  const roleDistribution = [
    { role: 'Estratega', percentage: 35, color: 'blue' },
    { role: 'Implementador', percentage: 45, color: 'green' },
    { role: 'Apoyo', percentage: 20, color: 'purple' }
  ];

  const optimizationTips = [
    {
      icon: Target,
      title: 'Alineación de Roles',
      description: 'Ajusta las asignaciones de tareas para mejor alineación con niveles de energía individuales.'
    },
    {
      icon: Clock,
      title: 'Programación Basada en Energía',
      description: 'Programa reuniones de equipo durante períodos de máxima energía.'
    },
    {
      icon: Lightbulb,
      title: 'Optimización Creativa',
      description: 'El Creativo rinde mejor en las mañanas. Programa sesiones creativas antes de las 11 AM.'
    },
    {
      icon: Users,
      title: 'Balance del Equipo',
      description: 'Considera activar El Coach con más frecuencia para mejorar el bienestar general.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-900 pb-20">
      <Header title="Análisis e Insights" />
      
      <main className="max-w-md mx-auto px-4 py-6 space-y-8">
        {/* Resumen de Productividad */}
        <section>
          <h2 className="text-lg font-semibold text-white mb-4">Productividad General</h2>
          <div className="grid grid-cols-2 gap-4">
            <MetricCard
              title="Productividad"
              value={`${metrics.productivity}%`}
              change="+12%"
              trend="up"
              icon={TrendingUp}
            />
            <MetricCard
              title="Sesiones Focus"
              value={focusSessions.length}
              change="+3"
              trend="up"
              icon={Target}
            />
          </div>
        </section>

        {/* Patrones de Energía */}
        <section>
          <h2 className="text-lg font-semibold text-white mb-4">Patrones de Energía</h2>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white font-medium">Últimos 7 Días</h3>
              <span className="text-green-400 text-sm">+10% promedio</span>
            </div>
            
            <div className="flex justify-between items-end h-32 mb-4">
              {weeklyData.map((day, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div className="flex flex-col space-y-1">
                    <div 
                      className="bg-blue-500 rounded-t w-2"
                      style={{ height: `${(day.productivity / 100) * 60}px` }}
                      title={`Productividad: ${day.productivity}%`}
                    />
                    <div 
                      className="bg-green-500 w-2"
                      style={{ height: `${(day.energy / 100) * 60}px` }}
                      title={`Energía: ${day.energy}%`}
                    />
                    <div 
                      className="bg-purple-500 rounded-b w-2"
                      style={{ height: `${(day.focus / 100) * 60}px` }}
                      title={`Enfoque: ${day.focus}%`}
                    />
                  </div>
                  <span className="text-xs text-gray-400 mt-2">{day.day}</span>
                </div>
              ))}
            </div>
            
            <div className="flex justify-center space-x-4 text-xs">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded mr-1"></div>
                <span className="text-gray-400">Productividad</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded mr-1"></div>
                <span className="text-gray-400">Energía</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-purple-500 rounded mr-1"></div>
                <span className="text-gray-400">Enfoque</span>
              </div>
            </div>
          </div>
        </section>

        {/* Balance de Identidades */}
        <section>
          <h2 className="text-lg font-semibold text-white mb-4">Balance de Identidades</h2>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="space-y-4">
              {roleDistribution.map((role, index) => (
                <div key={index}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white text-sm">{role.role}</span>
                    <span className="text-gray-400 text-sm">{role.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className={`bg-${role.color}-500 h-2 rounded-full transition-all duration-300`}
                      style={{ width: `${role.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Estado de las Identidades */}
        <section>
          <h2 className="text-lg font-semibold text-white mb-4">Estado del Equipo</h2>
          <div className="grid grid-cols-2 gap-4">
            {identities.map((identity) => (
              <div key={identity.id} className="bg-gray-800 rounded-lg p-3 border border-gray-700">
                <div className="flex items-center mb-2">
                  <div className="w-6 h-6 bg-gray-700 rounded-full mr-2 flex items-center justify-center">
                    <span className="text-xs">{identity.name.charAt(3)}</span>
                  </div>
                  <span className="text-white text-sm font-medium">{identity.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-xs px-2 py-1 rounded ${
                    identity.status === 'activo' ? 'bg-green-500/20 text-green-400' :
                    identity.status === 'descansando' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {identity.status === 'activo' ? 'Activo' :
                     identity.status === 'descansando' ? 'Descansando' : 'Inactivo'}
                  </span>
                  <span className="text-green-400 text-sm">85%</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Recomendaciones de Optimización */}
        <section>
          <h2 className="text-lg font-semibold text-white mb-4">Recomendaciones</h2>
          <div className="space-y-4">
            {optimizationTips.map((tip, index) => (
              <div key={index} className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-all duration-200">
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-500/20 p-2 rounded-lg flex-shrink-0">
                    <tip.icon className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium mb-1">{tip.title}</h3>
                    <p className="text-gray-400 text-sm">{tip.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Analytics;
