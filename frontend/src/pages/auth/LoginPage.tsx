import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implementar login real com API
    console.log('Login:', formData);
    
    // Mock login
    setAuth(
      {
        id: '1',
        name: 'Usuário Teste',
        email: formData.email,
        role: 'student',
      },
      'fake-token'
    );
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-600 to-primary-800">
      <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl shadow-2xl w-full max-w-md border border-white/20">
        <h2 className="text-3xl font-bold text-center mb-8 text-white">Entrar</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-primary-100 mb-2">
              Email
            </label>
            <input
              type="email"
              required
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-400 focus:border-transparent text-white placeholder-primary-200"
              placeholder="seu@email.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-primary-100 mb-2">
              Senha
            </label>
            <input
              type="password"
              required
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-400 focus:border-transparent text-white placeholder-primary-200"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>
          
          <button
            type="submit"
            className="w-full py-3 px-4 bg-accent-500 text-white font-medium rounded-lg hover:bg-accent-600 transform hover:scale-105 transition duration-200 shadow-lg"
          >
            Entrar
          </button>
        </form>
        
        <div className="mt-6 text-center text-sm">
          <span className="text-primary-100">Não tem uma conta? </span>
          <Link to="/register" className="text-accent-400 hover:text-accent-300 font-medium">
            Cadastre-se
          </Link>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;