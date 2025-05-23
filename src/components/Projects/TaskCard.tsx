
import React from 'react';

interface TaskCardProps {
  task: {
    id: number;
    title: string;
    description: string;
    status: 'por_hacer' | 'en_progreso' | 'completado';
    priority: 'alta' | 'media' | 'baja';
    assignedTo: string;
    category: string;
    dueDate?: string;
  };
  onTaskClick?: (taskId: number) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onTaskClick }) => {
  const priorityColors = {
    alta: 'bg-red-500/20 text-red-400 border-red-500/30',
    media: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    baja: 'bg-green-500/20 text-green-400 border-green-500/30'
  };

  const priorityLabels = {
    alta: 'Alta',
    media: 'Media',
    baja: 'Baja'
  };

  return (
    <div 
      className="bg-gray-800 rounded-lg p-4 mb-3 border border-gray-700 cursor-pointer hover:bg-gray-750 hover:border-gray-600 transition-all duration-200"
      onClick={() => onTaskClick?.(task.id)}
    >
      <div className="flex items-start justify-between mb-3">
        <h4 className="text-white font-medium text-sm leading-tight flex-1 mr-2">
          {task.title}
        </h4>
        <span className={`text-xs px-2 py-1 rounded border ${priorityColors[task.priority]}`}>
          {priorityLabels[task.priority]}
        </span>
      </div>
      
      <p className="text-gray-400 text-xs mb-3 line-clamp-2">{task.description}</p>
      
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2">
          <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
            {task.category}
          </span>
        </div>
        {task.dueDate && (
          <span className="text-gray-500">
            {new Date(task.dueDate).toLocaleDateString('es-ES', { 
              month: 'short', 
              day: 'numeric' 
            })}
          </span>
        )}
      </div>
      
      <div className="mt-3 pt-3 border-t border-gray-700">
        <div className="flex items-center">
          <div className="w-6 h-6 bg-gray-700 rounded-full mr-2 flex items-center justify-center">
            <span className="text-xs">{task.assignedTo.charAt(3)}</span>
          </div>
          <span className="text-gray-300 text-xs">{task.assignedTo}</span>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
