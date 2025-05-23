
import React from 'react';
import Header from '../components/Layout/Header';
import MetricCard from '../components/UI/MetricCard';
import { useApp } from '../contexts/AppContext';
import { AlertTriangle, Users, Clock, Monitor, Utensils, Briefcase, PenTool } from 'lucide-react';

const Dashboard = () => {
  const { metrics, identities, tasks } = useApp();

  const notifications = [
    {
      icon: AlertTriangle,
      title: 'Urgente: Acción Requerida',
      description: 'Fecha límite del Proyecto X aproximándose',
      time: 'Hace 5 min'
    },
    {
      icon: Users,
      title: 'Bienvenida a Bordo',
      description: 'El Coach se unió al equipo',
      time: 'Hace 1 hora'
    }
  ];

  const timeline = [
    { icon: Clock, title: 'Standup Matutino', time: '9:00 AM', completed: true },
    { icon: Monitor, title: 'Revisión de Proyecto', time: '11:00 AM', completed: false },
    { icon: Utensils, title: 'Almuerzo del Equipo', time: '1:00 PM', completed: false },
    { icon: Briefcase, title: 'Planificación Semanal', time: '3:00 PM', completed: false },
    { icon: PenTool, title: 'Sesión Creativa', time: '4:30 PM', completed: false }
  ];

  const energyData = [75, 80, 85, 82, 88, 85, 90];
  const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  const completedTasks = tasks.filter(task => task.status === 'completado').length;
  const totalTasks = tasks.length;
  const progressPercentage = Math.round((completedTasks / totalTasks) * 100);

  return (
    <div className="min-h-screen bg-gray-900 pb-20">
      <Header title="Dinámica del Equipo" />
      
      <main className="max-w-md mx-auto px-4 py-6">
        {/* Métricas Clave */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-4">Métricas Clave</h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <MetricCard 
              title="Energía del Equipo" 
              value={`${metrics.teamEnergy}%`} 
              change="+5%" 
              trend="up"
            />
            <MetricCard 
              title="Moral del Equipo" 
              value={`${metrics.teamMorale}%`} 
              change="+3%" 
              trend="up"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <MetricCard 
              title="Enfoque del Equipo" 
              value={`${metrics.teamFocus}%`} 
              change="-2%" 
              trend="down"
            />
            <MetricCard 
              title="Progreso Tareas" 
              value={`${progressPercentage}%`} 
              change={`${completedTasks}/${totalTasks}`}
            />
          </div>
        </section>

        {/* Niveles de Energía */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-4">Niveles de Energía</h2>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex justify-between items-end h-32 mb-2">
              {energyData.map((energy, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div 
                    className="bg-blue-500 rounded-t"
                    style={{ 
                      height: `${(energy / 100) * 80}px`,
                      width: '20px'
                    }}
                  />
                  <span className="text-xs text-gray-400 mt-2">{days[index]}</span>
                </div>
              ))}
            </div>
            <div className="text-center">
              <span className="text-2xl font-bold text-white">85%</span>
              <span className="text-green-400 text-sm ml-2">+10% esta semana</span>
            </div>
          </div>
        </section>

        {/* Notificaciones */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-4">Notificaciones</h2>
          <div className="space-y-3">
            {notifications.map((notification, index) => (
              <div key={index} className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-all duration-200">
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-500/20 p-2 rounded-lg">
                    <notification.icon className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-medium mb-1">{notification.title}</h3>
                    <p className="text-gray-400 text-sm mb-2">{notification.description}</p>
                    <span className="text-gray-500 text-xs">{notification.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Timeline Diario */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-4">Timeline Diario</h2>
          <div className="space-y-3">
            {timeline.map((item, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className={`p-2 rounded-lg ${item.completed ? 'bg-green-500/20' : 'bg-gray-700'}`}>
                  <item.icon className={`w-5 h-5 ${item.completed ? 'text-green-400' : 'text-gray-400'}`} />
                </div>
                <div className="flex-1">
                  <h3 className={`font-medium ${item.completed ? 'text-green-400 line-through' : 'text-white'}`}>
                    {item.title}
                  </h3>
                  <p className="text-gray-400 text-sm">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
