import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Link2,
  Image,
  Code,
  Quote,
  Brain,
  Star,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo,
  Redo,
  Save,
  Eye,
  EyeOff,
  Upload,
  FileText,
  Highlighter,
  Edit3,
  Minus,
  Plus,
  Hash,
  FileUp,
  Download,
  X,
  Check,
  Palette,
  ChevronDown,
  Shield,
  Target,
  Info,
  Settings,
  BookOpen,
  HelpCircle,
  Maximize2,
  Minimize2,
  Heading1,
  Heading2,
  Heading3
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/utils/cn';
import toast from 'react-hot-toast';

// Mock data for courses/subjects
const materias = [
  { value: 'DIREITO', label: 'DIREITO' },
  { value: 'SEGURANÇA PÚBLICA', label: 'SEGURANÇA PÚBLICA' },
  { value: 'CONHECIMENTOS GERAIS', label: 'CONHECIMENTOS GERAIS' }
];

const submaterias = {
  'DIREITO': [
    { value: 'Direito Constitucional', label: 'DIREITO CONSTITUCIONAL' },
    { value: 'Direito Penal', label: 'DIREITO PENAL' },
    { value: 'Direito Administrativo', label: 'DIREITO ADMINISTRATIVO' },
    { value: 'Direito Processual Penal', label: 'DIREITO PROCESSUAL PENAL' }
  ],
  'SEGURANÇA PÚBLICA': [
    { value: 'Inteligência Policial', label: 'INTELIGÊNCIA POLICIAL' },
    { value: 'Táticas Operacionais', label: 'TÁTICAS OPERACIONAIS' },
    { value: 'Legislação Especial', label: 'LEGISLAÇÃO ESPECIAL' },
    { value: 'Criminologia', label: 'CRIMINOLOGIA' }
  ],
  'CONHECIMENTOS GERAIS': [
    { value: 'Português', label: 'PORTUGUÊS' },
    { value: 'Matemática', label: 'MATEMÁTICA' },
    { value: 'História', label: 'HISTÓRIA' },
    { value: 'Geografia', label: 'GEOGRAFIA' }
  ]
};

// Editor toolbar configuration
const toolbarGroups = [
  {
    name: 'text',
    tools: [
      { icon: Bold, action: 'bold', title: 'Negrito (Ctrl+B)' },
      { icon: Italic, action: 'italic', title: 'Itálico (Ctrl+I)' },
      { icon: Underline, action: 'underline', title: 'Sublinhado (Ctrl+U)' },
      { icon: Highlighter, action: 'highlight', title: 'Destacar', special: true }
    ]
  },
  {
    name: 'headings',
    tools: [
      { icon: Heading1, action: 'h1', title: 'Título 1' },
      { icon: Heading2, action: 'h2', title: 'Título 2' },
      { icon: Heading3, action: 'h3', title: 'Título 3' }
    ]
  },
  {
    name: 'format',
    tools: [
      { icon: List, action: 'list', title: 'Lista' },
      { icon: ListOrdered, action: 'orderedList', title: 'Lista Numerada' },
      { icon: Quote, action: 'quote', title: 'Citação' }
    ]
  },
  {
    name: 'align',
    tools: [
      { icon: AlignLeft, action: 'alignLeft', title: 'Alinhar à Esquerda' },
      { icon: AlignCenter, action: 'alignCenter', title: 'Centralizar' },
      { icon: AlignRight, action: 'alignRight', title: 'Alinhar à Direita' }
    ]
  },
  {
    name: 'insert',
    tools: [
      { icon: Link2, action: 'link', title: 'Inserir Link' },
      { icon: Image, action: 'image', title: 'Inserir Imagem' },
      { icon: Code, action: 'code', title: 'Bloco de Código' }
    ]
  },
  {
    name: 'embed',
    tools: [
      { icon: Brain, action: 'embedQuestion', title: 'Incorporar Questão', special: true },
      { icon: Star, action: 'embedFlashcard', title: 'Incorporar Flashcard', special: true }
    ]
  },
  {
    name: 'history',
    tools: [
      { icon: Undo, action: 'undo', title: 'Desfazer' },
      { icon: Redo, action: 'redo', title: 'Refazer' }
    ]
  }
];

export default function SummaryForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id && id !== 'new');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    materia: '',
    submateria: '',
    topico: '',
    course: '',
    status: 'draft',
    visibility: 'private',
    tags: [] as string[]
  });
  
  const [editorContent, setEditorContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview' | 'settings'>('editor');
  const [showEmbedModal, setShowEmbedModal] = useState(false);
  const [embedType, setEmbedType] = useState<'question' | 'flashcard'>('question');
  const [highlightColor, setHighlightColor] = useState('#facc15');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Temporary inputs
  const [newTag, setNewTag] = useState('');

  // Set initial content for the editor
  useEffect(() => {
    if (editorRef.current && editorContent && !editorRef.current.innerHTML) {
      editorRef.current.innerHTML = editorContent;
    }
  }, []);

  // Handle toolbar actions
  const handleToolbarAction = (action: string) => {
    if (!editorRef.current) return;
    
    const selection = window.getSelection();
    
    switch (action) {
      case 'bold':
        document.execCommand('bold', false);
        break;
      case 'italic':
        document.execCommand('italic', false);
        break;
      case 'underline':
        document.execCommand('underline', false);
        break;
      case 'highlight':
        document.execCommand('backColor', false, highlightColor);
        break;
      case 'h1':
        document.execCommand('formatBlock', false, '<h1>');
        break;
      case 'h2':
        document.execCommand('formatBlock', false, '<h2>');
        break;
      case 'h3':
        document.execCommand('formatBlock', false, '<h3>');
        break;
      case 'list':
        document.execCommand('insertUnorderedList', false);
        break;
      case 'orderedList':
        document.execCommand('insertOrderedList', false);
        break;
      case 'quote':
        document.execCommand('formatBlock', false, '<blockquote>');
        break;
      case 'alignLeft':
        document.execCommand('justifyLeft', false);
        break;
      case 'alignCenter':
        document.execCommand('justifyCenter', false);
        break;
      case 'alignRight':
        document.execCommand('justifyRight', false);
        break;
      case 'link':
        const url = prompt('Digite a URL:');
        if (url) {
          document.execCommand('createLink', false, url);
        }
        break;
      case 'code':
        document.execCommand('formatBlock', false, '<pre>');
        break;
      case 'embedQuestion':
        setEmbedType('question');
        setShowEmbedModal(true);
        break;
      case 'embedFlashcard':
        setEmbedType('flashcard');
        setShowEmbedModal(true);
        break;
      case 'undo':
        document.execCommand('undo', false);
        break;
      case 'redo':
        document.execCommand('redo', false);
        break;
    }
    
    // Update content
    if (editorRef.current) {
      setEditorContent(editorRef.current.innerHTML);
    }
  };

  // Handle file import
  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const allowedTypes = [
      'text/plain',
      'text/html',
      'text/markdown',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/pdf'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      toast.error('Formato de arquivo não suportado');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      
      // Process different file types
      let htmlContent = '';
      if (file.type === 'text/html') {
        htmlContent = content;
      } else if (file.type === 'text/plain' || file.type === 'text/markdown') {
        // Convert plain text to HTML
        htmlContent = content
          .split('\n\n')
          .map(paragraph => `<p>${paragraph}</p>`)
          .join('');
      } else {
        toast.error('Processamento para este tipo de arquivo ainda não implementado');
        return;
      }
      
      // Update both state and editor
      setEditorContent(htmlContent);
      if (editorRef.current) {
        editorRef.current.innerHTML = htmlContent;
      }
    };
    
    reader.readAsText(file);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle form input changes
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle tags
  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      handleInputChange('tags', [...formData.tags, newTag.trim().toUpperCase()]);
      setNewTag('');
    }
  };

  const removeTag = (index: number) => {
    handleInputChange('tags', formData.tags.filter((_, i) => i !== index));
  };

  // Save summary
  const handleSave = async () => {
    if (!formData.title || !formData.materia || !formData.submateria) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }
    
    if (!editorContent || editorContent.trim() === '') {
      toast.error('O conteúdo do resumo não pode estar vazio');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success(isEditing ? 'Resumo atualizado com sucesso!' : 'Resumo criado com sucesso!');
      navigate('/admin/summaries');
      
    } catch (error) {
      toast.error('Erro ao salvar resumo');
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: 'editor', label: 'EDITOR', icon: Edit3 },
    { id: 'preview', label: 'PRÉ-VISUALIZAÇÃO', icon: Eye },
    { id: 'settings', label: 'CONFIGURAÇÕES', icon: Settings }
  ];

  // Handle fullscreen
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className={cn(
      "p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen",
      isFullscreen && "fixed inset-0 z-50 overflow-auto"
    )}>
      {/* Background Pattern */}
      <div 
        className="fixed inset-0 opacity-5 dark:opacity-10 pointer-events-none z-0"
        style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 35px,
            rgba(250, 204, 21, 0.05) 35px,
            rgba(250, 204, 21, 0.05) 70px
          )`
        }}
      />
      
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => navigate('/admin/summaries')}
              className="gap-2 font-police-body"
            >
              <ArrowLeft className="w-4 h-4" />
              VOLTAR
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-police-title uppercase tracking-ultra-wide">
                {isEditing ? 'EDITAR BRIEFING' : 'NOVO BRIEFING TÁTICO'}
              </h1>
              <p className="text-gray-600 dark:text-gray-300 font-police-body tracking-wider">
                {isEditing ? 'Modificar resumo operacional existente' : 'Criar novo resumo interativo para estudo'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={toggleFullscreen}
              className="gap-2 font-police-body"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              {isFullscreen ? 'SAIR TELA CHEIA' : 'TELA CHEIA'}
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              className="gap-2 font-police-body"
            >
              {isPreviewMode ? <Edit3 className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {isPreviewMode ? 'EDITAR' : 'VISUALIZAR'}
            </Button>
            <Button
              onClick={handleSave}
              disabled={isLoading}
              className="gap-2 font-police-body font-semibold bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black px-8"
            >
              <Save className="w-4 h-4" />
              {isLoading ? 'SALVANDO...' : (isEditing ? 'ATUALIZAR' : 'CRIAR')}
            </Button>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-200 dark:bg-gray-800 p-1 rounded-lg">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md font-police-subtitle font-semibold text-sm uppercase tracking-wider transition-all duration-200',
                  activeTab === tab.id
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="relative z-10"
      >
        {activeTab === 'editor' && (
          <div className="space-y-6">
            {/* Editor Toolbar */}
            <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex flex-wrap items-center gap-4">
                  {toolbarGroups.map((group, groupIndex) => (
                    <div key={group.name} className="flex items-center gap-1">
                      {group.tools.map((tool, index) => (
                        <Button
                          key={index}
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToolbarAction(tool.action)}
                          className={cn(
                            'p-2 font-police-body',
                            tool.special && 'bg-accent-500/20 text-accent-700 dark:text-accent-300 hover:bg-accent-500/30'
                          )}
                          title={tool.title}
                        >
                          <tool.icon className="w-4 h-4" />
                        </Button>
                      ))}
                      {groupIndex < toolbarGroups.length - 1 && (
                        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-2" />
                      )}
                    </div>
                  ))}
                  
                  {/* Quick format selector and color picker */}
                  <div className="flex items-center gap-4 ml-auto">
                    <select
                      onChange={(e) => {
                        if (e.target.value === 'paragraph') {
                          document.execCommand('formatBlock', false, '<p>');
                        } else if (e.target.value) {
                          handleToolbarAction(e.target.value);
                        }
                        e.target.value = '';
                      }}
                      className="px-3 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-police-body uppercase tracking-wider"
                      value=""
                    >
                      <option value="">FORMATO RÁPIDO</option>
                      <option value="h1">TÍTULO 1</option>
                      <option value="h2">TÍTULO 2</option>
                      <option value="h3">TÍTULO 3</option>
                      <option value="paragraph">PARÁGRAFO</option>
                      <option value="quote">CITAÇÃO</option>
                    </select>
                    
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-police-body uppercase text-gray-600 dark:text-gray-400">
                        DESTAQUE:
                      </label>
                      <input
                        type="color"
                        value={highlightColor}
                        onChange={(e) => setHighlightColor(e.target.value)}
                        className="w-8 h-8 rounded cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
                
                {/* File import */}
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center gap-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".txt,.html,.md,.doc,.docx,.pdf"
                    onChange={handleFileImport}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="gap-2 font-police-body"
                  >
                    <FileUp className="w-4 h-4" />
                    IMPORTAR ARQUIVO
                  </Button>
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-police-body">
                    Suporta: TXT, HTML, MD, DOC, DOCX, PDF
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Main Editor */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
                  <CardContent className="p-4">
                    <input
                      type="text"
                      placeholder="TÍTULO DO BRIEFING"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      className="w-full mb-6 px-4 py-3 text-2xl font-bold border-0 border-b-2 border-gray-200 dark:border-gray-700 bg-transparent text-gray-900 dark:text-white font-police-title uppercase tracking-wider focus:outline-none focus:border-accent-500 placeholder:text-gray-400"
                    />
                    
                    <div
                      ref={editorRef}
                      contentEditable={!isPreviewMode}
                      className={cn(
                        'min-h-[600px] p-6 border-2 rounded-lg',
                        'bg-white dark:bg-gray-900 text-gray-900 dark:text-white',
                        'prose prose-lg dark:prose-invert max-w-none',
                        'focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent',
                        isPreviewMode ? 'border-gray-200 dark:border-gray-700' : 'border-gray-300 dark:border-gray-600',
                        '[&:empty]:before:content-["Comece_a_escrever_seu_resumo_aqui..."] [&:empty]:before:text-gray-400'
                      )}
                      style={{ direction: 'ltr', textAlign: 'left' }}
                      onInput={(e) => {
                        const content = e.currentTarget.innerHTML;
                        setEditorContent(content);
                      }}
                      suppressContentEditableWarning={true}
                    >
                      {/* Initial content will be set via useEffect */}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-4">
                {/* Course/Subject Selection */}
                <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="font-police-title uppercase tracking-wider text-base">
                      CLASSIFICAÇÃO DO BRIEFING
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-police-body uppercase tracking-wider">
                        MATÉRIA *
                      </label>
                      <select
                        value={formData.materia}
                        onChange={(e) => {
                          handleInputChange('materia', e.target.value);
                          handleInputChange('submateria', '');
                        }}
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-police-body"
                      >
                        <option value="">Selecione uma matéria</option>
                        {materias.map(materia => (
                          <option key={materia.value} value={materia.value}>{materia.label}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-police-body uppercase tracking-wider">
                        SUBMATÉRIA *
                      </label>
                      <select
                        value={formData.submateria}
                        onChange={(e) => handleInputChange('submateria', e.target.value)}
                        disabled={!formData.materia}
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-police-body disabled:opacity-50"
                      >
                        <option value="">Selecione uma submatéria</option>
                        {formData.materia && submaterias[formData.materia as keyof typeof submaterias]?.map(sub => (
                          <option key={sub.value} value={sub.value}>{sub.label}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-police-body uppercase tracking-wider">
                        TÓPICO
                      </label>
                      <input
                        type="text"
                        value={formData.topico}
                        onChange={(e) => handleInputChange('topico', e.target.value)}
                        placeholder="Ex: Princípios Fundamentais"
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-police-body"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-police-body uppercase tracking-wider">
                        CURSO RELACIONADO
                      </label>
                      <select
                        value={formData.course}
                        onChange={(e) => handleInputChange('course', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-police-body"
                      >
                        <option value="">Selecione um curso</option>
                        <option value="pf-agente">POLÍCIA FEDERAL - AGENTE</option>
                        <option value="pf-delegado">POLÍCIA FEDERAL - DELEGADO</option>
                        <option value="prf">POLÍCIA RODOVIÁRIA FEDERAL</option>
                        <option value="pc-delegado">POLÍCIA CIVIL - DELEGADO</option>
                      </select>
                    </div>
                  </CardContent>
                </Card>

                {/* Embedded Elements */}
                <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="font-police-title uppercase tracking-wider text-base">
                      ELEMENTOS INCORPORADOS
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Brain className="w-4 h-4 text-purple-600" />
                        <span className="text-sm font-police-body">QUESTÕES</span>
                      </div>
                      <span className="text-sm font-bold font-police-numbers">0</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-600" />
                        <span className="text-sm font-police-body">FLASHCARDS</span>
                      </div>
                      <span className="text-sm font-bold font-police-numbers">0</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Link2 className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-police-body">LINKS</span>
                      </div>
                      <span className="text-sm font-bold font-police-numbers">0</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'preview' && (
          <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
            <CardContent className="p-8">
              <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 font-police-title uppercase tracking-wider">
                  {formData.title || 'TÍTULO DO BRIEFING'}
                </h1>
                
                <div className="flex items-center gap-4 mb-6 text-sm text-gray-600 dark:text-gray-400">
                  {formData.materia && (
                    <Badge className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                      {formData.materia}
                    </Badge>
                  )}
                  {formData.submateria && (
                    <Badge className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                      {formData.submateria}
                    </Badge>
                  )}
                  {formData.topico && (
                    <Badge className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                      {formData.topico}
                    </Badge>
                  )}
                </div>
                
                <div 
                  className="prose prose-lg dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: editorContent || '<p class="text-gray-500">O conteúdo do resumo aparecerá aqui...</p>' }}
                />
              </div>
            </CardContent>
          </Card>
        )}
        
        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="font-police-title uppercase tracking-wider">CONFIGURAÇÕES DE PUBLICAÇÃO</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-police-body uppercase tracking-wider">
                    STATUS
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-police-body"
                  >
                    <option value="draft">EM PREPARAÇÃO</option>
                    <option value="review">EM REVISÃO</option>
                    <option value="published">OPERACIONAL</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-police-body uppercase tracking-wider">
                    VISIBILIDADE
                  </label>
                  <select
                    value={formData.visibility}
                    onChange={(e) => handleInputChange('visibility', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-police-body"
                  >
                    <option value="private">PRIVADO</option>
                    <option value="restricted">RESTRITO AO CURSO</option>
                    <option value="public">PÚBLICO</option>
                  </select>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="font-police-title uppercase tracking-wider">TAGS</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2 mb-4">
                  {formData.tags.map((tag, index) => (
                    <Badge 
                      key={index} 
                      className="bg-accent-500/20 text-accent-700 dark:text-accent-300 border border-accent-500/30 font-police-body"
                    >
                      {tag}
                      <button
                        onClick={() => removeTag(index)}
                        className="ml-2 text-accent-600 hover:text-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-police-body focus:outline-none focus:ring-2 focus:ring-accent-500"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Digite uma tag..."
                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                  />
                  <Button size="sm" onClick={addTag} className="bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </motion.div>
    </div>
  );
}