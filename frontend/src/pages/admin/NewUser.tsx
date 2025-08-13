import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  User,
  Crown,
  Shield,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  Target,
  UserPlus,
  Calendar,
  Building
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { userService } from '@/services/userService';
import toast from 'react-hot-toast';

const roles = [
  { value: 'student', label: 'OPERADOR', icon: User, description: 'Acesso aos cursos e treinamentos táticos' },
  { value: 'instructor', label: 'INSTRUTOR TÁTICO', icon: Crown, description: 'Criação e gestão de conteúdo operacional' },
  { value: 'admin', label: 'COMANDANTE', icon: Shield, description: 'Acesso completo ao comando central' }
];

const statuses = [
  { value: 'active', label: 'OPERACIONAL', description: 'Agente pode acessar o sistema normalmente' },
  { value: 'pending', label: 'STANDBY', description: 'Aguardando confirmação de credenciais' },
  { value: 'suspended', label: 'SUSPENSO', description: 'Acesso temporariamente restrito' },
  { value: 'inactive', label: 'FORA DE SERVIÇO', description: 'Agente desativado' }
];

export default function NewUser() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'student',
    status: 'active',
    sendWelcomeEmail: true,
    generatePassword: false
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    // Generate password if option is enabled
    if (field === 'generatePassword' && value === true) {
      const generatedPassword = generateRandomPassword();
      setFormData(prev => ({ 
        ...prev, 
        password: generatedPassword,
        confirmPassword: generatedPassword
      }));
    }
  };

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Senhas não coincidem';
    }

    if (formData.phone && !/^\(\d{2}\)\s\d{4,5}-\d{4}$/.test(formData.phone)) {
      newErrors.phone = 'Formato: (11) 99999-9999';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error('OPERAÇÃO FALHADA: Corrija os campos com erro', {
        icon: '🚨'
      });
      return;
    }

    setIsLoading(true);
    toast.loading('PROCESSANDO CADASTRO TÁTICO...', { id: 'create' });

    try {
      const userData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        role: formData.role,
        status: formData.status
      };

      const response = await userService.createUser(userData);
      
      if (response.success) {
        toast.success('OPERAÇÃO CONCLUÍDA: Agente cadastrado com sucesso!', { id: 'create' });
        
        if (formData.sendWelcomeEmail) {
          toast.success('BRIEFING DE BOAS-VINDAS ENVIADO', {
            duration: 3000,
            icon: '🎯'
          });
        }
        
        setTimeout(() => {
          navigate('/admin/users');
        }, 1500);
      } else {
        toast.error(`OPERAÇÃO FALHADA: ${response.message || 'Erro ao cadastrar agente'}`, { id: 'create' });
      }
    } catch (error) {
      toast.error('OPERAÇÃO FALHADA: Erro ao cadastrar agente', { id: 'create' });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneChange = (value: string) => {
    // Auto-format phone number
    const cleaned = value.replace(/\D/g, '');
    let formatted = cleaned;
    
    if (cleaned.length >= 2) {
      formatted = `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
    }
    if (cleaned.length >= 7) {
      formatted = `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`;
    }
    
    handleInputChange('phone', formatted);
  };

  const nextStep = () => {
    if (currentStep === 1) {
      // Validate step 1 fields
      const step1Errors: { [key: string]: string } = {};
      
      if (!formData.name.trim()) step1Errors.name = 'Nome é obrigatório';
      if (!formData.email.trim()) step1Errors.email = 'Email é obrigatório';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) step1Errors.email = 'Email inválido';
      
      if (Object.keys(step1Errors).length > 0) {
        setErrors(step1Errors);
        toast.error('OPERAÇÃO FALHADA: Configure campos obrigatórios', { icon: '🚨' });
        return;
      }
    }
    
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
      toast.success(`AVANÇANDO PARA FASE TÁTICA ${currentStep + 1}`, {
        duration: 2000,
        icon: '✅'
      });
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      toast.success(`Voltando para etapa ${currentStep - 1}`, {
        duration: 2000,
        icon: '⬅️'
      });
    }
  };

  const getRoleIcon = (role: string) => {
    const roleData = roles.find(r => r.value === role);
    return roleData?.icon || User;
  };

  const RoleIcon = getRoleIcon(formData.role);

  return (
    <div className="p-6 space-y-6">
      {/* Header Militar/Tático */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-gray-800 via-[#14242f] to-gray-900 dark:from-gray-900 dark:via-[#14242f] dark:to-black p-8 rounded-lg relative overflow-hidden"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,204,21,0.3) 1px, transparent 0)',
          backgroundSize: '20px 20px'
        }}
      >
        {/* Corner accents */}
        <div className="absolute top-0 right-0 w-20 h-20 border-t-4 border-r-4 border-accent-500/30" />
        <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-accent-500/20" />
        
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
          <div className="flex items-center gap-6">
            <Button
              variant="ghost"
              onClick={() => navigate('/admin/users')}
              className="gap-2 font-police-body uppercase tracking-wider hover:bg-white/10 text-white hover:text-accent-500 border border-transparent hover:border-accent-500/30 transition-all duration-300"
            >
              <ArrowLeft className="w-5 h-5" />
              RETORNAR À BASE
            </Button>
            <div className="border-l-4 border-l-accent-500 pl-6">
              <h1 className="text-4xl font-police-title font-bold uppercase tracking-wider text-white">
                NOVA TROPA OPERACIONAL
              </h1>
              <p className="text-gray-300 font-police-subtitle uppercase tracking-wider mt-1">
                CADASTRO DE NOVO AGENTE NO SISTEMA
              </p>
            </div>
          </div>
        
          <div className="flex items-center gap-4">
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className="gap-2 bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black font-police-body font-bold uppercase tracking-wider transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50"
            >
              <UserPlus className="w-5 h-5" />
              {isLoading ? 'PROCESSANDO...' : 'CONFIRMAR OPERAÇÃO'}
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Progress Steps */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-accent-500/30 shadow-xl relative overflow-hidden">
          {/* Tactical stripes */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent-500 via-accent-400 to-accent-500" />
          <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-accent-500/20" />
          
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-police-numbers font-bold text-sm transition-colors ${
                      step <= currentStep
                        ? 'bg-accent-500 text-black'
                        : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {step <= currentStep ? <CheckCircle className="w-4 h-4" /> : step}
                  </div>
                  <div className="ml-3">
                    <p className={`font-police-subtitle font-semibold uppercase tracking-wider text-xs ${
                      step <= currentStep ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {step === 1 && 'IDENTIFICAÇÃO'}
                      {step === 2 && 'CREDENCIAIS TÁTICAS'}
                      {step === 3 && 'CONFIRMAÇÃO OPERACIONAL'}
                    </p>
                  </div>
                  {step < 3 && (
                    <div className={`flex-1 h-px mx-4 ${
                      step < currentStep ? 'bg-accent-500' : 'bg-gray-300 dark:bg-gray-700'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Form Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {currentStep === 1 && (
          <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700">
            <CardHeader className="border-b border-gray-200 dark:border-gray-700">
              <CardTitle className="flex items-center gap-3 font-police-title uppercase tracking-wider text-gray-900 dark:text-white">
                <Target className="w-6 h-6 text-accent-500" />
                ETAPA 1: DADOS PESSOAIS
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                    NOME COMPLETO *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="DIGITE O NOME COMPLETO"
                    className={`w-full px-4 py-2 border rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all ${
                      errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600 font-police-body flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                    EMAIL *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="exemplo@email.com"
                    className={`w-full px-4 py-2 border rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all ${
                      errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600 font-police-body flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                    TELEFONE
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder="(11) 99999-9999"
                    maxLength={15}
                    className={`w-full px-4 py-2 border rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-numbers focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all ${
                      errors.phone ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600 font-police-body flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.phone}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={nextStep}
                  className="gap-2 bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black font-police-body font-semibold uppercase tracking-wider transition-colors"
                >
                  PRÓXIMA ETAPA
                  <ArrowLeft className="w-4 h-4 rotate-180" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            {/* Password Section */}
            <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700">
              <CardHeader className="border-b border-gray-200 dark:border-gray-700">
                <CardTitle className="flex items-center gap-3 font-police-title uppercase tracking-wider text-gray-900 dark:text-white">
                  <Lock className="w-6 h-6 text-accent-500" />
                  CREDENCIAIS DE ACESSO
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.generatePassword}
                      onChange={(e) => handleInputChange('generatePassword', e.target.checked)}
                      className="rounded border-gray-300 text-accent-500 focus:ring-accent-500"
                    />
                    <div>
                      <p className="font-police-body font-medium text-yellow-800 dark:text-yellow-200 uppercase tracking-wider">
                        GERAR SENHA AUTOMATICAMENTE
                      </p>
                      <p className="text-sm text-yellow-700 dark:text-yellow-300 font-police-body">
                        Sistema gerará uma senha segura de 12 caracteres
                      </p>
                    </div>
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                      SENHA *
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        disabled={formData.generatePassword}
                        placeholder="Digite a senha"
                        className={`w-full px-4 py-2 pr-10 border rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                          errors.password ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="mt-1 text-sm text-red-600 font-police-body flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.password}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                      CONFIRMAR SENHA *
                    </label>
                    <input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      disabled={formData.generatePassword}
                      placeholder="Confirme a senha"
                      className={`w-full px-4 py-2 border rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                        errors.confirmPassword ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                    />
                    {errors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-600 font-police-body flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Role and Status Section */}
            <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700">
              <CardHeader className="border-b border-gray-200 dark:border-gray-700">
                <CardTitle className="flex items-center gap-3 font-police-title uppercase tracking-wider text-gray-900 dark:text-white">
                  <Building className="w-6 h-6 text-accent-500" />
                  FUNÇÃO E PERMISSÕES
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-4 uppercase tracking-wider">
                    FUNÇÃO NO SISTEMA
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {roles.map((role) => {
                      const Icon = role.icon;
                      return (
                        <label
                          key={role.value}
                          className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                            formData.role === role.value
                              ? 'border-accent-500 bg-accent-500/10 dark:bg-accent-500/20'
                              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                          }`}
                        >
                          <input
                            type="radio"
                            name="role"
                            value={role.value}
                            checked={formData.role === role.value}
                            onChange={(e) => handleInputChange('role', e.target.value)}
                            className="sr-only"
                          />
                          <div className="flex items-center gap-3 mb-2">
                            <Icon className="w-5 h-5 text-accent-500" />
                            <span className="font-police-subtitle font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                              {role.label}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 font-police-body">
                            {role.description}
                          </p>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-4 uppercase tracking-wider">
                    STATUS INICIAL
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {statuses.map((status) => (
                      <label
                        key={status.value}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          formData.status === status.value
                            ? 'border-accent-500 bg-accent-500/10 dark:bg-accent-500/20'
                            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                        }`}
                      >
                        <input
                          type="radio"
                          name="status"
                          value={status.value}
                          checked={formData.status === status.value}
                          onChange={(e) => handleInputChange('status', e.target.value)}
                          className="sr-only"
                        />
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-police-subtitle font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                            {status.label}
                          </span>
                          {formData.status === status.value && (
                            <CheckCircle className="w-4 h-4 text-accent-500" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 font-police-body">
                          {status.description}
                        </p>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.sendWelcomeEmail}
                      onChange={(e) => handleInputChange('sendWelcomeEmail', e.target.checked)}
                      className="rounded border-gray-300 text-accent-500 focus:ring-accent-500"
                    />
                    <div>
                      <p className="font-police-body font-medium text-gray-900 dark:text-white uppercase tracking-wider">
                        ENVIAR EMAIL DE BOAS-VINDAS
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 font-police-body">
                        Usuário receberá email com instruções de acesso
                      </p>
                    </div>
                  </label>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={prevStep}
                className="gap-2 font-police-body uppercase tracking-wider border-gray-300 dark:border-gray-600 hover:border-accent-500 dark:hover:border-accent-500 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                ETAPA ANTERIOR
              </Button>
              <Button
                onClick={nextStep}
                className="gap-2 bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black font-police-body font-semibold uppercase tracking-wider transition-colors"
              >
                REVISÃO FINAL
                <ArrowLeft className="w-4 h-4 rotate-180" />
              </Button>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700">
            <CardHeader className="border-b border-gray-200 dark:border-gray-700">
              <CardTitle className="flex items-center gap-3 font-police-title uppercase tracking-wider text-gray-900 dark:text-white">
                <CheckCircle className="w-6 h-6 text-accent-500" />
                ETAPA 3: REVISÃO E CONFIRMAÇÃO
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* User Summary */}
              <div className="p-6 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center border-2 border-gray-300 dark:border-gray-700">
                    <RoleIcon className="w-8 h-8 text-gray-700 dark:text-accent-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-police-subtitle font-bold text-gray-900 dark:text-white mb-2">
                      {formData.name || 'NOME NÃO INFORMADO'}
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="font-police-body font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">EMAIL</p>
                        <p className="font-police-body text-gray-900 dark:text-white">{formData.email || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="font-police-body font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">TELEFONE</p>
                        <p className="font-police-numbers text-gray-900 dark:text-white">{formData.phone || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="font-police-body font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">FUNÇÃO</p>
                        <p className="font-police-body text-gray-900 dark:text-white uppercase">
                          {roles.find(r => r.value === formData.role)?.label}
                        </p>
                      </div>
                      <div>
                        <p className="font-police-body font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">STATUS</p>
                        <Badge className="bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300 font-police-body font-semibold uppercase tracking-wider">
                          {statuses.find(s => s.value === formData.status)?.label}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-police-subtitle font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-3">
                    CONFIGURAÇÕES DE ACESSO
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      {formData.generatePassword ? (
                        <CheckCircle className="w-4 h-4 text-accent-500" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-gray-400" />
                      )}
                      <span className="font-police-body text-gray-900 dark:text-white uppercase tracking-wider">
                        {formData.generatePassword ? 'SENHA GERADA AUTOMATICAMENTE' : 'SENHA DEFINIDA MANUALMENTE'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {formData.sendWelcomeEmail ? (
                        <CheckCircle className="w-4 h-4 text-accent-500" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-gray-400" />
                      )}
                      <span className="font-police-body text-gray-900 dark:text-white uppercase tracking-wider">
                        {formData.sendWelcomeEmail ? 'EMAIL DE BOAS-VINDAS SERÁ ENVIADO' : 'SEM EMAIL DE BOAS-VINDAS'}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-police-subtitle font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-3">
                    PERMISSÕES DA FUNÇÃO
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p className="font-police-body text-gray-600 dark:text-gray-400">
                      {roles.find(r => r.value === formData.role)?.description}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
                <Button
                  variant="outline"
                  onClick={prevStep}
                  className="gap-2 font-police-body uppercase tracking-wider border-gray-300 dark:border-gray-600 hover:border-accent-500 dark:hover:border-accent-500 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  ETAPA ANTERIOR
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="gap-2 bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black font-police-body font-semibold uppercase tracking-wider transition-colors disabled:opacity-50"
                >
                  <UserPlus className="w-4 h-4" />
                  {isLoading ? 'CRIANDO...' : 'CONFIRMAR E CRIAR'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </div>
  );
}