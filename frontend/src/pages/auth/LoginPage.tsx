import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowRight,
  Shield,
  AlertCircle,
  Facebook,
  Chrome,
  Linkedin,
  ArrowLeft,
  Sun,
  Moon
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';
import { StudyProLogo } from '@/components/ui/StudyProLogo';
import toast from 'react-hot-toast';
import { API_ENDPOINTS } from '@/config/api';
import { useTheme } from '@/contexts/ThemeContext';
import '../../styles/police-fonts.css';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

export default function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const { setTheme, resolvedTheme } = useTheme();
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
      const params = new URLSearchParams();
      params.append('email', formData.email);
      params.append('password', formData.password);

      const response = await fetch(API_ENDPOINTS.auth.login, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });

      const data = await response.json();

      if (data.success) {
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
        
        if (data.user.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/dashboard');
        }
      } else {
        if (process.env.NODE_ENV === 'development') {
          console.error('Login failed:', data);
        }
        toast.error(data.message || 'Email ou senha inválidos');
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Login error:', error);
      }
      toast.error('Erro ao fazer login. Verifique sua conexão.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider: string) => {
    toast.error(`Login com ${provider} em desenvolvimento`);
  };

  return (
    <div className="min-h-screen flex font-police-primary bg-gray-50 dark:bg-gray-950">
      {/* Left Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white dark:bg-black relative">

        {/* Background Pattern */}
        <div 
          className="absolute inset-0 opacity-5 dark:opacity-5"
          style={{
            backgroundImage: resolvedTheme === 'dark' 
              ? `repeating-linear-gradient(
                  45deg,
                  transparent,
                  transparent 35px,
                  rgba(255,255,255,.05) 35px,
                  rgba(255,255,255,.05) 70px
                )`
              : `repeating-linear-gradient(
                  45deg,
                  transparent,
                  transparent 35px,
                  rgba(0,0,0,.05) 35px,
                  rgba(0,0,0,.05) 70px
                )`
          }}
        />
        
        <motion.div
          initial="initial"
          animate="animate"
          variants={{
            animate: { transition: { staggerChildren: 0.1 } }
          }}
          className="w-full max-w-md relative z-10"
        >
          {/* Back to Home Button and Theme Toggle */}
          <motion.div variants={fadeInUp} className="mb-8 flex items-center justify-between">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all duration-300 font-police-body group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="tracking-wider">VOLTAR AO INÍCIO</span>
            </Link>
            
            {/* Theme Toggle Button */}
            <button
              onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-full text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-accent-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300"
              aria-label="Toggle theme"
            >
              {resolvedTheme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </motion.div>
          
          {/* Logo and Title */}
          <motion.div variants={fadeInUp} className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <StudyProLogo variant="icon" size="xl" className="text-gray-900 dark:text-white" />
            </div>
            <h1 className="text-4xl font-police-title text-gray-900 dark:text-white mb-2 tracking-widest">
              ACESSO RESTRITO
            </h1>
            <p className="text-gray-600 dark:text-gray-400 font-police-body tracking-wider">
              IDENTIFIQUE-SE PARA CONTINUAR
            </p>
          </motion.div>

          {/* Login Form */}
          <motion.form variants={fadeInUp} onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-police-subtitle text-gray-700 dark:text-gray-300 mb-2 tracking-widest">
                IDENTIFICAÇÃO
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                <input
                  type="email"
                  required
                  className={`w-full pl-10 pr-4 py-4 bg-gray-100 dark:bg-gray-900 border text-gray-900 dark:text-white rounded focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent transition font-police-body ${
                    errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
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
                <div className="flex items-center gap-1 mt-1 text-red-500 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {errors.email}
                </div>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-police-subtitle text-gray-700 dark:text-gray-300 mb-2 tracking-widest">
                SENHA DE ACESSO
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  className={`w-full pl-10 pr-12 py-4 bg-gray-100 dark:bg-gray-900 border text-gray-900 dark:text-white rounded focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent transition font-police-body ${
                    errors.password ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
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
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <div className="flex items-center gap-1 mt-1 text-red-500 text-sm">
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
                  className="w-4 h-4 text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-900 border-gray-300 dark:border-gray-700 rounded focus:ring-gray-900 dark:focus:ring-white"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400 font-police-body">Manter conectado</span>
              </label>
              <Link
                to="/forgot-password"
                className="text-sm text-gray-900 dark:text-white font-police-subtitle hover:underline tracking-wider transition"
              >
                RECUPERAR ACESSO
              </Link>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-14 text-lg font-police-title bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black dark:text-white tracking-widest shadow-lg hover:shadow-xl transition-all"
              isLoading={isLoading}
            >
              {isLoading ? 'VALIDANDO...' : 'ACESSAR SISTEMA'}
              {!isLoading && <ArrowRight className="ml-2 w-5 h-5" />}
            </Button>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-800"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white dark:bg-black px-4 text-gray-500 font-police-body">OU ACESSE COM</span>
              </div>
            </div>

            {/* Social Login Buttons */}
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => handleSocialLogin('Facebook')}
                className="flex items-center justify-center gap-2 p-3 bg-gray-100 dark:bg-gray-900 hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-700 dark:text-white rounded border border-gray-300 dark:border-gray-700 transition-all duration-300"
              >
                <Facebook className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => handleSocialLogin('Google')}
                className="flex items-center justify-center gap-2 p-3 bg-gray-100 dark:bg-gray-900 hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-700 dark:text-white rounded border border-gray-300 dark:border-gray-700 transition-all duration-300"
              >
                <Chrome className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => handleSocialLogin('LinkedIn')}
                className="flex items-center justify-center gap-2 p-3 bg-gray-100 dark:bg-gray-900 hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-700 dark:text-white rounded border border-gray-300 dark:border-gray-700 transition-all duration-300"
              >
                <Linkedin className="w-5 h-5" />
              </button>
            </div>
          </motion.form>

          {/* Sign Up Link */}
          <motion.div variants={fadeInUp} className="mt-8 text-center">
            <span className="text-gray-600 dark:text-gray-400 font-police-body">PRIMEIRO ACESSO? </span>
            <Link
              to="/register"
              className="text-gray-900 dark:text-white font-police-subtitle hover:underline tracking-wider"
            >
              CRIAR CONTA
            </Link>
          </motion.div>

          {/* Footer */}
          <motion.div variants={fadeInUp} className="mt-8 text-center text-xs text-gray-500 font-police-body">
            ACESSO PROTEGIDO • DADOS CRIPTOGRAFADOS • SSL 256-BIT
          </motion.div>

          {/* Quick Fill Buttons - Development Only */}
          {process.env.NODE_ENV === 'development' && (
            <motion.div 
              variants={fadeInUp} 
              className="mt-6 flex gap-3 justify-center"
            >
              <button
                type="button"
                onClick={() => {
                  setFormData({
                    email: 'admin@studypro.com',
                    password: 'Admin@123',
                    rememberMe: true
                  });
                }}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-police-body rounded border border-gray-300 dark:border-gray-700 transition-all duration-300"
              >
                PREENCHER ADMIN
              </button>
              <button
                type="button"
                onClick={() => {
                  setFormData({
                    email: 'aluno@example.com',
                    password: 'aluno123',
                    rememberMe: false
                  });
                }}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-police-body rounded border border-gray-300 dark:border-gray-700 transition-all duration-300"
              >
                PREENCHER ALUNO
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Right Side - Hero Image */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden bg-gray-900 dark:bg-black">
        {/* Background Image */}
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1633265486064-086b219458ec?q=80&w=2070')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-white/60 dark:bg-black/70"></div>
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-white dark:from-black via-white/50 dark:via-black/50 to-transparent"></div>
          
          {/* Scan lines effect */}
          <div 
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `repeating-linear-gradient(
                0deg,
                rgba(255, 255, 255, 0) 0px,
                rgba(255, 255, 255, 0.03) 1px,
                rgba(255, 255, 255, 0) 2px,
                rgba(255, 255, 255, 0) 3px
              )`
            }}
          />
        </div>
        
        <div className="relative z-10 flex items-center justify-center w-full p-12">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-xl w-full text-gray-900 dark:text-white"
          >
            {/* Stats */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mb-12"
            >
              <h2 className="text-5xl font-police-title mb-6 tracking-ultra-wide">
                PLATAFORMA ELITE
              </h2>
              <p className="text-xl text-gray-700 dark:text-gray-300 font-police-body mb-8 leading-relaxed">
                METODOLOGIA EXCLUSIVA PARA CONCURSOS DE ALTA PERFORMANCE
              </p>
              
              <div className="grid grid-cols-2 gap-6">
                {[
                  { number: '89%', label: 'TAXA DE APROVAÇÃO' },
                  { number: '15.847', label: 'APROVADOS EM 2024' },
                  { number: '50K+', label: 'QUESTÕES COMENTADAS' },
                  { number: '24/7', label: 'SUPORTE DEDICADO' }
                ].map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                    className="bg-gray-900/20 dark:bg-white/10 backdrop-blur-sm rounded p-6 border border-gray-700/30 dark:border-white/20"
                  >
                    <div className="text-3xl font-police-numbers mb-2 text-gray-900 dark:text-white">{stat.number}</div>
                    <div className="text-xs font-police-subtitle tracking-widest text-gray-700 dark:text-gray-300">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.9 }}
              className="space-y-3"
            >
              {[
                'SIMULADOS COM CORREÇÃO TRI',
                'INTELIGÊNCIA ARTIFICIAL ADAPTATIVA',
                'MENTORIA COM APROVADOS',
                'MATERIAL ATUALIZADO DIARIAMENTE'
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-3 text-gray-700 dark:text-gray-300 font-police-body">
                  <div className="w-2 h-2 bg-gray-900 dark:bg-white rounded-full" />
                  <span className="tracking-wider">{feature}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}