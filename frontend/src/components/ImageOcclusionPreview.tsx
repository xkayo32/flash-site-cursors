import { useState } from 'react';
import { ChevronLeft, ChevronRight, Eye, EyeOff, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface OcclusionArea {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  answer: string;
  shape: 'rectangle' | 'circle';
}

interface ImageOcclusionPreviewProps {
  imageUrl: string;
  occlusionAreas: OcclusionArea[];
  extra?: string;
  onComplete?: () => void;
}

export default function ImageOcclusionPreview({
  imageUrl,
  occlusionAreas,
  extra,
  onComplete
}: ImageOcclusionPreviewProps) {
  const [currentAreaIndex, setCurrentAreaIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [revealedAreas, setRevealedAreas] = useState<Set<number>>(new Set());
  const [showAllAnswers, setShowAllAnswers] = useState(false);
  
  const currentArea = occlusionAreas[currentAreaIndex];
  
  const handleNextArea = () => {
    if (currentAreaIndex < occlusionAreas.length - 1) {
      setCurrentAreaIndex(currentAreaIndex + 1);
      setShowAnswer(false);
    } else if (onComplete) {
      onComplete();
    }
  };
  
  const handlePreviousArea = () => {
    if (currentAreaIndex > 0) {
      setCurrentAreaIndex(currentAreaIndex - 1);
      setShowAnswer(false);
    }
  };
  
  const handleRevealAnswer = () => {
    setShowAnswer(true);
    setRevealedAreas(prev => new Set([...prev, currentAreaIndex]));
  };
  
  const handleReset = () => {
    setCurrentAreaIndex(0);
    setShowAnswer(false);
    setRevealedAreas(new Set());
    setShowAllAnswers(false);
  };
  
  const progress = ((revealedAreas.size) / occlusionAreas.length) * 100;
  
  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-police-body text-gray-600 dark:text-gray-400 uppercase tracking-wider">
            PROGRESSO: {revealedAreas.size} DE {occlusionAreas.length} ÁREAS
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
      
      {/* Current Area Info */}
      <div className="text-center mb-4">
        <h3 className="text-lg font-police-subtitle font-bold text-gray-900 dark:text-white mb-2">
          ÁREA {currentAreaIndex + 1} DE {occlusionAreas.length}
        </h3>
        {showAnswer && (
          <Badge className="bg-accent-500 text-black font-police-body font-semibold uppercase tracking-wider">
            {currentArea.answer}
          </Badge>
        )}
      </div>
      
      {/* Image with Occlusions */}
      <div className="relative inline-block mx-auto mb-6">
        <img
          src={imageUrl}
          alt="Flashcard with occlusions"
          className="max-w-full h-auto rounded-lg"
          style={{ maxHeight: '500px' }}
        />
        
        {occlusionAreas.map((area, index) => {
          const isCurrentArea = index === currentAreaIndex;
          const isRevealed = revealedAreas.has(index) || showAllAnswers;
          const shouldShowAnswer = (isCurrentArea && showAnswer) || (showAllAnswers && isRevealed);
          
          return (
            <div
              key={area.id}
              style={{
                position: 'absolute',
                left: `${(area.x / 800) * 100}%`,
                top: `${(area.y / 600) * 100}%`,
                width: `${(area.width / 800) * 100}%`,
                height: `${(area.height / 600) * 100}%`
              }}
              className={`transition-all duration-300 ${
                isCurrentArea ? 'ring-2 ring-accent-500 ring-offset-2 z-10' : ''
              }`}
            >
              {area.shape === 'rectangle' ? (
                <div
                  className={`w-full h-full transition-all duration-300 ${
                    shouldShowAnswer
                      ? 'bg-transparent border-2 border-accent-500'
                      : isRevealed && !showAllAnswers
                      ? 'bg-gray-600 dark:bg-gray-700 opacity-50'
                      : 'bg-gray-800 dark:bg-gray-900'
                  }`}
                />
              ) : (
                <div
                  className={`w-full h-full rounded-full transition-all duration-300 ${
                    shouldShowAnswer
                      ? 'bg-transparent border-2 border-accent-500'
                      : isRevealed && !showAllAnswers
                      ? 'bg-gray-600 dark:bg-gray-700 opacity-50'
                      : 'bg-gray-800 dark:bg-gray-900'
                  }`}
                />
              )}
              
              {shouldShowAnswer && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="bg-accent-500 text-black px-2 py-1 rounded font-police-body font-semibold text-sm uppercase shadow-lg">
                    {area.answer}
                  </span>
                </div>
              )}
              
              {!shouldShowAnswer && (
                <div className="absolute top-1 left-1 bg-gray-900/80 text-white px-1.5 py-0.5 rounded text-xs font-police-numbers">
                  {index + 1}
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Controls */}
      <div className="flex items-center justify-center gap-3 mb-4">
        <Button
          variant="outline"
          onClick={handlePreviousArea}
          disabled={currentAreaIndex === 0}
          className="gap-2 font-police-body uppercase tracking-wider border-gray-300 dark:border-gray-600 hover:border-accent-500 dark:hover:border-accent-500 transition-colors disabled:opacity-50"
        >
          <ChevronLeft className="w-4 h-4" />
          ANTERIOR
        </Button>
        
        <Button
          onClick={showAnswer ? handleNextArea : handleRevealAnswer}
          className="gap-2 bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black font-police-body font-semibold uppercase tracking-wider transition-colors"
        >
          {showAnswer ? (
            <>
              {currentAreaIndex < occlusionAreas.length - 1 ? 'PRÓXIMA' : 'CONCLUIR'}
              <ChevronRight className="w-4 h-4" />
            </>
          ) : (
            <>
              <Eye className="w-4 h-4" />
              MOSTRAR RESPOSTA
            </>
          )}
        </Button>
        
        <Button
          variant="outline"
          onClick={handleReset}
          className="gap-2 font-police-body uppercase tracking-wider border-gray-300 dark:border-gray-600 hover:border-accent-500 dark:hover:border-accent-500 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          REINICIAR
        </Button>
      </div>
      
      {/* Show All Toggle */}
      <div className="flex justify-center mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAllAnswers(!showAllAnswers)}
          className="gap-2 font-police-body uppercase tracking-wider border-gray-300 dark:border-gray-600 hover:border-accent-500 dark:hover:border-accent-500 transition-colors"
        >
          {showAllAnswers ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          {showAllAnswers ? 'OCULTAR TODAS' : 'MOSTRAR TODAS'}
        </Button>
      </div>
      
      {/* Extra Information */}
      {extra && (
        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-police-body text-gray-700 dark:text-gray-300 text-center">
            {extra}
          </p>
        </div>
      )}
    </div>
  );
}