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
  BookOpen,
  Brain,
  Crosshair
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import toast from 'react-hot-toast';

// Matérias e submatérias organizadas hierarquicamente
const materias: { [key: string]: string[] } = {
  'DIREITO': ['Constitucional', 'Administrativo', 'Penal', 'Civil', 'Trabalhista', 'Tributário'],
  'SEGURANÇA PÚBLICA': ['Legislação Policial', 'Direitos Humanos', 'Criminologia', 'Investigação Criminal', 'Uso da Força'],
  'CONHECIMENTOS GERAIS': ['História do Brasil', 'Geografia', 'Atualidades', 'Informática', 'Raciocínio Lógico']
};

const difficulties = ['easy', 'medium', 'hard'];
const examBoards = ['CESPE', 'ENEM', 'FCC', 'VUNESP', 'FGV', 'IBFC', 'FUNCAB', 'IDECAN'];

export default function NewQuestion() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    materia: 'DIREITO',
    submateria: 'Constitucional',
    topic: '',
    difficulty: 'medium',
    type: 'multiple_choice',
    options: ['', '', '', ''],
    correctAnswer: 0,
    explanation: '',
    examBoard: 'CESPE',
    examYear: '2024',
    tags: '',
    status: 'draft'
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    // Reset submatéria when matéria changes
    if (field === 'materia') {
      setFormData(prev => ({ ...prev, submateria: materias[value as string][0] }));
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData(prev => ({ ...prev, options: newOptions }));
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.title.trim()) {
      newErrors.title = 'O enunciado é obrigatório';
    }

    if (!formData.topic.trim()) {
      newErrors.topic = 'O tópico é obrigatório';
    }

    // Validate options
    formData.options.forEach((option, index) => {
      if (!option.trim()) {
        newErrors[`option_${index}`] = `A alternativa ${String.fromCharCode(65 + index)} é obrigatória`;
      }
    });

    if (!formData.explanation.trim()) {
      newErrors.explanation = 'A explicação é obrigatória';
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
    const action = isDraft ? 'salvando rascunho' : 'publicando questão';
    toast.loading(`${action.charAt(0).toUpperCase() + action.slice(1)}...`, { id: 'save' });

    // Simular salvamento
    setTimeout(() => {
      const finalFormData = {
        ...formData,
        status: isDraft ? 'draft' : 'published'
      };
      
      toast.success(`Questão ${isDraft ? 'salva como rascunho' : 'publicada'} com sucesso!`, { id: 'save' });
      setIsLoading(false);
      
      setTimeout(() => {
        navigate('/admin/questions');
      }, 1500);
    }, 2000);
  };

  const handlePreview = () => {
    toast.success('Visualização da questão ativada', {
      duration: 3000,
      icon: '👁️'
    });
  };

  const nextStep = () => {
    if (currentStep === 1) {
      // Validate step 1 fields
      if (!formData.title.trim() || !formData.topic.trim()) {
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
            onClick={() => navigate('/admin/questions')}
            className="gap-2 font-police-body uppercase tracking-wider border-gray-300 dark:border-gray-600 hover:border-accent-500 dark:hover:border-accent-500 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            VOLTAR
          </Button>
          <div>
            <h1 className="text-3xl font-police-title font-bold uppercase tracking-wider text-gray-900 dark:text-white">
              NOVA QUESTÃO TÁTICA
            </h1>
            <p className="text-gray-600 dark:text-gray-400 font-police-subtitle uppercase tracking-wider">
              SISTEMA AVANÇADO DE CRIAÇÃO DE QUESTÕES
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
            {isLoading ? 'PUBLICANDO...' : 'PUBLICAR'}
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
                      {step === 2 && 'ALTERNATIVAS E RESPOSTA'}
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
                  ENUNCIADO DA QUESTÃO *
                </label>
                <textarea
                  rows={4}
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="DIGITE O ENUNCIADO COMPLETO DA QUESTÃO..."
                  className={`w-full px-4 py-2 border rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all ${
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                    MATÉRIA *
                  </label>
                  <select
                    value={formData.materia}
                    onChange={(e) => handleInputChange('materia', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                  >
                    {Object.keys(materias).map(materia => (
                      <option key={materia} value={materia}>
                        {materia}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                    SUBMATÉRIA *
                  </label>
                  <select
                    value={formData.submateria}
                    onChange={(e) => handleInputChange('submateria', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                  >
                    {materias[formData.materia].map(submateria => (
                      <option key={submateria} value={submateria}>
                        {submateria.toUpperCase()}
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
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
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
                  TÓPICO ESPECÍFICO *
                </label>
                <input
                  type="text"
                  value={formData.topic}
                  onChange={(e) => handleInputChange('topic', e.target.value)}
                  placeholder="EX: PRINCÍPIOS FUNDAMENTAIS, COMPETÊNCIAS LEGISLATIVAS"
                  className={`w-full px-4 py-2 border rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all ${
                    errors.topic ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
                {errors.topic && (
                  <p className="mt-1 text-sm text-red-600 font-police-body flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.topic}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                    BANCA EXAMINADORA
                  </label>
                  <select
                    value={formData.examBoard}
                    onChange={(e) => handleInputChange('examBoard', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                  >
                    {examBoards.map(board => (
                      <option key={board} value={board}>
                        {board}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                    ANO DA PROVA
                  </label>
                  <input
                    type="number"
                    value={formData.examYear}
                    onChange={(e) => handleInputChange('examYear', e.target.value)}
                    min="2000"
                    max="2025"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-numbers focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                    TAGS (SEPARADAS POR VÍRGULA)
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => handleInputChange('tags', e.target.value)}
                    placeholder="EX: CONSTITUCIONAL, PRINCÍPIOS, ISONOMIA"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                  />
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
          <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700">
            <CardHeader className="border-b border-gray-200 dark:border-gray-700">
              <CardTitle className="flex items-center gap-3 font-police-title uppercase tracking-wider text-gray-900 dark:text-white">
                <BookOpen className="w-6 h-6 text-accent-500" />
                ETAPA 2: ALTERNATIVAS E RESPOSTA
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-4 uppercase tracking-wider">
                  ALTERNATIVAS *
                </label>
                <div className="space-y-4">
                  {formData.options.map((option, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <div className="flex items-center gap-2 mt-2">
                        <input
                          type="radio"
                          name="correct"
                          value={index}
                          checked={formData.correctAnswer === index}
                          onChange={() => handleInputChange('correctAnswer', index)}
                          className="text-accent-500 focus:ring-accent-500"
                        />
                        <span className="font-police-subtitle font-bold text-gray-900 dark:text-white text-lg">
                          {String.fromCharCode(65 + index)})
                        </span>
                      </div>
                      <div className="flex-1">
                        <textarea
                          rows={2}
                          value={option}
                          onChange={(e) => handleOptionChange(index, e.target.value)}
                          placeholder={`DIGITE A ALTERNATIVA ${String.fromCharCode(65 + index)}`}
                          className={`w-full px-4 py-2 border rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all ${
                            errors[`option_${index}`] ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                          }`}
                        />
                        {errors[`option_${index}`] && (
                          <p className="mt-1 text-sm text-red-600 font-police-body flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {errors[`option_${index}`]}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-yellow-800 dark:text-yellow-200 font-police-body font-medium uppercase tracking-wider">
                        INSTRUÇÃO TÁTICA
                      </p>
                      <p className="text-sm text-yellow-700 dark:text-yellow-300 font-police-body">
                        Selecione a alternativa correta marcando o botão de opção correspondente.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                  EXPLICAÇÃO DA RESPOSTA CORRETA *
                </label>
                <textarea
                  rows={4}
                  value={formData.explanation}
                  onChange={(e) => handleInputChange('explanation', e.target.value)}
                  placeholder="EXPLIQUE DETALHADAMENTE POR QUE ESTA É A RESPOSTA CORRETA..."
                  className={`w-full px-4 py-2 border rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all ${
                    errors.explanation ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
                {errors.explanation && (
                  <p className="mt-1 text-sm text-red-600 font-police-body flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.explanation}
                  </p>
                )}
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
              {/* Question Summary */}
              <div className="p-6 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center border-2 border-gray-300 dark:border-gray-700">
                    <Brain className="w-6 h-6 text-gray-700 dark:text-accent-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-police-subtitle font-bold text-gray-900 dark:text-white mb-2">
                      {formData.title || 'ENUNCIADO NÃO INFORMADO'}
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="font-police-body font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">MATÉRIA</p>
                        <p className="font-police-body text-gray-900 dark:text-white uppercase">{formData.materia}</p>
                      </div>
                      <div>
                        <p className="font-police-body font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">SUBMATÉRIA</p>
                        <p className="font-police-body text-gray-900 dark:text-white uppercase">{formData.submateria}</p>
                      </div>
                      <div>
                        <p className="font-police-body font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">TÓPICO</p>
                        <p className="font-police-body text-gray-900 dark:text-white uppercase">{formData.topic || 'N/A'}</p>
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

              {/* Alternatives Preview */}
              <div>
                <h4 className="font-police-subtitle font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-3">
                  ALTERNATIVAS
                </h4>
                <div className="space-y-3">
                  {formData.options.map((option, index) => (
                    <div key={index} className={`p-4 rounded-lg border ${
                      index === formData.correctAnswer
                        ? 'border-accent-500 bg-accent-500/10 dark:bg-accent-500/20'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}>
                      <div className="flex items-start gap-3">
                        <span className="font-police-subtitle font-bold text-gray-900 dark:text-white">
                          {String.fromCharCode(65 + index)})
                        </span>
                        <span className="font-police-body text-gray-900 dark:text-white">
                          {option || 'ALTERNATIVA NÃO PREENCHIDA'}
                        </span>
                        {index === formData.correctAnswer && (
                          <Badge className="ml-auto bg-accent-500 text-black font-police-body font-semibold uppercase tracking-wider">
                            CORRETA
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Additional Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-police-subtitle font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-3">
                    INFORMAÇÕES ADICIONAIS
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="font-police-body text-gray-600 dark:text-gray-400 uppercase tracking-wider">Banca:</span>
                      <span className="font-police-body text-gray-900 dark:text-white">{formData.examBoard}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-police-body text-gray-600 dark:text-gray-400 uppercase tracking-wider">Ano:</span>
                      <span className="font-police-numbers text-gray-900 dark:text-white">{formData.examYear}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-police-body text-gray-600 dark:text-gray-400 uppercase tracking-wider">Tags:</span>
                      <span className="font-police-body text-gray-900 dark:text-white">
                        {formData.tags ? formData.tags.split(',').length : 0} tags
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-police-subtitle font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-3">
                    EXPLICAÇÃO
                  </h4>
                  <p className="text-sm font-police-body text-gray-600 dark:text-gray-400">
                    {formData.explanation || 'EXPLICAÇÃO NÃO INFORMADA'}
                  </p>
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
                    {isLoading ? 'PUBLICANDO...' : 'CONFIRMAR E PUBLICAR'}
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