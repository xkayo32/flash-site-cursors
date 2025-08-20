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
  Redo2
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
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
      `}</style>
    </div>
  );
}