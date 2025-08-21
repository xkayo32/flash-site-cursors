import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
  Brain
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import toast from 'react-hot-toast';
import ImageOcclusionEditor from '@/components/ImageOcclusionEditor';
import { flashcardService, type CreateFlashcardData } from '../../services/flashcardService';
import { useDynamicCategories } from '@/hooks/useDynamicCategories';

export default function NewFlashcard() {
  const navigate = useNavigate();
  
  // Hook dinâmico para categorias
  const {
    selectedCategory,
    selectedSubcategory,
    setSelectedCategory,
    setSelectedSubcategory,
    getCategoryOptions,
    getSubcategoryOptions,
    isLoadingCategories,
    isLoadingSubcategories
  } = useDynamicCategories();

  const [showPreview, setShowPreview] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [showImageOcclusionEditor, setShowImageOcclusionEditor] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [card, setCard] = useState({
    type: 'basic',
    front: '',
    back: '',
    question: '',
    options: ['', '', '', ''],
    correct: 0,
    explanation: '',
    statement: '',
    answer: 'true',
    text: '',
    extra: '',
    hint: '',
    image: '',
    occlusionAreas: [],
    difficulty: 'medium',
    category: '',
    subcategory: '',
    tags: ''
  });

  const cardTypes = [
    { value: 'basic', label: 'BÁSICO (FRENTE/VERSO)', description: 'Cartão tradicional com pergunta e resposta' },
    { value: 'basic_reversed', label: 'BÁSICO INVERTIDO', description: 'Gera automaticamente cartão inverso' },
    { value: 'cloze', label: 'LACUNAS (CLOZE)', description: 'Texto com lacunas para preencher' },
    { value: 'multiple_choice', label: 'MÚLTIPLA ESCOLHA', description: 'Questão com alternativas' },
    { value: 'true_false', label: 'VERDADEIRO/FALSO', description: 'Afirmação para avaliar' },
    { value: 'type_answer', label: 'DIGITE A RESPOSTA', description: 'Requer digitação da resposta' },
    { value: 'image_occlusion', label: 'OCLUSÃO DE IMAGEM', description: 'Imagem com áreas ocultas' }
  ];

  const templates = {
    basic: {
      front: 'Art. 121 do Código Penal',
      back: 'Matar alguém\nPena - reclusão, de seis a vinte anos.',
      tags: 'CP, HOMICÍDIO, ARTIGO'
    },
    basic_reversed: {
      front: 'Deserção',
      back: 'Art. 298 CPM',
      extra: 'Ausentar-se o militar, sem licença, da unidade em que serve, ou do lugar em que deve permanecer, por mais de oito dias.\nPena - detenção, de seis meses a dois anos',
      tags: 'CPM, DESERÇÃO, MILITAR'
    },
    cloze: {
      text: 'Art. 155 CP - Subtrair, para si ou para outrem, coisa {{c1::alheia}} {{c2::móvel}}: Pena - reclusão, de {{c3::um a quatro anos}}, e multa.',
      extra: 'Crime de Furto - Código Penal',
      tags: 'CP, FURTO, PATRIMÔNIO'
    },
    multiple_choice: {
      question: 'Qual a pena para deserção no CPM?',
      options: ['Detenção de 1 a 3 anos', 'Detenção de 6 meses a 2 anos', 'Reclusão de 2 a 8 anos', 'Prisão de 15 dias a 6 meses'],
      correct: 1,
      explanation: 'Art. 298 CPM - Pena: detenção, de seis meses a dois anos',
      tags: 'CPM, DESERÇÃO, PENAS'
    },
    true_false: {
      statement: 'A prisão em flagrante pode ser realizada por qualquer pessoa.',
      answer: 'true',
      explanation: 'Art. 301 do CPP - Qualquer do povo poderá e as autoridades policiais e seus agentes deverão prender quem quer que seja encontrado em flagrante delito.',
      tags: 'CPP, FLAGRANTE, PRISÃO'
    },
    type_answer: {
      question: 'Complete o artigo: "Art. 9º CPM - Consideram-se crimes militares, em tempo de..."',
      answer: 'paz',
      hint: 'Oposto de guerra',
      tags: 'CPM, CRIME MILITAR'
    },
    image_occlusion: {
      image: '/api/placeholder/800/600',
      occlusionAreas: [
        { id: 'area-1', x: 100, y: 50, width: 150, height: 40, answer: 'Coronel', shape: 'rectangle' },
        { id: 'area-2', x: 100, y: 120, width: 150, height: 40, answer: 'Tenente-Coronel', shape: 'rectangle' }
      ],
      extra: 'Hierarquia Militar - Oficiais Superiores',
      tags: 'HIERARQUIA, MILITAR, OFICIAIS'
    }
  };

  const loadTemplate = () => {
    const template = templates[card.type as keyof typeof templates];
    if (template) {
      setCard({ ...card, ...template });
      toast.success('INTEL TÁTICO CARREGADO: Exemplo pronto para edição', { icon: '🎯' });
    }
  };

  // Categories are now loaded dynamically via useDynamicCategories hook

  const handleSave = async () => {
    // Validação tática baseada no tipo de intel
    if (card.type === 'basic' || card.type === 'basic_reversed') {
      if (!card.front.trim() || !card.back.trim()) {
        toast.error('OPERAÇÃO FALHADA: Configure briefing e intel de resposta', { icon: '🚨' });
        return;
      }
    } else if (card.type === 'cloze') {
      if (!card.text.trim()) {
        toast.error('OPERAÇÃO FALHADA: Configure texto com lacunas táticas', { icon: '🚨' });
        return;
      }
    } else if (card.type === 'multiple_choice') {
      if (!card.question.trim() || card.options.some(o => !o.trim())) {
        toast.error('OPERAÇÃO FALHADA: Configure pergunta e todas as alternativas', { icon: '🚨' });
        return;
      }
    } else if (card.type === 'true_false') {
      if (!card.statement.trim()) {
        toast.error('OPERAÇÃO FALHADA: Configure afirmação para avaliação', { icon: '🚨' });
        return;
      }
    } else if (card.type === 'type_answer') {
      if (!card.question.trim() || !card.answer.toString().trim()) {
        toast.error('OPERAÇÃO FALHADA: Configure pergunta e resposta tática', { icon: '🚨' });
        return;
      }
    } else if (card.type === 'image_occlusion') {
      if (!card.image || card.occlusionAreas.length === 0) {
        toast.error('OPERAÇÃO FALHADA: Configure imagem e áreas de oclusão', { icon: '🚨' });
        return;
      }
    }

    // Prepare data for API
    setIsLoading(true);
    toast.loading('SALVANDO INTEL TÁTICO...', { id: 'save' });
    
    try {
      const flashcardData: CreateFlashcardData = {
        type: card.type as any,
        difficulty: card.difficulty as any,
        category: selectedCategory !== 'Todos' ? selectedCategory : 'GERAL',
        subcategory: selectedSubcategory !== 'Todas' ? selectedSubcategory : 'Geral',
        tags: card.tags ? card.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
        status: 'published',
        // Type-specific fields
        front: card.front,
        back: card.back,
        extra: card.extra,
        text: card.text,
        question: card.question,
        options: card.options,
        correct: card.correct,
        explanation: card.explanation,
        statement: card.statement,
        answer: card.answer,
        hint: card.hint,
        image: card.image,
        occlusionAreas: card.occlusionAreas
      };
      
      const response = await flashcardService.createFlashcard(flashcardData);
      
      if (response.success) {
        toast.success('OPERAÇÃO CONCLUÍDA: Intel tático criado com sucesso!', {
          id: 'save',
          duration: 3000,
          icon: '✅'
        });
        
        // Retornar à base operacional
        setTimeout(() => {
          navigate('/admin/flashcards/cards');
        }, 1000);
      } else {
        throw new Error('Falha ao salvar flashcard');
      }
    } catch (error) {
      console.error('Error saving flashcard:', error);
      toast.error('OPERAÇÃO FALHADA: Erro ao salvar intel tático', {
        id: 'save',
        icon: '🚨'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderPreview = () => {
    switch (card.type) {
      case 'basic':
      case 'basic_reversed':
        return (
          <div className="text-center">
            <h3 className="text-lg font-police-subtitle font-bold text-gray-900 dark:text-white mb-4">
              {showAnswer ? 'RESPOSTA' : 'PERGUNTA'}
            </h3>
            <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 mb-4">
              <p className="text-gray-900 dark:text-white font-police-body text-lg">
                {showAnswer ? card.back : card.front}
              </p>
            </div>
            {showAnswer && card.extra && (
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-yellow-800 dark:text-yellow-200 font-police-body text-sm">
                  {card.extra}
                </p>
              </div>
            )}
          </div>
        );

      case 'multiple_choice':
        return (
          <div className="text-center">
            <h3 className="text-lg font-police-subtitle font-bold text-gray-900 dark:text-white mb-4">
              MÚLTIPLA ESCOLHA
            </h3>
            <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 mb-4">
              <p className="text-gray-900 dark:text-white font-police-body text-lg mb-4">
                {card.question}
              </p>
              <div className="space-y-2">
                {card.options.map((option: string, index: number) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border transition-colors ${
                      showAnswer && index === card.correct
                        ? 'bg-green-100 dark:bg-green-900/30 border-green-500 text-green-800 dark:text-green-200'
                        : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                    }`}
                  >
                    <span className="font-police-body">
                      {String.fromCharCode(65 + index)}) {option}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            {showAnswer && card.explanation && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-blue-800 dark:text-blue-200 font-police-body text-sm">
                  <strong>EXPLICAÇÃO:</strong> {card.explanation}
                </p>
              </div>
            )}
          </div>
        );

      case 'true_false':
        return (
          <div className="text-center">
            <h3 className="text-lg font-police-subtitle font-bold text-gray-900 dark:text-white mb-4">
              VERDADEIRO OU FALSO
            </h3>
            <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 mb-4">
              <p className="text-gray-900 dark:text-white font-police-body text-lg mb-4">
                {card.statement}
              </p>
              {showAnswer && (
                <div className={`p-3 rounded-lg ${
                  (card.answer === 'true' || card.answer === true)
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                    : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
                }`}>
                  <p className="font-police-body font-bold uppercase">
                    {(card.answer === 'true' || card.answer === true) ? 'VERDADEIRO' : 'FALSO'}
                  </p>
                </div>
              )}
            </div>
            {showAnswer && card.explanation && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-blue-800 dark:text-blue-200 font-police-body text-sm">
                  <strong>EXPLICAÇÃO:</strong> {card.explanation}
                </p>
              </div>
            )}
          </div>
        );

      case 'cloze':
        return (
          <div className="text-center">
            <h3 className="text-lg font-police-subtitle font-bold text-gray-900 dark:text-white mb-4">
              COMPLETE AS LACUNAS
            </h3>
            <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 mb-4">
              <p className="text-gray-900 dark:text-white font-police-body text-lg whitespace-pre-line">
                {showAnswer 
                  ? card.text.replace(/{{c\d+::(.*?)}}/g, '$1')
                  : card.text.replace(/{{c\d+::(.*?)}}/g, '___')
                }
              </p>
            </div>
            {showAnswer && card.extra && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-blue-800 dark:text-blue-200 font-police-body text-sm">
                  {card.extra}
                </p>
              </div>
            )}
          </div>
        );

      case 'type_answer':
        return (
          <div className="text-center">
            <h3 className="text-lg font-police-subtitle font-bold text-gray-900 dark:text-white mb-4">
              DIGITE A RESPOSTA
            </h3>
            <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 mb-4">
              <p className="text-gray-900 dark:text-white font-police-body text-lg mb-4">
                {card.question}
              </p>
              {showAnswer && (
                <div className="p-3 bg-green-100 dark:bg-green-900/30 border border-green-500 rounded-lg">
                  <p className="text-green-800 dark:text-green-200 font-police-body font-bold">
                    RESPOSTA: {card.answer}
                  </p>
                </div>
              )}
              {card.hint && !showAnswer && (
                <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-500 rounded-lg mt-2">
                  <p className="text-yellow-800 dark:text-yellow-200 font-police-body text-sm">
                    💡 DICA: {card.hint}
                  </p>
                </div>
              )}
            </div>
          </div>
        );

      case 'image_occlusion':
        return (
          <div className="text-center">
            <h3 className="text-lg font-police-subtitle font-bold text-gray-900 dark:text-white mb-4">
              OCLUSÃO DE IMAGEM
            </h3>
            {card.image ? (
              <div className="relative inline-block">
                <img 
                  src={card.image} 
                  alt="Flashcard image" 
                  className="max-w-full h-auto rounded-lg"
                />
                {/* Renderizar áreas de oclusão */}
                {card.occlusionAreas && card.occlusionAreas.map((area: any, index: number) => (
                  <div
                    key={index}
                    style={{
                      position: 'absolute',
                      left: `${(area.x / 800) * 100}%`,
                      top: `${(area.y / 600) * 100}%`,
                      width: `${(area.width / 800) * 100}%`,
                      height: `${(area.height / 600) * 100}%`
                    }}
                    className="ring-2 ring-accent-500"
                  >
                    {area.shape === 'rectangle' ? (
                      <div
                        className={`w-full h-full ${
                          showAnswer
                            ? 'bg-transparent border-2 border-accent-500'
                            : 'bg-gray-800 dark:bg-gray-900'
                        }`}
                      />
                    ) : (
                      <div
                        className={`w-full h-full rounded-full ${
                          showAnswer
                            ? 'bg-transparent border-2 border-accent-500'
                            : 'bg-gray-800 dark:bg-gray-900'
                        }`}
                      />
                    )}
                    
                    {showAnswer && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="bg-accent-500 text-black px-2 py-1 rounded font-police-body font-semibold text-sm uppercase">
                          {area.answer}
                        </span>
                      </div>
                    )}
                    
                    {!showAnswer && (
                      <div className="absolute top-1 left-1 bg-gray-900/80 text-white px-1.5 py-0.5 rounded text-xs font-police-numbers">
                        {index + 1}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 bg-gray-100 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
                <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 dark:text-gray-400 font-police-body">
                  CONFIGURE A IMAGEM DE OCLUSÃO
                </p>
              </div>
            )}
            {card.extra && (
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-blue-800 dark:text-blue-200 font-police-body text-sm">
                  {card.extra}
                </p>
              </div>
            )}
          </div>
        );

      default:
        return (
          <div className="text-center p-8">
            <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 font-police-body">
              Selecione um tipo de flashcard para visualizar a prévia
            </p>
          </div>
        );
    }
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
        
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-6">
            <Button
              variant="ghost"
              onClick={() => navigate('/admin/flashcards/cards')}
              className="gap-2 font-police-body uppercase tracking-wider hover:bg-white/10 text-white hover:text-accent-500 border border-transparent hover:border-accent-500/30 transition-all duration-300"
            >
              <ArrowLeft className="w-5 h-5" />
              RETORNAR À BASE
            </Button>
            <div className="border-l-4 border-l-accent-500 pl-6">
              <h1 className="text-4xl font-police-title font-bold uppercase tracking-wider text-white">
                NOVO INTEL TÁTICO
              </h1>
              <p className="text-gray-300 font-police-subtitle uppercase tracking-wider mt-1">
                OPERAÇÃO DE CRIAÇÃO DE FLASHCARD
              </p>
            </div>
          </div>
        
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => setShowPreview(!showPreview)}
              className="gap-2 font-police-body uppercase tracking-wider hover:bg-white/10 text-white hover:text-accent-500 border border-transparent hover:border-accent-500/30 transition-all duration-300"
            >
              <Eye className="w-5 h-5" />
              {showPreview ? 'OCULTAR' : 'MOSTRAR'} PREVIEW
            </Button>
            
            <Button 
              onClick={handleSave}
              disabled={isLoading}
              className="gap-2 bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black font-police-body font-bold uppercase tracking-wider transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCircle className="w-5 h-5" />
              {isLoading ? 'SALVANDO...' : 'CONFIRMAR OPERAÇÃO'}
            </Button>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulário */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-accent-500/30 shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden">
            {/* Tactical stripes */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent-500 via-accent-400 to-accent-500" />
            <div className="absolute top-0 right-0 w-20 h-20 border-t-4 border-r-4 border-accent-500/20" />
            
            <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border-b border-accent-500/30">
              <CardTitle className="font-police-title uppercase tracking-wider text-gray-900 dark:text-white flex items-center gap-3">
                <Target className="w-6 h-6 text-accent-500" />
                CONFIGURAÇÃO TÁTICA DO INTEL
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Tipo de Cartão */}
              <div className="relative">
                <label className="block text-sm font-police-subtitle font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wider flex items-center gap-2">
                  <Brain className="w-4 h-4 text-accent-500" />
                  TIPO DE OPERAÇÃO INTEL
                </label>
                <select
                  value={card.type}
                  onChange={(e) => setCard({ ...card, type: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-accent-500/30 focus:border-accent-500 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-police-body uppercase tracking-wider focus:ring-2 focus:ring-accent-500/30 focus:border-accent-500 transition-all duration-300 hover:border-accent-500/50"
                >
                  {cardTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                <div className="flex items-center justify-between">
                  <p className="mt-1 text-xs text-gray-600 dark:text-gray-400 font-police-body">
                    {cardTypes.find(t => t.value === card.type)?.description}
                  </p>
                  <Button
                    type="button"
                    size="sm"
                    onClick={loadTemplate}
                    className="ml-2 gap-1 bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black font-police-body font-semibold uppercase tracking-wider text-xs transition-all duration-300 shadow-md hover:shadow-lg"
                  >
                    <Target className="w-3 h-3" />
                    EXEMPLO TÁTICO
                  </Button>
                </div>
              </div>

              {/* Campos específicos por tipo */}
              {(card.type === 'basic' || card.type === 'basic_reversed') && (
                <>
                  <div>
                    <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                      FRENTE DO CARTÃO
                    </label>
                    <textarea
                      rows={3}
                      value={card.front}
                      onChange={(e) => setCard({ ...card, front: e.target.value })}
                      placeholder="DIGITE A PERGUNTA OU CONCEITO..."
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body placeholder:uppercase placeholder:tracking-wider focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                      VERSO DO CARTÃO
                    </label>
                    <textarea
                      rows={4}
                      value={card.back}
                      onChange={(e) => setCard({ ...card, back: e.target.value })}
                      placeholder="DIGITE A RESPOSTA OU DEFINIÇÃO..."
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body placeholder:uppercase placeholder:tracking-wider focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                    />
                  </div>

                  {card.type === 'basic_reversed' && (
                    <div>
                      <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                        INFORMAÇÃO EXTRA
                      </label>
                      <textarea
                        rows={2}
                        value={card.extra}
                        onChange={(e) => setCard({ ...card, extra: e.target.value })}
                        placeholder="INFORMAÇÕES ADICIONAIS..."
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body placeholder:uppercase placeholder:tracking-wider focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                      />
                    </div>
                  )}
                </>
              )}

              {/* Cloze Type Fields */}
              {card.type === 'cloze' && (
                <>
                  <div>
                    <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                      TEXTO COM LACUNAS
                    </label>
                    <textarea
                      rows={4}
                      value={card.text}
                      onChange={(e) => setCard({ ...card, text: e.target.value })}
                      placeholder="USE {{c1::PALAVRA}} PARA CRIAR LACUNAS..."
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body placeholder:uppercase placeholder:tracking-wider focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                    />
                    <p className="mt-1 text-xs text-gray-600 dark:text-gray-400 font-police-body">
                      EXEMPLO: O crime de {`{{c1::deserção}}`} tem pena de {`{{c2::6 meses a 2 anos}}`}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                      INFORMAÇÃO EXTRA (OPCIONAL)
                    </label>
                    <textarea
                      rows={2}
                      value={card.extra}
                      onChange={(e) => setCard({ ...card, extra: e.target.value })}
                      placeholder="CONTEXTO OU EXPLICAÇÃO ADICIONAL..."
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body placeholder:uppercase placeholder:tracking-wider focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                    />
                  </div>
                </>
              )}

              {/* Multiple Choice Type Fields */}
              {card.type === 'multiple_choice' && (
                <>
                  <div>
                    <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                      PERGUNTA
                    </label>
                    <textarea
                      rows={2}
                      value={card.question}
                      onChange={(e) => setCard({ ...card, question: e.target.value })}
                      placeholder="DIGITE A PERGUNTA..."
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body placeholder:uppercase placeholder:tracking-wider focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                      ALTERNATIVAS
                    </label>
                    {card.options.map((option, index) => (
                      <div key={index} className="flex items-center gap-2 mb-2">
                        <input
                          type="radio"
                          name="correct_option"
                          checked={card.correct === index}
                          onChange={() => setCard({ ...card, correct: index })}
                          className="text-accent-500 focus:ring-accent-500"
                        />
                        <span className="font-police-subtitle font-bold text-gray-900 dark:text-white">
                          {String.fromCharCode(65 + index)})
                        </span>
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => {
                            const newOptions = [...card.options];
                            newOptions[index] = e.target.value;
                            setCard({ ...card, options: newOptions });
                          }}
                          placeholder={`ALTERNATIVA ${String.fromCharCode(65 + index)}`}
                          className="flex-1 px-3 py-1 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body placeholder:uppercase placeholder:tracking-wider focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                        />
                      </div>
                    ))}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                      EXPLICAÇÃO
                    </label>
                    <textarea
                      rows={2}
                      value={card.explanation}
                      onChange={(e) => setCard({ ...card, explanation: e.target.value })}
                      placeholder="EXPLIQUE A RESPOSTA CORRETA..."
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body placeholder:uppercase placeholder:tracking-wider focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                    />
                  </div>
                </>
              )}

              {/* True/False Type Fields */}
              {card.type === 'true_false' && (
                <>
                  <div>
                    <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                      AFIRMAÇÃO
                    </label>
                    <textarea
                      rows={2}
                      value={card.statement}
                      onChange={(e) => setCard({ ...card, statement: e.target.value })}
                      placeholder="DIGITE A AFIRMAÇÃO A SER AVALIADA..."
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body placeholder:uppercase placeholder:tracking-wider focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                      RESPOSTA CORRETA
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="tf_answer"
                          checked={card.answer === 'true'}
                          onChange={() => setCard({ ...card, answer: 'true' })}
                          className="text-accent-500 focus:ring-accent-500"
                        />
                        <span className="font-police-body text-gray-900 dark:text-white uppercase tracking-wider">
                          VERDADEIRO
                        </span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="tf_answer"
                          checked={card.answer === 'false'}
                          onChange={() => setCard({ ...card, answer: 'false' })}
                          className="text-accent-500 focus:ring-accent-500"
                        />
                        <span className="font-police-body text-gray-900 dark:text-white uppercase tracking-wider">
                          FALSO
                        </span>
                      </label>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                      EXPLICAÇÃO (OPCIONAL)
                    </label>
                    <textarea
                      rows={2}
                      value={card.explanation}
                      onChange={(e) => setCard({ ...card, explanation: e.target.value })}
                      placeholder="EXPLIQUE A RESPOSTA..."
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body placeholder:uppercase placeholder:tracking-wider focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                    />
                  </div>
                </>
              )}

              {/* Type Answer Fields */}
              {card.type === 'type_answer' && (
                <>
                  <div>
                    <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                      PERGUNTA
                    </label>
                    <textarea
                      rows={2}
                      value={card.question}
                      onChange={(e) => setCard({ ...card, question: e.target.value })}
                      placeholder="DIGITE A PERGUNTA..."
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body placeholder:uppercase placeholder:tracking-wider focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                        RESPOSTA
                      </label>
                      <input
                        type="text"
                        value={card.answer}
                        onChange={(e) => setCard({ ...card, answer: e.target.value })}
                        placeholder="RESPOSTA CORRETA"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body placeholder:uppercase placeholder:tracking-wider focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                        DICA (OPCIONAL)
                      </label>
                      <input
                        type="text"
                        value={card.hint}
                        onChange={(e) => setCard({ ...card, hint: e.target.value })}
                        placeholder="DICA PARA O USUÁRIO"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body placeholder:uppercase placeholder:tracking-wider focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Image Occlusion Fields */}
              {card.type === 'image_occlusion' && (
                <>
                  <div>
                    <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                      CONFIGURAR OCLUSÃO DE IMAGEM
                    </label>
                    <Button
                      type="button"
                      onClick={() => setShowImageOcclusionEditor(true)}
                      className="w-full gap-2 bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black font-police-body font-semibold uppercase tracking-wider transition-colors"
                    >
                      <ImageIcon className="w-4 h-4" />
                      {card.image ? 'EDITAR' : 'CRIAR'} OCLUSÃO DE IMAGEM
                    </Button>
                    {card.image && card.occlusionAreas.length > 0 && (
                      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 font-police-body">
                        ✅ {card.occlusionAreas.length} ÁREAS DE OCLUSÃO CONFIGURADAS
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                      INFORMAÇÃO EXTRA (OPCIONAL)
                    </label>
                    <textarea
                      rows={2}
                      value={card.extra}
                      onChange={(e) => setCard({ ...card, extra: e.target.value })}
                      placeholder="CONTEXTO OU EXPLICAÇÃO ADICIONAL..."
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body placeholder:uppercase placeholder:tracking-wider focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                    />
                  </div>
                </>
              )}

              {/* Configurações gerais */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                    CATEGORIA
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    disabled={isLoadingCategories}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body uppercase tracking-wider focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all disabled:opacity-50"
                  >
                    {isLoadingCategories ? (
                      <option>CARREGANDO...</option>
                    ) : (
                      getCategoryOptions().filter(cat => cat !== 'Todos').map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))
                    )}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                    SUBCATEGORIA
                  </label>
                  <select
                    value={selectedSubcategory}
                    onChange={(e) => setSelectedSubcategory(e.target.value)}
                    disabled={selectedCategory === 'Todos' || isLoadingSubcategories}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body uppercase tracking-wider focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all disabled:opacity-50"
                  >
                    {selectedCategory === 'Todos' ? (
                      <option>SELECIONE CATEGORIA PRIMEIRO</option>
                    ) : isLoadingSubcategories ? (
                      <option>CARREGANDO...</option>
                    ) : (
                      getSubcategoryOptions().filter(sub => sub !== 'Todas').map(sub => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                    DIFICULDADE
                  </label>
                  <select
                    value={card.difficulty}
                    onChange={(e) => setCard({ ...card, difficulty: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body uppercase tracking-wider focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                  >
                    <option value="easy">FÁCIL</option>
                    <option value="medium">MÉDIO</option>
                    <option value="hard">DIFÍCIL</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                    TAGS (SEPARADAS POR VÍRGULA)
                  </label>
                  <input
                    type="text"
                    value={card.tags}
                    onChange={(e) => setCard({ ...card, tags: e.target.value })}
                    placeholder="EX: CPM, ART. 9º"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body placeholder:uppercase placeholder:tracking-wider focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Preview */}
        {showPreview && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="font-police-title uppercase tracking-wider text-gray-900 dark:text-white">
                    PRÉVIA DO FLASHCARD
                  </CardTitle>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowAnswer(!showAnswer)}
                    className="gap-1 font-police-body uppercase tracking-wider border-gray-300 dark:border-gray-600 hover:border-accent-500 dark:hover:border-accent-500 transition-colors"
                  >
                    {showAnswer ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    {showAnswer ? 'OCULTAR' : 'MOSTRAR'} RESPOSTA
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="min-h-[300px] flex items-center justify-center">
                  {renderPreview()}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Image Occlusion Editor Modal */}
      {showImageOcclusionEditor && (
        <ImageOcclusionEditor
          imageUrl={card.image}
          occlusionAreas={card.occlusionAreas}
          onSave={(imageUrl, areas) => {
            setCard({ ...card, image: imageUrl, occlusionAreas: areas });
            setShowImageOcclusionEditor(false);
            toast.success('Oclusão de imagem configurada', { icon: '🖼️' });
          }}
          onCancel={() => setShowImageOcclusionEditor(false)}
        />
      )}
    </div>
  );
}