import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Eye,
  EyeOff,
  CheckCircle,
  Target,
  BookOpen,
  Edit,
  Image as ImageIcon,
  Brain,
  Folder,
  FolderPlus,
  Trash2,
  Tag,
  Loader2,
  X,
  ChevronRight,
  ChevronDown,
  Plus,
  Upload,
  Download,
  FileJson,
  Package,
  Layers,
  HelpCircle,
  Type,
  MousePointer,
  Square,
  Command,
  Settings,
  Crosshair,
  Shield,
  Flame
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import toast from 'react-hot-toast';
import { cn } from '@/utils/cn';
import { StudyProLogo } from '@/components/ui/StudyProLogo';
import ImageOcclusionEditor from '@/components/ImageOcclusionEditor';
import ClozeEditor from '@/components/ClozeEditor';
import AnkiImportExport from '@/components/AnkiImportExport';
import { flashcardService, type CreateFlashcardData, FlashcardType } from '@/services/flashcardService';
import { categoryService, Category } from '@/services/categoryService';
import { useAuthStore } from '@/store/authStore';

export default function StudentFlashcardManager() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  // Navegação entre abas
  const [activeTab, setActiveTab] = useState<'create' | 'manage'>('create');
  const [showImportModal, setShowImportModal] = useState(false);
  
  // Estados para criação de flashcards (igual ao admin)
  const [flashcardType, setFlashcardType] = useState<FlashcardType>('basic');
  const [previewMode, setPreviewMode] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  
  // Estados específicos por tipo de flashcard
  const [basicFront, setBasicFront] = useState('');
  const [basicBack, setBasicBack] = useState('');
  const [extraInfo, setExtraInfo] = useState('');
  const [reverseCard, setReverseCard] = useState(false);
  
  // Cloze (lacunas)
  const [clozeText, setClozeText] = useState('');
  const [clozeHint, setClozeHint] = useState('');
  
  // Multiple Choice
  const [mcQuestion, setMcQuestion] = useState('');
  const [mcOptions, setMcOptions] = useState(['', '', '', '']);
  const [mcCorrect, setMcCorrect] = useState(0);
  const [mcExplanation, setMcExplanation] = useState('');
  
  // True/False
  const [tfStatement, setTfStatement] = useState('');
  const [tfAnswer, setTfAnswer] = useState<boolean | null>(null);
  const [tfExplanation, setTfExplanation] = useState('');
  
  // Type Answer
  const [typeQuestion, setTypeQuestion] = useState('');
  const [typeAnswer, setTypeAnswer] = useState('');
  const [typeHint, setTypeHint] = useState('');
  
  // Image Occlusion
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [occlusionAreas, setOcclusionAreas] = useState<Array<{
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    answer: string;
    shape: 'rectangle' | 'circle';
  }>>([]);
  
  // Metadados
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [isPublic, setIsPublic] = useState(false);
  
  // Estados para categorias
  const [categories, setCategories] = useState<Category[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  // Carregar categorias na inicialização
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoadingCategories(true);
      const categories = await categoryService.getCategoryHierarchy();
      if (Array.isArray(categories)) {
        setCategories(categories);
      }
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
      toast.error('Erro ao carregar categorias');
    } finally {
      setLoadingCategories(false);
    }
  };

  // Funções de reset e validação
  const resetFlashcardForm = () => {
    setFlashcardType('basic');
    setPreviewMode(false);
    setShowAnswer(false);
    
    // Reset básico
    setBasicFront('');
    setBasicBack('');
    setExtraInfo('');
    setReverseCard(false);
    
    // Reset cloze
    setClozeText('');
    setClozeHint('');
    
    // Reset multiple choice
    setMcQuestion('');
    setMcOptions(['', '', '', '']);
    setMcCorrect(0);
    setMcExplanation('');
    
    // Reset true/false
    setTfStatement('');
    setTfAnswer(null);
    setTfExplanation('');
    
    // Reset type answer
    setTypeQuestion('');
    setTypeAnswer('');
    setTypeHint('');
    
    // Reset image occlusion
    setImageFile(null);
    setImageUrl('');
    setOcclusionAreas([]);
    
    // Reset metadados
    setSelectedCategory('');
    setSelectedSubcategory('');
    setTags([]);
    setDifficulty('medium');
    setIsPublic(false);
  };

  const validateFlashcard = (): boolean => {
    switch (flashcardType) {
      case 'basic':
        if (!basicFront.trim() || !basicBack.trim()) {
          toast.error('Preencha a frente e o verso do cartão');
          return false;
        }
        break;
      case 'basic_inverted':
        if (!basicFront.trim() || !basicBack.trim()) {
          toast.error('Preencha a frente e o verso do cartão');
          return false;
        }
        break;
      case 'cloze':
        if (!clozeText.trim() || !clozeText.includes('{{c1::')) {
          toast.error('O texto deve conter pelo menos uma lacuna {{c1::...}}');
          return false;
        }
        break;
      case 'multiple_choice':
        if (!mcQuestion.trim() || mcOptions.some(opt => !opt.trim())) {
          toast.error('Preencha a pergunta e todas as opções');
          return false;
        }
        break;
      case 'true_false':
        if (!tfStatement.trim() || tfAnswer === null) {
          toast.error('Preencha a afirmação e selecione a resposta');
          return false;
        }
        break;
      case 'type_answer':
        if (!typeQuestion.trim() || !typeAnswer.trim()) {
          toast.error('Preencha a pergunta e a resposta');
          return false;
        }
        break;
      case 'image_occlusion':
        if (!imageFile && !imageUrl) {
          toast.error('Selecione uma imagem');
          return false;
        }
        if (occlusionAreas.length === 0) {
          toast.error('Crie pelo menos uma área de oclusão');
          return false;
        }
        break;
      default:
        return false;
    }

    if (!selectedCategory) {
      toast.error('Selecione uma categoria');
      return false;
    }

    return true;
  };

  const saveFlashcard = async () => {
    if (!validateFlashcard()) return;

    try {
      const flashcardData: CreateFlashcardData = {
        type: flashcardType,
        category: selectedCategory,
        subcategory: selectedSubcategory,
        tags,
        difficulty,
        status: 'active' as any,
        
        // Campos específicos por tipo
        front: flashcardType === 'basic' || flashcardType === 'basic_inverted' ? basicFront : undefined,
        back: flashcardType === 'basic' || flashcardType === 'basic_inverted' ? basicBack : undefined,
        
        text: flashcardType === 'cloze' ? clozeText : undefined,
        
        question: flashcardType === 'multiple_choice' ? mcQuestion : 
                 flashcardType === 'type_answer' ? typeQuestion : undefined,
        
        options: flashcardType === 'multiple_choice' ? mcOptions : undefined,
        correct: flashcardType === 'multiple_choice' ? mcCorrect : undefined,
        explanation: flashcardType === 'multiple_choice' ? mcExplanation :
                    flashcardType === 'true_false' ? tfExplanation : undefined,
                    
        statement: flashcardType === 'true_false' ? tfStatement : undefined,
        answer: flashcardType === 'true_false' ? tfAnswer :
               flashcardType === 'type_answer' ? typeAnswer : undefined,
               
        hint: flashcardType === 'cloze' ? clozeHint :
             flashcardType === 'type_answer' ? typeHint : undefined,
             
        image: imageUrl || undefined,
        occlusionAreas: flashcardType === 'image_occlusion' ? occlusionAreas : undefined
      };

      const result = await flashcardService.createFlashcard(flashcardData);
      
      if (result.success) {
        toast.success('🎯 Cartão Tático criado com sucesso!');
        resetFlashcardForm();
      } else {
        toast.error('Erro ao criar cartão tático');
      }
    } catch (error) {
      console.error('Erro ao salvar flashcard:', error);
      toast.error('Erro ao salvar cartão tático');
    }
  };

  const loadExampleData = () => {
    switch (flashcardType) {
      case 'basic':
        setBasicFront('Qual é a capital do Brasil?');
        setBasicBack('Brasília');
        setExtraInfo('Brasília foi inaugurada em 21 de abril de 1960.');
        break;
      case 'basic_inverted':
        setBasicFront('Quem foi o primeiro presidente do Brasil?');
        setBasicBack('Deodoro da Fonseca');
        setExtraInfo('Governou de 1889 a 1891.');
        setReverseCard(true);
        break;
      case 'cloze':
        setClozeText('A {{c1::Constituição}} de {{c2::1988}} é a lei fundamental do Brasil.');
        setClozeHint('Lei suprema do país');
        break;
      case 'multiple_choice':
        setMcQuestion('Qual é o maior estado do Brasil?');
        setMcOptions(['São Paulo', 'Amazonas', 'Minas Gerais', 'Bahia']);
        setMcCorrect(1);
        setMcExplanation('O Amazonas possui 1.559.167 km², sendo o maior estado brasileiro.');
        break;
      case 'true_false':
        setTfStatement('O Brasil possui 26 estados e 1 distrito federal.');
        setTfAnswer(true);
        setTfExplanation('Correto. São 26 estados mais o Distrito Federal.');
        break;
      case 'type_answer':
        setTypeQuestion('Digite o nome do primeiro imperador do Brasil:');
        setTypeAnswer('Dom Pedro I');
        setTypeHint('Proclamou a independência em 1822');
        break;
    }
    
    setSelectedCategory('Geografia');
    setTags(['concurso', 'brasil']);
    setDifficulty('medium');
  };

  // Renderizar formulário baseado no tipo
  const renderFlashcardForm = () => {
    switch (flashcardType) {
      case 'basic':
      case 'basic_inverted':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 font-police-title uppercase tracking-wider">
                🎯 FRENTE DO CARTÃO
              </label>
              <textarea
                value={basicFront}
                onChange={(e) => setBasicFront(e.target.value)}
                placeholder="Digite a pergunta ou conceito..."
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-police-body resize-none"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 font-police-title uppercase tracking-wider">
                🎯 VERSO DO CARTÃO
              </label>
              <textarea
                value={basicBack}
                onChange={(e) => setBasicBack(e.target.value)}
                placeholder="Digite a resposta..."
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-police-body resize-none"
                rows={3}
              />
            </div>
            {flashcardType === 'basic_inverted' && (
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="reverseCard"
                  checked={reverseCard}
                  onChange={(e) => setReverseCard(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="reverseCard" className="text-sm text-gray-700 dark:text-gray-300 font-police-body">
                  Criar cartão reverso automaticamente
                </label>
              </div>
            )}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 font-police-title uppercase tracking-wider">
                📋 INFORMAÇÃO EXTRA (OPCIONAL)
              </label>
              <textarea
                value={extraInfo}
                onChange={(e) => setExtraInfo(e.target.value)}
                placeholder="Informações adicionais, contexto, dicas..."
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-police-body resize-none"
                rows={2}
              />
            </div>
          </div>
        );

      case 'cloze':
        return (
          <div className="space-y-4">
            <ClozeEditor
              text={clozeText}
              onChange={setClozeText}
              hint={clozeHint}
              onHintChange={setClozeHint}
            />
          </div>
        );

      case 'multiple_choice':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 font-police-title uppercase tracking-wider">
                ❓ PERGUNTA
              </label>
              <textarea
                value={mcQuestion}
                onChange={(e) => setMcQuestion(e.target.value)}
                placeholder="Digite a pergunta..."
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-police-body resize-none"
                rows={2}
              />
            </div>
            
            <div className="space-y-3">
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 font-police-title uppercase tracking-wider">
                🎯 OPÇÕES
              </label>
              {mcOptions.map((option, index) => (
                <div key={index} className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="correct-option"
                    checked={mcCorrect === index}
                    onChange={() => setMcCorrect(index)}
                    className="text-accent-500"
                  />
                  <span className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-sm font-bold font-police-title">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...mcOptions];
                      newOptions[index] = e.target.value;
                      setMcOptions(newOptions);
                    }}
                    placeholder={`Opção ${String.fromCharCode(65 + index)}`}
                    className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-police-body"
                  />
                </div>
              ))}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 font-police-title uppercase tracking-wider">
                💡 EXPLICAÇÃO DA RESPOSTA
              </label>
              <textarea
                value={mcExplanation}
                onChange={(e) => setMcExplanation(e.target.value)}
                placeholder="Por que esta é a resposta correta..."
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-police-body resize-none"
                rows={3}
              />
            </div>
          </div>
        );

      case 'true_false':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 font-police-title uppercase tracking-wider">
                📝 AFIRMAÇÃO
              </label>
              <textarea
                value={tfStatement}
                onChange={(e) => setTfStatement(e.target.value)}
                placeholder="Digite a afirmação para avaliar..."
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-police-body resize-none"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 font-police-title uppercase tracking-wider">
                ✅ RESPOSTA CORRETA
              </label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setTfAnswer(true)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                    tfAnswer === true
                      ? 'bg-green-100 border-green-500 text-green-700 dark:bg-green-900/20 dark:border-green-400 dark:text-green-300'
                      : 'bg-gray-100 border-gray-300 text-gray-700 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300'
                  }`}
                >
                  <CheckCircle className="w-4 h-4" />
                  <span className="font-police-body font-bold">VERDADEIRO</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTfAnswer(false)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                    tfAnswer === false
                      ? 'bg-red-100 border-red-500 text-red-700 dark:bg-red-900/20 dark:border-red-400 dark:text-red-300'
                      : 'bg-gray-100 border-gray-300 text-gray-700 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300'
                  }`}
                >
                  <X className="w-4 h-4" />
                  <span className="font-police-body font-bold">FALSO</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 font-police-title uppercase tracking-wider">
                💡 EXPLICAÇÃO
              </label>
              <textarea
                value={tfExplanation}
                onChange={(e) => setTfExplanation(e.target.value)}
                placeholder="Explique por que é verdadeiro ou falso..."
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-police-body resize-none"
                rows={3}
              />
            </div>
          </div>
        );

      case 'type_answer':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 font-police-title uppercase tracking-wider">
                ❓ PERGUNTA
              </label>
              <textarea
                value={typeQuestion}
                onChange={(e) => setTypeQuestion(e.target.value)}
                placeholder="Digite a pergunta..."
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-police-body resize-none"
                rows={2}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 font-police-title uppercase tracking-wider">
                ✅ RESPOSTA ESPERADA
              </label>
              <input
                type="text"
                value={typeAnswer}
                onChange={(e) => setTypeAnswer(e.target.value)}
                placeholder="Resposta correta..."
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-police-body"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 font-police-title uppercase tracking-wider">
                💡 DICA (OPCIONAL)
              </label>
              <input
                type="text"
                value={typeHint}
                onChange={(e) => setTypeHint(e.target.value)}
                placeholder="Dica para ajudar na resposta..."
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-police-body"
              />
            </div>
          </div>
        );

      case 'image_occlusion':
        return (
          <div className="space-y-4">
            <ImageOcclusionEditor
              imageFile={imageFile}
              onImageChange={setImageFile}
              occlusionAreas={occlusionAreas}
              onAreasChange={setOcclusionAreas}
            />
          </div>
        );

      default:
        return <div>Tipo não implementado</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-police-body">
      {/* Header Militar */}
      <div className="bg-gradient-to-r from-gray-900 via-[#14242f] to-gray-900 border-b-4 border-accent-500">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/student/flashcards')}
                className="text-white hover:bg-white/10 p-2"
              >
                <ArrowLeft className="w-6 h-6" />
              </Button>
              
              <div className="flex items-center gap-4">
                <StudyProLogo className="h-8 w-auto" />
                <div className="h-6 w-px bg-white/20" />
                <div>
                  <h1 className="text-2xl font-bold text-white font-police-title uppercase tracking-wider">
                    🎯 COMANDO TÁTICO
                  </h1>
                  <p className="text-accent-500 font-police-subtitle uppercase tracking-wider text-sm">
                    SISTEMA AVANÇADO DE CARTÕES TÁTICOS
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-accent-500" />
              <span className="text-white font-police-body font-bold">
                OPERADOR: {user?.name || 'AGENTE'}
              </span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-1 mt-6">
            {[
              { key: 'create', label: 'CRIAR CARTÕES', icon: Plus },
              { key: 'import', label: 'IMPORTAR ANKI', icon: Upload, isModal: true },
              { key: 'manage', label: 'GERENCIAR', icon: Settings }
            ].map(({ key, label, icon: Icon, isModal }) => (
              <button
                key={key}
                onClick={() => {
                  if (key === 'import') {
                    setShowImportModal(true);
                  } else {
                    setActiveTab(key as any);
                  }
                }}
                className={`flex items-center gap-2 px-6 py-3 rounded-t-lg font-police-title text-sm font-bold uppercase tracking-wider transition-all ${
                  activeTab === key
                    ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'create' && (
            <motion.div
              key="create"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Type Selector */}
              <Card className="border-2 border-gray-200 dark:border-gray-800 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1 h-full bg-accent-500" />
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 font-police-title uppercase tracking-wider">
                    <Target className="w-6 h-6 text-accent-500" />
                    TIPO DE CARTÃO TÁTICO
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { key: 'basic', label: 'BÁSICO', icon: BookOpen, description: 'Frente e verso tradicionais' },
                      { key: 'basic_inverted', label: 'BÁSICO INVERTIDO', icon: Edit, description: 'Com cartão reverso automático' },
                      { key: 'cloze', label: 'LACUNAS', icon: Type, description: 'Preencher palavras ocultas' },
                      { key: 'multiple_choice', label: 'MÚLTIPLA ESCOLHA', icon: HelpCircle, description: '4 alternativas' },
                      { key: 'true_false', label: 'V/F', icon: CheckCircle, description: 'Verdadeiro ou falso' },
                      { key: 'type_answer', label: 'DIGITE RESPOSTA', icon: MousePointer, description: 'Campo de texto livre' },
                      { key: 'image_occlusion', label: 'OCLUSÃO IMAGEM', icon: ImageIcon, description: 'Áreas ocultas em imagens' }
                    ].map(({ key, label, icon: Icon, description }) => (
                      <button
                        key={key}
                        onClick={() => setFlashcardType(key as FlashcardType)}
                        className={`p-4 rounded-lg border-2 text-left transition-all hover:scale-105 ${
                          flashcardType === key
                            ? 'border-accent-500 bg-accent-50 dark:bg-accent-900/20'
                            : 'border-gray-300 dark:border-gray-600 hover:border-accent-500/50'
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <Icon className={`w-5 h-5 ${flashcardType === key ? 'text-accent-500' : 'text-gray-500'}`} />
                          <span className="font-police-title text-sm font-bold uppercase tracking-wider">
                            {label}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 font-police-body">
                          {description}
                        </p>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Main Form */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form */}
                <div className="lg:col-span-2 space-y-6">
                  <Card className="border-2 border-gray-200 dark:border-gray-800 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-1 h-full bg-accent-500" />
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-3 font-police-title uppercase tracking-wider">
                          <Brain className="w-6 h-6 text-accent-500" />
                          CONFIGURAÇÃO DO CARTÃO
                        </CardTitle>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={loadExampleData}
                          className="font-police-body uppercase tracking-wider"
                        >
                          CARREGAR EXEMPLO
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {renderFlashcardForm()}
                    </CardContent>
                  </Card>

                  {/* Metadata */}
                  <Card className="border-2 border-gray-200 dark:border-gray-800 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-1 h-full bg-accent-500" />
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3 font-police-title uppercase tracking-wider">
                        <Tag className="w-6 h-6 text-accent-500" />
                        METADADOS TÁTICOS
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 font-police-title uppercase tracking-wider">
                          📁 CATEGORIA
                        </label>
                        <select
                          value={selectedCategory}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-police-body"
                        >
                          <option value="">Selecione uma categoria</option>
                          {categories.map((cat) => (
                            <option key={cat.id} value={cat.name}>
                              {cat.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 font-police-title uppercase tracking-wider">
                          🎯 DIFICULDADE
                        </label>
                        <div className="flex gap-2">
                          {[
                            { key: 'easy', label: 'FÁCIL', color: 'green' },
                            { key: 'medium', label: 'MÉDIO', color: 'yellow' },
                            { key: 'hard', label: 'DIFÍCIL', color: 'red' }
                          ].map(({ key, label, color }) => (
                            <button
                              key={key}
                              onClick={() => setDifficulty(key as any)}
                              className={`px-4 py-2 rounded-lg border-2 font-police-body font-bold transition-all ${
                                difficulty === key
                                  ? `border-${color}-500 bg-${color}-100 dark:bg-${color}-900/20 text-${color}-700 dark:text-${color}-300`
                                  : 'border-gray-300 dark:border-gray-600 hover:border-accent-500/50'
                              }`}
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 font-police-title uppercase tracking-wider">
                          🏷️ TAGS
                        </label>
                        <input
                          type="text"
                          placeholder="Separadas por vírgula: concurso, direito, militar"
                          value={tags.join(', ')}
                          onChange={(e) => setTags(e.target.value.split(',').map(t => t.trim()).filter(Boolean))}
                          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-police-body"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Preview */}
                <div className="space-y-6">
                  <Card className="border-2 border-gray-200 dark:border-gray-800 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-1 h-full bg-accent-500" />
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-3 font-police-title uppercase tracking-wider">
                          <Eye className="w-6 h-6 text-accent-500" />
                          VISUALIZAÇÃO
                        </CardTitle>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPreviewMode(!previewMode)}
                        >
                          {previewMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {previewMode ? (
                        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                          <p className="text-gray-500 dark:text-gray-400 font-police-body">
                            Preview será implementado em breve
                          </p>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500 dark:text-gray-400 font-police-body">
                            Clique no botão para ver o preview
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Actions */}
                  <div className="space-y-3">
                    <Button
                      onClick={saveFlashcard}
                      className="w-full bg-accent-500 hover:bg-accent-600 dark:bg-gray-100 dark:hover:bg-accent-650 text-black dark:text-black hover:text-black dark:hover:text-white font-police-title text-lg py-4 uppercase tracking-wider"
                    >
                      <Save className="w-5 h-5 mr-2" />
                      🎯 SALVAR CARTÃO TÁTICO
                    </Button>

                    <Button
                      variant="outline"
                      onClick={resetFlashcardForm}
                      className="w-full font-police-body uppercase tracking-wider"
                    >
                      <X className="w-4 h-4 mr-2" />
                      LIMPAR FORMULÁRIO
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}


          {activeTab === 'manage' && (
            <motion.div
              key="manage"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="border-2 border-gray-200 dark:border-gray-800 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1 h-full bg-accent-500" />
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 font-police-title uppercase tracking-wider">
                    <Command className="w-6 h-6 text-accent-500" />
                    GERENCIAMENTO TÁTICO
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 font-police-body">
                      Sistema de gerenciamento em desenvolvimento
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal de Importação */}
        {showImportModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden"
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-police-title tracking-wider text-gray-900 dark:text-white">
                    IMPORTAÇÃO ANKI
                  </h3>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowImportModal(false)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>
              
              <div className="p-6 max-h-[60vh] overflow-y-auto">
                <AnkiImportExport />
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}