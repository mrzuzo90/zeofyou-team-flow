
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { useApp } from '../contexts/AppContext';
import { Users } from 'lucide-react';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { login } = useApp();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }
    login(email, password);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full">
        {/* Logo y Título */}
        <div className="text-center mb-8">
          <div className="bg-blue-500/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-10 h-10 text-blue-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Zeofyou</h1>
          <p className="text-gray-400">Crea tu cuenta y comienza a gestionar tu equipo mental</p>
        </div>

        {/* Formulario */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-6 text-center">
            Crear Cuenta
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Nombre Completo
              </label>
              <Input
                type="text"
                placeholder="Ingresa tu nombre completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
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
                placeholder="Crea una contraseña segura"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Confirmar Contraseña
              </label>
              <Input
                type="password"
                placeholder="Confirma tu contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="text-sm">
              <label className="flex items-start text-gray-400">
                <input type="checkbox" className="mr-2 mt-1 rounded" required />
                <span>
                  Acepto los{' '}
                  <Link to="/terms" className="text-blue-400 hover:text-blue-300">
                    Términos de Servicio
                  </Link>{' '}
                  y{' '}
                  <Link to="/privacy" className="text-blue-400 hover:text-blue-300">
                    Política de Privacidad
                  </Link>
                </span>
              </label>
            </div>
            
            <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900">
              Crear Cuenta
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <span className="text-gray-400">¿Ya tienes cuenta? </span>
            <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium">
              Inicia sesión
            </Link>
          </div>
        </div>

        {/* Beneficios */}
        <div className="mt-8">
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <h3 className="text-white font-medium mb-3 text-center">¿Por qué Zeofyou?</h3>
            <div className="space-y-2 text-sm text-gray-400">
              <div className="flex items-center">
                <span className="text-green-400 mr-2">✓</span>
                Gestiona tus identidades internas como un equipo
              </div>
              <div className="flex items-center">
                <span className="text-green-400 mr-2">✓</span>
                Mejora tu productividad y enfoque
              </div>
              <div className="flex items-center">
                <span className="text-green-400 mr-2">✓</span>
                Obtén insights sobre tus patrones mentales
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
