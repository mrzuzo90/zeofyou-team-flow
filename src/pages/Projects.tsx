
import React, { useState } from 'react';
import Header from '../components/Layout/Header';
import KanbanColumn from '../components/Projects/KanbanColumn';
import { useApp } from '../contexts/AppContext';
import { Plus, Filter, Search } from 'lucide-react';
import { Button } from '../components/ui/button';

const Projects = () => {
  const { tasks } = useApp();
  const [view, setView] = useState<'kanban' | 'list'>('kanban');
  const [filter, setFilter] = useState<string>('todos');

  const todoTasks = tasks.filter(task => task.status === 'por_hacer');
  const inProgressTasks = tasks.filter(task => task.status === 'en_progreso');
  const completedTasks = tasks.filter(task => task.status === 'completado');

  const handleTaskClick = (taskId: number) => {
    console.log('Task clicked:', taskId);
  };

  return (
    <div className="min-h-screen bg-gray-900 pb-20">
      <Header title="Tablero de Proyectos" />
      
      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Controles superiores */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex bg-gray-800 rounded-lg p-1 border border-gray-700">
              <button
                onClick={() => setView('kanban')}
                className={`px-3 py-1 rounded text-sm transition-all duration-200 ${
                  view === 'kanban' 
                    ? 'bg-blue-500 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Kanban
              </button>
              <button
                onClick={() => setView('list')}
                className={`px-3 py-1 rounded text-sm transition-all duration-200 ${
                  view === 'list' 
                    ? 'bg-blue-500 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Lista
              </button>
            </div>
            
            <button className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded-lg border border-gray-700 transition-all duration-200">
              <Filter className="w-4 h-4 text-gray-400" />
              <span className="text-gray-400 text-sm">Filtrar</span>
            </button>
          </div>
          
          <Button className="bg-blue-500 hover:bg-blue-600 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Nueva Tarea
          </Button>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="text-2xl font-bold text-blue-400">{todoTasks.length}</div>
            <div className="text-gray-400 text-sm">Por Hacer</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="text-2xl font-bold text-yellow-400">{inProgressTasks.length}</div>
            <div className="text-gray-400 text-sm">En Progreso</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="text-2xl font-bold text-green-400">{completedTasks.length}</div>
            <div className="text-gray-400 text-sm">Completadas</div>
          </div>
        </div>

        {/* Vista Kanban */}
        {view === 'kanban' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <KanbanColumn
              title="Por Hacer"
              tasks={todoTasks}
              count={todoTasks.length}
              onTaskClick={handleTaskClick}
            />
            <KanbanColumn
              title="En Progreso"
              tasks={inProgressTasks}
              count={inProgressTasks.length}
              onTaskClick={handleTaskClick}
            />
            <KanbanColumn
              title="Completado"
              tasks={completedTasks}
              count={completedTasks.length}
              onTaskClick={handleTaskClick}
            />
          </div>
        )}

        {/* Vista Lista */}
        {view === 'list' && (
          <div className="bg-gray-800 rounded-lg border border-gray-700">
            <div className="p-4 border-b border-gray-700">
              <div className="flex items-center space-x-4">
                <div className="flex-1 relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar tareas..."
                    className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
            
            <div className="divide-y divide-gray-700">
              {tasks.map((task) => (
                <div key={task.id} className="p-4 hover:bg-gray-750 transition-colors duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-white font-medium mb-1">{task.title}</h3>
                      <p className="text-gray-400 text-sm mb-2">{task.description}</p>
                      <div className="flex items-center space-x-4 text-xs">
                        <span className="text-gray-500">Asignado a: {task.assignedTo}</span>
                        <span className="text-gray-500">Categoría: {task.category}</span>
                        <span className={`px-2 py-1 rounded ${
                          task.status === 'completado' ? 'bg-green-500/20 text-green-400' :
                          task.status === 'en_progreso' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {task.status === 'por_hacer' ? 'Por Hacer' :
                           task.status === 'en_progreso' ? 'En Progreso' : 'Completado'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Projects;
