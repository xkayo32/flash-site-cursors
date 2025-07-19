import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  ArrowRight,
  Zap,
  CheckCircle,
  AlertCircle,
  Shield,
  TrendingUp,
  Award,
  Users,
  Star,
  Sparkles,
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

// Componentes dos ícones das redes sociais (reutilizados do LoginPage)
const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

const MicrosoftIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20">
    <path fill="#F25022" d="M1 1h10v10H1z" />
    <path fill="#00A4EF" d="M13 1h10v10H13z" />
    <path fill="#7FBA00" d="M1 13h10v10H1z" />
    <path fill="#FFB900" d="M13 13h10v10H13z" />
  </svg>
);

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

export default function RegisterPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Nome deve ter pelo menos 2 caracteres';
    }

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

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirmação de senha é obrigatória';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Senhas não coincidem';
    }

    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'Você deve aceitar os termos de uso';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Simular chamada de API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock registration - automatically log in user
      setAuth(
        {
          id: '1',
          name: formData.name,
          email: formData.email,
          role: 'student',
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=14242f&color=fff`,
          subscription: {
            plan: 'Básico',
            expiresAt: '2024-12-31',
            status: 'active'
          }
        },
        'fake-token'
      );

      toast.success('Conta criada com sucesso! Bem-vindo(a) à StudyPro!');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Erro ao criar conta. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialRegister = (provider: 'google' | 'microsoft') => {
    toast.success(`Registro com ${provider === 'google' ? 'Google' : 'Microsoft'} em desenvolvimento`);
    // Aqui seria implementada a integração real
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

      {/* Left Side - Register Form */}
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
            <h1 className="text-2xl font-bold text-primary-900 mb-2">
              Comece sua jornada
            </h1>
            <p className="text-primary-600">
              Crie sua conta e acelere sua aprovação
            </p>
          </motion.div>

          {/* Social Register Buttons */}
          <motion.div variants={fadeInUp} className="space-y-3 mb-6">
            <Button
              variant="outline"
              className="w-full h-12 text-left justify-start gap-3 border-gray-300 hover:border-primary-300"
              onClick={() => handleSocialRegister('google')}
            >
              <GoogleIcon />
              <span>Cadastrar com Google</span>
            </Button>
            
            <Button
              variant="outline"
              className="w-full h-12 text-left justify-start gap-3 border-gray-300 hover:border-primary-300"
              onClick={() => handleSocialRegister('microsoft')}
            >
              <MicrosoftIcon />
              <span>Cadastrar com Microsoft</span>
            </Button>
          </motion.div>

          {/* Divider */}
          <motion.div variants={fadeInUp} className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">ou cadastre-se com email</span>
            </div>
          </motion.div>

          {/* Register Form */}
          <motion.form variants={fadeInUp} onSubmit={handleSubmit} className="space-y-4">
            {/* Name Field */}
            <div>
              <label className="block text-sm font-medium text-primary-700 mb-2">
                Nome completo
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  required
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Seu nome completo"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (errors.name) setErrors({ ...errors, name: '' });
                  }}
                />
              </div>
              {errors.name && (
                <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {errors.name}
                </div>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-primary-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  required
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition ${
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
              <label className="block text-sm font-medium text-primary-700 mb-2">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition ${
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

            {/* Confirm Password Field */}
            <div>
              <label className="block text-sm font-medium text-primary-700 mb-2">
                Confirmar senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition ${
                    errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => {
                    setFormData({ ...formData, confirmPassword: e.target.value });
                    if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' });
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {errors.confirmPassword}
                </div>
              )}
            </div>

            {/* Terms and Conditions */}
            <div>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.acceptTerms}
                  onChange={(e) => {
                    setFormData({ ...formData, acceptTerms: e.target.checked });
                    if (errors.acceptTerms) setErrors({ ...errors, acceptTerms: '' });
                  }}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 mt-0.5"
                />
                <span className="text-sm text-primary-700">
                  Aceito os{' '}
                  <a href="#" className="text-primary-600 hover:underline">Termos de Uso</a>
                  {' '}e{' '}
                  <a href="#" className="text-primary-600 hover:underline">Política de Privacidade</a>
                </span>
              </label>
              {errors.acceptTerms && (
                <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {errors.acceptTerms}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-12 text-base font-medium"
              isLoading={isLoading}
            >
              {isLoading ? 'Criando conta...' : 'Criar conta'}
              {!isLoading && <ArrowRight className="ml-2 w-5 h-5" />}
            </Button>
          </motion.form>

          {/* Login Link */}
          <motion.div variants={fadeInUp} className="mt-6 text-center">
            <span className="text-primary-600">Já tem uma conta? </span>
            <Link
              to="/login"
              className="text-primary-600 font-medium hover:text-primary-700 hover:underline"
            >
              Entrar agora
            </Link>
          </motion.div>

          {/* Footer */}
          <motion.div variants={fadeInUp} className="mt-8 text-center text-xs text-gray-500">
            Ao se cadastrar, você concorda com nossos{' '}
            <a href="#" className="hover:underline">Termos de Uso</a> e{' '}
            <a href="#" className="hover:underline">Política de Privacidade</a>
          </motion.div>
        </motion.div>
      </div>

      {/* Right Side - Benefits */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-40 h-40 bg-accent-500 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-60 h-60 bg-white rounded-full filter blur-3xl"></div>
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
                ✨ Por que escolher a StudyPro?
              </h2>
              <p className="text-xl text-primary-100">
                Veja o que nossos alunos conquistaram
              </p>
            </motion.div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              {[
                { number: '15.000+', label: 'Alunos ativos', icon: Users },
                { number: '5.432', label: 'Aprovações em 2024', icon: Award },
                { number: '98%', label: 'Taxa de satisfação', icon: Star },
                { number: '50.000+', label: 'Questões no banco', icon: Sparkles }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                  className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6 text-center hover:bg-white/15 transition-all duration-300"
                >
                  <stat.icon className="w-8 h-8 mx-auto mb-2 text-accent-400" />
                  <div className="text-2xl font-bold mb-1">{stat.number}</div>
                  <div className="text-sm text-primary-200">{stat.label}</div>
                </motion.div>
              ))}
            </div>

            {/* Benefits List */}
            <div className="space-y-3">
              {[
                'Cronograma personalizado com IA',
                'Simulados idênticos às provas',
                'Flashcards inteligentes',
                'Suporte direto com professores',
                'Garantia de 7 dias'
              ].map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-6 h-6 bg-accent-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-primary-100">{benefit}</span>
                </motion.div>
              ))}
            </div>

            {/* Bottom CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.2 }}
              className="mt-8 text-center"
            >
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-accent-500/20 rounded-full">
                <Zap className="w-5 h-5 text-accent-400" />
                <span className="text-accent-300 font-medium">
                  Comece grátis por 7 dias
                </span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}