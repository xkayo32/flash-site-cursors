import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  X,
  Eye,
  EyeOff,
  Edit,
  Copy,
  Play,
  Trash2,
  Tag,
  Calendar,
  Target,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import ImageOcclusionPreview from './ImageOcclusionPreview';

interface FlashcardPreviewModalProps {
  card: any;
  onClose: () => void;
  onEdit?: (cardId: number) => void;
  onDuplicate?: (cardId: number) => void;
  onStudy?: (cardId: number) => void;
  onDelete?: (cardId: number) => void;
}

export default function FlashcardPreviewModal({
  card,
  onClose,
  onEdit,
  onDuplicate,
  onStudy,
  onDelete
}: FlashcardPreviewModalProps) {
  const [showAnswer, setShowAnswer] = useState(false);

  const getDifficultyBadge = (difficulty: string) => {
    const config = {
      easy: { label: 'FÁCIL', color: 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300' },
      medium: { label: 'MÉDIO', color: 'bg-gray-300 text-gray-900 dark:bg-gray-600 dark:text-gray-200' },
      hard: { label: 'DIFÍCIL', color: 'bg-gray-500 text-white dark:bg-gray-400 dark:text-gray-900' }
    };
    
    const diffConfig = config[difficulty as keyof typeof config];
    return (
      <Badge className={`${diffConfig.color} font-police-body font-semibold uppercase tracking-wider`}>
        {diffConfig.label}
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    const config = {
      basic: { label: 'BÁSICO', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' },
      basic_reversed: { label: 'INVERTIDO', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300' },
      multiple_choice: { label: 'MÚLTIPLA ESCOLHA', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' },
      true_false: { label: 'VERDADEIRO/FALSO', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' },
      cloze: { label: 'LACUNAS', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300' },
      type_answer: { label: 'DIGITE A RESPOSTA', color: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300' },
      image_occlusion: { label: 'OCLUSÃO DE IMAGEM', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300' }
    };
    
    const typeConfig = config[type as keyof typeof config];
    return (
      <Badge className={`${typeConfig.color} font-police-body font-semibold uppercase tracking-wider`}>
        {typeConfig.label}
      </Badge>
    );
  };

  const renderCardContent = () => {
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
                  card.answer
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                    : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
                }`}>
                  <p className="font-police-body font-bold uppercase">
                    {card.answer ? 'VERDADEIRO' : 'FALSO'}
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
            <ImageOcclusionPreview
              imageUrl={card.image}
              occlusionAreas={card.occlusionAreas}
              extra={card.extra}
            />
          </div>
        );

      default:
        return (
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400 font-police-body">
              Tipo de flashcard não suportado: {card.type}
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
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-police-title font-bold uppercase tracking-wider text-gray-900 dark:text-white">
                PREVIEW DO FLASHCARD
              </h3>
              {getTypeBadge(card.type)}
              {getDifficultyBadge(card.difficulty)}
            </div>
            <button
              onClick={onClose}
              className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          {renderCardContent()}
        </div>
        
        {/* Card Info */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Stats */}
            <div>
              <h4 className="text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                ESTATÍSTICAS
              </h4>
              <div className="space-y-1 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400 font-police-body">Revisões:</span>
                  <span className="font-police-numbers text-gray-900 dark:text-white">{card.reviews}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400 font-police-body">Acertos:</span>
                  <span className="font-police-numbers text-gray-900 dark:text-white">{card.correctCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400 font-police-body">Taxa:</span>
                  <span className="font-police-numbers text-gray-900 dark:text-white">
                    {card.reviews > 0 ? Math.round((card.correctCount / card.reviews) * 100) : 0}%
                  </span>
                </div>
              </div>
            </div>
            
            {/* Info */}
            <div>
              <h4 className="text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                INFORMAÇÕES
              </h4>
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-1">
                  <span className="text-gray-600 dark:text-gray-400 font-police-body">Autor:</span>
                  <span className="text-gray-900 dark:text-white font-police-body">{card.author}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-gray-500" />
                  <span className="text-gray-600 dark:text-gray-400 font-police-body">
                    {new Date(card.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                {card.nextReview && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-gray-500" />
                    <span className="text-gray-600 dark:text-gray-400 font-police-body">
                      Próxima: {new Date(card.nextReview).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Tags */}
            <div>
              <h4 className="text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                TAGS
              </h4>
              <div className="flex flex-wrap gap-1">
                {card.tags.map((tag: string, index: number) => (
                  <Badge key={index} variant="outline" className="text-xs font-police-body uppercase tracking-wider border-gray-300 dark:border-gray-600">
                    <Tag className="w-3 h-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {card.type !== 'image_occlusion' && (
                <Button
                  onClick={() => setShowAnswer(!showAnswer)}
                  variant="outline"
                  className="gap-2 font-police-body uppercase tracking-wider border-gray-300 dark:border-gray-600 hover:border-accent-500 dark:hover:border-accent-500 transition-colors"
                >
                  {showAnswer ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  {showAnswer ? 'OCULTAR' : 'MOSTRAR'} RESPOSTA
                </Button>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                onClick={() => onStudy?.(card.id)}
                className="gap-2 bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black font-police-body font-semibold uppercase tracking-wider transition-colors"
              >
                <Play className="w-4 h-4" />
                ESTUDAR
              </Button>
              
              <Button
                variant="outline"
                onClick={() => onEdit?.(card.id)}
                className="gap-2 font-police-body uppercase tracking-wider border-gray-300 dark:border-gray-600 hover:border-accent-500 dark:hover:border-accent-500 transition-colors"
              >
                <Edit className="w-4 h-4" />
                EDITAR
              </Button>
              
              <Button
                variant="outline"
                onClick={() => onDuplicate?.(card.id)}
                className="gap-2 font-police-body uppercase tracking-wider border-gray-300 dark:border-gray-600 hover:border-accent-500 dark:hover:border-accent-500 transition-colors"
              >
                <Copy className="w-4 h-4" />
                DUPLICAR
              </Button>
              
              <Button
                variant="outline"
                onClick={() => onDelete?.(card.id)}
                className="gap-2 font-police-body uppercase tracking-wider border-gray-300 dark:border-gray-600 hover:border-gray-600 dark:hover:border-gray-500 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                ARQUIVAR
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}