
import React, { useState } from 'react';
import Header from '../components/Layout/Header';
import CircularTimer from '../components/Focus/CircularTimer';
import Button from '../components/UI/Button';
import { useApp } from '../contexts/AppContext';
import { useFocusTimer } from '../hooks/useFocusTimer';
import { Play, Pause, Square, Coffee, Target } from 'lucide-react';

const Focus = () => {
  const { identities, addFocusSession } = useApp();
  const [selectedTask, setSelectedTask] = useState('');
  const [selectedIdentity, setSelectedIdentity] = useState('');
  const [sessionStarted, setSessionStarted] = useState(false);
  
  const {
    timeLeft,
    isActive,
    isPaused,
    duration,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    resetTimer,
    formatTime,
    progress
  } = useFocusTimer(25);

  const taskTypes = [
    'Trabajo Creativo',
    'Planificación Estratégica',
    'Tareas Administrativas',
    'Desarrollo Personal',
    'Resolución de Problemas',
    'Comunicación',
    'Aprendizaje'
  ];

  const activeIdentities = identities.filter(identity => identity.status === 'activo');

  const handleStartSession = () => {
    if (selectedTask && selectedIdentity) {
      setSessionStarted(true);
      startTimer();
    }
  };

  const handleStopSession = () => {
    const sessionData = {
      task: selectedTask,
      identity: selectedIdentity,
      duration: duration,
      completed: timeLeft === 0,
      date: new Date().toISOString()
    };
    
    addFocusSession(sessionData);
    setSessionStarted(false);
    stopTimer();
    setSelectedTask('');
    setSelectedIdentity('');
  };

  const handleTakeBreak = () => {
    pauseTimer();
    // Aquí podrías iniciar un timer de descanso
  };

  if (!sessionStarted) {
    return (
      <div className="min-h-screen bg-gray-900 pb-20">
        <Header title="Sesión de Enfoque" />
        
        <main className="max-w-md mx-auto px-4 py-6">
          {/* Puntuación de Productividad */}
          <div className="bg-gradient-to-r from-blue-500/20 to-green-500/20 rounded-lg p-6 border border-blue-500/30 mb-8">
            <div className="text-center">
              <Target className="w-12 h-12 text-blue-400 mx-auto mb-3" />
              <div className="text-3xl font-bold text-white mb-2">8.2</div>
              <div className="text-blue-400 font-medium">Puntuación de Enfoque</div>
              <div className="text-gray-400 text-sm">Basado en sesiones anteriores</div>
            </div>
          </div>

          {/* Configuración de Sesión */}
          <div className="space-y-6">
            <div>
              <label className="block text-white font-medium mb-3">Tipo de Tarea</label>
              <div className="grid grid-cols-1 gap-2">
                {taskTypes.map((task) => (
                  <button
                    key={task}
                    onClick={() => setSelectedTask(task)}
                    className={`p-3 rounded-lg border transition-all duration-200 text-left ${
                      selectedTask === task
                        ? 'bg-blue-500/20 border-blue-500 text-blue-400'
                        : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600'
                    }`}
                  >
                    {task}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-white font-medium mb-3">Identidad Activa</label>
              <div className="space-y-2">
                {activeIdentities.map((identity) => (
                  <button
                    key={identity.id}
                    onClick={() => setSelectedIdentity(identity.name)}
                    className={`w-full p-3 rounded-lg border transition-all duration-200 flex items-center ${
                      selectedIdentity === identity.name
                        ? 'bg-blue-500/20 border-blue-500 text-blue-400'
                        : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600'
                    }`}
                  >
                    <div className="w-8 h-8 bg-gray-700 rounded-full mr-3 flex items-center justify-center">
                      <span className="text-sm">{identity.name.charAt(3)}</span>
                    </div>
                    <div className="text-left">
                      <div className="font-medium">{identity.name}</div>
                      <div className="text-sm text-gray-400">{identity.role}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4">
              <Button
                variant="primary"
                size="lg"
                fullWidth
                disabled={!selectedTask || !selectedIdentity}
                onClick={handleStartSession}
              >
                <Play className="w-5 h-5 mr-2" />
                Iniciar Sesión de 25 Minutos
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 pb-20">
      <Header title="Sesión de Enfoque Activa" />
      
      <main className="max-w-md mx-auto px-4 py-6">
        {/* Timer Principal */}
        <div className="text-center mb-8">
          <CircularTimer
            timeLeft={timeLeft}
            duration={duration}
            progress={progress}
            formatTime={formatTime}
          />
        </div>

        {/* Información de la Sesión */}
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 mb-8">
          <div className="flex items-center mb-3">
            <div className="w-8 h-8 bg-gray-700 rounded-full mr-3 flex items-center justify-center">
              <span className="text-sm">{selectedIdentity.charAt(3)}</span>
            </div>
            <div>
              <div className="text-white font-medium">{selectedIdentity}</div>
              <div className="text-gray-400 text-sm">Trabajando en: {selectedTask}</div>
            </div>
          </div>
        </div>

        {/* Controles */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {!isActive || isPaused ? (
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={isPaused ? resumeTimer : startTimer}
            >
              <Play className="w-5 h-5 mr-1" />
              {isPaused ? 'Reanudar' : 'Iniciar'}
            </Button>
          ) : (
            <Button
              variant="secondary"
              size="lg"
              fullWidth
              onClick={pauseTimer}
            >
              <Pause className="w-5 h-5 mr-1" />
              Pausar
            </Button>
          )}
          
          <Button
            variant="secondary"
            size="lg"
            fullWidth
            onClick={handleTakeBreak}
          >
            <Coffee className="w-5 h-5 mr-1" />
            Descanso
          </Button>
          
          <Button
            variant="danger"
            size="lg"
            fullWidth
            onClick={handleStopSession}
          >
            <Square className="w-5 h-5 mr-1" />
            Finalizar
          </Button>
        </div>

        {/* Estadísticas de la Sesión */}
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <h3 className="text-white font-medium mb-3">Estadísticas</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-gray-400 text-sm">Tiempo Transcurrido</div>
              <div className="text-white font-medium">
                {formatTime((duration * 60) - timeLeft)}
              </div>
            </div>
            <div>
              <div className="text-gray-400 text-sm">Tiempo Restante</div>
              <div className="text-white font-medium">
                {formatTime(timeLeft)}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Focus;
