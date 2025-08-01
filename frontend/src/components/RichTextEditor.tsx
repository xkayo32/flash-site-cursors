import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Code,
  Link2,
  Image,
  Highlighter,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Undo,
  Redo,
  Save,
  Palette,
  Brain,
  Star,
  FileText,
  Target,
  BookOpen,
  CheckSquare,
  Square,
  Heading1,
  Heading2,
  Heading3,
  Hash,
  Table,
  Indent,
  Outdent,
  RotateCcw,
  Eye,
  Maximize2,
  X
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/utils/cn';
import toast from 'react-hot-toast';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  onSave?: () => void;
  placeholder?: string;
  className?: string;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

// Toolbar configuration for educational content
const toolbarGroups = [
  {
    name: 'history',
    label: 'HISTÓRICO',
    tools: [
      { icon: Undo, action: 'undo', title: 'Desfazer (Ctrl+Z)' },
      { icon: Redo, action: 'redo', title: 'Refazer (Ctrl+Y)' }
    ]
  },
  {
    name: 'format',
    label: 'FORMATAÇÃO',
    tools: [
      { icon: Bold, action: 'bold', title: 'Negrito (Ctrl+B)', shortcut: 'Ctrl+B' },
      { icon: Italic, action: 'italic', title: 'Itálico (Ctrl+I)', shortcut: 'Ctrl+I' },
      { icon: Underline, action: 'underline', title: 'Sublinhado (Ctrl+U)', shortcut: 'Ctrl+U' },
      { icon: Strikethrough, action: 'strikeThrough', title: 'Riscado' },
      { icon: Highlighter, action: 'highlight', title: 'Destacar texto', special: true }
    ]
  },
  {
    name: 'headings',
    label: 'TÍTULOS',
    tools: [
      { icon: Heading1, action: 'heading1', title: 'Título 1', format: 'h1' },
      { icon: Heading2, action: 'heading2', title: 'Título 2', format: 'h2' },
      { icon: Heading3, action: 'heading3', title: 'Título 3', format: 'h3' }
    ]
  },
  {
    name: 'lists',
    label: 'LISTAS',
    tools: [
      { icon: List, action: 'insertUnorderedList', title: 'Lista com marcadores' },
      { icon: ListOrdered, action: 'insertOrderedList', title: 'Lista numerada' },
      { icon: CheckSquare, action: 'todoList', title: 'Lista de tarefas', special: true }
    ]
  },
  {
    name: 'align',
    label: 'ALINHAMENTO',
    tools: [
      { icon: AlignLeft, action: 'justifyLeft', title: 'Alinhar à esquerda' },
      { icon: AlignCenter, action: 'justifyCenter', title: 'Centralizar' },
      { icon: AlignRight, action: 'justifyRight', title: 'Alinhar à direita' },
      { icon: AlignJustify, action: 'justifyFull', title: 'Justificar' }
    ]
  },
  {
    name: 'insert',
    label: 'INSERIR',
    tools: [
      { icon: Link2, action: 'createLink', title: 'Inserir link' },
      { icon: Image, action: 'insertImage', title: 'Inserir imagem' },
      { icon: Table, action: 'insertTable', title: 'Inserir tabela', special: true },
      { icon: Code, action: 'code', title: 'Código inline' },
      { icon: Quote, action: 'formatBlock', title: 'Citação', format: 'blockquote' }
    ]
  },
  {
    name: 'educational',
    label: 'EDUCACIONAL',
    tools: [
      { icon: Brain, action: 'insertQuestion', title: 'Inserir questão', special: true },
      { icon: Star, action: 'insertFlashcard', title: 'Inserir flashcard', special: true },
      { icon: Target, action: 'insertExercise', title: 'Inserir exercício', special: true },
      { icon: BookOpen, action: 'insertNote', title: 'Inserir nota de estudo', special: true }
    ]
  }
];

// Color palette for highlighting
const highlightColors = [
  { name: 'Amarelo', color: '#facc15', textColor: '#000' },
  { name: 'Verde', color: '#22c55e', textColor: '#000' },
  { name: 'Azul', color: '#3b82f6', textColor: '#fff' },
  { name: 'Rosa', color: '#ec4899', textColor: '#fff' },
  { name: 'Roxo', color: '#8b5cf6', textColor: '#fff' },
  { name: 'Laranja', color: '#f97316', textColor: '#000' },
  { name: 'Vermelho', color: '#ef4444', textColor: '#fff' },
  { name: 'Cinza', color: '#6b7280', textColor: '#fff' }
];

export default function RichTextEditor({ 
  content, 
  onChange, 
  onSave,
  placeholder = "Comece a escrever seu conteúdo...",
  className,
  isFullscreen = false,
  onToggleFullscreen
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [selectedColor, setSelectedColor] = useState(highlightColors[0].color);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showEmbedModal, setShowEmbedModal] = useState(false);
  const [embedType, setEmbedType] = useState<'question' | 'flashcard' | 'exercise' | 'note'>('question');
  const [currentSelection, setCurrentSelection] = useState<Range | null>(null);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);

  // Save selection for later use
  const saveSelection = useCallback(() => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      setCurrentSelection(selection.getRangeAt(0).cloneRange());
    }
  }, []);

  // Restore selection
  const restoreSelection = useCallback(() => {
    if (currentSelection) {
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(currentSelection);
    }
  }, [currentSelection]);

  // Count words and characters
  const updateCounts = useCallback((text: string) => {
    const plainText = text.replace(/<[^>]*>/g, '').trim();
    const words = plainText ? plainText.split(/\s+/).length : 0;
    const chars = plainText.length;
    setWordCount(words);
    setCharCount(chars);
  }, []);

  // Handle content changes
  const handleContentChange = useCallback(() => {
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML;
      onChange(newContent);
      updateCounts(newContent);
    }
  }, [onChange, updateCounts]);

  // Execute editor commands
  const executeCommand = useCallback((command: string, value?: string) => {
    if (!editorRef.current) return false;

    // Focus editor before executing command
    editorRef.current.focus();
    
    try {
      const success = document.execCommand(command, false, value);
      if (success) {
        handleContentChange();
        return true;
      }
    } catch (error) {
      console.warn('Command execution failed:', command, error);
    }
    return false;
  }, [handleContentChange]);

  // Handle toolbar actions
  const handleToolbarAction = useCallback((action: string, format?: string) => {
    saveSelection();

    switch (action) {
      case 'bold':
        executeCommand('bold');
        break;
      case 'italic':
        executeCommand('italic');
        break;
      case 'underline':
        executeCommand('underline');
        break;
      case 'strikeThrough':
        executeCommand('strikeThrough');
        break;
      case 'highlight':
        executeCommand('backColor', selectedColor);
        break;
      case 'heading1':
      case 'heading2':
      case 'heading3':
        executeCommand('formatBlock', format || `<${action.slice(-2)}>`);
        break;
      case 'insertUnorderedList':
      case 'insertOrderedList':
        executeCommand(action);
        break;
      case 'justifyLeft':
      case 'justifyCenter':
      case 'justifyRight':
      case 'justifyFull':
        executeCommand(action);
        break;
      case 'createLink':
        const url = prompt('Digite a URL:');
        if (url) {
          executeCommand('createLink', url);
        }
        break;
      case 'insertImage':
        const imageUrl = prompt('Digite a URL da imagem:');
        if (imageUrl) {
          executeCommand('insertImage', imageUrl);
        }
        break;
      case 'code':
        executeCommand('formatBlock', '<pre>');
        break;
      case 'formatBlock':
        executeCommand('formatBlock', format || '<blockquote>');
        break;
      case 'undo':
        executeCommand('undo');
        break;
      case 'redo':
        executeCommand('redo');
        break;
      case 'todoList':
        insertTodoList();
        break;
      case 'insertTable':
        insertTable();
        break;
      case 'insertQuestion':
      case 'insertFlashcard':
      case 'insertExercise':
      case 'insertNote':
        setEmbedType(action.replace('insert', '').toLowerCase() as any);
        setShowEmbedModal(true);
        break;
      default:
        console.warn('Unknown action:', action);
    }
  }, [saveSelection, executeCommand, selectedColor]);

  // Insert todo list
  const insertTodoList = useCallback(() => {
    const todoHtml = `
      <div class="todo-list" contenteditable="false">
        <div class="todo-item" contenteditable="true">
          <label class="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded border">
            <input type="checkbox" class="rounded border-gray-300">
            <span contenteditable="true">Nova tarefa...</span>
          </label>
        </div>
      </div>
    `;
    executeCommand('insertHTML', todoHtml);
  }, [executeCommand]);

  // Insert table
  const insertTable = useCallback(() => {
    const rows = prompt('Número de linhas:') || '3';
    const cols = prompt('Número de colunas:') || '3';
    
    let tableHtml = '<table class="w-full border-collapse border border-gray-300 my-4"><tbody>';
    
    for (let i = 0; i < parseInt(rows); i++) {
      tableHtml += '<tr>';
      for (let j = 0; j < parseInt(cols); j++) {
        tableHtml += '<td class="border border-gray-300 p-2" contenteditable="true">Célula</td>';
      }
      tableHtml += '</tr>';
    }
    
    tableHtml += '</tbody></table>';
    executeCommand('insertHTML', tableHtml);
  }, [executeCommand]);

  // Insert educational content
  const insertEducationalContent = useCallback((type: string, content: any) => {
    let html = '';
    
    switch (type) {
      case 'question':
        html = `
          <div class="educational-block question-block bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 my-4" contenteditable="false">
            <div class="flex items-center gap-2 mb-2">
              <div class="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                <span class="text-white text-xs font-bold">Q</span>
              </div>
              <span class="font-bold text-blue-700 dark:text-blue-300">QUESTÃO</span>
            </div>
            <div class="mb-3">
              <p contenteditable="true" class="font-medium">${content.question || 'Digite a pergunta aqui...'}</p>
            </div>
            <div class="space-y-2">
              ${(content.options || ['A) Opção A', 'B) Opção B', 'C) Opção C', 'D) Opção D']).map((option: string) => 
                `<label class="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="question_${Date.now()}" class="text-blue-500">
                  <span contenteditable="true">${option}</span>
                </label>`
              ).join('')}
            </div>
            ${content.explanation ? `
              <div class="mt-3 pt-3 border-t border-blue-200 dark:border-blue-700">
                <p class="text-sm font-medium text-blue-600 dark:text-blue-400">Explicação:</p>
                <p contenteditable="true" class="text-sm text-gray-600 dark:text-gray-400">${content.explanation}</p>
              </div>
            ` : ''}
          </div>
        `;
        break;
        
      case 'flashcard':
        html = `
          <div class="educational-block flashcard-block bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 my-4" contenteditable="false">
            <div class="flex items-center gap-2 mb-2">
              <div class="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                <span class="text-white text-xs font-bold">F</span>
              </div>
              <span class="font-bold text-yellow-700 dark:text-yellow-300">FLASHCARD</span>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="bg-white dark:bg-gray-800 p-3 rounded shadow">
                <p class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">PERGUNTA:</p>
                <p contenteditable="true">${content.front || 'Frente do cartão...'}</p>
              </div>
              <div class="bg-white dark:bg-gray-800 p-3 rounded shadow">
                <p class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">RESPOSTA:</p>
                <p contenteditable="true">${content.back || 'Verso do cartão...'}</p>
              </div>
            </div>
          </div>
        `;
        break;
        
      case 'exercise':
        html = `
          <div class="educational-block exercise-block bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-4 my-4" contenteditable="false">
            <div class="flex items-center gap-2 mb-2">
              <div class="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <span class="text-white text-xs font-bold">E</span>
              </div>
              <span class="font-bold text-green-700 dark:text-green-300">EXERCÍCIO</span>
            </div>
            <div class="space-y-3">
              <div>
                <p class="font-medium mb-2">Enunciado:</p>
                <div contenteditable="true" class="bg-white dark:bg-gray-800 p-3 rounded border">${content.prompt || 'Descreva o exercício aqui...'}</div>
              </div>
              <div>
                <p class="font-medium mb-2">Solução:</p>
                <div contenteditable="true" class="bg-white dark:bg-gray-800 p-3 rounded border">${content.solution || 'Explique a solução passo a passo...'}</div>
              </div>
            </div>
          </div>
        `;
        break;
        
      case 'note':
        html = `
          <div class="educational-block note-block bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-500 p-4 my-4" contenteditable="false">
            <div class="flex items-center gap-2 mb-2">
              <div class="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                <span class="text-white text-xs font-bold">N</span>
              </div>
              <span class="font-bold text-purple-700 dark:text-purple-300">NOTA DE ESTUDO</span>
            </div>
            <div class="bg-white dark:bg-gray-800 p-3 rounded">
              <div contenteditable="true">${content.note || 'Digite sua nota de estudo aqui...'}</div>
            </div>
          </div>
        `;
        break;
    }
    
    if (html) {
      restoreSelection();
      executeCommand('insertHTML', html);
      setShowEmbedModal(false);
    }
  }, [restoreSelection, executeCommand]);

  // Initialize editor
  useEffect(() => {
    if (editorRef.current && content !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = content;
      updateCounts(content);
    }
  }, [content, updateCounts]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'b':
            e.preventDefault();
            handleToolbarAction('bold');
            break;
          case 'i':
            e.preventDefault();
            handleToolbarAction('italic');
            break;
          case 'u':
            e.preventDefault();
            handleToolbarAction('underline');
            break;
          case 's':
            e.preventDefault();
            onSave?.();
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleToolbarAction, onSave]);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Toolbar */}
      <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="space-y-4">
            {/* Main toolbar */}
            <div className="flex flex-wrap items-center gap-2">
              {toolbarGroups.map((group, groupIndex) => (
                <div key={group.name} className="flex items-center gap-1">
                  {group.tools.map((tool, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToolbarAction(tool.action, tool.format)}
                      className={cn(
                        'p-2 font-police-body relative',
                        tool.special && 'bg-accent-500/20 text-accent-700 dark:text-accent-300 hover:bg-accent-500/30'
                      )}
                      title={tool.title}
                    >
                      <tool.icon className="w-4 h-4" />
                      {tool.shortcut && (
                        <span className="absolute -bottom-1 -right-1 text-xs bg-gray-200 dark:bg-gray-700 px-1 rounded text-gray-600 dark:text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                          {tool.shortcut}
                        </span>
                      )}
                    </Button>
                  ))}
                  {groupIndex < toolbarGroups.length - 1 && (
                    <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-2" />
                  )}
                </div>
              ))}
            </div>

            {/* Secondary toolbar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Color picker */}
                <div className="relative">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowColorPicker(!showColorPicker)}
                    className="gap-2 font-police-body"
                  >
                    <Palette className="w-4 h-4" />
                    <div 
                      className="w-4 h-4 rounded border border-gray-300"
                      style={{ backgroundColor: selectedColor }}
                    />
                  </Button>
                  
                  {showColorPicker && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute top-full mt-2 left-0 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-3 shadow-lg z-50"
                    >
                      <div className="grid grid-cols-4 gap-2">
                        {highlightColors.map((colorOption) => (
                          <button
                            key={colorOption.color}
                            onClick={() => {
                              setSelectedColor(colorOption.color);
                              setShowColorPicker(false);
                            }}
                            className={cn(
                              'w-8 h-8 rounded border-2 hover:scale-110 transition-transform',
                              selectedColor === colorOption.color 
                                ? 'border-accent-500 shadow-md' 
                                : 'border-gray-300 dark:border-gray-600'
                            )}
                            style={{ backgroundColor: colorOption.color }}
                            title={colorOption.name}
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Quick format selector */}
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      handleToolbarAction(e.target.value);
                      e.target.value = '';
                    }
                  }}
                  className="px-3 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-police-body uppercase tracking-wider"
                  value=""
                >
                  <option value="">FORMATO RÁPIDO</option>
                  <option value="heading1">TÍTULO 1</option>
                  <option value="heading2">TÍTULO 2</option>
                  <option value="heading3">TÍTULO 3</option>
                  <option value="formatBlock">CITAÇÃO</option>
                  <option value="code">CÓDIGO</option>
                </select>
              </div>

              {/* Stats and actions */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 font-police-numbers">
                  <span>{wordCount} palavras</span>
                  <span>{charCount} caracteres</span>
                </div>
                
                {onToggleFullscreen && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onToggleFullscreen}
                    className="gap-2 font-police-body"
                  >
                    <Maximize2 className="w-4 h-4" />
                    {isFullscreen ? 'SAIR TELA CHEIA' : 'TELA CHEIA'}
                  </Button>
                )}
                
                {onSave && (
                  <Button
                    onClick={onSave}
                    size="sm"
                    className="gap-2 font-police-body font-semibold bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black px-4"
                  >
                    <Save className="w-4 h-4" />
                    SALVAR
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Editor */}
      <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
        <CardContent className="p-0">
          <div
            ref={editorRef}
            contentEditable
            className={cn(
              'min-h-[600px] p-6 outline-none',
              'prose prose-lg dark:prose-invert max-w-none',
              'focus:ring-2 focus:ring-accent-500 focus:ring-inset',
              '[&:empty]:before:content-[attr(data-placeholder)] [&:empty]:before:text-gray-400 [&:empty]:before:italic',
              // Educational block styles
              '[&_.educational-block]:my-4',
              '[&_.todo-item]:mb-2',
              '[&_table]:border-collapse [&_table]:border [&_table]:border-gray-300 [&_table]:my-4',
              '[&_td]:border [&_td]:border-gray-300 [&_td]:p-2',
              '[&_th]:border [&_th]:border-gray-300 [&_th]:p-2 [&_th]:bg-gray-100 [&_th]:font-bold'
            )}
            data-placeholder={placeholder}
            onInput={handleContentChange}
            onMouseUp={saveSelection}
            onKeyUp={saveSelection}
            suppressContentEditableWarning={true}
          />
        </CardContent>
      </Card>

      {/* Educational Content Modal */}
      {showEmbedModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setShowEmbedModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full border-2 border-gray-200 dark:border-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold font-police-title uppercase tracking-wider text-gray-900 dark:text-white">
                INSERIR {embedType.toUpperCase()}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowEmbedModal(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4">
              {embedType === 'question' && (
                <Button
                  onClick={() => insertEducationalContent('question', {})}
                  className="w-full gap-2 font-police-body font-semibold bg-accent-500 hover:bg-accent-600 text-black"
                >
                  <Brain className="w-4 h-4" />
                  INSERIR QUESTÃO
                </Button>
              )}
              {embedType === 'flashcard' && (
                <Button
                  onClick={() => insertEducationalContent('flashcard', {})}
                  className="w-full gap-2 font-police-body font-semibold bg-accent-500 hover:bg-accent-600 text-black"
                >
                  <Star className="w-4 h-4" />
                  INSERIR FLASHCARD
                </Button>
              )}
              {embedType === 'exercise' && (
                <Button
                  onClick={() => insertEducationalContent('exercise', {})}
                  className="w-full gap-2 font-police-body font-semibold bg-accent-500 hover:bg-accent-600 text-black"
                >
                  <Target className="w-4 h-4" />
                  INSERIR EXERCÍCIO
                </Button>
              )}
              {embedType === 'note' && (
                <Button
                  onClick={() => insertEducationalContent('note', {})}
                  className="w-full gap-2 font-police-body font-semibold bg-accent-500 hover:bg-accent-600 text-black"
                >
                  <BookOpen className="w-4 h-4" />
                  INSERIR NOTA DE ESTUDO
                </Button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}