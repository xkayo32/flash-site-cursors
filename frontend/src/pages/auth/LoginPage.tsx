import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowRight,
  Zap,
  CheckCircle,
  AlertCircle,
  Users,
  Sun,
  Moon,
  Monitor
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';
import { Logo } from '@/components/ui/Logo';
import { useTheme } from '@/contexts/ThemeContext';
import { API_ENDPOINTS } from '@/config/api';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

export default function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.email) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Call API endpoint with form-encoded data
      const params = new URLSearchParams();
      params.append('email', formData.email);
      params.append('password', formData.password);

      console.log('Attempting login to:', API_ENDPOINTS.auth.login);
      console.log('Login data:', { email: formData.email });

      const response = await fetch(API_ENDPOINTS.auth.login, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });

      const data = await response.json();

      if (data.success) {
        console.log('Login successful:', data);
        
        // Save JWT token and user data
        setAuth(
          {
            id: data.user.id,
            name: data.user.name,
            email: data.user.email,
            role: data.user.role,
            avatar: data.user.avatar || `https://ui-avatars.com/api/?name=${data.user.name}&background=14242f&color=fff`,
            subscription: data.user.subscription || {
              plan: 'Basic',
              expiresAt: null,
              status: 'active'
            }
          },
          data.token
        );

        toast.success('Login realizado com sucesso!');
        
        console.log('User role:', data.user.role);
        console.log('Navigating to:', data.user.role === 'admin' ? '/admin/dashboard' : '/dashboard');
        
        // Redirect based on role
        if (data.user.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/dashboard');
        }
      } else {
        console.error('Login failed:', data);
        toast.error(data.message || 'Email ou senha inválidos');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Erro ao fazer login. Verifique sua conexão.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Theme Selector */}
      <div className="absolute top-4 right-4 z-10">
        <div className="flex items-center gap-2 p-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg">
          <button
            onClick={() => setTheme('light')}
            className={`p-2 rounded-md transition-colors ${
              theme === 'light' 
                ? 'bg-primary-100 dark:bg-primary-800 text-primary-600 dark:text-primary-400' 
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
            title="Tema Claro"
          >
            <Sun className="w-4 h-4" />
          </button>
          <button
            onClick={() => setTheme('dark')}
            className={`p-2 rounded-md transition-colors ${
              theme === 'dark' 
                ? 'bg-primary-100 dark:bg-primary-800 text-primary-600 dark:text-primary-400' 
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
            title="Tema Escuro"
          >
            <Moon className="w-4 h-4" />
          </button>
          <button
            onClick={() => setTheme('system')}
            className={`p-2 rounded-md transition-colors ${
              theme === 'system' 
                ? 'bg-primary-100 dark:bg-primary-800 text-primary-600 dark:text-primary-400' 
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
            title="Seguir Sistema"
          >
            <Monitor className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Left Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white dark:bg-gray-900">
        <motion.div
          initial="initial"
          animate="animate"
          variants={{
            animate: { transition: { staggerChildren: 0.1 } }
          }}
          className="w-full max-w-md"
        >
          {/* Logo and Title */}
          <motion.div variants={fadeInUp} className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <Logo variant="icon" size="lg" animated={true} />
            </div>
            <h1 className="text-2xl font-bold text-primary-900 dark:text-white mb-2">
              Bem-vindo de volta!
            </h1>
            <p className="text-primary-600 dark:text-gray-300">
              Faça login para continuar seus estudos
            </p>
          </motion.div>



          {/* Login Form */}
          <motion.form variants={fadeInUp} onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-primary-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  required
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition dark:bg-gray-800 dark:border-gray-600 dark:text-white ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    if (errors.email) setErrors({ ...errors, email: '' });
                  }}
                />
              </div>
              {errors.email && (
                <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {errors.email}
                </div>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-primary-700 dark:text-gray-300 mb-2">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition dark:bg-gray-800 dark:border-gray-600 dark:text-white ${
                    errors.password ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => {
                    setFormData({ ...formData, password: e.target.value });
                    if (errors.password) setErrors({ ...errors, password: '' });
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {errors.password}
                </div>
              )}
            </div>

            {/* Remember Me and Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                  className="w-4 h-4 text-primary-600 border-gray-300 dark:border-gray-600 rounded focus:ring-primary-500 dark:bg-gray-800"
                />
                <span className="text-sm text-primary-700 dark:text-gray-300">Lembrar de mim</span>
              </label>
              <Link
                to="/forgot-password"
                className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 hover:underline"
              >
                Esqueceu a senha?
              </Link>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-12 text-base font-medium"
              isLoading={isLoading}
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
              {!isLoading && <ArrowRight className="ml-2 w-5 h-5" />}
            </Button>
          </motion.form>

          {/* Sign Up Link */}
          <motion.div variants={fadeInUp} className="mt-6 text-center">
            <span className="text-primary-600">Não tem uma conta? </span>
            <Link
              to="/register"
              className="text-primary-600 dark:text-primary-400 font-medium hover:text-primary-700 dark:hover:text-primary-300 hover:underline"
            >
              Cadastre-se gratuitamente
            </Link>
          </motion.div>

          {/* Footer */}
          <motion.div variants={fadeInUp} className="mt-8 text-center text-xs text-gray-500">
            Ao continuar, você concorda com nossos{' '}
            <a href="#" className="hover:underline">Termos de Uso</a> e{' '}
            <a href="#" className="hover:underline">Política de Privacidade</a>
          </motion.div>
        </motion.div>
      </div>

      {/* Right Side - New Courses */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-60 h-60 bg-accent-500 rounded-full filter blur-3xl"></div>
        </div>
        
        <div className="relative z-10 flex items-center justify-center w-full p-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-xl w-full"
          >
            {/* Header */}
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-center mb-10"
            >
              <h2 className="text-4xl font-bold mb-4">
                🎯 Novos Cursos Disponíveis
              </h2>
              <p className="text-xl text-primary-100">
                Materiais atualizados para os concursos mais aguardados
              </p>
            </motion.div>

            {/* Course Cards */}
            <div className="space-y-4">
              {[
                {
                  title: 'Polícia Federal 2024',
                  badge: 'NOVO',
                  badgeColor: 'bg-green-500',
                  students: '2.341',
                  modules: '18 módulos',
                  questions: '8.500+ questões',
                  icon: '👮‍♂️'
                },
                {
                  title: 'Receita Federal - Auditor',
                  badge: 'ATUALIZADO',
                  badgeColor: 'bg-blue-500',
                  students: '1.856',
                  modules: '22 módulos',
                  questions: '12.300+ questões',
                  icon: '💼'
                },
                {
                  title: 'Tribunais - TRT/TRF',
                  badge: 'EM ALTA',
                  badgeColor: 'bg-orange-500',
                  students: '987',
                  modules: '15 módulos',
                  questions: '6.700+ questões',
                  icon: '⚖️'
                }
              ].map((course, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                  className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6 hover:bg-white/15 transition-all duration-300 transform hover:scale-105"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{course.icon}</span>
                      <div>
                        <h3 className="font-bold text-lg">{course.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-primary-200 mt-1">
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {course.students} alunos
                          </span>
                          <span>{course.modules}</span>
                        </div>
                      </div>
                    </div>
                    <span className={`${course.badgeColor} text-white text-xs px-2 py-1 rounded-full font-bold`}>
                      {course.badge}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-primary-300">{course.questions}</span>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="text-accent-400 hover:text-accent-300 transition-colors"
                    >
                      <ArrowRight className="w-5 h-5" />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Bottom Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.9 }}
              className="mt-8 text-center"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent-500/20 rounded-full">
                <Zap className="w-5 h-5 text-accent-400" />
                <span className="text-accent-300 font-medium">
                  +12 novos cursos este mês
                </span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}