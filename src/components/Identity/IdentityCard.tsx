
import React from 'react';
import { useApp } from '../../contexts/AppContext';

interface IdentityCardProps {
  identity: {
    id: number;
    name: string;
    role: string;
    avatar: string;
    status: 'activo' | 'descansando' | 'inactivo';
    description: string;
    color: string;
  };
}

const IdentityCard: React.FC<IdentityCardProps> = ({ identity }) => {
  const { updateIdentityStatus } = useApp();

  const statusColors = {
    activo: 'bg-green-500',
    descansando: 'bg-yellow-500',
    inactivo: 'bg-gray-500'
  };

  const statusLabels = {
    activo: 'Activo',
    descansando: 'Descansando',
    inactivo: 'Inactivo'
  };

  const colorClasses = {
    blue: 'border-blue-500/30 bg-blue-500/10',
    purple: 'border-purple-500/30 bg-purple-500/10',
    green: 'border-green-500/30 bg-green-500/10',
    orange: 'border-orange-500/30 bg-orange-500/10'
  };

  return (
    <div className={`bg-gray-800 rounded-lg p-4 border ${colorClasses[identity.color as keyof typeof colorClasses]} mb-4 hover:border-opacity-50 transition-all duration-200`}>
      <div className="flex items-center mb-3">
        <div className="w-12 h-12 bg-gray-700 rounded-full mr-3 flex items-center justify-center">
          <span className="text-2xl">{identity.name.charAt(3)}</span>
        </div>
        <div className="flex-1">
          <h3 className="text-white font-medium">{identity.name}</h3>
          <p className="text-gray-400 text-sm">{identity.role}</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${statusColors[identity.status]}`}></div>
          <span className="text-gray-400 text-sm">{statusLabels[identity.status]}</span>
        </div>
      </div>
      
      <p className="text-gray-300 text-sm mb-4">{identity.description}</p>
      
      <div className="flex space-x-2">
        <button
          onClick={() => updateIdentityStatus(identity.id, 'activo')}
          className={`px-3 py-1 rounded text-xs transition-all duration-200 ${
            identity.status === 'activo' 
              ? 'bg-green-500 text-white' 
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          Activar
        </button>
        <button
          onClick={() => updateIdentityStatus(identity.id, 'descansando')}
          className={`px-3 py-1 rounded text-xs transition-all duration-200 ${
            identity.status === 'descansando' 
              ? 'bg-yellow-500 text-white' 
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          Descanso
        </button>
        <button
          onClick={() => updateIdentityStatus(identity.id, 'inactivo')}
          className={`px-3 py-1 rounded text-xs transition-all duration-200 ${
            identity.status === 'inactivo' 
              ? 'bg-gray-500 text-white' 
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          Pausar
        </button>
      </div>
    </div>
  );
};

export default IdentityCard;
