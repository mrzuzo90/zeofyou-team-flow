
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Identity {
  id: number;
  name: string;
  role: string;
  avatar: string;
  status: 'activo' | 'descansando' | 'inactivo';
  description: string;
  color: string;
}

interface Task {
  id: number;
  title: string;
  description: string;
  status: 'por_hacer' | 'en_progreso' | 'completado';
  priority: 'alta' | 'media' | 'baja';
  assignedTo: string;
  category: string;
  dueDate?: string;
}

interface FocusSession {
  id: number;
  task: string;
  identity: string;
  duration: number;
  completed: boolean;
  date: string;
}

interface AppContextType {
  identities: Identity[];
  tasks: Task[];
  focusSessions: FocusSession[];
  currentUser: any;
  metrics: {
    teamEnergy: number;
    teamMorale: number;
    teamFocus: number;
    productivity: number;
  };
  addTask: (task: Omit<Task, 'id'>) => void;
  updateTask: (id: number, updates: Partial<Task>) => void;
  addFocusSession: (session: Omit<FocusSession, 'id'>) => void;
  updateIdentityStatus: (id: number, status: Identity['status']) => void;
  login: (email: string, password: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const initialIdentities: Identity[] = [
  {
    id: 1,
    name: 'El Estratega',
    role: 'Planificador Principal',
    avatar: '/avatars/strategist.png',
    status: 'activo',
    description: 'Se encarga de la visión a largo plazo y la toma de decisiones estratégicas',
    color: 'blue'
  },
  {
    id: 2,
    name: 'El Creativo',
    role: 'Director de Innovación',
    avatar: '/avatars/creative.png',
    status: 'descansando',
    description: 'Genera ideas originales y soluciones creativas',
    color: 'purple'
  },
  {
    id: 3,
    name: 'El Organizador',
    role: 'Gestor de Procesos',
    avatar: '/avatars/organizer.png',
    status: 'activo',
    description: 'Mantiene todo estructurado y funcionando sin problemas',
    color: 'green'
  },
  {
    id: 4,
    name: 'El Coach',
    role: 'Bienestar Personal',
    avatar: '/avatars/coach.png',
    status: 'activo',
    description: 'Cuida del bienestar emocional y motivación del equipo',
    color: 'orange'
  }
];

const initialTasks: Task[] = [
  {
    id: 1,
    title: 'Crear nueva página de aterrizaje',
    description: 'Diseñar y desarrollar la página principal del proyecto',
    status: 'por_hacer',
    priority: 'alta',
    assignedTo: 'El Creativo',
    category: 'Diseño',
    dueDate: '2024-01-15'
  },
  {
    id: 2,
    title: 'Planificar campaña de redes sociales',
    description: 'Desarrollar estrategia de contenido para redes sociales',
    status: 'en_progreso',
    priority: 'media',
    assignedTo: 'El Estratega',
    category: 'Marketing'
  },
  {
    id: 3,
    title: 'Organizar documentación del proyecto',
    description: 'Estructurar y documentar todos los procesos',
    status: 'por_hacer',
    priority: 'media',
    assignedTo: 'El Organizador',
    category: 'Documentación'
  },
  {
    id: 4,
    title: 'Revisar métricas de bienestar',
    description: 'Evaluar el estado emocional y motivacional del equipo',
    status: 'completado',
    priority: 'baja',
    assignedTo: 'El Coach',
    category: 'Bienestar'
  }
];

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [identities, setIdentities] = useState<Identity[]>(() => {
    const saved = localStorage.getItem('zeofyou_identities');
    return saved ? JSON.parse(saved) : initialIdentities;
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('zeofyou_tasks');
    return saved ? JSON.parse(saved) : initialTasks;
  });

  const [focusSessions, setFocusSessions] = useState<FocusSession[]>(() => {
    const saved = localStorage.getItem('zeofyou_focus_sessions');
    return saved ? JSON.parse(saved) : [];
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('zeofyou_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [metrics] = useState({
    teamEnergy: 85,
    teamMorale: 92,
    teamFocus: 78,
    productivity: 88
  });

  useEffect(() => {
    localStorage.setItem('zeofyou_identities', JSON.stringify(identities));
  }, [identities]);

  useEffect(() => {
    localStorage.setItem('zeofyou_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('zeofyou_focus_sessions', JSON.stringify(focusSessions));
  }, [focusSessions]);

  const addTask = (task: Omit<Task, 'id'>) => {
    const newTask = { ...task, id: Date.now() };
    setTasks(prev => [...prev, newTask]);
  };

  const updateTask = (id: number, updates: Partial<Task>) => {
    setTasks(prev => prev.map(task => task.id === id ? { ...task, ...updates } : task));
  };

  const addFocusSession = (session: Omit<FocusSession, 'id'>) => {
    const newSession = { ...session, id: Date.now() };
    setFocusSessions(prev => [...prev, newSession]);
  };

  const updateIdentityStatus = (id: number, status: Identity['status']) => {
    setIdentities(prev => prev.map(identity => 
      identity.id === id ? { ...identity, status } : identity
    ));
  };

  const login = (email: string, password: string) => {
    const user = { email, name: 'Usuario Zeofyou' };
    setCurrentUser(user);
    localStorage.setItem('zeofyou_user', JSON.stringify(user));
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('zeofyou_user');
  };

  const isAuthenticated = !!currentUser;

  return (
    <AppContext.Provider value={{
      identities,
      tasks,
      focusSessions,
      currentUser,
      metrics,
      addTask,
      updateTask,
      addFocusSession,
      updateIdentityStatus,
      login,
      logout,
      isAuthenticated
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
