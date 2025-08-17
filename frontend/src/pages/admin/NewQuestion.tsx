import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
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
import { questionService, type CreateQuestionData, type DifficultyLevel, type QuestionStatus } from '../../services/questionService';
import { categoryService } from '../../services/categoryService';

const difficulties: DifficultyLevel[] = ['easy', 'medium', 'hard'];
const examBoards = ['CESPE', 'ENEM', 'FCC', 'VUNESP', 'FGV', 'IBFC', 'FUNCAB', 'IDECAN'];

interface Category {
  id: string;
  name: string;
  type: string;
  parent_id?: string;
  children?: Category[];
}

interface SubjectTopics {
  [subject: string]: string[];
}

export default function NewQuestion() {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  
  // Data from API
  const [subjects, setSubjects] = useState<string[]>([]);
  const [topics, setTopics] = useState<string[]>([]);
  const [subjectTopics, setSubjectTopics] = useState<SubjectTopics>({});
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    topic: '',
    difficulty: 'medium' as DifficultyLevel,
    type: 'multiple_choice',
    options: ['', '', '', ''],
    correctAnswer: 0,
    correct_boolean: false,
    expected_answer: '',
    explanation: '',
    examBoard: 'CESPE',
    examYear: '2024',
    examName: '',
    reference: '',
    tags: '',
    status: 'draft' as QuestionStatus
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Load data from API
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingData(true);
        
        // Load filter options from questions API
        const filterResponse = await questionService.getFilterOptions();
        if (filterResponse.success) {
          const { subjects: apiSubjects, topics: apiTopics } = filterResponse.data;
          setSubjects(apiSubjects);
          setTopics(apiTopics);
          
          // Group topics by subject - simplified mapping
          const subjectTopicMap: SubjectTopics = {};
          apiSubjects.forEach(subject => {
            // For now, all topics are available for all subjects
            // Later this can be enhanced with proper categorization
            subjectTopicMap[subject] = apiTopics;
          });
          setSubjectTopics(subjectTopicMap);
          
          // Set first subject as default
          if (apiSubjects.length > 0) {
            setFormData(prev => ({
              ...prev,
              subject: apiSubjects[0],
              topic: apiTopics.length > 0 ? apiTopics[0] : ''
            }));
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Erro ao carregar dados. Usando valores padrão.');
        
        // Set fallback data
        const fallbackSubjects = ['Direito Constitucional', 'Direito Administrativo'];
        const fallbackTopics = ['Princípios Fundamentais', 'Direitos e Garantias'];
        setSubjects(fallbackSubjects);
        setTopics(fallbackTopics);
        setFormData(prev => ({ ...prev, subject: fallbackSubjects[0], topic: fallbackTopics[0] }));
      } finally {
        setLoadingData(false);
      }
    };
    
    loadData();
  }, []);

  // Load duplicate data if provided
  useEffect(() => {
    const duplicateData = location.state?.duplicateFrom;
    if (duplicateData && !loadingData) {
      setFormData(prev => ({
        ...prev,
        title: duplicateData.title || '',
        subject: duplicateData.subject || prev.subject,
        topic: duplicateData.topic || prev.topic,
        difficulty: duplicateData.difficulty || prev.difficulty,
        type: duplicateData.type || prev.type,
        explanation: duplicateData.explanation || '',
        exam_board: duplicateData.exam_board || '',
        exam_year: duplicateData.exam_year || new Date().getFullYear(),
        reference: duplicateData.reference || '',
        tags: duplicateData.tags || []
      }));

      // Set options if it's multiple choice
      if (duplicateData.type === 'multiple_choice' && duplicateData.options) {
        setFormData(prev => ({
          ...prev,
          options: duplicateData.options,
          correctAnswer: duplicateData.correct_answer || 0
        }));
      }

      // Set boolean answer if it's true/false
      if (duplicateData.type === 'true_false' && duplicateData.correct_boolean !== undefined) {
        setFormData(prev => ({
          ...prev,
          correctBoolean: duplicateData.correct_boolean
        }));
      }

      // Set expected answer for essay/fill_blank
      if (duplicateData.expected_answer) {
        setFormData(prev => ({
          ...prev,
          expectedAnswer: duplicateData.expected_answer
        }));
      }

      toast.success('Dados da questão carregados para duplicação!');
    }
  }, [location.state, loadingData]);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    // Reset topic when subject changes
    if (field === 'subject') {
      const availableTopics = subjectTopics[value as string] || topics;
      setFormData(prev => ({ ...prev, topic: availableTopics.length > 0 ? availableTopics[0] : '' }));
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

    if (!formData.subject.trim()) {
      newErrors.subject = 'A matéria é obrigatória';
    }

    if (!formData.topic.trim()) {
      newErrors.topic = 'O tópico é obrigatório';
    }

    // Type-specific validations
    if (formData.type === 'multiple_choice') {
      formData.options.forEach((option, index) => {
        if (!option.trim()) {
          newErrors[`option_${index}`] = `A alternativa ${String.fromCharCode(65 + index)} é obrigatória`;
        }
      });
      
      if (formData.correctAnswer < 0 || formData.correctAnswer >= formData.options.length) {
        newErrors.correctAnswer = 'Selecione uma alternativa correta';
      }
    }
    
    if (formData.type === 'true_false' && formData.correct_boolean === undefined) {
      newErrors.correct_boolean = 'Selecione verdadeiro ou falso';
    }
    
    if ((formData.type === 'essay' || formData.type === 'fill_blank') && !formData.expected_answer.trim()) {
      newErrors.expected_answer = 'A resposta esperada é obrigatória';
    }

    if (!formData.explanation.trim()) {
      newErrors.explanation = 'A explicação é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (isDraft: boolean = false) => {
    if (!isDraft && !validateForm()) {
      toast.error('OPERAÇÃO FALHADA: Corrija os campos com erro', {
        icon: '🚨'
      });
      return;
    }

    setIsLoading(true);
    const action = isDraft ? 'salvando rascunho' : 'publicando questão';
    toast.loading(`${action.charAt(0).toUpperCase() + action.slice(1)}...`, { id: 'save' });

    try {
      // Prepare data for API
      const questionData: CreateQuestionData = {
        title: formData.title,
        type: formData.type as any,
        subject: formData.subject,
        topic: formData.topic,
        difficulty: formData.difficulty,
        explanation: formData.explanation,
        exam_board: formData.examBoard,
        exam_year: formData.examYear,
        exam_name: formData.examName,
        reference: formData.reference,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        status: isDraft ? 'draft' : 'published'
      };

      // Add type-specific fields
      if (formData.type === 'multiple_choice') {
        questionData.options = formData.options;
        questionData.correct_answer = formData.correctAnswer;
      } else if (formData.type === 'true_false') {
        questionData.correct_boolean = formData.correct_boolean;
      } else if (formData.type === 'essay' || formData.type === 'fill_blank') {
        questionData.expected_answer = formData.expected_answer;
      }

      const response = await questionService.createQuestion(questionData);
      
      if (response.success) {
        toast.success(`OPERAÇÃO CONCLUÍDA: Alvo ${isDraft ? 'salvo como rascunho' : 'publicado'} com sucesso!`, { id: 'save' });
        
        setTimeout(() => {
          navigate('/admin/questions');
        }, 1500);
      } else {
        throw new Error('Falha ao salvar questão');
      }
    } catch (error) {
      console.error('Error saving question:', error);
      toast.error('OPERAÇÃO FALHADA: Erro ao salvar questão', { id: 'save' });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreview = () => {
    toast.success('PREVIEW TÁTICO ATIVADO: Questão disponível para visualização', {
      duration: 3000,
      icon: '🎯'
    });
  };

  const nextStep = () => {
    if (currentStep === 1) {
      // Validate step 1 fields
      if (!formData.title.trim() || !formData.subject.trim() || !formData.topic.trim()) {
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

  const getDifficultyLabel = (difficulty: string) => {
    const labels = { easy: 'FÁCIL', medium: 'MÉDIO', hard: 'DIFÍCIL' };
    return labels[difficulty as keyof typeof labels];
  };

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
              onClick={() => navigate('/admin/questions')}
              className="gap-2 font-police-body uppercase tracking-wider hover:bg-white/10 text-white hover:text-accent-500 border border-transparent hover:border-accent-500/30 transition-all duration-300"
            >
              <ArrowLeft className="w-5 h-5" />
              RETORNAR À BASE
            </Button>
            <div className="border-l-4 border-l-accent-500 pl-6">
              <h1 className="text-4xl font-police-title font-bold uppercase tracking-wider text-white">
                NOVO ALVO TÁTICO
              </h1>
              <p className="text-gray-300 font-police-subtitle uppercase tracking-wider mt-1">
                OPERAÇÃO DE CRIAÇÃO DE QUESTÃO
              </p>
            </div>
          </div>
        
          <div className="flex flex-wrap items-center gap-4">
            <Button
              variant="ghost"
              onClick={handlePreview}
              className="gap-2 font-police-body uppercase tracking-wider hover:bg-white/10 text-white hover:text-accent-500 border border-transparent hover:border-accent-500/30 transition-all duration-300"
            >
              <Eye className="w-5 h-5" />
              PREVIEW TÁTICO
            </Button>
            <Button
              variant="ghost"
              onClick={() => handleSave(true)}
              disabled={isLoading}
              className="gap-2 font-police-body uppercase tracking-wider hover:bg-white/10 text-white hover:text-accent-500 border border-transparent hover:border-accent-500/30 transition-all duration-300 disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              SALVAR RASCUNHO
            </Button>
            <Button
              onClick={() => handleSave(false)}
              disabled={isLoading}
              className="gap-2 bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black font-police-body font-bold uppercase tracking-wider transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50"
            >
              <CheckCircle className="w-5 h-5" />
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
                      {step === 1 && 'BRIEFING INICIAL'}
                      {step === 2 && 'DEFINIÇÃO DO ALVO'}
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
          <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-accent-500/30 shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden">
            {/* Tactical stripes */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent-500 via-accent-400 to-accent-500" />
            <div className="absolute top-0 right-0 w-20 h-20 border-t-4 border-r-4 border-accent-500/20" />
            
            <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border-b border-accent-500/30">
              <CardTitle className="flex items-center gap-3 font-police-title uppercase tracking-wider text-gray-900 dark:text-white">
                <Target className="w-6 h-6 text-accent-500" />
                ETAPA 1: BRIEFING INICIAL
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

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                    TIPO DE QUESTÃO *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => handleInputChange('type', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                  >
                    <option value="multiple_choice">MÚLTIPLA ESCOLHA</option>
                    <option value="true_false">VERDADEIRO/FALSO</option>
                    <option value="fill_blank">COMPLETAR LACUNAS</option>
                    <option value="essay">DISSERTATIVA</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                    MATÉRIA *
                  </label>
                  <select
                    value={formData.subject}
                    onChange={(e) => handleInputChange('subject', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                    disabled={loadingData}
                  >
                    {loadingData ? (
                      <option>Carregando...</option>
                    ) : (
                      subjects.map(subject => (
                        <option key={subject} value={subject}>
                          {subject.toUpperCase()}
                        </option>
                      ))
                    )}
                  </select>
                  {errors.subject && (
                    <p className="text-red-500 text-sm mt-1 font-police-body">{errors.subject}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                    TÓPICO *
                  </label>
                  <select
                    value={formData.topic}
                    onChange={(e) => handleInputChange('topic', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                    disabled={loadingData || !formData.subject}
                  >
                    {loadingData ? (
                      <option>Carregando...</option>
                    ) : (
                      (subjectTopics[formData.subject] || topics).map(topic => (
                        <option key={topic} value={topic}>
                          {topic.toUpperCase()}
                        </option>
                      ))
                    )}
                  </select>
                  {errors.topic && (
                    <p className="text-red-500 text-sm mt-1 font-police-body">{errors.topic}</p>
                  )}
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
          <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-accent-500/30 shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden">
            {/* Tactical stripes */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent-500 via-accent-400 to-accent-500" />
            <div className="absolute top-0 right-0 w-20 h-20 border-t-4 border-r-4 border-accent-500/20" />
            
            <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border-b border-accent-500/30">
              <CardTitle className="flex items-center gap-3 font-police-title uppercase tracking-wider text-gray-900 dark:text-white">
                <BookOpen className="w-6 h-6 text-accent-500" />
                ETAPA 2: DEFINIÇÃO DO ALVO
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
          <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-accent-500/30 shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden">
            {/* Tactical stripes */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent-500 via-accent-400 to-accent-500" />
            <div className="absolute top-0 right-0 w-20 h-20 border-t-4 border-r-4 border-accent-500/20" />
            
            <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border-b border-accent-500/30">
              <CardTitle className="flex items-center gap-3 font-police-title uppercase tracking-wider text-gray-900 dark:text-white">
                <Crosshair className="w-6 h-6 text-accent-500" />
                ETAPA 3: CONFIRMAÇÃO OPERACIONAL
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
                        <p className="font-police-body text-gray-900 dark:text-white uppercase">{formData.subject}</p>
                      </div>
                      <div>
                        <p className="font-police-body font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">TÓPICO</p>
                        <p className="font-police-body text-gray-900 dark:text-white uppercase">{formData.topic}</p>
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