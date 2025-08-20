import React, { useState, useRef, useEffect } from 'react';
import { 
  Square, 
  Circle, 
  MousePointer,
  Trash2,
  Eye,
  EyeOff,
  Save,
  Undo2,
  Redo2,
  Copy,
  Layers,
  Palette,
  Edit
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import toast from 'react-hot-toast';

interface OcclusionShape {
  id: string;
  type: 'rect' | 'ellipse';
  x: number;
  y: number;
  width: number;
  height: number;
  label?: string;
  color?: string;
}

interface ImageOcclusionEditorProps {
  imageUrl: string;
  initialShapes?: OcclusionShape[];
  onChange?: (shapes: OcclusionShape[]) => void;
  onSave?: (shapes: OcclusionShape[], imageData: string) => void;
  mode?: 'edit' | 'study';
  revealedShapes?: Set<string>;
  onShapeClick?: (shapeId: string) => void;
}

export default function ImageOcclusionEditor({
  imageUrl,
  initialShapes = [],
  onChange,
  onSave,
  mode = 'edit',
  revealedShapes = new Set(),
  onShapeClick
}: ImageOcclusionEditorProps) {
  const [shapes, setShapes] = useState<OcclusionShape[]>(initialShapes);
  const [selectedTool, setSelectedTool] = useState<'select' | 'rect' | 'ellipse'>('select');
  const [selectedShape, setSelectedShape] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });
  const [currentShape, setCurrentShape] = useState<OcclusionShape | null>(null);
  const [showLabels, setShowLabels] = useState(true);
  const [occlusionColor, setOcclusionColor] = useState('#facc15');
  const [history, setHistory] = useState<OcclusionShape[][]>([initialShapes]);
  const [historyIndex, setHistoryIndex] = useState(0);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [scale, setScale] = useState(1);

  // Carregar imagem e ajustar canvas
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImageSize({ width: img.width, height: img.height });
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const newScale = Math.min(1, containerWidth / img.width);
        setScale(newScale);
      }
      drawCanvas();
    };
    img.src = imageUrl;
  }, [imageUrl]);

  // Redesenhar canvas quando shapes mudam
  useEffect(() => {
    drawCanvas();
  }, [shapes, selectedShape, currentShape, showLabels, revealedShapes]);

  // Desenhar no canvas
  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Limpar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Desenhar imagem
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Desenhar shapes
      [...shapes, currentShape].filter(Boolean).forEach(shape => {
        if (!shape) return;

        const isRevealed = mode === 'study' && revealedShapes.has(shape.id);
        const isSelected = shape.id === selectedShape;

        // Configurar estilo
        if (isRevealed) {
          ctx.fillStyle = 'rgba(34, 197, 94, 0.3)'; // Verde transparente
          ctx.strokeStyle = '#22c55e';
        } else {
          ctx.fillStyle = mode === 'study' 
            ? shape.color || occlusionColor 
            : `${shape.color || occlusionColor}88`; // Semi-transparente no modo edição
          ctx.strokeStyle = shape.color || occlusionColor;
        }
        
        ctx.lineWidth = isSelected ? 3 : 2;
        if (isSelected) {
          ctx.setLineDash([5, 5]);
        }

        // Desenhar forma
        const x = shape.x * scale;
        const y = shape.y * scale;
        const width = shape.width * scale;
        const height = shape.height * scale;

        if (shape.type === 'rect') {
          ctx.fillRect(x, y, width, height);
          ctx.strokeRect(x, y, width, height);
        } else if (shape.type === 'ellipse') {
          ctx.beginPath();
          ctx.ellipse(
            x + width / 2,
            y + height / 2,
            width / 2,
            height / 2,
            0,
            0,
            2 * Math.PI
          );
          ctx.fill();
          ctx.stroke();
        }

        ctx.setLineDash([]);

        // Desenhar label
        if (showLabels && shape.label && !isRevealed) {
          ctx.fillStyle = '#000000';
          ctx.font = `${14 * scale}px Arial`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          
          const labelX = x + width / 2;
          const labelY = y + height / 2;
          
          // Background do label
          const metrics = ctx.measureText(shape.label);
          const labelWidth = metrics.width + 10;
          const labelHeight = 20 * scale;
          
          ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
          ctx.fillRect(
            labelX - labelWidth / 2,
            labelY - labelHeight / 2,
            labelWidth,
            labelHeight
          );
          
          // Texto do label
          ctx.fillStyle = '#000000';
          ctx.fillText(shape.label, labelX, labelY);
        }
      });
    };
    img.src = imageUrl;
  };

  // Lidar com mouse down
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (mode === 'study') {
      // Modo estudo - clicar para revelar
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      
      const x = (e.clientX - rect.left) / scale;
      const y = (e.clientY - rect.top) / scale;
      
      // Verificar qual shape foi clicada
      for (const shape of shapes) {
        if (isPointInShape(x, y, shape)) {
          onShapeClick?.(shape.id);
          break;
        }
      }
      return;
    }

    // Modo edição
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;

    if (selectedTool === 'select') {
      // Selecionar shape existente
      let shapeFound = false;
      for (const shape of shapes) {
        if (isPointInShape(x, y, shape)) {
          setSelectedShape(shape.id);
          shapeFound = true;
          break;
        }
      }
      if (!shapeFound) {
        setSelectedShape(null);
      }
    } else {
      // Começar a desenhar nova shape
      setIsDrawing(true);
      setStartPoint({ x, y });
      const newShape: OcclusionShape = {
        id: `shape-${Date.now()}`,
        type: selectedTool,
        x,
        y,
        width: 0,
        height: 0,
        color: occlusionColor
      };
      setCurrentShape(newShape);
    }
  };

  // Lidar com mouse move
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentShape || mode === 'study') return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;

    const width = x - startPoint.x;
    const height = y - startPoint.y;

    setCurrentShape({
      ...currentShape,
      width: Math.abs(width),
      height: Math.abs(height),
      x: width < 0 ? x : startPoint.x,
      y: height < 0 ? y : startPoint.y
    });
  };

  // Lidar com mouse up
  const handleMouseUp = () => {
    if (!isDrawing || !currentShape || mode === 'study') return;

    if (currentShape.width > 10 && currentShape.height > 10) {
      const newShapes = [...shapes, currentShape];
      setShapes(newShapes);
      addToHistory(newShapes);
      onChange?.(newShapes);
      
      // Auto-adicionar label
      const label = prompt('Digite um rótulo para esta oclusão (opcional):');
      if (label) {
        const updatedShape = { ...currentShape, label };
        const updatedShapes = newShapes.map(s => 
          s.id === currentShape.id ? updatedShape : s
        );
        setShapes(updatedShapes);
        addToHistory(updatedShapes);
        onChange?.(updatedShapes);
      }
    }

    setIsDrawing(false);
    setCurrentShape(null);
  };

  // Verificar se ponto está dentro da shape
  const isPointInShape = (x: number, y: number, shape: OcclusionShape): boolean => {
    if (shape.type === 'rect') {
      return x >= shape.x && x <= shape.x + shape.width &&
             y >= shape.y && y <= shape.y + shape.height;
    } else if (shape.type === 'ellipse') {
      const cx = shape.x + shape.width / 2;
      const cy = shape.y + shape.height / 2;
      const rx = shape.width / 2;
      const ry = shape.height / 2;
      
      const dx = (x - cx) / rx;
      const dy = (y - cy) / ry;
      
      return dx * dx + dy * dy <= 1;
    }
    return false;
  };

  // Adicionar ao histórico
  const addToHistory = (newShapes: OcclusionShape[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newShapes);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  // Desfazer
  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setShapes(history[newIndex]);
      onChange?.(history[newIndex]);
    }
  };

  // Refazer
  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setShapes(history[newIndex]);
      onChange?.(history[newIndex]);
    }
  };

  // Deletar shape selecionada
  const deleteSelectedShape = () => {
    if (!selectedShape) return;
    
    const newShapes = shapes.filter(s => s.id !== selectedShape);
    setShapes(newShapes);
    addToHistory(newShapes);
    onChange?.(newShapes);
    setSelectedShape(null);
  };

  // Duplicar shape selecionada
  const duplicateSelectedShape = () => {
    if (!selectedShape) return;
    
    const shapeToDuplicate = shapes.find(s => s.id === selectedShape);
    if (!shapeToDuplicate) return;
    
    const newShape: OcclusionShape = {
      ...shapeToDuplicate,
      id: `shape-${Date.now()}`,
      x: shapeToDuplicate.x + 20,
      y: shapeToDuplicate.y + 20
    };
    
    const newShapes = [...shapes, newShape];
    setShapes(newShapes);
    addToHistory(newShapes);
    onChange?.(newShapes);
    setSelectedShape(newShape.id);
  };

  // Limpar todas as shapes
  const clearAll = () => {
    if (confirm('Limpar todas as oclusões?')) {
      setShapes([]);
      addToHistory([]);
      onChange?.([]);
      setSelectedShape(null);
    }
  };

  // Salvar
  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const imageData = canvas.toDataURL('image/png');
    onSave?.(shapes, imageData);
    toast.success(`${shapes.length} oclusões salvas!`);
  };

  if (mode === 'study') {
    return (
      <div className="relative">
        <canvas
          ref={canvasRef}
          className="border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer"
          onMouseDown={handleMouseDown}
        />
        
        {/* Contador de revelados */}
        <div className="absolute top-2 right-2 bg-black/70 text-white px-3 py-1 rounded-lg">
          <span className="font-police-numbers text-sm">
            {revealedShapes.size} / {shapes.length} revelados
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        {/* Ferramentas */}
        <div className="flex items-center gap-1 border-r pr-2 border-gray-300 dark:border-gray-600">
          <Button
            type="button"
            size="sm"
            variant={selectedTool === 'select' ? 'default' : 'ghost'}
            onClick={() => setSelectedTool('select')}
            title="Selecionar"
          >
            <MousePointer className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant={selectedTool === 'rect' ? 'default' : 'ghost'}
            onClick={() => setSelectedTool('rect')}
            title="Retângulo"
          >
            <Square className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant={selectedTool === 'ellipse' ? 'default' : 'ghost'}
            onClick={() => setSelectedTool('ellipse')}
            title="Elipse"
          >
            <Circle className="w-4 h-4" />
          </Button>
        </div>

        {/* Ações */}
        <div className="flex items-center gap-1 border-r pr-2 border-gray-300 dark:border-gray-600">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={undo}
            disabled={historyIndex === 0}
            title="Desfazer"
          >
            <Undo2 className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={redo}
            disabled={historyIndex === history.length - 1}
            title="Refazer"
          >
            <Redo2 className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={deleteSelectedShape}
            disabled={!selectedShape}
            title="Deletar"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={duplicateSelectedShape}
            disabled={!selectedShape}
            title="Duplicar"
          >
            <Copy className="w-4 h-4" />
          </Button>
        </div>

        {/* Opções */}
        <div className="flex items-center gap-1 border-r pr-2 border-gray-300 dark:border-gray-600">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => setShowLabels(!showLabels)}
            className={showLabels ? 'bg-gray-200 dark:bg-gray-700' : ''}
            title="Mostrar/Ocultar rótulos"
          >
            {showLabels ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </Button>
          <label className="flex items-center gap-1">
            <Palette className="w-4 h-4" />
            <input
              type="color"
              value={occlusionColor}
              onChange={(e) => setOcclusionColor(e.target.value)}
              className="w-8 h-8 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
              title="Cor da oclusão"
            />
          </label>
        </div>

        {/* Ações finais */}
        <div className="flex items-center gap-1 ml-auto">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={clearAll}
            className="text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20"
            title="Limpar tudo"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Limpar
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleSave}
            className="bg-accent-500 hover:bg-accent-600 text-black"
          >
            <Save className="w-4 h-4 mr-1" />
            Salvar ({shapes.length})
          </Button>
        </div>
      </div>

      {/* Canvas */}
      <div ref={containerRef} className="relative">
        <canvas
          ref={canvasRef}
          className="border border-gray-300 dark:border-gray-600 rounded-lg cursor-crosshair"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
        
        {/* Info */}
        <div className="absolute bottom-2 left-2 bg-black/70 text-white px-3 py-1 rounded-lg text-xs font-police-body">
          {selectedTool === 'select' ? 'Clique para selecionar' : `Desenhe ${selectedTool === 'rect' ? 'retângulos' : 'elipses'}`}
        </div>
        
        {/* Contador */}
        {shapes.length > 0 && (
          <div className="absolute bottom-2 right-2 bg-black/70 text-white px-3 py-1 rounded-lg">
            <span className="font-police-numbers text-sm">
              {shapes.length} oclusão(ões) = {shapes.length} card(s)
            </span>
          </div>
        )}
      </div>

      {/* Lista de shapes */}
      {shapes.length > 0 && (
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <h4 className="font-police-subtitle uppercase tracking-wider text-gray-700 dark:text-gray-300 text-sm font-semibold mb-3">
            OCLUSÕES CRIADAS
          </h4>
          <div className="space-y-2">
            {shapes.map((shape, index) => (
              <div
                key={shape.id}
                className={`flex items-center justify-between p-2 rounded-lg border ${
                  selectedShape === shape.id
                    ? 'border-accent-500 bg-accent-50 dark:bg-accent-900/20'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900'
                }`}
                onClick={() => setSelectedShape(shape.id)}
              >
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    #{index + 1}
                  </Badge>
                  <span className="text-sm font-police-body">
                    {shape.label || `Oclusão ${index + 1}`}
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {shape.type === 'rect' ? 'Retângulo' : 'Elipse'}
                  </Badge>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    const label = prompt('Editar rótulo:', shape.label || '');
                    if (label !== null) {
                      const updatedShapes = shapes.map(s =>
                        s.id === shape.id ? { ...s, label } : s
                      );
                      setShapes(updatedShapes);
                      onChange?.(updatedShapes);
                    }
                  }}
                >
                  <Edit className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-gray-500 dark:text-gray-400 font-police-body">
            💡 Cada oclusão gerará um card separado no estudo
          </p>
        </div>
      )}
    </div>
  );
}