
import React from 'react';
import TaskCard from './TaskCard';

interface KanbanColumnProps {
  title: string;
  tasks: any[];
  count: number;
  onTaskClick?: (taskId: number) => void;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({ 
  title, 
  tasks, 
  count,
  onTaskClick 
}) => {
  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 min-h-96">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-medium">{title}</h3>
        <span className="bg-gray-700 text-gray-300 px-2 py-1 rounded text-sm">
          {count}
        </span>
      </div>
      
      <div className="space-y-3">
        {tasks.map((task) => (
          <TaskCard 
            key={task.id} 
            task={task} 
            onTaskClick={onTaskClick}
          />
        ))}
      </div>
      
      {tasks.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500 text-sm">No hay tareas</p>
        </div>
      )}
    </div>
  );
};

export default KanbanColumn;
