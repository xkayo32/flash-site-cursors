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
  AlertCircle,
  Facebook,
  Chrome,
  Linkedin,
  Phone,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';
import { StudyProLogo } from '@/components/ui/StudyProLogo';
import toast from 'react-hot-toast';
import { API_ENDPOINTS } from '@/config/api';
import '../../styles/police-fonts.css';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

export default function RegisterPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
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

    if (!formData.phone) {
      newErrors.phone = 'Telefone é obrigatório';
    } else if (!/^\d{10,11}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Telefone inválido';
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
      const params = new URLSearchParams();
      params.append('name', formData.name);
      params.append('email', formData.email);
      params.append('phone', formData.phone);
      params.append('password', formData.password);

      const response = await fetch(API_ENDPOINTS.auth.register, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Conta criada com sucesso! Faça login para continuar.');
        navigate('/login');
      } else {
        toast.error(data.message || 'Erro ao criar conta');
      }
    } catch (error) {
      console.error('Register error:', error);
      toast.error('Erro ao criar conta. Verifique sua conexão.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialRegister = (provider: string) => {
    toast.error(`Cadastro com ${provider} em desenvolvimento`);
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      if (numbers.length > 6) {
        return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
      } else if (numbers.length > 2) {
        return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
      } else if (numbers.length > 0) {
        return `(${numbers}`;
      }
    }
    return value;
  };

  return (
    <div className="min-h-screen flex font-police-primary">
      {/* Left Side - Register Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-black relative">
        {/* Background Pattern */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              transparent,
              transparent 35px,
              rgba(255,255,255,.05) 35px,
              rgba(255,255,255,.05) 70px
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
          {/* Logo and Title */}
          <motion.div variants={fadeInUp} className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <StudyProLogo variant="icon" size="xl" className="text-white" />
            </div>
            <h1 className="text-4xl font-police-title text-white mb-2 tracking-widest">
              CADASTRO DE RECRUTA
            </h1>
            <p className="text-gray-400 font-police-body tracking-wider">
              INICIE SUA JORNADA RUMO À APROVAÇÃO
            </p>
          </motion.div>

          {/* Register Form */}
          <motion.form variants={fadeInUp} onSubmit={handleSubmit} className="space-y-5">
            {/* Name Field */}
            <div>
              <label className="block text-sm font-police-subtitle text-gray-300 mb-2 tracking-widest">
                NOME COMPLETO
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  required
                  className={`w-full pl-10 pr-4 py-4 bg-gray-900 border text-white rounded focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition font-police-body ${
                    errors.name ? 'border-red-500' : 'border-gray-700'
                  }`}
                  placeholder="Digite seu nome completo"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (errors.name) setErrors({ ...errors, name: '' });
                  }}
                />
              </div>
              {errors.name && (
                <div className="flex items-center gap-1 mt-1 text-red-500 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {errors.name}
                </div>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-police-subtitle text-gray-300 mb-2 tracking-widest">
                EMAIL
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="email"
                  required
                  className={`w-full pl-10 pr-4 py-4 bg-gray-900 border text-white rounded focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition font-police-body ${
                    errors.email ? 'border-red-500' : 'border-gray-700'
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

            {/* Phone Field */}
            <div>
              <label className="block text-sm font-police-subtitle text-gray-300 mb-2 tracking-widest">
                TELEFONE
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="tel"
                  required
                  className={`w-full pl-10 pr-4 py-4 bg-gray-900 border text-white rounded focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition font-police-body ${
                    errors.phone ? 'border-red-500' : 'border-gray-700'
                  }`}
                  placeholder="(11) 99999-9999"
                  value={formData.phone}
                  onChange={(e) => {
                    const formatted = formatPhone(e.target.value);
                    setFormData({ ...formData, phone: formatted });
                    if (errors.phone) setErrors({ ...errors, phone: '' });
                  }}
                />
              </div>
              {errors.phone && (
                <div className="flex items-center gap-1 mt-1 text-red-500 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {errors.phone}
                </div>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-police-subtitle text-gray-300 mb-2 tracking-widest">
                SENHA
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  className={`w-full pl-10 pr-12 py-4 bg-gray-900 border text-white rounded focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition font-police-body ${
                    errors.password ? 'border-red-500' : 'border-gray-700'
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
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300"
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

            {/* Confirm Password Field */}
            <div>
              <label className="block text-sm font-police-subtitle text-gray-300 mb-2 tracking-widest">
                CONFIRMAR SENHA
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  className={`w-full pl-10 pr-12 py-4 bg-gray-900 border text-white rounded focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition font-police-body ${
                    errors.confirmPassword ? 'border-red-500' : 'border-gray-700'
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
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <div className="flex items-center gap-1 mt-1 text-red-500 text-sm">
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
                  className="w-4 h-4 text-white bg-gray-900 border-gray-700 rounded focus:ring-white mt-0.5"
                />
                <span className="text-sm text-gray-400 font-police-body">
                  Aceito os{' '}
                  <a href="#" className="text-white hover:underline">Termos de Uso</a>
                  {' '}e{' '}
                  <a href="#" className="text-white hover:underline">Política de Privacidade</a>
                </span>
              </label>
              {errors.acceptTerms && (
                <div className="flex items-center gap-1 mt-1 text-red-500 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {errors.acceptTerms}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-14 text-lg font-police-title bg-white hover:bg-gray-200 text-black tracking-widest"
              isLoading={isLoading}
            >
              {isLoading ? 'PROCESSANDO...' : 'INICIAR TREINAMENTO'}
              {!isLoading && <ArrowRight className="ml-2 w-5 h-5" />}
            </Button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-800"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-black px-4 text-gray-500 font-police-body">OU CADASTRE-SE COM</span>
              </div>
            </div>

            {/* Social Register Buttons */}
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => handleSocialRegister('Facebook')}
                className="flex items-center justify-center gap-2 p-3 bg-gray-900 hover:bg-gray-800 text-white rounded border border-gray-700 transition-all duration-300"
              >
                <Facebook className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => handleSocialRegister('Google')}
                className="flex items-center justify-center gap-2 p-3 bg-gray-900 hover:bg-gray-800 text-white rounded border border-gray-700 transition-all duration-300"
              >
                <Chrome className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => handleSocialRegister('LinkedIn')}
                className="flex items-center justify-center gap-2 p-3 bg-gray-900 hover:bg-gray-800 text-white rounded border border-gray-700 transition-all duration-300"
              >
                <Linkedin className="w-5 h-5" />
              </button>
            </div>
          </motion.form>

          {/* Login Link */}
          <motion.div variants={fadeInUp} className="mt-8 text-center">
            <span className="text-gray-400 font-police-body">JÁ É RECRUTA? </span>
            <Link
              to="/login"
              className="text-white font-police-subtitle hover:underline tracking-wider"
            >
              FAZER LOGIN
            </Link>
          </motion.div>

          {/* Footer */}
          <motion.div variants={fadeInUp} className="mt-8 text-center text-xs text-gray-500 font-police-body">
            CADASTRO SEGURO • DADOS PROTEGIDOS • SSL 256-BIT
          </motion.div>
        </motion.div>
      </div>

      {/* Right Side - Benefits */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1590012314607-cda9d9b699ae?q=80&w=2071')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/70"></div>
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent"></div>
          
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
            className="max-w-xl w-full text-white"
          >
            {/* Header */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mb-12"
            >
              <h2 className="text-5xl font-police-title mb-6 tracking-ultra-wide">
                TREINAMENTO ELITE
              </h2>
              <p className="text-xl text-gray-300 font-police-body mb-8 leading-relaxed">
                PREPARE-SE PARA OS CONCURSOS MAIS DISPUTADOS DO PAÍS
              </p>
              
              {/* Benefits */}
              <div className="space-y-4">
                {[
                  'METODOLOGIA EXCLUSIVA DOS APROVADOS',
                  'SIMULADOS IDÊNTICOS ÀS PROVAS REAIS',
                  'MENTORIA COM ESPECIALISTAS',
                  'GARANTIA DE SATISFAÇÃO 7 DIAS',
                  'SUPORTE 24/7 VIA WHATSAPP'
                ].map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <CheckCircle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                    <span className="text-gray-300 font-police-body tracking-wider">{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Stats Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.9 }}
              className="grid grid-cols-2 gap-4"
            >
              {[
                { number: '15.847', label: 'APROVADOS EM 2024' },
                { number: '89%', label: 'TAXA DE APROVAÇÃO' },
                { number: '50K+', label: 'QUESTÕES COMENTADAS' },
                { number: '100%', label: 'SATISFAÇÃO GARANTIDA' }
              ].map((stat, index) => (
                <div
                  key={index}
                  className="bg-white/10 backdrop-blur-sm rounded p-4 border border-white/20 text-center"
                >
                  <div className="text-2xl font-police-numbers mb-1">{stat.number}</div>
                  <div className="text-xs font-police-subtitle tracking-widest text-gray-300">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}