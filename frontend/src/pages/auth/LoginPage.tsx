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
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';
import { Logo } from '@/components/ui/Logo';

// Componentes dos ícones das redes sociais
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

export default function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
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
      // Simular chamada de API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Verificar credenciais de teste
      if (formData.email === 'teste@studypro.com' && formData.password === '123456') {
        // Mock login com credenciais de teste
        setAuth(
          {
            id: '1',
            name: 'Usuário Teste',
            email: formData.email,
            role: 'student',
            avatar: `https://ui-avatars.com/api/?name=Usuário+Teste&background=14242f&color=fff`,
            subscription: {
              plan: 'Premium',
              expiresAt: '2024-12-31',
              status: 'active'
            }
          },
          'fake-token'
        );

        toast.success('Login realizado com sucesso!');
        navigate('/dashboard');
      } else {
        // Para outros emails, simular login normal
        setAuth(
          {
            id: '1',
            name: 'João Silva',
            email: formData.email,
            role: 'student',
            avatar: `https://ui-avatars.com/api/?name=João+Silva&background=14242f&color=fff`,
            subscription: {
              plan: 'Premium',
              expiresAt: '2024-12-31',
              status: 'active'
            }
          },
          'fake-token'
        );

        toast.success('Login realizado com sucesso!');
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error('Erro ao fazer login. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider: 'google' | 'microsoft') => {
    toast.success(`Login com ${provider === 'google' ? 'Google' : 'Microsoft'} em desenvolvimento`);
    // Aqui seria implementada a integração real
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
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
              Bem-vindo de volta!
            </h1>
            <p className="text-primary-600">
              Faça login para continuar seus estudos
            </p>
          </motion.div>

          {/* Social Login Buttons */}
          <motion.div variants={fadeInUp} className="space-y-3 mb-6">
            <Button
              variant="outline"
              className="w-full h-12 text-left justify-start gap-3 border-gray-300 hover:border-primary-300"
              onClick={() => handleSocialLogin('google')}
            >
              <GoogleIcon />
              <span>Continuar com Google</span>
            </Button>
            
            <Button
              variant="outline"
              className="w-full h-12 text-left justify-start gap-3 border-gray-300 hover:border-primary-300"
              onClick={() => handleSocialLogin('microsoft')}
            >
              <MicrosoftIcon />
              <span>Continuar com Microsoft</span>
            </Button>
          </motion.div>

          {/* Divider */}
          <motion.div variants={fadeInUp} className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">ou continue com email</span>
            </div>
          </motion.div>

          {/* Test Credentials Info */}
          <motion.div variants={fadeInUp} className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-sm text-blue-800">
              <span className="font-semibold">Credenciais de teste:</span>
              <br />
              Email: <code className="bg-blue-100 px-1 rounded">teste@studypro.com</code>
              <br />
              Senha: <code className="bg-blue-100 px-1 rounded">123456</code>
            </div>
          </motion.div>

          {/* Login Form */}
          <motion.form variants={fadeInUp} onSubmit={handleSubmit} className="space-y-4">
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

            {/* Remember Me and Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="text-sm text-primary-700">Lembrar de mim</span>
              </label>
              <Link
                to="/forgot-password"
                className="text-sm text-primary-600 hover:text-primary-700 hover:underline"
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
              className="text-primary-600 font-medium hover:text-primary-700 hover:underline"
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