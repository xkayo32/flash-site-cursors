import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Save,
  CheckCircle,
  AlertCircle,
  Target,
  Brain,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Copy,
  Search,
  Filter,
  MoreVertical,
  X,
  Eye,
  EyeOff,
  Image as ImageIcon
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import toast from 'react-hot-toast';
import ImageOcclusionEditor from '@/components/ImageOcclusionEditor';

// Mock data para demonstração
const mockDeck = {
  id: 1,
  title: 'ARTIGOS - CÓDIGO PENAL MILITAR',
  description: 'Memorização dos principais artigos do CPM para concursos policiais',
  category: 'DIREITO',
  subcategory: 'Penal Militar',
  totalCards: 50,
  difficulty: 'medium'
};

const mockCards = [
  // Tipo 1: Basic (Front/Back)
  {
    id: 1,
    type: 'basic',
    front: 'Art. 9º CPM - Crime militar em tempo de paz',
    back: 'Consideram-se crimes militares, em tempo de paz:\nI - os crimes previstos neste Código e os previstos na legislação penal, quando praticados:\na) por militar em situação de atividade ou assemelhado',
    position: 1,
    difficulty: 'medium',
    tags: ['CPM', 'Art. 9º', 'Crime Militar'],
    lastReview: '2024-01-20',
    nextReview: '2024-01-25',
    reviews: 5,
    correctCount: 4
  },
  // Tipo 2: Basic (Reversed)
  {
    id: 2,
    type: 'basic_reversed',
    front: 'Deserção',
    back: 'Art. 298 CPM',
    extra: 'Ausentar-se o militar, sem licença, da unidade em que serve, ou do lugar em que deve permanecer, por mais de oito dias.\nPena - detenção, de seis meses a dois anos',
    position: 2,
    difficulty: 'easy',
    tags: ['CPM', 'Art. 298', 'Deserção'],
    lastReview: '2024-01-19',
    nextReview: '2024-01-24',
    reviews: 8,
    correctCount: 7
  },
  // Tipo 3: Cloze (Fill in the blank)
  {
    id: 3,
    type: 'cloze',
    text: 'Art. 301 CPM - {{c1::Abandonar}}, sem ordem superior, o {{c2::posto}} ou lugar de serviço que lhe tenha sido {{c3::designado}}.\nPena - detenção, de {{c4::três meses a um ano}}',
    extra: 'Este artigo trata do abandono de posto no Código Penal Militar',
    position: 3,
    difficulty: 'hard',
    tags: ['CPM', 'Art. 301', 'Abandono'],
    lastReview: null,
    nextReview: null,
    reviews: 0,
    correctCount: 0
  },
  // Tipo 4: Multiple Choice
  {
    id: 4,
    type: 'multiple_choice',
    question: 'Qual a pena para deserção no CPM?',
    options: [
      'Detenção de 1 a 3 anos',
      'Detenção de 6 meses a 2 anos',
      'Reclusão de 2 a 8 anos',
      'Prisão de 15 dias a 6 meses'
    ],
    correct: 1,
    explanation: 'Art. 298 CPM - Pena: detenção, de seis meses a dois anos',
    position: 4,
    difficulty: 'medium',
    tags: ['CPM', 'Deserção', 'Penas'],
    lastReview: '2024-01-18',
    nextReview: '2024-01-23',
    reviews: 3,
    correctCount: 2
  },
  // Tipo 5: True/False
  {
    id: 5,
    type: 'true_false',
    statement: 'O abandono de posto no CPM tem pena de detenção de 3 meses a 1 ano.',
    answer: true,
    explanation: 'Correto. Art. 301 CPM estabelece pena de detenção, de três meses a um ano.',
    position: 5,
    difficulty: 'easy',
    tags: ['CPM', 'Abandono', 'Verdadeiro/Falso'],
    lastReview: '2024-01-17',
    nextReview: '2024-01-22',
    reviews: 6,
    correctCount: 5
  },
  // Tipo 6: Image Occlusion
  {
    id: 6,
    type: 'image_occlusion',
    image: '/api/placeholder/800/600',
    occlusionAreas: [
      { id: 'area-1', x: 100, y: 50, width: 150, height: 40, answer: 'General de Exército', shape: 'rectangle' },
      { id: 'area-2', x: 100, y: 120, width: 150, height: 40, answer: 'General de Divisão', shape: 'rectangle' },
      { id: 'area-3', x: 100, y: 190, width: 150, height: 40, answer: 'General de Brigada', shape: 'rectangle' },
      { id: 'area-4', x: 350, y: 50, width: 120, height: 120, answer: '4 Estrelas', shape: 'circle' },
      { id: 'area-5', x: 350, y: 190, width: 120, height: 120, answer: '3 Estrelas', shape: 'circle' }
    ],
    currentOcclusion: 0,
    extra: 'Hierarquia dos Oficiais Generais do Exército Brasileiro - Patentes e Distintivos',
    position: 6,
    difficulty: 'medium',
    tags: ['Hierarquia', 'Oficiais', 'Exército'],
    lastReview: '2024-01-16',
    nextReview: '2024-01-21',
    reviews: 4,
    correctCount: 3
  },
  // Tipo 7: Type Answer
  {
    id: 7,
    type: 'type_answer',
    question: 'Complete o artigo: "Art. 9º CPM - Consideram-se crimes militares, em tempo de..."',
    answer: 'paz',
    hint: 'Oposto de guerra',
    position: 7,
    difficulty: 'easy',
    tags: ['CPM', 'Art. 9º', 'Digitação'],
    lastReview: '2024-01-15',
    nextReview: '2024-01-20',
    reviews: 7,
    correctCount: 6
  }
];

export default function FlashcardEditor() {
  const navigate = useNavigate();
  const { deckId } = useParams();
  const [cards, setCards] = useState(mockCards);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [showNewCardForm, setShowNewCardForm] = useState(false);
  const [editingCard, setEditingCard] = useState<number | null>(null);
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  
  const [showImageOcclusionEditor, setShowImageOcclusionEditor] = useState(false);
  const [newCard, setNewCard] = useState({
    type: 'basic',
    front: '',
    back: '',
    difficulty: 'medium',
    tags: '',
    question: '',
    options: ['', '', '', ''],
    correct: 0,
    explanation: '',
    statement: '',
    answer: true,
    text: '',
    extra: '',
    hint: '',
    image: '',
    occlusionAreas: []
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

  const filteredCards = cards.filter(card => {
    const searchContent = [
      card.front,
      card.back,
      card.question,
      card.statement,
      card.text,
      card.extra,
      ...(card.options || []),
      ...(card.tags || [])
    ].filter(Boolean).join(' ').toLowerCase();
    
    const matchesSearch = searchContent.includes(searchTerm.toLowerCase());
    const matchesDifficulty = selectedDifficulty === 'all' || card.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesDifficulty;
  });

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      easy: 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      medium: 'bg-gray-300 text-gray-900 dark:bg-gray-600 dark:text-gray-200',
      hard: 'bg-gray-500 text-white dark:bg-gray-400 dark:text-gray-900'
    };
    return colors[difficulty as keyof typeof colors];
  };

  const getDifficultyLabel = (difficulty: string) => {
    const labels = { easy: 'FÁCIL', medium: 'MÉDIO', hard: 'DIFÍCIL' };
    return labels[difficulty as keyof typeof labels];
  };

  const handleSaveNewCard = () => {
    // Validação baseada no tipo de cartão
    if (newCard.type === 'basic' || newCard.type === 'basic_reversed') {
      if (!newCard.front.trim() || !newCard.back.trim()) {
        toast.error('Preencha frente e verso do cartão', { icon: '⚠️' });
        return;
      }
    } else if (newCard.type === 'cloze') {
      if (!newCard.text.trim()) {
        toast.error('Preencha o texto com lacunas', { icon: '⚠️' });
        return;
      }
    } else if (newCard.type === 'multiple_choice') {
      if (!newCard.question.trim() || newCard.options.some(o => !o.trim())) {
        toast.error('Preencha a pergunta e todas as alternativas', { icon: '⚠️' });
        return;
      }
    } else if (newCard.type === 'true_false') {
      if (!newCard.statement.trim()) {
        toast.error('Preencha a afirmação', { icon: '⚠️' });
        return;
      }
    } else if (newCard.type === 'type_answer') {
      if (!newCard.question.trim() || !newCard.answer.toString().trim()) {
        toast.error('Preencha a pergunta e a resposta', { icon: '⚠️' });
        return;
      }
    } else if (newCard.type === 'image_occlusion') {
      if (!newCard.image || newCard.occlusionAreas.length === 0) {
        toast.error('Configure a imagem e as áreas de oclusão', { icon: '⚠️' });
        return;
      }
    }

    const card = {
      id: Math.max(...cards.map(c => c.id)) + 1,
      type: newCard.type,
      front: newCard.front,
      back: newCard.back,
      question: newCard.question,
      options: newCard.options,
      correct: newCard.correct,
      explanation: newCard.explanation,
      statement: newCard.statement,
      answer: newCard.answer,
      text: newCard.text,
      extra: newCard.extra,
      hint: newCard.hint,
      image: newCard.image,
      occlusionAreas: newCard.occlusionAreas,
      currentOcclusion: 0,
      position: cards.length + 1,
      difficulty: newCard.difficulty,
      tags: newCard.tags.split(',').map(t => t.trim()).filter(t => t),
      lastReview: null,
      nextReview: null,
      reviews: 0,
      correctCount: 0
    };

    setCards([...cards, card]);
    setNewCard({
      type: 'basic',
      front: '',
      back: '',
      difficulty: 'medium',
      tags: '',
      question: '',
      options: ['', '', '', ''],
      correct: 0,
      explanation: '',
      statement: '',
      answer: true,
      text: '',
      extra: '',
      hint: '',
      image: '',
      occlusionAreas: []
    });
    setShowNewCardForm(false);
    
    toast.success('Cartão criado com sucesso', {
      duration: 3000,
      icon: '✅'
    });
  };

  const handleUpdateCard = (cardId: number, updates: any) => {
    setCards(cards.map(card => 
      card.id === cardId ? { ...card, ...updates } : card
    ));
    setEditingCard(null);
    
    toast.success('Cartão atualizado com sucesso', {
      duration: 3000,
      icon: '✅'
    });
  };

  const handleDeleteCard = (cardId: number) => {
    if (confirm('Tem certeza que deseja excluir este cartão?')) {
      setCards(cards.filter(card => card.id !== cardId));
      toast.success('Cartão excluído com sucesso', {
        duration: 3000,
        icon: '🗑️'
      });
    }
  };

  const handleDuplicateCard = (cardId: number) => {
    const cardToDuplicate = cards.find(c => c.id === cardId);
    if (cardToDuplicate) {
      const newCardData = {
        ...cardToDuplicate,
        id: Math.max(...cards.map(c => c.id)) + 1,
        position: cards.length + 1,
        front: `${cardToDuplicate.front} (CÓPIA)`,
        lastReview: null,
        nextReview: null,
        reviews: 0,
        correctCount: 0
      };
      setCards([...cards, newCardData]);
      toast.success('Cartão duplicado com sucesso', {
        duration: 3000,
        icon: '📋'
      });
    }
  };

  const handleSelectCard = (id: number) => {
    setSelectedCards(prev => 
      prev.includes(id) 
        ? prev.filter(c => c !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedCards(
      selectedCards.length === filteredCards.length 
        ? [] 
        : filteredCards.map(c => c.id)
    );
  };

  const handleBulkDelete = () => {
    if (confirm(`Tem certeza que deseja excluir ${selectedCards.length} cartões?`)) {
      setCards(cards.filter(card => !selectedCards.includes(card.id)));
      setSelectedCards([]);
      toast.success(`${selectedCards.length} cartões excluídos`, {
        duration: 3000,
        icon: '🗑️'
      });
    }
  };

  const getSuccessRate = (reviews: number, correctCount: number) => {
    if (reviews === 0) return 0;
    return Math.round((correctCount / reviews) * 100);
  };

  const getCardTypeLabel = (type: string) => {
    const typeObj = cardTypes.find(t => t.value === type);
    return typeObj ? typeObj.label : 'BÁSICO';
  };

  const renderCardPreview = (card: any) => {
    switch (card.type) {
      case 'basic':
        return (
          <div className="text-center">
            <h3 className="text-2xl font-police-subtitle font-bold text-gray-900 dark:text-white mb-6">
              {card.front}
            </h3>
            {showAnswer && (
              <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                <p className="text-lg font-police-body text-gray-700 dark:text-gray-300 whitespace-pre-line">
                  {card.back}
                </p>
              </div>
            )}
          </div>
        );

      case 'basic_reversed':
        return (
          <div className="text-center">
            <h3 className="text-2xl font-police-subtitle font-bold text-gray-900 dark:text-white mb-6">
              {showAnswer ? card.back : card.front}
            </h3>
            {showAnswer && card.extra && (
              <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                <p className="text-lg font-police-body text-gray-700 dark:text-gray-300 whitespace-pre-line">
                  {card.extra}
                </p>
              </div>
            )}
          </div>
        );

      case 'cloze':
        const renderClozeText = (text: string, showAnswers: boolean) => {
          const parts = text.split(/{{c\d+::(.*?)}}/g);
          const result = [];
          
          for (let i = 0; i < parts.length; i++) {
            if (i % 2 === 0) {
              // Regular text
              result.push(<span key={i}>{parts[i]}</span>);
            } else {
              // Cloze content
              if (showAnswers) {
                result.push(
                  <span key={i} className="bg-accent-500 text-black px-2 py-1 rounded font-semibold">
                    {parts[i]}
                  </span>
                );
              } else {
                result.push(
                  <span key={i} className="bg-gray-300 dark:bg-gray-600 px-8 py-1 rounded text-transparent">
                    ___
                  </span>
                );
              }
            }
          }
          return result;
        };

        return (
          <div className="text-center">
            <div className="text-xl font-police-body text-gray-900 dark:text-white mb-6 whitespace-pre-line">
              {renderClozeText(card.text, showAnswer)}
            </div>
            {showAnswer && card.extra && (
              <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                <p className="text-sm font-police-body text-gray-700 dark:text-gray-300">
                  {card.extra}
                </p>
              </div>
            )}
          </div>
        );

      case 'multiple_choice':
        return (
          <div>
            <h3 className="text-xl font-police-subtitle font-bold text-gray-900 dark:text-white mb-6 text-center">
              {card.question}
            </h3>
            <div className="space-y-3 mb-6">
              {card.options.map((option: string, index: number) => (
                <div 
                  key={index} 
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                    showAnswer && index === card.correct
                      ? 'border-accent-500 bg-accent-500/20 text-accent-700 dark:text-accent-300'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-police-subtitle font-bold text-gray-900 dark:text-white">
                      {String.fromCharCode(65 + index)})
                    </span>
                    <span className="font-police-body text-gray-900 dark:text-white">
                      {option}
                    </span>
                    {showAnswer && index === card.correct && (
                      <CheckCircle className="w-5 h-5 text-accent-500 ml-auto" />
                    )}
                  </div>
                </div>
              ))}
            </div>
            {showAnswer && card.explanation && (
              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                <p className="text-sm font-police-body text-gray-700 dark:text-gray-300">
                  <strong>EXPLICAÇÃO:</strong> {card.explanation}
                </p>
              </div>
            )}
          </div>
        );

      case 'true_false':
        return (
          <div className="text-center">
            <h3 className="text-xl font-police-subtitle font-bold text-gray-900 dark:text-white mb-6">
              {card.statement}
            </h3>
            <div className="flex justify-center gap-4 mb-6">
              <button 
                className={`px-8 py-3 rounded-lg border font-police-body font-semibold uppercase tracking-wider transition-colors ${
                  showAnswer && card.answer === true
                    ? 'border-accent-500 bg-accent-500 text-black'
                    : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-400'
                }`}
              >
                VERDADEIRO
                {showAnswer && card.answer === true && <CheckCircle className="w-4 h-4 inline ml-2" />}
              </button>
              <button 
                className={`px-8 py-3 rounded-lg border font-police-body font-semibold uppercase tracking-wider transition-colors ${
                  showAnswer && card.answer === false
                    ? 'border-accent-500 bg-accent-500 text-black'
                    : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-400'
                }`}
              >
                FALSO
                {showAnswer && card.answer === false && <CheckCircle className="w-4 h-4 inline ml-2" />}
              </button>
            </div>
            {showAnswer && card.explanation && (
              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                <p className="text-sm font-police-body text-gray-700 dark:text-gray-300">
                  {card.explanation}
                </p>
              </div>
            )}
          </div>
        );

      case 'type_answer':
        const [userAnswer, setUserAnswer] = useState('');
        return (
          <div className="text-center">
            <h3 className="text-xl font-police-subtitle font-bold text-gray-900 dark:text-white mb-6">
              {card.question}
            </h3>
            {card.hint && (
              <p className="text-sm text-gray-600 dark:text-gray-400 font-police-body mb-4">
                💡 DICA: {card.hint}
              </p>
            )}
            <div className="mb-6">
              <input
                type="text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="DIGITE SUA RESPOSTA..."
                className="w-full max-w-md px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body text-center placeholder:uppercase placeholder:tracking-wider focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
              />
            </div>
            {showAnswer && (
              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                <p className="text-lg font-police-body text-gray-700 dark:text-gray-300">
                  <strong>RESPOSTA CORRETA:</strong> {card.answer}
                </p>
                {userAnswer.toLowerCase() === card.answer.toLowerCase() && (
                  <p className="text-accent-500 font-police-body font-semibold mt-2">
                    ✅ CORRETO!
                  </p>
                )}
              </div>
            )}
          </div>
        );

      case 'image_occlusion':
        const currentOcclusionIndex = card.currentOcclusion || 0;
        const occlusionArea = card.occlusionAreas?.[currentOcclusionIndex];
        
        return (
          <div className="text-center">
            <h3 className="text-lg font-police-subtitle font-bold text-gray-900 dark:text-white mb-4">
              OCLUSÃO DE IMAGEM - ÁREA {currentOcclusionIndex + 1} DE {card.occlusionAreas?.length || 0}
            </h3>
            <div className="relative inline-block">
              {card.image ? (
                <>
                  <img 
                    src={card.image} 
                    alt="Flashcard image" 
                    className="max-w-full h-auto rounded-lg"
                  />
                  {card.occlusionAreas?.map((area: any, index: number) => {
                    const isCurrentArea = index === currentOcclusionIndex;
                    const shouldShowAnswer = showAnswer && isCurrentArea;
                    
                    return (
                      <div
                        key={index}
                        style={{
                          position: 'absolute',
                          left: `${(area.x / 800) * 100}%`,
                          top: `${(area.y / 600) * 100}%`,
                          width: `${(area.width / 800) * 100}%`,
                          height: `${(area.height / 600) * 100}%`
                        }}
                        className={`${isCurrentArea ? 'ring-2 ring-accent-500 ring-offset-2' : ''}`}
                      >
                        {area.shape === 'rectangle' ? (
                          <div
                            className={`w-full h-full ${
                              shouldShowAnswer
                                ? 'bg-transparent border-2 border-accent-500'
                                : isCurrentArea
                                ? 'bg-gray-800 dark:bg-gray-900'
                                : 'bg-gray-600 dark:bg-gray-700 opacity-50'
                            }`}
                          />
                        ) : (
                          <div
                            className={`w-full h-full rounded-full ${
                              shouldShowAnswer
                                ? 'bg-transparent border-2 border-accent-500'
                                : isCurrentArea
                                ? 'bg-gray-800 dark:bg-gray-900'
                                : 'bg-gray-600 dark:bg-gray-700 opacity-50'
                            }`}
                          />
                        )}
                        
                        {shouldShowAnswer && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="bg-accent-500 text-black px-2 py-1 rounded font-police-body font-semibold text-sm uppercase">
                              {area.answer}
                            </span>
                          </div>
                        )}
                        
                        {!showAnswer && !isCurrentArea && (
                          <div className="absolute top-1 left-1 bg-gray-900/80 text-white px-1.5 py-0.5 rounded text-xs font-police-numbers">
                            {index + 1}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </>
              ) : (
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-8">
                  <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 dark:text-gray-400 font-police-body">
                    IMAGEM NÃO ENCONTRADA
                  </p>
                </div>
              )}
            </div>
            {showAnswer && card.extra && (
              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                <p className="text-sm font-police-body text-gray-700 dark:text-gray-300">
                  {card.extra}
                </p>
              </div>
            )}
          </div>
        );

      default:
        return (
          <div className="text-center">
            <h3 className="text-2xl font-police-subtitle font-bold text-gray-900 dark:text-white mb-6">
              {card.front || card.question || 'CARTÃO NÃO DEFINIDO'}
            </h3>
          </div>
        );
    }
  };

  const nextCard = () => {
    if (currentCardIndex < filteredCards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setShowAnswer(false);
    }
  };

  const prevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setShowAnswer(false);
    }
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
            <h1 className="text-2xl font-police-title font-bold uppercase tracking-wider text-gray-900 dark:text-white">
              {mockDeck.title}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 font-police-subtitle uppercase tracking-wider">
              GERENCIAMENTO DE CARTÕES OPERACIONAIS
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setPreviewMode(!previewMode)}
            className="gap-2 font-police-body uppercase tracking-wider border-gray-300 dark:border-gray-600 hover:border-accent-500 dark:hover:border-accent-500 transition-colors"
          >
            <Eye className="w-4 h-4" />
            {previewMode ? 'SAIR DA PRÉVIA' : 'VISUALIZAR'}
          </Button>
          <Button 
            onClick={() => setShowNewCardForm(true)} 
            className="gap-2 bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black font-police-body font-semibold uppercase tracking-wider transition-colors"
          >
            <Plus className="w-4 h-4" />
            NOVO CARTÃO
          </Button>
        </div>
      </motion.div>

      {/* Deck Stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-police-body font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  TOTAL DE CARTÕES
                </p>
                <p className="text-2xl font-police-numbers font-bold text-gray-900 dark:text-white">
                  {cards.length}
                </p>
              </div>
              <BookOpen className="w-8 h-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-police-body font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  CARTÕES REVISADOS
                </p>
                <p className="text-2xl font-police-numbers font-bold text-gray-900 dark:text-white">
                  {cards.filter(c => c.reviews > 0).length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-accent-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-police-body font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  TAXA DE ACERTO
                </p>
                <p className="text-2xl font-police-numbers font-bold text-gray-900 dark:text-white">
                  {cards.length > 0 
                    ? Math.round(
                        cards.reduce((acc, card) => acc + getSuccessRate(card.reviews, card.correctCount), 0) / 
                        cards.filter(c => c.reviews > 0).length || 0
                      )
                    : 0}%
                </p>
              </div>
              <Target className="w-8 h-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-police-body font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  DIFICULDADE
                </p>
                <Badge className={`${getDifficultyColor(mockDeck.difficulty)} font-police-body font-semibold uppercase tracking-wider`}>
                  {getDifficultyLabel(mockDeck.difficulty)}
                </Badge>
              </div>
              <Brain className="w-8 h-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Preview Mode */}
      <AnimatePresence>
        {previewMode && filteredCards.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700">
              <CardHeader className="border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <CardTitle className="font-police-title uppercase tracking-wider text-gray-900 dark:text-white">
                    MODO VISUALIZAÇÃO
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <span className="font-police-numbers text-sm text-gray-600 dark:text-gray-400">
                      {currentCardIndex + 1} / {filteredCards.length}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="min-h-[300px] flex flex-col items-center justify-center">
                  <div className="w-full max-w-3xl">
                    <div className="mb-4 text-center">
                      <Badge className="bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300 font-police-body font-semibold uppercase tracking-wider">
                        {getCardTypeLabel(filteredCards[currentCardIndex].type)}
                      </Badge>
                    </div>
                    
                    {renderCardPreview(filteredCards[currentCardIndex])}

                    <div className="mt-8 flex items-center justify-center gap-4">
                      <Button
                        variant="outline"
                        onClick={prevCard}
                        disabled={currentCardIndex === 0}
                        className="gap-2 font-police-body uppercase tracking-wider border-gray-300 dark:border-gray-600 hover:border-accent-500 dark:hover:border-accent-500 transition-colors disabled:opacity-50"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        ANTERIOR
                      </Button>
                      
                      <Button
                        onClick={() => setShowAnswer(!showAnswer)}
                        className="gap-2 bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black font-police-body font-semibold uppercase tracking-wider transition-colors"
                      >
                        {showAnswer ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        {showAnswer ? 'OCULTAR' : 'MOSTRAR'} RESPOSTA
                      </Button>
                      
                      <Button
                        variant="outline"
                        onClick={nextCard}
                        disabled={currentCardIndex === filteredCards.length - 1}
                        className="gap-2 font-police-body uppercase tracking-wider border-gray-300 dark:border-gray-600 hover:border-accent-500 dark:hover:border-accent-500 transition-colors disabled:opacity-50"
                      >
                        PRÓXIMO
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters */}
      {!previewMode && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="BUSCAR CARTÕES..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body placeholder:font-police-body placeholder:uppercase placeholder:tracking-wider focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                  />
                </div>
                
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body uppercase tracking-wider focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                >
                  <option value="all">TODAS DIFICULDADES</option>
                  <option value="easy">FÁCIL</option>
                  <option value="medium">MÉDIO</option>
                  <option value="hard">DIFÍCIL</option>
                </select>
                
                <Button
                  variant="outline"
                  onClick={() => setShowBulkActions(!showBulkActions)}
                  className="gap-2 font-police-body uppercase tracking-wider border-gray-300 dark:border-gray-600 hover:border-accent-500 dark:hover:border-accent-500 transition-colors"
                >
                  <Filter className="w-4 h-4" />
                  AÇÕES EM LOTE
                </Button>
              </div>

              {/* Bulk Actions */}
              <AnimatePresence>
                {showBulkActions && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mt-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedCards.length === filteredCards.length}
                          onChange={handleSelectAll}
                          className="rounded border-gray-300 text-accent-500 focus:ring-accent-500"
                        />
                        <span className="text-sm text-gray-900 dark:text-white font-police-body font-medium uppercase tracking-wider">
                          SELECIONAR TODOS ({selectedCards.length})
                        </span>
                      </label>
                      
                      {selectedCards.length > 0 && (
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={handleBulkDelete}
                            className="gap-1 font-police-body uppercase tracking-wider border-gray-300 dark:border-gray-600 hover:border-gray-600 dark:hover:border-gray-500 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                            EXCLUIR
                          </Button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Cards List */}
      {!previewMode && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          {filteredCards.map((card) => (
            <Card key={card.id} className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700">
              <CardContent className="p-6">
                {editingCard === card.id ? (
                  // Edit Mode
                  <div className="space-y-4">
                    <textarea
                      rows={2}
                      defaultValue={card.front}
                      placeholder="FRENTE DO CARTÃO"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body placeholder:uppercase placeholder:tracking-wider focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                      id={`front-${card.id}`}
                    />
                    <textarea
                      rows={3}
                      defaultValue={card.back}
                      placeholder="VERSO DO CARTÃO"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body placeholder:uppercase placeholder:tracking-wider focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                      id={`back-${card.id}`}
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingCard(null)}
                        className="gap-1 font-police-body uppercase tracking-wider border-gray-300 dark:border-gray-600 hover:border-gray-500 dark:hover:border-gray-500 transition-colors"
                      >
                        <X className="w-3 h-3" />
                        CANCELAR
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => {
                          const front = (document.getElementById(`front-${card.id}`) as HTMLTextAreaElement).value;
                          const back = (document.getElementById(`back-${card.id}`) as HTMLTextAreaElement).value;
                          handleUpdateCard(card.id, { front, back });
                        }}
                        className="gap-1 bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black font-police-body font-semibold uppercase tracking-wider transition-colors"
                      >
                        <Save className="w-3 h-3" />
                        SALVAR
                      </Button>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <div className="flex items-start gap-4">
                    {showBulkActions && (
                      <input
                        type="checkbox"
                        checked={selectedCards.includes(card.id)}
                        onChange={() => handleSelectCard(card.id)}
                        className="mt-1 rounded border-gray-300 text-accent-500 focus:ring-accent-500"
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-xs font-police-body uppercase tracking-wider border-gray-300 dark:border-gray-600">
                              {getCardTypeLabel(card.type)}
                            </Badge>
                          </div>
                          <h4 className="font-police-subtitle font-semibold text-gray-900 dark:text-white mb-2">
                            {card.type === 'basic' || card.type === 'basic_reversed' ? card.front :
                             card.type === 'multiple_choice' ? card.question :
                             card.type === 'true_false' ? card.statement :
                             card.type === 'type_answer' ? card.question :
                             card.type === 'cloze' ? card.text.replace(/{{c\d+::(.*?)}}/g, '[$1]') :
                             card.type === 'image_occlusion' ? `Imagem com ${card.occlusionAreas?.length || 0} áreas de oclusão` :
                             'CARTÃO NÃO DEFINIDO'}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 font-police-body whitespace-pre-line">
                            {card.type === 'basic' || card.type === 'basic_reversed' ? card.back :
                             card.type === 'multiple_choice' ? `A) ${card.options[0]} B) ${card.options[1]}...` :
                             card.type === 'true_false' ? `Resposta: ${card.answer ? 'VERDADEIRO' : 'FALSO'}` :
                             card.type === 'type_answer' ? `Resposta: ${card.answer}` :
                             card.type === 'cloze' ? card.extra || 'Exercício de lacunas' :
                             card.type === 'image_occlusion' ? card.extra || 'Exercício de oclusão de imagem' :
                             ''}
                          </p>
                          <div className="flex items-center gap-4 mt-3">
                            <Badge className={`${getDifficultyColor(card.difficulty)} font-police-body font-semibold uppercase tracking-wider`}>
                              {getDifficultyLabel(card.difficulty)}
                            </Badge>
                            {card.reviews > 0 && (
                              <span className="text-sm text-gray-500 dark:text-gray-400 font-police-numbers">
                                {getSuccessRate(card.reviews, card.correctCount)}% ACERTO ({card.reviews} REVISÕES)
                              </span>
                            )}
                            {card.tags.length > 0 && (
                              <div className="flex items-center gap-1">
                                {card.tags.map((tag, index) => (
                                  <Badge key={index} variant="outline" className="text-xs font-police-body uppercase tracking-wider border-gray-300 dark:border-gray-600">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 ml-4">
                          <button
                            onClick={() => setEditingCard(card.id)}
                            className="p-1.5 text-gray-600 hover:text-accent-500 dark:text-gray-400 dark:hover:text-accent-500 transition-colors"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDuplicateCard(card.id)}
                            className="p-1.5 text-gray-600 hover:text-accent-500 dark:text-gray-400 dark:hover:text-accent-500 transition-colors"
                            title="Duplicar"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteCard(card.id)}
                            className="p-1.5 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </motion.div>
      )}

      {/* Empty State */}
      {!previewMode && filteredCards.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-police-subtitle font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-2">
            NENHUM CARTÃO ENCONTRADO
          </h3>
          <p className="text-gray-600 dark:text-gray-400 font-police-body mb-6">
            Crie seu primeiro cartão para este baralho
          </p>
          <Button 
            onClick={() => setShowNewCardForm(true)}
            className="gap-2 bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black font-police-body font-semibold uppercase tracking-wider transition-colors"
          >
            <Plus className="w-4 h-4" />
            CRIAR CARTÃO
          </Button>
        </motion.div>
      )}

      {/* New Card Modal */}
      <AnimatePresence>
        {showNewCardForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowNewCardForm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-lg p-6 max-w-2xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-police-title font-bold uppercase tracking-wider text-gray-900 dark:text-white mb-6">
                NOVO CARTÃO TÁTICO
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                    TIPO DE CARTÃO
                  </label>
                  <select
                    value={newCard.type}
                    onChange={(e) => setNewCard({ ...newCard, type: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body uppercase tracking-wider focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                  >
                    {cardTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-gray-600 dark:text-gray-400 font-police-body">
                    {cardTypes.find(t => t.value === newCard.type)?.description}
                  </p>
                </div>

                {/* Basic Type Fields */}
                {(newCard.type === 'basic' || newCard.type === 'basic_reversed') && (
                  <>
                    <div>
                      <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                        FRENTE DO CARTÃO
                      </label>
                      <textarea
                        rows={2}
                        value={newCard.front}
                        onChange={(e) => setNewCard({ ...newCard, front: e.target.value })}
                        placeholder="DIGITE A PERGUNTA OU CONCEITO..."
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body placeholder:uppercase placeholder:tracking-wider focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                        VERSO DO CARTÃO
                      </label>
                      <textarea
                        rows={3}
                        value={newCard.back}
                        onChange={(e) => setNewCard({ ...newCard, back: e.target.value })}
                        placeholder="DIGITE A RESPOSTA OU DEFINIÇÃO..."
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body placeholder:uppercase placeholder:tracking-wider focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                      />
                    </div>

                    {newCard.type === 'basic_reversed' && (
                      <div>
                        <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                          INFORMAÇÃO EXTRA
                        </label>
                        <textarea
                          rows={2}
                          value={newCard.extra}
                          onChange={(e) => setNewCard({ ...newCard, extra: e.target.value })}
                          placeholder="INFORMAÇÕES ADICIONAIS..."
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body placeholder:uppercase placeholder:tracking-wider focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                        />
                      </div>
                    )}
                  </>
                )}

                {/* Cloze Type Fields */}
                {newCard.type === 'cloze' && (
                  <>
                    <div>
                      <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                        TEXTO COM LACUNAS
                      </label>
                      <textarea
                        rows={4}
                        value={newCard.text}
                        onChange={(e) => setNewCard({ ...newCard, text: e.target.value })}
                        placeholder="USE {c1::PALAVRA} PARA CRIAR LACUNAS..."
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body placeholder:uppercase placeholder:tracking-wider focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                      />
                      <p className="mt-1 text-xs text-gray-600 dark:text-gray-400 font-police-body">
                        EXEMPLO: O crime de {`{{c1::deserção}}`} tem pena de {`{{c2::6 meses a 2 anos}}`}
                      </p>
                    </div>
                  </>
                )}

                {/* Multiple Choice Type Fields */}
                {newCard.type === 'multiple_choice' && (
                  <>
                    <div>
                      <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                        PERGUNTA
                      </label>
                      <textarea
                        rows={2}
                        value={newCard.question}
                        onChange={(e) => setNewCard({ ...newCard, question: e.target.value })}
                        placeholder="DIGITE A PERGUNTA..."
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body placeholder:uppercase placeholder:tracking-wider focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                        ALTERNATIVAS
                      </label>
                      {newCard.options.map((option, index) => (
                        <div key={index} className="flex items-center gap-2 mb-2">
                          <input
                            type="radio"
                            name="correct_option"
                            checked={newCard.correct === index}
                            onChange={() => setNewCard({ ...newCard, correct: index })}
                            className="text-accent-500 focus:ring-accent-500"
                          />
                          <span className="font-police-subtitle font-bold text-gray-900 dark:text-white">
                            {String.fromCharCode(65 + index)})
                          </span>
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => {
                              const newOptions = [...newCard.options];
                              newOptions[index] = e.target.value;
                              setNewCard({ ...newCard, options: newOptions });
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
                        value={newCard.explanation}
                        onChange={(e) => setNewCard({ ...newCard, explanation: e.target.value })}
                        placeholder="EXPLIQUE A RESPOSTA CORRETA..."
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body placeholder:uppercase placeholder:tracking-wider focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </>
                )}

                {/* True/False Type Fields */}
                {newCard.type === 'true_false' && (
                  <>
                    <div>
                      <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                        AFIRMAÇÃO
                      </label>
                      <textarea
                        rows={2}
                        value={newCard.statement}
                        onChange={(e) => setNewCard({ ...newCard, statement: e.target.value })}
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
                            checked={newCard.answer === true}
                            onChange={() => setNewCard({ ...newCard, answer: true })}
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
                            checked={newCard.answer === false}
                            onChange={() => setNewCard({ ...newCard, answer: false })}
                            className="text-accent-500 focus:ring-accent-500"
                          />
                          <span className="font-police-body text-gray-900 dark:text-white uppercase tracking-wider">
                            FALSO
                          </span>
                        </label>
                      </div>
                    </div>
                  </>
                )}

                {/* Type Answer Fields */}
                {newCard.type === 'type_answer' && (
                  <>
                    <div>
                      <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                        PERGUNTA
                      </label>
                      <textarea
                        rows={2}
                        value={newCard.question}
                        onChange={(e) => setNewCard({ ...newCard, question: e.target.value })}
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
                          value={newCard.answer}
                          onChange={(e) => setNewCard({ ...newCard, answer: e.target.value })}
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
                          value={newCard.hint}
                          onChange={(e) => setNewCard({ ...newCard, hint: e.target.value })}
                          placeholder="DICA PARA O USUÁRIO"
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body placeholder:uppercase placeholder:tracking-wider focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Image Occlusion Fields */}
                {newCard.type === 'image_occlusion' && (
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
                        {newCard.image ? 'EDITAR' : 'CRIAR'} OCLUSÃO DE IMAGEM
                      </Button>
                      {newCard.image && newCard.occlusionAreas.length > 0 && (
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 font-police-body">
                          ✅ {newCard.occlusionAreas.length} ÁREAS DE OCLUSÃO CONFIGURADAS
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                        INFORMAÇÃO EXTRA (OPCIONAL)
                      </label>
                      <textarea
                        rows={2}
                        value={newCard.extra}
                        onChange={(e) => setNewCard({ ...newCard, extra: e.target.value })}
                        placeholder="CONTEXTO OU EXPLICAÇÃO ADICIONAL..."
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body placeholder:uppercase placeholder:tracking-wider focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </>
                )}

                {/* Common Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                      DIFICULDADE
                    </label>
                    <select
                      value={newCard.difficulty}
                      onChange={(e) => setNewCard({ ...newCard, difficulty: e.target.value })}
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
                      value={newCard.tags}
                      onChange={(e) => setNewCard({ ...newCard, tags: e.target.value })}
                      placeholder="EX: CPM, ART. 9º"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body placeholder:uppercase placeholder:tracking-wider focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {/* Extra field for applicable types */}
                {(newCard.type === 'cloze' || newCard.type === 'multiple_choice' || newCard.type === 'true_false') && (
                  <div>
                    <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                      INFORMAÇÃO EXTRA (OPCIONAL)
                    </label>
                    <textarea
                      rows={2}
                      value={newCard.extra}
                      onChange={(e) => setNewCard({ ...newCard, extra: e.target.value })}
                      placeholder="INFORMAÇÕES COMPLEMENTARES..."
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body placeholder:uppercase placeholder:tracking-wider focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                    />
                  </div>
                )}
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowNewCardForm(false)}
                  className="gap-2 font-police-body uppercase tracking-wider border-gray-300 dark:border-gray-600 hover:border-gray-500 dark:hover:border-gray-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                  CANCELAR
                </Button>
                <Button
                  onClick={handleSaveNewCard}
                  className="gap-2 bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black font-police-body font-semibold uppercase tracking-wider transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  CRIAR CARTÃO
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Image Occlusion Editor Modal */}
      <AnimatePresence>
        {showImageOcclusionEditor && (
          <ImageOcclusionEditor
            imageUrl={newCard.image}
            occlusionAreas={newCard.occlusionAreas}
            onSave={(imageUrl, areas) => {
              setNewCard({ ...newCard, image: imageUrl, occlusionAreas: areas });
              setShowImageOcclusionEditor(false);
              toast.success('Oclusão de imagem configurada', { icon: '🖼️' });
            }}
            onCancel={() => setShowImageOcclusionEditor(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}