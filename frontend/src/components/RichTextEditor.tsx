import React, { useState, useRef, useEffect } from 'react';
import { 
  Bold, 
  Italic, 
  Underline,
  List,
  ListOrdered,
  Quote,
  Link,
  Code,
  Highlighter,
  Type,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo2,
  Redo2,
  Brain,
  Star,
  Image,
  X,
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { flashcardService } from '@/services/flashcardService';
import { questionService } from '@/services/questionService';
import toast from 'react-hot-toast';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string, plainText?: string) => void;
  placeholder?: string;
  minHeight?: number;
  maxHeight?: number;
  disabled?: boolean;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Digite seu texto aqui...",
  minHeight = 150,
  maxHeight = 400,
  disabled = false
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [selectedText, setSelectedText] = useState('');
  
  // Estados para inserção de flashcards e questões
  const [showFlashcardModal, setShowFlashcardModal] = useState(false);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [flashcards, setFlashcards] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loadingContent, setLoadingContent] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Sincronizar valor inicial
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
  }, []);

  // Executar comando de formatação
  const executeCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    handleContentChange();
    editorRef.current?.focus();
  };

  // Lidar com mudanças no conteúdo
  const handleContentChange = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      const plainText = editorRef.current.innerText;
      
      // Evitar loops infinitos
      if (html === '<br>') {
        onChange('', '');
      } else {
        onChange(html, plainText);
      }
    }
  };

  // Verificar se um comando está ativo
  const isCommandActive = (command: string): boolean => {
    try {
      return document.queryCommandState(command);
    } catch {
      return false;
    }
  };

  // Inserir link
  const insertLink = () => {
    const selection = window.getSelection();
    if (selection && selection.toString()) {
      setSelectedText(selection.toString());
      setIsLinkDialogOpen(true);
    } else {
      toast.error('Selecione um texto primeiro');
    }
  };

  // Confirmar inserção de link
  const confirmLink = () => {
    if (linkUrl) {
      executeCommand('createLink', linkUrl);
      setIsLinkDialogOpen(false);
      setLinkUrl('');
      setSelectedText('');
    }
  };

  // Aplicar cor de destaque
  const applyHighlight = () => {
    executeCommand('hiliteColor', '#facc15');
  };

  // Limpar formatação
  const clearFormatting = () => {
    executeCommand('removeFormat');
  };

  // Desfazer/Refazer
  const undo = () => executeCommand('undo');
  const redo = () => executeCommand('redo');

  // Carregar flashcards
  const loadFlashcards = async () => {
    try {
      setLoadingContent(true);
      const response = await flashcardService.getFlashcards({ limit: 50 });
      if (response.success) {
        setFlashcards(response.data || []);
      }
    } catch (error) {
      console.error('Error loading flashcards:', error);
      toast.error('Erro ao carregar flashcards');
    } finally {
      setLoadingContent(false);
    }
  };

  // Carregar questões
  const loadQuestions = async () => {
    try {
      setLoadingContent(true);
      const response = await questionService.getQuestions({ limit: 50 });
      if (response.success) {
        setQuestions(response.data || []);
      }
    } catch (error) {
      console.error('Error loading questions:', error);
      toast.error('Erro ao carregar questões');
      // Usar questões mock como fallback
      setQuestions([
        { id: 1, question: "Qual é o princípio fundamental da Constituição?", category: "Direito", type: "multiple_choice" },
        { id: 2, question: "Calcule 2 + 2", category: "Matemática", type: "multiple_choice" }
      ]);
    } finally {
      setLoadingContent(false);
    }
  };

  // Abrir modal de flashcards
  const openFlashcardModal = () => {
    setShowFlashcardModal(true);
    loadFlashcards();
  };

  // Abrir modal de questões
  const openQuestionModal = () => {
    setShowQuestionModal(true);
    loadQuestions();
  };

  // Inserir flashcard no editor
  const insertFlashcard = (flashcard: any) => {
    const flashcardHtml = `
      <div class="embedded-flashcard bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 my-4" data-type="flashcard" data-id="${flashcard.id}">
        <div class="flex items-center gap-2 mb-2">
          <span class="bg-blue-500 text-white px-2 py-1 rounded text-xs font-bold">FLASHCARD</span>
          <span class="text-xs text-gray-600 dark:text-gray-400">${flashcard.category || 'Sem categoria'}</span>
        </div>
        <div class="font-semibold text-gray-900 dark:text-white mb-1">${flashcard.front || flashcard.question}</div>
        <div class="text-gray-700 dark:text-gray-300 text-sm">${flashcard.back || flashcard.answer}</div>
      </div>
    `;
    
    document.execCommand('insertHTML', false, flashcardHtml);
    handleContentChange();
    setShowFlashcardModal(false);
    setSearchTerm('');
    toast.success('Flashcard inserido no resumo!');
  };

  // Inserir questão no editor
  const insertQuestion = (question: any) => {
    const questionHtml = `
      <div class="embedded-question bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4 my-4" data-type="question" data-id="${question.id}">
        <div class="flex items-center gap-2 mb-2">
          <span class="bg-green-500 text-white px-2 py-1 rounded text-xs font-bold">QUESTÃO</span>
          <span class="text-xs text-gray-600 dark:text-gray-400">${question.category || 'Sem categoria'}</span>
        </div>
        <div class="font-semibold text-gray-900 dark:text-white">${question.question || question.title || question.statement}</div>
      </div>
    `;
    
    document.execCommand('insertHTML', false, questionHtml);
    handleContentChange();
    setShowQuestionModal(false);
    setSearchTerm('');
    toast.success('Questão inserida no resumo!');
  };

  // Lidar com colagem
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
    handleContentChange();
  };

  // Lidar com teclas especiais
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Atalhos de teclado
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          executeCommand('bold');
          break;
        case 'i':
          e.preventDefault();
          executeCommand('italic');
          break;
        case 'u':
          e.preventDefault();
          executeCommand('underline');
          break;
        case 'z':
          if (e.shiftKey) {
            e.preventDefault();
            redo();
          } else {
            e.preventDefault();
            undo();
          }
          break;
        case 'y':
          e.preventDefault();
          redo();
          break;
      }
    }
  };

  // Botões da toolbar
  const formatButtons = [
    { icon: <Bold className="w-4 h-4" />, command: 'bold', title: 'Negrito (Ctrl+B)' },
    { icon: <Italic className="w-4 h-4" />, command: 'italic', title: 'Itálico (Ctrl+I)' },
    { icon: <Underline className="w-4 h-4" />, command: 'underline', title: 'Sublinhado (Ctrl+U)' },
    { icon: <Strikethrough className="w-4 h-4" />, command: 'strikeThrough', title: 'Tachado' },
  ];

  const structureButtons = [
    { icon: <List className="w-4 h-4" />, command: 'insertUnorderedList', title: 'Lista com marcadores' },
    { icon: <ListOrdered className="w-4 h-4" />, command: 'insertOrderedList', title: 'Lista numerada' },
    { icon: <Quote className="w-4 h-4" />, command: 'formatBlock', value: 'blockquote', title: 'Citação' },
    { icon: <Code className="w-4 h-4" />, command: 'formatBlock', value: 'pre', title: 'Código' },
  ];

  const alignButtons = [
    { icon: <AlignLeft className="w-4 h-4" />, command: 'justifyLeft', title: 'Alinhar à esquerda' },
    { icon: <AlignCenter className="w-4 h-4" />, command: 'justifyCenter', title: 'Centralizar' },
    { icon: <AlignRight className="w-4 h-4" />, command: 'justifyRight', title: 'Alinhar à direita' },
  ];

  return (
    <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-600">
        {/* Desfazer/Refazer */}
        <div className="flex items-center gap-1 border-r pr-2 border-gray-300 dark:border-gray-600">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={undo}
            disabled={disabled}
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
            disabled={disabled}
            className="hover:bg-gray-200 dark:hover:bg-gray-700"
            title="Refazer (Ctrl+Y)"
          >
            <Redo2 className="w-4 h-4" />
          </Button>
        </div>

        {/* Formatação de texto */}
        <div className="flex items-center gap-1 border-r pr-2 border-gray-300 dark:border-gray-600">
          {formatButtons.map((btn, index) => (
            <Button
              key={index}
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => executeCommand(btn.command, btn.value)}
              disabled={disabled}
              className={`hover:bg-gray-200 dark:hover:bg-gray-700 ${
                isCommandActive(btn.command) ? 'bg-gray-200 dark:bg-gray-700' : ''
              }`}
              title={btn.title}
            >
              {btn.icon}
            </Button>
          ))}
        </div>

        {/* Estrutura */}
        <div className="flex items-center gap-1 border-r pr-2 border-gray-300 dark:border-gray-600">
          {structureButtons.map((btn, index) => (
            <Button
              key={index}
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => executeCommand(btn.command, btn.value)}
              disabled={disabled}
              className={`hover:bg-gray-200 dark:hover:bg-gray-700 ${
                isCommandActive(btn.command) ? 'bg-gray-200 dark:bg-gray-700' : ''
              }`}
              title={btn.title}
            >
              {btn.icon}
            </Button>
          ))}
        </div>

        {/* Alinhamento */}
        <div className="flex items-center gap-1 border-r pr-2 border-gray-300 dark:border-gray-600">
          {alignButtons.map((btn, index) => (
            <Button
              key={index}
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => executeCommand(btn.command, btn.value)}
              disabled={disabled}
              className={`hover:bg-gray-200 dark:hover:bg-gray-700 ${
                isCommandActive(btn.command) ? 'bg-gray-200 dark:bg-gray-700' : ''
              }`}
              title={btn.title}
            >
              {btn.icon}
            </Button>
          ))}
        </div>

        {/* Extras */}
        <div className="flex items-center gap-1">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={applyHighlight}
            disabled={disabled}
            className="hover:bg-gray-200 dark:hover:bg-gray-700"
            title="Destacar texto"
          >
            <Highlighter className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={insertLink}
            disabled={disabled}
            className={`hover:bg-gray-200 dark:hover:bg-gray-700 ${
              isCommandActive('createLink') ? 'bg-gray-200 dark:bg-gray-700' : ''
            }`}
            title="Inserir link"
          >
            <Link className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={clearFormatting}
            disabled={disabled}
            className="hover:bg-gray-200 dark:hover:bg-gray-700"
            title="Limpar formatação"
          >
            <Type className="w-4 h-4" />
          </Button>
        </div>

        {/* Inserção de conteúdo */}
        <div className="flex items-center gap-1 border-r pr-2 border-gray-300 dark:border-gray-600">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={openFlashcardModal}
            disabled={disabled}
            className="hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400"
            title="Inserir Flashcard"
          >
            <Star className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={openQuestionModal}
            disabled={disabled}
            className="hover:bg-green-100 dark:hover:bg-green-900/30 text-green-600 dark:text-green-400"
            title="Inserir Questão"
          >
            <Brain className="w-4 h-4" />
          </Button>
        </div>
      </div>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable={!disabled}
        className="p-4 bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-police-body focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-inset rich-text-editor"
        style={{ 
          minHeight: `${minHeight}px`, 
          maxHeight: `${maxHeight}px`,
          overflowY: 'auto'
        }}
        onInput={handleContentChange}
        onPaste={handlePaste}
        onKeyDown={handleKeyDown}
        data-placeholder={placeholder}
        suppressContentEditableWarning={true}
      />

      {/* Dialog de Link */}
      {isLinkDialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96">
            <h3 className="font-police-subtitle uppercase tracking-wider text-gray-900 dark:text-white font-semibold mb-4">
              INSERIR LINK
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Texto selecionado: "{selectedText}"
            </p>
            <input
              type="text"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://exemplo.com"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body focus:ring-2 focus:ring-accent-500 mb-4"
              autoFocus
            />
            <div className="flex gap-2">
              <Button
                onClick={confirmLink}
                className="flex-1 bg-accent-500 hover:bg-accent-600 text-black"
              >
                Confirmar
              </Button>
              <Button
                onClick={() => {
                  setIsLinkDialogOpen(false);
                  setLinkUrl('');
                  setSelectedText('');
                }}
                variant="outline"
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Flashcards */}
      {showFlashcardModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Inserir Flashcard</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFlashcardModal(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="mt-3 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar flashcards..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            
            <div className="p-4 max-h-96 overflow-y-auto">
              {loadingContent ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-600 dark:text-gray-400">Carregando flashcards...</span>
                </div>
              ) : (
                <div className="space-y-2">
                  {flashcards
                    .filter(fc => 
                      !searchTerm || 
                      (fc.front && fc.front.toLowerCase().includes(searchTerm.toLowerCase())) ||
                      (fc.back && fc.back.toLowerCase().includes(searchTerm.toLowerCase())) ||
                      (fc.category && fc.category.toLowerCase().includes(searchTerm.toLowerCase()))
                    )
                    .map((flashcard) => (
                      <div
                        key={flashcard.id}
                        className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                        onClick={() => insertFlashcard(flashcard)}
                      >
                        <div className="font-medium text-gray-900 dark:text-white">
                          {flashcard.front || flashcard.question}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {flashcard.back || flashcard.answer}
                        </div>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {flashcard.type || 'basic'}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {flashcard.category || 'Sem categoria'}
                          </Badge>
                        </div>
                      </div>
                    ))
                  }
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Questões */}
      {showQuestionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Inserir Questão</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowQuestionModal(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="mt-3 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar questões..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            
            <div className="p-4 max-h-96 overflow-y-auto">
              {loadingContent ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                  <span className="ml-2 text-gray-600 dark:text-gray-400">Carregando questões...</span>
                </div>
              ) : (
                <div className="space-y-2">
                  {questions
                    .filter(q => 
                      !searchTerm || 
                      (q.question && q.question.toLowerCase().includes(searchTerm.toLowerCase())) ||
                      (q.title && q.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
                      (q.category && q.category.toLowerCase().includes(searchTerm.toLowerCase()))
                    )
                    .map((question) => (
                      <div
                        key={question.id}
                        className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                        onClick={() => insertQuestion(question)}
                      >
                        <div className="font-medium text-gray-900 dark:text-white">
                          {question.question || question.title || question.statement}
                        </div>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {question.type || 'multiple_choice'}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {question.category || 'Sem categoria'}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {question.difficulty || 'medium'}
                          </Badge>
                        </div>
                      </div>
                    ))
                  }
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .rich-text-editor:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
          position: absolute;
        }
        
        .rich-text-editor blockquote {
          border-left: 4px solid #facc15;
          padding-left: 1rem;
          margin: 0.5rem 0;
          color: #6b7280;
        }
        
        .rich-text-editor pre {
          background: #1f2937;
          color: #f3f4f6;
          padding: 0.5rem;
          border-radius: 0.25rem;
          overflow-x: auto;
        }
        
        .rich-text-editor a {
          color: #facc15;
          text-decoration: underline;
        }
        
        .rich-text-editor ul,
        .rich-text-editor ol {
          padding-left: 1.5rem;
          margin: 0.5rem 0;
        }
        
        .embedded-flashcard,
        .embedded-question {
          margin: 1rem 0;
          border-radius: 0.5rem;
          padding: 1rem;
          border: 2px solid;
          user-select: none;
        }
        
        .embedded-flashcard {
          background-color: #eff6ff;
          border-color: #bfdbfe;
        }
        
        .embedded-question {
          background-color: #f0fdf4;
          border-color: #bbf7d0;
        }
        
        @media (prefers-color-scheme: dark) {
          .embedded-flashcard {
            background-color: #1e3a8a20;
            border-color: #1e40af;
          }
          
          .embedded-question {
            background-color: #16537e20;
            border-color: #059669;
          }
        }
      `}</style>
    </div>
  );
}