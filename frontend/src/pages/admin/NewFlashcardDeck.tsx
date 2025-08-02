import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Target,
  CheckCircle,
  AlertCircle,
  Eye,
  Brain,
  Shield,
  Crosshair,
  BookOpen,
  Tag,
  Globe,
  Lock,
  Plus,
  X
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import toast from 'react-hot-toast';

// Categorias e subcategorias
const materias: { [key: string]: string[] } = {
  'DIREITO': ['Constitucional', 'Administrativo', 'Penal', 'Penal Militar', 'Civil', 'Processual'],
  'SEGURANÇA PÚBLICA': ['Operações Táticas', 'Procedimentos', 'Legislação Policial', 'Inteligência', 'Uso da Força'],
  'CONHECIMENTOS GERAIS': ['História Militar', 'Geografia', 'Atualidades', 'Informática', 'Raciocínio Lógico']
};

const difficulties = ['easy', 'medium', 'hard'];

export default function NewFlashcardDeck() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'DIREITO',
    subcategory: 'Constitucional',
    difficulty: 'medium',
    isPublic: true,
    tags: '',
    estimatedCards: 50,
    objective: '',
    targetAudience: 'concursos',
    studyMethod: 'spaced_repetition',
    status: 'draft'
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [newTag, setNewTag] = useState('');
  const [tagsList, setTagsList] = useState<string[]>([]);

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    // Reset subcategory when category changes
    if (field === 'category') {
      setFormData(prev => ({ ...prev, subcategory: materias[value as string][0] }));
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tagsList.includes(newTag.trim())) {
      setTagsList([...tagsList, newTag.trim().toUpperCase()]);
      setNewTag('');
      toast.success('Tag adicionada', {
        duration: 2000,
        icon: '🏷️'
      });
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTagsList(tagsList.filter(tag => tag !== tagToRemove));
    toast.success('Tag removida', {
      duration: 2000,
      icon: '🗑️'
    });
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.title.trim()) {
      newErrors.title = 'O título é obrigatório';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'A descrição é obrigatória';
    }

    if (!formData.objective.trim()) {
      newErrors.objective = 'O objetivo é obrigatório';
    }

    if (formData.estimatedCards < 10) {
      newErrors.estimatedCards = 'O baralho deve ter pelo menos 10 cartões';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = (isDraft: boolean = false) => {
    if (!isDraft && !validateForm()) {
      toast.error('Corrija os campos com erro', {
        icon: '⚠️'
      });
      return;
    }

    setIsLoading(true);
    const action = isDraft ? 'salvando rascunho' : 'criando baralho';
    toast.loading(`${action.charAt(0).toUpperCase() + action.slice(1)}...`, { id: 'save' });

    // Simular salvamento
    setTimeout(() => {
      const finalFormData = {
        ...formData,
        tags: tagsList.join(','),
        status: isDraft ? 'draft' : 'published'
      };
      
      toast.success(`Baralho ${isDraft ? 'salvo como rascunho' : 'criado'} com sucesso!`, { id: 'save' });
      setIsLoading(false);
      
      setTimeout(() => {
        navigate('/admin/flashcards');
      }, 1500);
    }, 2000);
  };

  const handlePreview = () => {
    toast.success('Visualização do baralho ativada', {
      duration: 3000,
      icon: '👁️'
    });
  };

  const nextStep = () => {
    if (currentStep === 1) {
      // Validate step 1 fields
      if (!formData.title.trim() || !formData.description.trim()) {
        toast.error('Preencha os campos obrigatórios', { icon: '⚠️' });
        return;
      }
    }
    
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
      toast.success(`Avançando para etapa ${currentStep + 1}`, {
        duration: 2000,
        icon: '➡️'
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

  const getDifficultyLabel = (difficulty: string) => {
    const labels = { easy: 'FÁCIL', medium: 'MÉDIO', hard: 'DIFÍCIL' };
    return labels[difficulty as keyof typeof labels];
  };

  const getTargetAudienceLabel = (audience: string) => {
    const labels = {
      concursos: 'CONCURSOS PÚBLICOS',
      operacional: 'TREINAMENTO OPERACIONAL',
      reciclagem: 'RECICLAGEM PROFISSIONAL',
      especializacao: 'ESPECIALIZAÇÃO'
    };
    return labels[audience as keyof typeof labels] || audience.toUpperCase();
  };

  const getStudyMethodLabel = (method: string) => {
    const labels = {
      spaced_repetition: 'REPETIÇÃO ESPAÇADA',
      active_recall: 'RECORDAÇÃO ATIVA',
      flashcards: 'FLASHCARDS TRADICIONAL',
      mixed: 'MÉTODO MISTO'
    };
    return labels[method as keyof typeof labels] || method.toUpperCase();
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
      >
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => navigate('/admin/flashcards')}
            className="gap-2 font-police-body uppercase tracking-wider border-gray-300 dark:border-gray-600 hover:border-accent-500 dark:hover:border-accent-500 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            VOLTAR
          </Button>
          <div>
            <h1 className="text-3xl font-police-title font-bold uppercase tracking-wider text-gray-900 dark:text-white">
              NOVO BARALHO TÁTICO
            </h1>
            <p className="text-gray-600 dark:text-gray-400 font-police-subtitle uppercase tracking-wider">
              SISTEMA DE CRIAÇÃO DE FLASHCARDS OPERACIONAIS
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handlePreview}
            className="gap-2 font-police-body uppercase tracking-wider border-gray-300 dark:border-gray-600 hover:border-accent-500 dark:hover:border-accent-500 transition-colors"
          >
            <Eye className="w-4 h-4" />
            VISUALIZAR
          </Button>
          <Button
            variant="outline"
            onClick={() => handleSave(true)}
            disabled={isLoading}
            className="gap-2 font-police-body uppercase tracking-wider border-gray-300 dark:border-gray-600 hover:border-accent-500 dark:hover:border-accent-500 transition-colors"
          >
            <Save className="w-4 h-4" />
            SALVAR RASCUNHO
          </Button>
          <Button
            onClick={() => handleSave(false)}
            disabled={isLoading}
            className="gap-2 bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black font-police-body font-semibold uppercase tracking-wider transition-colors disabled:opacity-50"
          >
            <CheckCircle className="w-4 h-4" />
            {isLoading ? 'CRIANDO...' : 'CRIAR BARALHO'}
          </Button>
        </div>
      </motion.div>

      {/* Progress Steps */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700">
          <CardContent className="p-4">
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
                    <p className={`font-police-body font-medium uppercase tracking-wider text-xs ${
                      step <= currentStep ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {step === 1 && 'INFORMAÇÕES BÁSICAS'}
                      {step === 2 && 'CONFIGURAÇÕES AVANÇADAS'}
                      {step === 3 && 'REVISÃO E CONFIRMAÇÃO'}
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
                ETAPA 1: INFORMAÇÕES BÁSICAS
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                  TÍTULO DO BARALHO *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="EX: ARTIGOS DO CÓDIGO PENAL MILITAR"
                  className={`w-full px-4 py-2 border rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body placeholder:uppercase placeholder:tracking-wider focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all ${
                    errors.title ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600 font-police-body flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.title}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                  DESCRIÇÃO *
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="DESCREVA O CONTEÚDO E OBJETIVOS DO BARALHO..."
                  className={`w-full px-4 py-2 border rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body placeholder:uppercase placeholder:tracking-wider focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all ${
                    errors.description ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600 font-police-body flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.description}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                    CATEGORIA *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body uppercase tracking-wider focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                  >
                    {Object.keys(materias).map(categoria => (
                      <option key={categoria} value={categoria}>
                        {categoria}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                    SUBCATEGORIA *
                  </label>
                  <select
                    value={formData.subcategory}
                    onChange={(e) => handleInputChange('subcategory', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body uppercase tracking-wider focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                  >
                    {materias[formData.category].map(subcategoria => (
                      <option key={subcategoria} value={subcategoria}>
                        {subcategoria.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                    DIFICULDADE *
                  </label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => handleInputChange('difficulty', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body uppercase tracking-wider focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                  >
                    {difficulties.map(difficulty => (
                      <option key={difficulty} value={difficulty}>
                        {getDifficultyLabel(difficulty)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                  OBJETIVO DO BARALHO *
                </label>
                <textarea
                  rows={2}
                  value={formData.objective}
                  onChange={(e) => handleInputChange('objective', e.target.value)}
                  placeholder="QUAL O OBJETIVO DE APRENDIZAGEM DESTE BARALHO?"
                  className={`w-full px-4 py-2 border rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body placeholder:uppercase placeholder:tracking-wider focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all ${
                    errors.objective ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
                {errors.objective && (
                  <p className="mt-1 text-sm text-red-600 font-police-body flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.objective}
                  </p>
                )}
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
          <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700">
            <CardHeader className="border-b border-gray-200 dark:border-gray-700">
              <CardTitle className="flex items-center gap-3 font-police-title uppercase tracking-wider text-gray-900 dark:text-white">
                <Shield className="w-6 h-6 text-accent-500" />
                ETAPA 2: CONFIGURAÇÕES AVANÇADAS
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                    PÚBLICO ALVO
                  </label>
                  <select
                    value={formData.targetAudience}
                    onChange={(e) => handleInputChange('targetAudience', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body uppercase tracking-wider focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                  >
                    <option value="concursos">CONCURSOS PÚBLICOS</option>
                    <option value="operacional">TREINAMENTO OPERACIONAL</option>
                    <option value="reciclagem">RECICLAGEM PROFISSIONAL</option>
                    <option value="especializacao">ESPECIALIZAÇÃO</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                    MÉTODO DE ESTUDO
                  </label>
                  <select
                    value={formData.studyMethod}
                    onChange={(e) => handleInputChange('studyMethod', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body uppercase tracking-wider focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                  >
                    <option value="spaced_repetition">REPETIÇÃO ESPAÇADA</option>
                    <option value="active_recall">RECORDAÇÃO ATIVA</option>
                    <option value="flashcards">FLASHCARDS TRADICIONAL</option>
                    <option value="mixed">MÉTODO MISTO</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                    NÚMERO ESTIMADO DE CARTÕES *
                  </label>
                  <input
                    type="number"
                    value={formData.estimatedCards}
                    onChange={(e) => handleInputChange('estimatedCards', parseInt(e.target.value) || 0)}
                    min="10"
                    max="1000"
                    className={`w-full px-4 py-2 border rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-numbers focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all ${
                      errors.estimatedCards ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  />
                  {errors.estimatedCards && (
                    <p className="mt-1 text-sm text-red-600 font-police-body flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.estimatedCards}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                    VISIBILIDADE
                  </label>
                  <div className="flex items-center gap-4 mt-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="visibility"
                        checked={formData.isPublic}
                        onChange={() => handleInputChange('isPublic', true)}
                        className="text-accent-500 focus:ring-accent-500"
                      />
                      <span className="font-police-body text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        PÚBLICO
                      </span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="visibility"
                        checked={!formData.isPublic}
                        onChange={() => handleInputChange('isPublic', false)}
                        className="text-accent-500 focus:ring-accent-500"
                      />
                      <span className="font-police-body text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                        <Lock className="w-4 h-4" />
                        PRIVADO
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                  TAGS OPERACIONAIS
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    placeholder="ADICIONAR TAG..."
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body placeholder:uppercase placeholder:tracking-wider focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                  />
                  <Button
                    type="button"
                    onClick={handleAddTag}
                    variant="outline"
                    className="gap-2 font-police-body uppercase tracking-wider border-gray-300 dark:border-gray-600 hover:border-accent-500 dark:hover:border-accent-500 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    ADICIONAR
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tagsList.map((tag, index) => (
                    <Badge 
                      key={index} 
                      variant="secondary" 
                      className="font-police-body font-semibold uppercase tracking-wider bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300 flex items-center gap-1"
                    >
                      <Tag className="w-3 h-3" />
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 hover:text-red-600 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                  {tagsList.length === 0 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-police-body">
                      NENHUMA TAG ADICIONADA
                    </p>
                  )}
                </div>
              </div>

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
            </CardContent>
          </Card>
        )}

        {currentStep === 3 && (
          <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700">
            <CardHeader className="border-b border-gray-200 dark:border-gray-700">
              <CardTitle className="flex items-center gap-3 font-police-title uppercase tracking-wider text-gray-900 dark:text-white">
                <Crosshair className="w-6 h-6 text-accent-500" />
                ETAPA 3: REVISÃO E CONFIRMAÇÃO
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Deck Summary */}
              <div className="p-6 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center border-2 border-gray-300 dark:border-gray-700">
                    <Brain className="w-6 h-6 text-gray-700 dark:text-accent-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-police-subtitle font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-2">
                      {formData.title || 'TÍTULO NÃO INFORMADO'}
                    </h3>
                    <p className="text-sm font-police-body text-gray-600 dark:text-gray-400 mb-4">
                      {formData.description || 'DESCRIÇÃO NÃO INFORMADA'}
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="font-police-body font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">CATEGORIA</p>
                        <p className="font-police-body text-gray-900 dark:text-white uppercase">{formData.category}</p>
                      </div>
                      <div>
                        <p className="font-police-body font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">SUBCATEGORIA</p>
                        <p className="font-police-body text-gray-900 dark:text-white uppercase">{formData.subcategory}</p>
                      </div>
                      <div>
                        <p className="font-police-body font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">CARTÕES</p>
                        <p className="font-police-numbers text-gray-900 dark:text-white">{formData.estimatedCards}</p>
                      </div>
                      <div>
                        <p className="font-police-body font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">DIFICULDADE</p>
                        <Badge className="bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300 font-police-body font-semibold uppercase tracking-wider">
                          {getDifficultyLabel(formData.difficulty)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Objective */}
              <div>
                <h4 className="font-police-subtitle font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-3">
                  OBJETIVO OPERACIONAL
                </h4>
                <p className="text-sm font-police-body text-gray-600 dark:text-gray-400 p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg">
                  {formData.objective || 'OBJETIVO NÃO INFORMADO'}
                </p>
              </div>

              {/* Configuration Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-police-subtitle font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-3">
                    CONFIGURAÇÕES
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="font-police-body text-gray-600 dark:text-gray-400 uppercase tracking-wider">Público Alvo:</span>
                      <span className="font-police-body text-gray-900 dark:text-white uppercase">{getTargetAudienceLabel(formData.targetAudience)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-police-body text-gray-600 dark:text-gray-400 uppercase tracking-wider">Método:</span>
                      <span className="font-police-body text-gray-900 dark:text-white uppercase">{getStudyMethodLabel(formData.studyMethod)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-police-body text-gray-600 dark:text-gray-400 uppercase tracking-wider">Visibilidade:</span>
                      <div className="flex items-center gap-1">
                        {formData.isPublic ? (
                          <>
                            <Globe className="w-4 h-4 text-accent-500" />
                            <span className="font-police-body text-gray-900 dark:text-white uppercase">PÚBLICO</span>
                          </>
                        ) : (
                          <>
                            <Lock className="w-4 h-4 text-gray-500" />
                            <span className="font-police-body text-gray-900 dark:text-white uppercase">PRIVADO</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-police-subtitle font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-3">
                    TAGS OPERACIONAIS
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {tagsList.length > 0 ? (
                      tagsList.map((tag, index) => (
                        <Badge key={index} variant="outline" className="font-police-body uppercase tracking-wider border-gray-300 dark:border-gray-600">
                          <Tag className="w-3 h-3 mr-1" />
                          {tag}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-police-body">
                        NENHUMA TAG ADICIONADA
                      </p>
                    )}
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
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => handleSave(true)}
                    disabled={isLoading}
                    className="gap-2 font-police-body uppercase tracking-wider border-gray-300 dark:border-gray-600 hover:border-accent-500 dark:hover:border-accent-500 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    SALVAR RASCUNHO
                  </Button>
                  <Button
                    onClick={() => handleSave(false)}
                    disabled={isLoading}
                    className="gap-2 bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black font-police-body font-semibold uppercase tracking-wider transition-colors disabled:opacity-50"
                  >
                    <CheckCircle className="w-4 h-4" />
                    {isLoading ? 'CRIANDO...' : 'CONFIRMAR E CRIAR'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </div>
  );
}