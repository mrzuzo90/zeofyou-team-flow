
import React from 'react';
import Header from '../components/Layout/Header';
import IdentityCard from '../components/Identity/IdentityCard';
import { useApp } from '../contexts/AppContext';
import { Plus, Users } from 'lucide-react';

const Identities = () => {
  const { identities } = useApp();

  const activeIdentities = identities.filter(identity => identity.status === 'activo');
  const restingIdentities = identities.filter(identity => identity.status !== 'activo');

  return (
    <div className="min-h-screen bg-gray-900 pb-20">
      <Header title="Gestión del Equipo" />
      
      <main className="max-w-md mx-auto px-4 py-6">
        {/* Introducción */}
        <section className="mb-8">
          <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg p-4 border border-blue-500/30 mb-6">
            <div className="flex items-center mb-2">
              <Users className="w-6 h-6 text-blue-400 mr-2" />
              <h2 className="text-lg font-semibold text-white">Tu Equipo Mental</h2>
            </div>
            <p className="text-gray-300 text-sm">
              Cada identidad representa una faceta de tu personalidad. Gestiona tu equipo interno como un verdadero líder.
            </p>
          </div>
        </section>

        {/* Métricas del Equipo */}
        <section className="mb-8">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-800 rounded-lg p-3 border border-gray-700 text-center">
              <div className="text-2xl font-bold text-green-400">{activeIdentities.length}</div>
              <div className="text-gray-400 text-xs">Activos</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-3 border border-gray-700 text-center">
              <div className="text-2xl font-bold text-yellow-400">{restingIdentities.length}</div>
              <div className="text-gray-400 text-xs">Descansando</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-3 border border-gray-700 text-center">
              <div className="text-2xl font-bold text-blue-400">92%</div>
              <div className="text-gray-400 text-xs">Armonía</div>
            </div>
          </div>
        </section>

        {/* Identidades Activas */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Identidades Activas</h2>
            <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-sm">
              {activeIdentities.length} en línea
            </span>
          </div>
          
          {activeIdentities.length > 0 ? (
            <div className="space-y-4">
              {activeIdentities.map((identity) => (
                <IdentityCard key={identity.id} identity={identity} />
              ))}
            </div>
          ) : (
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 text-center">
              <Users className="w-12 h-12 text-gray-500 mx-auto mb-3" />
              <p className="text-gray-400">No hay identidades activas</p>
              <p className="text-gray-500 text-sm">Activa una identidad para comenzar</p>
            </div>
          )}
        </section>

        {/* Identidades en Descanso */}
        {restingIdentities.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-white mb-4">En Descanso</h2>
            <div className="space-y-4">
              {restingIdentities.map((identity) => (
                <IdentityCard key={identity.id} identity={identity} />
              ))}
            </div>
          </section>
        )}

        {/* Crear Nueva Identidad */}
        <section>
          <button className="w-full bg-gray-800 hover:bg-gray-700 border-2 border-dashed border-gray-600 hover:border-gray-500 rounded-lg p-6 transition-all duration-200 group">
            <Plus className="w-8 h-8 text-gray-500 group-hover:text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500 group-hover:text-gray-400 font-medium">Crear Nueva Identidad</p>
            <p className="text-gray-600 text-sm">Añade una nueva faceta a tu equipo</p>
          </button>
        </section>
      </main>
    </div>
  );
};

export default Identities;
