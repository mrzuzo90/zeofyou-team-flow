
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { useApp } from '../contexts/AppContext';
import { Users } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useApp();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(email, password);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Logo y Título */}
        <div className="text-center mb-8">
          <div className="bg-blue-500/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-10 h-10 text-blue-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Zeofyou</h1>
          <p className="text-gray-400">Gestiona tu equipo mental interno</p>
        </div>

        {/* Formulario */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-6 text-center">
            Bienvenido de vuelta
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Correo Electrónico
              </label>
              <Input
                type="email"
                placeholder="Ingresa tu email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Contraseña
              </label>
              <Input
                type="password"
                placeholder="Ingresa tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center text-gray-400">
                <input type="checkbox" className="mr-2 rounded" />
                Recordarme
              </label>
              <Link to="/forgot-password" className="text-blue-400 hover:text-blue-300">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            
            <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900">
              Iniciar Sesión
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <span className="text-gray-400">¿No tienes cuenta? </span>
            <Link to="/signup" className="text-blue-400 hover:text-blue-300 font-medium">
              Regístrate
            </Link>
          </div>
        </div>

        {/* Características */}
        <div className="mt-8 text-center">
          <div className="grid grid-cols-3 gap-4 text-xs">
            <div className="text-gray-400">
              <div className="text-blue-400 font-medium">🧠</div>
              <div>Equipo Mental</div>
            </div>
            <div className="text-gray-400">
              <div className="text-green-400 font-medium">📊</div>
              <div>Analytics</div>
            </div>
            <div className="text-gray-400">
              <div className="text-purple-400 font-medium">🎯</div>
              <div>Enfoque</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
