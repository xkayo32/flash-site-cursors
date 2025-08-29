import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  CheckCircle,
  XCircle,
  Target,
  Brain,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import ImageOcclusionPreview from './ImageOcclusionPreview';

interface FlashcardStudyModalProps {
  cards: any[];
  initialCardIndex?: number;
  onClose: () => void;
  onComplete?: (results: any) => void;
}

export default function FlashcardStudyModal({
  cards,
  initialCardIndex = 0,
  onClose,
  onComplete
}: FlashcardStudyModalProps) {
  const [currentCardIndex, setCurrentCardIndex] = useState(initialCardIndex);
  const [showAnswer, setShowAnswer] = useState(false);
  const [studyResults, setStudyResults] = useState<{ [key: number]: boolean }>({});
  const [startTime] = useState(Date.now());

  // Verificar se há cards disponíveis
  if (!cards || cards.length === 0) {
    return null;
  }

  const currentCard = cards[currentCardIndex];
  const totalCards = cards.length;
  const progress = ((currentCardIndex + 1) / totalCards) * 100;

  const handleNextCard = () => {
    if (currentCardIndex < totalCards - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setShowAnswer(false);
    } else {
      // Estudo concluído
      const endTime = Date.now();
      const duration = endTime - startTime;
      const correct = Object.values(studyResults).filter(Boolean).length;
      const results = {
        totalCards,
        correct,
        incorrect: totalCards - correct,
        accuracy: Math.round((correct / totalCards) * 100),
        duration,
        timestamp: endTime
      };
      onComplete?.(results);
      onClose();
    }
  };

  const handlePreviousCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setShowAnswer(false);
    }
  };

  const handleAnswer = (correct: boolean) => {
    setStudyResults({ ...studyResults, [currentCard.id]: correct });
    setTimeout(() => {
      handleNextCard();
    }, 1000);
  };

  const renderCardContent = () => {
    switch (currentCard.type) {
      case 'basic':
      case 'basic_reversed':
        return (
          <div className="text-center">
            <h3 className="text-lg font-police-subtitle font-bold text-gray-900 dark:text-white mb-4">
              {showAnswer ? 'RESPOSTA' : 'PERGUNTA'}
            </h3>
            <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 mb-4">
              <p className="text-gray-900 dark:text-white font-police-body text-lg">
                {showAnswer ? currentCard.back : currentCard.front}
              </p>
            </div>
            {showAnswer && currentCard.extra && (
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-yellow-800 dark:text-yellow-200 font-police-body text-sm">
                  {currentCard.extra}
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
                {currentCard.question}
              </p>
              <div className="space-y-2">
                {currentCard.options.map((option: string, index: number) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border transition-colors ${
                      showAnswer && index === currentCard.correct
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
            {showAnswer && currentCard.explanation && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-blue-800 dark:text-blue-200 font-police-body text-sm">
                  <strong>EXPLICAÇÃO:</strong> {currentCard.explanation}
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
                {currentCard.statement}
              </p>
              {showAnswer && (
                <div className={`p-3 rounded-lg ${
                  currentCard.answer
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                    : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
                }`}>
                  <p className="font-police-body font-bold uppercase">
                    {currentCard.answer ? 'VERDADEIRO' : 'FALSO'}
                  </p>
                </div>
              )}
            </div>
            {showAnswer && currentCard.explanation && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-blue-800 dark:text-blue-200 font-police-body text-sm">
                  <strong>EXPLICAÇÃO:</strong> {currentCard.explanation}
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
                  ? currentCard.text.replace(/{{c\d+::(.*?)}}/g, '$1')
                  : currentCard.text.replace(/{{c\d+::(.*?)}}/g, '___')
                }
              </p>
            </div>
            {showAnswer && currentCard.extra && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-blue-800 dark:text-blue-200 font-police-body text-sm">
                  {currentCard.extra}
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
                {currentCard.question}
              </p>
              {showAnswer && (
                <div className="p-3 bg-green-100 dark:bg-green-900/30 border border-green-500 rounded-lg">
                  <p className="text-green-800 dark:text-green-200 font-police-body font-bold">
                    RESPOSTA: {currentCard.answer}
                  </p>
                </div>
              )}
              {currentCard.hint && !showAnswer && (
                <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-500 rounded-lg mt-2">
                  <p className="text-yellow-800 dark:text-yellow-200 font-police-body text-sm">
                    💡 DICA: {currentCard.hint}
                  </p>
                </div>
              )}
            </div>
          </div>
        );

      case 'image_occlusion':
        return (
          <ImageOcclusionPreview
            imageUrl={currentCard.image}
            occlusionAreas={currentCard.occlusionAreas}
            extra={currentCard.extra}
          />
        );

      default:
        return (
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400 font-police-body">
              Tipo de flashcard não suportado: {currentCard.type}
            </p>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h3 className="text-xl font-police-title font-bold uppercase tracking-wider text-gray-900 dark:text-white">
                SESSÃO DE ESTUDO
              </h3>
              <Badge className="bg-accent-500 text-black font-police-body font-semibold uppercase tracking-wider">
                {currentCardIndex + 1} DE {totalCards}
              </Badge>
            </div>
            <button
              onClick={onClose}
              className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-police-body text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                PROGRESSO
              </span>
              <span className="text-sm font-police-numbers text-gray-600 dark:text-gray-400">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-accent-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          {renderCardContent()}
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handlePreviousCard}
              disabled={currentCardIndex === 0}
              className="gap-2 font-police-body uppercase tracking-wider border-gray-300 dark:border-gray-600 hover:border-accent-500 dark:hover:border-accent-500 transition-colors disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" />
              ANTERIOR
            </Button>
            
            <div className="flex items-center gap-3">
              {currentCard.type !== 'image_occlusion' && (
                <Button
                  onClick={() => setShowAnswer(!showAnswer)}
                  className="gap-2 bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black font-police-body font-semibold uppercase tracking-wider transition-colors"
                >
                  {showAnswer ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  {showAnswer ? 'OCULTAR' : 'MOSTRAR'} RESPOSTA
                </Button>
              )}
              
              {showAnswer && (
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => handleAnswer(false)}
                    variant="outline"
                    className="gap-2 font-police-body uppercase tracking-wider border-red-300 dark:border-red-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                    ERREI
                  </Button>
                  <Button
                    onClick={() => handleAnswer(true)}
                    variant="outline"
                    className="gap-2 font-police-body uppercase tracking-wider border-green-300 dark:border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" />
                    ACERTEI
                  </Button>
                </div>
              )}
            </div>
            
            <Button
              onClick={handleNextCard}
              className="gap-2 bg-gray-700 hover:bg-gray-800 text-white font-police-body font-semibold uppercase tracking-wider transition-colors"
            >
              {currentCardIndex < totalCards - 1 ? 'PRÓXIMO' : 'FINALIZAR'}
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}