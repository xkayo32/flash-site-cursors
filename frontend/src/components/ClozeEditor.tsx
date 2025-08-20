import React, { useState, useRef, useEffect } from 'react';
import { 
  Type, 
  Eye, 
  EyeOff, 
  Plus, 
  Minus, 
  Undo2, 
  Redo2,
  Info,
  Image,
  Bold,
  Italic,
  Underline
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import toast from 'react-hot-toast';

interface ClozeEditorProps {
  value: string;
  onChange: (value: string, metadata?: ClozeMetadata) => void;
  placeholder?: string;
  showPreview?: boolean;
  enableRichText?: boolean;
  onImageUpload?: (file: File) => Promise<string>;
}

interface ClozeMetadata {
  cardCount: number;
  clozeNumbers: number[];
  hasHints: boolean;
}

export default function ClozeEditor({ 
  value, 
  onChange, 
  placeholder = "Digite o texto e selecione palavras para ocultar...",
  showPreview = true,
  enableRichText = false,
  onImageUpload
}: ClozeEditorProps) {
  const [text, setText] = useState(value);
  const [previewMode, setPreviewMode] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [clozeCounter, setClozeCounter] = useState(1);
  const [history, setHistory] = useState<string[]>([value]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [selectionRange, setSelectionRange] = useState<{start: number, end: number} | null>(null);

  // Analisar o texto para metadados
  const analyzeText = (text: string): ClozeMetadata => {
    const clozePattern = /\{\{c(\d+)::[^}]+\}\}/g;
    const numbers = new Set<number>();
    let match;
    
    while ((match = clozePattern.exec(text)) !== null) {
      numbers.add(parseInt(match[1]));
    }
    
    const hasHints = text.includes('::') && text.split('::').length > 2;
    
    return {
      cardCount: numbers.size || 0,
      clozeNumbers: Array.from(numbers).sort((a, b) => a - b),
      hasHints
    };
  };

  // Atualizar texto e notificar mudanças
  const updateText = (newText: string) => {
    setText(newText);
    const metadata = analyzeText(newText);
    onChange(newText, metadata);
    
    // Adicionar ao histórico
    const newHistory = [...history.slice(0, historyIndex + 1), newText];
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  // Detectar seleção de texto
  const handleTextSelection = () => {
    if (!textareaRef.current) return;
    
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    
    if (start !== end) {
      const selected = text.substring(start, end);
      setSelectedText(selected);
      setSelectionRange({ start, end });
    } else {
      setSelectedText('');
      setSelectionRange(null);
    }
  };

  // Marcar texto selecionado como cloze
  const markAsCloze = (includeHint: boolean = false) => {
    if (!selectionRange || !selectedText) {
      toast.error('Selecione um texto primeiro!');
      return;
    }
    
    const { start, end } = selectionRange;
    let replacement = `{{c${clozeCounter}::${selectedText}}}`;
    
    if (includeHint) {
      const hint = prompt('Digite uma dica para esta ocultação:', '');
      if (hint) {
        replacement = `{{c${clozeCounter}::${selectedText}::${hint}}}`;
      }
    }
    
    const newText = text.substring(0, start) + replacement + text.substring(end);
    updateText(newText);
    
    // Incrementar contador e limpar seleção
    setClozeCounter(clozeCounter + 1);
    setSelectedText('');
    setSelectionRange(null);
    
    // Atualizar contador baseado no texto
    const maxNumber = Math.max(...analyzeText(newText).clozeNumbers, 0);
    setClozeCounter(maxNumber + 1);
  };

  // Remover todas as marcações cloze
  const clearAllCloze = () => {
    const cleanText = text.replace(/\{\{c\d+::([^:}]+)(::([^}]+))?\}\}/g, '$1');
    updateText(cleanText);
    setClozeCounter(1);
    toast.success('Todas as ocultações foram removidas!');
  };

  // Desfazer/Refazer
  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setText(history[newIndex]);
      onChange(history[newIndex], analyzeText(history[newIndex]));
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setText(history[newIndex]);
      onChange(history[newIndex], analyzeText(history[newIndex]));
    }
  };

  // Renderizar preview do texto
  const renderPreview = () => {
    const metadata = analyzeText(text);
    
    if (metadata.cardCount === 0) {
      return <p className="text-gray-500 dark:text-gray-400">Nenhuma ocultação criada ainda...</p>;
    }
    
    return (
      <div className="space-y-4">
        {metadata.clozeNumbers.map(num => {
          let previewText = text;
          const pattern = /\{\{c(\d+)::([^:}]+)(::([^}]+))?\}\}/g;
          
          previewText = previewText.replace(pattern, (match, cNum, answer, _, hint) => {
            const currentNum = parseInt(cNum);
            if (currentNum === num) {
              return hint ? `[${hint}]` : '[...]';
            } else {
              return answer;
            }
          });
          
          return (
            <div key={num} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="text-xs">
                  Card {num}
                </Badge>
              </div>
              <p className="text-sm font-police-body whitespace-pre-wrap">{previewText}</p>
            </div>
          );
        })}
      </div>
    );
  };

  // Lidar com upload de imagem
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!onImageUpload || !e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    try {
      const url = await onImageUpload(file);
      const imageTag = `<img src="${url}" alt="Imagem" />`;
      
      if (selectionRange) {
        const { start, end } = selectionRange;
        const newText = text.substring(0, start) + imageTag + text.substring(end);
        updateText(newText);
      } else {
        updateText(text + '\n' + imageTag);
      }
      
      toast.success('Imagem adicionada!');
    } catch (error) {
      toast.error('Erro ao fazer upload da imagem');
    }
  };

  // Atualizar clozeCounter baseado no texto existente
  useEffect(() => {
    const metadata = analyzeText(text);
    if (metadata.clozeNumbers.length > 0) {
      const maxNumber = Math.max(...metadata.clozeNumbers);
      setClozeCounter(maxNumber + 1);
    }
  }, []);

  const metadata = analyzeText(text);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-1 border-r pr-2 border-gray-300 dark:border-gray-600">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => markAsCloze(false)}
            disabled={!selectedText}
            className="hover:bg-accent-500/20"
            title="Marcar como ocultação (Ctrl+Shift+C)"
          >
            <Eye className="w-4 h-4 mr-1" />
            Ocultar
          </Button>
          
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => markAsCloze(true)}
            disabled={!selectedText}
            className="hover:bg-accent-500/20"
            title="Ocultar com dica"
          >
            <Info className="w-4 h-4 mr-1" />
            Com Dica
          </Button>
        </div>
        
        <div className="flex items-center gap-1 border-r pr-2 border-gray-300 dark:border-gray-600">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={undo}
            disabled={historyIndex === 0}
            className="hover:bg-gray-200 dark:hover:bg-gray-700"
            title="Desfazer (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </Button>
          
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={redo}
            disabled={historyIndex === history.length - 1}
            className="hover:bg-gray-200 dark:hover:bg-gray-700"
            title="Refazer (Ctrl+Y)"
          >
            <Redo2 className="w-4 h-4" />
          </Button>
        </div>
        
        {enableRichText && (
          <div className="flex items-center gap-1 border-r pr-2 border-gray-300 dark:border-gray-600">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="hover:bg-gray-200 dark:hover:bg-gray-700"
              title="Negrito"
            >
              <Bold className="w-4 h-4" />
            </Button>
            
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="hover:bg-gray-200 dark:hover:bg-gray-700"
              title="Itálico"
            >
              <Italic className="w-4 h-4" />
            </Button>
            
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="hover:bg-gray-200 dark:hover:bg-gray-700"
              title="Sublinhado"
            >
              <Underline className="w-4 h-4" />
            </Button>
          </div>
        )}
        
        {onImageUpload && (
          <div className="flex items-center gap-1 border-r pr-2 border-gray-300 dark:border-gray-600">
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="hover:bg-gray-200 dark:hover:bg-gray-700"
                title="Adicionar imagem"
                as="span"
              >
                <Image className="w-4 h-4" />
              </Button>
            </label>
          </div>
        )}
        
        <div className="flex items-center gap-1">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={clearAllCloze}
            disabled={metadata.cardCount === 0}
            className="hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
            title="Limpar todas as ocultações"
          >
            <Minus className="w-4 h-4 mr-1" />
            Limpar
          </Button>
        </div>
        
        <div className="flex-1 flex justify-end items-center gap-2">
          {metadata.cardCount > 0 && (
            <Badge variant="success" className="font-police-subtitle">
              {metadata.cardCount} {metadata.cardCount === 1 ? 'CARD' : 'CARDS'}
            </Badge>
          )}
          
          {showPreview && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setPreviewMode(!previewMode)}
              className="hover:bg-accent-500/20"
            >
              {previewMode ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
              {previewMode ? 'Editor' : 'Preview'}
            </Button>
          )}
        </div>
      </div>
      
      {/* Informação de seleção */}
      {selectedText && (
        <div className="p-2 bg-accent-50 dark:bg-accent-900/20 rounded-lg border border-accent-200 dark:border-accent-800">
          <p className="text-xs text-accent-700 dark:text-accent-400 font-police-body">
            <strong>Texto selecionado:</strong> "{selectedText}" 
            <span className="ml-2">→ Clique em "Ocultar" para criar cloze</span>
          </p>
        </div>
      )}
      
      {/* Editor ou Preview */}
      {previewMode ? (
        <div className="space-y-2">
          <h4 className="font-police-subtitle uppercase tracking-wider text-gray-700 dark:text-gray-300 font-semibold">
            📋 PREVIEW DOS CARDS:
          </h4>
          {renderPreview()}
        </div>
      ) : (
        <div>
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => updateText(e.target.value)}
            onSelect={handleTextSelection}
            onMouseUp={handleTextSelection}
            onKeyUp={handleTextSelection}
            rows={6}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
            placeholder={placeholder}
          />
          
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 font-police-body space-y-1">
            <p>💡 <strong>Dica:</strong> Selecione o texto que deseja ocultar e clique em "Ocultar"</p>
            <p>📝 <strong>Sintaxe manual:</strong> {`{{c1::texto}}  ou {{c1::texto::dica}}`}</p>
            <p>⚡ <strong>Múltiplas ocultações:</strong> Cada número (c1, c2, c3...) gera um card separado</p>
          </div>
        </div>
      )}
    </div>
  );
}