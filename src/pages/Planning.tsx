
import React, { useState } from 'react';
import Header from '../components/Layout/Header';
import { Textarea } from '../components/ui/textarea';
import { Button } from '../components/ui/button';
import { Clock, Users, Briefcase, PenTool, CheckCircle, Sun, Moon } from 'lucide-react';

const Planning = () => {
  const [morningThoughts, setMorningThoughts] = useState('');
  const [priorities, setPriorities] = useState('');
  const [eveningReflection, setEveningReflection] = useState('');
  const [teamReflection, setTeamReflection] = useState('');

  const dailySchedule = [
    { icon: Users, title: 'Standup Matutino', time: '9:00 AM', completed: true },
    { icon: Briefcase, title: 'Inicio de Proyecto', time: '10:00 AM', completed: true },
    { icon: PenTool, title: 'Revisión de Diseño', time: '11:00 AM', completed: false },
    { icon: Clock, title: 'Planificación Semanal', time: '2:00 PM', completed: false },
    { icon: Users, title: 'Reunión de Equipo', time: '4:00 PM', completed: false }
  ];

  const handleSave = () => {
    const planningData = {
      date: new Date().toISOString(),
      morningThoughts,
      priorities,
      eveningReflection,
      teamReflection
    };
    
    localStorage.setItem('zeofyou_planning', JSON.stringify(planningData));
    console.log('Planificación guardada:', planningData);
  };

  return (
    <div className="min-h-screen bg-gray-900 pb-20">
      <Header title="Planificación y Reflexión" />
      
      <main className="max-w-md mx-auto px-4 py-6 space-y-8">
        {/* Briefing Diario */}
        <section>
          <div className="flex items-center mb-4">
            <Sun className="w-5 h-5 text-yellow-400 mr-2" />
            <h2 className="text-lg font-semibold text-white">Briefing Diario</h2>
          </div>
          
          <div className="space-y-3">
            {dailySchedule.map((item, index) => (
              <div key={index} className="flex items-center space-x-4 p-3 bg-gray-800 rounded-lg border border-gray-700">
                <div className={`p-2 rounded-lg ${item.completed ? 'bg-green-500/20' : 'bg-gray-700'}`}>
                  <item.icon className={`w-5 h-5 ${item.completed ? 'text-green-400' : 'text-gray-400'}`} />
                </div>
                <div className="flex-1">
                  <h3 className={`font-medium ${item.completed ? 'text-green-400 line-through' : 'text-white'}`}>
                    {item.title}
                  </h3>
                  <p className="text-gray-400 text-sm">{item.time}</p>
                </div>
                {item.completed && (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Planificación Matutina */}
        <section>
          <div className="flex items-center mb-4">
            <Sun className="w-5 h-5 text-orange-400 mr-2" />
            <h2 className="text-lg font-semibold text-white">Planificación Matutina</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                ¿Qué tienes en mente hoy?
              </label>
              <Textarea
                placeholder="Comparte tus pensamientos, ideas o preocupaciones para el día..."
                value={morningThoughts}
                onChange={(e) => setMorningThoughts(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
              />
            </div>
            
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                ¿Cuáles son tus prioridades para hoy?
              </label>
              <Textarea
                placeholder="Lista las 3 cosas más importantes que quieres lograr hoy..."
                value={priorities}
                onChange={(e) => setPriorities(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
              />
            </div>
          </div>
        </section>

        {/* Revisión Vespertina */}
        <section>
          <div className="flex items-center mb-4">
            <Moon className="w-5 h-5 text-purple-400 mr-2" />
            <h2 className="text-lg font-semibold text-white">Revisión Vespertina</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                ¿Cómo fue tu día?
              </label>
              <Textarea
                placeholder="Reflexiona sobre los logros, desafíos y aprendizajes del día..."
                value={eveningReflection}
                onChange={(e) => setEveningReflection(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
              />
            </div>
            
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Reflexión sobre tu equipo interno
              </label>
              <Textarea
                placeholder="¿Cómo interactuaron tus diferentes identidades hoy? ¿Qué funcionó bien?"
                value={teamReflection}
                onChange={(e) => setTeamReflection(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
              />
            </div>
          </div>
        </section>

        {/* Métricas del Día */}
        <section>
          <h2 className="text-lg font-semibold text-white mb-4">Métricas del Día</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 text-center">
              <div className="text-2xl font-bold text-green-400">4/5</div>
              <div className="text-gray-400 text-sm">Tareas Completadas</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 text-center">
              <div className="text-2xl font-bold text-blue-400">85%</div>
              <div className="text-gray-400 text-sm">Energía</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 text-center">
              <div className="text-2xl font-bold text-purple-400">3</div>
              <div className="text-gray-400 text-sm">Sesiones Focus</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 text-center">
              <div className="text-2xl font-bold text-yellow-400">92%</div>
              <div className="text-gray-400 text-sm">Bienestar</div>
            </div>
          </div>
        </section>

        {/* Guardar */}
        <div className="pt-4">
          <Button
            onClick={handleSave}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
          >
            Guardar Reflexiones
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Planning;
