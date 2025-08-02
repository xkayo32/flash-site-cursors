import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  Square,
  Circle,
  MousePointer,
  Trash2,
  Eye,
  EyeOff,
  Save,
  X,
  Move,
  Maximize2,
  Image as ImageIcon,
  Layers
} from 'lucide-react';
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

interface ImageOcclusionEditorProps {
  imageUrl?: string;
  occlusionAreas?: OcclusionArea[];
  onSave: (imageUrl: string, areas: OcclusionArea[]) => void;
  onCancel: () => void;
}

export default function ImageOcclusionEditor({
  imageUrl: initialImageUrl = '',
  occlusionAreas: initialAreas = [],
  onSave,
  onCancel
}: ImageOcclusionEditorProps) {
  const [imageUrl, setImageUrl] = useState(initialImageUrl);
  const [occlusionAreas, setOcclusionAreas] = useState<OcclusionArea[]>(initialAreas);
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingShape, setDrawingShape] = useState<'rectangle' | 'circle'>('rectangle');
  const [showAnswers, setShowAnswers] = useState(false);
  const [editingAnswerId, setEditingAnswerId] = useState<string | null>(null);
  const [draggedAreaId, setDraggedAreaId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizingAreaId, setResizingAreaId] = useState<string | null>(null);
  const [resizeHandle, setResizeHandle] = useState<string>('');
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });
  const [currentArea, setCurrentArea] = useState<OcclusionArea | null>(null);

  // Mock images para demonstração
  const mockImages = [
    {
      url: '/api/placeholder/800/600',
      name: 'hierarquia-militar.jpg',
      description: 'Hierarquia Militar do Exército Brasileiro'
    },
    {
      url: '/api/placeholder/800/500',
      name: 'codigo-penal-militar.jpg',
      description: 'Estrutura do Código Penal Militar'
    },
    {
      url: '/api/placeholder/700/900',
      name: 'mapa-tatico.jpg',
      description: 'Mapa Tático de Operações'
    }
  ];

  useEffect(() => {
    // Se não houver imagem inicial, usar uma imagem mock
    if (!initialImageUrl && mockImages.length > 0) {
      setImageUrl(mockImages[0].url);
    }
  }, []);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImageUrl(e.target?.result as string);
        // Reset areas when new image is uploaded
        setOcclusionAreas([]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current || draggedAreaId || resizingAreaId) return;
    
    const rect = imageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Check if clicking on an existing area
    const clickedArea = occlusionAreas.find(area => {
      if (area.shape === 'rectangle') {
        return x >= area.x && x <= area.x + area.width &&
               y >= area.y && y <= area.y + area.height;
      } else {
        const centerX = area.x + area.width / 2;
        const centerY = area.y + area.height / 2;
        const radius = area.width / 2;
        const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
        return distance <= radius;
      }
    });
    
    if (clickedArea) {
      setSelectedAreaId(clickedArea.id);
      setDraggedAreaId(clickedArea.id);
      setDragOffset({ x: x - clickedArea.x, y: y - clickedArea.y });
    } else {
      // Start drawing new area
      setIsDrawing(true);
      setStartPoint({ x, y });
      const newArea: OcclusionArea = {
        id: `area-${Date.now()}`,
        x,
        y,
        width: 0,
        height: 0,
        answer: '',
        shape: drawingShape
      };
      setCurrentArea(newArea);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current) return;
    
    const rect = imageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (isDrawing && currentArea) {
      const width = x - startPoint.x;
      const height = y - startPoint.y;
      
      setCurrentArea({
        ...currentArea,
        width: Math.abs(width),
        height: Math.abs(height),
        x: width < 0 ? x : startPoint.x,
        y: height < 0 ? y : startPoint.y
      });
    } else if (draggedAreaId) {
      const area = occlusionAreas.find(a => a.id === draggedAreaId);
      if (area) {
        const newX = x - dragOffset.x;
        const newY = y - dragOffset.y;
        
        // Keep within image bounds
        const maxX = imageRef.current.width - area.width;
        const maxY = imageRef.current.height - area.height;
        
        setOcclusionAreas(areas => areas.map(a => 
          a.id === draggedAreaId 
            ? { ...a, x: Math.max(0, Math.min(newX, maxX)), y: Math.max(0, Math.min(newY, maxY)) }
            : a
        ));
      }
    } else if (resizingAreaId) {
      const area = occlusionAreas.find(a => a.id === resizingAreaId);
      if (area) {
        let newArea = { ...area };
        
        switch (resizeHandle) {
          case 'se': // Bottom-right
            newArea.width = x - area.x;
            newArea.height = y - area.y;
            break;
          case 'sw': // Bottom-left
            newArea.x = x;
            newArea.width = area.x + area.width - x;
            newArea.height = y - area.y;
            break;
          case 'ne': // Top-right
            newArea.y = y;
            newArea.width = x - area.x;
            newArea.height = area.y + area.height - y;
            break;
          case 'nw': // Top-left
            newArea.x = x;
            newArea.y = y;
            newArea.width = area.x + area.width - x;
            newArea.height = area.y + area.height - y;
            break;
        }
        
        // Ensure minimum size
        newArea.width = Math.max(30, newArea.width);
        newArea.height = Math.max(30, newArea.height);
        
        setOcclusionAreas(areas => areas.map(a => 
          a.id === resizingAreaId ? newArea : a
        ));
      }
    }
  };

  const handleMouseUp = () => {
    if (isDrawing && currentArea && currentArea.width > 10 && currentArea.height > 10) {
      setOcclusionAreas([...occlusionAreas, currentArea]);
      setSelectedAreaId(currentArea.id);
      setEditingAnswerId(currentArea.id);
    }
    
    setIsDrawing(false);
    setCurrentArea(null);
    setDraggedAreaId(null);
    setResizingAreaId(null);
  };

  const handleDeleteArea = (id: string) => {
    setOcclusionAreas(areas => areas.filter(area => area.id !== id));
    if (selectedAreaId === id) {
      setSelectedAreaId(null);
    }
  };

  const handleUpdateAnswer = (id: string, answer: string) => {
    setOcclusionAreas(areas => areas.map(area => 
      area.id === id ? { ...area, answer } : area
    ));
  };

  const handleSave = () => {
    if (!imageUrl) {
      alert('Por favor, selecione uma imagem primeiro');
      return;
    }
    
    if (occlusionAreas.length === 0) {
      alert('Por favor, crie pelo menos uma área de oclusão');
      return;
    }
    
    const areasWithoutAnswers = occlusionAreas.filter(area => !area.answer.trim());
    if (areasWithoutAnswers.length > 0) {
      alert('Por favor, adicione respostas para todas as áreas de oclusão');
      return;
    }
    
    onSave(imageUrl, occlusionAreas);
  };

  const renderOcclusionArea = (area: OcclusionArea, isPreview: boolean = false) => {
    const isSelected = selectedAreaId === area.id;
    
    return (
      <div
        key={area.id}
        style={{
          position: 'absolute',
          left: area.x,
          top: area.y,
          width: area.width,
          height: area.height,
          cursor: draggedAreaId === area.id ? 'grabbing' : 'grab'
        }}
        className={`group ${isPreview ? '' : 'hover:opacity-90'}`}
      >
        {/* Occlusion shape */}
        {area.shape === 'rectangle' ? (
          <div
            className={`w-full h-full ${
              showAnswers 
                ? 'bg-transparent border-2 border-accent-500' 
                : 'bg-gray-800 dark:bg-gray-900'
            } ${isSelected ? 'ring-2 ring-accent-500 ring-offset-2' : ''}`}
          />
        ) : (
          <div
            className={`w-full h-full rounded-full ${
              showAnswers 
                ? 'bg-transparent border-2 border-accent-500' 
                : 'bg-gray-800 dark:bg-gray-900'
            } ${isSelected ? 'ring-2 ring-accent-500 ring-offset-2' : ''}`}
          />
        )}
        
        {/* Answer text */}
        {showAnswers && area.answer && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="bg-accent-500 text-black px-2 py-1 rounded font-police-body font-semibold text-sm uppercase">
              {area.answer}
            </span>
          </div>
        )}
        
        {/* Edit controls */}
        {!isPreview && isSelected && !showAnswers && (
          <>
            {/* Resize handles */}
            <div
              className="absolute -top-1 -left-1 w-3 h-3 bg-accent-500 cursor-nw-resize"
              onMouseDown={(e) => {
                e.stopPropagation();
                setResizingAreaId(area.id);
                setResizeHandle('nw');
              }}
            />
            <div
              className="absolute -top-1 -right-1 w-3 h-3 bg-accent-500 cursor-ne-resize"
              onMouseDown={(e) => {
                e.stopPropagation();
                setResizingAreaId(area.id);
                setResizeHandle('ne');
              }}
            />
            <div
              className="absolute -bottom-1 -left-1 w-3 h-3 bg-accent-500 cursor-sw-resize"
              onMouseDown={(e) => {
                e.stopPropagation();
                setResizingAreaId(area.id);
                setResizeHandle('sw');
              }}
            />
            <div
              className="absolute -bottom-1 -right-1 w-3 h-3 bg-accent-500 cursor-se-resize"
              onMouseDown={(e) => {
                e.stopPropagation();
                setResizingAreaId(area.id);
                setResizeHandle('se');
              }}
            />
            
            {/* Delete button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteArea(area.id);
              }}
              className="absolute -top-8 right-0 p-1 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </>
        )}
        
        {/* Area number */}
        {!showAnswers && (
          <div className="absolute top-1 left-1 bg-gray-900/80 text-white px-1.5 py-0.5 rounded text-xs font-police-numbers">
            {occlusionAreas.indexOf(area) + 1}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-police-title font-bold uppercase tracking-wider text-gray-900 dark:text-white">
              EDITOR DE OCLUSÃO DE IMAGEM
            </h3>
            <button
              onClick={onCancel}
              className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar */}
          <div className="w-80 border-r border-gray-200 dark:border-gray-700 p-4 overflow-y-auto">
            {/* Image Upload */}
            <div className="mb-6">
              <h4 className="text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wider">
                IMAGEM BASE
              </h4>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="w-full gap-2 font-police-body uppercase tracking-wider border-gray-300 dark:border-gray-600 hover:border-accent-500 dark:hover:border-accent-500 transition-colors"
              >
                <Upload className="w-4 h-4" />
                CARREGAR IMAGEM
              </Button>
              
              {/* Mock Images */}
              <div className="mt-3 space-y-2">
                <p className="text-xs text-gray-600 dark:text-gray-400 font-police-body uppercase">
                  IMAGENS DE EXEMPLO:
                </p>
                {mockImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setImageUrl(img.url)}
                    className={`w-full text-left p-2 rounded border ${
                      imageUrl === img.url 
                        ? 'border-accent-500 bg-accent-500/10' 
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    } transition-colors`}
                  >
                    <div className="flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      <span className="text-sm font-police-body text-gray-900 dark:text-white">
                        {img.name}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Drawing Tools */}
            <div className="mb-6">
              <h4 className="text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wider">
                FERRAMENTAS DE DESENHO
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={drawingShape === 'rectangle' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDrawingShape('rectangle')}
                  className={`gap-2 font-police-body uppercase tracking-wider ${
                    drawingShape === 'rectangle'
                      ? 'bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black'
                      : 'border-gray-300 dark:border-gray-600 hover:border-accent-500 dark:hover:border-accent-500'
                  } transition-colors`}
                >
                  <Square className="w-4 h-4" />
                  RETÂNGULO
                </Button>
                <Button
                  variant={drawingShape === 'circle' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDrawingShape('circle')}
                  className={`gap-2 font-police-body uppercase tracking-wider ${
                    drawingShape === 'circle'
                      ? 'bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black'
                      : 'border-gray-300 dark:border-gray-600 hover:border-accent-500 dark:hover:border-accent-500'
                  } transition-colors`}
                >
                  <Circle className="w-4 h-4" />
                  CÍRCULO
                </Button>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 font-police-body mt-2">
                CLIQUE E ARRASTE NA IMAGEM PARA CRIAR ÁREAS DE OCLUSÃO
              </p>
            </div>
            
            {/* Areas List */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  ÁREAS DE OCLUSÃO ({occlusionAreas.length})
                </h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAnswers(!showAnswers)}
                  className="gap-1 font-police-body uppercase tracking-wider border-gray-300 dark:border-gray-600 hover:border-accent-500 dark:hover:border-accent-500 transition-colors"
                >
                  {showAnswers ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  {showAnswers ? 'OCULTAR' : 'MOSTRAR'}
                </Button>
              </div>
              
              <div className="space-y-2">
                {occlusionAreas.map((area, index) => (
                  <div
                    key={area.id}
                    className={`p-3 rounded border ${
                      selectedAreaId === area.id
                        ? 'border-accent-500 bg-accent-500/10'
                        : 'border-gray-200 dark:border-gray-700'
                    } transition-colors cursor-pointer`}
                    onClick={() => setSelectedAreaId(area.id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-police-body font-semibold text-gray-900 dark:text-white">
                        ÁREA {index + 1}
                      </span>
                      <div className="flex items-center gap-1">
                        <Badge className="bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300 font-police-body text-xs uppercase">
                          {area.shape === 'rectangle' ? 'RETÂNGULO' : 'CÍRCULO'}
                        </Badge>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteArea(area.id);
                          }}
                          className="p-1 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    
                    {editingAnswerId === area.id ? (
                      <input
                        type="text"
                        value={area.answer}
                        onChange={(e) => handleUpdateAnswer(area.id, e.target.value)}
                        onBlur={() => setEditingAnswerId(null)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            setEditingAnswerId(null);
                          }
                        }}
                        placeholder="DIGITE A RESPOSTA..."
                        className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body placeholder:uppercase placeholder:tracking-wider focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                        autoFocus
                      />
                    ) : (
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingAnswerId(area.id);
                        }}
                        className="text-sm text-gray-700 dark:text-gray-300 font-police-body hover:text-accent-500 cursor-text"
                      >
                        {area.answer || (
                          <span className="text-gray-400 dark:text-gray-500 uppercase">
                            CLIQUE PARA ADICIONAR RESPOSTA
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Canvas Area */}
          <div className="flex-1 p-6 overflow-auto bg-gray-50 dark:bg-gray-900/50">
            <div 
              ref={canvasRef}
              className="relative inline-block"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              style={{ cursor: isDrawing ? 'crosshair' : 'default' }}
            >
              {imageUrl ? (
                <>
                  <img
                    ref={imageRef}
                    src={imageUrl}
                    alt="Base image"
                    className="max-w-full h-auto"
                    draggable={false}
                    style={{ userSelect: 'none' }}
                  />
                  
                  {/* Render existing areas */}
                  {occlusionAreas.map(area => renderOcclusionArea(area))}
                  
                  {/* Render current drawing area */}
                  {isDrawing && currentArea && renderOcclusionArea(currentArea)}
                </>
              ) : (
                <div className="w-full h-96 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400 font-police-body uppercase tracking-wider">
                      SELECIONE UMA IMAGEM PARA COMEÇAR
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Instructions */}
            {imageUrl && occlusionAreas.length === 0 && (
              <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-yellow-800 dark:text-yellow-200 font-police-body text-sm">
                  💡 INSTRUÇÕES: Clique e arraste sobre a imagem para criar áreas de oclusão. 
                  Depois, adicione uma resposta para cada área criada.
                </p>
              </div>
            )}
          </div>
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400 font-police-body">
              {occlusionAreas.length > 0 && (
                <span>
                  {occlusionAreas.filter(a => a.answer).length} DE {occlusionAreas.length} ÁREAS COM RESPOSTA
                </span>
              )}
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onCancel}
                className="gap-2 font-police-body uppercase tracking-wider border-gray-300 dark:border-gray-600 hover:border-gray-500 dark:hover:border-gray-500 transition-colors"
              >
                <X className="w-4 h-4" />
                CANCELAR
              </Button>
              <Button
                onClick={handleSave}
                disabled={occlusionAreas.length === 0 || occlusionAreas.some(a => !a.answer)}
                className="gap-2 bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black font-police-body font-semibold uppercase tracking-wider transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                SALVAR CARTÃO
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}